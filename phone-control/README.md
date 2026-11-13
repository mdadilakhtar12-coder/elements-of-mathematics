# Phone Control MCP (personal)

Claude (claude.ai custom connector) -> your relay server (Render) -> your Android phone.
You say "Flipkart me yeh item cart me daal do", Claude calls generic tools
(`read_screen`, `tap`, `type_text`, ...) and the phone does it.

```
claude.ai  --(MCP, Streamable HTTP + OAuth)-->  relay server /mcp
                                                relay server /device  <--(WebSocket, device token)--  phone app
```

| Folder | What |
| --- | --- |
| `android/` | The phone app (Kotlin, min Android 8.0 / SDK 26). Built by GitHub Actions, no Android Studio needed. |
| `server/` | The relay server (Node.js + TypeScript). *Phase 2.* |

## Status

- [x] **Phase 1** - Android app: Accessibility service, all tools, safety rules, debug screen.
- [ ] Phase 2 - Relay server locally + phone connection + MCP Inspector test.
- [ ] Phase 3 - Deploy on Render, authentication, add connector in Claude.
- [ ] Phase 4 - End-to-end: Flipkart search + add to cart.
- [ ] Phase 5 - Reliability: reconnects, battery exemption, timeouts, clear errors.

## What we checked before building (Nov 2026)

- **MCP spec:** latest revision is `2026-07-28` (stateless HTTP, no sessions). The official
  TypeScript SDK (`@modelcontextprotocol/sdk` 1.32.x) speaks up to `2025-11-25`, which is what
  Claude's connector docs list. We use the SDK in **stateless Streamable HTTP** mode, which fits both.
- **Claude custom connectors:** transport = Streamable HTTP (old HTTP+SSE is being phased out).
  Auth = none, or OAuth 2.1 with PKCE (S256), discovered through `401` + `WWW-Authenticate`
  + protected-resource metadata; client registration by CIMD or Dynamic Client Registration.
  OAuth callback: `https://claude.ai/api/mcp/auth_callback`. Tool calls time out after ~240 s,
  results up to ~150k characters. The server must be public HTTPS.
  We will implement our own tiny OAuth server (only you can approve, with your password).
- **Render free plan:** a free web service sleeps after 15 min without incoming HTTP requests
  **or incoming WebSocket messages**. The phone app will send a small ping every few minutes,
  so it stays awake. Still, free instances can restart (deploys, maintenance): the phone
  reconnects automatically (Phase 5). Cheapest "never sleeps" fix: Render **Starter, about $7/month**.

## Safety rules (enforced on the phone, not just the server)

- Blocked apps: banking, UPI, wallets, payment and password-manager/authenticator apps
  (`SafetyPolicy.kt` list + keywords like `bank`, `upi`, `wallet`, `password`). Their screens are
  not read and nothing is tapped. You can add more package names in the app.
- Never types into password fields, or fields that look like OTP / PIN / CVV / card number /
  expiry / Aadhaar / PAN; never types something that looks like a card number.
- Risky buttons ("Pay", "Place order", "Buy now", "Send", "Checkout", "Transfer", "Delete"...)
  show a pop-up on the phone; nothing happens unless you tap **Allow** within 60 s.
- **Pause** switch: every action is refused, and a running one is cancelled at once.
- Secure screens (`FLAG_SECURE`) are not bypassed: screenshot simply returns an error.
- Every action is written to the log on the home screen.

## Tools (what Claude can call)

| Tool | Args | Notes |
| --- | --- | --- |
| `list_apps` | - | name + package, blocked ones marked |
| `open_app` | `package` | returns the new screen |
| `read_screen` | - | compact list: `#id Type "text" desc= hint= [l,t,r,b] click edit scroll` |
| `tap` | `element_id` | id from the latest screen; returns new screen |
| `tap_xy` | `x`, `y` | pixel coordinates |
| `type_text` | `element_id`, `text`, `submit?` | `submit: true` presses Enter/Search (Android 11+) |
| `scroll` | `direction` up/down/left/right | "down" = see more of the page below |
| `swipe` | `x1,y1,x2,y2`, `duration_ms?` | |
| `press_back`, `press_home` | - | |
| `wait` | `ms` (max 10000) | returns the screen after waiting |
| `screenshot` | - | Android 11+, small JPEG; only if `read_screen` is not enough |

## Phase 1 - install and test on your phone

1. **Download the APK**: open
   `https://github.com/mdadilakhtar12-coder/elements-of-mathematics/releases/download/phonecontrol-latest/PhoneControl.apk`
   on the phone (if the repo is private: GitHub > Actions > "Phone Control Android" > latest run >
   Artifacts > `phone-control-apk`, unzip).
2. Open the file, allow "Install unknown apps" for your browser/Files app when asked, install.
   If Play Protect warns, choose "More details > Install anyway" (it's your own app).
3. Open **Phone Control**. Tap **"1. Open Accessibility settings"** > Installed apps / Downloaded apps >
   **Phone Control (Claude)** > turn ON > Allow.
   - Greyed out / "Restricted setting"? Go back to the app, tap **"App info"**, then the 3-dot menu
     (top right) > **Allow restricted settings**, then try again.
4. Back in the app, the top line should say **Accessibility: ON** (green).
5. Tap **Debug / local test**:
   - Press `read_screen`, then **Run now** -> you should see the debug screen's own buttons listed as `#1 Button "read_screen" ...`.
   - Press `open_app` (it is pre-filled with Flipkart), **Run now** -> Flipkart opens, after ~5 s the debug screen comes back with Flipkart's elements.
   - Press `read_screen`, **Run after delay**, switch to Flipkart within 5 s -> you get Flipkart's element list.
   - Pick the search box id from that list, put it in `tap` (`{"element_id": 7}` for example), Run after delay, switch to Flipkart -> it taps.
   - Turn **Pause** ON in the home screen and run anything -> it must say "PAUSED".
6. Send me: did each step work? If something failed, copy the text from the debug screen / action log.

## Updating the app

Every push to `phone-control/android/**` builds a new APK at the same link. It is signed with the
same key, so it installs over the old one and keeps your settings. (The signing key is in the
repo on purpose - it's a personal app. Anyone with repo access could build an APK with the same
signature, so keep the repo private, and only install APKs from this link.)
