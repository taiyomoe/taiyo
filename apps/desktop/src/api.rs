//! The Taiyō API, as the web app calls it: better-auth for the session, the
//! public endpoints for the home page. Everything here blocks; callers run it
//! on GPUI's background executor.

use std::collections::HashMap;
use std::sync::{Arc, OnceLock};
use std::time::Duration;

use anyhow::{Context as _, Result, anyhow};
use image::DynamicImage;
use serde::{Deserialize, Serialize};

pub fn api_url() -> String {
    std::env::var("TAIYO_API_URL").unwrap_or_else(|_| "http://localhost:3062".into())
}

/// better-auth only accepts sign-ins from a trusted origin: the web app's.
fn web_origin() -> String {
    std::env::var("TAIYO_WEB_URL").unwrap_or_else(|_| "http://localhost:3060".into())
}

fn agent() -> &'static ureq::Agent {
    static AGENT: OnceLock<ureq::Agent> = OnceLock::new();
    AGENT.get_or_init(|| {
        ureq::AgentBuilder::new()
            .timeout_connect(Duration::from_secs(5))
            .timeout(Duration::from_secs(30))
            .redirects(0)
            .build()
    })
}

#[derive(Deserialize)]
struct Envelope<T> {
    data: T,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub name: String,
    #[serde(default)]
    pub settings: Settings,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub content_rating: Option<Vec<String>>,
    pub latest_updates_layout: Option<Layout>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum Layout {
    List,
    Grid,
    Compact,
}

#[derive(Clone, Debug)]
pub struct Session {
    pub token: String,
    pub user: User,
}

impl Session {
    pub fn content_ratings(&self) -> String {
        self.user
            .settings
            .content_rating
            .clone()
            .unwrap_or_else(|| vec!["NORMAL".into(), "SUGGESTIVE".into()])
            .join(",")
    }

    pub fn layout(&self) -> Layout {
        self.user.settings.latest_updates_layout.unwrap_or(Layout::List)
    }

    /// "Test Group Member" -> "TG", like the web avatar fallback.
    pub fn initials(&self) -> String {
        self.user
            .name
            .split_whitespace()
            .take(2)
            .filter_map(|part| part.chars().next())
            .flat_map(char::to_uppercase)
            .collect()
    }

