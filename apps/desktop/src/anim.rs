//! CSS timing functions and a tween that interpolates towards a target the way
//! a CSS transition does: retargeting mid-flight starts from the current value.

use std::time::{Duration, Instant};

/// `cubic-bezier(x1, y1, x2, y2)`, solved for x with Newton then bisection,
/// the same way browsers evaluate it.
#[derive(Clone, Copy, Debug)]
pub struct CubicBezier {
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
}

impl CubicBezier {
    pub const fn new(x1: f64, y1: f64, x2: f64, y2: f64) -> Self {
        Self { x1, y1, x2, y2 }
    }

    fn sample(a1: f64, a2: f64, t: f64) -> f64 {
        let c = 3.0 * a1;
        let b = 3.0 * (a2 - a1) - c;
        let a = 1.0 - c - b;
        ((a * t + b) * t + c) * t
    }

    fn slope(a1: f64, a2: f64, t: f64) -> f64 {
        let c = 3.0 * a1;
        let b = 3.0 * (a2 - a1) - c;
        let a = 1.0 - c - b;
        (3.0 * a * t + 2.0 * b) * t + c
    }

    pub fn ease(&self, x: f32) -> f32 {
        let x = (x as f64).clamp(0.0, 1.0);
        if x == 0.0 || x == 1.0 {
            return x as f32;
        }
        let mut t = x;
        for _ in 0..8 {
            let err = Self::sample(self.x1, self.x2, t) - x;
            if err.abs() < 1e-7 {
                return Self::sample(self.y1, self.y2, t) as f32;
            }
            let d = Self::slope(self.x1, self.x2, t);
            if d.abs() < 1e-6 {
                break;
            }
            t -= err / d;
        }
        let (mut lo, mut hi) = (0.0, 1.0);
        t = x;
        for _ in 0..40 {
            let v = Self::sample(self.x1, self.x2, t);
            if (v - x).abs() < 1e-7 {
                break;
            }
            if v < x {
                lo = t;
            } else {
                hi = t;
            }
            t = (lo + hi) / 2.0;
        }
        Self::sample(self.y1, self.y2, t) as f32
    }
}

/// `motion.easeOut` from the design tokens.
pub const EASE_OUT: CubicBezier = CubicBezier::new(0.23, 1.0, 0.32, 1.0);
pub const EASE: CubicBezier = CubicBezier::new(0.25, 0.1, 0.25, 1.0);
pub const EASE_IN_OUT: CubicBezier = CubicBezier::new(0.42, 0.0, 0.58, 1.0);

/// `motion.spring`: the `linear()` easing the tab indicator rides on.
const SPRING: [(f32, f32); 25] = [
    (0.0, 0.0),
    (0.042, 0.045),
    (0.083, 0.153),
    (0.125, 0.291),
    (0.167, 0.434),
    (0.208, 0.569),
    (0.25, 0.688),
    (0.292, 0.787),
    (0.333, 0.866),
    (0.375, 0.925),
    (0.417, 0.968),
    (0.458, 0.996),
    (0.5, 1.014),
    (0.542, 1.024),
    (0.583, 1.028),
    (0.625, 1.028),
    (0.667, 1.026),
    (0.708, 1.022),
    (0.75, 1.018),
    (0.792, 1.014),
    (0.833, 1.01),
    (0.875, 1.007),
    (0.917, 1.005),
    (0.958, 1.003),
    (1.0, 1.0),
];

pub fn spring(x: f32) -> f32 {
    let x = x.clamp(0.0, 1.0);
    for pair in SPRING.windows(2) {
        let (x0, y0) = pair[0];
        let (x1, y1) = pair[1];
        if x <= x1 {
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
        }
    }
    1.0
}

#[derive(Clone, Copy, Debug)]
pub enum Easing {
    Linear,
    Bezier(CubicBezier),
    Spring,
}

impl Easing {
    pub fn apply(self, x: f32) -> f32 {
        match self {
            Easing::Linear => x.clamp(0.0, 1.0),
            Easing::Bezier(curve) => curve.ease(x),
            Easing::Spring => spring(x),
        }
    }
}

/// A value animated with CSS-transition semantics.
#[derive(Clone, Debug)]
pub struct Tween {
    from: f32,
    to: f32,
    start: Instant,
    duration: Duration,
    easing: Easing,
}

impl Tween {
    pub fn new(value: f32, duration: Duration, easing: Easing) -> Self {
        Self {
            from: value,
            to: value,
            start: Instant::now() - duration,
            duration,
            easing,
        }
    }

    pub fn value(&self) -> f32 {
        self.value_at(Instant::now())
    }

    pub fn value_at(&self, now: Instant) -> f32 {
        let progress = self.progress(now);
        self.from + (self.to - self.from) * self.easing.apply(progress)
    }

    fn progress(&self, now: Instant) -> f32 {
        if self.duration.is_zero() {
            return 1.0;
        }
        (now.saturating_duration_since(self.start).as_secs_f32() / self.duration.as_secs_f32()).min(1.0)
    }

    pub fn target(&self) -> f32 {
        self.to
    }

    pub fn is_animating(&self) -> bool {
        self.progress(Instant::now()) < 1.0
    }

    /// Starts moving towards `to` from wherever the value is right now.
    pub fn set(&mut self, to: f32) {
        if (to - self.to).abs() < f32::EPSILON {
            return;
        }
        let now = Instant::now();
        self.from = self.value_at(now);
        self.to = to;
        self.start = now;
    }

    pub fn jump(&mut self, to: f32) {
        self.from = to;
        self.to = to;
        self.start = Instant::now() - self.duration;
    }
}

/// Seconds since the app started; the clock every looping animation reads.
pub fn clock() -> f64 {
    use std::sync::OnceLock;
    static START: OnceLock<Instant> = OnceLock::new();
    START.get_or_init(Instant::now).elapsed().as_secs_f64()
}
