//! `/auth/sign-in` and `/auth/sign-up`: the night scene with the plasma sun
//! on the left, the form on the right.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;
use std::time::{Duration, Instant};

use gpui::{
    AnyElement, Bounds, Context, CursorStyle, Entity, EventEmitter, FocusHandle, Focusable, Font, FontStyle,
    FontWeight, Hsla, IntoElement, MouseButton, MouseDownEvent, MouseMoveEvent, MouseUpEvent, ParentElement, Pixels,
    Render, RenderImage, SharedString, Styled, TextRun, Window, canvas, div, font, linear_color_stop, linear_gradient,
    point, prelude::*, px, size,
};

use crate::anim::{self, Easing, Tween};
use crate::api::{self, Session};
use crate::input::{Submit, Tab, TabPrev, TextInput};
use crate::paint::{self, Field};
use crate::raster::{self, RadialSpec};
use crate::sun::{self, FrameParams, Quat, SunWorker};
use crate::text::spaced;
use crate::theme::{alpha, colors, rgba, scene};
use crate::ui::{self, Hovers, icon, lerp, lerp_color, picture};

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
    mode: Mode,
    name: Entity<TextInput>,
    email: Entity<TextInput>,
    password: Entity<TextInput>,
    focus: FocusHandle,
    remember: bool,
    agree: bool,
    show_password: bool,
    submitting: bool,
    pressed: bool,
    error: Option<SharedString>,
    last_used: Option<String>,
    hovers: Hovers,

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

impl Focusable for AuthView {
    fn focus_handle(&self, _: &gpui::App) -> FocusHandle {
        self.focus.clone()
    }
}

