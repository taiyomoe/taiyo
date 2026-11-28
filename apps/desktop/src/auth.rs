//! `/auth/sign-in` and `/auth/sign-up`: the night scene with the plasma sun
//! on the left, the form on the right.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;
use std::time::{Duration, Instant};

use gpui::{
    AnyView, Bounds, Context, CursorStyle, Entity, EventEmitter, Font, FontStyle, FontWeight, Hsla, IntoElement,
    MouseButton, MouseDownEvent, MouseMoveEvent, MouseUpEvent, ParentElement, Pixels, Render, RenderImage,
    SharedString, StyleRefinement, Styled, TextRun, Window, canvas, div, font, point, prelude::*, px, size,
};

use crate::anim::{self, Easing, Tween};
use crate::api::Session;
use crate::auth_form::AuthForm;
use crate::paint::{self, Field};
use crate::raster::{self, RadialSpec};
use crate::sun::{self, FrameParams, Quat, SunWorker};
use crate::text::spaced;
use crate::theme::{alpha, rgba, scene};
use crate::ui::{self, HasHovers, Hovers, hover_listener, icon, lerp};

const CITATION_MS: f32 = 7000.0;

struct Citation {
    quote: &'static str,
    role: &'static str,
    who: &'static str,
}

const CITATIONS: [Citation; 6] = [
    Citation {
        quote: "this website fucking sucks. genuinely. zero stars if it let me.",
        role: "left a one-star and a voicemail",
        who: "zero_stars_given",
    },
    Citation {
        quote: "garbage UI, garbage reader, garbage everything. who designed this, a raccoon?",
        role: "uninstalled twice out of spite",
        who: "refund_pls",
    },
    Citation {
        quote: "i've seen funeral homes with better vibes than this app",
        role: "demanding a refund on a free website",
        who: "deeply_unimpressed",
    },
    Citation {
        quote: "absolute dumpster fire of a website. my eyes are filing a complaint.",
        role: "would give negative stars if allowed",
        who: "filed_a_complaint",
    },
    Citation {
        quote: "this is what happens when nobody tells you 'no'. embarrassing.",
        role: "deeply, personally offended",
        who: "regret_incarnate",
    },
    Citation {
        quote: "i'd rather read the terms and conditions than open this again",
        role: "writing a strongly worded email",
        who: "the_disappointment",
    },
];

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Mode {
    SignIn,
    SignUp,
}

pub enum AuthEvent {
    SignedIn(Session),
}

struct Drag {
    last: (f32, f32),
    time: Instant,
    held: f32,
}

#[derive(Clone, Copy)]
struct Ember {
    left: f64,
    size: f64,
    delay: f64,
    dur: f64,
    drift: f64,
    glow: f64,
    gold: bool,
}

/// `deterministic.ts`: `rand` and `round`, so the embers match the web's.
fn rand(seed: f64) -> f64 {
    let x = (seed * 12.9898).sin() * 43758.5453;
    x - x.floor()
}

fn round2(n: f64) -> f64 {
    (n * 100.0).round() / 100.0
}

fn embers() -> Vec<Ember> {
    (0..26)
        .map(|i| {
            let i = i as f64;
            let size = round2(2.0 + rand(i + 100.0) * 4.0);
            Ember {
                left: round2(rand(i) * 100.0),
                size,
                delay: round2(rand(i + 200.0) * 9.0),
                dur: round2(9.0 + rand(i + 300.0) * 9.0),
                drift: round2(rand(i + 400.0) * 120.0 - 60.0),
                glow: round2(size * 3.0),
                gold: rand(i + 500.0) > 0.5,
            }
        })
        .collect()
}

type ImageCache = Rc<RefCell<HashMap<(u32, u32), Arc<RenderImage>>>>;

pub struct AuthView {
    form: Entity<AuthForm>,
    hovers: Hovers,
    /// The balanced quote width (a search), kept per quote and size.
    balanced: Option<(usize, f32, Pixels)>,

    citation: usize,
    elapsed_ms: f32,
    citations_hovered: bool,
    pills: Vec<Tween>,
    last_tick: Instant,

