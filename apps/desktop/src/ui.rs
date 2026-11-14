//! Building blocks shared by both screens.

use std::collections::HashMap;
use std::time::Duration;

use gpui::{
    Bounds, BoxShadow, Corners, Div, Hsla, IntoElement, ParentElement, Pixels, Rgba, SharedString, Styled, Svg,
    Transformation, Window, canvas, div, img, point, prelude::*, px, radians, svg,
};

use crate::anim::{self, Easing, Tween};
use crate::paint::{self, Field};
use crate::theme::{alpha, colors, mix, rgb, rgba, scene};

/// CSS transitions on `:hover`, keyed by element. Each value runs 0 → 1.
#[derive(Default)]
pub struct Hovers {
    map: HashMap<SharedString, Tween>,
}

impl Hovers {
    pub fn get(&mut self, key: impl Into<SharedString>, ms: u64, easing: Easing) -> f32 {
        self.map
            .entry(key.into())
            .or_insert_with(|| Tween::new(0.0, Duration::from_millis(ms), easing))
            .value()
    }

    /// `:hover` with the browsers' default `ease` timing.
    pub fn ease(&mut self, key: impl Into<SharedString>, ms: u64) -> f32 {
        self.get(key, ms, Easing::Bezier(anim::EASE))
    }

    pub fn instant(&mut self, key: impl Into<SharedString>) -> bool {
        self.get(key, 0, Easing::Linear) > 0.5
    }

    pub fn set(&mut self, key: impl Into<SharedString>, hovered: bool) {
        let key = key.into();
        if let Some(t) = self.map.get_mut(&key) {
            t.set(if hovered { 1.0 } else { 0.0 });
        } else {
            let mut t = Tween::new(0.0, Duration::ZERO, Easing::Linear);
            t.set(if hovered { 1.0 } else { 0.0 });
            self.map.insert(key, t);
        }
    }

    pub fn animating(&self) -> bool {
        self.map.values().any(Tween::is_animating)
    }
}

pub fn lerp(a: f32, b: f32, t: f32) -> f32 {
    a + (b - a) * t
}

pub fn lerp_color(a: Rgba, b: Rgba, t: f32) -> Hsla {
    mix(a, b, t).into()
}

pub fn icon(name: &str, size: f32, color: impl Into<Hsla>) -> Svg {
    svg()
        .path(SharedString::from(format!("icons/{name}.svg")))
        .size(px(size))
        .flex_none()
        .text_color(color.into())
}

/// A full-colour SVG (logos, flags), drawn as an image.
pub fn picture(name: &str, w: f32, h: f32) -> impl IntoElement {
    img(SharedString::from(format!("icons/{name}.svg")))
        .w(px(w))
        .h(px(h))
        .flex_none()
}

pub fn spinner(size: f32, color: impl Into<Hsla>) -> Svg {
    let turn = (anim::clock() % 1.0) as f32;
    icon("spinner", size, color).with_transformation(Transformation::rotate(radians(turn * std::f32::consts::TAU)))
}

/// `shadows.chip` plus the raised edge (`0 -1px rgb(255 255 255 / 8%)`).
pub fn chip_shadows() -> Vec<BoxShadow> {
    vec![
        BoxShadow {
            color: colors::black(0.05),
            offset: point(px(0.), px(1.)),
            blur_radius: px(1.),
            spread_radius: px(0.),
        },
        BoxShadow {
            color: colors::white(0.08),
            offset: point(px(0.), px(-1.)),
            blur_radius: px(0.),
            spread_radius: px(0.),
        },
    ]
}

/// CSS `box-shadow: x y blur spread color` (GPUI's blur is the gaussian sigma).
pub fn shadow(x: f32, y: f32, blur: f32, spread: f32, color: Hsla) -> BoxShadow {
    BoxShadow {
        color,
        offset: point(px(x), px(y)),
        blur_radius: px(blur / 2.0),
        spread_radius: px(spread),
    }
}

/// The `outline` button variant: Google, Discord.
pub fn outline_button(id: &'static str, hover: f32) -> gpui::Stateful<Div> {
    div()
        .id(id)
        .flex()
        .items_center()
        .justify_center()
        .rounded_full()
        .border_1()
        .border_color(colors::white(0.09))
        .bg(lerp_color(colors::FIELD, colors::CHIP_HOVER, hover))
        .shadow(chip_shadows())
        .text_color(colors::FOREGROUND)
        .cursor_pointer()
}

/// The `ghost` button variant: transparent until hovered.
pub fn ghost_bg(hover: f32) -> Hsla {
    colors::white(0.06 * hover)
}

/// A checkbox: 16px, `radius 4px`, brand fill with a white tick when checked.
pub fn checkbox(checked: bool) -> Div {
    let base = div()
        .size(px(16.))
        .flex_none()
        .rounded(px(4.))
        .flex()
        .items_center()
        .justify_center();
    if checked {
        base.bg(colors::PRIMARY).child(icon("check", 12., colors::WHITE))
    } else {
        base.bg(colors::FIELD)
            .border_1()
            .border_color(colors::white(0.09))
            .shadow(chip_shadows())
    }
}

