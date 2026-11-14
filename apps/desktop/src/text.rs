//! Text with CSS `letter-spacing`, which GPUI's own text elements lack.
//!
//! The line is shaped once (keeping kerning and ligatures), then every glyph
//! is pushed right by the spacing times the number of characters before it,
//! exactly like Chrome. It wraps at spaces, clamps to `max_lines` and ends a
//! clipped line with an ellipsis.

use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Arc;

use gpui::{
    App, AvailableSpace, Bounds, Element, ElementId, Font, FontId, FontWeight, GlobalElementId, GlyphId, Hsla,
    InspectorElementId, IntoElement, LayoutId, LineLayout, Pixels, SharedString, Size, Style, TextRun, Window, font,
    point, px, size,
};

#[derive(Clone)]
pub struct Spaced {
    text: SharedString,
    font: Font,
    size: Pixels,
    line_height: Pixels,
    color: Hsla,
    spacing: Pixels,
    max_lines: usize,
    wrap: bool,
    min_width: Option<Pixels>,
    shrink: f32,
}

pub fn spaced(text: impl Into<SharedString>, family: &'static str, size: f32, weight: f32) -> Spaced {
    let mut f = font(family);
    f.weight = FontWeight(weight);
    Spaced {
        text: text.into(),
        font: f,
        size: px(size),
        line_height: px(size * 1.5),
        color: gpui::white(),
        spacing: px(0.0),
        max_lines: 1,
        wrap: false,
        min_width: None,
        shrink: 1.0,
    }
}

impl Spaced {
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = color.into();
        self
    }

    pub fn line_height(mut self, lh: f32) -> Self {
        self.line_height = px(lh);
        self
    }

    pub fn spacing(mut self, ls: f32) -> Self {
        self.spacing = px(ls);
        self
    }

    /// Wraps at spaces, up to `lines` lines.
    pub fn wrap(mut self, lines: usize) -> Self {
        self.wrap = true;
        self.max_lines = lines.max(1);
        self
    }

    pub fn uppercase(mut self) -> Self {
        self.text = self.text.to_uppercase().into();
        self
    }

    /// Lets flex layout shrink the text down to `w` (it then truncates).
    pub fn min_w(mut self, w: f32) -> Self {
        self.min_width = Some(px(w));
        self
    }

    /// `flex-shrink`, once `min_w` allows shrinking.
    pub fn shrink(mut self, factor: f32) -> Self {
        self.shrink = factor;
        self
    }
}

#[derive(Clone, Copy)]
struct Glyph {
    font_id: FontId,
    id: GlyphId,
    x: Pixels,
    index: usize,
    is_emoji: bool,
}

struct Shaped {
    layout: Arc<LineLayout>,
    glyphs: Vec<Glyph>,
    /// Ranges into `glyphs`, one per line.
    lines: Vec<(usize, usize)>,
    width: Pixels,
}

impl Spaced {
    fn run(&self, len: usize) -> TextRun {
        TextRun {
            len,
            font: self.font.clone(),
            color: self.color,
            background_color: None,
            underline: None,
            strikethrough: None,
        }
    }

    fn glyphs(&self, layout: &LineLayout) -> Vec<Glyph> {
        let mut glyphs = Vec::new();
        for run in &layout.runs {
            for g in &run.glyphs {
                glyphs.push(Glyph {
                    font_id: run.font_id,
                    id: g.id,
                    x: g.position.x,
                    index: g.index,
                    is_emoji: g.is_emoji,
                });
            }
        }
        glyphs.sort_by_key(|g| g.index);
        // Spacing goes after every character, so glyph k moves by k spacings.
        let mut chars_before = 0usize;
        let mut last_index = usize::MAX;
        for g in &mut glyphs {
            if g.index != last_index {
                if last_index != usize::MAX {
                    chars_before += self.text[last_index..g.index].chars().count().max(1);
                }
                last_index = g.index;
            }
            g.x += self.spacing * chars_before as f32;
        }
        glyphs
    }

    fn total_width(&self, layout: &LineLayout) -> Pixels {
        layout.width + self.spacing * self.text.chars().count() as f32
    }

    fn end_x(&self, shaped_glyphs: &[Glyph], layout: &LineLayout, end: usize) -> Pixels {
        if end < shaped_glyphs.len() {
            shaped_glyphs[end].x
        } else {
            self.total_width(layout)
        }
    }

    fn shape(&self, window: &mut Window, max_width: Option<Pixels>) -> Shaped {
        let layout = window
            .text_system()
            .layout_line(&self.text, self.size, &[self.run(self.text.len())], None);
        let glyphs = self.glyphs(&layout);
        let full = self.total_width(&layout);
        let mut lines = Vec::new();
        match (self.wrap, max_width) {
            (true, Some(max)) if full > max => {
                let is_space = |g: &Glyph| self.text[g.index..].starts_with(' ');
                let mut start = 0;
                let mut last_break: Option<usize> = None;
                let mut i = 0;
                while i < glyphs.len() {
                    if is_space(&glyphs[i]) {
                        last_break = Some(i);
                    }
                    let line_x0 = glyphs[start].x;
                    let right = self.end_x(&glyphs, &layout, i + 1) - line_x0;
                    if right > max
                        && i > start
                        && let Some(b) = last_break.filter(|&b| b > start)
                    {
                        lines.push((start, b));
                        start = b + 1;
                        i = start;
                        last_break = None;
                        continue;
                    }
                    i += 1;
                }
                lines.push((start, glyphs.len()));
            }
            _ => lines.push((0, glyphs.len())),
        }
        let width = lines
            .iter()
            .map(|&(s, e)| {
                if s >= glyphs.len() {
                    return px(0.0);
                }
                // Trailing spacing after the last character still counts.
                self.end_x(&glyphs, &layout, e) - glyphs[s].x
            })
            .fold(px(0.0), |a, b| a.max(b));
        Shaped {
            layout,
            glyphs,
            lines,
            width,
        }
    }
}