    started: Instant,
    embers: Vec<Ember>,
    worker: SunWorker,
    sun_frame: Option<Arc<sun::Frame>>,
    /// Replaced sun frames, freed from the atlas a few frames later: the GPU
    /// may still be reading them, and reusing their tiles tears the image.
    retired: std::collections::VecDeque<(u32, Arc<sun::Frame>)>,
    frame_count: u32,
    sun_ready: Option<Instant>,
    spin: Quat,
    drag: Option<Drag>,
    velocity: (f32, f32),
    disc: (f32, f32, f32),
    over_sun: bool,
    disc_image: ImageCache,
    aurora: ImageCache,
    scrim: ImageCache,
}

impl EventEmitter<AuthEvent> for AuthView {}

impl HasHovers for AuthView {
    fn hovers(&mut self) -> &mut Hovers {
        &mut self.hovers
    }
}

impl AuthView {
    pub fn new(last_used: Option<String>, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let form = cx.new(|cx| AuthForm::new(last_used, window, cx));
        cx.subscribe(&form, |_, _, event: &AuthEvent, cx| match event {
            AuthEvent::SignedIn(session) => cx.emit(AuthEvent::SignedIn(session.clone())),
        })
        .detach();
        let quality = sun::Quality {
            beams: 0.5,
            sphere: 1.0,
        };
        Self {
            form,
            hovers: Hovers::default(),
            balanced: None,
            citation: 0,
            elapsed_ms: 0.0,
            citations_hovered: false,
            pills: (0..CITATIONS.len())
                .map(|i| {
                    let mut t = Tween::new(8.0, Duration::from_millis(520), Easing::Bezier(anim::EASE_OUT));
                    if i == 0 {
                        t.jump(32.0);
                    }
                    t
                })
                .collect(),
            last_tick: Instant::now(),
            started: Instant::now(),
            embers: embers(),
            worker: SunWorker::spawn(quality),
            sun_frame: None,
            retired: Default::default(),
            frame_count: 0,
            sun_ready: None,
            spin: Quat::axis_angle([0.0, 0.0, 1.0], 0.12),
            drag: None,
            velocity: (0.0, 0.0),
            disc: (0.0, 0.0, 0.0),
            over_sun: false,
            disc_image: Rc::default(),
            aurora: Rc::default(),
            scrim: Rc::default(),
        }
    }

    // ------------------------------------------------------------ ticking --
    fn tick(&mut self, window: &mut Window) {
        let now = Instant::now();
        let dt = now.duration_since(self.last_tick).as_secs_f32().clamp(0.0, 0.1);
        self.last_tick = now;

        if !self.citations_hovered {
            self.elapsed_ms += dt * 1000.0;
            if self.elapsed_ms >= CITATION_MS {
                self.select_citation((self.citation + 1) % CITATIONS.len());
            }
        }

        // The sun: coast after a fling, otherwise turn slowly around "up".
        let dragging = self.drag.is_some();
        let coasting = self.velocity.0.powi(2) + self.velocity.1.powi(2) > 1.0;
        if let Some(drag) = &mut self.drag {
            drag.held += dt;
        } else if coasting {
            self.rotate(self.velocity.0 * dt, self.velocity.1 * dt);
            let decay = (-dt * 3.0).exp();
            self.velocity = (self.velocity.0 * decay, self.velocity.1 * decay);
        }
        if !dragging && !coasting {
            self.spin = Quat::axis_angle([0.0, 1.0, 0.0], dt * 0.05).mul(self.spin);
        }
        window.request_animation_frame();
    }

    fn select_citation(&mut self, index: usize) {
        self.pills[self.citation].set(8.0);
        self.citation = index;
        self.pills[index].set(32.0);
        self.elapsed_ms = 0.0;
    }

    fn rotate(&mut self, dx: f32, dy: f32) {
        let radius = self.disc.2.max(1.0);
        let angle = (dx * dx + dy * dy).sqrt() / radius;
        if angle == 0.0 {
            return;
        }
        self.spin = Quat::axis_angle([dy, dx, 0.0], angle).mul(self.spin);
    }

    fn on_sun(&self, x: f32, y: f32) -> bool {
        let (cx, cy, r) = self.disc;
        ((x - cx).powi(2) + (y - cy).powi(2)).sqrt() <= r * 1.03
    }

