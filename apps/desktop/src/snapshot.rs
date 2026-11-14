//! Debug captures of the app's own window (no screen-recording permission is
//! needed to read back one's own windows). `TAIYO_SNAPSHOT=dir` writes
//! `dir/<n>.png` every `TAIYO_SNAPSHOT_EVERY` ms (default 1000), starting
//! after `TAIYO_SNAPSHOT_DELAY` ms, `TAIYO_SNAPSHOT_COUNT` times, then quits.

use std::ffi::c_void;
use std::time::Duration;

use gpui::{App, Window};
use raw_window_handle::{HasWindowHandle, RawWindowHandle};

#[repr(C)]
#[derive(Clone, Copy)]
struct CGRect {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

#[link(name = "CoreGraphics", kind = "framework")]
unsafe extern "C" {
    fn CGWindowListCreateImage(rect: CGRect, list: u32, window: u32, options: u32) -> *const c_void;
    fn CGImageGetWidth(image: *const c_void) -> usize;
    fn CGImageGetHeight(image: *const c_void) -> usize;
    fn CGImageGetBytesPerRow(image: *const c_void) -> usize;
    fn CGImageGetDataProvider(image: *const c_void) -> *const c_void;
    fn CGDataProviderCopyData(provider: *const c_void) -> *const c_void;
    fn CGImageRelease(image: *const c_void);
    fn CGColorSpaceCreateWithName(name: *const c_void) -> *const c_void;
    fn CGBitmapContextCreate(
        data: *mut c_void,
        w: usize,
        h: usize,
        bits: usize,
        stride: usize,
        space: *const c_void,
        info: u32,
    ) -> *const c_void;
    fn CGContextDrawImage(ctx: *const c_void, rect: CGRect, image: *const c_void);
    fn CGContextRelease(ctx: *const c_void);
    fn CGColorSpaceRelease(space: *const c_void);
    static kCGColorSpaceSRGB: *const c_void;
}

#[link(name = "CoreFoundation", kind = "framework")]
unsafe extern "C" {
    fn CFDataGetBytePtr(data: *const c_void) -> *const u8;
    fn CFDataGetLength(data: *const c_void) -> isize;
    fn CFRelease(obj: *const c_void);
}

fn window_number(window: &Window) -> Option<u32> {
    use objc::{msg_send, runtime::Object, sel, sel_impl};
    let handle = HasWindowHandle::window_handle(window).ok()?;
    let RawWindowHandle::AppKit(appkit) = handle.as_raw() else {
        return None;
    };
    let view = appkit.ns_view.as_ptr() as *mut Object;
    unsafe {
        let ns_window: *mut Object = msg_send![view, window];
        let number: isize = msg_send![ns_window, windowNumber];
        Some(number as u32)
    }
}

pub fn capture(window: &Window, path: &str) -> anyhow::Result<()> {
    let id = window_number(window).ok_or_else(|| anyhow::anyhow!("no window number"))?;
    unsafe {
        let null = CGRect {
            x: f64::INFINITY,
            y: f64::INFINITY,
            w: 0.0,
            h: 0.0,
        };
        // IncludingWindow, BoundsIgnoreFraming | BestResolution.
        let image = CGWindowListCreateImage(null, 1 << 3, id, (1 << 0) | (1 << 3));
        if image.is_null() {
            anyhow::bail!("CGWindowListCreateImage returned null");
        }
        let (w, h) = (CGImageGetWidth(image), CGImageGetHeight(image));
        // The capture is in the display's colour space (Display P3 here);
        // match it back to sRGB, the space the web screenshots are in.
        let stride = w * 4;
        let mut buf = vec![0u8; stride * h];
        let space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
        // kCGImageAlphaPremultipliedFirst | kCGBitmapByteOrder32Little: BGRA.
        let ctx = CGBitmapContextCreate(buf.as_mut_ptr() as *mut c_void, w, h, 8, stride, space, 2 | (2 << 12));
        CGContextDrawImage(
            ctx,
            CGRect {
                x: 0.0,
                y: 0.0,
                w: w as f64,
                h: h as f64,
            },
            image,
        );
        let mut out = image::RgbaImage::new(w as u32, h as u32);
        for y in 0..h {
            for x in 0..w {
                let i = y * stride + x * 4;
                out.put_pixel(x as u32, y as u32, image::Rgba([buf[i + 2], buf[i + 1], buf[i], 255]));
            }
        }
        CGContextRelease(ctx);
        CGColorSpaceRelease(space);
        CGImageRelease(image);
        let _ = (
            CGImageGetBytesPerRow,
            CGImageGetDataProvider,
            CGDataProviderCopyData,
            CFDataGetBytePtr,
            CFDataGetLength,
            CFRelease,
        );
        out.save(path)?;
    }
    Ok(())
}

pub fn schedule(window: &mut Window, cx: &mut App) {
    let Ok(dir) = std::env::var("TAIYO_SNAPSHOT") else {
        return;
    };
    let env = |k: &str, d: u64| std::env::var(k).ok().and_then(|v| v.parse().ok()).unwrap_or(d);
    let delay = env("TAIYO_SNAPSHOT_DELAY", 4000);
    let every = env("TAIYO_SNAPSHOT_EVERY", 1000);
    let count = env("TAIYO_SNAPSHOT_COUNT", 1);
    let handle: gpui::AnyWindowHandle = gpui::Window::window_handle(&*window);
    // Stand in for the display link (stopped while the screen is locked):
    // draw and present a frame every 16ms.
    #[cfg(feature = "snapshot")]
    cx.spawn(async move |cx| {
        let trace = std::env::var("TAIYO_TRACE_FRAMES").is_ok();
        let mut samples: Vec<f64> = Vec::new();
        loop {
            cx.background_executor().timer(Duration::from_millis(16)).await;
            let alive = handle.update(cx, |_, window, cx| {
                let started = std::time::Instant::now();
                window.draw(cx).clear();
                window.present();
                window.complete_frame();
                if trace {
                    samples.push(started.elapsed().as_secs_f64() * 1000.0);
                    if samples.len() == 120 {
                        samples.sort_by(f64::total_cmp);
                        eprintln!(
                            "frame ms: median {:.2} p95 {:.2} max {:.2}",
                            samples[60], samples[114], samples[119]
                        );
                        samples.clear();
                    }
                }
            });
            if alive.is_err() {
                break;
            }
        }
    })
    .detach();
    cx.spawn(async move |cx| {
        cx.background_executor().timer(Duration::from_millis(delay)).await;
        for n in 0..count {
            let path = format!("{dir}/{n}.png");
            // A locked screen stops the display link; a resize still makes
            // AppKit ask the layer for a fresh frame.
            #[cfg(feature = "snapshot")]
            let _ = handle.update(cx, |_, window, cx| {
                window.refresh();
                window.draw(cx).clear();
                window.present();
                window.complete_frame();
            });
            let _ = handle.update(cx, |_, window, _| {
                if let Err(err) = capture(window, &path) {
                    eprintln!("snapshot failed: {err}");
                }
            });
            cx.background_executor().timer(Duration::from_millis(every)).await;
        }
        let _ = cx.update(|cx| cx.quit());
    })
    .detach();
}
