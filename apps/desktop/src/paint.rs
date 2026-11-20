//! CSS `linear-gradient()` on arbitrary convex shapes.
//!
//! GPUI's quads only take two-stop gradients, mapped onto the quad's own box
//! with its own normalisation. CSS gradients have any number of stops and can
//! be laid out over a different box than the one they paint (`background-
//! attachment: fixed`, skewed shine, ...). So the shape is turned into a
//! polygon, sliced into one band per pair of stops, and each band is painted as
//! a path whose two-stop gradient is solved to land exactly where CSS puts it.

use gpui::{Bounds, Hsla, LinearColorStop, Path, Pixels, Rgba, Window, linear_gradient, point, px};

pub type Poly = Vec<(f32, f32)>;

/// A rounded rectangle as a polygon, in window pixels.
pub fn rounded_rect(bounds: Bounds<Pixels>, radius: f32) -> Poly {
    let (x, y) = (f32::from(bounds.origin.x), f32::from(bounds.origin.y));
    let (w, h) = (f32::from(bounds.size.width), f32::from(bounds.size.height));
    let r = radius.min(w / 2.0).min(h / 2.0).max(0.0);
    if r < 0.5 {
        return vec![(x, y), (x + w, y), (x + w, y + h), (x, y + h)];
    }
    let steps = ((r * 0.9) as usize).clamp(4, 24);
    let mut poly = Vec::with_capacity(steps * 4 + 4);
    let corners = [
        (x + w - r, y + r, -90.0f32),
        (x + w - r, y + h - r, 0.0),
        (x + r, y + h - r, 90.0),
        (x + r, y + r, 180.0),
    ];
    for (cx, cy, start) in corners {
        for i in 0..=steps {
            let a = (start + 90.0 * i as f32 / steps as f32).to_radians();
            poly.push((cx + r * a.cos(), cy + r * a.sin()));
        }
    }
    poly
}

/// Keeps the part of `poly` where `a*x + b*y + c >= 0` (Sutherland–Hodgman).
pub fn clip(poly: &[(f32, f32)], a: f32, b: f32, c: f32) -> Poly {
    let mut out = Vec::with_capacity(poly.len() + 2);
    if poly.is_empty() {
        return out;
    }
    let side = |p: (f32, f32)| a * p.0 + b * p.1 + c;
    for i in 0..poly.len() {
        let cur = poly[i];
        let prev = poly[(i + poly.len() - 1) % poly.len()];
        let (sc, sp) = (side(cur), side(prev));
        if sc >= 0.0 {
            if sp < 0.0 {
                let t = sp / (sp - sc);
                out.push((prev.0 + (cur.0 - prev.0) * t, prev.1 + (cur.1 - prev.1) * t));
            }
            out.push(cur);
        } else if sp >= 0.0 {
            let t = sp / (sp - sc);
            out.push((prev.0 + (cur.0 - prev.0) * t, prev.1 + (cur.1 - prev.1) * t));
        }
    }
    out
}

fn bounds_of(poly: &[(f32, f32)]) -> (f32, f32, f32, f32) {
    let mut min = (f32::MAX, f32::MAX);
    let mut max = (f32::MIN, f32::MIN);
    for &(x, y) in poly {
        min = (min.0.min(x), min.1.min(y));
        max = (max.0.max(x), max.1.max(y));
    }
    (min.0, min.1, max.0 - min.0, max.1 - min.1)
}

fn to_path(poly: &[(f32, f32)]) -> Option<Path<Pixels>> {
    if poly.len() < 3 {
        return None;
    }
    let (_, _, w, h) = bounds_of(poly);
    if w < 0.01 || h < 0.01 {
        return None;
    }
    let mut path = Path::new(point(px(poly[0].0), px(poly[0].1)));
    for &(x, y) in &poly[1..] {
        path.line_to(point(px(x), px(y)));
    }
    Some(path)
}

pub fn fill_poly(window: &mut Window, poly: &[(f32, f32)], color: impl Into<Hsla>) {
    if is_axis_rect(poly) {
        let (x, y, w, h) = bounds_of(poly);
        window.paint_quad(gpui::fill(
            Bounds::new(point(px(x), px(y)), gpui::size(px(w), px(h))),
            color.into(),
        ));
        return;
    }
    if let Some(path) = to_path(poly) {
        window.paint_path(path, color.into());
    }
}

