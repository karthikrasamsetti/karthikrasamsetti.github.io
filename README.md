
# karthikrasamsetti.github.io

Personal portfolio of **Karthik Rasamsetti** — a QA Automation Engineer moving into
AI Engineering. A single-page site with an engineering-log aesthetic: a live
"test runner" hero, interactive project cards, an AI-journey timeline, and a small
RAG-powered chat widget.

**Live:** https://karthikrasamsetti.github.io

---

## What it is

A hand-built, dependency-light portfolio that reflects what I actually do — testing,
automation, and AI. Instead of a static résumé dump, the page *demonstrates* the work:
the hero animates a real-looking Playwright run / agent trace / k6 graph, and a chat
widget answers questions about me using a small retrieval pipeline.

Design goals: fast, distinctive, and honest — no heavy framework, no template feel,
and everything themable.

---

## Features

- **Animated hero widget** that randomly shows one of three on each visit:
  - a live **Playwright test runner**,
  - an **AI agent trace log**, or
  - a **k6 performance graph**.
- **Light / dark theme** — a designed light palette (not a color-flip), toggled from
  the nav and remembered across visits. Dark is the default. The terminal widget
  stays a dark "screen" in light mode, like a real editor.
- **Interactive project cards** — pinned flagships (MediClear, qa-engine), tech pills,
  impact lines, live-demo links, and real star/fork counts where they exist.
- **AI Journey timeline** — the path from QA automation into AI engineering.
- **"ktx" chat widget** — a small RAG assistant that answers questions about my
  background (embeddings + a hosted proxy; see below).
- **Skills, About, Now, Contact** — a working contact form (Web3Forms).
- **Responsive** down to mobile, with tuned layouts for small screens.
- **Shareable** — Open Graph + Twitter cards and a favicon for clean link previews.

---

## Tech & approach

- **React 18** (UMD, production builds) loaded from a CDN.
- **Babel Standalone** compiles the JSX in the browser — no build step, no bundler.
  This keeps the repo simple (just static files) at the cost of a little runtime
  compile; a deliberate tradeoff for a small personal site.
- **Plain CSS** with a CSS-variable design system — theming, fonts, and density all
  key off `:root` variables and `data-*` attributes.
- **GitHub Pages** for hosting (deploys on push to `master`).
- The **ktx chat widget** calls a separate hosted proxy (a small Vercel service using
  BGE embeddings + an LLM) so no keys ever live in this static site.

There is intentionally **no framework build pipeline** here. Everything is static
files served as-is.

---

## Project structure

```
karthikrasamsetti.github.io/
├── index.html            entry — meta/OG tags, favicon, loads React + the JSX files
├── portfolio.jsx         the whole site (hero, projects, timeline, skills, contact)
├── tweaks-panel.jsx      dev-only "edit mode" panel (accent/font/density authoring)
├── ktx.jsx               the RAG chat widget
├── styles.css            design system + all component styles + light theme
├── og-image.png          social share preview (1200×630)
├── favicon.svg           site icon (+ favicon-32.png, apple-touch-icon.png)
└── Karthik_Rasamsetti_Resume.pdf
```

---

## Running locally

Because the JSX is compiled in the browser, open it over a local server (not `file://`):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Edit `portfolio.jsx` or `styles.css` and refresh — no build needed.

> The `tweaks-panel.jsx` is a dev authoring tool that activates via an editor host
> message, so it doesn't appear for normal visitors. The visitor-facing theme switch
> lives in the nav.

---

## Deployment

Hosted on **GitHub Pages** from the `master` branch. Any push republishes the site —
no build action required, since everything is static.

```bash
git add .
git commit -m "…"
git push
```

---

## Featured project

**[MediClear](https://github.com/karthikrasamsetti/mediclear)** — a full-stack
bilingual health app that reads prescriptions and lab reports and explains them in
English, Telugu, and Hindi (with read-aloud, reminders, and trends). Deployed on
Vercel + Render + Postgres, with a swappable multi-provider AI vision layer and a
safety-first design that never diagnoses. It's the flagship card on the site.

---

*Built and maintained by Karthik Rasamsetti · [github.com/karthikrasamsetti](https://github.com/karthikrasamsetti)*