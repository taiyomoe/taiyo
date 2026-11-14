//! Remote cover art: downloaded and decoded off the UI thread, resized once
//! per display size (GPUI samples textures without mipmaps), and faded in the
//! way `useImageLoaded` does on the web.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Instant;

use gpui::RenderImage;
use image::DynamicImage;

use crate::{api, raster};

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
                    let image = api::download_image(&url)?;
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
