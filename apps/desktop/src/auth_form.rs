//! The auth form panel: segmented control, social buttons, fields and the
//! sun button. A view of its own so the night scene beside it can animate
//! every frame without laying the form out again.

use std::time::Instant;

use gpui::{
    AnyElement, Context, Entity, EventEmitter, FocusHandle, Focusable, FontWeight, IntoElement, MouseButton,
    ParentElement, Render, SharedString, Styled, Window, div, linear_color_stop, linear_gradient, prelude::*, px,
};

use crate::api;
use crate::auth::{AuthEvent, Mode};
use crate::input::{Submit, Tab, TabPrev, TextInput};
use crate::text::spaced;
use crate::theme::{alpha, colors, scene};
use crate::ui::{self, Hovers, icon, lerp, picture};

pub struct AuthForm {
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
    opened: Instant,
    demo: Vec<(u64, String)>,
}

impl EventEmitter<AuthEvent> for AuthForm {}

impl Focusable for AuthForm {
    fn focus_handle(&self, _: &gpui::App) -> FocusHandle {
        self.focus.clone()
    }
}

impl AuthForm {
    pub fn new(last_used: Option<String>, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let name = cx.new(|cx| TextInput::new("Yuki Nagato", false, cx));
        let email = cx.new(|cx| TextInput::new("you@email.com", false, cx));
        let password = cx.new(|cx| TextInput::new("••••••••", true, cx));
        for input in [&name, &email, &password] {
            cx.observe(input, |_, _, cx| cx.notify()).detach();
        }
        let form = Self {
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
            opened: Instant::now(),
            demo: std::env::var("TAIYO_DEMO")
                .unwrap_or_default()
                .split(',')
                .filter_map(|step| {
                    let (action, at) = step.split_once('@')?;
                    Some((at.parse().ok()?, action.to_string()))
                })
                .collect(),
        };
        window.focus(&form.focus);
        form
    }

    /// `TAIYO_DEMO=action@ms,...` (signup, signin, login): scripted steps
    /// for debug captures. `login` signs in with a seeded dev account.
    fn run_demo(&mut self, window: &mut Window, cx: &mut Context<Self>) {
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
                "signup" => self.set_mode(Mode::SignUp, cx),
                "signin" => self.set_mode(Mode::SignIn, cx),
                "login" => {
                    self.email
                        .update(cx, |input, _| input.content = "member@gmail.com".into());
                    self.password
                        .update(cx, |input, _| input.content = "password123".into());
                    self.submit(window, cx);
                }
                _ => {}
            }
        }
        if !self.demo.is_empty() {
            window.request_animation_frame();
        }
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

impl Render for AuthForm {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        self.run_demo(window, cx);
        if self.hovers.animating() || self.submitting {
            window.request_animation_frame();
        }
        let vw = f32::from(window.viewport_size().width);
        let panel_px = (vw * 0.05).clamp(28.0, 76.0);
        div()
            .id("panel")
            .key_context("Auth")
            .track_focus(&self.focus)
            .on_action(cx.listener(|this, _: &Tab, window, cx| this.cycle_focus(1, window, cx)))
            .on_action(cx.listener(|this, _: &TabPrev, window, cx| this.cycle_focus(-1, window, cx)))
            .on_action(cx.listener(|this, _: &Submit, window, cx| this.submit(window, cx)))
            .size_full()
            .overflow_y_scroll()
            .bg(linear_gradient(
                180.0,
                linear_color_stop(scene::PANEL_TOP, 0.0),
                linear_color_stop(scene::PANEL_BOTTOM, 1.0),
            ))
            .text_color(scene::PAPER)
            .font_family("Inter")
            .text_size(px(16.))
            .line_height(px(24.))
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .py(px(32.))
            .px(px(panel_px))
            .child(self.render_form(window, cx))
    }
}
