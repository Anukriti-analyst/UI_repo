# RDS Design System Reference

> **Source**: https://rds-storybook.azurewebsites.net  
> **Version**: 8 (latest)  
> **Framework**: Web Components (Custom HTML Elements)  
> **Component tag prefix**: `rds-`  
> **Storybook**: https://rds-storybook.azurewebsites.net/?path=/docs/get-started--docs

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Design Tokens — Colors](#design-tokens--colors)
4. [Design Tokens — Semantic / Alias Tokens](#design-tokens--semantic--alias-tokens)
5. [Design Tokens — Typography](#design-tokens--typography)
6. [Design Tokens — Animation](#design-tokens--animation)
7. [Theming (Light / Dark)](#theming-light--dark)
8. [Grid System](#grid-system)
9. [Foundations](#foundations)
10. [Components Reference](#components-reference)
11. [React + TypeScript Integration](#react--typescript-integration)

---

## Overview

RDS (Responsive Design System) is FM Global's internal design system built as **Web Components** (Custom Elements v1). Because they are framework-agnostic custom HTML elements, they can be consumed directly in any framework — including React + TypeScript + Vite projects.

Key characteristics:
- All components are custom HTML elements prefixed with `rds-` (e.g. `<rds-button>`, `<rds-input>`)
- Styling is driven by CSS Custom Properties (design tokens prefixed with `--rds-`)
- Supports **light** (default) and **dark** mode via a single HTML attribute
- Typography uses the proprietary **FM Review Web** font family
- Icons use **Hero Icons** (Heroicons v2)
- Built with Tailwind CSS utility classes internally

---

## Setup & Installation

### 1. Load the FM Review Web Font

Add this `<link>` to your `index.html` `<head>`:

```html
<link rel="stylesheet" href="https://dev2.fmglobal.com/fonts/fm-review/fm-review.css" />
```

This loads the custom FM Review Web font in weights 300, 400, 500, 700 and 900 (regular and italic).

### 2. Apply the RDS CSS Design Tokens

Include the RDS global CSS (design token stylesheet). This must be loaded before any component renders. Add the RDS component stylesheet to `index.html`:

```html
<!-- RDS Component Stylesheet (replace with actual CDN/npm path) -->
<link rel="stylesheet" href="path/to/rds-components.css" />
```

Or, if using the npm package, import in your entry file (`main.tsx`):

```ts
import '@rds/components/styles'; // adjust based on actual package structure
import '@rds/components';        // registers all web components
```

### 3. Configure Vite for Web Components

In `vite.config.ts`, suppress React's unknown prop warnings for custom elements:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Tell React to treat rds-* tags as custom elements, not React components
    }),
  ],
});
```

In `tsconfig.app.json`, add JSX namespace augmentation for custom elements (see [React + TypeScript Integration](#react--typescript-integration) section).

### 4. Set App Theme Appearance on Root Element

```html
<!-- Light mode (default) -->
<html>
  <!-- or: -->
<html data-theme-appearance="light">

<!-- Dark mode -->
<html data-theme-appearance="dark">
```

---

## Design Tokens — Colors

All color tokens are defined as **RGB triplets** (space-separated) in CSS Custom Properties, enabling alpha compositing via `rgb(var(--token) / alpha)`.

### Primitive Colors

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-black` | `0 0 0` | `#000` |
| `--rds-color-white` | `255 255 255` | `#FFF` |

### Accent (Brand Orange)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-accent-50` | `255 230 217` | `#FFE6D9` |
| `--rds-color-accent-100` | `255 204 179` | `#FFCCB3` |
| `--rds-color-accent-200` | `255 179 133` | `#FFB385` |
| `--rds-color-accent-300` | `255 153 88` | `#FF9958` |
| `--rds-color-accent-400` | `255 128 43` | `#FF802B` |
| `--rds-color-accent-500` | `255 102 36` | `#FF6624` |
| **`--rds-color-accent-600`** | `255 81 0` | **`#FF5100`** ← Primary brand |
| `--rds-color-accent-700` | `224 69 0` | `#E04500` |
| `--rds-color-accent-800` | `201 56 0` | `#C93800` |
| `--rds-color-accent-900` | `201 49 2` | `#C93102` |

### Caution (Yellow)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-caution-50` | `255 247 216` | `#FFF7D8` |
| `--rds-color-caution-100` | `249 238 191` | `#F9EEBF` |
| `--rds-color-caution-200` | `246 229 153` | `#F6E599` |
| `--rds-color-caution-300` | `243 221 128` | `#F3DD80` |
| `--rds-color-caution-400` | `235 202 64` | `#EBCA40` |
| **`--rds-color-caution-500`** | `230 188 0` | **`#E6BC00`** |
| `--rds-color-caution-600` | `178 138 23` | `#B28A17` |
| `--rds-color-caution-700` | `138 108 29` | `#8A6C1D` |
| `--rds-color-caution-800` | `111 83 35` | `#6F5323` |
| `--rds-color-caution-900` | `88 73 33` | `#584921` |

### Danger (Red)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-danger-50` | `250 232 237` | `#FAE8ED` |
| `--rds-color-danger-100` | `248 212 218` | `#F8D4DA` |
| `--rds-color-danger-200` | `246 187 195` | `#F6BBC3` |
| `--rds-color-danger-300` | `243 146 155` | `#F3929B` |
| `--rds-color-danger-400` | `240 104 127` | `#F0687F` |
| `--rds-color-danger-500` | `240 67 103` | `#F04367` |
| **`--rds-color-danger-600`** | `221 38 71` | **`#DD2647`** |
| `--rds-color-danger-700` | `179 30 56` | `#B31E38` |
| `--rds-color-danger-800` | `138 22 44` | `#8A162C` |
| `--rds-color-danger-900` | `88 15 28` | `#580F1C` |

### Info (Blue)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-info-50` | `239 246 254` | `#EFF6FE` |
| `--rds-color-info-100` | `221 238 253` | `#DDEEFD` |
| `--rds-color-info-200` | `178 218 249` | `#B2DAF9` |
| `--rds-color-info-300` | `140 197 249` | `#8CC5F9` |
| `--rds-color-info-400` | `74 166 247` | `#4AA6F7` |
| `--rds-color-info-500` | `25 138 242` | `#198AF2` |
| **`--rds-color-info-600`** | `0 115 230` | **`#0073E6`** |
| `--rds-color-info-700` | `0 87 202` | `#0057CA` |
| `--rds-color-info-800` | `0 71 163` | `#0047A3` |
| `--rds-color-info-900` | `0 61 141` | `#003D8D` |

### Neutral (Grays)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-neutral-50` | `246 246 246` | `#F6F6F6` |
| `--rds-color-neutral-100` | `229 229 229` | `#E5E5E5` |
| `--rds-color-neutral-200` | `204 204 204` | `#CCCCCC` |
| `--rds-color-neutral-300` | `178 178 178` | `#B2B2B2` |
| `--rds-color-neutral-400` | `153 153 153` | `#999999` |
| `--rds-color-neutral-500` | `128 128 128` | `#808080` |
| `--rds-color-neutral-600` | `102 102 102` | `#666666` |
| `--rds-color-neutral-700` | `77 77 77` | `#4D4D4D` |
| `--rds-color-neutral-800` | `45 45 45` | `#2D2D2D` |
| `--rds-color-neutral-900` | `20 20 20` | `#141414` |

### Primary (Navy/Dark Blue-Gray)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-primary-50` | `242 242 245` | `#F2F2F5` |
| `--rds-color-primary-100` | `224 224 229` | `#E0E0E5` |
| `--rds-color-primary-200` | `193 193 200` | `#C1C1C8` |
| `--rds-color-primary-300` | `161 163 177` | `#A1A3B1` |
| `--rds-color-primary-400` | `130 132 151` | `#828497` |
| `--rds-color-primary-500` | `99 101 125` | `#63657D` |
| **`--rds-color-primary-600`** | `56 59 84` | **`#383B54`** ← Main UI color |
| `--rds-color-primary-700` | `28 31 60` | `#1C1F3C` |
| `--rds-color-primary-800` | `13 16 43` | `#0D102B` |
| `--rds-color-primary-900` | `8 10 26` | `#080A1A` |

### Success (Green)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-success-50` | `230 242 234` | `#E6F2EA` |
| `--rds-color-success-100` | `204 238 214` | `#CCEED6` |
| `--rds-color-success-200` | `169 224 184` | `#A9E0B8` |
| `--rds-color-success-300` | `134 210 147` | `#86D293` |
| `--rds-color-success-400` | `99 197 111` | `#63C56F` |
| `--rds-color-success-500` | `64 184 76` | `#40B84C` |
| **`--rds-color-success-600`** | `22 176 65` | **`#16B041`** |
| `--rds-color-success-700` | `14 140 53` | `#0E8C35` |
| `--rds-color-success-800` | `10 107 41` | `#0A6B29` |
| `--rds-color-success-900` | `9 70 26` | `#09461A` |

### Surface (Warm Grays / Beige)

| Token | RGB | Hex |
|-------|-----|-----|
| `--rds-color-surface-50` | `252 252 251` | `#FCFCFB` |
| `--rds-color-surface-100` | `248 247 244` | `#F8F7F4` |
| `--rds-color-surface-200` | `242 240 233` | `#F2F0E9` |
| `--rds-color-surface-300` | `233 230 219` | `#E9E6DB` |
| `--rds-color-surface-400` | `209 205 193` | `#D1CDC1` |
| `--rds-color-surface-500` | `181 177 164` | `#B5B1A4` |
| `--rds-color-surface-600` | `151 149 140` | `#97958C` |
| `--rds-color-surface-700` | `129 127 118` | `#817F76` |
| `--rds-color-surface-800` | `114 112 105` | `#727069` |
| `--rds-color-surface-900` | `103 101 96` | `#676560` |

---

## Design Tokens — Semantic / Alias Tokens

These are purpose-driven tokens that reference the primitive color tokens above.

### Backgrounds & Borders

```css
--rds-background-color-app: var(--rds-color-surface-200);        /* #F2F0E9 - Page background */
--rds-background-color-container: var(--rds-color-white);         /* #FFF - Card/panel background */
--rds-background-color-muted: var(--rds-color-primary-50) / 0.7;  /* Muted background */
--rds-color-border: var(--rds-color-primary-100);                 /* Border color */
--rds-color-idle: var(--rds-color-primary-200) / 0.7;             /* Idle/inactive state */
```

### Icons

```css
--rds-color-icon: var(--rds-color-primary-400);           /* Default icon */
--rds-color-icon-hover: var(--rds-color-primary-800);     /* Icon on hover */
--rds-color-icon-active: var(--rds-color-accent-900);     /* Active icon */
```

### Navigation

```css
--rds-color-nav: var(--rds-color-white);
--rds-color-nav-fg: var(--rds-color-primary-600);
--rds-color-nav-fg-hover: var(--rds-color-primary-800);
--rds-color-nav-fg-active: var(--rds-color-accent-900);
--rds-color-nav-hover: var(--rds-color-surface-100);
--rds-color-nav-indicator-active: var(--rds-color-accent-900);
--rds-color-nav-indicator-hover: var(--rds-color-surface-300);
```

### Prompt (Alert / Banner)

```css
/* Caution */
--rds-color-prompt-caution: var(--rds-color-caution-100);
--rds-color-prompt-caution-fg: var(--rds-color-caution-900);
--rds-color-prompt-caution-icon: var(--rds-color-caution-500);
--rds-color-prompt-caution-stroke: var(--rds-color-caution-500);

/* Danger */
--rds-color-prompt-danger: var(--rds-color-danger-100);
--rds-color-prompt-danger-fg: var(--rds-color-danger-900);
--rds-color-prompt-danger-icon: var(--rds-color-danger-600);
--rds-color-prompt-danger-stroke: var(--rds-color-danger-600);

/* Info */
--rds-color-prompt-info: var(--rds-color-info-100);
--rds-color-prompt-info-fg: var(--rds-color-info-900);
--rds-color-prompt-info-icon: var(--rds-color-info-500);

/* Neutral */
--rds-color-prompt-neutral: var(--rds-color-neutral-100);
--rds-color-prompt-neutral-fg: var(--rds-color-neutral-900);
--rds-color-prompt-neutral-icon: var(--rds-color-neutral-600);

/* Success */
--rds-color-prompt-success: var(--rds-color-success-100);
--rds-color-prompt-success-fg: var(--rds-color-success-900);
--rds-color-prompt-success-icon: var(--rds-color-success-600);
```

### Text / Prose

```css
--rds-color-prose-primary: var(--rds-color-black);            /* Main body text */
--rds-color-prose-secondary: var(--rds-color-neutral-600);    /* Secondary/muted text */
--rds-color-prose-accent: var(--rds-color-accent-900);        /* Accent text */
```

### UI States

```css
--rds-color-disabled: var(--rds-color-neutral-100);
--rds-color-disabled-fg: var(--rds-color-neutral-400);
--rds-color-focus: var(--rds-color-primary-600);
--rds-color-hover: var(--rds-color-neutral-50);
```

### Buttons

```css
/* Primary button */
--rds-color-btn-primary: var(--rds-color-primary-600);           /* #383B54 */
--rds-color-btn-primary-hover: var(--rds-color-primary-800);     /* #0D102B */
--rds-color-btn-primary-fg: var(--rds-color-white);
--rds-color-btn-primary-fg-hover: var(--rds-color-white);

/* Secondary button */
--rds-color-btn-secondary: var(--rds-color-white);
--rds-color-btn-secondary-hover: var(--rds-color-neutral-50);
--rds-color-btn-secondary-fg: var(--rds-color-primary-600);
--rds-color-btn-secondary-fg-hover: var(--rds-color-primary-800);

/* Tertiary button */
--rds-color-btn-tertiary-fg: var(--rds-color-primary-600);
--rds-color-btn-tertiary-fg-hover: var(--rds-color-primary-800);
--rds-color-btn-tertiary-stroke: var(--rds-color-primary-400);
--rds-color-btn-tertiary-stroke-hover: var(--rds-color-primary-800);
--rds-color-btn-tertiary-active: var(--rds-color-accent-50);
--rds-color-btn-tertiary-fg-active: var(--rds-color-accent-900);

/* Ghost button */
--rds-color-btn-ghost: transparent;
--rds-color-btn-ghost-hover: var(--rds-color-neutral-100);
--rds-color-btn-ghost-fg: var(--rds-color-primary-600);
--rds-color-btn-ghost-fg-hover: var(--rds-color-primary-800);

/* Danger button */
--rds-color-btn-danger: var(--rds-color-danger-600);
--rds-color-btn-danger-hover: var(--rds-color-danger-800);
--rds-color-btn-danger-fg: var(--rds-color-white);
--rds-color-btn-danger-fg-hover: var(--rds-color-white);
```

### Links

```css
--rds-color-link-primary: var(--rds-color-info-700);     /* #0057CA - Standard links */
--rds-color-link-secondary: var(--rds-color-primary-600);
```

### Tabs

```css
--rds-color-tab-fg: var(--rds-color-primary-600);
--rds-color-tab-fg-hover: var(--rds-color-primary-800);
--rds-color-tab-fg-active: var(--rds-color-primary-800);
--rds-color-tab-indicator-active: var(--rds-color-accent-900);
--rds-color-tab-indicator-hover: var(--rds-color-surface-300);
```

---

## Design Tokens — Typography

```css
--rds-font-family-brand:
  'FM Review Web', ui-sans-serif, system-ui, -apple-system, blinkmacsystemfont,
  'Segoe UI', roboto, 'Helvetica Neue', arial, 'Noto Sans', sans-serif,
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
```

### FM Review Web Font Weights

| Weight | Style |
|--------|-------|
| 300 | Light / Light Italic |
| 400 | Regular / Regular Italic |
| 500 | Medium / Medium Italic |
| 700 | Bold / Bold Italic |
| 900 | Heavy / Heavy Italic |

### Text Sizes (via `<rds-text>` component)

Available `size` attribute values: `xxs`, `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `7xl`

### Headline Levels (via `<rds-headline>` component)

Available `level` attribute values: `1`, `2`, `3`

Font weight options: `normal`, `medium`, `semibold`, `bold`, `extrabold`

---

## Design Tokens — Animation

```css
--rds-animation-curve: ease-in-out;
--rds-animation-curve-out: ease-out;
--rds-animation-timing: 300ms;
```

---

## Theming (Light / Dark)

Toggle dark mode by setting `data-theme-appearance="dark"` on the root `<html>` element (or any ancestor).

```html
<!-- Light mode (default) -->
<html>

<!-- Dark mode -->
<html data-theme-appearance="dark">
```

### Dark Mode Token Overrides

| Token | Light | Dark |
|-------|-------|------|
| `--rds-background-color-app` | `surface-200` (#F2F0E9) | `primary-800` (#0D102B) |
| `--rds-background-color-container` | `white` | `primary-700` (#1C1F3C) |
| `--rds-color-nav` | `white` | `primary-700` |
| `--rds-color-nav-fg` | `primary-600` | `primary-100` |
| `--rds-color-prose-primary` | `black` | `white` |
| `--rds-color-prose-secondary` | `neutral-600` | `neutral-100` |
| `--rds-color-btn-primary` | `primary-600` | `accent-600` (#FF5100) |
| `--rds-color-link-primary` | `info-700` | `info-300` |
| `--rds-color-focus` | `primary-600` | `primary-100` |

---

## Grid System

RDS uses a **12-column CSS Grid** layout. The App Layout component (`<rds-app-layout>`) handles primary page structure.

Available grid column splits (for story reference): 2, 3, 4, 6 columns.

### App Layout Structure

```html
<rds-app-layout>
  <!-- Left sidebar (optional) -->
  <rds-nav slot="left-sidebar">...</rds-nav>

  <!-- Main content -->
  <main slot="main">...</main>
</rds-app-layout>
```

App Layout variants:
- `with-left-sidebar`
- `without-sidebars`
- `with-full-width-header`
- `with-full-width-main-content`

---

## Foundations

### Accessibility
- All RDS components are built with ARIA attributes
- Keyboard navigation support on all interactive components
- Focus management with `--rds-color-focus`

### Iconography
- Uses **Hero Icons** (Heroicons v2) via `<rds-hero-icon>`
- Icon sizes: small, medium, large

### Tailwind CSS
- RDS is built internally using Tailwind CSS utility classes
- Use Tailwind in consuming apps where appropriate; RDS tokens override defaults

---

## Components Reference

> All components are custom HTML elements. In JSX, use them like regular HTML tags.

### Layout & Structure

#### `<rds-app-layout>` — App Layout
```html
<rds-app-layout>
  <rds-nav slot="left-sidebar">...</rds-nav>
  <main slot="main">...</main>
</rds-app-layout>
```
**Variants**: with-left-sidebar, without-sidebars, with-full-width-header, with-full-width-main-content

---

#### `<rds-header>` — Header
```html
<rds-header app-name="My App">
  <!-- right slot for icons/avatar -->
</rds-header>
```
**Variants**: default, with-icon-and-avatar

---

#### `<rds-nav>` + `<rds-nav-item>` — Navigation Sidebar
```html
<rds-nav>
  <rds-nav-item href="/dashboard" icon="home">Dashboard</rds-nav-item>
  <rds-nav-item href="/reports" icon="document">Reports</rds-nav-item>
</rds-nav>
```
**Variants**: default, collapsed, with-sub-nav, not-collapsible, collapsible-with-labels-shown-on-collapse

---

#### `<rds-footer>` — Footer
```html
<rds-footer>
  <span slot="copyright">© 2025 FM Global</span>
</rds-footer>
```
**Variants**: default, with-confidentiality-notice, with-feedback, with-all

---

#### `<rds-page-heading>` — Page Heading
```html
<rds-page-heading>
  <span slot="title">Policy Proposals</span>
  <rds-button slot="actions" variant="primary">New Proposal</rds-button>
</rds-page-heading>
```
**Variants**: default, with-actions, with-long-text-and-actions, with-breadcrumbs, breadcrumb-separator-with-slash, with-content, with-actions-and-meta

---

#### `<rds-section-heading>` — Section Heading
```html
<rds-section-heading>
  <span slot="text">Section Title</span>
  <rds-button slot="actions" variant="tertiary">View All</rds-button>
</rds-section-heading>
```
**Variants**: with-text, with-actions, with-text-and-actions, with-long-text-and-actions, with-tabs, with-tabs-and-actions

---

#### `<rds-breadcrumbs>` + `<rds-breadcrumb-item>` — Breadcrumbs
```html
<rds-breadcrumbs>
  <rds-breadcrumb-item href="/">Home</rds-breadcrumb-item>
  <rds-breadcrumb-item href="/proposals">Proposals</rds-breadcrumb-item>
  <rds-breadcrumb-item>Current Page</rds-breadcrumb-item>
</rds-breadcrumbs>
```
**Variants**: two-breadcrumbs, three-breadcrumbs, with-slash separator

---

### Cards

#### `<rds-card-container>` — Card Container
```html
<rds-card-container>
  <rds-card-header slot="header">
    <span slot="title">Card Title</span>
  </rds-card-header>
  <rds-card-body slot="body">Content here</rds-card-body>
  <rds-card-footer slot="footer">Footer content</rds-card-footer>
</rds-card-container>
```
**Variants**: default, simple

#### `<rds-card-group>` — Card Group
**Variants**: default

#### `<rds-card-header>` — Card Header
**Variants**: default, with-actions, with-auxiliary-text, with-content, with-description, with-icon, with-icon-slot, with-title

#### `<rds-card-body>` — Card Body

#### `<rds-card-footer>` — Card Footer

#### `<rds-card-media>` — Card Media
**Variants**: default, with-media-tag

---

### Typography

#### `<rds-headline>` — Headlines (h1–h3)
```html
<rds-headline level="1">Page Title</rds-headline>
<rds-headline level="2" weight="semibold">Section Title</rds-headline>
<rds-headline level="3" weight="normal">Subsection</rds-headline>
```
**Attributes**:
- `level`: `1` | `2` | `3`
- `weight`: `normal` | `medium` | `semibold` | `bold` | `extrabold`
- `spacing`: `none` | `small` | `medium` | `large`

#### `<rds-text>` — Body Text
```html
<rds-text size="md" weight="normal">Regular body text</rds-text>
<rds-text size="sm" color="secondary">Small secondary text</rds-text>
```
**Attributes**:
- `size`: `xxs` | `xs` | `sm` | `md` | `lg` | `xl` | `2xl` | `3xl` | `4xl` | `5xl` | `6xl` | `7xl`
- `weight`: `normal` | `medium` | `semibold` | `bold` | `extrabold`
- `spacing`: `none` | `small` | `large`
- `align`: `left` | `right` | `center` | `justify`
- `italic`: boolean

---

### Buttons & Actions

#### `<rds-button>` — Button
```html
<rds-button variant="primary">Submit</rds-button>
<rds-button variant="secondary">Cancel</rds-button>
<rds-button variant="tertiary">Edit</rds-button>
<rds-button variant="ghost">More</rds-button>
<rds-button variant="danger">Delete</rds-button>
<rds-button variant="primary" disabled>Disabled</rds-button>
<rds-button variant="primary" size="small">Small</rds-button>
<rds-button variant="primary" size="large">Large</rds-button>
```
**Attributes**:
- `variant`: `primary` | `secondary` | `tertiary` | `tertiary-active` | `ghost` | `danger`
- `size`: `small` | `medium` (default) | `large`
- `disabled`: boolean
- `icon-only`: boolean
- `type`: `button` | `submit` | `reset`

**Variants**: primary, secondary, tertiary, tertiary-active, ghost, danger, size-small, size-medium, size-large, disabled, truncated, icon-only variants, reset-and-submit

#### `<rds-button-group>` — Button Group
```html
<rds-button-group>
  <rds-button variant="primary">Save</rds-button>
  <rds-button variant="secondary">Cancel</rds-button>
</rds-button-group>
```
**Variants**: primary, secondary, tertiary, ghost, with-icon, icon-only, with-full-width-buttons-on-mobile

#### `<rds-action-bar>` + `<rds-action>` — Action Bar
```html
<rds-action-bar>
  <rds-action icon="pencil" label="Edit">Edit</rds-action>
  <rds-action icon="trash" label="Delete">Delete</rds-action>
</rds-action-bar>
```
**Variants**: default, with-text-enabled, collapsed

#### `<rds-fab>` — Floating Action Button
```html
<rds-fab icon="plus">Create</rds-fab>
```
**Variants**: default, size-small, size-large

#### `<rds-link>` — Link
```html
<rds-link href="/path">Primary Link</rds-link>
<rds-link href="/path" variant="secondary">Secondary Link</rds-link>
<rds-link href="/path" disabled>Disabled</rds-link>
<rds-link href="/path" size="small">Small</rds-link>
```
**Attributes**:
- `variant`: `primary` | `secondary`
- `size`: `default` | `small`
- `disabled`: boolean
- `icon-only`: boolean
- `icon-position`: `leading` | `trailing`

---

### Form Controls

#### `<rds-form-wrapper>` — Form Wrapper
```html
<rds-form-wrapper action="/submit" method="post">
  <!-- form fields -->
</rds-form-wrapper>
```
**Attributes**: `action`, `method`, `autocomplete`, `name`, `target`, `enctype`, `validate`

#### `<rds-input>` — Text Input
```html
<rds-input label="Email" type="email" required></rds-input>
<rds-input label="Search" placeholder="Search..." leading-icon="magnifying-glass"></rds-input>
<rds-input label="Amount" trailing-addon="USD"></rds-input>
<rds-input label="Field" error="This field is required"></rds-input>
<rds-input label="Field" disabled></rds-input>
<rds-input label="Field" readonly></rds-input>
```
**Attributes**:
- `label`: string
- `type`: `text` | `email` | `url` | `number` | `password`
- `placeholder`: string
- `required`: boolean
- `disabled`: boolean
- `readonly`: boolean
- `error`: string (error message)
- `help-text`: string
- `sub-label`: string
- `leading-icon`: icon name
- `trailing-icon`: icon name
- `leading-addon`: string
- `trailing-addon`: string
- `min`, `max`, `minlength`, `maxlength`, `pattern`
- `autocomplete`

**Variants**: default, required, error, disabled, readonly, with-placeholder-text, with-help-text, with-leading/trailing-icon, with-leading/trailing-select, with-leading/trailing-addon, inline-addons, with-sub-label, email, number types, validation attributes

#### `<rds-textarea>` — Textarea
```html
<rds-textarea label="Description" rows="4"></rds-textarea>
<rds-textarea label="Notes" required error="Required"></rds-textarea>
```
**Attributes**: `label`, `placeholder`, `rows`, `required`, `disabled`, `readonly`, `error`, `help-text`, `resize` (`on` | `vertical` | `horizontal`), `maxlength`, `minlength`

#### `<rds-select>` — Select / Dropdown
```html
<rds-select label="Status">
  <option value="">Select...</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</rds-select>
<rds-select label="Multi" multiple></rds-select>
```
**Attributes**: `label`, `multiple`, `required`, `disabled`, `error`, `placeholder`, `label-position` (`top` | `left`)

**Variants**: default, multiple, error, custom, disabled, label-left, placeholder, required, with-disabled-options, with-pre-selected-option

#### `<rds-combobox>` — Combobox (Searchable Dropdown)
```html
<rds-combobox label="Search">
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</rds-combobox>
```
**Variants**: default, list-on-top, with-disabled-items, error, multiple, with-number-values, required

#### `<rds-checkbox>` — Checkbox
```html
<rds-checkbox label="I agree to terms"></rds-checkbox>
<rds-checkbox label="Pre-checked" checked></rds-checkbox>
<rds-checkbox label="Indeterminate" indeterminate></rds-checkbox>
<rds-checkbox label="Disabled" disabled></rds-checkbox>
```
**Attributes**: `label`, `checked`, `indeterminate`, `disabled`, `sub-label`, `inline-sub-label`

**Variants**: default, checked, indeterminate, disabled, with-sub-label, with-inline-sub-label, card, small-card (checked/disabled variants for each)

#### `<rds-checkbox-group>` — Checkbox Group
```html
<rds-checkbox-group label="Options" orientation="vertical">
  <rds-checkbox value="a" label="Option A"></rds-checkbox>
  <rds-checkbox value="b" label="Option B"></rds-checkbox>
</rds-checkbox-group>
```
**Attributes**: `label`, `orientation` (`horizontal` | `vertical`), `disabled`
**Variants**: default, description-list, indeterminate, label, sub-label-slot, horizontal, vertical, card-horizontal, card-vertical, card-small variants, validators

#### `<rds-radio-button>` — Radio Button
```html
<rds-radio-button name="choice" value="a" label="Option A"></rds-radio-button>
<rds-radio-button name="choice" value="b" label="Option B" disabled></rds-radio-button>
```
**Variants**: default, disabled, with-sub-label, with-inline-sub-label, card, small-card (checked/disabled variants)

#### `<rds-radio-button-group>` — Radio Button Group
```html
<rds-radio-button-group name="status" label="Status" orientation="horizontal">
  <rds-radio-button value="active" label="Active"></rds-radio-button>
  <rds-radio-button value="inactive" label="Inactive"></rds-radio-button>
</rds-radio-button-group>
```
**Variants**: default, description-list, with-group-label, with-group-sub-label, horizontal, vertical, card variants

#### `<rds-toggle>` — Toggle Switch
```html
<rds-toggle label="Enable feature"></rds-toggle>
<rds-toggle label="On" switched></rds-toggle>
<rds-toggle label="Disabled" disabled></rds-toggle>
```
**Attributes**: `label`, `switched`, `disabled`

#### `<rds-date-picker>` — Date Picker
```html
<rds-date-picker label="Select Date"></rds-date-picker>
```

#### `<rds-input-date-picker>` — Input Date Picker
```html
<rds-input-date-picker label="Start Date"></rds-input-date-picker>
<rds-input-date-picker label="Date Range" range></rds-input-date-picker>
```
**Variants**: default, disabled, required, trailing-calendar-icon, min, max, range, range-disabled, range-required, range-vertical, allowed-dates, readonly

#### `<rds-input-slider>` — Range Slider
```html
<rds-input-slider label="Value" min="0" max="100" value="50"></rds-input-slider>
<rds-input-slider label="Range" dual></rds-input-slider>
```
**Variants**: single, dual

#### `<rds-label>` — Label
```html
<rds-label for="input-id">Field Label</rds-label>
<rds-label sub-label="optional">Label with Sub Label</rds-label>
```

#### `<rds-file-uploader>` — File Uploader
```html
<rds-file-uploader label="Upload Document" accept=".pdf,.docx"></rds-file-uploader>
<rds-file-uploader multiple max-files="5"></rds-file-uploader>
```
**Attributes**: `label`, `accept`, `multiple`, `max-file-size`, `max-files`, `disabled`
**Variants**: default, multiple, with-label, disabled, custom-error-text, server-upload-handled-inside/outside, exceeding-max-file-size/limit, file-format-invalid

#### `<rds-search>` — Search Input
```html
<rds-search placeholder="Search..."></rds-search>
<rds-search with-search-button></rds-search>
```
**Variants**: default, disabled, with-search-button

#### `<rds-comment-box>` — Comment Box (Rich Text)
```html
<rds-comment-box placeholder="Add a comment..."></rds-comment-box>
<rds-comment-box raw-text></rds-comment-box>
```

---

### Feedback & Notifications

#### `<rds-alert>` — Alert
```html
<rds-alert variant="info" heading="Information" dismissible>
  This is an informational alert.
</rds-alert>
<rds-alert variant="success">Operation successful.</rds-alert>
<rds-alert variant="warning">Please review your input.</rds-alert>
<rds-alert variant="danger">An error occurred.</rds-alert>
```
**Attributes**:
- `variant`: `default` | `success` | `warning` | `danger`
- `heading`: string
- `dismissible`: boolean

**Variants**: default, success, warning, error, with-actions, with-right-content, without-dismiss-button

#### `<rds-banner>` — Banner (Full-width notification)
```html
<rds-banner variant="info" dismissible>
  Site maintenance scheduled for tonight.
</rds-banner>
```
**Attributes**: `variant`, `dismissible`, `appearance` (`rounded` | `non-rounded`)

**Variants**: default, appearance-non-rounded, appearance-rounded, not-dismissible

#### `<rds-snackbar>` — Snackbar / Toast
```html
<rds-snackbar variant="success" message="Saved successfully"></rds-snackbar>
```
**Variants**: default, info, success, error, multiple

#### `<rds-badge>` — Badge
```html
<rds-badge variant="neutral">Pending</rds-badge>
<rds-badge variant="success">Approved</rds-badge>
<rds-badge variant="danger">Rejected</rds-badge>
<rds-badge variant="caution">Review</rds-badge>
<rds-badge variant="info">Info</rds-badge>
<rds-badge variant="primary">Primary</rds-badge>
```
**Attributes**:
- `variant`: `neutral` | `danger` | `caution` | `success` | `info` | `primary`
- Display modes: text-only, icon-only, text-and-icon

**Variants**: default (solid), text variants, icon-only variants, text-and-icon variants

#### `<rds-indicator>` — Status Indicator (dot)
```html
<rds-indicator variant="success"></rds-indicator>
<rds-indicator variant="danger"></rds-indicator>
<rds-indicator variant="caution"></rds-indicator>
<rds-indicator variant="primary"></rds-indicator>
<rds-indicator variant="info"></rds-indicator>
```

---

### Progress & Loading

#### `<rds-spinner>` — Loading Spinner
```html
<rds-spinner size="medium"></rds-spinner>
```
**Attributes**: `size`: `xxs` | `xs` | `sm` | `md` | `lg` | `xl`

#### `<rds-progress-bar>` — Progress Bar
```html
<rds-progress-bar value="75" max="100"></rds-progress-bar>
<rds-progress-bar></rds-progress-bar><!-- indeterminate -->
```
**Variants**: no-value (indeterminate), partial, full

#### `<rds-progress-circle>` — Circular Progress
```html
<rds-progress-circle value="60" max="100" size="medium"></rds-progress-circle>
```
**Attributes**: `size`: `small` | `medium` | `large`
**Variants**: no-value, partial, full, small, medium, large

#### `<rds-skeleton>` — Skeleton Loader
```html
<rds-skeleton></rds-skeleton>
<rds-skeleton type="circle"></rds-skeleton>
<rds-skeleton type="rect" width="200" height="100"></rds-skeleton>
<rds-skeleton count="3"></rds-skeleton>
```
**Variants**: default, circle, circle-large, rect, count

---

### Navigation & Wayfinding

#### `<rds-tabs>` + `<rds-tab>` — Tabs
```html
<rds-tabs>
  <rds-tab>Overview</rds-tab>
  <rds-tab active>Details</rds-tab>
  <rds-tab>History</rds-tab>
</rds-tabs>
```
**Tab variants**: `primary` | `secondary` | `tertiary` (with and without icons)
**Tab group variants**: default, primary, disable-dropdown, primary-with-icons, secondary, secondary-with-icons, tertiary, tertiary-with-icons

#### `<rds-pagination>` — Pagination
```html
<rds-pagination total="100" page-size="10" current-page="1"></rds-pagination>
<rds-pagination type="dropdown"></rds-pagination>
<rds-pagination type="directional"></rds-pagination>
<rds-pagination type="pager"></rds-pagination>
```
**Variants**: default, dropdown, directional, pager

#### `<rds-stepper>` — Step Indicator
```html
<rds-stepper>
  <rds-stepper-step label="Details" completed></rds-stepper-step>
  <rds-stepper-step label="Review" active></rds-stepper-step>
  <rds-stepper-step label="Submit"></rds-stepper-step>
</rds-stepper>
```
**Variants**: simple, simple-many-items, complex, complex-many-items, vertical-complex, bullets, vertical-bullets

---

### Overlays & Panels

#### `<rds-modal>` — Modal Dialog
```html
<rds-modal id="confirm-modal" heading="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <rds-button slot="footer" variant="primary">Confirm</rds-button>
  <rds-button slot="footer" variant="secondary">Cancel</rds-button>
</rds-modal>

<rds-button onclick="document.getElementById('confirm-modal').open()">Open Modal</rds-button>
```
**Attributes**: `heading`, `size` (`small` | `medium` | `large` | `fullscreen`), `no-escape-key-close`, `no-overlay-close`
**Variants**: default, initially-opened, custom-header, no-escape-key-close, no-overlay-close, fullscreen, large, medium, small

#### `<rds-panel>` — Side Panel / Drawer
```html
<rds-panel heading="Filters">
  <!-- panel content -->
</rds-panel>
```
**Variants**: fixed-panel, overlay-panel, no-overlay-close-panel, push-panel-default/left, panel-with-custom-header, multiple-panels, wide-panel

#### `<rds-menu>` + `<rds-menu-item>` — Dropdown Menu
```html
<rds-menu>
  <rds-button slot="trigger">Actions</rds-button>
  <rds-menu-item value="edit">Edit</rds-menu-item>
  <rds-menu-item value="delete">Delete</rds-menu-item>
</rds-menu>
```
**Attributes**: `position` (`left` | `right` | `top` | `bottom`), `open-with-hover`, `disabled`
**Variants**: default, showing-selected-item, open-with-hover, menu-icon, position variants, disabled, disabled-menu-items, with-scrolling, with-responsive-width, with-dividers

#### `<rds-tooltip>` — Tooltip
```html
<rds-tooltip content="More information" position="top">
  <rds-button>Hover me</rds-button>
</rds-tooltip>
```
**Attributes**: `content`, `position` (`top` | `right` | `bottom` | `left`)

---

### Data Display

#### `<rds-table>` — Data Table
```html
<rds-table>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Policy A</td>
        <td><rds-badge variant="success">Active</rds-badge></td>
        <td>2025-01-01</td>
      </tr>
    </tbody>
  </table>
</rds-table>
```
**Attributes**: `striped`, `compact`, `vertical-lines`
**Variants**: default, align-center/left/right, compact, filter-and-sort, grouped-rows, hiding-columns-on-mobile, striped, stacked-columns-on-mobile, vertical-lines

#### `<rds-list>` — List
```html
<rds-list type="unordered">
  <li>Item one</li>
  <li>Item two</li>
</rds-list>
<rds-list type="description">
  <dl>
    <dt>Label</dt>
    <dd>Value</dd>
  </dl>
</rds-list>
```
**Variants**: default, ordered, unordered, unstyled, description, description-in-card, description-divided, description-divided-in-card, description-striped, description-striped-in-card, stacked-two-column, stacked-two-column-with-link

#### `<rds-accordion>` + `<rds-accordion-item>` — Accordion
```html
<rds-accordion>
  <rds-accordion-item heading="Section One">
    Content for section one.
  </rds-accordion-item>
  <rds-accordion-item heading="Section Two">
    Content for section two.
  </rds-accordion-item>
</rds-accordion>
```
**Attributes**: `single-selection-mode` (only one open at a time)
**Accordion variants**: default, with-icon, single-selection-mode, compact, compact-x, compact-y

#### `<rds-avatar>` — Avatar
```html
<rds-avatar initials="JD"></rds-avatar>
<rds-avatar src="/path/to/image.jpg" alt="Jane Doe"></rds-avatar>
<rds-avatar initials="JD" size="large" indicator="success"></rds-avatar>
```
**Attributes**: `size` (`small` | `medium` | `large` | `extra-large`), `src`, `alt`, `initials`, `indicator`

#### `<rds-chip>` — Chip / Tag
```html
<rds-chip>Category</rds-chip>
<rds-chip active>Active</rds-chip>
<rds-chip closable>Removable</rds-chip>
<rds-chip disabled>Disabled</rds-chip>
```
**Variants**: default, active, clickable, closable, disabled, use-custom-close-handler

#### `<rds-divider>` — Divider
```html
<rds-divider></rds-divider>
<rds-divider orientation="vertical"></rds-divider>
<rds-divider spacing="medium"></rds-divider>
```
**Attributes**: `orientation` (`horizontal` | `vertical`), `spacing` (`none` | `small` | `medium` | `large`)

#### `<rds-hero-icon>` — Hero Icon
```html
<rds-hero-icon name="home"></rds-hero-icon>
<rds-hero-icon name="document" size="large"></rds-hero-icon>
<rds-hero-icon name="check-circle" solid></rds-hero-icon>
```
**Attributes**: `name` (Heroicons v2 name), `size`, `solid` (solid vs outline)

#### `<rds-error-page>` — Error Page
```html
<rds-error-page error-code="404"></rds-error-page>
<rds-error-page error-code="500"></rds-error-page>
```
**Variants**: default, error-code-400/401/403/404/500/502, custom-error, custom-error-with-no-error-code

---

### Drag & Drop

#### `<rds-drag-and-drop-container>` — Drag and Drop
```html
<rds-drag-and-drop-container direction="column">
  <div draggable="true">Item 1</div>
  <div draggable="true">Item 2</div>
</rds-drag-and-drop-container>
```
**Variants**: direction-row, direction-column, same-group

---

## React + TypeScript Integration

Since RDS components are Web Components (Custom Elements), they work in React but require some setup.

### TypeScript Custom Element Type Declarations

Create `src/types/rds-components.d.ts`:

```ts
import React from 'react';

// Augment JSX intrinsic elements to recognize rds-* custom elements
declare namespace JSX {
  interface IntrinsicElements {
    'rds-app-layout': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-header': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'app-name'?: string };
    'rds-nav': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-nav-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { href?: string; icon?: string; active?: boolean | string };
    'rds-footer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-page-heading': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-section-heading': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-breadcrumbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-breadcrumb-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { href?: string };
    'rds-headline': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { level?: '1' | '2' | '3'; weight?: string; spacing?: string };
    'rds-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { size?: string; weight?: string; spacing?: string; align?: string; italic?: boolean | string };
    'rds-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string; size?: string; disabled?: boolean | string; type?: string; 'icon-only'?: boolean | string };
    'rds-button-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-action-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-action': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { icon?: string; label?: string };
    'rds-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { icon?: string; size?: string };
    'rds-link': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { href?: string; variant?: string; size?: string; disabled?: boolean | string; 'icon-only'?: boolean | string };
    'rds-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; type?: string; placeholder?: string; required?: boolean | string; disabled?: boolean | string; readonly?: boolean | string; error?: string; 'help-text'?: string; 'sub-label'?: string; 'leading-icon'?: string; 'trailing-icon'?: string; 'leading-addon'?: string; 'trailing-addon'?: string; value?: string; min?: string; max?: string; minlength?: string; maxlength?: string; pattern?: string; autocomplete?: string };
    'rds-textarea': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; placeholder?: string; rows?: string | number; required?: boolean | string; disabled?: boolean | string; readonly?: boolean | string; error?: string; 'help-text'?: string; resize?: string; maxlength?: string; minlength?: string };
    'rds-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; multiple?: boolean | string; required?: boolean | string; disabled?: boolean | string; error?: string; placeholder?: string; 'label-position'?: string };
    'rds-combobox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; multiple?: boolean | string; required?: boolean | string; disabled?: boolean | string; error?: string };
    'rds-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; checked?: boolean | string; indeterminate?: boolean | string; disabled?: boolean | string; 'sub-label'?: string; 'inline-sub-label'?: string; value?: string };
    'rds-checkbox-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; orientation?: string; disabled?: boolean | string };
    'rds-radio-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; name?: string; value?: string; checked?: boolean | string; disabled?: boolean | string };
    'rds-radio-button-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; name?: string; orientation?: string; disabled?: boolean | string };
    'rds-toggle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; switched?: boolean | string; disabled?: boolean | string };
    'rds-date-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string };
    'rds-input-date-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; disabled?: boolean | string; required?: boolean | string; range?: boolean | string; min?: string; max?: string; readonly?: boolean | string };
    'rds-input-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; min?: string; max?: string; value?: string; dual?: boolean | string };
    'rds-label': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { for?: string; 'sub-label'?: string };
    'rds-form-wrapper': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { action?: string; method?: string; autocomplete?: string; name?: string; target?: string; enctype?: string; validate?: boolean | string };
    'rds-file-uploader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; accept?: string; multiple?: boolean | string; 'max-file-size'?: string; 'max-files'?: string; disabled?: boolean | string };
    'rds-search': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { placeholder?: string; disabled?: boolean | string; 'with-search-button'?: boolean | string };
    'rds-comment-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { placeholder?: string; 'raw-text'?: boolean | string };
    'rds-alert': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string; heading?: string; dismissible?: boolean | string };
    'rds-banner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string; dismissible?: boolean | string; appearance?: string };
    'rds-snackbar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string; message?: string };
    'rds-badge': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string };
    'rds-indicator': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string };
    'rds-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { size?: string };
    'rds-progress-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { value?: string | number; max?: string | number };
    'rds-progress-circle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { value?: string | number; max?: string | number; size?: string };
    'rds-skeleton': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { type?: string; width?: string | number; height?: string | number; count?: string | number };
    'rds-tabs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { variant?: string };
    'rds-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { active?: boolean | string; disabled?: boolean | string };
    'rds-pagination': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { total?: string | number; 'page-size'?: string | number; 'current-page'?: string | number; type?: string };
    'rds-stepper': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-stepper-step': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; completed?: boolean | string; active?: boolean | string };
    'rds-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { heading?: string; size?: string; 'no-escape-key-close'?: boolean | string; 'no-overlay-close'?: boolean | string };
    'rds-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { heading?: string; orientation?: string; wide?: boolean | string };
    'rds-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { position?: string; 'open-with-hover'?: boolean | string; disabled?: boolean | string };
    'rds-menu-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { value?: string; disabled?: boolean | string };
    'rds-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { content?: string; position?: string };
    'rds-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { striped?: boolean | string; compact?: boolean | string; 'vertical-lines'?: boolean | string };
    'rds-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { type?: string };
    'rds-accordion': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'single-selection-mode'?: boolean | string };
    'rds-accordion-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { heading?: string; icon?: string };
    'rds-avatar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { initials?: string; src?: string; alt?: string; size?: string; indicator?: string };
    'rds-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { active?: boolean | string; closable?: boolean | string; disabled?: boolean | string; clickable?: boolean | string };
    'rds-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { orientation?: string; spacing?: string };
    'rds-hero-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { name?: string; size?: string; solid?: boolean | string };
    'rds-error-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'error-code'?: string };
    'rds-card-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-card-header': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-card-body': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-card-footer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-card-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-card-media': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'rds-drag-and-drop-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { direction?: string; group?: string };
  }
}
```

### Handling Custom Events in React

RDS components emit native DOM custom events, not synthetic React events. Use `useEffect` with `addEventListener`:

```tsx
import { useEffect, useRef } from 'react';

