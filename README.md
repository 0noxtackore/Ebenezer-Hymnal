<img src="assets/images/logo_solid.png" alt="Himnario Ebenezer" style="width:100%" />

# Himnario Ebenezer

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB" />
  <img src="https://img.shields.io/badge/Vite-5-646cff" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

Himnario Ebenezer is a mobile-first hymnal app built to bring worship songs to the people of God. It features 221 classic hymns extracted from the original PDF, a clean and elegant interface with day/night mode, and a Firebase-backed admin panel for managing the hymn catalog.

## Overview

Himnario Ebenezer is designed for church congregations and worship teams. Users can browse hymns by number or name, mark favorites, share hymn cards as images, and read lyrics in a beautifully formatted reader with adjustable font size. An admin panel allows authorized users to create, edit and delete hymns directly from the app.

## Features

- **221 classic hymns** — extracted from the official Himnario Ebenezer PDF with formatted lyrics, stanzas and chorus labels.
- **Search by number** — numeric keypad to quickly jump to any hymn by its number.
- **Search by name** — real-time search with accent-insensitive matching across titles.
- **Favorites** — bookmark hymns for quick access during worship.
- **Night mode** — dark theme with logo_dark variants for comfortable reading in low light.
- **Adjustable font size** — readers can increase or decrease text size from the settings panel.
- **Share as image** — generate a branded card with the hymn lyrics using html2canvas.
- **Firebase backend** — hymns stored in Firebase Realtime Database with localStorage fallback.
- **Admin panel** — authenticated users can create, edit and delete hymns with a modal form.
- **LazyImage** — skeleton placeholder and fade-in effect for smooth image loading.
- **Fully responsive** — mobile-first layout that adapts from desktop down to small screens.

## Tech Stack

- **React 18** (JSX, hooks)
- **Vite 5** as the build tool and dev server
- **React Router 6** for client-side routing
- **Firebase** (Realtime Database + Authentication + Analytics)
- **Framer Motion** for page transitions and animations
- **html2canvas** for generating shareable hymn cards
- **Lucide React** for consistent iconography

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A package manager (npm)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
  components/       # Reusable UI components (Layout, BottomNav, Splash, LazyImage)
  context/          # React contexts (Data, Settings, Favorites)
  pages/            # Route-level views (Home, SearchByNumber, SearchByName, HymnDetail, Admin, etc.)
  styles.css        # Global styles and design tokens
  firebase.js       # Firebase initialization (app, db, auth, analytics)
  App.jsx           # Route definitions
  main.jsx          # Entry point
assets/
  hymns.json        # 221 hymns extracted from the PDF
  verses.json       # Curated Bible verses for the admin login screen
  images/           # Logos, banners and gallery images
scripts/
  create-users.ps1  # PowerShell script to create Firebase auth users
  upload-hymns.ps1  # PowerShell script to upload hymns to Firebase
pdf-files/
  HIMNARIO EBENEZER PDF.pdf   # Original source PDF
```

## Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the Vite development server        |
| `npm run build`   | Build the project for production         |
| `npm run preview` | Preview the production build locally     |

## License

Released under the MIT License.
