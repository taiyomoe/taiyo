//! CPU-side images for what GPUI cannot paint itself: radial gradients,
//! `filter: blur()`, and the decoded, resized, blurred cover art.

use std::sync::Arc;

use gpui::{RenderImage, Rgba};
use image::{DynamicImage, Frame, ImageBuffer, RgbaImage, imageops::FilterType};
use smallvec::SmallVec;

/// Premultiplied RGBA in linear [0, 1] floats, the working format.
pub struct Canvas {
    pub width: usize,
    pub height: usize,
    pub px: Vec<[f32; 4]>,
}

impl Canvas {
    pub fn new(width: usize, height: usize) -> Self {
        Self {
            width,
            height,
            px: vec![[0.0; 4]; width * height],
        }
    }

    /// Separable gaussian, approximated with three box passes per axis.
    pub fn blur(&mut self, sigma: f32) {
        if sigma < 0.3 {
            return;
        }
        for radius in box_radii(sigma) {
            self.box_pass(radius, true);
            self.box_pass(radius, false);
        }
    }

    fn box_pass(&mut self, radius: usize, horizontal: bool) {
        let (len, lines) = if horizontal {
            (self.width, self.height)
        } else {
            (self.height, self.width)
        };
        let idx = |line: usize, i: usize| {
            if horizontal {
                line * self.width + i
            } else {
                i * self.width + line
            }
        };
        let mut out = self.px.clone();
        let window = (2 * radius + 1) as f32;
        for line in 0..lines {
            let mut acc = [0.0f32; 4];
            let get = |i: isize| -> [f32; 4] {
                if i < 0 || i >= len as isize {
                    [0.0; 4]
                } else {
                    self.px[idx(line, i as usize)]
                }
            };
            for i in -(radius as isize)..=(radius as isize) {
                let p = get(i);
                for c in 0..4 {
                    acc[c] += p[c];
                }
            }
            for i in 0..len {
                out[idx(line, i)] = acc.map(|a| a / window);
                let add = get(i as isize + radius as isize + 1);
                let sub = get(i as isize - radius as isize);
                for c in 0..4 {
                    acc[c] += add[c] - sub[c];
                }
            }
        }
        self.px = out;
    }

    pub fn into_render_image(self) -> Arc<RenderImage> {
        let mut bytes = Vec::with_capacity(self.width * self.height * 4);
        for p in &self.px {
            let a = p[3].clamp(0.0, 1.0);
            let un = |c: f32| if a > 0.0 { (c / a).clamp(0.0, 1.0) } else { 0.0 };
            bytes.extend_from_slice(&[
                (un(p[2]) * 255.0 + 0.5) as u8,
                (un(p[1]) * 255.0 + 0.5) as u8,
                (un(p[0]) * 255.0 + 0.5) as u8,
                (a * 255.0 + 0.5) as u8,
            ]);
        }
        bgra_image(self.width as u32, self.height as u32, bytes)
    }
}

/// Box sizes whose three passes approximate a gaussian of `sigma`.
fn box_radii(sigma: f32) -> [usize; 3] {
    let n = 3.0;
    let ideal = ((12.0 * sigma * sigma / n) + 1.0).sqrt();
    let mut wl = ideal.floor() as i32;
    if wl % 2 == 0 {
        wl -= 1;
    }
    let wu = wl + 2;
    let m_ideal =
        (12.0 * sigma * sigma - n * (wl * wl) as f32 - 4.0 * n * wl as f32 - 3.0 * n) / (-4.0 * wl as f32 - 4.0);
    let m = m_ideal.round() as i32;
    let mut out = [0usize; 3];
    for (i, slot) in out.iter_mut().enumerate() {
        let w = if (i as i32) < m { wl } else { wu };
        *slot = ((w - 1) / 2).max(0) as usize;
    }
    out
}

