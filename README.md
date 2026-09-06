<p align="center">
  <img src="assets/images/logo_solid.png" alt="Himnario Ebenezer" width="100%"/>
</p>

<h1 align="center">Ebenezer Hymnal</h1>

<p align="center">
  A worship hymnal app built to bring 221 classic hymns to the people of God.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase" />
  <img src="https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## About

Ebenezer Hymnal is a mobile-first React application designed for church congregations and worship teams. It provides a clean, elegant interface for browsing, searching and sharing 221 classic hymns extracted from the official *Himnario Ebenezer* PDF. The app features a Firebase-backed admin panel, night mode, adjustable font sizes, and a branded share card system for social media.

## Features

| Feature | Description |
|---|---|
| **221 Classic Hymns** | Full lyrics extracted from the source PDF with stanza and chorus formatting. |
| **Search by Number** | Numeric keypad for quick access to any hymn by its number. |
| **Search by Name** | Real-time, accent-insensitive search across all hymn titles. |
| **Favorites** | Bookmark hymns for instant access during worship sessions. |
| **Night Mode** | Dark theme with dedicated `logo_dark` variants for comfortable low-light reading. |
| **Font Size Control** | Adjustable text size via the settings panel. |
| **Share as Image** | Generate branded hymn cards using html2canvas for social sharing. |
| **Admin Panel** | Authenticated CRUD operations for managing the hymn catalog. |
| **Lazy Loading** | Skeleton placeholders and fade-in transitions for smooth image loading. |
| **Responsive Design** | Mobile-first layout that adapts across all screen sizes. |

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_5-646cff?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router_6-CA4245?logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/html2canvas-DD0000" />
  <img src="https://img.shields.io/badge/Lucide_React-000000?logo=lucide" />
  <img src="https://img.shields.io/badge/Android_WebView-3DDC84?logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white" />
</p>

- **React 18** — Component-based UI with hooks
- **Vite 5** — Fast build tooling and HMR dev server
- **React Router 6** — Client-side routing
- **Firebase** — Realtime Database, Authentication and Analytics
- **Framer Motion** — Page transitions and animations
- **html2canvas** — Client-side hymn card generation
- **Lucide React** — Consistent iconography
- **Android WebView** — Native wrapper for APK distribution
- **Java** — Native bridge for share functionality via ShareBridge

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** package manager

### Installation

```bash
git clone https://github.com/0noxtackore/Ebenezer-Hymnal.git
cd Ebenezer-Hymnal
npm install
```

### Development

```bash
npm run dev
```

Application available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Project Structure

```
Ebenezer-Hymnal/
├── android/                    # Android WebView wrapper
│   └── app/src/main/
│       ├── java/com/ebenezer/hymnal/
│       │   ├── MainActivity.java    # WebView setup, JS injection
│       │   └── ShareBridge.java     # Java ↔ JS share bridge
│       ├── res/xml/
│       │   └── file_paths.xml       # FileProvider config
│       └── AndroidManifest.xml
├── assets/
│   ├── images/               # Logos, banners, gallery images
│   ├── hymns.json            # 221 hymns (source data)
│   ├── verses.json           # Curated Bible verses
│   └── logo.png
├── pdf-files/
│   └── HIMNARIO EBENEZER PDF.pdf
├── scripts/
│   ├── create-users.ps1      # Firebase auth user creation
│   └── upload-hymns.ps1      # Firebase hymn upload
├── src/
│   ├── components/           # Layout, BottomNav, Splash, LazyImage
│   ├── context/              # DataContext, SettingsContext, FavoritesContext
│   ├── pages/                # Home, SearchByNumber, SearchByName,
│   │                         # HymnDetail, Admin, Favorites, Settings,
│   │                         # About, Social, Report
│   ├── App.jsx               # Route definitions
│   ├── firebase.js           # Firebase initialization
│   ├── main.jsx              # Entry point
│   └── styles.css            # Global styles and design tokens
├── Himnario-Ebenezer.apk     # Signed release APK
├── index.html
├── package.json
├── vite.config.js
├── LICENSE
└── README.md
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

## Android APK

The app is distributed as a native Android APK using a WebView wrapper that loads the Netlify-deployed React app.

### Building the APK

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

### Share Bridge (ShareBridge.java)

Android WebView does not support the Web Share API (`navigator.share`). `ShareBridge.java` is a JavaScript interface that bridges the gap:

- **`ShareBridge.writeBase64File()`** — Receives base64 image data from JS, writes it to a temp file in cache
- **`ShareBridge.share()`** — Opens Android's native share intent (Intent.ACTION_SEND) with the image via FileProvider
- **`ShareBridge.shareText()`** — Opens share intent with plain text fallback

The bridge is injected into the WebView via `evaluateJavascript()` on every page load, overriding `navigator.share` so the React code works without modifications.

---

<p align="center">
  Built with faith by <a href="https://github.com/0noxtackore">0noxtackore</a>
</p>
