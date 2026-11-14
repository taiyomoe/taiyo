//! `/` for a signed-in reader: the app shell (navbar, sidebar), the featured
//! carousel and the latest updates in their three layouts.

use std::sync::Arc;
use std::time::{Duration, Instant};

use gpui::{
    AnyElement, Bounds, Context, EventEmitter, FontWeight, Hsla, IntoElement, MouseButton, MouseDownEvent,
    MouseMoveEvent, ParentElement, Pixels, Render, RenderImage, ScrollHandle, SharedString, Styled, Window, canvas,
    div, linear_color_stop, linear_gradient, point, prelude::*, px, size,
};

use crate::anim::{self, Easing, Tween};
use crate::api::{self, FeaturedMedia, LatestChapter, Layout, Session};
use crate::images::{Images, Slot, Variant};
use crate::paint;
use crate::skeleton;
use crate::text::spaced;
use crate::theme::{alpha, colors, mix, rgb};
use crate::ui::{self, HasHovers, Hovers, hover_listener, icon, lerp, picture};

const PER_PAGE: usize = 12;
const NAVBAR: f32 = 72.0;
const SIDEBAR: f32 = 248.0;
const SLIDE_H: f32 = 344.0;
const AUTOPLAY_MS: f32 = 7000.0;
const LAYOUTS: [(Layout, &str, &str); 3] = [
    (Layout::List, "layout-list", "List"),
    (Layout::Grid, "layout-grid", "Grid"),
    (Layout::Compact, "layout-rows", "Compact"),
];

pub enum HomeEvent {
    SignedOut,
}

enum Load<T> {
    Loading,
    Ready(T),
    Failed,
}

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

struct Tooltip {
    target: Option<usize>,
    hover_since: Option<(usize, Instant)>,
    opacity: Tween,
    x: Tween,
    label: &'static str,
}

pub struct HomeView {
    session: Session,
    hovers: Hovers,
    sidebar: Tween,
    featured: Load<Vec<FeaturedMedia>>,
    latest: Load<Vec<LatestChapter>>,
    layout: Layout,
    indicator: Tween,
    images: Images,
    carousel: Carousel,
    tooltip: Tooltip,
    scroll: ScrollHandle,
    last_tick: Instant,
    main_width: f32,
    /// `TAIYO_DEMO=action@ms,...`: scripted interactions for debug captures.
    demo: Vec<(u64, String)>,
    opened: Instant,
}

impl EventEmitter<HomeEvent> for HomeView {}

impl HasHovers for HomeView {
    fn hovers(&mut self) -> &mut Hovers {
        &mut self.hovers
    }
}

impl HomeView {
    pub fn new(session: Session, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let layout = session.layout();
        let index = LAYOUTS.iter().position(|(l, ..)| *l == layout).unwrap_or(0);
        let mut indicator = Tween::new(0.0, Duration::from_millis(550), Easing::Spring);
        indicator.jump(index as f32 * 36.0);
        let main_width = f32::from(window.viewport_size().width) - SIDEBAR;
        let view = Self {
            session,
            hovers: Hovers::default(),
            sidebar: {
                let mut t = Tween::new(1.0, Duration::from_millis(300), Easing::Bezier(anim::EASE_OUT));
                t.jump(1.0);
                t
            },
            featured: Load::Loading,
            latest: Load::Loading,
            layout,
            indicator,
            images: Images::default(),
            carousel: Carousel::new(0),
            tooltip: Tooltip {
                target: None,
                hover_since: None,
                opacity: Tween::new(0.0, Duration::from_millis(180), Easing::Bezier(anim::EASE_OUT)),
                x: Tween::new(0.0, Duration::from_millis(180), Easing::Bezier(anim::EASE_OUT)),
                label: "",
            },
            scroll: ScrollHandle::new(),
            last_tick: Instant::now(),
            main_width,
            demo: std::env::var("TAIYO_DEMO")
                .unwrap_or_default()
                .split(',')
                .filter_map(|step| {
                    let (action, at) = step.split_once('@')?;
                    Some((at.parse().ok()?, action.to_string()))
                })
                .collect(),
            opened: Instant::now(),
        };
        view.load(cx);
        view
    }