/// The scalar field of a linear gradient: `t = a*x + b*y + c`, 0 at the first
/// edge of the gradient line and 1 at the last.
#[derive(Clone, Copy, Debug)]
pub struct Field {
    pub a: f32,
    pub b: f32,
    pub c: f32,
}

impl Field {
    /// The gradient line of `linear-gradient(<angle>deg, ...)` drawn over `box`.
    pub fn css(angle_deg: f32, x: f32, y: f32, w: f32, h: f32) -> Self {
        let rad = angle_deg.to_radians();
        let (dx, dy) = (rad.sin(), -rad.cos());
        let len = (w * dx).abs() + (h * dy).abs();
        let (cx, cy) = (x + w / 2.0, y + h / 2.0);
        Self {
            a: dx / len,
            b: dy / len,
            c: 0.5 - (cx * dx + cy * dy) / len,
        }
    }

    pub fn css_bounds(angle_deg: f32, bounds: Bounds<Pixels>) -> Self {
        Self::css(
            angle_deg,
            f32::from(bounds.origin.x),
            f32::from(bounds.origin.y),
            f32::from(bounds.size.width),
            f32::from(bounds.size.height),
        )
    }

    pub fn at(&self, x: f32, y: f32) -> f32 {
        self.a * x + self.b * y + self.c
    }
}

fn premultiplied_mix(c0: Rgba, c1: Rgba, t: f32) -> Rgba {
    let a = c0.a + (c1.a - c0.a) * t;
    if a <= 0.0 {
        return Rgba { a: 0.0, ..c1 };
    }
    let ch = |x0: f32, x1: f32| (x0 * c0.a + (x1 * c1.a - x0 * c0.a) * t) / a;
    Rgba {
        r: ch(c0.r, c1.r),
        g: ch(c0.g, c1.g),
        b: ch(c0.b, c1.b),
        a,
    }
}

/// Paints the band `t0 <= t <= t1` of `field` over `poly`, fading from `c0` to
/// `c1` with CSS's premultiplied interpolation.
fn paint_band(window: &mut Window, poly: &[(f32, f32)], field: Field, t0: f32, c0: Rgba, t1: f32, c1: Rgba) {
    let band = clip(poly, field.a, field.b, field.c - t0);
    let band = clip(&band, -field.a, -field.b, t1 - field.c);
    if band.len() < 3 {
        return;
    }
    if c0.a == 0.0 && c1.a == 0.0 {
        return;
    }
    let same = (c0.r - c1.r).abs() < 1e-4
        && (c0.g - c1.g).abs() < 1e-4
        && (c0.b - c1.b).abs() < 1e-4
        && (c0.a - c1.a).abs() < 1e-4;
    if same {
        fill_poly(window, &band, c0);
        return;
    }
    // Straight-alpha interpolation only matches CSS when one end is fully
    // transparent (take the other end's hue) or both alphas are equal.
    // Otherwise split the band so each piece is short enough not to show it.
    let same_hue = (c0.r - c1.r).abs() < 1e-4 && (c0.g - c1.g).abs() < 1e-4 && (c0.b - c1.b).abs() < 1e-4;
    let pieces = if same_hue || c0.a == 0.0 || c1.a == 0.0 || (c0.a - c1.a).abs() < 1e-3 {
        1
    } else {
        6
    };
    if pieces > 1 {
        for i in 0..pieces {
            let (f0, f1) = (i as f32 / pieces as f32, (i + 1) as f32 / pieces as f32);
            let s0 = premultiplied_mix(c0, c1, f0);
            let s1 = premultiplied_mix(c0, c1, f1);
            paint_band(window, &band, field, t0 + (t1 - t0) * f0, s0, t0 + (t1 - t0) * f1, s1);
        }
        return;
    }
    let c0 = if c0.a == 0.0 { Rgba { a: 0.0, ..c1 } } else { c0 };
    let c1 = if c1.a == 0.0 { Rgba { a: 0.0, ..c0 } } else { c1 };

    // Solve GPUI's gradient mapping (see `fill_color` in shaders.metal) for a
    // direction parallel to the field and stops at t0 / t1.
    let axis_rect = is_axis_rect(&band);
    let (mut bx, mut by, mut bw, mut bh) = bounds_of(&band);
    if axis_rect {
        // Land the quad's edges on device pixels, so abutting bands leave no
        // antialiased seam between them.
        let scale = window.scale_factor();
        let snap = |v: f32| (v * scale).round() / scale;
        let (x1, y1) = (snap(bx + bw), snap(by + bh));
        bx = snap(bx);
        by = snap(by);
        bw = x1 - bx;
        bh = y1 - by;
        if bw <= 0.0 || bh <= 0.0 {
            return;
        }
    }
    let (na, nb) = (field.a, field.b);
    let n_len = (na * na + nb * nb).sqrt();
    let r = if bw > bh {
        let k = bh / bw;
        (nb / k).atan2(na)
    } else {
        let k = bw / bh;
        nb.atan2(na / k)
    };
    let (mut dx, mut dy) = (r.cos(), r.sin());
    if bw > bh {
        dy *= bh / bw;
    } else {
        dx *= bw / bh;
    }
    let span = if dx.abs() > dy.abs() { bw } else { bh };
    let tc = field.at(bx + bw / 2.0, by + bh / 2.0);
    let to_gpui = |t: f32| 0.5 + (t - tc) / (n_len * span);
    let angle = (r.to_degrees() + 90.0).rem_euclid(360.0);
    let background = linear_gradient(
        angle,
        LinearColorStop {
            color: c0.into(),
            percentage: to_gpui(t0),
        },
        LinearColorStop {
            color: c1.into(),
            percentage: to_gpui(t1),
        },
    );
    if axis_rect {
        // Big gradient paths come out striped; a quad shares the same mapping.
        window.paint_quad(gpui::fill(
            Bounds::new(point(px(bx), px(by)), gpui::size(px(bw), px(bh))),
            background,
        ));
    } else if let Some(path) = to_path(&band) {
        window.paint_path(path, background);
    }
}

