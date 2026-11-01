/**
 * E-Book Digital Library
 * Personal Reading Collection & Live Catalog Discovery
 */

const STORAGE_KEY = 'ebook_library_records_v1';

const DEFAULT_BOOKS = [
  {
    id: 'bk-101',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self Growth',
    year: 2018,
    pages: 320,
    rating: 4.9,
    status: 'Completed',
    notes: 'Practical framework for building good habits and breaking bad ones.'
  },
  {
    id: 'bk-102',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    year: 1988,
    pages: 208,
    rating: 4.7,
    status: 'Reading',
    notes: 'An inspiring fable about following your personal legend and dreams.'
  },
  {
    id: 'bk-103',
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    category: 'Fiction',
    year: 1937,
    pages: 310,
    rating: 4.8,
    status: 'Completed',
    notes: 'Classic fantasy adventure through Middle-earth with Bilbo Baggins.'
  },
  {
    id: 'bk-104',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Technology',
    year: 2016,
    pages: 296,
    rating: 4.6,
    status: 'Want to Read',
    notes: 'Rules for focused success in a distracted digital world.'
  }
];

let books = [];
let editingBookId = null;
let pendingDeleteId = null;

function loadBooksFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        books = parsed;
        return;
      }
    }
  } catch (err) {
    console.warn('Storage read warning:', err);
  }
  books = [...DEFAULT_BOOKS];
  saveBooksToStorage();
}

function saveBooksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.warn('Storage write warning:', err);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('appToastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-300';
  if (type === 'error') {
    toast.classList.add('bg-red-600');
  } else {
    toast.classList.add('bg-gray-950');
  }

  toast.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
  }, 3200);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStatusDotColor(status) {
  if (status === 'Completed') return 'bg-emerald-500';
  if (status === 'Reading') return 'bg-amber-500';
  return 'bg-gray-400';
}

function updateLibraryStats() {
  const totalEl = document.getElementById('statTotalBooks');
  const completedEl = document.getElementById('statCompletedBooks');
  const avgRatingEl = document.getElementById('statAvgRating');

  const totalCount = books.length;
  const completedCount = books.filter(b => b.status === 'Completed').length;
  const ratings = books.map(b => Number(b.rating) || 0);
  const avgRating = totalCount > 0
    ? (ratings.reduce((acc, r) => acc + r, 0) / totalCount).toFixed(1)
    : '0.0';

  // Array.prototype.every() and Array.prototype.some() validation checks
  const allValidRecords = books.length > 0 && books.every(b => b.title && b.author && Number(b.rating) >= 1 && Number(b.rating) <= 5);
  const hasTopRated = books.some(b => Number(b.rating) >= 4.8);

  if (totalEl) totalEl.textContent = totalCount;
  if (completedEl) completedEl.textContent = completedCount;
  if (avgRatingEl) avgRatingEl.textContent = `${avgRating} / 5.0`;

  const summaryNote = document.getElementById('collectionSummaryNote');
  if (summaryNote) {
    summaryNote.textContent = allValidRecords && hasTopRated
      ? `${totalCount} curated titles in your collection`
      : `${totalCount} titles in your collection`;
  }
}

