//! "Latest updates": the layout switcher with its spring indicator and
//! tooltip, and the chapters as a list, a grid or compact rows.

use std::time::{Duration, Instant};

use gpui::{
    AnyElement, Bounds, Context, Entity, FontWeight, Hsla, IntoElement, ParentElement, Pixels, Render, SharedString,
    Styled, Window, canvas, div, point, prelude::*, px,
};

use crate::anim::{self, Easing, Tween};
use crate::api::{self, LatestChapter, Layout, Session};
use crate::home::{Load, SIDEBAR};
use crate::images::{Images, Variant, cover};
use crate::paint::{self};
use crate::skeleton;
use crate::text::spaced;
use crate::theme::{alpha, colors, mix, rgb};
use crate::ui::{self, HasHovers, Hovers, hover_listener, icon, lerp, picture};

pub const PER_PAGE: usize = 12;
const LAYOUTS: [(Layout, &str, &str); 3] = [
    (Layout::List, "layout-list", "List"),
    (Layout::Grid, "layout-grid", "Grid"),
    (Layout::Compact, "layout-rows", "Compact"),
];

struct Tooltip {
    target: Option<usize>,
    hover_since: Option<(usize, Instant)>,
    opacity: Tween,
    x: Tween,
    label: &'static str,
}

pub struct LatestView {
    session: Session,
    hovers: Hovers,
    latest: Load<Vec<LatestChapter>>,
    layout: Layout,
    indicator: Tween,
    tooltip: Tooltip,
    images: Entity<Images>,
    width: f32,
}

impl HasHovers for LatestView {
    fn hovers(&mut self) -> &mut Hovers {
        &mut self.hovers
    }
}

