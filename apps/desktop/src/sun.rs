//! The auth screen's plasma sun, ported from `components/scene/sun/*.ts`.
//!
//! The web app draws it with three.js shaders. GPUI has no custom shaders, so
//! the same maths runs here on the CPU, in parallel, on a dedicated thread:
//! the camera, the sphere and the beam plane are ray-traced with the exact
//! projection three.js uses (FOV 30°, camera at z = 12), the fragment shaders
//! are translated line for line, and the UI thread picks up the latest frame.

use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use rayon::prelude::*;

const FOV_DEG: f32 = 30.0;
const CAMERA_Z: f32 = 12.0;
const BEAM_EXTENT: f32 = 3.0;

// ---------------------------------------------------------------- noise ----

#[inline(always)]
fn mod289(x: f32) -> f32 {
    x - 289.0 * (x / 289.0).floor()
}

#[inline(always)]
fn permute(x: f32) -> f32 {
    mod289((x * 34.0 + 1.0) * x)
}

#[inline(always)]
fn dot3(a: [f32; 3], b: [f32; 3]) -> f32 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/// Ashima's 3D simplex noise, exactly as in the GLSL.
pub fn snoise(v: [f32; 3]) -> f32 {
    const CX: f32 = 1.0 / 6.0;
    const CY: f32 = 1.0 / 3.0;
    let s = (v[0] + v[1] + v[2]) * CY;
    let i = [(v[0] + s).floor(), (v[1] + s).floor(), (v[2] + s).floor()];
    let t = (i[0] + i[1] + i[2]) * CX;
    let x0 = [v[0] - i[0] + t, v[1] - i[1] + t, v[2] - i[2] + t];

    // g = step(x0.yzx, x0.xyz)
    let g = [
        (x0[0] >= x0[1]) as i32 as f32,
        (x0[1] >= x0[2]) as i32 as f32,
        (x0[2] >= x0[0]) as i32 as f32,
    ];
    let l = [1.0 - g[0], 1.0 - g[1], 1.0 - g[2]];
    // l.zxy
    let lz = [l[2], l[0], l[1]];
    let i1 = [g[0].min(lz[0]), g[1].min(lz[1]), g[2].min(lz[2])];
    let i2 = [g[0].max(lz[0]), g[1].max(lz[1]), g[2].max(lz[2])];
    let x1 = [x0[0] - i1[0] + CX, x0[1] - i1[1] + CX, x0[2] - i1[2] + CX];
    let x2 = [
        x0[0] - i2[0] + 2.0 * CX,
        x0[1] - i2[1] + 2.0 * CX,
        x0[2] - i2[2] + 2.0 * CX,
    ];
    let x3 = [x0[0] - 1.0 + 3.0 * CX, x0[1] - 1.0 + 3.0 * CX, x0[2] - 1.0 + 3.0 * CX];

    let i = [mod289(i[0]), mod289(i[1]), mod289(i[2])];
    let oz = [0.0, i1[2], i2[2], 1.0];
    let oy = [0.0, i1[1], i2[1], 1.0];
    let ox = [0.0, i1[0], i2[0], 1.0];
    let mut p = [0.0f32; 4];
    for k in 0..4 {
        p[k] = permute(permute(permute(i[2] + oz[k]) + i[1] + oy[k]) + i[0] + ox[k]);
    }

    let n_ = 1.0 / 7.0;
    let ns = [n_ * 2.0, n_ * 0.5 - 1.0, n_ * 1.0];
    let mut x = [0.0f32; 4];
    let mut y = [0.0f32; 4];
    let mut h = [0.0f32; 4];
    for k in 0..4 {
        let j = p[k] - 49.0 * (p[k] * ns[2] * ns[2]).floor();
        let x_ = (j * ns[2]).floor();
        let y_ = (j - 7.0 * x_).floor();
        x[k] = x_ * ns[0] + ns[1];
        y[k] = y_ * ns[0] + ns[1];
        h[k] = 1.0 - x[k].abs() - y[k].abs();
    }
    let b0 = [x[0], x[1], y[0], y[1]];
    let b1 = [x[2], x[3], y[2], y[3]];
    let s0 = b0.map(|b| b.floor() * 2.0 + 1.0);
    let s1 = b1.map(|b| b.floor() * 2.0 + 1.0);
    let sh = h.map(|h| -((0.0 >= h) as i32 as f32));
    // a0 = b0.xzyw + s0.xzyw * sh.xxyy
    let a0 = [
        b0[0] + s0[0] * sh[0],
        b0[2] + s0[2] * sh[0],
        b0[1] + s0[1] * sh[1],
        b0[3] + s0[3] * sh[1],
    ];
    let a1 = [
        b1[0] + s1[0] * sh[2],
        b1[2] + s1[2] * sh[2],
        b1[1] + s1[1] * sh[3],
        b1[3] + s1[3] * sh[3],
    ];
    let mut p0 = [a0[0], a0[1], h[0]];
    let mut p1 = [a0[2], a0[3], h[1]];
    let mut p2 = [a1[0], a1[1], h[2]];
    let mut p3 = [a1[2], a1[3], h[3]];
    let inv = |p: [f32; 3]| 1.792_842_9 - 0.853_734_7 * dot3(p, p);
    let (n0, n1, n2, n3) = (inv(p0), inv(p1), inv(p2), inv(p3));
    p0 = p0.map(|c| c * n0);
    p1 = p1.map(|c| c * n1);
    p2 = p2.map(|c| c * n2);
    p3 = p3.map(|c| c * n3);

    let m = [
        (0.6 - dot3(x0, x0)).max(0.0),
        (0.6 - dot3(x1, x1)).max(0.0),
        (0.6 - dot3(x2, x2)).max(0.0),
        (0.6 - dot3(x3, x3)).max(0.0),
    ];
    let m = m.map(|m| {
        let m2 = m * m;
        m2 * m2
    });
    42.0 * (m[0] * dot3(p0, x0) + m[1] * dot3(p1, x1) + m[2] * dot3(p2, x2) + m[3] * dot3(p3, x3))
}

