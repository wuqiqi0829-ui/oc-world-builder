import { create } from 'zustand';

const BOOKS_KEY = 'oc-books';
const BOOK_SL_MAP_KEY = 'oc-book-sl-map';

interface LocalBook {
  id: string;
  name: string;
  created_at: string;
}

export interface Book {
  id: string;
  name: string;
  created_at: string;
}

function loadBooks(): LocalBook[] {
  try { return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]'); } catch { return []; }
}
function saveBooks(books: LocalBook[]) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}
function loadBookSlMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(BOOK_SL_MAP_KEY) || '{}'); } catch { return {}; }
}
function saveBookSlMap(map: Record<string, string>) {
  localStorage.setItem(BOOK_SL_MAP_KEY, JSON.stringify(map));
}

function bUuid() { return 'book_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); }

interface BooksState {
  books: Book[];
  activeBookId: string | null;
  bookSlMap: Record<string, string>;
  fetchBooks: () => void;
  createBook: (name: string) => Book;
  removeBook: (id: string) => void;
  renameBook: (id: string, name: string) => void;
  setActiveBook: (id: string | null) => void;
  assignStoryline: (storylineId: string, bookId: string) => void;
  unassignStoryline: (storylineId: string) => void;
  getStorylinesForBook: (bookId: string, allStorylineIds: string[]) => string[];
}

export const useBooks = create<BooksState>((set, get) => ({
  books: [],
  activeBookId: null,
  bookSlMap: {},

  fetchBooks: () => {
    let books = loadBooks();
    if (books.length === 0) {
      const defaultBook: LocalBook = { id: bUuid(), name: '主线', created_at: new Date().toISOString() };
      books = [defaultBook];
      saveBooks(books);
    }
    const bookSlMap = loadBookSlMap();
    const savedBookId = localStorage.getItem('oc-active-book');
    const activeBookId = savedBookId && books.find(b => b.id === savedBookId) ? savedBookId : books[0]?.id || null;
    set({ books, bookSlMap, activeBookId });
  },

  createBook: (name) => {
    const books = loadBooks();
    const book: LocalBook = { id: bUuid(), name, created_at: new Date().toISOString() };
    books.push(book);
    saveBooks(books);
    set(s => ({ books: [...s.books, book], activeBookId: book.id }));
    localStorage.setItem('oc-active-book', book.id);
    return book;
  },

  removeBook: (id) => {
    const books = loadBooks().filter(b => b.id !== id);
    saveBooks(books);
    const map = loadBookSlMap();
    for (const key of Object.keys(map)) {
      if (map[key] === id) delete map[key];
    }
    saveBookSlMap(map);
    set(s => {
      const remaining = s.books.filter(b => b.id !== id);
      return {
        books: remaining,
        activeBookId: s.activeBookId === id ? (remaining[0]?.id || null) : s.activeBookId,
        bookSlMap: map,
      };
    });
  },

  renameBook: (id, name) => {
    const books = loadBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx >= 0) { books[idx].name = name; saveBooks(books); }
    set(s => ({ books: s.books.map(b => b.id === id ? { ...b, name } : b) }));
  },

  setActiveBook: (id) => {
    set({ activeBookId: id });
    if (id) localStorage.setItem('oc-active-book', id);
  },

  assignStoryline: (storylineId, bookId) => {
    const map = loadBookSlMap();
    map[storylineId] = bookId;
    saveBookSlMap(map);
    set({ bookSlMap: map });
  },

  unassignStoryline: (storylineId) => {
    const map = loadBookSlMap();
    delete map[storylineId];
    saveBookSlMap(map);
    set({ bookSlMap: map });
  },

  getStorylinesForBook: (bookId, allStorylineIds) => {
    const map = get().bookSlMap;
    return allStorylineIds.filter(id => {
      const mappedBook = map[id];
      if (!mappedBook) return bookId === get().books[0]?.id; // unassigned → first book
      return mappedBook === bookId;
    });
  },
}));