/// `input-group`: 48px tall field shell with its focus ring.
pub fn field_shell(focused: bool) -> Div {
    let shell = div()
        .relative()
        .flex()
        .items_center()
        .w_full()
        .h(px(48.))
        .rounded(px(19.6))
        .border_1()
        .bg(colors::FIELD);
    if focused {
        // `outline: 3px solid color-mix(ring 24%)` hugging the border box.
        shell.border_color(colors::PRIMARY).shadow(vec![BoxShadow {
            color: alpha(colors::PRIMARY, 0.24),
            offset: point(px(0.), px(0.)),
            blur_radius: px(0.),
            spread_radius: px(3.),
        }])
    } else {
        shell.border_color(colors::white(0.09)).shadow(chip_shadows())
    }
}

/// The brand "sun" call to action: 95° brand → orange → gold gradient, glow,
/// and the sheen that sweeps across every five seconds.
pub fn sun_button(hover: f32, pressed: bool, disabled: bool) -> impl IntoElement {
    canvas(
        |_, _, _| {},
        move |bounds: Bounds<Pixels>, _, window: &mut Window, _| {
            let scale = if pressed { 0.98 } else { 1.0 };
            let b = scale_bounds(bounds, scale);
            let h = f32::from(b.size.height);
            let glow = alpha(scene::BRAND, lerp(0.32, 0.5, hover));
            window.paint_shadows(
                b,
                Corners::all(px(h / 2.0)),
                &[shadow(0.0, lerp(6.0, 10.0, hover), lerp(18.0, 30.0, hover), 0.0, glow)],
            );
            let pill = paint::rounded_rect(b, h / 2.0);
            let opacity = if disabled { 0.7 } else { 1.0 };
            let o = |c: Rgba| Rgba { a: c.a * opacity, ..c };
            paint::paint_gradient(
                window,
                &pill,
                Field::css_bounds(95.0, b),
                &[(0.0, o(scene::BRAND)), (0.5, o(scene::ORANGE)), (1.0, o(scene::GOLD))],
            );
            paint_sheen(window, b, &pill, opacity);
        },
    )
    .absolute()
    .size_full()
}

/// `sheenSweep`: a third-wide band, skewed −18°, crossing in the first 26% of
/// a 5s ease-in-out loop.
fn paint_sheen(window: &mut Window, b: Bounds<Pixels>, pill: &paint::Poly, opacity: f32) {
    let cycle = (anim::clock() % 5.0) as f32 / 5.0;
    if cycle >= 0.26 {
        return;
    }
    let p = anim::EASE_IN_OUT.ease(cycle / 0.26);
    let w = f32::from(b.size.width) / 3.0;
    let h = f32::from(b.size.height);
    let (x0, y0) = (f32::from(b.origin.x), f32::from(b.origin.y));
    let left = x0 + w * lerp(-1.3, 3.3, p);
    let skew = (18.0f32).to_radians().tan();
    let cy = y0 + h / 2.0;
    // u = x + skew * (y - cy) - left is the coordinate across the band.
    let field = Field {
        a: 1.0 / w,
        b: skew / w,
        c: (-skew * cy - left) / w,
    };
    let shine = rgba(0xfff9ec, 0.55 * opacity);
    let clear = Rgba { a: 0.0, ..shine };
    paint::paint_gradient_span(window, pill, field, &[(0.0, clear), (0.5, shine), (1.0, clear)]);
}

pub fn scale_bounds(b: Bounds<Pixels>, s: f32) -> Bounds<Pixels> {
    if (s - 1.0).abs() < f32::EPSILON {
        return b;
    }
    let (w, h) = (f32::from(b.size.width), f32::from(b.size.height));
    let (nw, nh) = (w * s, h * s);
    Bounds::new(
        point(b.origin.x + px((w - nw) / 2.0), b.origin.y + px((h - nh) / 2.0)),
        gpui::size(px(nw), px(nh)),
    )
}

/// `<ErrorAlert>`: the destructive alert above the form.
pub fn error_alert(message: SharedString) -> Div {
    let destructive = colors::DESTRUCTIVE;
    div()
        .flex()
        .items_start()
        .gap(px(10.))
        .py(px(12.))
        .px(px(14.))
        .rounded(px(19.6))
        .border_1()
        .border_color(alpha(destructive, 0.32))
        .bg(alpha(destructive, 0.04))
        .text_size(px(14.))
        .line_height(px(20.))
        .text_color(colors::FOREGROUND)
        .child(div().pt(px(2.)).child(icon("alert", 16., rgb(0xff6467))))
        .child(div().font_weight(gpui::FontWeight(500.)).child(message))
}

pub trait HasHovers: 'static {
    fn hovers(&mut self) -> &mut Hovers;
}

/// An `on_hover` listener feeding the view's hover transitions.
pub fn hover_listener<T: HasHovers>(
    key: impl Into<SharedString>,
    cx: &mut gpui::Context<T>,
) -> impl Fn(&bool, &mut Window, &mut gpui::App) + 'static {
    let key = key.into();
    cx.listener(move |this, hovered: &bool, _, cx| {
        this.hovers().set(key.clone(), *hovered);
        cx.notify();
    })
}
