const NOISE = `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Taiyō sun ramp: #FFF1C8 0, #FFD060 .26, #FFB820 .46, #F2452D .70, #C8301C 1
vec3 sunRamp(float t) {
  vec3 c = mix(vec3(1.0, 0.945, 0.784), vec3(1.0, 0.816, 0.376), smoothstep(0.0, 0.26, t));
  c = mix(c, vec3(1.0, 0.722, 0.125), smoothstep(0.26, 0.46, t));
  c = mix(c, vec3(0.949, 0.271, 0.176), smoothstep(0.46, 0.70, t));
  return mix(c, vec3(0.784, 0.188, 0.110), smoothstep(0.70, 1.0, t));
}
`

export const SPHERE_VERTEX = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  vPosition = position;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

export const PLASMA_FRAGMENT = `
uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
${NOISE}

float fbm(vec3 p) {
  float amplitude = 0.5;
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * snoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return sum;
}

void main() {
  vec3 p = normalize(vPosition) * 2.0;
  float t = uTime * 0.07;
  vec3 q = vec3(fbm(p + vec3(0.0, t, 0.0)), fbm(p + vec3(5.2, 1.3, t)), fbm(p + vec3(t, 9.2, 3.1)));
  float n = fbm(p * 1.7 + 1.6 * q + vec3(0.0, 0.0, t * 1.4));
  float cells = 0.5 + 0.5 * snoise(normalize(vPosition) * 14.0 + vec3(t * 4.0));
  float heat = (0.5 + 0.55 * n) * 0.82 + cells * 0.18;
  float mu = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
  vec3 c = sunRamp(clamp(1.0 - heat * 0.95 - pow(mu, 1.5) * 0.12 + 0.15, 0.0, 1.0));
  c *= 0.62 + 0.38 * pow(mu, 0.45);
  c += vec3(1.0, 0.55, 0.15) * pow(1.0 - mu, 3.5) * 0.4;
  gl_FragColor = vec4(c, 1.0);
}
`

export const PLANE_VERTEX = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// The disc's fixed glow plus soft beams that reach further on each breath,
// turn slowly around the sun and carry pulses of light outwards, with thin
// sparkling rays on top. Distances are in sun radii; uSize (sun radius / 235px)
// keeps the light around a large sun from growing as fast as the sun itself.
export const BEAMS_FRAGMENT = `
uniform float uTime;
uniform float uBreath;
uniform float uExtent;
uniform float uSize;
varying vec2 vUv;
${NOISE}

vec4 over(vec4 under, vec3 color, float alpha) {
  float a = alpha + under.a * (1.0 - alpha);
  return vec4(mix(under.rgb, color, alpha / max(a, 0.001)), a);
}

void main() {
  vec2 p = (vUv - 0.5) * 2.0 * uExtent;
  float f = inversesqrt(uSize);
  float r = length(p);
  float theta = atan(p.y, p.x);
  float away = max(r - 1.0, 0.0) / f;

  float inner = 0.55 * exp(-pow(max(r - 1.0 - 0.17 * f, 0.0) / (0.34 * f), 2.0));
  float outer = 0.30 * exp(-pow(max(r - 1.0 - 0.47 * f, 0.0) / (0.62 * f), 2.0));
  vec4 light = over(vec4(1.0, 0.55, 0.16, inner), vec3(1.0, 0.72, 0.13), outer);

  vec2 direction = vec2(cos(theta + uTime * 0.03), sin(theta + uTime * 0.03));
  float n1 = snoise(vec3(direction * 2.0, uTime * 0.05));
  float n2 = snoise(vec3(direction * 5.5, uTime * 0.09 + 4.0));
  float streak = pow(clamp(0.5 + 0.5 * (0.65 * n1 + 0.45 * n2), 0.0, 1.0), 2.2);
  float pulse = snoise(vec3(direction * 3.0, away * 1.6 - uTime * 0.55));
  float reach = 0.9 + 1.3 * uBreath;
  float beam = streak * exp(-away * 2.1 / reach) * 0.8;
  beam *= 0.6 + 0.6 * smoothstep(-0.25, 0.75, pulse);
  light = over(light, mix(vec3(0.949, 0.271, 0.176), vec3(1.0, 0.79, 0.30), streak), min(beam, 1.0));

  vec2 counter = vec2(cos(theta - uTime * 0.02), sin(theta - uTime * 0.02));
  float glint = pow(clamp(0.5 + 0.5 * snoise(vec3(counter * 16.0, uTime * 0.3)), 0.0, 1.0), 7.0);
  float sparkle = glint * exp(-away * 1.3 / reach) * smoothstep(0.0, 0.08, away) * 0.9;
  light = over(light, vec3(1.0, 0.86, 0.55), min(sparkle, 1.0));

  float alpha = light.a * smoothstep(0.85, 0.9, r) * (1.0 - smoothstep(uExtent * 0.86, uExtent, r));
  gl_FragColor = vec4(light.rgb, clamp(alpha, 0.0, 1.0));
}
`
