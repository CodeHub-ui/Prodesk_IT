# Prodesk IT – Sprint 02: Logic & Data Persistence

## Project Overview

This project is the **Sprint 02 engineering submission** for **Prodesk IT**. It extends the Sprint 01 landing page by introducing **dynamic state management, DOM manipulation, local storage persistence, and performance-oriented JavaScript architecture**.

The goal of Sprint 02 was to move beyond static UI implementation and build a functional client-side application using **Vanilla JavaScript**, without relying on frontend frameworks.

---
## Live Demo 
https://landingpagelogicanddatapersistence.netlify.app/

---

## Sprint Objective

Sprint 02 focuses on core browser engineering concepts:

* DOM Manipulation
* Application State Management
* Event Handling
* Local Storage Persistence
* Theme Persistence
* Memory Leak Prevention
* Publish–Subscribe Event Architecture

---

# Implemented Features

## Phase 1 – State Injection & DOM Manipulation

### Dynamic Data Hydration

Static HTML content has been replaced with data-driven rendering using a JavaScript object/JSON payload.

### Secure DOM Updates

UI content is updated using `textContent` to prevent XSS vulnerabilities.

### Interactive State Mutations

User actions trigger real-time UI state updates such as:

* Navigation toggle
* Theme toggle
* Text/state updates
* Visibility changes

---

## Phase 2 – Local Storage & Session Persistence

### Persistent Application State

Application preferences are serialized to `localStorage`.

### Dark Mode Persistence

The selected theme is restored automatically on page reload without visible flickering.

### Session Restoration

User-selected UI state survives browser refreshes and subsequent sessions.

---

## Phase 3 – Memory Safety & Custom Event System

### Event Listener Cleanup

Event listeners are detached using `removeEventListener` during teardown operations to avoid memory leaks.

### Custom PubSub Event Bus

A lightweight publish-subscribe event emitter is implemented to decouple business logic from DOM-specific events.

### Performance Verification

The application architecture is designed for stable memory allocation during repeated interactions and reload cycles.

---

# Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Structure    | HTML5                     |
| Styling      | CSS3                      |
| Logic        | Vanilla JavaScript (ES6+) |
| Persistence  | Browser localStorage      |
| Architecture | Custom PubSub Event Bus   |

---

# Project Structure

```text
Sprint-2/
├── index.html
├── style.css
├── script.js
├── Readme.md
└── images.png
```

---

# Functional Highlights

* Responsive navigation menu
* Persistent dark/light theme
* Dynamic content rendering
* Event-driven UI updates
* Local storage synchronization
* Memory-safe event handling
* Decoupled JavaScript architecture

---

# Responsive Design

The interface is optimized for:

* Desktop
* Laptop
* Tablet
* Mobile Devices


---

# Testing Checklist

* Theme toggle persists after refresh
* Navigation toggle works on mobile
* Dynamic content renders correctly
* No console errors during interaction
* UI state restores correctly from localStorage
* Event listeners are properly cleaned up

---

# Engineering Notes

This project intentionally avoids frameworks to demonstrate understanding of:

* Browser rendering lifecycle
* JavaScript event loop
* State mutation patterns
* DOM APIs
* Storage APIs
* Memory management fundamentals

---

# Deliverables Included

* Source code (HTML, CSS, JavaScript)
* Dynamic state implementation
* Local storage persistence
* Theme persistence
* Event bus architecture
* Responsive UI
* Performance-oriented event cleanup

---

# Sprint Compliance

This submission satisfies the mandatory requirements defined in the **Prodesk IT Sprint 02 Engineering Directive**, including all three required phases:

* Phase 1: State Injection & DOM Manipulation
* Phase 2: Local Storage & Session Persistence
* Phase 3: Memory Leak Prevention & Custom Event Emitters

---

**Built for the Prodesk IT Sprint 02 internship engineering task.**
