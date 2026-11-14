//! The featured carousel at the top of the home page: Embla's slide motion,
//! autoplay with its progress pills, drag to swipe.

use std::time::{Duration, Instant};

use gpui::{
    AnyElement, Bounds, Context, Entity, IntoElement, MouseButton, MouseDownEvent, MouseMoveEvent, ParentElement,
    Pixels, Render, SharedString, Styled, Window, canvas, div, linear_color_stop, linear_gradient, point, prelude::*,
    px, size,
};

use crate::anim::{self, Easing, Tween};
use crate::api::{self, FeaturedMedia, Session};
use crate::home::Load;
use crate::images::{Images, Slot, Variant, cover};
use crate::paint::{self, clip_convex};
use crate::skeleton;
use crate::text::spaced;
use crate::theme::{alpha, colors, mix};
use crate::ui::{self, HasHovers, Hovers, hover_listener, lerp};

pub const SLIDE_H: f32 = 344.0;
const AUTOPLAY_MS: f32 = 7000.0;

/// Embla's scroll body: velocity integrates displacement / duration, damped
/// by a 0.68 friction, stepped at 60Hz. `duration: 32` as in the web carousel.
struct Carousel {
    location: f32,
    target: f32,
    velocity: f32,
    pending: f32,
    elapsed_ms: f32,
    hovered: bool,
    drag: Option<CarouselDrag>,
    pills: Vec<Tween>,
}

struct CarouselDrag {
    start_x: f32,
    start_location: f32,
    last_x: f32,
    last_time: Instant,
    velocity: f32,
}

impl Carousel {
    const DURATION: f32 = 32.0;
    const FRICTION: f32 = 0.68;

    fn new(count: usize) -> Self {
        Self {
            location: 0.0,
            target: 0.0,
            velocity: 0.0,
            pending: 0.0,
            elapsed_ms: 0.0,
            hovered: false,
            drag: None,
            pills: (0..count)
                .map(|i| {
                    let mut t = Tween::new(8.0, Duration::from_millis(520), Easing::Bezier(anim::EASE_OUT));
                    if i == 0 {
                        t.jump(32.0);
                    }
                    t
                })
                .collect(),
        }
    }

    fn selected(&self, count: usize) -> usize {
        (self.target.round() as i64).rem_euclid(count as i64) as usize
    }

    fn settled(&self) -> bool {
        self.drag.is_none() && (self.target - self.location).abs() < 1e-5 && self.velocity.abs() < 1e-5
    }

    fn step(&mut self, dt: f32) {
        if self.drag.is_some() {
            return;
        }
        self.pending += dt;
        while self.pending >= 1.0 / 60.0 {
            self.pending -= 1.0 / 60.0;
            let displacement = self.target - self.location;
            self.velocity += displacement / Self::DURATION;
            self.velocity *= Self::FRICTION;
            self.location += self.velocity;
            if (self.target - self.location).abs() < 1e-5 && self.velocity.abs() < 1e-4 {
                self.location = self.target;
                self.velocity = 0.0;
            }
        }
    }

    fn go_to(&mut self, index: usize, count: usize) {
        let current = self.selected(count);
        // Loop: take the shortest way round.
        let mut delta = index as i64 - current as i64;
        let n = count as i64;
        if delta > n / 2 {
            delta -= n;
        } else if delta < -n / 2 {
            delta += n;
        }
        self.set_target(self.target + delta as f32, count);
    }

    fn set_target(&mut self, target: f32, count: usize) {
        let before = self.selected(count);
        self.target = target;
        let after = self.selected(count);
        if before != after {
            self.pills[before].set(8.0);
            self.pills[after].set(32.0);
            self.elapsed_ms = 0.0;
        }
    }
}

pub struct FeaturedView {
    hovers: Hovers,
    featured: Load<Vec<FeaturedMedia>>,
    carousel: Carousel,
    images: Entity<Images>,
    width: f32,
    last_tick: Instant,
}

impl HasHovers for FeaturedView {
    fn hovers(&mut self) -> &mut Hovers {
        &mut self.hovers
    }
}