pub fn bgra_image(width: u32, height: u32, bgra: Vec<u8>) -> Arc<RenderImage> {
    let buffer: RgbaImage = ImageBuffer::from_raw(width, height, bgra).expect("buffer size matches");
    let frames: SmallVec<[Frame; 1]> = SmallVec::from_elem(Frame::new(buffer), 1);
    Arc::new(RenderImage::new(frames))
}

pub fn rgba_to_render_image(image: RgbaImage) -> Arc<RenderImage> {
    let (w, h) = image.dimensions();
    let mut raw = image.into_raw();
    for px in raw.chunks_exact_mut(4) {
        px.swap(0, 2);
    }
    bgra_image(w, h, raw)
}

fn premul(c: Rgba) -> [f32; 4] {
    [c.r * c.a, c.g * c.a, c.b * c.a, c.a]
}

fn lerp4(a: [f32; 4], b: [f32; 4], t: f32) -> [f32; 4] {
    [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
        a[3] + (b[3] - a[3]) * t,
    ]
}

fn sample_stops(stops: &[(f32, Rgba)], t: f32) -> [f32; 4] {
    let first = stops[0];
    if t <= first.0 {
        return premul(first.1);
    }
    for pair in stops.windows(2) {
        let (t0, c0) = pair[0];
        let (t1, c1) = pair[1];
        if t <= t1 {
            let f = if t1 > t0 { (t - t0) / (t1 - t0) } else { 1.0 };
            return lerp4(premul(c0), premul(c1), f);
        }
    }
    premul(stops[stops.len() - 1].1)
}

/// `radial-gradient(<rx> <ry> at <cx> <cy>, stops)` painted over a `w`×`h`
/// box, blurred by `blur` CSS px, rendered at `scale` pixels per CSS px with
/// `pad` CSS px of room around the box for the blur to spread into.
pub struct RadialSpec {
    pub w: f32,
    pub h: f32,
    pub cx: f32,
    pub cy: f32,
    pub rx: f32,
    pub ry: f32,
    pub stops: Vec<(f32, Rgba)>,
    pub blur: f32,
    pub pad: f32,
    pub scale: f32,
}

pub fn radial(spec: &RadialSpec) -> Arc<RenderImage> {
    let s = spec.scale;
    let width = ((spec.w + 2.0 * spec.pad) * s).ceil() as usize;
    let height = ((spec.h + 2.0 * spec.pad) * s).ceil() as usize;
    let mut canvas = Canvas::new(width, height);
    for y in 0..height {
        for x in 0..width {
            let bx = (x as f32 + 0.5) / s - spec.pad;
            let by = (y as f32 + 0.5) / s - spec.pad;
            if bx < 0.0 || by < 0.0 || bx > spec.w || by > spec.h {
                continue;
            }
            let dx = (bx - spec.cx) / spec.rx;
            let dy = (by - spec.cy) / spec.ry;
            let t = (dx * dx + dy * dy).sqrt();
            canvas.px[y * width + x] = sample_stops(&spec.stops, t);
        }
    }
    canvas.blur(spec.blur * s);
    canvas.into_render_image()
}

/// The flat disc the sun shows until its first frame is ready:
/// `radial-gradient(circle at 50% 40%, ...)` in a circle.
pub fn sun_disc(diameter: f32, scale: f32) -> Arc<RenderImage> {
    use crate::theme::{rgb, scene};
    let size = (diameter * scale).ceil() as usize;
    let mut canvas = Canvas::new(size, size);
    let stops = [
        (0.0, rgb(0xffe3a0)),
        (0.26, rgb(0xffd060)),
        (0.46, scene::GOLD),
        (0.70, scene::BRAND),
        (1.0, rgb(0xc8301c)),
    ];
    let r = size as f32 / 2.0;
    let (cx, cy) = (r, size as f32 * 0.4);
    // `circle` + farthest-corner: the ray reaches the farthest box corner.
    let far = ((cx).powi(2) + (size as f32 - cy).powi(2)).sqrt();
    for y in 0..size {
        for x in 0..size {
            let (fx, fy) = (x as f32 + 0.5, y as f32 + 0.5);
            let d = ((fx - r).powi(2) + (fy - r).powi(2)).sqrt();
            let coverage = (r - d + 0.5).clamp(0.0, 1.0);
            if coverage <= 0.0 {
                continue;
            }
            let t = ((fx - cx).powi(2) + (fy - cy).powi(2)).sqrt() / far;
            let c = sample_stops(&stops, t);
            canvas.px[y * size + x] = c.map(|v| v * coverage);
        }
    }
    canvas.into_render_image()
}