    fn scene_mouse_down(&mut self, event: &MouseDownEvent, _: &mut Window, cx: &mut Context<Self>) {
        let (x, y) = (f32::from(event.position.x), f32::from(event.position.y));
        if self.on_sun(x, y) {
            self.drag = Some(Drag {
                last: (x, y),
                time: Instant::now(),
                held: 0.0,
            });
            self.velocity = (0.0, 0.0);
            cx.notify();
        }
    }

    fn scene_mouse_move(&mut self, event: &MouseMoveEvent, _: &mut Window, cx: &mut Context<Self>) {
        let (x, y) = (f32::from(event.position.x), f32::from(event.position.y));
        let Some(drag) = &mut self.drag else {
            let over = self.on_sun(x, y);
            if over != self.over_sun {
                self.over_sun = over;
                cx.notify();
            }
            return;
        };
        let (dx, dy) = (x - drag.last.0, y - drag.last.1);
        let seconds = drag.time.elapsed().as_secs_f32().max(1.0 / 240.0);
        drag.last = (x, y);
        drag.time = Instant::now();
        drag.held = 0.0;
        // Smoothed and capped, so one fast last event does not fling it away.
        let vx = self.velocity.0 * 0.4 + dx / seconds * 0.6;
        let vy = self.velocity.1 * 0.4 + dy / seconds * 0.6;
        let cap = (self.disc.2 * 3.0 / (vx * vx + vy * vy).sqrt().max(1.0)).min(1.0);
        self.velocity = (vx * cap, vy * cap);
        self.rotate(dx, dy);
        cx.notify();
    }

    fn scene_mouse_up(&mut self, _: &MouseUpEvent, _: &mut Window, cx: &mut Context<Self>) {
        if let Some(drag) = self.drag.take() {
            if drag.held > 0.08 {
                self.velocity = (0.0, 0.0);
            }
            cx.notify();
        }
    }

    // -------------------------------------------------------------- scene --