function MyForm() {
  const inputRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('Value changed:', detail);
    };

    el.addEventListener('rds-change', handleChange);
    return () => el.removeEventListener('rds-change', handleChange);
  }, []);

  return <rds-input ref={inputRef} label="Name" />;
}
```

### Common RDS Events

| Component | Event | Detail |
|-----------|-------|--------|
| `rds-input` | `rds-change` | `{ value: string }` |
| `rds-select` | `rds-change` | `{ value: string \| string[] }` |
| `rds-checkbox` | `rds-change` | `{ checked: boolean }` |
| `rds-toggle` | `rds-change` | `{ switched: boolean }` |
| `rds-button` | `click` | native |
| `rds-alert` | `rds-dismiss` | — |
| `rds-modal` | `rds-open` / `rds-close` | — |
| `rds-pagination` | `rds-page-change` | `{ page: number }` |
| `rds-tabs` | `rds-tab-change` | `{ index: number }` |
| `rds-chip` | `rds-close` | — |
| `rds-combobox` | `rds-change` | `{ value: string \| string[] }` |

### Example: Complete Page Component

```tsx
import React from 'react';

export default function ProposalsPage() {
  return (
    <rds-app-layout>
      <rds-nav slot="left-sidebar">
        <rds-nav-item href="/dashboard" icon="home">Dashboard</rds-nav-item>
        <rds-nav-item href="/proposals" icon="document" active="true">Proposals</rds-nav-item>
        <rds-nav-item href="/reports" icon="chart-bar">Reports</rds-nav-item>
      </rds-nav>

      <main slot="main">
        <rds-page-heading>
          <span slot="title">Policy Proposals</span>
          <rds-button slot="actions" variant="primary">
            New Proposal
          </rds-button>
        </rds-page-heading>

        <rds-card-container>
          <rds-card-header slot="header">
            <span slot="title">Active Proposals</span>
          </rds-card-header>
          <rds-card-body slot="body">
            <rds-table striped="true">
              <table>
                <thead>
                  <tr>
                    <th>Policy #</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>POL-001</td>
                    <td><rds-badge variant="success">Approved</rds-badge></td>
                    <td>2025-01-15</td>
                    <td>
                      <rds-button variant="tertiary" size="small">View</rds-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </rds-table>
          </rds-card-body>
        </rds-card-container>
      </main>
    </rds-app-layout>
  );
}
```

---

## Quick Reference: Color Usage Guide

| Use case | Token to use |
|----------|-------------|
| Page background | `--rds-background-color-app` = `#F2F0E9` |
| Card/panel background | `--rds-background-color-container` = `#FFF` |
| Primary action buttons | `--rds-color-btn-primary` = `#383B54` |
| Brand/accent color | `--rds-color-accent-600` = `#FF5100` |
| Success states | `--rds-color-success-600` = `#16B041` |
| Error/danger states | `--rds-color-danger-600` = `#DD2647` |
| Warning/caution states | `--rds-color-caution-500` = `#E6BC00` |
| Informational | `--rds-color-info-600` = `#0073E6` |
| Body text | `--rds-color-prose-primary` = `#000` |
| Secondary/muted text | `--rds-color-prose-secondary` = `#666666` |
| Borders | `--rds-color-border` = `primary-100` |
| Links | `--rds-color-link-primary` = `#0057CA` |
| Disabled elements | `--rds-color-disabled-fg` = `#999999` |
| Focus ring | `--rds-color-focus` = `primary-600` (#383B54) |

---

*Last updated: 2026-05-28 | Source: https://rds-storybook.azurewebsites.net*
