//! `<Skeleton>`: a translucent block with a highlight sweeping across it.
//!
//! The web skeleton uses `background-attachment: fixed`, so the 120° shimmer is
//! laid out over the whole viewport and every skeleton on screen shows a slice
//! of the same band: they shimmer in sync, as one wave. That is reproduced by
//! painting the band in window coordinates, clipped to each skeleton's shape.

use gpui::{Bounds, Pixels, Rgba, Size, Window, canvas, prelude::*};

use crate::anim;
use crate::paint::{self, Field};
use crate::theme::colors;

/// `colors.skeleton` and `colors.skeletonHighlight` (dark theme).
const BASE: f32 = 0.08;
const HIGHLIGHT: f32 = 0.07;

pub fn paint(window: &mut Window, bounds: Bounds<Pixels>, radius: f32, viewport: Size<Pixels>) {
    let shape = paint::rounded_rect(bounds, radius);
    paint::fill_poly(window, &shape, colors::white(BASE));

    // `backgroundSize: 200% 100%` of the viewport, animated from position 0 to
    // -200% over 2s (starting 1s in): the tile moves right by 2W per cycle.
    let (vw, vh) = (f32::from(viewport.width), f32::from(viewport.height));
    let cycle = ((anim::clock() + 1.0) % 2.0) as f32 / 2.0;
    let offset = 2.0 * vw * cycle;
    let white = |a: f32| Rgba {
        r: 1.0,
        g: 1.0,
        b: 1.0,
        a,
    };
    for k in -2..=1 {
        let x = offset + 2.0 * vw * k as f32;
        let field = Field::css(120.0, x, 0.0, 2.0 * vw, vh);
        paint::paint_gradient_span(
            window,
            &shape,
            field,
            &[(0.4, white(0.0)), (0.5, white(HIGHLIGHT)), (0.6, white(0.0))],
        );
    }
}

/// A skeleton filling its parent.
pub fn fill(radius: f32) -> impl IntoElement {
    canvas(
        |_, _, _| {},
        move |bounds, _, window: &mut Window, _| {
            let viewport = window.viewport_size();
            paint(window, bounds, radius, viewport);
            window.request_animation_frame();
        },
    )
    .size_full()
}
