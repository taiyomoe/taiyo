//! Colours of the web app's dark theme, resolved to sRGB.
//!
//! Every value mirrors a token from `@taiyomoe/ui/styles/tokens.stylex` (dark
//! theme) or `apps/web/src/components/scene/scene.stylex`, measured from the
//! computed styles Chrome reports for the running web app.

use gpui::{Hsla, Rgba};

pub const fn rgb(hex: u32) -> Rgba {
    rgba(hex, 1.0)
}

pub const fn rgba(hex: u32, a: f32) -> Rgba {
    Rgba {
        r: ((hex >> 16) & 0xff) as f32 / 255.0,
        g: ((hex >> 8) & 0xff) as f32 / 255.0,
        b: (hex & 0xff) as f32 / 255.0,
        a,
    }
}

/// `color-mix(in srgb, color X%, transparent)`.
pub fn alpha(color: Rgba, a: f32) -> Hsla {
    Rgba {
        a: color.a * a,
        ..color
    }
    .into()
}

/// Linear blend in sRGB, like `color-mix(in srgb, a (1-t), b t)`.
pub fn mix(a: Rgba, b: Rgba, t: f32) -> Rgba {
    Rgba {
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t,
        a: a.a + (b.a - a.a) * t,
    }
}

pub mod scene {
    use super::*;

    pub const NIGHT: Rgba = rgb(0x120a07);
    pub const NIGHT_RAISED: Rgba = rgb(0x1a0d08);
    pub const PAPER: Rgba = rgb(0xfffcf8);
    pub const INK: Rgba = rgb(0x2a1208);
    pub const BRAND: Rgba = rgb(0xf2452d);
    pub const EMBER: Rgba = rgb(0xfb6e54);
    pub const GOLD: Rgba = rgb(0xffb820);
    pub const GOLD_LIGHT: Rgba = rgb(0xffc94d);
    pub const ORANGE: Rgba = rgb(0xff8a3d);
    pub const PANEL_TOP: Rgba = rgb(0x1b0f0a);
    pub const PANEL_BOTTOM: Rgba = rgb(0x150c08);
}

pub mod colors {
    use super::*;

    pub const BACKGROUND: Rgba = rgb(0x0c0c0c);
    pub const FOREGROUND: Rgba = rgb(0xf5f5f5);
    pub const MUTED_FOREGROUND: Rgba = rgb(0x8c8c8c);
    pub const CARD: Rgba = rgb(0x1e1e1e);
    pub const FIELD: Rgba = rgb(0x1b1b1b);
    pub const CHIP_HOVER: Rgba = rgb(0x252525);
    pub const WELL: Rgba = rgb(0x191919);
    pub const SIDEBAR: Rgba = rgb(0x0f0f0f);
    pub const SIDEBAR_FOREGROUND: Rgba = rgb(0xb0b0b0);
    pub const KEYCAP: Rgba = rgb(0x313131);
    pub const KEYCAP_BORDER: Rgba = rgb(0x4f4f4f);
    pub const PRIMARY: Rgba = rgb(0xf2452d);
    pub const WHITE: Rgba = rgb(0xffffff);
    pub const BLACK: Rgba = rgb(0x000000);
    pub const DESTRUCTIVE: Rgba = rgb(0xf5524f);

    /// `rgb(255 255 255 / X)` overlays: borders, accents, skeletons.
    pub fn white(a: f32) -> Hsla {
        alpha(WHITE, a)
    }

    pub fn black(a: f32) -> Hsla {
        alpha(BLACK, a)
    }

    pub fn foreground(a: f32) -> Hsla {
        alpha(FOREGROUND, a)
    }
}