impl AuthView {
    pub fn new(last_used: Option<String>, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let name = cx.new(|cx| TextInput::new("Yuki Nagato", false, cx));
        let email = cx.new(|cx| TextInput::new("you@email.com", false, cx));
        let password = cx.new(|cx| TextInput::new("••••••••", true, cx));
        for input in [&name, &email, &password] {
            cx.observe(input, |_, _, cx| cx.notify()).detach();
        }
        let quality = sun::Quality {
            beams: std::env::var("TAIYO_BEAMS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(0.5),
            sphere: 1.0,
        };
        let view = Self {
            mode: Mode::SignIn,
            name,
            email,
            password,
            focus: cx.focus_handle(),
            remember: true,
            agree: false,
            show_password: false,
            submitting: false,
            pressed: false,
            error: None,
            last_used,
            hovers: Hovers::default(),
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
        };
        window.focus(&view.focus);
        view
    }

    fn set_mode(&mut self, mode: Mode, cx: &mut Context<Self>) {
        if self.mode != mode {
            self.mode = mode;
            self.error = None;
            self.pressed = false;
            cx.notify();
        }
    }

    fn inputs(&self) -> Vec<Entity<TextInput>> {
        match self.mode {
            Mode::SignIn => vec![self.email.clone(), self.password.clone()],
            Mode::SignUp => vec![self.name.clone(), self.email.clone(), self.password.clone()],
        }
    }

    fn cycle_focus(&mut self, step: isize, window: &mut Window, cx: &mut Context<Self>) {
        let inputs = self.inputs();
        let current = inputs.iter().position(|i| i.read(cx).focus_handle.is_focused(window));
        let next = match current {
            Some(i) => (i as isize + step).rem_euclid(inputs.len() as isize) as usize,
            None => 0,
        };
        window.focus(&inputs[next].read(cx).focus_handle);
    }

    fn submit(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        if self.mode == Mode::SignUp || self.submitting {
            return;
        }
        let email = self.email.read(cx).content.trim().to_string();
        let password = self.password.read(cx).content.to_string();
        if !email.contains('@') {
            self.error = Some("Enter a valid email address".into());
            window.focus(&self.email.read(cx).focus_handle);
            cx.notify();
            return;
        }
        if password.is_empty() {
            self.error = Some("Enter your password".into());
            window.focus(&self.password.read(cx).focus_handle);
            cx.notify();
            return;
        }
        let remember = self.remember;
        self.submitting = true;
        self.error = None;
        cx.notify();
        let task = cx
            .background_executor()
            .spawn(async move { api::sign_in(&email, &password, remember) });
        cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.submitting = false;
                match result {
                    Ok(session) => cx.emit(AuthEvent::SignedIn(session)),
                    Err(err) => this.error = Some(err.to_string().into()),
                }
                cx.notify();
            })
            .ok();
        })
        .detach();
    }

    fn hover_listener(
        &self,
        key: &'static str,
        cx: &mut Context<Self>,
    ) -> impl Fn(&bool, &mut Window, &mut gpui::App) + 'static {
        cx.listener(move |this, hovered: &bool, _, cx| {
            this.hovers.set(key, *hovered);
            cx.notify();
        })
    }

    // ------------------------------------------------------------ ticking --

    fn tick(&mut self, window: &mut Window) {
        let now = Instant::now();
        if std::env::var("TAIYO_TRACE").is_ok() {
            eprintln!(
                "auth render dt={:?} viewport={:?}",
                now.duration_since(self.last_tick),
                window.viewport_size()
            );
        }
        let dt = now.duration_since(self.last_tick).as_secs_f32().clamp(0.0, 0.1);
        self.last_tick = now;

        // `TAIYO_DEMO=signup@ms`: scripted switches for debug captures.
        if let Ok(demo) = std::env::var("TAIYO_DEMO") {
            let elapsed = self.started.elapsed().as_millis() as u64;
            for step in demo.split(',') {
                if let Some((action, at)) = step.split_once('@')
                    && at.parse::<u64>().is_ok_and(|at| at <= elapsed)
                {
                    match action {
                        "signup" => self.mode = Mode::SignUp,
                        "signin" => self.mode = Mode::SignIn,
                        _ => {}
                    }
                }
            }
        }

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
                let skip = std::env::var("TAIYO_SKIP").unwrap_or_default();
                if !skip.contains("aurora") {
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
                        if skip.contains("sun") {
                            continue;
                        }
                        let _ = window.paint_image(
                            Bounds::new(point(px(x0 + rect.0), px(y0 + rect.1)), size(px(rect.2), px(rect.3))),
                            Default::default(),
                            image,
                            0,
                            false,
                        );
                    }
                }

                if std::env::var("TAIYO_TEST_IMAGE").is_ok() {
                    let mut bytes = Vec::new();
                    for i in 0..(60 * 20) {
                        let c: [u8; 4] = match (i % 60) / 20 {
                            0 => [0, 0, 255, 255],
                            1 => [32, 184, 254, 255],
                            _ => [255, 0, 0, 255],
                        };
                        bytes.extend_from_slice(&c);
                    }
                    let img = raster::bgra_image(60, 20, bytes);
                    let _ = window.paint_image(
                        Bounds::new(point(px(x0 + 600.0), px(y0 + 60.0)), size(px(120.0), px(40.0))),
                        Default::default(),
                        img,
                        0,
                        false,
                    );
                    window.paint_quad(gpui::fill(
                        Bounds::new(point(px(x0 + 600.0), px(y0 + 110.0)), size(px(40.0), px(40.0))),
                        crate::theme::rgb(0xfeb820),
                    ));
                }
                // `.vignette`
                let night = scene::NIGHT;
                let veil = |a: f32| rgba(0x120a07, a);
                if std::env::var("TAIYO_NO_VIGNETTE").is_err() {
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
                            .on_hover(self.hover_listener("logo", cx))
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
        let width = balanced_width(window, &quote, &quote_font, quote_size, 520.0);
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
                    .on_hover(self.hover_listener(key, cx))
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
                                        let shape = clip_convex(&pill, &fill);
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
                        if std::env::var("TAIYO_SKIP").unwrap_or_default().contains("scrim") {
                            return;
                        }
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

    // --------------------------------------------------------------- form --

    fn render_tabs(&mut self, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let tab = |this: &mut Self, mode: Mode, label: &'static str, key: &'static str, cx: &mut Context<Self>| {
            let hover = this.hovers.ease(key, 150);
            let active = this.mode == mode;
            div()
                .id(key)
                .px(px(20.))
                .py(px(8.))
                .rounded_full()
                .text_size(px(14.))
                .line_height(px(21.))
                .font_weight(FontWeight(700.))
                .cursor_pointer()
                .when(active, |el| el.bg(scene::PAPER).text_color(scene::PANEL_TOP))
                .when(!active, |el| el.text_color(alpha(scene::PAPER, lerp(0.7, 1.0, hover))))
                .on_hover(this.hover_listener(key, cx))
                .on_click(cx.listener(move |this, _, _, cx| this.set_mode(mode, cx)))
                .child(label)
        };
        div().flex().child(
            div()
                .flex()
                .p(px(4.))
                .gap(px(4.))
                .rounded_full()
                .border_1()
                .border_color(alpha(scene::PAPER, 0.08))
                .bg(alpha(scene::PAPER, 0.06))
                .child(tab(self, Mode::SignUp, "Sign up", "tab-up", cx))
                .child(tab(self, Mode::SignIn, "Sign in", "tab-in", cx)),
        )
    }

    fn last_used_badge(&self, method: &str) -> Option<AnyElement> {
        (self.last_used.as_deref() == Some(method)).then(|| {
            div()
                .absolute()
                .right(px(12.))
                .top(px(-9.))
                .px(px(8.))
                .py(px(2.))
                .rounded_full()
                .border_1()
                .border_color(alpha(scene::GOLD, 0.55))
                .bg(scene::NIGHT_RAISED)
                .shadow(vec![ui::shadow(0.0, 2.0, 10.0, 0.0, alpha(scene::NIGHT, 0.6))])
                .child(
                    spaced("Last used", "Inter", 11.0, 800.0)
                        .line_height(15.4)
                        .spacing(0.22)
                        .color(scene::GOLD_LIGHT),
                )
                .into_any_element()
        })
    }

    fn social_button(
        &mut self,
        key: &'static str,
        logo: &'static str,
        label: &'static str,
        cx: &mut Context<Self>,
    ) -> impl IntoElement + use<> {
        let hover = self.hovers.instant(key) as u8 as f32;
        div()
            .relative()
            .flex_1()
            .child(
                ui::outline_button(key, hover)
                    .h(px(48.))
                    .gap(px(12.))
                    .text_size(px(18.))
                    .line_height(px(27.))
                    .font_weight(FontWeight(500.))
                    .on_hover(self.hover_listener(key, cx))
                    .child(div().opacity(0.8).child(picture(logo, 20.0, 20.0)))
                    .child(label),
            )
            .children(self.last_used_badge(key))
    }

    fn field(
        &mut self,
        label: &'static str,
        input: &Entity<TextInput>,
        start_icon: &'static str,
        password: bool,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> impl IntoElement + use<> {
        let focused = input.read(cx).focus_handle.is_focused(window);
        let eye_hover = self.hovers.instant("eye") as u8 as f32;
        let muted = alpha(colors::MUTED_FOREGROUND, 0.72);
        div()
            .flex()
            .flex_col()
            .gap(px(8.))
            .child(
                div()
                    .text_size(px(14.))
                    .line_height(px(16.))
                    .font_weight(FontWeight(500.))
                    .text_color(colors::FOREGROUND)
                    .child(label),
            )
            .child(
                ui::field_shell(focused)
                    .child(
                        div()
                            .w(px(48.))
                            .flex_none()
                            .flex()
                            .justify_center()
                            .child(icon(start_icon, 20.0, muted)),
                    )
                    .child(div().flex_1().h(px(46.)).child(input.clone()))
                    .when(password, |el| {
                        el.child(
                            div().w(px(48.)).flex_none().flex().justify_center().child(
                                div()
                                    .id("eye")
                                    .size(px(28.))
                                    .rounded_full()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .cursor_pointer()
                                    .bg(ui::ghost_bg(eye_hover))
                                    .on_hover(self.hover_listener("eye", cx))
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.show_password = !this.show_password;
                                        let masked = !this.show_password;
                                        this.password.update(cx, |input, cx| {
                                            input.masked = masked;
                                            cx.notify();
                                        });
                                        cx.notify();
                                    }))
                                    .child(div().opacity(0.8).child(icon(
                                        if self.show_password { "eye-off" } else { "eye" },
                                        20.0,
                                        muted,
                                    ))),
                            ),
                        )
                    }),
            )
    }

    fn link(&mut self, key: &'static str, label: &'static str, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let hovered = self.hovers.instant(key);
        div()
            .id(key)
            .flex_none()
            .text_color(scene::GOLD_LIGHT)
            .font_weight(FontWeight(700.))
            .cursor_pointer()
            .when(hovered, |el| el.underline())
            .on_hover(self.hover_listener(key, cx))
            .child(label)
    }

    fn render_form(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement + use<> {
        let sign_in = self.mode == Mode::SignIn;
        let (title, subtitle, divider) = if sign_in {
            (
                "Welcome back",
                "Pick up right where you left off.",
                "or sign in with email",
            )
        } else {
            (
                "Step into the light",
                "Create your free account — your library is waiting.",
                "or sign up with email",
            )
        };
        let title_size = (f32::from(window.viewport_size().width) * 0.034).clamp(30.0, 42.0);
        let submit_hover = self.hovers.ease("submit", 200);
        let disabled = !sign_in;
        let name = self.name.clone();
        let email = self.email.clone();
        let password = self.password.clone();

        let checkbox_row = if sign_in {
            let remember = self.remember;
            div()
                .flex()
                .items_center()
                .justify_between()
                .gap(px(12.))
                .h(px(21.))
                .child(
                    div()
                        .id("remember")
                        .flex()
                        .items_center()
                        .gap(px(8.))
                        .cursor_pointer()
                        .on_click(cx.listener(|this, _, _, cx| {
                            this.remember = !this.remember;
                            cx.notify();
                        }))
                        .child(ui::checkbox(remember))
                        .child(
                            div()
                                .text_size(px(14.))
                                .line_height(px(16.))
                                .font_weight(FontWeight(500.))
                                .child("Remember me"),
                        ),
                )
                .child(
                    div()
                        .text_size(px(14.))
                        .line_height(px(21.))
                        .child(self.link("forgot", "Forgot password?", cx)),
                )
                .into_any_element()
        } else {
            let agree = self.agree;
            div()
                .flex()
                .items_center()
                .gap(px(8.))
                .text_size(px(14.))
                .line_height(px(21.))
                .font_weight(FontWeight(500.))
                .child(
                    div()
                        .id("agree")
                        .flex()
                        .items_center()
                        .gap(px(8.))
                        .cursor_pointer()
                        .on_click(cx.listener(|this, _, _, cx| {
                            this.agree = !this.agree;
                            cx.notify();
                        }))
                        .child(ui::checkbox(agree))
                        .child("I agree to the"),
                )
                .child(self.link("terms", "Terms", cx))
                .child("and")
                .child(self.link("privacy", "Privacy Policy", cx))
                .into_any_element()
        };

        let submit_label = if sign_in { "Sign in" } else { "Create account" };
        let submitting = self.submitting;
        let pressed = self.pressed && !disabled;
        let submit = div()
            .relative()
            .mt(px(8.))
            .child(
                div()
                    .id("submit")
                    .relative()
                    .h(px(48.))
                    .w_full()
                    .flex()
                    .items_center()
                    .justify_center()
                    .when(!disabled, |el| el.cursor_pointer())
                    .on_hover(self.hover_listener("submit", cx))
                    .on_mouse_down(
                        MouseButton::Left,
                        cx.listener(|this, _, _, cx| {
                            this.pressed = true;
                            cx.notify();
                        }),
                    )
                    .on_mouse_up(
                        MouseButton::Left,
                        cx.listener(|this, _, window, cx| {
                            this.pressed = false;
                            this.submit(window, cx);
                        }),
                    )
                    .on_mouse_up_out(
                        MouseButton::Left,
                        cx.listener(|this, _, _, cx| {
                            this.pressed = false;
                            cx.notify();
                        }),
                    )
                    .child(ui::sun_button(
                        if disabled { 0.0 } else { submit_hover },
                        pressed,
                        disabled || submitting,
                    ))
                    .child(
                        div()
                            .relative()
                            .text_size(px(16.))
                            .line_height(px(24.))
                            .font_weight(FontWeight(800.))
                            .text_color(alpha(scene::INK, if disabled { 0.7 } else { 1.0 }))
                            .when(submitting, |el| el.opacity(0.0))
                            .child(submit_label),
                    )
                    .when(submitting, |el| {
                        el.child(
                            div()
                                .absolute()
                                .size_full()
                                .flex()
                                .items_center()
                                .justify_center()
                                .child(ui::spinner(16.0, scene::INK)),
                        )
                    }),
            )
            .children(sign_in.then(|| self.last_used_badge("email")).flatten());

        let mut fields = div().flex().flex_col().gap(px(16.));
        if !sign_in {
            fields = fields.child(self.field("Display name", &name, "user-account", false, window, cx));
        }
        fields = fields
            .child(self.field("Email", &email, "mail", false, window, cx))
            .child(self.field("Password", &password, "lock", true, window, cx))
            .child(checkbox_row);
        if !sign_in {
            // The Turnstile captcha's slot; there is no captcha to show here.
            fields = fields.child(div().h(px(58.)));
        }
        fields = fields.child(submit);

        let (prompt, switch, target) = if sign_in {
            ("New to Taiyō?", "Create an account", Mode::SignUp)
        } else {
            ("Already reading with us?", "Sign in", Mode::SignIn)
        };
        let switch_link = self.link("switch", switch, cx);

        div()
            .w_full()
            .max_w(px(430.))
            .flex()
            .flex_col()
            .child(self.render_tabs(cx))
            .child(
                div().mt(px(28.)).child(
                    spaced(title, "PT Serif", title_size, 700.0)
                        .wrap(3)
                        .line_height(title_size * 1.05)
                        .spacing(-0.02 * title_size)
                        .color(scene::PAPER),
                ),
            )
            .child(
                div()
                    .mt(px(8.))
                    .mb(px(24.))
                    .text_size(px(16.))
                    .line_height(px(24.))
                    .text_color(alpha(scene::PAPER, 0.6))
                    .child(subtitle),
            )
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(20.))
                    .children(self.error.clone().map(ui::error_alert))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(20.))
                            .child(
                                div()
                                    .flex()
                                    .gap(px(12.))
                                    .child(self.social_button("google", "google", "Google", cx))
                                    .child(self.social_button("discord", "discord", "Discord", cx)),
                            )
                            .child(
                                div()
                                    .flex()
                                    .items_center()
                                    .gap(px(14.))
                                    .child(div().flex_1().h(px(1.)).bg(alpha(scene::PAPER, 0.1)))
                                    .child(
                                        spaced(divider, "Inter", 12.0, 700.0)
                                            .uppercase()
                                            .line_height(18.0)
                                            .spacing(0.96)
                                            .color(alpha(scene::PAPER, 0.4)),
                                    )
                                    .child(div().flex_1().h(px(1.)).bg(alpha(scene::PAPER, 0.1))),
                            ),
                    )
                    .child(fields),
            )
            .child(
                div()
                    .id("switch-row")
                    .mt(px(24.))
                    .flex()
                    .justify_center()
                    .gap(px(4.))
                    .text_size(px(14.))
                    .line_height(px(21.))
                    .text_color(alpha(scene::PAPER, 0.55))
                    .child(prompt)
                    .child(
                        div()
                            .id("switch-target")
                            .on_click(cx.listener(move |this, _, _, cx| this.set_mode(target, cx)))
                            .child(switch_link),
                    ),
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
        let panel_px = (vw * 0.05).clamp(28.0, 76.0);

        div()
            .key_context("Auth")
            .track_focus(&self.focus)
            .on_action(cx.listener(|this, _: &Tab, window, cx| this.cycle_focus(1, window, cx)))
            .on_action(cx.listener(|this, _: &TabPrev, window, cx| this.cycle_focus(-1, window, cx)))
            .on_action(cx.listener(|this, _: &Submit, window, cx| this.submit(window, cx)))
            .size_full()
            .flex()
            .bg(scene::NIGHT)
            .text_color(scene::PAPER)
            .font_family("Inter")
            .text_size(px(16.))
            .line_height(px(24.))
            .when(scene_w > 0.0, |el| el.child(self.render_scene(scene_w, vh, window, cx)))
            .child(
                div()
                    .id("panel")
                    .flex_1()
                    .h_full()
                    .overflow_y_scroll()
                    .bg(linear_gradient(
                        180.0,
                        linear_color_stop(scene::PANEL_TOP, 0.0),
                        linear_color_stop(scene::PANEL_BOTTOM, 1.0),
                    ))
                    .flex()
                    .flex_col()
                    .items_center()
                    .justify_center()
                    .py(px(32.))
                    .px(px(panel_px))
                    .child(self.render_form(window, cx)),
            )
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

/// The part of convex `subject` inside convex `clipper` (both clockwise).
fn clip_convex(subject: &paint::Poly, clipper: &paint::Poly) -> paint::Poly {
    let mut out = subject.clone();
    for i in 0..clipper.len() {
        let a = clipper[i];
        let b = clipper[(i + 1) % clipper.len()];
        // Keep the side of edge a→b the polygon's interior is on.
        let (nx, ny) = (-(b.1 - a.1), b.0 - a.0);
        out = paint::clip(&out, nx, ny, -(nx * a.0 + ny * a.1));
        if out.is_empty() {
            break;
        }
    }
    out
}