impl FeaturedView {
    pub fn new(session: Session, images: Entity<Images>, width: f32, cx: &mut Context<Self>) -> Self {
        cx.observe(&images, |_, _, cx| cx.notify()).detach();
        let request = session.clone();
        let task = cx.background_executor().spawn(async move { api::featured(&request) });
        cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.featured = match result {
                    Ok(medias) => {
                        this.carousel = Carousel::new(medias.len());
                        Load::Ready(medias)
                    }
                    Err(_) => Load::Failed,
                };
                cx.notify();
            })
            .ok();
        })
        .detach();
        Self {
            hovers: Hovers::default(),
            featured: Load::Loading,
            carousel: Carousel::new(0),
            images,
            width,
            last_tick: Instant::now(),
        }
    }

    /// The height the home page lays this view out at.
    pub fn height(&self) -> f32 {
        match &self.featured {
            Load::Ready(medias) if medias.is_empty() => 0.0,
            Load::Failed => 0.0,
            _ => SLIDE_H,
        }
    }

    pub fn set_width(&mut self, width: f32, cx: &mut Context<Self>) {
        if (self.width - width).abs() > 0.01 {
            self.width = width;
            cx.notify();
        }
    }

    pub fn next(&mut self, cx: &mut Context<Self>) {
        if let Load::Ready(medias) = &self.featured {
            let count = medias.len();
            let target = self.carousel.target + 1.0;
            self.carousel.set_target(target, count);
            cx.notify();
        }
    }

    fn want_image(&mut self, url: &str, variant: Variant, cx: &mut Context<Self>) {
        self.images.update(cx, |images, cx| images.want(url, variant, cx));
    }

    fn tick(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        let now = Instant::now();
        let dt = now.duration_since(self.last_tick).as_secs_f32().clamp(0.0, 0.1);
        self.last_tick = now;
        let mut animating = matches!(self.featured, Load::Loading) || self.hovers.animating();
        if let Load::Ready(medias) = &self.featured {
            let count = medias.len();
            let paused = self.carousel.hovered || self.carousel.drag.is_some();
            if count > 1 && !paused {
                self.carousel.elapsed_ms += dt * 1000.0;
                if self.carousel.elapsed_ms >= AUTOPLAY_MS {
                    let target = self.carousel.target + 1.0;
                    self.carousel.set_target(target, count);
                }
                animating = true;
            }
            self.carousel.step(dt);
            animating |= !self.carousel.settled() || self.carousel.pills.iter().any(Tween::is_animating);
        }
        animating |= self.images.read(cx).fading();
        if animating {
            window.request_animation_frame();
        }
    }

    fn render_featured(&mut self, width: f32, cx: &mut Context<Self>) -> AnyElement {
        let medias = match &self.featured {
            Load::Ready(medias) if !medias.is_empty() => medias.clone(),
            Load::Ready(_) | Load::Failed => return div().into_any_element(),
            Load::Loading => return featured_skeleton().into_any_element(),
        };
        let count = medias.len();
        let location = self.carousel.location;
        let first = location.floor() as i64;
        let mut slides = Vec::new();
        for k in first..=first + 1 {
            let offset = (k as f32 - location) * width;
            if offset <= -width || offset >= width {
                continue;
            }
            let media = &medias[(k.rem_euclid(count as i64)) as usize];
            slides.push(self.render_slide(media, offset, width, cx).into_any_element());
        }
        // Pre-load the art of every slide, so the next one is ready.
        let backdrop_w = width.round() as u32;
        for media in &medias {
            if let Some(url) = &media.cover_url {
                self.want_image(url, Variant::Large, cx);
            }
            if let Some(url) = media.banner_url.as_ref().or(media.cover_url.as_ref()) {
                self.want_image(url, Variant::Backdrop(backdrop_w), cx);
            }
        }

        let selected = self.carousel.selected(count);
        let progress = (self.carousel.elapsed_ms / AUTOPLAY_MS).clamp(0.0, 1.0);
        let dots: Vec<_> = (0..count)
            .map(|i| {
                let key = SharedString::from(format!("fdot{i}"));
                let hover = self.hovers.get(key.clone(), 520, Easing::Bezier(anim::EASE_OUT));
                let w = self.carousel.pills[i].value();
                let bg = colors::foreground(lerp(0.32, 0.56, hover));
                let active = i == selected;
                div()
                    .id(key.clone())
                    .py(px(8.))
                    .px(px(4.))
                    .cursor_pointer()
                    .on_hover(hover_listener(key, cx))
                    .on_click(cx.listener(move |this, _, _, cx| {
                        this.carousel.go_to(i, count);
                        cx.notify();
                    }))
                    .child(
                        div().w(px(w)).h(px(8.)).child(
                            canvas(
                                |_, _, _| {},
                                move |b: Bounds<Pixels>, _, window: &mut Window, _| {
                                    let pill = paint::rounded_rect(b, 4.0);
                                    paint::fill_poly(window, &pill, bg);
                                    if active {
                                        let offset = f32::from(b.size.width) * (progress - 1.0);
                                        let fill_b = Bounds::new(point(b.origin.x + px(offset), b.origin.y), b.size);
                                        let shape = clip_convex(&pill, &paint::rounded_rect(fill_b, 4.0));
                                        paint::fill_poly(window, &shape, colors::FOREGROUND);
                                    }
                                },
                            )
                            .size_full(),
                        ),
                    )
            })
            .collect();

        div()
            .id("featured")
            .relative()
            .h(px(SLIDE_H))
            .overflow_hidden()
            .on_hover(cx.listener(|this, hovered: &bool, _, cx| {
                this.carousel.hovered = *hovered;
                cx.notify();
            }))
            .on_mouse_down(
                MouseButton::Left,
                cx.listener(move |this, e: &MouseDownEvent, _, cx| {
                    let x = f32::from(e.position.x);
                    this.carousel.drag = Some(CarouselDrag {
                        start_x: x,
                        start_location: this.carousel.location,
                        last_x: x,
                        last_time: Instant::now(),
                        velocity: 0.0,
                    });
                    this.carousel.velocity = 0.0;
                    cx.notify();
                }),
            )
            .on_mouse_move(cx.listener(move |this, e: &MouseMoveEvent, _, cx| {
                let width = this.width;
                if let Some(drag) = &mut this.carousel.drag {
                    let x = f32::from(e.position.x);
                    let dt = drag.last_time.elapsed().as_secs_f32().max(1.0 / 240.0);
                    drag.velocity = drag.velocity * 0.4 + (x - drag.last_x) / dt * 0.6;
                    drag.last_x = x;
                    drag.last_time = Instant::now();
                    this.carousel.location = drag.start_location - (x - drag.start_x) / width;
                    cx.notify();
                }
            }))
            .on_mouse_up(
                MouseButton::Left,
                cx.listener(move |this, _, _, cx| this.end_drag(count, cx)),
            )
            .on_mouse_up_out(
                MouseButton::Left,
                cx.listener(move |this, _, _, cx| this.end_drag(count, cx)),
            )
            .children(slides)
            .when(count > 1, |el| {
                el.child(
                    div()
                        .absolute()
                        .right(px(28.))
                        .bottom(px(8.))
                        .flex()
                        .items_center()
                        .gap(px(2.))
                        .children(dots),
                )
            })
            .into_any_element()
    }

    fn end_drag(&mut self, count: usize, cx: &mut Context<Self>) {
        let Some(drag) = self.carousel.drag.take() else {
            return;
        };
        let width = self.width;
        let moved = (drag.last_x - drag.start_x) / width;
        let flick = drag.velocity / width;
        let mut target = drag.start_location;
        if moved.abs() > 0.15 || (flick.abs() > 0.6 && moved.abs() > 0.02) {
            target -= (moved + flick * 0.1).signum();
        }
        self.carousel.set_target(target.round(), count);
        cx.notify();
    }

    fn render_slide(
        &mut self,
        media: &FeaturedMedia,
        offset: f32,
        width: f32,
        cx: &mut Context<Self>,
    ) -> impl IntoElement + use<> {
        let backdrop_url = media.banner_url.clone().or_else(|| media.cover_url.clone());
        let backdrop = backdrop_url.as_deref().and_then(|url| {
            match self.images.read(cx).get(url, Variant::Backdrop(width.round() as u32)) {
                Some(Slot::Ready { image, .. }) => Some(image.clone()),
                _ => None,
            }
        });
        let cover = cover(self.images.read(cx), media.cover_url.as_deref(), Variant::Large, 14.0);
        let title_key = SharedString::from(format!("ftitle-{}", media.id));
        let title_hover = self.hovers.get(title_key.clone(), 200, Easing::Bezier(anim::EASE_OUT));
        let title = media.title.clone().unwrap_or_default();
        let authors = media.authors.join(", ");
        let genres = api::genres(&media.tags);
        let synopsis = api::synopsis(&media.synopsis);

        // `.synopsisBox` clamps to as many 1.6em lines as fit (container
        // queries on its height), at most six.
        let details_w = (width - 64.0 - 176.0 - 40.0).min(832.0);
        let title_lines: f32 = if title.len() as f32 * 21.0 > details_w {
            2.0
        } else {
            1.0
        };
        let mut rest: f32 = 264.0 - 48.0 * title_lines;
        if !authors.is_empty() {
            rest -= 24.0 + 12.0;
        }
        if !genres.is_empty() {
            rest -= 24.0 + 12.0;
        }
        rest -= 12.0;
        let lines = ((rest / 28.8).floor() as usize).clamp(1, 6);

        div()
            .absolute()
            .top_0()
            .left(px(offset))
            .w(px(width))
            .h(px(SLIDE_H))
            .overflow_hidden()
            .child(
                canvas(
                    |_, _, _| {},
                    move |b: Bounds<Pixels>, _, window: &mut Window, _| {
                        if let Some(image) = backdrop.clone() {
                            // `.backdropImage`: 100% × 150%, scale(1.05) from its centre.
                            let (w, h) = (f32::from(b.size.width), SLIDE_H * 1.5);
                            let (sw, sh) = (w * 1.05, h * 1.05);
                            let bounds = Bounds::new(
                                point(b.origin.x - px((sw - w) / 2.0), b.origin.y - px((sh - h) / 2.0)),
                                size(px(sw), px(sh)),
                            );
                            let _ = window.paint_image(bounds, Default::default(), image, 0, false);
                        }
                    },
                )
                .absolute()
                .size_full(),
            )
            .child(div().absolute().size_full().bg(linear_gradient(
                180.0,
                linear_color_stop(alpha(colors::BACKGROUND, 0.6), 0.0),
                linear_color_stop(colors::BACKGROUND, 1.0),
            )))
            .child(
                div()
                    .relative()
                    .flex()
                    .gap(px(40.))
                    .px(px(32.))
                    .py(px(40.))
                    .child(
                        div()
                            .w(px(176.))
                            .h(px(264.))
                            .flex_none()
                            .rounded(px(14.))
                            .shadow(vec![
                                ui::shadow(0.0, 4.0, 12.0, 0.0, colors::black(0.4)),
                                ui::shadow(0.0, 32.0, 64.0, -16.0, colors::black(0.56)),
                            ])
                            .child(cover),
                    )
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .max_w(px(832.))
                            .h(px(264.))
                            .flex()
                            .flex_col()
                            .gap(px(12.))
                            .child(
                                div()
                                    .id(title_key.clone())
                                    .flex()
                                    .cursor_pointer()
                                    .on_hover(hover_listener(title_key, cx))
                                    .child(
                                        spaced(title, "Inter", 40.0, 700.0)
                                            .wrap(2)
                                            .line_height(48.0)
                                            .spacing(-0.8)
                                            .color(ui::lerp_color(
                                                colors::FOREGROUND,
                                                mix(colors::FOREGROUND, colors::BACKGROUND, 0.25),
                                                title_hover,
                                            )),
                                    ),
                            )
                            .when(!authors.is_empty(), |el| {
                                el.child(
                                    div().flex().child(
                                        spaced(authors, "Inter", 16.0, 600.0)
                                            .line_height(24.0)
                                            .min_w(0.0)
                                            .color(colors::foreground(0.85)),
                                    ),
                                )
                            })
                            .when(!genres.is_empty(), |el| {
                                el.child(
                                    div()
                                        .flex()
                                        .flex_wrap()
                                        .gap(px(6.))
                                        .max_h(px(24.))
                                        .overflow_hidden()
                                        .children(genres.into_iter().map(|g| {
                                            div()
                                                .px(px(10.))
                                                .py(px(4.))
                                                .rounded_full()
                                                .bg(colors::foreground(0.1))
                                                .child(
                                                    spaced(g, "Inter", 11.0, 700.0)
                                                        .uppercase()
                                                        .spacing(0.55)
                                                        .line_height(16.0)
                                                        .color(colors::FOREGROUND),
                                                )
                                        })),
                                )
                            })
                            .when(!synopsis.is_empty(), |el| {
                                el.child(
                                    div().flex_1().min_h_0().overflow_hidden().child(
                                        spaced(synopsis, "Inter", 18.0, 400.0)
                                            .wrap(lines)
                                            .line_height(28.8)
                                            .color(colors::foreground(0.8)),
                                    ),
                                )
                            }),
                    ),
            )
    }
}

