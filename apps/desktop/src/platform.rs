//! macOS window chrome.

use gpui::Window;
use raw_window_handle::{HasWindowHandle, RawWindowHandle};

/// A dark title bar over the dark app, whatever the system appearance.
pub fn use_dark_appearance(window: &Window) {
    use objc::runtime::{Class, Object};
    use objc::{msg_send, sel, sel_impl};
    let Ok(handle) = HasWindowHandle::window_handle(window) else {
        return;
    };
    let RawWindowHandle::AppKit(appkit) = handle.as_raw() else {
        return;
    };
    unsafe {
        let view = appkit.ns_view.as_ptr() as *mut Object;
        let ns_window: *mut Object = msg_send![view, window];
        let (Some(appearance_class), Some(string_class)) = (Class::get("NSAppearance"), Class::get("NSString")) else {
            return;
        };
        let name: *mut Object = msg_send![string_class, stringWithUTF8String: c"NSAppearanceNameDarkAqua".as_ptr()];
        let appearance: *mut Object = msg_send![appearance_class, appearanceNamed: name];
        let _: () = msg_send![ns_window, setAppearance: appearance];
    }
}