    fn cookie(&self) -> String {
        format!("better-auth.session_token={}", self.token)
    }
}

#[derive(Deserialize)]
struct SessionResponse {
    user: User,
}

fn api_error(err: ureq::Error) -> anyhow::Error {
    match err {
        ureq::Error::Status(_, response) => {
            #[derive(Deserialize)]
            struct Body {
                message: Option<String>,
            }
            response
                .into_json::<Body>()
                .ok()
                .and_then(|b| b.message)
                .map_or_else(|| anyhow!("Something went wrong. Please try again."), |m| anyhow!(m))
        }
        ureq::Error::Transport(t) => anyhow!("Couldn't reach Taiyō: {t}"),
    }
}

pub fn fetch_session(token: &str) -> Result<Option<Session>> {
    let response = agent()
        .get(&format!("{}/api/auth/get-session", api_url()))
        .set("Cookie", &format!("better-auth.session_token={token}"))
        .call()
        .map_err(api_error)?;
    let body: Option<SessionResponse> = response.into_json().context("decode the session")?;
    Ok(body.map(|b| Session {
        token: token.into(),
        user: b.user,
    }))
}

/// `POST /api/auth/sign-in/email`, then reads the session the cookie opens.
pub fn sign_in(email: &str, password: &str, remember: bool) -> Result<Session> {
    let response = agent()
        .post(&format!("{}/api/auth/sign-in/email", api_url()))
        .set("Origin", &web_origin())
        .send_json(serde_json::json!({ "email": email, "password": password, "rememberMe": remember }))
        .map_err(api_error)?;
    let token = response
        .all("set-cookie")
        .into_iter()
        .find_map(|c| c.strip_prefix("better-auth.session_token="))
        .and_then(|c| c.split(';').next())
        .map(str::to_owned)
        .ok_or_else(|| anyhow!("The server did not open a session."))?;
    fetch_session(&token)?.ok_or_else(|| anyhow!("The server did not open a session."))
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeaturedMedia {
    pub id: String,
    pub title: Option<String>,
    #[serde(default)]
    pub synopsis: HashMap<String, String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub authors: Vec<String>,
    pub cover_url: Option<String>,
    pub banner_url: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct Group {
    pub id: String,
    pub name: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Uploader {
    pub display_username: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LatestChapter {
    pub id: String,
    pub title: Option<String>,
    pub number: f64,
    pub language: String,
    pub created_at: String,
    pub groups: Vec<Group>,
    pub uploader: Uploader,
    pub media_title: Option<String>,
    pub media_cover_url: Option<String>,
}

/// `TAIYO_SLOW_API=ms`: hold every page request, to look at the skeletons.
fn debug_delay() {
    if let Some(ms) = std::env::var("TAIYO_SLOW_API").ok().and_then(|v| v.parse().ok()) {
        std::thread::sleep(Duration::from_millis(ms));
    }
}

pub fn featured(session: &Session) -> Result<Vec<FeaturedMedia>> {
    debug_delay();
    let response = agent()
        .get(&format!("{}/medias/featured", api_url()))
        .query("contentRating", &session.content_ratings())
        .set("Cookie", &session.cookie())
        .call()
        .map_err(api_error)?;
    Ok(response.into_json::<Envelope<Vec<FeaturedMedia>>>()?.data)
}

pub fn latest(session: &Session, per_page: usize) -> Result<Vec<LatestChapter>> {
    debug_delay();
    let response = agent()
        .get(&format!("{}/chapters/latest", api_url()))
        .query("contentRating", &session.content_ratings())
        .query("perPage", &per_page.to_string())
        .set("Cookie", &session.cookie())
        .call()
        .map_err(api_error)?;
    Ok(response.into_json::<Envelope<Vec<LatestChapter>>>()?.data)
}

pub fn save_layout(session: &Session, layout: Layout) -> Result<()> {
    agent()
        .request("PATCH", &format!("{}/users/me/settings", api_url()))
        .set("Cookie", &session.cookie())
        .set("Origin", &web_origin())
        .send_json(serde_json::json!({ "latestUpdatesLayout": layout }))
        .map_err(api_error)?;
    Ok(())
}

pub fn download_image(url: &str) -> Result<Arc<DynamicImage>> {
    let response = agent().get(url).call().map_err(api_error)?;
    let mut bytes = Vec::new();
    response.into_reader().read_to_end(&mut bytes)?;
    Ok(Arc::new(image::load_from_memory(&bytes)?))
}

use std::io::Read as _;

// ------------------------------------------------------------ labels ----

fn genre_names() -> &'static HashMap<String, String> {
    static GENRES: OnceLock<HashMap<String, String>> = OnceLock::new();
    GENRES.get_or_init(|| {
        crate::assets::Assets::get("genres.json")
            .and_then(|f| serde_json::from_slice(&f.data).ok())
            .unwrap_or_default()
    })
}

/// The first eight tags that are genres, by their English name.
pub fn genres(tags: &[String]) -> Vec<String> {
    tags.iter()
        .filter_map(|t| genre_names().get(t).cloned())
        .take(8)
        .collect()
}

/// `getSynopsis` + `getRichTextParagraphs`: the localized synopsis up to its
/// first horizontal rule, markdown stripped, on a single line.
pub fn synopsis(values: &HashMap<String, String>) -> String {
    let text = values
        .get("en")
        .or_else(|| values.values().find(|v| !v.is_empty()))
        .cloned()
        .unwrap_or_default();
    let mut first = String::new();
    for line in text.lines() {
        let trimmed = line.trim();
        let rule = trimmed.len() >= 3
            && (trimmed.chars().all(|c| c == '-')
                || trimmed.chars().all(|c| c == '_')
                || trimmed.chars().all(|c| c == '*'));
        if rule {
            break;
        }
        first.push_str(line);
        first.push('\n');
    }
    let stripped: String = first.replace("||", "").replace("**", "").replace("__", "");
    let mut out = String::new();
    let mut chars = stripped.chars().peekable();
    // [label](url) -> label
    while let Some(c) = chars.next() {
        if c == ']' && chars.peek() == Some(&'(') {
            for d in chars.by_ref() {
                if d == ')' {
                    break;
                }
            }
            continue;
        }
        if c == '[' {
            continue;
        }
        out.push(c);
    }
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// `Intl.RelativeTimeFormat("en", { style: "narrow" })`, as `formatTimeAgo`.
pub fn time_ago(iso: &str) -> String {
    let Ok(date) = chrono::DateTime::parse_from_rfc3339(iso) else {
        return String::new();
    };
    let elapsed = (chrono::Utc::now() - date.with_timezone(&chrono::Utc))
        .num_seconds()
        .max(0);
    let units = [
        (31_536_000, "y"),
        (2_592_000, "mo"),
        (604_800, "w"),
        (86_400, "d"),
        (3600, "h"),
        (60, "m"),
    ];
    for (seconds, unit) in units {
        if elapsed >= seconds {
            return format!("{}{unit} ago", elapsed / seconds);
        }
    }
    "just now".into()
}

pub fn language_code(language: &str) -> String {
    language.replace('_', "-").to_uppercase()
}

pub fn chapter_label(number: f64) -> String {
    if number.fract() == 0.0 {
        format!("Ch. {}", number as i64)
    } else {
        format!("Ch. {number}")
    }
}

// ----------------------------------------------------------- storage ----

#[derive(Default, Serialize, Deserialize)]
pub struct Stored {
    pub token: Option<String>,
    pub last_login_method: Option<String>,
}

fn state_path() -> Option<std::path::PathBuf> {
    let home = std::env::var_os("HOME")?;
    Some(std::path::Path::new(&home).join("Library/Application Support/taiyo-desktop/state.json"))
}

pub fn load_state() -> Stored {
    state_path()
        .and_then(|p| std::fs::read(p).ok())
        .and_then(|b| serde_json::from_slice(&b).ok())
        .unwrap_or_default()
}

pub fn save_state(state: &Stored) {
    if let Some(path) = state_path() {
        if let Some(dir) = path.parent() {
            let _ = std::fs::create_dir_all(dir);
        }
        if let Ok(bytes) = serde_json::to_vec_pretty(state) {
            let _ = std::fs::write(path, bytes);
        }
    }
}
