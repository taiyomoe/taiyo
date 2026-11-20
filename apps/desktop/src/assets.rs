//! Fonts and icons, embedded in the binary.

use std::borrow::Cow;

use anyhow::anyhow;
use gpui::{App, AssetSource, Result, SharedString};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "assets"]
#[include = "fonts/*.ttf"]
#[include = "icons/*.svg"]
#[include = "*.json"]
pub struct Assets;

impl AssetSource for Assets {
    fn load(&self, path: &str) -> Result<Option<Cow<'static, [u8]>>> {
        Self::get(path)
            .map(|file| Some(file.data))
            .ok_or_else(|| anyhow!("missing asset {path}"))
    }

    fn list(&self, path: &str) -> Result<Vec<SharedString>> {
        Ok(Self::iter()
            .filter(|p| p.starts_with(path))
            .map(SharedString::from)
            .collect())
    }
}

pub fn load_fonts(cx: &mut App) {
    let fonts = Assets::iter()
        .filter(|p| p.starts_with("fonts/"))
        .filter_map(|p| Assets::get(&p).map(|f| f.data))
        .collect::<Vec<_>>();
    cx.text_system().add_fonts(fonts).expect("register the bundled fonts");
}