    fn render_scene(
        &mut self,
        width: f32,
        height: f32,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> impl IntoElement + use<> {
        let t = self.started.elapsed().as_secs_f32();
        // `.orbit`: left 50%, top 66%, width min(92%, 44rem), square.
        let diameter = (width * 0.92).min(704.0);
        let radius = diameter / 2.0;
        let center = (width / 2.0, height * 0.66 + radius);
        self.disc = (center.0, center.1, radius);

        // Hand the renderer the next frame, pick up the last finished one.
        let breath = 0.5 - 0.5 * (t / 5.0 * std::f32::consts::TAU).cos();
        self.worker.request(FrameParams {
            layout: sun::Layout {
                width,
                height,
                center,
                radius,
            },
            time: t,
            breath,
            spin: self.spin,
        });
        if let Some(frame) = self.worker.latest() {
            let fresh = self
                .sun_frame
                .as_ref()
                .is_none_or(|current| current.serial != frame.serial);
            if fresh {
                if let Some(old) = self.sun_frame.replace(frame) {
                    self.retired.push_back((self.frame_count, old));
                }
                self.sun_ready.get_or_insert_with(Instant::now);
            }
        }
        let ready = self
            .sun_ready
            .map_or(0.0, |at| (at.elapsed().as_secs_f32() / 0.6).min(1.0));
        let ready = anim::EASE.ease(ready);

        self.frame_count += 1;
        let mut retired = Vec::new();
        while self.retired.front().is_some_and(|(at, _)| self.frame_count - at > 6) {
            if let Some((_, frame)) = self.retired.pop_front() {
                retired.push(frame.beams.1.clone());
                retired.push(frame.sphere.1.clone());
            }
        }
        let sun_images = self
            .sun_frame
            .as_ref()
            .map(|f| (f.beams.1.clone(), f.sphere.1.clone(), f.beams.0, f.sphere.0));
        let disc_cache = self.disc_image.clone();
        let aurora_cache = self.aurora.clone();
        let embers = self.embers.clone();
        let viewport_h = f32::from(window.viewport_size().height);

        let layers = canvas(
            |_, _, _| {},
            move |bounds: Bounds<Pixels>, _, window: &mut Window, _| {
                for image in &retired {
                    let _ = window.drop_image(image.clone());
                }
                let (x0, y0) = (f32::from(bounds.origin.x), f32::from(bounds.origin.y));
                let (w, h) = (f32::from(bounds.size.width), f32::from(bounds.size.height));

                // `.aurora`: inset -20% -20% 30% -20%, blur 20px, drifting on a
                // 14s ease-in-out loop between translate(-10%, 0) and (10%, -4%).
                let (aw, ah) = (w * 1.4, h * 0.9);
                let pad = 60.0;
                let key = (aw.round() as u32, ah.round() as u32);
                let aurora = aurora_cache
                    .borrow_mut()
                    .entry(key)
                    .or_insert_with(|| {
                        raster::radial(&RadialSpec {
                            w: aw,
                            h: ah,
                            cx: aw * 0.5,
                            cy: ah,
                            rx: aw * 0.6,
                            ry: ah * 0.8,
                            stops: vec![(0.0, rgba(0xf2452d, 0.42)), (0.7, rgba(0xf2452d, 0.0))],
                            blur: 20.0,
                            pad,
                            scale: 0.25,
                        })
                    })
                    .clone();
                let phase = (t % 14.0) / 14.0;
                let (from, to, local) = if phase < 0.5 {
                    ((-0.1, 0.0), (0.1, -0.04), phase * 2.0)
                } else {
                    ((0.1, -0.04), (-0.1, 0.0), (phase - 0.5) * 2.0)
                };
                let e = anim::EASE_IN_OUT.ease(local);
                let (tx, ty) = (lerp(from.0, to.0, e) * aw, lerp(from.1, to.1, e) * ah);
                {
                    let _ = window.paint_image(
                        Bounds::new(
                            point(px(x0 - w * 0.2 - pad + tx), px(y0 - h * 0.2 - pad + ty)),
                            size(px(aw + 2.0 * pad), px(ah + 2.0 * pad)),
                        ),
                        Default::default(),
                        aurora,
                        0,
                        false,
                    );
                }

                // The sun: the flat disc until the first frame, then a 600ms
                // cross-fade to the rendered beams and sphere.
                if ready < 1.0 {
                    let key = (diameter.round() as u32, 0);
                    let disc = disc_cache
                        .borrow_mut()
                        .entry(key)
                        .or_insert_with(|| raster::sun_disc(diameter, 2.0))
                        .clone();
                    let disc_bounds = Bounds::new(
                        point(px(x0 + center.0 - radius), px(y0 + center.1 - radius)),
                        size(px(diameter), px(diameter)),
                    );
                    window.paint_shadows(
                        disc_bounds,
                        gpui::Corners::all(px(radius)),
                        &[
                            ui::shadow(0.0, 0.0, 280.0, 110.0, alpha(scene::GOLD, 0.3 * (1.0 - ready))),
                            ui::shadow(
                                0.0,
                                0.0,
                                140.0,
                                40.0,
                                alpha(crate::theme::rgb(0xff8c28), 0.55 * (1.0 - ready)),
                            ),
                        ],
                    );
                    if ready <= 0.0 {
                        let _ = window.paint_image(disc_bounds, Default::default(), disc, 0, false);
                    }
                }
                if let Some((beams, sphere, beams_rect, sphere_rect)) = sun_images.clone() {
                    for (image, rect) in [(beams, beams_rect), (sphere, sphere_rect)] {
                        let _ = window.paint_image(
                            Bounds::new(point(px(x0 + rect.0), px(y0 + rect.1)), size(px(rect.2), px(rect.3))),
                            Default::default(),
                            image,
                            0,
                            false,
                        );
                    }
                }

                // `.vignette`
                let night = scene::NIGHT;
                let veil = |a: f32| rgba(0x120a07, a);
                {
                    paint::paint_gradient(
                        window,
                        &paint::rect_poly(x0, y0, w, h),
                        Field::css(180.0, x0, y0, w, h),
                        &[
                            (0.0, night),
                            (0.26, veil(0.35)),
                            (0.5, veil(0.5)),
                            (0.78, veil(0.15)),
                            (1.0, veil(0.35)),
                        ],
                    );
                }

                // `<Embers>`: 26 sparks rising 78vh on linear loops.
                let tt = t as f64;
                for ember in &embers {
                    if tt < ember.delay {
                        continue;
                    }
                    let phase = ((tt - ember.delay) % ember.dur / ember.dur) as f32;
                    let opacity = if phase < 0.1 {
                        phase / 0.1 * 0.9
                    } else if phase < 0.9 {
                        lerp(0.9, 0.7, (phase - 0.1) / 0.8)
                    } else {
                        lerp(0.7, 0.0, (phase - 0.9) / 0.1)
                    };
                    let s = ember.size as f32;
                    let x = x0 + w * ember.left as f32 / 100.0 + ember.drift as f32 * phase;
                    let y = y0 + h + 10.0 - s - 0.78 * viewport_h * phase;
                    let b = Bounds::new(point(px(x), px(y)), size(px(s), px(s)));
                    let (fill, glow) = if ember.gold {
                        (scene::GOLD_LIGHT, scene::GOLD)
                    } else {
                        (scene::EMBER, scene::BRAND)
                    };
                    window.paint_shadows(
                        b,
                        gpui::Corners::all(px(s / 2.0)),
                        &[ui::shadow(0.0, 0.0, ember.glow as f32, 0.0, alpha(glow, opacity))],
                    );
                    window.paint_quad(gpui::fill(b, alpha(fill, opacity)).corner_radii(px(s / 2.0)));
                }
            },
        )
        .absolute()
        .top_0()
        .left_0()
        .size_full();

        let disc_fade = canvas(|_, _, _| {}, {
            let cache = self.disc_image.clone();
            move |bounds: Bounds<Pixels>, _, window: &mut Window, _| {
                let key = (diameter.round() as u32, 0);
                let Some(disc) = cache.borrow().get(&key).cloned() else {
                    return;
                };
                let (x0, y0) = (f32::from(bounds.origin.x), f32::from(bounds.origin.y));
                let _ = window.paint_image(
                    Bounds::new(
                        point(px(x0 + center.0 - radius), px(y0 + center.1 - radius)),
                        size(px(diameter), px(diameter)),
                    ),
                    Default::default(),
                    disc,
                    0,
                    false,
                );
            }
        })
        .absolute()
        .top_0()
        .left_0()
        .size_full();

        let logo_hover = self.hovers.ease("logo", 150);
        let cursor = if self.drag.is_some() {
            CursorStyle::ClosedHand
        } else if self.over_sun {
            CursorStyle::OpenHand
        } else {
            CursorStyle::Arrow
        };

        div()
            .id("scene")
            .relative()
            .flex_none()
            .w(px(width))
            .h_full()
            .overflow_hidden()
            .bg(scene::NIGHT)
            .cursor(cursor)
            .on_mouse_down(MouseButton::Left, cx.listener(Self::scene_mouse_down))
            .on_mouse_move(cx.listener(Self::scene_mouse_move))
            .on_mouse_up(MouseButton::Left, cx.listener(Self::scene_mouse_up))
            .on_mouse_up_out(MouseButton::Left, cx.listener(Self::scene_mouse_up))
            .child(layers)
            // The flat disc fades out under the rendered sun.
            .when(ready > 0.0 && ready < 1.0, |el| {
                el.child(div().absolute().size_full().opacity(1.0 - ready).child(disc_fade))
            })
            .child(
                div()
                    .absolute()
                    .top_0()
                    .left_0()
                    .size_full()
                    .flex()
                    .flex_col()
                    .py(px(44.))
                    .px(px(56.))
                    .child(
                        div()
                            .id("logo")
                            .flex()
                            .items_center()
                            .gap(px(12.))
                            .h(px(39.))
                            .cursor_pointer()
                            .opacity(lerp(1.0, 0.8, logo_hover))
                            .on_hover(hover_listener("logo", cx))
                            .child(icon("logo", 56.91, scene::BRAND).h(px(36.39)))
                            .child(
                                spaced("Taiyō", "PT Serif", 26.0, 700.0)
                                    .line_height(39.0)
                                    .spacing(-0.52)
                                    .color(scene::PAPER),
                            ),
                    )
                    .child(
                        div()
                            .flex_1()
                            .flex()
                            .flex_col()
                            .justify_center()
                            .child(self.render_citations(window, cx)),
                    ),
            )
    }

    fn render_citations(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let citation = &CITATIONS[self.citation];
        let quote_size = (f32::from(window.viewport_size().width) * 0.024).clamp(24.0, 34.0);
        let quote = format!("“{}”", citation.quote);
        let mut quote_font = font("Inter");
        quote_font.weight = FontWeight(700.0);
        quote_font.style = FontStyle::Italic;
        let width = match self.balanced {
            Some((index, size, width)) if index == self.citation && size == quote_size => width,
            _ => {
                let width = balanced_width(window, &quote, &quote_font, quote_size, 520.0);
                self.balanced = Some((self.citation, quote_size, width));
                width
            }
        };
        let scrim = self.scrim.clone();
        let progress = (self.elapsed_ms / CITATION_MS).clamp(0.0, 1.0);

        let dots = (0..CITATIONS.len())
            .map(|i| {
                let key: &'static str = ["dot0", "dot1", "dot2", "dot3", "dot4", "dot5"][i];
                let hover = self.hovers.get(key, 520, Easing::Bezier(anim::EASE_OUT));
                let w = self.pills[i].value();
                let active = i == self.citation;
                let bg = alpha(scene::PAPER, lerp(0.22, 0.42, hover));
                div()
                    .id(key)
                    .py(px(8.))
                    .px(px(4.))
                    .cursor_pointer()
                    .on_hover(hover_listener(key, cx))
                    .on_click(cx.listener(move |this, _, _, cx| {
                        this.select_citation(i);
                        cx.notify();
                    }))
                    .child(
                        div().w(px(w)).h(px(8.)).relative().child(
                            canvas(
                                |_, _, _| {},
                                move |b: Bounds<Pixels>, _, window: &mut Window, _| {
                                    let pill = paint::rounded_rect(b, 4.0);
                                    paint::fill_poly(window, &pill, bg);
                                    if active {
                                        // `ProgressFill`: a brand → gold pill sliding in from the left.
                                        let offset = f32::from(b.size.width) * (progress - 1.0);
                                        let fill_b = Bounds::new(point(b.origin.x + px(offset), b.origin.y), b.size);
                                        let fill = paint::rounded_rect(fill_b, 4.0);
                                        let shape = paint::clip_convex(&pill, &fill);
                                        paint::paint_gradient(
                                            window,
                                            &shape,
                                            Field::css_bounds(90.0, fill_b),
                                            &[(0.0, scene::BRAND), (1.0, scene::GOLD)],
                                        );
                                    }
                                },
                            )
                            .absolute()
                            .size_full(),
                        ),
                    )
            })
            .collect::<Vec<_>>();

        div()
            .id("citations")
            .relative()
            .max_w(px(520.))
            .on_hover(cx.listener(|this, hovered: &bool, _, cx| {
                this.citations_hovered = *hovered;
                cx.notify();
            }))
            .child(
                // `.scrim`: inset -3rem -4.5rem, radial, blur(10px).
                canvas(
                    |_, _, _| {},
                    move |b: Bounds<Pixels>, _, window: &mut Window, _| {
                        let (w, h) = (f32::from(b.size.width) + 144.0, f32::from(b.size.height) + 96.0);
                        let pad = 30.0;
                        let image = scrim
                            .borrow_mut()
                            .entry((w.round() as u32, h.round() as u32))
                            .or_insert_with(|| {
                                let dark = |a: f32| rgba(0x080402, a);
                                raster::radial(&RadialSpec {
                                    w,
                                    h,
                                    cx: w * 0.32,
                                    cy: h * 0.52,
                                    rx: w * 0.58,
                                    ry: h * 0.72,
                                    stops: vec![(0.0, dark(0.82)), (0.55, dark(0.45)), (0.78, dark(0.0))],
                                    blur: 10.0,
                                    pad,
                                    scale: 0.5,
                                })
                            })
                            .clone();
                        let _ = window.paint_image(
                            Bounds::new(
                                point(b.origin.x - px(72.0 + pad), b.origin.y - px(48.0 + pad)),
                                size(px(w + 2.0 * pad), px(h + 2.0 * pad)),
                            ),
                            Default::default(),
                            image,
                            0,
                            false,
                        );
                    },
                )
                .absolute()
                .size_full(),
            )
            .child(
                div()
                    .relative()
                    .min_h(px(188.))
                    .flex()
                    .flex_col()
                    .child(div().h(px(24.)).pt(px(3.)).flex().gap(px(3.)).children((0..5).map(|i| {
                        icon(
                            "star",
                            15.0,
                            if i < 1 {
                                Hsla::from(scene::GOLD)
                            } else {
                                alpha(scene::PAPER, 0.16)
                            },
                        )
                    })))
                    .child(
                        div()
                            .mt(px(16.))
                            .mb(px(22.))
                            .w(width)
                            .text_size(px(quote_size))
                            .line_height(px(quote_size * 1.22))
                            .font_family("Inter")
                            .font_weight(FontWeight(700.))
                            .italic()
                            .text_color(scene::PAPER)
                            .child(quote),
                    )
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(px(12.))
                            .child(
                                div()
                                    .relative()
                                    .size(px(42.))
                                    .flex_none()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .child(
                                        canvas(
                                            |_, _, _| {},
                                            |b: Bounds<Pixels>, _, window: &mut Window, _| {
                                                let circle = paint::rounded_rect(b, 21.0);
                                                paint::paint_gradient(
                                                    window,
                                                    &circle,
                                                    Field::css_bounds(140.0, b),
                                                    &[(0.0, scene::BRAND), (1.0, scene::GOLD)],
                                                );
                                            },
                                        )
                                        .absolute()
                                        .size_full(),
                                    )
                                    .child(
                                        div()
                                            .text_size(px(18.))
                                            .line_height(px(27.))
                                            .font_weight(FontWeight(700.))
                                            .text_color(scene::INK)
                                            .child(citation.who[..1].to_uppercase()),
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .child(
                                        div()
                                            .text_size(px(16.))
                                            .line_height(px(20.))
                                            .font_weight(FontWeight(700.))
                                            .child(citation.who),
                                    )
                                    .child(
                                        div()
                                            .text_size(px(13.))
                                            .line_height(px(16.25))
                                            .text_color(alpha(scene::PAPER, 0.55))
                                            .child(citation.role),
                                    ),
                            ),
                    ),
            )
            .child(
                div()
                    .relative()
                    .mt(px(18.))
                    .ml(px(-4.))
                    .flex()
                    .items_center()
                    .gap(px(2.))
                    .children(dots),
            )
    }
}

impl Render for AuthView {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        self.tick(window);
        let viewport = window.viewport_size();
        let (vw, vh) = (f32::from(viewport.width), f32::from(viewport.height));
        // `grid-template-columns: 1.05fr 0.95fr` from the `lg` breakpoint.
        let scene_w = if vw >= 1024.0 { (vw * 0.525).round() } else { 0.0 };
        // The form is cached: the scene animating beside it does not redo it.
        let form = AnyView::from(self.form.clone()).cached(StyleRefinement::default().w(px(vw - scene_w)).h_full());