impl LatestView {
    pub fn new(session: Session, images: Entity<Images>, width: f32, cx: &mut Context<Self>) -> Self {
        cx.observe(&images, |_, _, cx| cx.notify()).detach();
        let layout = session.layout();
        let index = LAYOUTS.iter().position(|(l, ..)| *l == layout).unwrap_or(0);
        let mut indicator = Tween::new(0.0, Duration::from_millis(550), Easing::Spring);
        indicator.jump(index as f32 * 36.0);
        let request = session.clone();
        let task = cx
            .background_executor()
            .spawn(async move { api::latest(&request, PER_PAGE) });
        cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.latest = match result {
                    Ok(chapters) => Load::Ready(chapters),
                    Err(_) => Load::Failed,
                };
                cx.notify();
            })
            .ok();
        })
        .detach();
        Self {
            session,
            hovers: Hovers::default(),
            latest: Load::Loading,
            layout,
            indicator,
            tooltip: Tooltip {
                target: None,
                hover_since: None,
                opacity: Tween::new(0.0, Duration::from_millis(180), Easing::Bezier(anim::EASE_OUT)),
                x: Tween::new(0.0, Duration::from_millis(180), Easing::Bezier(anim::EASE_OUT)),
                label: "",
            },
            images,
            width,
        }
    }

    pub fn set_width(&mut self, width: f32, cx: &mut Context<Self>) {
        if (self.width - width).abs() > 0.01 {
            self.width = width;
            cx.notify();
        }
    }

    fn want_image(&mut self, url: &str, variant: Variant, cx: &mut Context<Self>) {
        self.images.update(cx, |images, cx| images.want(url, variant, cx));
    }

    pub fn set_layout(&mut self, layout: Layout, cx: &mut Context<Self>) {
        if self.layout == layout {
            return;
        }
        self.layout = layout;
        let index = LAYOUTS.iter().position(|(l, ..)| *l == layout).unwrap_or(0);
        self.indicator.set(index as f32 * 36.0);
        let session = self.session.clone();
        cx.background_executor()
            .spawn(async move {
                let _ = api::save_layout(&session, layout);
            })
            .detach();
        cx.notify();
    }

    pub fn show_tooltip(&mut self, index: usize, cx: &mut Context<Self>) {
        self.tooltip.hover_since = Some((index, Instant::now()));
        cx.notify();
    }

    /// The section's height: cached views are laid out at a known size.
    pub fn height(&self, window: &mut Window) -> f32 {
        let count = match &self.latest {
            Load::Ready(chapters) => chapters.len(),
            Load::Loading => PER_PAGE,
            Load::Failed => 0,
        };
        let content = match self.layout {
            Layout::List => count as f32 * 54.5 + count.saturating_sub(1) as f32 * 10.0,
            Layout::Compact => count as f32 * 42.0 + 2.0 + count.saturating_sub(1) as f32,
            Layout::Grid => {
                let columns = grid_columns(self.width);
                let card_w = (self.width - 64.0 - 16.0 * (columns as f32 - 1.0)) / columns as f32;
                let rows: Vec<f32> = match &self.latest {
                    Load::Ready(chapters) => chapters
                        .chunks(columns)
                        .map(|row| {
                            let lines = row
                                .iter()
                                .map(|c| title_lines(window, c.media_title.as_deref().unwrap_or("Untitled"), card_w))
                                .max()
                                .unwrap_or(1);
                            card_w * 1.5 + 10.0 + 18.9 * lines as f32 + 4.0 + 19.5
                        })
                        .collect(),
                    _ => (0..count.div_ceil(columns))
                        .map(|_| card_w * 1.5 + 10.0 + 14.0 + 4.0 + 12.0)
                        .collect(),
                };
                rows.iter().sum::<f32>() + rows.len().saturating_sub(1) as f32 * 24.0
            }
        };
        32.0 + 45.0 + 20.0 + content + 32.0
    }

    fn tick(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        let mut animating = false;
        // Tooltip: shown after 300ms over a tab, then follows between tabs.
        if let Some((index, since)) = self.tooltip.hover_since {
            if since.elapsed() >= Duration::from_millis(300) || self.tooltip.opacity.target() > 0.5 {
                let x = index as f32 * 36.0;
                if self.tooltip.opacity.target() < 0.5 {
                    self.tooltip.x.jump(x);
                } else {
                    self.tooltip.x.set(x);
                }
                self.tooltip.target = Some(index);
                self.tooltip.label = LAYOUTS[index].2;
                self.tooltip.opacity.set(1.0);
            } else {
                animating = true;
            }
        }
        animating |= self.hovers.animating()
            || self.indicator.is_animating()
            || self.tooltip.opacity.is_animating()
            || self.tooltip.x.is_animating()
            || self.images.read(cx).fading()
            || matches!(self.latest, Load::Loading);
        if animating {
            window.request_animation_frame();
        }
    }

    fn render_tabs(&mut self, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let active = LAYOUTS.iter().position(|(l, ..)| *l == self.layout).unwrap_or(0);
        let indicator_x = self.indicator.value();
        let tabs: Vec<_> = LAYOUTS
            .iter()
            .enumerate()
            .map(|(i, &(layout, icon_name, _))| {
                let key = SharedString::from(format!("tab-{icon_name}"));
                let hovered = self.hovers.instant(key.clone());
                let color = if i == active {
                    Hsla::from(colors::FOREGROUND)
                } else if hovered {
                    colors::MUTED_FOREGROUND.into()
                } else {
                    alpha(colors::MUTED_FOREGROUND, 0.72)
                };
                div()
                    .id(key.clone())
                    .w(px(34.))
                    .h(px(32.))
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .on_hover(cx.listener(move |this, h: &bool, _, cx| {
                        this.hovers.set(key.clone(), *h);
                        if *h {
                            this.tooltip.hover_since = Some((i, Instant::now()));
                        } else if this.tooltip.hover_since.map(|(j, _)| j) == Some(i) {
                            this.tooltip.hover_since = None;
                            this.tooltip.opacity.set(0.0);
                        }
                        cx.notify();
                    }))
                    .on_click(cx.listener(move |this, _, _, cx| this.set_layout(layout, cx)))
                    .child(icon(icon_name, 16.0, color))
            })
            .collect();

        div()
            .relative()
            .p(px(4.))
            .flex()
            .gap(px(2.))
            .child(
                // The well: `colors.well` with `shadows.sunken`.
                canvas(
                    |_, _, _| {},
                    |b: Bounds<Pixels>, _, window: &mut Window, _| {
                        let pill = paint::rounded_rect(b, f32::from(b.size.height) / 2.0);
                        paint::fill_poly(window, &pill, colors::WELL);
                        let (x, y) = (f32::from(b.origin.x), f32::from(b.origin.y));
                        let (w, h) = (f32::from(b.size.width), f32::from(b.size.height));
                        paint::paint_gradient(
                            window,
                            &pill,
                            paint::Field::css(180.0, x, y, w, h),
                            &[(0.0, crate::theme::rgba(0, 0.3)), (4.0 / h, crate::theme::rgba(0, 0.0))],
                        );
                    },
                )
                .absolute()
                .top_0()
                .left_0()
                .size_full(),
            )
            .child(
                div()
                    .absolute()
                    .top(px(4.))
                    .left(px(4.0 + indicator_x))
                    .w(px(34.))
                    .h(px(32.))
                    .rounded_full()
                    .bg(colors::white(0.1))
                    .shadow(vec![
                        ui::shadow(0.0, 1.0, 2.0, 0.0, colors::black(0.32)),
                        ui::shadow(0.0, 16.0, 40.0, -16.0, colors::black(0.48)),
                    ]),
            )
            .children(tabs)
    }

    fn render_tooltip(&self) -> Option<AnyElement> {
        let opacity = self.tooltip.opacity.value();
        if opacity <= 0.0 {
            return None;
        }
        let scale = lerp(0.96, 1.0, opacity);
        let x = self.tooltip.x.value();
        Some(
            div()
                .absolute()
                // Above the tab: the popup, 4px + the arrow's 6px away.
                .bottom(px(50.))
                .left(px(4.0 + x + 17.0 - 30.0))
                .w(px(60.))
                .flex()
                .flex_col()
                .items_center()
                .opacity(opacity)
                .child(
                    div()
                        .px(px(8.))
                        .py(px(4.))
                        .min_w(px(44.))
                        .rounded(px(11.2))
                        .border_1()
                        .border_color(colors::white(0.08))
                        .bg(rgb(0x202020))
                        .shadow(vec![
                            ui::shadow(0.0, 4.0, 12.0, 0.0, colors::black(0.4)),
                            ui::shadow(0.0, 32.0, 64.0, -16.0, colors::black(0.56)),
                        ])
                        .text_size(px(12. * scale))
                        .line_height(px(16.))
                        .text_color(colors::FOREGROUND)
                        .flex()
                        .justify_center()
                        .child(self.tooltip.label),
                )
                .child(
                    canvas(
                        |_, _, _| {},
                        |b: Bounds<Pixels>, _, window: &mut Window, _| {
                            let (x, y) = (f32::from(b.origin.x), f32::from(b.origin.y));
                            let w = f32::from(b.size.width);
                            paint::fill_poly(
                                window,
                                &[(x, y - 1.0), (x + w, y - 1.0), (x + w / 2.0, y + 6.0)],
                                rgb(0x202020),
                            );
                        },
                    )
                    .w(px(12.))
                    .h(px(6.)),
                )
                .into_any_element(),
        )
    }

    fn render_latest(&mut self, width: f32, viewport_h: f32, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let see_all = self.hovers.instant("see-all") as u8 as f32;
        let tabs = self.render_tabs(cx);
        let tooltip = self.render_tooltip();
        let content = match &self.latest {
            Load::Loading => self.latest_skeleton(width),
            Load::Failed => div().into_any_element(),
            Load::Ready(chapters) => {
                let chapters = chapters.clone();
                match self.layout {
                    Layout::List => self.latest_list(&chapters, cx),
                    Layout::Grid => self.latest_grid(&chapters, width, cx),
                    Layout::Compact => self.latest_compact(&chapters, cx),
                }
            }
        };
        let _ = viewport_h;

        div().px(px(32.)).py(px(32.)).flex().flex_col().gap(px(48.)).child(
            div()
                .flex()
                .flex_col()
                .gap(px(20.))
                .child(
                    div()
                        .flex()
                        .items_center()
                        .justify_between()
                        .h(px(45.))
                        .child(
                            div()
                                .flex()
                                .items_center()
                                .gap(px(12.))
                                .child(div().w(px(20.)).h(px(3.)).rounded_full().bg(colors::PRIMARY))
                                .child(
                                    spaced("Latest updates", "PT Serif", 30.0, 700.0)
                                        .line_height(45.0)
                                        .spacing(-0.6)
                                        .color(colors::FOREGROUND),
                                ),
                        )
                        .child(
                            div()
                                .relative()
                                .flex()
                                .items_center()
                                .gap(px(8.))
                                .child(tabs)
                                .children(tooltip)
                                .child(
                                    div()
                                        .id("see-all")
                                        .h(px(28.))
                                        .px(px(11.))
                                        .border_1()
                                        .border_color(gpui::transparent_black())
                                        .mr(px(-12.))
                                        .rounded_full()
                                        .flex()
                                        .items_center()
                                        .gap(px(6.))
                                        .cursor_pointer()
                                        .bg(ui::ghost_bg(see_all))
                                        .text_size(px(14.))
                                        .line_height(px(14.))
                                        .font_weight(FontWeight(500.))
                                        .text_color(colors::MUTED_FOREGROUND)
                                        .on_hover(hover_listener("see-all", cx))
                                        .child(
                                            spaced("See all", "Inter", 14.0, 500.0)
                                                .line_height(14.0)
                                                .color(colors::MUTED_FOREGROUND),
                                        )
                                        .child(div().opacity(0.8).child(icon(
                                            "arrow-right",
                                            16.0,
                                            colors::MUTED_FOREGROUND,
                                        ))),
                                ),
                        ),
                )
                .child(content),
        )
    }

    fn title_link(&mut self, chapter: &LatestChapter, size_px: f32, cx: &mut Context<Self>) -> AnyElement {
        let key = SharedString::from(format!("mtitle-{}", chapter.id));
        let hover = self.hovers.get(key.clone(), 200, Easing::Bezier(anim::EASE_OUT));
        let color = ui::lerp_color(
            colors::FOREGROUND,
            mix(colors::FOREGROUND, colors::BACKGROUND, 0.25),
            hover,
        );
        let el = div()
            .id(key.clone())
            .flex()
            .min_w(px(48.))
            .flex_shrink()
            .overflow_hidden()
            .cursor_pointer()
            .on_hover(hover_listener(key, cx));
        match &chapter.media_title {
            Some(title) => el
                .child(
                    spaced(title.clone(), "Inter", size_px, 700.0)
                        .line_height(size_px * 1.5)
                        .spacing(-0.01 * size_px)
                        .min_w(48.0)
                        .color(color),
                )
                .into_any_element(),
            None => el
                .child(
                    div()
                        .text_size(px(size_px))
                        .italic()
                        .font_weight(FontWeight(500.))
                        .text_color(colors::MUTED_FOREGROUND)
                        .child("Untitled"),
                )
                .into_any_element(),
        }
    }

    fn chapter_link(&mut self, chapter: &LatestChapter, cx: &mut Context<Self>) -> AnyElement {
        let key = SharedString::from(format!("ch-{}", chapter.id));
        let hover = self.hovers.get(key.clone(), 180, Easing::Bezier(anim::EASE));
        div()
            .id(key.clone())
            .flex_none()
            .cursor_pointer()
            .opacity(lerp(1.0, 0.72, hover))
            .on_hover(hover_listener(key, cx))
            .font_family("JetBrains Mono")
            .text_size(px(13.))
            .line_height(px(19.5))
            .font_weight(FontWeight(600.))
            .text_color(colors::PRIMARY)
            .child(api::chapter_label(chapter.number))
            .into_any_element()
    }

    fn time_ago(&mut self, chapter: &LatestChapter, cx: &mut Context<Self>) -> AnyElement {
        let key = SharedString::from(format!("time-{}", chapter.id));
        let hover = self.hovers.get(key.clone(), 150, Easing::Bezier(anim::EASE_OUT));
        let active = mix(colors::MUTED_FOREGROUND, colors::FOREGROUND, 0.4);
        div()
            .id(key.clone())
            .flex_none()
            .on_hover(hover_listener(key, cx))
            .text_size(px(13.))
            .line_height(px(19.5))
            .text_color(ui::lerp_color(colors::MUTED_FOREGROUND, active, hover))
            .child(api::time_ago(&chapter.created_at))
            .into_any_element()
    }

    fn groups(&mut self, chapter: &LatestChapter, cx: &mut Context<Self>) -> AnyElement {
        let row = div()
            .flex()
            .items_center()
            .gap(px(8.))
            .min_w_0()
            .text_size(px(13.))
            .line_height(px(19.5));
        let row = row.child(icon("group", 16.0, colors::MUTED_FOREGROUND));
        match chapter.groups.first() {
            None => row
                .child(div().italic().text_color(colors::MUTED_FOREGROUND).child("No group"))
                .into_any_element(),
            Some(group) => {
                let key = SharedString::from(format!("grp-{}-{}", chapter.id, group.id));
                let hover = self.hovers.get(key.clone(), 180, Easing::Bezier(anim::EASE));
                let more = chapter.groups.len().saturating_sub(1);
                row.child(
                    div()
                        .id(key.clone())
                        .flex()
                        .min_w_0()
                        .cursor_pointer()
                        .on_hover(hover_listener(key, cx))
                        .child(
                            spaced(group.name.trim().to_string(), "Inter", 13.0, 500.0)
                                .line_height(19.5)
                                .min_w(0.0)
                                .color(colors::foreground(lerp(0.82, 0.62, hover))),
                        ),
                )
                .when(more > 0, |el| {
                    el.child(
                        div()
                            .flex_none()
                            .px(px(6.))
                            .rounded_full()
                            .bg(colors::foreground(0.08))
                            .text_size(px(11.))
                            .line_height(px(18.))
                            .font_weight(FontWeight(600.))
                            .text_color(colors::MUTED_FOREGROUND)
                            .child(format!("+{more}")),
                    )
                })
                .into_any_element()
            }
        }
    }

    fn latest_list(&mut self, chapters: &[LatestChapter], cx: &mut Context<Self>) -> AnyElement {
        let mut rows = Vec::new();
        for chapter in chapters {
            if let Some(url) = &chapter.media_cover_url {
                self.want_image(url, Variant::Small, cx);
            }
            let cover = cover(
                self.images.read(cx),
                chapter.media_cover_url.as_deref(),
                Variant::Small,
                5.2,
            );
            let title = self.title_link(chapter, 15.0, cx);
            let ch = self.chapter_link(chapter, cx);
            let groups = self.groups(chapter, cx);
            let time = self.time_ago(chapter, cx);
            let uploader = &chapter.uploader;
            rows.push(
                div()
                    .min_h(px(52.))
                    .py(px(6.))
                    .pl(px(13.))
                    .pr(px(14.))
                    .rounded(px(11.2))
                    .border_1()
                    .border_color(colors::white(0.08))
                    .bg(colors::CARD)
                    .shadow(vec![ui::shadow(0.0, 1.0, 2.0, 0.0, colors::black(0.05))])
                    .flex()
                    .items_center()
                    .gap(px(14.))
                    .child(div().w(px(27.)).h(px(40.5)).flex_none().child(cover))
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .flex()
                            .items_start()
                            .gap(px(10.))
                            .child(title)
                            .child(div().pt(px(2.)).child(ch))
                            .children(chapter.title.clone().map(chapter_title)),
                    )
                    .child(div().w(px(256.)).flex_none().min_w_0().child(groups))
                    .child(
                        div()
                            .w(px(144.))
                            .flex_none()
                            .min_w_0()
                            .flex()
                            .items_center()
                            .gap(px(8.))
                            .text_size(px(13.))
                            .line_height(px(19.5))
                            .font_weight(FontWeight(500.))
                            .text_color(colors::foreground(0.82))
                            .child(avatar(&uploader.display_username))
                            .child(
                                div().flex().min_w_0().child(
                                    spaced(uploader.display_username.clone(), "Inter", 13.0, 500.0)
                                        .line_height(19.5)
                                        .min_w(0.0)
                                        .color(colors::foreground(0.82)),
                                ),
                            ),
                    )
                    .child(
                        div()
                            .w(px(76.))
                            .flex_none()
                            .flex()
                            .child(language_chip(&chapter.language)),
                    )
                    .child(div().w(px(64.)).flex_none().flex().justify_end().child(time))
                    .into_any_element(),
            );
        }
        div().flex().flex_col().gap(px(10.)).children(rows).into_any_element()
    }

    fn latest_grid(&mut self, chapters: &[LatestChapter], width: f32, cx: &mut Context<Self>) -> AnyElement {
        let columns = grid_columns(width);
        let inner = width - 64.0;
        let card_w = (inner - 16.0 * (columns as f32 - 1.0)) / columns as f32;
        let mut cards = Vec::new();
        for chapter in chapters {
            if let Some(url) = &chapter.media_cover_url {
                self.want_image(url, Variant::Large, cx);
            }
            let cover = cover(
                self.images.read(cx),
                chapter.media_cover_url.as_deref(),
                Variant::Large,
                14.0,
            );
            let title = self.grid_title(chapter, cx);
            let ch = self.chapter_link(chapter, cx);
            let time = self.time_ago(chapter, cx);
            cards.push(
                div()
                    .w(px(card_w))
                    .flex()
                    .flex_col()
                    .gap(px(10.))
                    .child(
                        div()
                            .relative()
                            .w(px(card_w))
                            .h(px(card_w * 1.5))
                            .rounded(px(14.))
                            .shadow(vec![
                                ui::shadow(0.0, 1.0, 2.0, 0.0, colors::black(0.32)),
                                ui::shadow(0.0, 16.0, 40.0, -16.0, colors::black(0.48)),
                            ])
                            .child(cover)
                            .child(
                                div()
                                    .absolute()
                                    .left(px(8.))
                                    .top(px(8.))
                                    .child(language_chip(&chapter.language)),
                            ),
                    )
                    .child(
                        div().flex().flex_col().gap(px(4.)).child(title).child(
                            div()
                                .flex()
                                .items_center()
                                .justify_between()
                                .gap(px(8.))
                                .child(ch)
                                .child(time),
                        ),
                    )
                    .into_any_element(),
            );
        }
        let mut rows = Vec::new();
        let mut cards = cards.into_iter().peekable();
        while cards.peek().is_some() {
            let row: Vec<_> = cards.by_ref().take(columns).collect();
            rows.push(div().flex().gap(px(16.)).children(row));
        }
        div().flex().flex_col().gap(px(24.)).children(rows).into_any_element()
    }

    fn grid_title(&mut self, chapter: &LatestChapter, cx: &mut Context<Self>) -> AnyElement {
        let key = SharedString::from(format!("gtitle-{}", chapter.id));
        let hover = self.hovers.get(key.clone(), 200, Easing::Bezier(anim::EASE_OUT));
        let color = ui::lerp_color(
            colors::FOREGROUND,
            mix(colors::FOREGROUND, colors::BACKGROUND, 0.25),
            hover,
        );
        div()
            .id(key.clone())
            .cursor_pointer()
            .on_hover(hover_listener(key, cx))
            .child(
                spaced(
                    chapter.media_title.clone().unwrap_or_else(|| "Untitled".into()),
                    "Inter",
                    14.0,
                    700.0,
                )
                .wrap(2)
                .line_height(18.9)
                .spacing(-0.14)
                .color(color),
            )
            .into_any_element()
    }

    fn latest_compact(&mut self, chapters: &[LatestChapter], cx: &mut Context<Self>) -> AnyElement {
        let mut rows = Vec::new();
        for (i, chapter) in chapters.iter().enumerate() {
            let title = self.title_link(chapter, 15.0, cx);
            let ch = self.chapter_link(chapter, cx);
            let groups = self.groups(chapter, cx);
            let time = self.time_ago(chapter, cx);
            rows.push(
                div()
                    .h(px(42.))
                    .px(px(16.))
                    .flex()
                    .items_center()
                    .gap(px(14.))
                    .when(i > 0, |el| el.border_t_1().border_color(colors::white(0.08)))
                    .child(div().w(px(18.)).flex_none().flex().child(flag(&chapter.language)))
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .flex()
                            .items_start()
                            .gap(px(10.))
                            .child(title)
                            .child(div().pt(px(2.)).child(ch))
                            .children(chapter.title.clone().map(chapter_title)),
                    )
                    .child(div().w(px(256.)).flex_none().min_w_0().child(groups))
                    .child(div().w(px(64.)).flex_none().flex().justify_end().child(time))
                    .into_any_element(),
            );
        }
        div()
            .rounded(px(19.6))
            .border_1()
            .border_color(colors::white(0.08))
            .bg(colors::CARD)
            .overflow_hidden()
            .shadow(vec![
                ui::shadow(0.0, 1.0, 2.0, 0.0, colors::black(0.32)),
                ui::shadow(0.0, 16.0, 40.0, -16.0, colors::black(0.48)),
            ])
            .children(rows)
            .into_any_element()
    }

    fn latest_skeleton(&self, width: f32) -> AnyElement {
        let bar = |w: f32, h: f32| div().w(px(w)).h(px(h)).flex_none().child(skeleton::fill(8.4));
        let main_w = width - 64.0 - 2.0 - 27.0 - 256.0 - 144.0 - 76.0 - 64.0 - 14.0 * 5.0 - 27.0;
        match self.layout {
            Layout::List => div()
                .flex()
                .flex_col()
                .gap(px(10.))
                .children((0..PER_PAGE).map(|_| {
                    div()
                        .min_h(px(52.))
                        .py(px(6.))
                        .pl(px(13.))
                        .pr(px(14.))
                        .rounded(px(11.2))
                        .border_1()
                        .border_color(colors::white(0.08))
                        .bg(colors::CARD)
                        .shadow(vec![ui::shadow(0.0, 1.0, 2.0, 0.0, colors::black(0.05))])
                        .flex()
                        .items_center()
                        .gap(px(14.))
                        .child(div().w(px(27.)).h(px(40.5)).flex_none().child(skeleton::fill(5.2)))
                        .child(div().flex_1().child(bar((main_w * 0.6).min(256.0), 14.0)))
                        .child(
                            div()
                                .w(px(256.))
                                .flex_none()
                                .child(bar(160.0f32.min(256.0 * 0.4), 12.0)),
                        )
                        .child(div().w(px(144.)).flex_none())
                        .child(div().w(px(76.)).flex_none())
                        .child(div().w(px(64.)).flex_none().flex().justify_end().child(bar(48.0, 12.0)))
                }))
                .into_any_element(),
            Layout::Grid => {
                let columns = grid_columns(width);
                let card_w = (width - 64.0 - 16.0 * (columns as f32 - 1.0)) / columns as f32;
                let card = || {
                    div()
                        .w(px(card_w))
                        .flex()
                        .flex_col()
                        .gap(px(10.))
                        .child(div().w(px(card_w)).h(px(card_w * 1.5)).child(skeleton::fill(14.0)))
                        .child(
                            div()
                                .flex()
                                .flex_col()
                                .gap(px(4.))
                                .child(bar(card_w * 0.8, 14.0))
                                .child(bar(card_w * 0.5, 12.0)),
                        )
                };
                let rows = PER_PAGE.div_ceil(columns);
                div()
                    .flex()
                    .flex_col()
                    .gap(px(24.))
                    .children((0..rows).map(|r| {
                        let n = columns.min(PER_PAGE - r * columns);
                        div().flex().gap(px(16.)).children((0..n).map(|_| card()))
                    }))
                    .into_any_element()
            }
            Layout::Compact => {
                let title_w = width - 64.0 - 2.0 - 32.0 - 18.0 - 256.0 - 64.0 - 14.0 * 3.0;
                div()
                    .rounded(px(19.6))
                    .border_1()
                    .border_color(colors::white(0.08))
                    .bg(colors::CARD)
                    .overflow_hidden()
                    .shadow(vec![
                        ui::shadow(0.0, 1.0, 2.0, 0.0, colors::black(0.32)),
                        ui::shadow(0.0, 16.0, 40.0, -16.0, colors::black(0.48)),
                    ])
                    .children((0..PER_PAGE).map(|i| {
                        div()
                            .h(px(42.))
                            .px(px(16.))
                            .flex()
                            .items_center()
                            .gap(px(14.))
                            .when(i > 0, |el| el.border_t_1().border_color(colors::white(0.08)))
                            .child(div().w(px(18.)).flex_none())
                            .child(div().flex_1().child(bar((title_w * 0.6).min(256.0), 14.0)))
                            .child(
                                div()
                                    .w(px(256.))
                                    .flex_none()
                                    .flex()
                                    .justify_end()
                                    .child(bar(48.0, 12.0)),
                            )
                            .child(div().w(px(64.)).flex_none())
                    }))
                    .into_any_element()
            }
        }
    }
}