    fn load(&self, cx: &mut Context<Self>) {
        let session = self.session.clone();
        let featured = cx.background_executor().spawn(async move { api::featured(&session) });
        let session = self.session.clone();
        let latest = cx
            .background_executor()
            .spawn(async move { api::latest(&session, PER_PAGE) });
        cx.spawn(async move |this, cx| {
            let result = featured.await;
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
        cx.spawn(async move |this, cx| {
            let result = latest.await;
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
    }

    fn want_image(&mut self, url: &str, variant: Variant, cx: &mut Context<Self>) {
        let Some(job) = self.images.request(url, variant) else {
            return;
        };
        let task = cx.background_executor().spawn(async move { job() });
        let url = url.to_string();
        cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.images.finish(&url, variant, result);
                cx.notify();
            })
            .ok();
        })
        .detach();
    }

    fn set_layout(&mut self, layout: Layout, cx: &mut Context<Self>) {
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

    fn toggle_sidebar(&mut self, cx: &mut Context<Self>) {
        let open = self.sidebar.target() > 0.5;
        self.sidebar.set(if open { 0.0 } else { 1.0 });
        cx.notify();
    }

    fn run_demo(&mut self, cx: &mut Context<Self>) {
        let elapsed = self.opened.elapsed().as_millis() as u64;
        let due: Vec<String> = self
            .demo
            .iter()
            .filter(|(at, _)| *at <= elapsed)
            .map(|(_, a)| a.clone())
            .collect();
        self.demo.retain(|(at, _)| *at > elapsed);
        for action in due {
            match action.as_str() {
                "list" => self.set_layout(Layout::List, cx),
                "grid" => self.set_layout(Layout::Grid, cx),
                "compact" => self.set_layout(Layout::Compact, cx),
                "sidebar" => self.toggle_sidebar(cx),
                "next" => {
                    if let Load::Ready(medias) = &self.featured {
                        let count = medias.len();
                        let target = self.carousel.target + 1.0;
                        self.carousel.set_target(target, count);
                    }
                }
                "tooltip" => self.tooltip.hover_since = Some((1, Instant::now())),
                "scroll" => self.scroll.set_offset(point(px(0.), px(-420.))),
                _ => {}
            }
        }
    }

    fn tick(&mut self, window: &mut Window, cx: &mut Context<Self>) -> bool {
        self.run_demo(cx);
        let now = Instant::now();
        let dt = now.duration_since(self.last_tick).as_secs_f32().clamp(0.0, 0.1);
        self.last_tick = now;
        let mut animating = false;

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
            }
            animating = true;
        }