impl Render for FeaturedView {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        self.tick(window, cx);
        let width = self.width;
        div().w(px(width)).child(self.render_featured(width, cx))
    }
}

fn featured_skeleton() -> impl IntoElement {
    let bar = |h: f32| div().h(px(h)).child(skeleton::fill(8.4));
    div()
        .relative()
        .h(px(SLIDE_H))
        .overflow_hidden()
        .child(div().absolute().size_full().bg(linear_gradient(
            180.0,
            linear_color_stop(alpha(colors::BACKGROUND, 0.6), 0.0),
            linear_color_stop(colors::BACKGROUND, 1.0),
        )))
        .child(
            div()
                .relative()
                .flex()
                .gap(px(40.))
                .px(px(32.))
                .py(px(40.))
                .child(div().w(px(176.)).h(px(264.)).flex_none().child(skeleton::fill(14.0)))
                .child(
                    div()
                        .flex_1()
                        .max_w(px(576.))
                        .flex()
                        .flex_col()
                        .gap(px(12.))
                        .child(div().w(gpui::relative(0.7)).child(bar(40.0)))
                        .child(div().w(gpui::relative(0.4)).child(bar(16.0)))
                        .child(div().w_full().child(bar(14.0)))
                        .child(div().w_full().child(bar(14.0)))
                        .child(div().w(gpui::relative(0.6)).child(bar(14.0))),
                ),
        )
}
