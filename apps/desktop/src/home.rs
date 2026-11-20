//! `/` for a signed-in reader: the app shell (navbar, sidebar) around the
//! featured carousel and the latest updates.
//!
//! The two sections are separate, cached views: while the carousel animates,
//! the list below is not laid out or painted again, GPUI reuses its last frame.

use std::time::{Duration, Instant};

use gpui::{
    AnyView, Context, Entity, EventEmitter, FontWeight, Hsla, IntoElement, ParentElement, Render, ScrollHandle,
    SharedString, StyleRefinement, Styled, Window, div, point, prelude::*, px,
};

use crate::anim::{self, Easing, Tween};
use crate::api::{Layout, Session};
use crate::featured::FeaturedView;
use crate::images::Images;
use crate::latest::LatestView;
use crate::text::spaced;
use crate::theme::{alpha, colors, mix};
use crate::ui::{self, HasHovers, Hovers, hover_listener, icon, lerp};

pub const NAVBAR: f32 = 72.0;

/// A sidebar entry: icon, label, active, "soon".
type NavItem = (&'static str, &'static str, bool, bool);
pub const SIDEBAR: f32 = 248.0;

pub enum HomeEvent {
    SignedOut,
}

pub enum Load<T> {
    Loading,
    Ready(T),
    Failed,
}

pub struct HomeView {
    session: Session,
    hovers: Hovers,
    sidebar: Tween,
    featured: Entity<FeaturedView>,
    latest: Entity<LatestView>,
    scroll: ScrollHandle,
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
        let width = f32::from(window.viewport_size().width) - SIDEBAR;
        let images = cx.new(|_| Images::default());
        let featured = cx.new(|cx| FeaturedView::new(session.clone(), images.clone(), width, cx));
        let latest = cx.new(|cx| LatestView::new(session.clone(), images.clone(), width, cx));
        cx.observe(&featured, |_, _, cx| cx.notify()).detach();
        Self {
            session,
            hovers: Hovers::default(),
            sidebar: {
                let mut t = Tween::new(1.0, Duration::from_millis(300), Easing::Bezier(anim::EASE_OUT));
                t.jump(1.0);
                t
            },
            featured,
            latest,
            scroll: ScrollHandle::new(),
            demo: std::env::var("TAIYO_DEMO")
                .unwrap_or_default()
                .split(',')
                .filter_map(|step| {
                    let (action, at) = step.split_once('@')?;
                    Some((at.parse().ok()?, action.to_string()))
                })
                .collect(),
            opened: Instant::now(),
        }
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
                "list" => self.latest.update(cx, |l, cx| l.set_layout(Layout::List, cx)),
                "grid" => self.latest.update(cx, |l, cx| l.set_layout(Layout::Grid, cx)),
                "compact" => self.latest.update(cx, |l, cx| l.set_layout(Layout::Compact, cx)),
                "tooltip" => self.latest.update(cx, |l, cx| l.show_tooltip(1, cx)),
                "next" => self.featured.update(cx, |f, cx| f.next(cx)),
                "sidebar" => self.toggle_sidebar(cx),
                "scroll" => self.scroll.set_offset(point(px(0.), px(-420.))),
                _ => {}
            }
        }
    }

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
        let sections: [(&str, &[NavItem]); 3] = [
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
}

impl Render for HomeView {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        self.run_demo(cx);
        if !self.demo.is_empty() || self.hovers.animating() || self.sidebar.is_animating() {
            window.request_animation_frame();
        }
        let viewport = window.viewport_size();
        let vw = f32::from(viewport.width);
        let open = self.sidebar.value();
        let left = SIDEBAR * open;
        let main_w = vw - left;
        self.featured.update(cx, |f, cx| f.set_width(main_w, cx));
        let featured_h = self.featured.read(cx).height();
        let latest_h = self.latest.update(cx, |l, cx| {
            l.set_width(main_w, cx);
            l.height(window)
        });
        let featured =
            AnyView::from(self.featured.clone()).cached(StyleRefinement::default().w(px(main_w)).h(px(featured_h)));
        let latest =
            AnyView::from(self.latest.clone()).cached(StyleRefinement::default().w(px(main_w)).h(px(latest_h)));
        let navbar = self.render_navbar(open, cx);
        let sidebar = self.render_sidebar(open, cx);

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