/// A cover resized to `w`×`h` device pixels with `object-fit: cover`.
pub fn cover_fit(image: &DynamicImage, w: u32, h: u32, position_y: f32) -> RgbaImage {
    let (iw, ih) = (image.width() as f32, image.height() as f32);
    let scale = (w as f32 / iw).max(h as f32 / ih);
    let (cw, ch) = ((w as f32 / scale).round().max(1.0), (h as f32 / scale).round().max(1.0));
    let x = ((iw - cw) * 0.5).max(0.0);
    let y = ((ih - ch) * position_y).max(0.0);
    let crop = image.crop_imm(x as u32, y as u32, cw as u32, ch as u32);
    crop.resize_exact(w, h, FilterType::CatmullRom).to_rgba8()
}

/// The featured slide's backdrop: the art scaled to cover `w`×`h` at
/// `object-position: 50% 30%`, then `blur(4px)`. Rendered small: it is blurred.
pub fn backdrop(image: &DynamicImage, w: f32, h: f32, scale: f32, blur_css: f32) -> Arc<RenderImage> {
    let (pw, ph) = ((w * scale).ceil() as u32, (h * scale).ceil() as u32);
    let fitted = cover_fit(image, pw.max(1), ph.max(1), 0.3);
    let mut canvas = Canvas::new(pw as usize, ph as usize);
    for (i, p) in fitted.pixels().enumerate() {
        let a = p[3] as f32 / 255.0;
        canvas.px[i] = [
            p[0] as f32 / 255.0 * a,
            p[1] as f32 / 255.0 * a,
            p[2] as f32 / 255.0 * a,
            a,
        ];
    }
    // `filter: blur()` samples transparent black past the edges; the slide
    // hides those edges (the image overflows its box), so clamp instead.
    canvas.blur_clamped(blur_css * scale);
    canvas.into_render_image()
}

impl Canvas {
    fn blur_clamped(&mut self, sigma: f32) {
        if sigma < 0.3 {
            return;
        }
        for radius in box_radii(sigma) {
            self.box_pass_clamped(radius, true);
            self.box_pass_clamped(radius, false);
        }
    }

    fn box_pass_clamped(&mut self, radius: usize, horizontal: bool) {
        let (len, lines) = if horizontal {
            (self.width, self.height)
        } else {
            (self.height, self.width)
        };
        let w = self.width;
        let idx = move |line: usize, i: usize| if horizontal { line * w + i } else { i * w + line };
        let mut out = self.px.clone();
        let window = (2 * radius + 1) as f32;
        for line in 0..lines {
            let get = |i: isize| self.px[idx(line, i.clamp(0, len as isize - 1) as usize)];
            let mut acc = [0.0f32; 4];
            for i in -(radius as isize)..=(radius as isize) {
                let p = get(i);
                for c in 0..4 {
                    acc[c] += p[c];
                }
            }
            for i in 0..len {
                out[idx(line, i)] = acc.map(|a| a / window);
                let add = get(i as isize + radius as isize + 1);
                let sub = get(i as isize - radius as isize);
                for c in 0..4 {
                    acc[c] += add[c] - sub[c];
                }
            }
        }
        self.px = out;
    }
}
