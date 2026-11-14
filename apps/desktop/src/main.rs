mod anim;
mod api;
mod assets;
mod auth;
mod home;
mod images;
mod input;
mod paint;
mod platform;
mod raster;
mod skeleton;
mod snapshot;
mod sun;
mod sun_gpu;
mod text;
mod theme;
mod ui;

use std::time::Instant;

use gpui::{
    App, AppContext, Application, Bounds, Context, Entity, IntoElement, Render, TitlebarOptions, Window, WindowBounds,
    WindowOptions, div, prelude::*, px, size,
};

use crate::auth::{AuthEvent, AuthView};
use crate::home::{HomeEvent, HomeView};

enum Screen {
    Auth(Entity<AuthView>),
    Home(Entity<HomeView>),
}

struct Root {
    screen: Screen,
}

impl Root {
    fn new(session: Option<api::Session>, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let screen = match session {
            Some(session) => Self::home(session, window, cx),
            None => Self::auth(window, cx),
        };
        Self { screen }
    }

    fn auth(window: &mut Window, cx: &mut Context<Self>) -> Screen {
        let last_used = api::load_state().last_login_method;
        let view = cx.new(|cx| AuthView::new(last_used, window, cx));
        cx.subscribe_in(&view, window, |this, _, event: &AuthEvent, window, cx| match event {
            AuthEvent::SignedIn(session) => {
                api::save_state(&api::Stored {
                    token: Some(session.token.clone()),
                    last_login_method: Some("email".into()),
                });
                this.screen = Self::home(session.clone(), window, cx);
                cx.notify();
            }
        })
        .detach();
        Screen::Auth(view)
    }

    fn home(session: api::Session, window: &mut Window, cx: &mut Context<Self>) -> Screen {
        let view = cx.new(|cx| HomeView::new(session, window, cx));
        cx.subscribe_in(&view, window, |this, _, event: &HomeEvent, window, cx| match event {
            HomeEvent::SignedOut => {
                let mut state = api::load_state();
                state.token = None;
                api::save_state(&state);
                this.screen = Self::auth(window, cx);
                cx.notify();
            }
        })
        .detach();
        Screen::Home(view)
    }
}

impl Render for Root {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size_full().child(match &self.screen {
            Screen::Auth(view) => view.clone().into_any_element(),
            Screen::Home(view) => view.clone().into_any_element(),
        })
    }
}

fn render_sun_png(path: &str) {
    let layout = sun::Layout {
        width: 756.0,
        height: 900.0,
        center: (378.0, 594.0 + 347.75),
        radius: 347.75,
    };
    let params = sun::FrameParams {
        layout,
        time: 12.0,
        breath: 0.6,
        spin: sun::Quat::axis_angle([0.0, 1.0, 0.0], 0.6).mul(sun::Quat::axis_angle([0.0, 0.0, 1.0], 0.12)),
    };
    let quality = sun::Quality {
        beams: 1.0,
        sphere: 2.0,
    };
    let mut gpu = sun_gpu::GpuSun::new().expect("a Metal device");
    for _ in 0..3 {
        let started = Instant::now();
        let _ = gpu.render(&params, quality);
        eprintln!("gpu frame: {:?}", started.elapsed());
    }
    let started = Instant::now();
    let _ = sun::render(
        &params,
        sun::Quality {
            beams: 0.5,
            sphere: 1.0,
        },
    );
    eprintln!("cpu frame: {:?}", started.elapsed());
    let (beams, sphere) = gpu.render(&params, quality);
    let (w, h) = (1512u32, 1800u32);
    let mut out = image::RgbaImage::from_pixel(w, h, image::Rgba([18, 10, 7, 255]));
    for layer in [&beams, &sphere] {
        let sx = layer.width as f32 / layer.rect.2.max(1.0);
        for y in 0..h {
            for x in 0..w {
                let (cx, cy) = (x as f32 / 2.0, y as f32 / 2.0);
                let lx = ((cx - layer.rect.0) * sx) as i64;
                let ly = ((cy - layer.rect.1) * sx) as i64;
                if lx < 0 || ly < 0 || lx >= layer.width as i64 || ly >= layer.height as i64 {
                    continue;
                }
                let i = ((ly as u32 * layer.width + lx as u32) * 4) as usize;
                let a = layer.bgra[i + 3] as f32 / 255.0;
                let p = out.get_pixel_mut(x, y);
                for (c, src) in [(0, 2), (1, 1), (2, 0)] {
                    p[c] = (layer.bgra[i + src] as f32 * a + p[c] as f32 * (1.0 - a)) as u8;
                }
            }
        }
    }
    out.save(path).unwrap();
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if let Some(i) = args.iter().position(|a| a == "--sun-png") {
        render_sun_png(&args[i + 1]);
        return;
    }
    if args.iter().any(|a| a == "--sign-out") {
        let mut state = api::load_state();
        state.token = None;
        api::save_state(&state);
    }
    // A stored session opens straight on the home page, like the web cookie.
    let token = std::env::var("TAIYO_SESSION_TOKEN")
        .ok()
        .or_else(|| api::load_state().token);
    let session = token.and_then(|t| api::fetch_session(&t).ok().flatten());

    Application::new().with_assets(assets::Assets).run(move |cx: &mut App| {
        assets::load_fonts(cx);
        input::bind_keys(cx);
        cx.bind_keys([gpui::KeyBinding::new("cmd-q", Quit, None)]);
        cx.on_action(|_: &Quit, cx| cx.quit());
        let bounds = Bounds::centered(None, size(px(1440.), px(900.)), cx);
        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(bounds)),
                titlebar: Some(TitlebarOptions {
                    title: Some("Taiyō".into()),
                    ..Default::default()
                }),
                window_min_size: Some(size(px(800.), px(600.))),
                app_id: Some("moe.taiyo.desktop".into()),
                ..Default::default()
            },
            |window, cx| {
                platform::use_dark_appearance(window);
                snapshot::schedule(window, cx);
                cx.new(|cx| Root::new(session, window, cx))
            },
        )
        .expect("open the main window");
        cx.activate(true);
    });
}

gpui::actions!(app, [Quit]);
