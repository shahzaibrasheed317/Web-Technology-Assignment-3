# E-Book — Digital Reading Library & Catalog Manager

A modern, responsive digital reading library web application built with **HTML5**, **Tailwind CSS**, **Vanilla JavaScript (ES6+)**, **Browser Local Storage**, and **Axios REST API Integration**.

---

## Project Overview

**E-Book** extends a multi-page semantic web application into an interactive, data-driven digital library. Users can curate and manage their personal reading list with full **CRUD (Create, Read, Update, Delete)** functionality persisted in the browser's `localStorage`, filter and sort records using JavaScript array methods, and discover millions of live books fetched dynamically from the **Open Library Public JSON API** via **Axios GET** requests.

---

## Key Features

### 1. Personal Reading List Manager (CRUD & Local Storage)
- **Create Records:** Add new books with Title, Author, Category (`Fiction`, `Self Growth`, `Technology`, `Travel`, `Science`, `History`), Reading Status (`Reading`, `Completed`, `Want to Read`), Publication Year, Page Count, Rating (`1.0 – 5.0`), and Personal Notes.
- **Read Records:** Dynamically renders book cards in the DOM with live collection statistics (**Total Titles**, **Completed Count**, and **Average Rating**).
- **Update Records:** Edit any existing book record in-place; selecting **Edit Details** populates the form with the current book's data and updates the record upon saving.
- **Delete Records:** Remove individual book records with an in-page confirmation modal, or restore the default starter reading list at any time.
- **Data Persistence:** Uses `localStorage.getItem()` and `localStorage.setItem()` so all added, edited, and deleted records remain intact after refreshing or reopening the browser.

### 2. Search, Filter & JavaScript Array Methods
- **`Array.prototype.filter()`**: Powers real-time multi-field keyword search (matching title, author, category, or notes), category/status dropdown filtering, and record deletion.
- **`Array.prototype.find()`**: Locates specific book objects by unique `id` when editing or deleting records.
- **`Array.prototype.map()`**: Transforms book objects into dynamic HTML card templates and performs immutable record updates.
- **`Array.prototype.some()`**: Prevents duplicate book entries (matching title and author) and checks for top-rated titles (`4.8+`) in the collection.
- **`Array.prototype.every()`**: Validates catalog integrity across all stored records.

### 3. Live Global Catalog Discovery (Axios Public API Integration)
- **Public JSON API:** Integrates the free, no-auth **Open Library Search API** (`https://openlibrary.org/search.json`).
- **Axios GET Requests:** Uses `axios.get()` via CDN to fetch live book metadata (title, primary author, first publication year, edition count, and cover artwork from `covers.openlibrary.org`).
- **Interactive Search & Quick Topics:** Search any book title, author, or subject, or use quick-filter topic buttons (`JavaScript`, `Artificial Intelligence`, `World History`, `Sci-Fi Classics`, `Psychology`).
- **Loading & Error State Handling:** Displays an animated loading spinner while requests are in flight and provides a retry banner if a network error occurs.
- **One-Click Import to Local Storage:** Any book retrieved from the live API can be saved directly into the user's personal Local Storage reading list with a single click.

---

## Project Folder Structure

```text
ebook-digital-library/
├── index.html                  # Main entry point (Hero, Categories, CRUD Manager & API Explorer)
├── README.md                   # Project documentation
├── assets/
│   └── images/
│       └── favicon.svg         # Brand SVG favicon
└── src/
    ├── app.js                  # Core JavaScript (CRUD, LocalStorage, Array Methods & Axios API)
    ├── about.html              # About page (Mission, Vision & Principles)
    ├── contact.html            # Contact page (Support details & Formspree contact form)
    ├── signin.html             # Sign In page with interactive toast feedback
    └── signup.html             # Create Account page with validation & toast feedback
```

---

## Technologies & Tools Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5 (Semantic Tags)** | Structured layout using `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<aside>`, and `<footer>` |
| **Tailwind CSS (CDN)** | Responsive utility-first styling, typography, and layout design |
| **JavaScript (ES6+)** | DOM manipulation, event delegation, array methods, and state management |
| **Web Storage API (`localStorage`)** | Client-side persistence for book records across browser sessions |
| **Axios (`v1.7.7` CDN)** | Promise-based HTTP client for asynchronous `GET` requests |
| **Open Library REST API** | External public JSON API for live book discovery and cover images |

---

## Getting Started & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   ```
2. **Navigate into the project directory:**
   ```bash
   cd your-repo-name
   ```
3. **Run the application:**
   Open `index.html` directly in any modern web browser, or launch it with the **VS Code Live Server** extension.

---

## Author

- **Muhammad Shahzaib Rasheed**
- **Email:** mshahzaibrasheed43@gmail.com
- **Location:** Lahore, Pakistan