        animating |= !self.demo.is_empty()
            || self.hovers.animating()
            || self.sidebar.is_animating()
            || self.indicator.is_animating()
            || self.tooltip.opacity.is_animating()
            || self.tooltip.x.is_animating()
            || self.images.fading()
            || matches!(self.featured, Load::Loading)
            || matches!(self.latest, Load::Loading);
        if animating {
            window.request_animation_frame();
        }
        animating
    }

    // --------------------------------------------------------------- shell --

    fn render_navbar(&mut self, open: f32, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let bell = self.hovers.instant("bell") as u8 as f32;
        let toggle = self.hovers.instant("toggle") as u8 as f32;
        // The brand column follows the sidebar (300ms): 248px open, 200px
        // closed, and the menu toggle slides in when the sidebar is gone.
        let brand_w = lerp(200.0, SIDEBAR, open);
        let slot_w = lerp(36.0, 0.0, open);
        let initials = self.session.initials();
        let muted72 = alpha(colors::MUTED_FOREGROUND, 0.72);

        div()
            .absolute()
            .top_0()
            .left_0()
            .right_0()
            .h(px(NAVBAR))
            .flex()
            .items_center()
            .bg(alpha(colors::BACKGROUND, 0.72))
            .border_b_1()
            .border_color(colors::white(0.06))
            .child(
                div()
                    .flex_none()
                    .w(px(brand_w))
                    .px(px(24.))
                    .flex()
                    .items_center()
                    .child(
                        div()
                            .flex_none()
                            .overflow_hidden()
                            .w(px(slot_w))
                            .ml(px(lerp(-8.0, 0.0, open)))
                            .mr(px(lerp(8.0, 0.0, open)))
                            .opacity(1.0 - open)
                            .child(
                                div()
                                    .id("toggle")
                                    .size(px(36.))
                                    .flex_none()
                                    .rounded_full()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .cursor_pointer()
                                    .bg(ui::ghost_bg(toggle))
                                    .on_hover(hover_listener("toggle", cx))
                                    .on_click(cx.listener(|this, _, _, cx| this.toggle_sidebar(cx)))
                                    .child(div().opacity(0.8).child(icon("menu", 20.0, colors::MUTED_FOREGROUND))),
                            ),
                    )
                    .child(
                        div()
                            .id("brand")
                            .flex()
                            .items_center()
                            .gap(px(10.))
                            .h(px(30.))
                            .cursor_pointer()
                            .on_click(cx.listener(|this, _, _, cx| this.toggle_sidebar(cx)))
                            .child(icon("logo", 43.8, colors::PRIMARY).h(px(28.)))
                            .child(
                                spaced("Taiyō", "PT Serif", 20.0, 700.0)
                                    .line_height(30.0)
                                    .spacing(-0.4)
                                    .color(colors::FOREGROUND),
                            ),
                    ),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .items_center()
                    .justify_end()
                    .gap(px(12.))
                    .pl(px(16.))
                    .pr(px(32.))
                    .child(
                        div()
                            .id("search")
                            .flex_shrink()
                            .min_w_0()
                            .w(px(352.))
                            .h(px(40.))
                            .rounded(px(19.6))
                            .border_1()
                            .border_color(colors::white(0.09))
                            .bg(colors::FIELD)
                            .shadow(ui::chip_shadows())
                            .flex()
                            .items_center()
                            .cursor_pointer()
                            .child(div().pl(px(9.)).child(icon("search", 18.0, colors::MUTED_FOREGROUND)))
                            .child(
                                div().flex_1().min_w_0().px(px(11.)).flex().child(
                                    spaced("Search or jump to…", "Inter", 14.0, 400.0)
                                        .line_height(21.0)
                                        .min_w(0.0)
                                        .color(muted72),
                                ),
                            )
                            .child(
                                div().pr(px(8.)).child(
                                    div()
                                        .h(px(22.))
                                        .px(px(6.))
                                        .flex()
                                        .items_center()
                                        .gap(px(4.))
                                        .rounded(px(10.6))
                                        .border_1()
                                        .border_color(colors::KEYCAP_BORDER)
                                        .bg(colors::KEYCAP)
                                        .text_size(px(12.))
                                        .line_height(px(16.))
                                        .font_weight(FontWeight(500.))
                                        .text_color(colors::MUTED_FOREGROUND)
                                        .child("⌘")
                                        .child("K"),
                                ),
                            ),
                    )
                    .child(
                        div()
                            .id("bell")
                            .size(px(40.))
                            .flex_none()
                            .rounded_full()
                            .flex()
                            .items_center()
                            .justify_center()
                            .cursor_pointer()
                            .bg(ui::ghost_bg(bell))
                            .on_hover(hover_listener("bell", cx))
                            .child(div().opacity(0.8).child(icon("bell", 18.0, colors::FOREGROUND))),
                    )
                    .child(
                        div()
                            .id("avatar")
                            .size(px(40.))
                            .flex_none()
                            .rounded_full()
                            .bg(colors::PRIMARY)
                            .flex()
                            .items_center()
                            .justify_center()
                            .cursor_pointer()
                            .text_size(px(13.))
                            .font_weight(FontWeight(600.))
                            .text_color(colors::WHITE)
                            .on_click(cx.listener(|_, _, _, cx| cx.emit(HomeEvent::SignedOut)))
                            .child(initials),
                    ),
            )
    }

    fn render_sidebar(&mut self, open: f32, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let sections: [(&str, &[(&str, &str, bool, bool)]); 3] = [
            (
                "Browse",
                &[
                    ("home", "Home", true, false),
                    ("sliders", "Advanced search", false, false),
                    ("sparkles", "Recently added", false, false),
                    ("shuffle", "Random title", false, false),
                ],
            ),
            (
                "My library",
                &[
                    ("history", "Reading history", false, false),
                    ("list", "Lists", false, false),
                ],
            ),
            (
                "Community",
                &[
                    ("users", "Groups", false, false),
                    ("feed", "Feed", false, true),
                    ("store", "Shop", false, false),
                ],
            ),
        ];
        let mut groups = Vec::new();
        for (label, items) in sections {
            let mut menu = div().flex().flex_col().gap(px(2.));
            for &(icon_name, text, active, soon) in items {
                let key = SharedString::from(format!("nav-{text}"));
                let hover = if soon { 0.0 } else { self.hovers.ease(key.clone(), 150) };
                let fg = if active {
                    Hsla::from(mix(colors::PRIMARY, colors::FOREGROUND, 0.28))
                } else {
                    ui::lerp_color(colors::SIDEBAR_FOREGROUND, colors::FOREGROUND, hover)
                };
                let bg = if active {
                    alpha(colors::PRIMARY, 0.14)
                } else {
                    colors::white(0.06 * hover)
                };
                let icon_color = if active {
                    fg
                } else {
                    Hsla::from(colors::MUTED_FOREGROUND)
                };
                menu = menu.child(
                    div()
                        .id(key.clone())
                        .relative()
                        .h(px(42.))
                        .px(px(12.))
                        .rounded(px(14.))
                        .flex()
                        .items_center()
                        .gap(px(12.))
                        .bg(bg)
                        .text_color(fg)
                        .text_size(px(15.))
                        .line_height(px(20.))
                        .font_weight(FontWeight(if active { 600. } else { 500. }))
                        .when(soon, |el| el.opacity(0.5))
                        .when(!soon, |el| {
                            el.cursor_pointer().on_hover(hover_listener(key.clone(), cx))
                        })
                        .child(icon(icon_name, 16.0, icon_color))
                        .child(text)
                        .when(soon, |el| {
                            el.child(
                                div()
                                    .absolute()
                                    .right(px(12.))
                                    .h(px(20.))
                                    .px(px(6.))
                                    .rounded(px(14.))
                                    .bg(colors::foreground(0.08))
                                    .flex()
                                    .items_center()
                                    .child(
                                        spaced("Soon", "Inter", 10.0, 600.0)
                                            .uppercase()
                                            .spacing(0.6)
                                            .line_height(20.0)
                                            .color(colors::MUTED_FOREGROUND),
                                    ),
                            )
                        }),
                );
            }
            groups.push(
                div()
                    .px(px(12.))
                    .py(px(4.))
                    .flex()
                    .flex_col()
                    .child(
                        div().h(px(36.)).px(px(12.)).flex().items_center().child(
                            spaced(label, "Inter", 11.0, 600.0)
                                .uppercase()
                                .spacing(0.88)
                                .line_height(16.5)
                                .color(colors::MUTED_FOREGROUND),
                        ),
                    )
                    .child(menu),
            );
        }
        // "Feed" is disabled: its badge sits outside the dimmed button.
        div()
            .absolute()
            .top(px(NAVBAR))
            .bottom_0()
            .left(px(-SIDEBAR * (1.0 - open)))
            .w(px(SIDEBAR))
            .bg(colors::SIDEBAR)
            .border_r_1()
            .border_color(colors::white(0.06))
            .py(px(12.))
            .flex()
            .flex_col()
            .gap(px(8.))
            .text_color(colors::SIDEBAR_FOREGROUND)
            .children(groups)
    }

    // ------------------------------------------------------------ featured --

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
                let width = this.main_width;
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
        let width = self.main_width;
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
            match self.images.get(url, Variant::Backdrop(width.round() as u32)) {
                Some(Slot::Ready { image, .. }) => Some(image.clone()),
                _ => None,
            }
        });
        let cover = self.cover(media.cover_url.as_deref(), Variant::Large, 14.0);
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

    /// `<Cover>`: a skeleton until the art arrives, then a 200ms fade-in.
    fn cover(&self, url: Option<&str>, variant: Variant, radius: f32) -> AnyElement {
        let frame = div().relative().size_full().rounded(px(radius)).overflow_hidden();
        let Some(url) = url else {
            return frame
                .bg(colors::white(0.0))
                .flex()
                .items_center()
                .justify_center()
                .child(div().opacity(0.6).child(icon("book", 24.0, colors::MUTED_FOREGROUND)))
                .into_any_element();
        };
        match self.images.get(url, variant) {
            Some(Slot::Ready { image, at }) => {
                let t = (at.elapsed().as_secs_f32() / 0.2).min(1.0);
                let opacity = anim::EASE_OUT.ease(t);
                let image = image.clone();
                frame
                    .child(
                        canvas(
                            |_, _, _| {},
                            move |b: Bounds<Pixels>, _, window: &mut Window, _| {
                                let _ = window.paint_image(b, gpui::Corners::all(px(radius)), image.clone(), 0, false);
                            },
                        )
                        .size_full()
                        .opacity(opacity),
                    )
                    .into_any_element()
            }
            Some(Slot::Failed) => frame
                .bg(rgb(0x121212))
                .flex()
                .items_center()
                .justify_center()
                .child(div().opacity(0.6).child(icon("book", 24.0, colors::MUTED_FOREGROUND)))
                .into_any_element(),
            _ => frame.child(skeleton::fill(radius)).into_any_element(),
        }
    }

    // -------------------------------------------------------------- latest --

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
                                &vec![(x, y - 1.0), (x + w, y - 1.0), (x + w / 2.0, y + 6.0)],
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
            let cover = self.cover(chapter.media_cover_url.as_deref(), Variant::Small, 5.2);
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
            let cover = self.cover(chapter.media_cover_url.as_deref(), Variant::Large, 14.0);
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