impl Render for LatestView {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        self.tick(window, cx);
        let width = self.width;
        div().w(px(width)).child(self.render_latest(width, 0.0, cx))
    }
}

/// How many lines a grid card title wraps to.
fn title_lines(window: &mut Window, title: &str, width: f32) -> usize {
    let mut font = gpui::font("Inter");
    font.weight = FontWeight(700.0);
    let run = gpui::TextRun {
        len: title.len(),
        font,
        color: Hsla::default(),
        background_color: None,
        underline: None,
        strikethrough: None,
    };
    window
        .text_system()
        .shape_text(
            SharedString::from(title.to_string()),
            px(14.0),
            &[run],
            Some(px(width)),
            None,
        )
        .map(|lines| lines.iter().map(|l| l.wrap_boundaries().len() + 1).sum::<usize>())
        .unwrap_or(1)
        .min(2)
}

fn grid_columns(width: f32) -> usize {
    // Breakpoints apply to the viewport: sm 3, md 4, xl 6 columns.
    let viewport = width + SIDEBAR;
    if viewport >= 1280.0 {
        6
    } else if viewport >= 768.0 {
        4
    } else if viewport >= 640.0 {
        3
    } else {
        2
    }
}

/// `latestStyles.chapterTitle`: muted, and first to give way (`flex-shrink: 100`).
fn chapter_title(title: String) -> impl IntoElement {
    div()
        .pt(px(2.))
        .flex()
        .min_w_0()
        .map(|mut d| {
            d.style().flex_shrink = Some(100.0);
            d
        })
        .child(
            spaced(title, "Inter", 13.0, 400.0)
                .line_height(19.5)
                .min_w(0.0)
                .shrink(100.0)
                .color(colors::MUTED_FOREGROUND),
        )
}

