'use strict';
const CONTENT = {
  brand: {
    name: 'Prodesk IT'
  },
  nav: {
    home: 'Home',
    services: 'Services',
    about: 'About',
    contact: 'Contact'
  },
  hero: {
    titleLine1: 'Stop stitching tools together.',
    titleLine2Pre: 'Let the work',
    titleAccent: 'flow',
    titleLine2Post: 'on its own.',
    subtitle: "Prodesk it connects your team's apps into a single automated pipeline - so status updates, handoffs, and approvals happen without anyone copy-pasting between tabs.",
    ctaPrimary: 'Start free to Connect',
    ctaSecondary: 'See Services'
  },
  features: {
    eyebrow: 'Services',
    title: 'Our Specialized Services',
    cards: [
      {
        title: 'Custom Software Development',
        text: 'Tailored software solutions designed to meet your unique business requirements, from web applications to mobile apps and beyond.'
      },
      {
        title: 'IT Consulting',
        text: 'Expert guidance and strategic advice to help you navigate the ever-evolving landscape of technology, ensuring your IT infrastructure aligns with your business goals.'
      },
      {
        title: 'Real-time visibility',
        text: 'See exactly where every task sits in the pipeline, with alerts the moment something stalls.'
      }
    ]
  },
  about: {
    eyebrow: 'About',
    title: 'About Prodesk It',
    text: "We don't just write code; we engineer scalable digital ecosystems. Our mission is to transform complex technical ideas into elegant, high-performance platforms that drive real business growth for global enterprises. We work alongside our clients as one team with a shared ambition: to achieve extraordinary results, outperform the competition, and redefine industries."
  },
  cta: {
    title: 'Ready to Build Something Amazing?',
    text: 'Partner with Prodesk IT to create high-performance websites, web applications, and digital solutions that drive real business growth.',
    button: 'Contact Us'
  },
  footer: {
    copyright: '© 2026 Prodesk it, Inc. All rights reserved.'
  },
  themeToggle: {
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode'
  },
  navToggle: {
    open: 'Open menu',
    close: 'Close menu'
  }
};

/* EventBus */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.delete(handler);
  }

  emit(eventName, payload) {
    const handlers = this.listeners.get(eventName);

    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`Event handler failed for "${eventName}"`, error);
      }
    });
  }
}

const bus = new EventBus();

/* Render page content from CONTENT */
function getByPath(source, path) {
  return path
  .split('.')
  .reduce((value, key) => (value == null ? value : value[key]), source);
}

function renderContent() {
  document.querySelectorAll('[data-content]').forEach((element) => {
    const value = getByPath(CONTENT, element.getAttribute('data-content'));
    if (typeof value === 'string') 
      element.textContent = value;
  });
}

/* App state */
const THEME_STORAGE_KEY = 'prodesk-theme';

const state = {
  theme: document.documentElement.getAttribute('data-theme') || 'light',
  navOpen: false
};

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  bus.emit('theme:change', theme);
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function setNavOpen(open, navElement, toggleElement) {
  state.navOpen = open;
  navElement.classList.toggle('is-open', open);
  toggleElement.setAttribute('aria-expanded', String(open));
  bus.emit('nav:change', open);
}

/* Initializa app*/
function initApp() {
  renderContent();

  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primary-nav');
  const themeToggle = document.getElementById('themeToggle');
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function handleNavToggleClick() {
    setNavOpen(!state.navOpen, primaryNav, navToggle);
  }

  function handleThemeToggleClick() {
    toggleTheme();
  }

  function handleSystemThemeChange(e) {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  }

  function updateThemeToggleLabel(theme) {
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? CONTENT.themeToggle.toLight : CONTENT.themeToggle.toDark
    );
  }

  function updateNavToggleLabel(open) {
    navToggle.setAttribute('aria-label', open ? CONTENT.navToggle.close : CONTENT.navToggle.open);
  }

  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  }

  navToggle.addEventListener('click', handleNavToggleClick);
  themeToggle.addEventListener('click', handleThemeToggleClick);
  systemThemeQuery.addEventListener('change', handleSystemThemeChange);

  const unsubscribeThemeLabel = bus.on(
    'theme:change', updateThemeToggleLabel
  );
  const unsubscribeNavLabel = bus.on(
    'nav:change', updateNavToggleLabel
  );

  updateThemeToggleLabel(state.theme);
  updateNavToggleLabel(state.navOpen);

  return function teardown() {
    navToggle.removeEventListener('click', handleNavToggleClick);
    themeToggle.removeEventListener('click', handleThemeToggleClick);
    systemThemeQuery.removeEventListener('change', handleSystemThemeChange);
    unsubscribeThemeLabel();
    unsubscribeNavLabel();
  };
}

window.ProdeskApp = {
  teardown: initApp()
};