fn fbm(mut p: [f32; 3]) -> f32 {
    let mut amplitude = 0.5;
    let mut sum = 0.0;
    for _ in 0..4 {
        sum += amplitude * snoise(p);
        p = p.map(|c| c * 2.03);
        amplitude *= 0.5;
    }
    sum
}

#[inline(always)]
fn smoothstep(e0: f32, e1: f32, x: f32) -> f32 {
    let t = ((x - e0) / (e1 - e0)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

#[inline(always)]
fn mix3(a: [f32; 3], b: [f32; 3], t: f32) -> [f32; 3] {
    [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ]
}

fn sun_ramp(t: f32) -> [f32; 3] {
    let mut c = mix3([1.0, 0.945, 0.784], [1.0, 0.816, 0.376], smoothstep(0.0, 0.26, t));
    c = mix3(c, [1.0, 0.722, 0.125], smoothstep(0.26, 0.46, t));
    c = mix3(c, [0.949, 0.271, 0.176], smoothstep(0.46, 0.70, t));
    mix3(c, [0.784, 0.188, 0.110], smoothstep(0.70, 1.0, t))
}

/// PLASMA_FRAGMENT. `local` is the unit-sphere position in object space, `mu`
/// the cosine between the normal and the view direction.
fn plasma(local: [f32; 3], mu: f32, time: f32) -> [f32; 3] {
    let p = local.map(|c| c * 2.0);
    let t = time * 0.07;
    let q = [
        fbm([p[0], p[1] + t, p[2]]),
        fbm([p[0] + 5.2, p[1] + 1.3, p[2] + t]),
        fbm([p[0] + t, p[1] + 9.2, p[2] + 3.1]),
    ];
    let n = fbm([
        p[0] * 1.7 + 1.6 * q[0],
        p[1] * 1.7 + 1.6 * q[1],
        p[2] * 1.7 + 1.6 * q[2] + t * 1.4,
    ]);
    let cells = 0.5
        + 0.5
            * snoise([
                local[0] * 14.0 + t * 4.0,
                local[1] * 14.0 + t * 4.0,
                local[2] * 14.0 + t * 4.0,
            ]);
    let heat = (0.5 + 0.55 * n) * 0.82 + cells * 0.18;
    let mut c = sun_ramp((1.0 - heat * 0.95 - mu.powf(1.5) * 0.12 + 0.15).clamp(0.0, 1.0));
    let shade = 0.62 + 0.38 * mu.powf(0.45);
    let rim = (1.0 - mu).powf(3.5) * 0.4;
    c = [c[0] * shade + rim, c[1] * shade + 0.55 * rim, c[2] * shade + 0.15 * rim];
    c
}

#[inline(always)]
fn over(under: [f32; 4], color: [f32; 3], alpha: f32) -> [f32; 4] {
    let a = alpha + under[3] * (1.0 - alpha);
    let k = alpha / a.max(0.001);
    let rgb = mix3([under[0], under[1], under[2]], color, k);
    [rgb[0], rgb[1], rgb[2], a]
}

/// BEAMS_FRAGMENT. `p` is in sun radii, y up. Returns straight-alpha RGBA.
fn beams(p: [f32; 2], time: f32, breath: f32, size: f32) -> [f32; 4] {
    let f = 1.0 / size.sqrt();
    let r = (p[0] * p[0] + p[1] * p[1]).sqrt();
    let theta = p[1].atan2(p[0]);
    let away = (r - 1.0).max(0.0) / f;

    let inner = 0.55 * (-((r - 1.0 - 0.17 * f).max(0.0) / (0.34 * f)).powi(2)).exp();
    let outer = 0.30 * (-((r - 1.0 - 0.47 * f).max(0.0) / (0.62 * f)).powi(2)).exp();
    let mut light = over([1.0, 0.55, 0.16, inner], [1.0, 0.72, 0.13], outer);

    let (ds, dc) = (theta + time * 0.03).sin_cos();
    let n1 = snoise([dc * 2.0, ds * 2.0, time * 0.05]);
    let n2 = snoise([dc * 5.5, ds * 5.5, time * 0.09 + 4.0]);
    let streak = (0.5 + 0.5 * (0.65 * n1 + 0.45 * n2)).clamp(0.0, 1.0).powf(2.2);
    let pulse = snoise([dc * 3.0, ds * 3.0, away * 1.6 - time * 0.55]);
    let reach = 0.9 + 1.3 * breath;
    let mut beam = streak * (-away * 2.1 / reach).exp() * 0.8;
    beam *= 0.6 + 0.6 * smoothstep(-0.25, 0.75, pulse);
    light = over(
        light,
        mix3([0.949, 0.271, 0.176], [1.0, 0.79, 0.30], streak),
        beam.min(1.0),
    );

    let (cs, cc) = (theta - time * 0.02).sin_cos();
    let glint = (0.5 + 0.5 * snoise([cc * 16.0, cs * 16.0, time * 0.3]))
        .clamp(0.0, 1.0)
        .powf(7.0);
    let sparkle = glint * (-away * 1.3 / reach).exp() * smoothstep(0.0, 0.08, away) * 0.9;
    light = over(light, [1.0, 0.86, 0.55], sparkle.min(1.0));

    let alpha = light[3] * smoothstep(0.85, 0.9, r) * (1.0 - smoothstep(BEAM_EXTENT * 0.86, BEAM_EXTENT, r));
    [light[0], light[1], light[2], alpha.clamp(0.0, 1.0)]
}

// ----------------------------------------------------------- rotation ----

/// A unit quaternion (x, y, z, w).
#[derive(Clone, Copy, Debug)]
pub struct Quat(pub [f32; 4]);

impl Quat {
    pub fn axis_angle(axis: [f32; 3], angle: f32) -> Self {
        let len = dot3(axis, axis).sqrt();
        if len == 0.0 {
            return Self([0.0, 0.0, 0.0, 1.0]);
        }
        let (s, c) = (angle / 2.0).sin_cos();
        Self([axis[0] / len * s, axis[1] / len * s, axis[2] / len * s, c])
    }

    /// `self * other`: `other` applied first.
    pub fn mul(self, other: Self) -> Self {
        let [ax, ay, az, aw] = self.0;
        let [bx, by, bz, bw] = other.0;
        let q = [
            aw * bx + ax * bw + ay * bz - az * by,
            aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw,
            aw * bw - ax * bx - ay * by - az * bz,
        ];
        let n = (q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]).sqrt();
        Self(q.map(|c| c / n))
    }

    pub fn matrix_rows(self) -> [[f32; 3]; 3] {
        self.matrix()
    }

    /// Rows of the rotation matrix.
    fn matrix(self) -> [[f32; 3]; 3] {
        let [x, y, z, w] = self.0;
        [
            [
                1.0 - 2.0 * (y * y + z * z),
                2.0 * (x * y - z * w),
                2.0 * (x * z + y * w),
            ],
            [
                2.0 * (x * y + z * w),
                1.0 - 2.0 * (x * x + z * z),
                2.0 * (y * z - x * w),
            ],
            [
                2.0 * (x * z - y * w),
                2.0 * (y * z + x * w),
                1.0 - 2.0 * (x * x + y * y),
            ],
        ]
    }
}

// -------------------------------------------------------------- frames ----

/// Where the canvas is and where the CSS layout puts the sun on it.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Layout {
    pub width: f32,
    pub height: f32,
    pub center: (f32, f32),
    pub radius: f32,
}