/// The part of convex `subject` inside convex `clipper` (both clockwise).
pub fn clip_convex(subject: &paint::Poly, clipper: &paint::Poly) -> paint::Poly {
    let mut out = subject.clone();
    for i in 0..clipper.len() {
        let a = clipper[i];
        let b = clipper[(i + 1) % clipper.len()];
        let (nx, ny) = (-(b.1 - a.1), b.0 - a.0);
        out = paint::clip(&out, nx, ny, -(nx * a.0 + ny * a.1));
        if out.is_empty() {
            break;
        }
    }
    out
}

impl Render for HomeView {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        self.tick(window, cx);
        let viewport = window.viewport_size();
        let (vw, vh) = (f32::from(viewport.width), f32::from(viewport.height));
        let open = self.sidebar.value();
        let left = SIDEBAR * open;
        let main_w = vw - left;
        self.main_width = main_w;
        let featured = self.render_featured(main_w, cx);
        let latest = self.render_latest(main_w, vh, cx);
        let navbar = self.render_navbar(open, cx);
        let sidebar = self.render_sidebar(open, cx);
        let _: Option<Arc<RenderImage>> = None;

        div()
            .size_full()
            .relative()
            .bg(colors::BACKGROUND)
            .font_family("Inter")
            .text_size(px(16.))
            .line_height(px(24.))
            .text_color(colors::FOREGROUND)
            .child(
                div()
                    .id("main")
                    .absolute()
                    .top_0()
                    .bottom_0()
                    .left(px(left))
                    .w(px(main_w))
                    .overflow_y_scroll()
                    .track_scroll(&self.scroll)
                    .child(div().pt(px(NAVBAR)).child(featured).child(latest)),
            )
            .child(sidebar)
            .child(navbar)
    }
}
