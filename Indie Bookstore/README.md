## Indie Bookstore — Indie Bookstore Landing Page

A complete, responsive static landing page for a fictional independent bookstore, **Indie Bookstore**. Built with plain HTML5, CSS3, and vanilla JavaScript — no frameworks, no build tools, no external UI libraries.

## Project Overview

Indie Bookstore is a single-page marketing site for an indie bookstore. It presents the store's featured titles, browsing categories, value proposition, customer testimonials, and a newsletter signup, wrapped in a sticky-navigation header and a full footer. Featured books are loaded asynchronously (simulated) to demonstrate real-world loading, empty, and populated states, and the newsletter form includes full client-side validation and input sanitization.

The visual design follows a modern, minimal, monochrome (black / white / gray) corporate aesthetic, built mobile-first with Flexbox and CSS Grid.

## Features

- **Navigation** with a logo, anchor links, an accessible animated hamburger menu on mobile, and a subtle shadow that appears on scroll.
- **Dark mode toggle** — a sun/moon icon button in the header switches the whole site between light and dark themes. The page follows the visitor's OS-level color-scheme preference automatically on first load; the button lets them override it for that visit. All theming runs through one layer of semantic CSS custom properties (`--surface-page`, `--text-heading`, etc.), so components never hardcode a color directly.
- **Hero section** with a headline, supporting copy, two calls to action, and a responsive hero image (`srcset`/`sizes`).
- **Featured Books** grid of 6 books, populated dynamically by JavaScript:
  - Shows a loading spinner for ~1.5s to simulate a network request.
  - Renders book cards (cover, title, author, price, "View Details") once data arrives.
- **Categories** grid (Fiction, Non-Fiction, Science, History, Biography, Children's Books), each card linking back to the books section.
- **Why Choose Us** — four feature cards (Large Collection, Fast Delivery, Secure Payment, Affordable Prices).
- **Testimonials** — three customer quotes with star ratings and initials-based avatars.
- **Newsletter form** with:
  - Empty-input and invalid-email-format validation.
  - Inline error message plus a red input border on invalid submission.
  - A success message and form reset on valid submission.
- **Footer** with Quick Links, Contact details, Social links, and a copyright line with a JS-updated year.

## Folder Structure

```
Indie Bookstore/
├── Scr             # To store images
├── index.html      # Semantic work for all sections
├── style.css        # Mobile-first, organized stylesheet  
├── script.js        # Small, single-purpose functions grouped by feature
└── README.md         # This file
```

All three source files sit in the same folder and reference each other with relative paths (`style.css`, `script.js`), so the folder can be moved or renamed freely as long as the files stay together.

## Technologies Used

- **HTML5** — semantic elements (`header`, `nav`, `main`, `section`, `article`, `figure`, `blockquote`, `address`, `footer`).
- **CSS3** — custom properties for design  Flexbox for one-dimensional alignment (nav bar, card contents, form rows), CSS Grid for card layouts (books, categories, features, testimonials, footer columns), `clamp()` for fluid headings, `aspect-ratio` for stable image layout.
- **Vanilla JavaScript (ES6+)** — `async`/`await`, template literals, event delegation, no dependencies.

No React, no Bootstrap/Tailwind, no jQuery, no icon or UI libraries. Category and feature icons are hand-written inline SVGs styled with `currentColor` so they inherit the page's monochrome theme automatically.

## Responsive Design

Built mobile-first: base styles target small screens, with `min-width` media queries layering on enhancements at **640px** (tablet) and **1024px** (desktop). Key adaptive behavior:

- Card grids (books, categories, features, testimonials, footer) go from 1 → 2 → 3/4 columns.
- The hero switches from a stacked, centered layout to a two-column row at desktop.
- Navigation collapses into a hamburger-triggered menu below 1024px and becomes a horizontal bar above it.
- The newsletter input and button stack vertically on small screens and sit side-by-side from 640px up.
- Spacing follows a consistent 16px / 32px / 64px scale (with an 8px half-step used sparingly for small details like icon gaps).

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a correct, non-skipping heading hierarchy (single `h1` → section `h2`s → card-level `h3`s).
- Visible focus styles on all interactive elements (`:focus-visible` for links/buttons, always-visible `:focus` on form fields), including inverted focus-ring colors on the dark newsletter/footer sections so they stay visible.
- Every image has descriptive, specific `alt` text (e.g. "Cover of *The Silent Orchard* by Maren Whitlock" rather than "book cover").
- Decorative icons are marked `aria-hidden="true"`.
- The newsletter field has a real, programmatically-associated `<label>` (visually hidden, since the placeholder communicates purpose visually) plus `aria-describedby` pointing at the live status message.
- Form errors are announced via `aria-live="polite"` and are never conveyed by color alone — a text message always accompanies the red input border.
- The mobile menu button uses `aria-expanded`/`aria-controls`, closes on <kbd>Escape</kbd>, and returns focus to the toggle button.
- Repeated "View Details" buttons each get a unique `aria-label` (e.g. "View details for The Lantern Wood by Sana Iqbal") so they're distinguishable out of context.
- Respects `prefers-reduced-motion`.
- The dark mode button is a real toggle for assistive tech: `aria-pressed` reflects the current state and `aria-label` updates between "Switch to dark mode" / "Switch to light mode".

This project targets a Lighthouse Accessibility score close to 100; no purely decorative content is exposed to assistive tech, and no interactive control lacks an accessible name.