#[derive(Clone, Copy, Debug)]
pub struct FrameParams {
    pub layout: Layout,
    pub time: f32,
    pub breath: f32,
    pub spin: Quat,
}

/// A rendered layer: straight-alpha BGRA pixels covering `rect` (canvas px).
pub struct Layer {
    pub rect: (f32, f32, f32, f32),
    pub width: u32,
    pub height: u32,
    pub bgra: Vec<u8>,
}

/// A finished frame, ready for the UI: two images and where they go.
pub struct Frame {
    pub beams: (Rect, Arc<gpui::RenderImage>),
    pub sphere: (Rect, Arc<gpui::RenderImage>),
    pub serial: u64,
}

pub type Rect = (f32, f32, f32, f32);

struct Camera {
    unit: f32,
    width: f32,
    height: f32,
    center: [f32; 3],
    radius: f32,
}

impl Camera {
    fn new(layout: Layout) -> Self {
        let visible_height = 2.0 * CAMERA_Z * (FOV_DEG.to_radians() / 2.0).tan();
        let unit = visible_height / layout.height;
        Self {
            unit,
            width: layout.width,
            height: layout.height,
            center: [
                (layout.center.0 - layout.width / 2.0) * unit,
                (layout.height / 2.0 - layout.center.1) * unit,
                0.0,
            ],
            radius: layout.radius * unit,
        }
    }