fn avatar(name: &str) -> impl IntoElement {
    div()
        .size(px(22.))
        .flex_none()
        .rounded_full()
        .bg(rgb(0x4d2721))
        .flex()
        .items_center()
        .justify_center()
        .text_size(px(10.))
        .line_height(px(15.))
        .font_weight(FontWeight(700.))
        .text_color(rgb(0xf37a69))
        .child(
            name.chars()
                .next()
                .map(|c| c.to_uppercase().to_string())
                .unwrap_or_default(),
        )
}

fn flag(language: &str) -> impl IntoElement {
    let name = match language {
        "pt_br" | "pt" => "flag-br",
        "fr" => "flag-fr",
        _ => "flag-us",
    };
    div()
        .w(px(18.))
        .h(px(12.))
        .flex_none()
        .rounded(px(3.))
        .overflow_hidden()
        .shadow(vec![gpui::BoxShadow {
            color: colors::white(0.08),
            offset: point(px(0.), px(0.)),
            blur_radius: px(0.),
            spread_radius: px(1.),
        }])
        .child(picture(name, 18.0, 12.0))
}

fn language_chip(language: &str) -> impl IntoElement {
    div()
        .h(px(22.))
        .px(px(7.))
        .rounded(px(8.4))
        .bg(colors::foreground(0.06))
        .flex()
        .items_center()
        .gap(px(6.))
        .child(flag(language))
        .child(
            spaced(api::language_code(language), "JetBrains Mono", 11.0, 600.0)
                .line_height(16.0)
                .spacing(0.44)
                .color(colors::MUTED_FOREGROUND),
        )
}
