//! Remote cover art: downloaded and decoded off the UI thread, resized once
//! per display size (GPUI samples textures without mipmaps), and faded in the
//! way `useImageLoaded` does on the web.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Instant;

use gpui::{AnyElement, Bounds, Context, Pixels, RenderImage, Window, canvas, div, prelude::*, px};
use image::DynamicImage;

use crate::theme::{colors, rgb};
use crate::ui::icon;
use crate::{anim, api, raster, skeleton};

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq)]
pub enum Variant {
    /// Featured and grid covers: 176×264 CSS px at 2×.
    Large,
    /// List row covers: 27×40.5 CSS px at 2×.
    Small,
    /// The featured slide's blurred backdrop, for a slide this wide.
    Backdrop(u32),
}

pub enum Slot {
    Loading,
    Ready { image: Arc<RenderImage>, at: Instant },
    Failed,
}

#[derive(Default)]
pub struct Images {
    slots: HashMap<(String, Variant), Slot>,
    decoded: Arc<Mutex<HashMap<String, Arc<DynamicImage>>>>,
}

impl Images {
    pub fn get(&self, url: &str, variant: Variant) -> Option<&Slot> {
        self.slots.get(&(url.to_string(), variant))
    }

    /// Marks the image as loading and returns the job to run in the
    /// background, or `None` when it is already known.
    pub fn request(
        &mut self,
        url: &str,
        variant: Variant,
    ) -> Option<impl FnOnce() -> anyhow::Result<Arc<RenderImage>> + Send + 'static> {
        let key = (url.to_string(), variant);
        if self.slots.contains_key(&key) {
            return None;
        }
        self.slots.insert(key, Slot::Loading);
        let decoded = self.decoded.clone();
        let url = url.to_string();
        Some(move || {
            let cached = decoded.lock().unwrap().get(&url).cloned();
            let image = match cached {
                Some(image) => image,
                None => {
                    // Covers arrive at print size (2000+ px); keep a copy no
                    // bigger than the largest place they are drawn.
                    let full = api::download_image(&url)?;
                    let image = if full.width() > 800 || full.height() > 1200 {
                        Arc::new(full.thumbnail(800, 1200))
                    } else {
                        full
                    };
                    decoded.lock().unwrap().insert(url.clone(), image.clone());
                    image
                }
            };
            Ok(match variant {
                Variant::Large => raster::rgba_to_render_image(raster::cover_fit(&image, 352, 528, 0.5)),
                Variant::Small => raster::rgba_to_render_image(raster::cover_fit(&image, 54, 81, 0.5)),
                Variant::Backdrop(width) => {
                    let w = width as f32;
                    raster::backdrop(&image, w, 344.0 * 1.5, 0.5, 4.0)
                }
            })
        })
    }

    /// Starts loading `url` at `variant` unless it is known; notifies when done.
    pub fn want(&mut self, url: &str, variant: Variant, cx: &mut Context<Self>) {
        let Some(job) = self.request(url, variant) else {
            return;
        };
        let task = cx.background_executor().spawn(async move { job() });
        let url = url.to_string();
        cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.finish(&url, variant, result);
                cx.notify();
            })
            .ok();
        })
        .detach();
    }

    pub fn finish(&mut self, url: &str, variant: Variant, result: anyhow::Result<Arc<RenderImage>>) {
        let slot = match result {
            Ok(image) => Slot::Ready {
                image,
                at: Instant::now(),
            },
            Err(err) => {
                eprintln!("image {url} ({variant:?}) failed: {err:#}");
                Slot::Failed
            }
        };
        self.slots.insert((url.to_string(), variant), slot);
    }

    /// Whether a fade-in is still running.
    pub fn fading(&self) -> bool {
        self.slots
            .values()
            .any(|s| matches!(s, Slot::Ready { at, .. } if at.elapsed().as_millis() < 220))
    }
}

/// `<Cover>`: a skeleton until the art arrives, then a 200ms fade-in.
pub fn cover(images: &Images, url: Option<&str>, variant: Variant, radius: f32) -> AnyElement {
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
    match images.get(url, variant) {
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