    /// The point on the z = 0 plane under canvas pixel (x, y).
    fn plane(&self, x: f32, y: f32) -> [f32; 3] {
        [
            (x - self.width / 2.0) * self.unit,
            (self.height / 2.0 - y) * self.unit,
            0.0,
        ]
    }
}

fn to_u8(v: f32) -> u8 {
    (v.clamp(0.0, 1.0) * 255.0 + 0.5) as u8
}

fn render_beams(cam: &Camera, params: &FrameParams, scale: f32) -> Layer {
    let layout = params.layout;
    // The plane only lights up to BEAM_EXTENT radii around the sun.
    let reach = layout.radius * BEAM_EXTENT;
    let x0 = (layout.center.0 - reach).max(0.0).floor();
    let y0 = (layout.center.1 - reach).max(0.0).floor();
    let x1 = (layout.center.0 + reach).min(layout.width).ceil();
    let y1 = (layout.center.1 + reach).min(layout.height).ceil();
    let w = ((x1 - x0) * scale).ceil().max(1.0) as u32;
    let h = ((y1 - y0) * scale).ceil().max(1.0) as u32;
    let size = layout.radius / 235.0;
    let mut bgra = vec![0u8; (w * h * 4) as usize];
    bgra.par_chunks_mut((w * 4) as usize)
        .enumerate()
        .for_each(|(row, line)| {
            let y = y0 + (row as f32 + 0.5) / scale;
            for col in 0..w as usize {
                let x = x0 + (col as f32 + 0.5) / scale;
                let world = cam.plane(x, y);
                let p = [
                    (world[0] - cam.center[0]) / cam.radius,
                    (world[1] - cam.center[1]) / cam.radius,
                ];
                let r2 = p[0] * p[0] + p[1] * p[1];
                if r2 < 0.85 * 0.85 || r2 > BEAM_EXTENT * BEAM_EXTENT {
                    continue;
                }
                let c = beams(p, params.time, params.breath, size);
                let px = &mut line[col * 4..col * 4 + 4];
                px[0] = to_u8(c[2]);
                px[1] = to_u8(c[1]);
                px[2] = to_u8(c[0]);
                px[3] = to_u8(c[3]);
            }
        });
    Layer {
        rect: (x0, y0, x1 - x0, y1 - y0),
        width: w,
        height: h,
        bgra,
    }
}