function renderBooks() {
  const container = document.getElementById('booksGridContainer');
  const emptyState = document.getElementById('booksEmptyState');
  const resultsCountEl = document.getElementById('booksResultCount');
  if (!container) return;

  const searchInput = document.getElementById('searchQueryInput');
  const categorySelect = document.getElementById('filterCategorySelect');
  const statusSelect = document.getElementById('filterStatusSelect');
  const sortSelect = document.getElementById('sortOrderSelect');

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const categoryFilter = categorySelect ? categorySelect.value : 'All';
  const statusFilter = statusSelect ? statusSelect.value : 'All';
  const sortBy = sortSelect ? sortSelect.value : 'newest';

  const filteredBooks = books.filter(book => {
    const matchesQuery = !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query) ||
      (book.notes && book.notes.toLowerCase().includes(query));

    const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || book.status === statusFilter;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
    if (sortBy === 'year') return Number(b.year) - Number(a.year);
    return 0;
  });

  if (resultsCountEl) {
    resultsCountEl.textContent = `Showing ${sortedBooks.length} of ${books.length} title${books.length === 1 ? '' : 's'}`;
  }

  if (sortedBooks.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    const cardsHtml = sortedBooks.map((book, idx) => {
      const dotColor = getStatusDotColor(book.status);
      const indexNumber = String(idx + 1).padStart(2, '0');
      return `
        <article class="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-book-id="${escapeHtml(book.id)}">
          <div>
            <div class="bg-gray-950 px-6 py-4 text-white flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-widest text-amber-400">${escapeHtml(book.category)}</span>
              <span class="inline-flex items-center gap-2 text-xs font-medium text-gray-300">
                <span class="h-2 w-2 rounded-full ${dotColor}"></span>
                ${escapeHtml(book.status)}
              </span>
            </div>
            <div class="p-6 pb-4">
              <div class="flex items-baseline justify-between gap-2">
                <h3 class="text-xl font-black text-gray-950 line-clamp-1" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3>
                <span class="text-xs font-bold text-gray-400">${indexNumber}</span>
              </div>
              <p class="mt-1 text-sm font-semibold text-gray-600">by ${escapeHtml(book.author)}</p>
              <p class="mt-3 text-sm leading-6 text-gray-500 line-clamp-2">${escapeHtml(book.notes || 'No notes provided for this book.')}</p>
            </div>
          </div>
          <div class="px-6 pb-6 pt-3 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Published ${escapeHtml(book.year)} &middot; ${escapeHtml(book.pages)} pages</span>
              <span class="text-gray-950 font-bold">Rating ${Number(book.rating).toFixed(1)} / 5.0</span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <button type="button" data-action="edit" data-id="${escapeHtml(book.id)}" class="rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition">
                Edit Details
              </button>
              <button type="button" data-action="delete" data-id="${escapeHtml(book.id)}" class="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition">
                Remove
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
    container.innerHTML = cardsHtml;
  }

  updateLibraryStats();
}

function handleBookFormSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById('bookTitle');
  const authorInput = document.getElementById('bookAuthor');
  const categoryInput = document.getElementById('bookCategory');
  const yearInput = document.getElementById('bookYear');
  const pagesInput = document.getElementById('bookPages');
  const ratingInput = document.getElementById('bookRating');
  const statusInput = document.getElementById('bookStatus');
  const notesInput = document.getElementById('bookNotes');

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const category = categoryInput.value;
  const year = parseInt(yearInput.value, 10) || 2024;
  const pages = parseInt(pagesInput.value, 10) || 250;
  const rating = parseFloat(ratingInput.value) || 4.5;
  const status = statusInput.value;
  const notes = notesInput.value.trim();

  if (!title || !author) {
    showToast('Please enter both book title and author name.', 'error');
    return;
  }

  const isDuplicate = books.some(
    b => b.id !== editingBookId &&
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase()
  );

  if (isDuplicate) {
    showToast('This title and author already exist in your library.', 'error');
    return;
  }

  if (editingBookId) {
    const targetBook = books.find(b => b.id === editingBookId);
    if (targetBook) {
      books = books.map(b => b.id === editingBookId
        ? { ...b, title, author, category, year, pages, rating, status, notes }
        : b
      );
      saveBooksToStorage();
      renderBooks();
      resetFormMode();
      showToast(`Updated "${title}" in your library.`);
    }
  } else {
    const newRecord = {
      id: 'bk-' + Date.now(),
      title,
      author,
      category,
      year,
      pages,
      rating,
      status,
      notes
    };
    books.unshift(newRecord);
    saveBooksToStorage();
    renderBooks();
    e.target.reset();
    showToast(`Added "${title}" to your library.`);
  }
}

function startEditBook(bookId) {
  const record = books.find(b => b.id === bookId);
  if (!record) return;

  editingBookId = record.id;
  document.getElementById('bookTitle').value = record.title;
  document.getElementById('bookAuthor').value = record.author;
  document.getElementById('bookCategory').value = record.category;
  document.getElementById('bookYear').value = record.year;
  document.getElementById('bookPages').value = record.pages;
  document.getElementById('bookRating').value = record.rating;
  document.getElementById('bookStatus').value = record.status;
  document.getElementById('bookNotes').value = record.notes || '';

  const formHeading = document.getElementById('crudFormTitle');
  const submitBtn = document.getElementById('crudSubmitBtn');
  const cancelEditBtn = document.getElementById('crudCancelEditBtn');

  if (formHeading) formHeading.textContent = 'Edit Book Details';
  if (submitBtn) submitBtn.textContent = 'Save Changes';
  if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');

  const formSection = document.getElementById('crudFormCard');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function resetFormMode() {
  editingBookId = null;
  const form = document.getElementById('bookCrudForm');
  if (form) form.reset();

  const formHeading = document.getElementById('crudFormTitle');
  const submitBtn = document.getElementById('crudSubmitBtn');
  const cancelEditBtn = document.getElementById('crudCancelEditBtn');

  if (formHeading) formHeading.textContent = 'Add a Book';
  if (submitBtn) submitBtn.textContent = 'Add to Library';
  if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
}

function requestDeleteBook(bookId) {
  const record = books.find(b => b.id === bookId);
  if (!record) return;

  pendingDeleteId = bookId;
  const modal = document.getElementById('deleteConfirmModal');
  const titleSpan = document.getElementById('deleteModalBookTitle');
  if (titleSpan) titleSpan.textContent = `"${record.title}" by ${record.author}`;
  if (modal) modal.classList.remove('hidden');
}

function confirmDeleteBook() {
  if (!pendingDeleteId) return;
  const record = books.find(b => b.id === pendingDeleteId);
  books = books.filter(b => b.id !== pendingDeleteId);
  saveBooksToStorage();
  renderBooks();

  if (editingBookId === pendingDeleteId) {
    resetFormMode();
  }
  pendingDeleteId = null;
  const modal = document.getElementById('deleteConfirmModal');
  if (modal) modal.classList.add('hidden');
  showToast(record ? `Removed "${record.title}" from your library.` : 'Book removed.');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteConfirmModal');
  if (modal) modal.classList.add('hidden');
}

function resetDefaultBooks() {
  books = [...DEFAULT_BOOKS];
  saveBooksToStorage();
  resetFormMode();
  renderBooks();
  showToast('Restored default reading list.');
}

let lastApiBooks = [];

async function fetchPublicApiBooks(searchQuery = 'javascript programming') {
  const apiGrid = document.getElementById('apiBooksGrid');
  const apiLoading = document.getElementById('apiLoadingState');
  const apiError = document.getElementById('apiErrorState');
  const apiErrorMsg = document.getElementById('apiErrorMessage');

  if (!apiGrid) return;

  const cleanQuery = (searchQuery || 'classic literature').trim();
  const endpointUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=8`;

  apiLoading.classList.remove('hidden');
  apiError.classList.add('hidden');
  apiGrid.innerHTML = '';

  try {
    if (typeof axios === 'undefined') {
      throw new Error('Network client is not loaded.');
    }

    const response = await axios.get(endpointUrl, { timeout: 12000 });
    const docs = (response.data && Array.isArray(response.data.docs)) ? response.data.docs : [];

    lastApiBooks = docs.slice(0, 8).map((doc, index) => ({
      apiId: doc.key || `ol-${index}`,
      title: doc.title || 'Untitled Book',
      author: Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown Author',
      year: doc.first_publish_year || 2020,
      pages: doc.number_of_pages_median || 240,
      editionCount: doc.edition_count || 1,
      subject: Array.isArray(doc.subject) && doc.subject.length > 0 ? doc.subject[0] : 'General',
      rating: doc.ratings_average ? Number(doc.ratings_average).toFixed(1) : '4.5',
      coverId: doc.cover_i || null
    }));

    apiLoading.classList.add('hidden');

    if (lastApiBooks.length === 0) {
      apiGrid.innerHTML = `
        <div class="col-span-full rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No books found for "<strong>${escapeHtml(cleanQuery)}</strong>". Try searching another keyword or author.
        </div>
      `;
      return;
    }

    apiGrid.innerHTML = lastApiBooks.map((item, idx) => {
      const coverBanner = item.coverId
        ? `<img src="https://covers.openlibrary.org/b/id/${encodeURIComponent(item.coverId)}-M.jpg" alt="${escapeHtml(item.title)}" class="h-48 w-full object-cover bg-gray-100" loading="lazy">`
        : `<div class="flex h-48 w-full flex-col justify-between bg-gray-950 p-5 text-white">
             <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Open Library</span>
             <p class="text-xl font-black line-clamp-2">${escapeHtml(item.title)}</p>
             <span class="text-xs text-gray-400">${escapeHtml(item.author)}</span>
           </div>`;

      return `
        <article class="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div>
            ${coverBanner}
            <div class="p-5 pb-3">
              <p class="text-xs font-semibold uppercase tracking-wider text-amber-700">First Published ${escapeHtml(item.year)} &middot; ${escapeHtml(item.editionCount)} Editions</p>
              <h3 class="mt-2 text-lg font-black text-gray-950 line-clamp-1" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
              <p class="mt-1 text-sm text-gray-500 line-clamp-1">${escapeHtml(item.author)}</p>
            </div>
          </div>
          <div class="px-5 pb-5 pt-2">
            <button type="button" data-action="save-api-book" data-index="${idx}" class="w-full rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition">
              Save to Library
            </button>
          </div>
        </article>
      `;
    }).join('');
  } catch (error) {
    apiLoading.classList.add('hidden');
    apiError.classList.remove('hidden');
    if (apiErrorMsg) {
      apiErrorMsg.textContent = error.message || 'Unable to load catalog results right now. Please check your connection and try again.';
    }
  }
}

function importApiBookToCrud(index) {
  const item = lastApiBooks[index];
  if (!item) return;

  const exists = books.some(
    b => b.title.toLowerCase() === item.title.toLowerCase() &&
         b.author.toLowerCase() === item.author.toLowerCase()
  );

  if (exists) {
    showToast(`"${item.title}" is already in your reading collection.`);
    return;
  }

  const newBook = {
    id: 'bk-' + Date.now(),
    title: item.title,
    author: item.author,
    category: 'Technology',
    year: Number(item.year) || 2022,
    pages: Number(item.pages) || 260,
    rating: Number(item.rating) || 4.5,
    status: 'Want to Read',
    notes: `Added from global catalog (${item.editionCount} editions).`
  };

  books.unshift(newBook);
  saveBooksToStorage();
  renderBooks();
  showToast(`Saved "${item.title}" to your reading collection.`);
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  loadBooksFromStorage();
  renderBooks();

  const crudForm = document.getElementById('bookCrudForm');
  if (crudForm) {
    crudForm.addEventListener('submit', handleBookFormSubmit);
  }

  const cancelEditBtn = document.getElementById('crudCancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetFormMode);
  }

  const resetDefaultsBtn = document.getElementById('resetDefaultBooksBtn');
  if (resetDefaultsBtn) {
    resetDefaultsBtn.addEventListener('click', resetDefaultBooks);
  }

  const searchInput = document.getElementById('searchQueryInput');
  const categorySelect = document.getElementById('filterCategorySelect');
  const statusSelect = document.getElementById('filterStatusSelect');
  const sortSelect = document.getElementById('sortOrderSelect');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  if (searchInput) searchInput.addEventListener('input', renderBooks);
  if (categorySelect) categorySelect.addEventListener('change', renderBooks);
  if (statusSelect) statusSelect.addEventListener('change', renderBooks);
  if (sortSelect) sortSelect.addEventListener('change', renderBooks);
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'All';
      if (statusSelect) statusSelect.value = 'All';
      if (sortSelect) sortSelect.value = 'newest';
      renderBooks();
    });
  }

  const booksContainer = document.getElementById('booksGridContainer');
  if (booksContainer) {
    booksContainer.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('button[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-action');
      const id = actionBtn.getAttribute('data-id');
      if (action === 'edit') startEditBook(id);
      if (action === 'delete') requestDeleteBook(id);
    });
  }

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeleteBook);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  const apiSearchForm = document.getElementById('apiSearchForm');
  const apiSearchInput = document.getElementById('apiSearchInput');
  const apiRetryBtn = document.getElementById('apiRetryBtn');

  if (apiSearchForm && apiSearchInput) {
    apiSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fetchPublicApiBooks(apiSearchInput.value);
    });
  }

  if (apiRetryBtn) {
    apiRetryBtn.addEventListener('click', () => {
      const q = apiSearchInput ? apiSearchInput.value : 'javascript programming';
      fetchPublicApiBooks(q);
    });
  }

  document.querySelectorAll('[data-api-topic]').forEach(topicBtn => {
    topicBtn.addEventListener('click', () => {
      const topic = topicBtn.getAttribute('data-api-topic');
      if (apiSearchInput) apiSearchInput.value = topic;
      fetchPublicApiBooks(topic);
    });
  });

  const apiBooksGrid = document.getElementById('apiBooksGrid');
  if (apiBooksGrid) {
    apiBooksGrid.addEventListener('click', (e) => {
      const saveBtn = e.target.closest('button[data-action="save-api-book"]');
      if (!saveBtn) return;
      const idx = parseInt(saveBtn.getAttribute('data-index'), 10);
      importApiBookToCrud(idx);
    });
    fetchPublicApiBooks('javascript programming');
  }
});