        div()
            .size_full()
            .flex()
            .bg(scene::NIGHT)
            .text_color(scene::PAPER)
            .font_family("Inter")
            .text_size(px(16.))
            .line_height(px(24.))
            .when(scene_w > 0.0, |el| el.child(self.render_scene(scene_w, vh, window, cx)))
            .child(form)
    }
}

/// `text-wrap: balance`: the narrowest width that keeps the same line count.
fn balanced_width(window: &mut Window, text: &str, font: &Font, size: f32, max: f32) -> Pixels {
    let run = TextRun {
        len: text.len(),
        font: font.clone(),
        color: Hsla::default(),
        background_color: None,
        underline: None,
        strikethrough: None,
    };
    let lines = |w: f32| -> usize {
        window
            .text_system()
            .shape_text(
                SharedString::from(text.to_string()),
                px(size),
                std::slice::from_ref(&run),
                Some(px(w)),
                None,
            )
            .map(|ls| ls.iter().map(|l| l.wrap_boundaries().len() + 1).sum())
            .unwrap_or(1)
    };
    let target = lines(max);
    if target <= 1 {
        return px(max);
    }
    let (mut lo, mut hi) = (max / target as f32, max);
    for _ in 0..14 {
        let mid = (lo + hi) / 2.0;
        if lines(mid) > target {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    px(hi.ceil() + 1.0)
}