fn render_sphere(cam: &Camera, params: &FrameParams, scale: f32) -> Layer {
    let layout = params.layout;
    // Perspective makes the silhouette a touch larger than the CSS disc.
    let margin = layout.radius * 0.06 + 2.0;
    let x0 = (layout.center.0 - layout.radius - margin).max(0.0).floor();
    let y0 = (layout.center.1 - layout.radius - margin).max(0.0).floor();
    let x1 = (layout.center.0 + layout.radius + margin).min(layout.width).ceil();
    let y1 = (layout.center.1 + layout.radius + margin).min(layout.height).ceil();
    if x1 <= x0 || y1 <= y0 {
        return Layer {
            rect: (0.0, 0.0, 0.0, 0.0),
            width: 1,
            height: 1,
            bgra: vec![0; 4],
        };
    }
    let w = ((x1 - x0) * scale).ceil().max(1.0) as u32;
    let h = ((y1 - y0) * scale).ceil().max(1.0) as u32;
    let rot = params.spin.matrix();
    let eye = [0.0, 0.0, CAMERA_Z];
    let c = cam.center;
    let r = cam.radius;
    // World size of one output pixel at the sun's depth.
    let pixel = cam.unit / scale;
    let mut bgra = vec![0u8; (w * h * 4) as usize];
    bgra.par_chunks_mut((w * 4) as usize)
        .enumerate()
        .for_each(|(row, line)| {
            let y = y0 + (row as f32 + 0.5) / scale;
            for col in 0..w as usize {
                let x = x0 + (col as f32 + 0.5) / scale;
                let target = cam.plane(x, y);
                let mut dir = [target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]];
                let len = dot3(dir, dir).sqrt();
                dir = dir.map(|d| d / len);
                let oc = [eye[0] - c[0], eye[1] - c[1], eye[2] - c[2]];
                let b = dot3(oc, dir);
                // Closest approach of the ray to the sphere's centre.
                let closest = [oc[0] - dir[0] * b, oc[1] - dir[1] * b, oc[2] - dir[2] * b];
                let dist = dot3(closest, closest).sqrt();
                let coverage = ((r - dist) / pixel + 0.5).clamp(0.0, 1.0);
                if coverage <= 0.0 {
                    continue;
                }
                let disc = (r * r - dist * dist).max(0.0);
                let t = -b - disc.sqrt();
                let hit = [eye[0] + dir[0] * t, eye[1] + dir[1] * t, eye[2] + dir[2] * t];
                let normal = [(hit[0] - c[0]) / r, (hit[1] - c[1]) / r, (hit[2] - c[2]) / r];
                let view = {
                    let v = [eye[0] - hit[0], eye[1] - hit[1], eye[2] - hit[2]];
                    let l = dot3(v, v).sqrt();
                    v.map(|c| c / l)
                };
                let mu = dot3(normal, view).clamp(0.0, 1.0);
                // Object space: undo the spin (the transpose of its matrix).
                let local = [
                    rot[0][0] * normal[0] + rot[1][0] * normal[1] + rot[2][0] * normal[2],
                    rot[0][1] * normal[0] + rot[1][1] * normal[1] + rot[2][1] * normal[2],
                    rot[0][2] * normal[0] + rot[1][2] * normal[1] + rot[2][2] * normal[2],
                ];
                let color = plasma(local, mu, params.time);
                let px = &mut line[col * 4..col * 4 + 4];
                px[0] = to_u8(color[2]);
                px[1] = to_u8(color[1]);
                px[2] = to_u8(color[0]);
                px[3] = to_u8(coverage);
            }
        });
    Layer {
        rect: (x0, y0, x1 - x0, y1 - y0),
        width: w,
        height: h,
        bgra,
    }
}