fn is_axis_rect(poly: &[(f32, f32)]) -> bool {
    if poly.len() != 4 {
        return false;
    }
    let (x, y, w, h) = bounds_of(poly);
    let near = |a: f32, b: f32| (a - b).abs() < 0.01;
    poly.iter()
        .all(|&(px_, py_)| (near(px_, x) || near(px_, x + w)) && (near(py_, y) || near(py_, y + h)))
}

/// Paints `stops` (position, colour) of a CSS gradient `field` over `poly`.
/// Before the first stop and after the last, the end colours extend.
pub fn paint_gradient(window: &mut Window, poly: &[(f32, f32)], field: Field, stops: &[(f32, Rgba)]) {
    let Some((&first, &last)) = stops.first().zip(stops.last()) else {
        return;
    };
    paint_band(window, poly, field, -1e6, first.1, first.0, first.1);
    // One pixel in field units: opaque bands reach back that far over the
    // previous one, so their antialiased edges leave no seam.
    let px_t = (field.a * field.a + field.b * field.b).sqrt();
    for pair in stops.windows(2) {
        let (t0, c0) = pair[0];
        let (t1, c1) = pair[1];
        if t1 > t0 {
            let overlap = if c0.a >= 1.0 && c1.a >= 1.0 { px_t } else { 0.0 };
            let c0_ext = premultiplied_mix(c0, c1, -overlap / (t1 - t0));
            paint_band(
                window,
                poly,
                field,
                t0 - overlap,
                if overlap > 0.0 { Rgba { a: 1.0, ..c0_ext } } else { c0 },
                t1,
                c1,
            );
        }
    }
    paint_band(window, poly, field, last.0, last.1, 1e6, last.1);
}

/// Paints only the stops' own span, leaving the rest of `poly` untouched; for
/// overlays such as a shine or a shimmer band.
pub fn paint_gradient_span(window: &mut Window, poly: &[(f32, f32)], field: Field, stops: &[(f32, Rgba)]) {
    for pair in stops.windows(2) {
        let (t0, c0) = pair[0];
        let (t1, c1) = pair[1];
        if t1 > t0 {
            paint_band(window, poly, field, t0, c0, t1, c1);
        }
    }
}

pub fn rect_poly(x: f32, y: f32, w: f32, h: f32) -> Poly {
    vec![(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
}

/// The part of convex `subject` inside convex `clipper` (both clockwise).
pub fn clip_convex(subject: &[(f32, f32)], clipper: &[(f32, f32)]) -> Poly {
    let mut out = subject.to_vec();
    for i in 0..clipper.len() {
        let a = clipper[i];
        let b = clipper[(i + 1) % clipper.len()];
        let (nx, ny) = (-(b.1 - a.1), b.0 - a.0);
        out = clip(&out, nx, ny, -(nx * a.0 + ny * a.1));
        if out.is_empty() {
            break;
        }
    }
    out
}
