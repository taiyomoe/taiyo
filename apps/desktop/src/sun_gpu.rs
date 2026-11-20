//! The plasma sun on the GPU: the web's GLSL fragment shaders, translated to a
//! Metal compute kernel. Each frame renders the beams and the sphere into
//! shared buffers that the UI then shows as images; the CPU only copies bytes.

use metal::{CompileOptions, ComputePipelineState, Device, MTLResourceOptions, MTLSize};

use crate::sun::{FrameParams, Layer, Quality};

const SHADER: &str = r#"
#include <metal_stdlib>
using namespace metal;

// GLSL's mod(), not fmod(): floors towards -infinity.
float4 mod289(float4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float3 mod289(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float4 permute(float4 x) { return mod289(((x * 34.0) + 1.0) * x); }
float4 taylorInvSqrt(float4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(float3 v) {
  const float2 C = float2(1.0 / 6.0, 1.0 / 3.0);
  const float4 D = float4(0.0, 0.5, 1.0, 2.0);
  float3 i = floor(v + dot(v, C.yyy));
  float3 x0 = v - i + dot(i, C.xxx);
  float3 g = step(x0.yzx, x0.xyz);
  float3 l = 1.0 - g;
  float3 i1 = min(g.xyz, l.zxy);
  float3 i2 = max(g.xyz, l.zxy);
  float3 x1 = x0 - i1 + C.xxx;
  float3 x2 = x0 - i2 + 2.0 * C.xxx;
  float3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod289(i);
  float4 p = permute(permute(permute(i.z + float4(0.0, i1.z, i2.z, 1.0)) + i.y + float4(0.0, i1.y, i2.y, 1.0)) + i.x + float4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  float3 ns = n_ * D.wyz - D.xzx;
  float4 j = p - 49.0 * floor(p * ns.z * ns.z);
  float4 x_ = floor(j * ns.z);
  float4 y_ = floor(j - 7.0 * x_);
  float4 x = x_ * ns.x + ns.yyyy;
  float4 y = y_ * ns.x + ns.yyyy;
  float4 h = 1.0 - abs(x) - abs(y);
  float4 b0 = float4(x.xy, y.xy);
  float4 b1 = float4(x.zw, y.zw);
  float4 s0 = floor(b0) * 2.0 + 1.0;
  float4 s1 = floor(b1) * 2.0 + 1.0;
  float4 sh = -step(h, float4(0.0));
  float4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  float4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  float3 p0 = float3(a0.xy, h.x);
  float3 p1 = float3(a0.zw, h.y);
  float3 p2 = float3(a1.xy, h.z);
  float3 p3 = float3(a1.zw, h.w);
  float4 norm = taylorInvSqrt(float4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  float4 m = max(0.6 - float4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, float4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float3 sunRamp(float t) {
  float3 c = mix(float3(1.0, 0.945, 0.784), float3(1.0, 0.816, 0.376), smoothstep(0.0, 0.26, t));
  c = mix(c, float3(1.0, 0.722, 0.125), smoothstep(0.26, 0.46, t));
  c = mix(c, float3(0.949, 0.271, 0.176), smoothstep(0.46, 0.70, t));
  return mix(c, float3(0.784, 0.188, 0.110), smoothstep(0.70, 1.0, t));
}

float fbm(float3 p) {
  float amplitude = 0.5;
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * snoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return sum;
}

// PLASMA_FRAGMENT
float3 plasma(float3 position, float mu, float uTime) {
  float3 p = normalize(position) * 2.0;
  float t = uTime * 0.07;
  float3 q = float3(fbm(p + float3(0.0, t, 0.0)), fbm(p + float3(5.2, 1.3, t)), fbm(p + float3(t, 9.2, 3.1)));
  float n = fbm(p * 1.7 + 1.6 * q + float3(0.0, 0.0, t * 1.4));
  float cells = 0.5 + 0.5 * snoise(normalize(position) * 14.0 + float3(t * 4.0));
  float heat = (0.5 + 0.55 * n) * 0.82 + cells * 0.18;
  float3 c = sunRamp(clamp(1.0 - heat * 0.95 - pow(mu, 1.5) * 0.12 + 0.15, 0.0, 1.0));
  c *= 0.62 + 0.38 * pow(mu, 0.45);
  c += float3(1.0, 0.55, 0.15) * pow(1.0 - mu, 3.5) * 0.4;
  return c;
}

float4 over(float4 under, float3 color, float alpha) {
  float a = alpha + under.a * (1.0 - alpha);
  return float4(mix(under.rgb, color, alpha / max(a, 0.001)), a);
}

// BEAMS_FRAGMENT, with p already in sun radii.
float4 beams(float2 p, float uTime, float uBreath, float uExtent, float uSize) {
  float f = rsqrt(uSize);
  float r = length(p);
  float theta = atan2(p.y, p.x);
  float away = max(r - 1.0, 0.0) / f;

  float inner = 0.55 * exp(-pow(max(r - 1.0 - 0.17 * f, 0.0) / (0.34 * f), 2.0));
  float outer = 0.30 * exp(-pow(max(r - 1.0 - 0.47 * f, 0.0) / (0.62 * f), 2.0));
  float4 light = over(float4(1.0, 0.55, 0.16, inner), float3(1.0, 0.72, 0.13), outer);

  float2 direction = float2(cos(theta + uTime * 0.03), sin(theta + uTime * 0.03));
  float n1 = snoise(float3(direction * 2.0, uTime * 0.05));
  float n2 = snoise(float3(direction * 5.5, uTime * 0.09 + 4.0));
  float streak = pow(clamp(0.5 + 0.5 * (0.65 * n1 + 0.45 * n2), 0.0, 1.0), 2.2);
  float pulse = snoise(float3(direction * 3.0, away * 1.6 - uTime * 0.55));
  float reach = 0.9 + 1.3 * uBreath;
  float beam = streak * exp(-away * 2.1 / reach) * 0.8;
  beam *= 0.6 + 0.6 * smoothstep(-0.25, 0.75, pulse);
  light = over(light, mix(float3(0.949, 0.271, 0.176), float3(1.0, 0.79, 0.30), streak), min(beam, 1.0));

  float2 counter = float2(cos(theta - uTime * 0.02), sin(theta - uTime * 0.02));
  float glint = pow(clamp(0.5 + 0.5 * snoise(float3(counter * 16.0, uTime * 0.3)), 0.0, 1.0), 7.0);
  float sparkle = glint * exp(-away * 1.3 / reach) * smoothstep(0.0, 0.08, away) * 0.9;
  light = over(light, float3(1.0, 0.86, 0.55), min(sparkle, 1.0));

  float alpha = light.a * smoothstep(0.85, 0.9, r) * (1.0 - smoothstep(uExtent * 0.86, uExtent, r));
  return float4(light.rgb, clamp(alpha, 0.0, 1.0));
}

// p: canvas w/h, layer origin x/y, scale, centre x/y, radius, time, breath,
// rotation rows (9), layer width/height, mode (0 beams, 1 sphere).
kernel void sun(constant float* p [[buffer(0)]],
                device uint* out [[buffer(1)]],
                uint2 gid [[thread_position_in_grid]]) {
  uint w = uint(p[19]);
  uint h = uint(p[20]);
  if (gid.x >= w || gid.y >= h) return;
  float W = p[0], H = p[1], scale = p[4], radius = p[7], uTime = p[8], uBreath = p[9];
  float x = p[2] + (float(gid.x) + 0.5) / scale;
  float y = p[3] + (float(gid.y) + 0.5) / scale;

  // three.js: FOV 30°, camera at z = 12, the sun laid over the CSS box.
  float unit = 2.0 * 12.0 * tan(15.0 * M_PI_F / 180.0) / H;
  float3 C = float3((p[5] - W / 2.0) * unit, (H / 2.0 - p[6]) * unit, 0.0);
  float R = radius * unit;
  float3 P = float3((x - W / 2.0) * unit, (H / 2.0 - y) * unit, 0.0);

  float4 c = float4(0.0);
  if (p[21] < 0.5) {
    float2 q = (P.xy - C.xy) / R;
    float r = length(q);
    if (r > 0.85 && r < 3.0) {
      c = beams(q, uTime, uBreath, 3.0, radius / 235.0);
    }
  } else {
    float3 eye = float3(0.0, 0.0, 12.0);
    float3 dir = normalize(P - eye);
    float3 oc = eye - C;
    float b = dot(oc, dir);
    float dist = length(oc - dir * b);
    float coverage = clamp((R - dist) / (unit / scale) + 0.5, 0.0, 1.0);
    if (coverage > 0.0) {
      float t = -b - sqrt(max(R * R - dist * dist, 0.0));
      float3 hit = eye + dir * t;
      float3 n = (hit - C) / R;
      float mu = clamp(dot(n, normalize(eye - hit)), 0.0, 1.0);
      float3 r0 = float3(p[10], p[11], p[12]);
      float3 r1 = float3(p[13], p[14], p[15]);
      float3 r2 = float3(p[16], p[17], p[18]);
      // Object space: the spin's transpose.
      float3 local = r0 * n.x + r1 * n.y + r2 * n.z;
      c = float4(plasma(local, mu, uTime), coverage);
    }
  }
  float3 rgb = clamp(c.rgb, 0.0, 1.0);
  uint4 v = uint4(round(float4(rgb.b, rgb.g, rgb.r, clamp(c.a, 0.0, 1.0)) * 255.0));
  out[gid.y * w + gid.x] = v.x | (v.y << 8) | (v.z << 16) | (v.w << 24);
}
"#;

pub struct GpuSun {
    device: Device,
    queue: metal::CommandQueue,
    pipeline: ComputePipelineState,
    buffers: Vec<Option<(u64, metal::Buffer)>>,
}

impl GpuSun {
    pub fn new() -> Option<Self> {
        match Self::try_new() {
            Ok(gpu) => Some(gpu),
            Err(err) => {
                eprintln!("plasma sun: no GPU path ({err}), rendering on the CPU");
                None
            }
        }
    }

    fn try_new() -> Result<Self, String> {
        let device = Device::system_default().ok_or("no Metal device")?;
        let library = device.new_library_with_source(SHADER, &CompileOptions::new())?;
        let function = library.get_function("sun", None)?;
        let pipeline = device.new_compute_pipeline_state_with_function(&function)?;
        let queue = device.new_command_queue();
        Ok(Self {
            device,
            queue,
            pipeline,
            buffers: Vec::new(),
        })
    }

    /// Output buffers are reused across frames, grown when the canvas grows.
    fn buffer(&mut self, slot: usize, len: u64) -> metal::Buffer {
        if self.buffers.len() <= slot {
            self.buffers.resize_with(slot + 1, || None);
        }
        let fits = self.buffers[slot].as_ref().is_some_and(|(size, _)| *size >= len);
        if !fits {
            let buffer = self.device.new_buffer(len, MTLResourceOptions::StorageModeShared);
            self.buffers[slot] = Some((len, buffer));
        }
        self.buffers[slot]
            .as_ref()
            .map(|(_, b)| b.clone())
            .expect("allocated above")
    }

    pub fn render(&mut self, params: &FrameParams, quality: Quality) -> (Layer, Layer) {
        objc::rc::autoreleasepool(|| {
            let l = params.layout;
            let reach = l.radius * 3.0;
            let beams_rect = clamp_rect(
                l.center.0 - reach,
                l.center.1 - reach,
                l.center.0 + reach,
                l.center.1 + reach,
                l,
            );
            let margin = l.radius * 0.06 + 2.0;
            let sphere_rect = clamp_rect(
                l.center.0 - l.radius - margin,
                l.center.1 - l.radius - margin,
                l.center.0 + l.radius + margin,
                l.center.1 + l.radius + margin,
                l,
            );
            let jobs = [(beams_rect, quality.beams, 0.0), (sphere_rect, quality.sphere, 1.0)];
            let rot = params.spin.matrix_rows();
            let command = self.queue.new_command_buffer().to_owned();
            let mut outputs = Vec::new();
            for (slot, &(rect, scale, mode)) in jobs.iter().enumerate() {
                let w = ((rect.2 * scale).ceil() as u32).max(1);
                let h = ((rect.3 * scale).ceil() as u32).max(1);
                let values: [f32; 22] = [
                    l.width,
                    l.height,
                    rect.0,
                    rect.1,
                    scale,
                    l.center.0,
                    l.center.1,
                    l.radius,
                    params.time,
                    params.breath,
                    rot[0][0],
                    rot[0][1],
                    rot[0][2],
                    rot[1][0],
                    rot[1][1],
                    rot[1][2],
                    rot[2][0],
                    rot[2][1],
                    rot[2][2],
                    w as f32,
                    h as f32,
                    mode,
                ];
                let uniforms = self.device.new_buffer_with_data(
                    values.as_ptr() as *const _,
                    std::mem::size_of_val(&values) as u64,
                    MTLResourceOptions::StorageModeShared,
                );
                let out = self.buffer(slot, (w * h * 4) as u64);
                let encoder = command.new_compute_command_encoder();
                encoder.set_compute_pipeline_state(&self.pipeline);
                encoder.set_buffer(0, Some(&uniforms), 0);
                encoder.set_buffer(1, Some(&out), 0);
                encoder.dispatch_threads(MTLSize::new(w as u64, h as u64, 1), MTLSize::new(16, 16, 1));
                encoder.end_encoding();
                outputs.push((rect, w, h, out));
            }
            command.commit();
            command.wait_until_completed();
            let mut layers = outputs.into_iter().map(|(rect, w, h, out)| {
                let len = (w * h * 4) as usize;
                let bgra = unsafe { std::slice::from_raw_parts(out.contents() as *const u8, len) }.to_vec();
                Layer {
                    rect,
                    width: w,
                    height: h,
                    bgra,
                }
            });
            let beams = layers.next().unwrap();
            let sphere = layers.next().unwrap();
            (beams, sphere)
        })
    }
}

fn clamp_rect(x0: f32, y0: f32, x1: f32, y1: f32, l: crate::sun::Layout) -> (f32, f32, f32, f32) {
    let (x0, y0) = (x0.max(0.0).floor(), y0.max(0.0).floor());
    let (x1, y1) = (x1.min(l.width).ceil(), y1.min(l.height).ceil());
    (x0, y0, (x1 - x0).max(1.0), (y1 - y0).max(1.0))
}