pub fn render(params: &FrameParams, quality: Quality) -> (Layer, Layer) {
    let cam = Camera::new(params.layout);

    let (beams, sphere) = rayon::join(
        || render_beams(&cam, params, quality.beams),
        || render_sphere(&cam, params, quality.sphere),
    );
    (beams, sphere)
}

/// Output resolution, in pixels per CSS pixel, of each layer. The beams are
/// soft and large; the sphere carries the fine plasma detail.
#[derive(Clone, Copy, Debug)]
pub struct Quality {
    pub beams: f32,
    pub sphere: f32,
}

// ------------------------------------------------------------- worker ----

#[derive(Default)]
struct Shared {
    request: Option<FrameParams>,
    latest: Option<Arc<Frame>>,
    alive: bool,
}

/// Renders frames on its own thread; the UI posts the parameters of the next
/// frame and reads back the latest finished one.
pub struct SunWorker {
    shared: Arc<(Mutex<Shared>, Condvar)>,
}

impl SunWorker {
    pub fn spawn(quality: Quality) -> Self {
        let shared = Arc::new((
            Mutex::new(Shared {
                alive: true,
                ..Default::default()
            }),
            Condvar::new(),
        ));
        let worker = shared.clone();
        thread::Builder::new()
            .name("plasma-sun".into())
            .spawn(move || {
                let mut serial = 0;
                let mut gpu = if std::env::var("TAIYO_CPU_SUN").is_ok() {
                    None
                } else {
                    crate::sun_gpu::GpuSun::new()
                };
                let quality = if gpu.is_some() {
                    Quality {
                        beams: 1.0,
                        sphere: 1.75,
                    }
                } else {
                    quality
                };
                loop {
                    let params = {
                        let (lock, cvar) = &*worker;
                        let mut state = lock.lock().unwrap();
                        while state.request.is_none() && state.alive {
                            state = cvar.wait(state).unwrap();
                        }
                        if !state.alive {
                            return;
                        }
                        state.request.take().unwrap()
                    };
                    let started = Instant::now();
                    let (beams, sphere) = match gpu.as_mut() {
                        Some(gpu) => gpu.render(&params, quality),
                        None => render(&params, quality),
                    };
                    serial += 1;
                    let image = |layer: Layer| {
                        (
                            layer.rect,
                            crate::raster::bgra_image(layer.width, layer.height, layer.bgra),
                        )
                    };
                    let frame = Arc::new(Frame {
                        beams: image(beams),
                        sphere: image(sphere),
                        serial,
                    });
                    worker.0.lock().unwrap().latest = Some(frame);
                    if std::env::var("TAIYO_SUN_PROFILE").is_ok() {
                        eprintln!("sun frame {:?}", started.elapsed());
                    }
                    // Never outrun the display.
                    let spent = started.elapsed();
                    if spent < Duration::from_millis(15) {
                        thread::sleep(Duration::from_millis(15) - spent);
                    }
                }
            })
            .expect("spawn the sun renderer");
        Self { shared }
    }

    pub fn request(&self, params: FrameParams) {
        let (lock, cvar) = &*self.shared;
        lock.lock().unwrap().request = Some(params);
        cvar.notify_one();
    }

    pub fn latest(&self) -> Option<Arc<Frame>> {
        self.shared.0.lock().unwrap().latest.clone()
    }
}

impl Drop for SunWorker {
    fn drop(&mut self) {
        let (lock, cvar) = &*self.shared;
        lock.lock().unwrap().alive = false;
        cvar.notify_one();
    }
}
