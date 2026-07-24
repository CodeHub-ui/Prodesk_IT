 // Book Data

const books = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: '₨499',
    cover: 'Scr/To kill.jpg'
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: '₨799',
    cover: 'Scr/Sapiens.jpg'
  },
  {
    title: 'Harry Potter and the Philosophers Stone',
    author: 'J. K. Rowling',
    price: '₨599',
    cover: 'Scr/Harry potter.jpg'
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    price: '₨699',
    cover: 'Scr/Stephen.jpg'
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: '₨899',
    cover: 'Scr/Clean code.jpg'
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    price: '₨699',
    cover: 'Scr/steve jobs.jpg'
  }
];

// Utility Functions

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Featured Books

function createBookCard(book) {
  return `
    <article class="card book-card">
      <img
        src="${book.cover}"
        alt="Cover of ${book.title} by ${book.author}"
        class="book-cover"
        width="300"
        height="450"
        loading="lazy"
      >
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <p class="book-price">${book.price}</p>
        <button
          type="button"
          class="btn btn-secondary book-details-btn"
          aria-label="View details for ${book.title}"
        >
          View Details
        </button>
      </div>
    </article>
  `;
}

function renderBooksLoading(container) {
  container.innerHTML = `
    <div class="state-message" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <p>Loading featured books...</p>
    </div>
  `;
}

function renderBooksEmpty(container) {
  container.innerHTML = `
    <div class="state-message" role="status">
      <p>No books found.</p>
    </div>
  `;
}

function renderBooks(container, bookList) {
  if (!bookList || bookList.length === 0) {
    renderBooksEmpty(container);
    return;
  }

  container.innerHTML = bookList.map(createBookCard).join('');
}

function fetchBooks() {
  const delay = 1500;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books);
    }, delay);
  });
}

async function initFeaturedBooks() {
  const booksGrid = document.getElementById('booksGrid');

  if (!booksGrid) return;

  renderBooksLoading(booksGrid);

  const bookList = await fetchBooks();
  renderBooks(booksGrid, bookList);
}

// Mobile Navigation

function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (!navToggle || !navMenu) return;

  function toggleMenu(isOpen) {
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navMenu.classList.toggle('is-open', isOpen);
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    toggleMenu(!isOpen);
  });

  navMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      toggleMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      navToggle.getAttribute('aria-expanded') === 'true'
    ) {
      toggleMenu(false);
      navToggle.focus();
    }
  });
}

// Header scroll effect

function initHeaderScrollEffect() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const scrollLimit = 10;

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > scrollLimit);
  }

  updateHeader();

  window.addEventListener('scroll', updateHeader, { passive: true });
}

 // Newsletter Form 
function setFieldError(input, statusEl, message) {
  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');
  statusEl.textContent = message;
  statusEl.classList.remove('form-status--success');
  statusEl.classList.add('form-status--error');
}

function setFieldSuccess(input, statusEl, message) {
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  statusEl.textContent = message;
  statusEl.classList.remove('form-status--error');
  statusEl.classList.add('form-status--success');
}

function clearFieldStatus(input, statusEl) {
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  statusEl.textContent = '';
  statusEl.classList.remove('form-status--error', 'form-status--success');
}

function handleNewsletterSubmit(emailInput, statusEl) {
  const email = emailInput.value.trim();

  if (email === '') {
    setFieldError(emailInput, statusEl, 'Please enter your email address.');
    return;
  }

  if (!isValidEmail(email)) {
    setFieldError(emailInput, statusEl, 'Please enter a valid email address.');
    return;
  }

  setFieldSuccess(emailInput, statusEl, 'Thanks for subscribing! Check your inbox to confirm.');

  emailInput.value = '';
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailInput = document.getElementById('newsletterEmail');
  const statusEl = document.getElementById('newsletterStatus');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleNewsletterSubmit(emailInput, statusEl);
  });

  emailInput.addEventListener('input', () => {
    clearFieldStatus(emailInput, statusEl);
  });
}

 //  Footer 

function setCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Dark or Light mode

function getInitialTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateThemeToggleButton(themeToggle, theme) {
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  let currentTheme = getInitialTheme();
  applyTheme(currentTheme);
  updateThemeToggleButton(themeToggle, currentTheme);

  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    updateThemeToggleButton(themeToggle, currentTheme);
  });
}

// Main Initialization here 

function initApp() {
  initThemeToggle();
  initMobileNav();
  initHeaderScrollEffect();
  initFeaturedBooks();
  initNewsletterForm();
  initAnalyticsTracking();
  setCurrentYear();
}

document.addEventListener('DOMContentLoaded', initApp);