pub struct SpacedState {
    shaped: Rc<RefCell<Option<Shaped>>>,
}

impl IntoElement for Spaced {
    type Element = Self;

    fn into_element(self) -> Self::Element {
        self
    }
}

impl Element for Spaced {
    type RequestLayoutState = SpacedState;
    type PrepaintState = ();

    fn id(&self) -> Option<ElementId> {
        None
    }

    fn source_location(&self) -> Option<&'static core::panic::Location<'static>> {
        None
    }

    fn request_layout(
        &mut self,
        _id: Option<&GlobalElementId>,
        _inspector_id: Option<&InspectorElementId>,
        window: &mut Window,
        _cx: &mut App,
    ) -> (LayoutId, Self::RequestLayoutState) {
        let shaped: Rc<RefCell<Option<Shaped>>> = Rc::default();
        let this = self.clone();
        let cell = shaped.clone();
        let mut style = Style::default();
        if let Some(min) = self.min_width {
            style.min_size.width = min.into();
            style.flex_shrink = self.shrink;
        } else {
            style.flex_shrink = 0.0;
        }
        let layout_id = window.request_measured_layout(style, move |known, available, window, _cx| {
            let max = known.width.or(match available.width {
                AvailableSpace::Definite(w) => Some(w),
                _ => None,
            });
            let s = this.shape(window, max);
            let lines = s.lines.len().min(this.max_lines);
            let width = if this.wrap {
                s.width.min(max.unwrap_or(s.width))
            } else {
                s.width
            };
            let result: Size<Pixels> = size(width, this.line_height * lines as f32);
            *cell.borrow_mut() = Some(s);
            result
        });
        (layout_id, SpacedState { shaped })
    }

    fn prepaint(
        &mut self,
        _id: Option<&GlobalElementId>,
        _inspector_id: Option<&InspectorElementId>,
        _bounds: Bounds<Pixels>,
        _state: &mut Self::RequestLayoutState,
        _window: &mut Window,
        _cx: &mut App,
    ) {
    }

    fn paint(
        &mut self,
        _id: Option<&GlobalElementId>,
        _inspector_id: Option<&InspectorElementId>,
        bounds: Bounds<Pixels>,
        state: &mut Self::RequestLayoutState,
        _prepaint: &mut (),
        window: &mut Window,
        _cx: &mut App,
    ) {
        // Re-shape when layout narrowed us after measuring (flex shrink).
        let needs_reshape = state
            .shaped
            .borrow()
            .as_ref()
            .is_none_or(|s| self.wrap && s.width > bounds.size.width + px(0.5));
        if needs_reshape {
            *state.shaped.borrow_mut() = Some(self.shape(window, Some(bounds.size.width)));
        }
        let shaped = state.shaped.borrow();
        let Some(shaped) = shaped.as_ref() else {
            return;
        };
        let layout = &shaped.layout;
        let padding_top = (self.line_height - layout.ascent - layout.descent) / 2.0;
        let baseline = padding_top + layout.ascent;
        let visible = shaped.lines.len().min(self.max_lines);
        let clipped_lines = shaped.lines.len() > self.max_lines;
        let ellipsis = window
            .text_system()
            .layout_line("…", self.size, &[self.run("…".len())], None);
        let ellipsis_w = ellipsis.width + self.spacing;
        if bounds.size.width < ellipsis_w {
            // Squeezed below even an ellipsis: Chrome shows nothing legible.
            return;
        }

        for (row, &(start, end)) in shaped.lines.iter().take(visible).enumerate() {
            if start >= shaped.glyphs.len() {
                continue;
            }
            let line_x0 = shaped.glyphs[start].x;
            let last_row = row + 1 == visible;
            // A clamped paragraph keeps its last line's natural break and
            // appends the ellipsis there, as `-webkit-line-clamp` does.
            let line_w = self.end_x(&shaped.glyphs, layout, end) - line_x0;
            let overflow = line_w > bounds.size.width + px(0.5);
            let truncate = last_row && (overflow || clipped_lines);
            let limit = if truncate {
                bounds.size.width - ellipsis_w
            } else {
                px(f32::MAX)
            };
            let y = bounds.origin.y + self.line_height * row as f32 + baseline;
            let mut cut_x = None;
            for (k, g) in shaped.glyphs[start..end].iter().enumerate() {
                let x = g.x - line_x0;
                let next = self.end_x(&shaped.glyphs, layout, start + k + 1) - line_x0;
                if truncate && next > limit {
                    cut_x = Some(x);
                    break;
                }
                let origin = point(bounds.origin.x + x, y);
                if g.is_emoji {
                    let _ = window.paint_emoji(origin - point(px(0.0), layout.ascent), g.font_id, g.id, self.size);
                } else {
                    let _ = window.paint_glyph(origin, g.font_id, g.id, self.size, self.color);
                }
            }
            if truncate {
                let x = cut_x.unwrap_or(line_w).min(bounds.size.width - ellipsis_w);
                // Drop the trailing space before the ellipsis, like Chrome.
                for run in &ellipsis.runs {
                    for g in &run.glyphs {
                        let origin = point(bounds.origin.x + x.max(px(0.0)) + g.position.x, y);
                        let _ = window.paint_glyph(origin, run.font_id, g.id, self.size, self.color);
                    }
                }
            }
        }
    }
}
