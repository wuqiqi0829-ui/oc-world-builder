import { create } from 'zustand';
import { customCategoriesApi, customEntriesApi } from '@/lib/db';
import type { CustomCategory, CustomEntry } from '@/lib/database';

interface CategoriesState {
  categories: CustomCategory[];
  entries: Record<string, CustomEntry[]>; // keyed by category_id
  loading: boolean;
  entryLoading: boolean;
  activeCategoryId: string | null;
  setActiveCategory: (id: string | null) => void;
  fetchCategories: (worldId: string) => Promise<void>;
  fetchEntries: (categoryId: string) => Promise<void>;
  createCategory: (data: { world_id: string; name: string; fields?: CustomCategory['fields'] }) => Promise<CustomCategory>;
  updateCategory: (id: string, changes: Partial<CustomCategory>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  createEntry: (data: { category_id: string; name: string }) => Promise<CustomEntry>;
  updateEntry: (id: string, changes: Partial<CustomEntry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export const useCategories = create<CategoriesState>((set, get) => ({
  categories: [],
  entries: {},
  loading: false,
  entryLoading: false,
  activeCategoryId: null,

  setActiveCategory: (id) => set({ activeCategoryId: id }),

  fetchCategories: async (worldId) => {
    set({ loading: true });
    try {
      const cats = await customCategoriesApi.list(worldId);
      set({ categories: cats, loading: false });
      if (cats.length > 0 && !get().activeCategoryId) {
        set({ activeCategoryId: cats[0].id });
      }
    } catch { set({ loading: false }); }
  },

  fetchEntries: async (categoryId) => {
    set({ entryLoading: true });
    try {
      const entries = await customEntriesApi.list(categoryId);
      set((s) => ({ entries: { ...s.entries, [categoryId]: entries }, entryLoading: false }));
    } catch { set({ entryLoading: false }); }
  },

  createCategory: async (data) => {
    const cat = await customCategoriesApi.create(data as Record<string, unknown>) as CustomCategory;
    set((s) => ({ categories: [...s.categories, cat], activeCategoryId: cat.id }));
    return cat;
  },

  updateCategory: async (id, changes) => {
    const updated = await customCategoriesApi.update(id, changes as Record<string, unknown>) as CustomCategory;
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? updated : c)) }));
  },

  removeCategory: async (id) => {
    await customCategoriesApi.delete(id);
    set((s) => {
      const remaining = s.categories.filter((c) => c.id !== id);
      const { [id]: _, ...rest } = s.entries;
      return { categories: remaining, entries: rest, activeCategoryId: s.activeCategoryId === id ? (remaining[0]?.id || null) : s.activeCategoryId };
    });
  },

  createEntry: async (data) => {
    const entry = await customEntriesApi.create(data as Record<string, unknown>) as CustomEntry;
    set((s) => ({
      entries: {
        ...s.entries,
        [data.category_id]: [entry, ...(s.entries[data.category_id] || [])],
      },
    }));
    return entry;
  },

  updateEntry: async (id, changes) => {
    const updated = await customEntriesApi.update(id, changes as Record<string, unknown>) as CustomEntry;
    set((s) => {
      const newEntries = { ...s.entries };
      for (const [catId, entries] of Object.entries(newEntries)) {
        const idx = entries.findIndex((e) => e.id === id);
        if (idx >= 0) {
          newEntries[catId] = entries.map((e) => (e.id === id ? updated : e));
          break;
        }
      }
      return { entries: newEntries };
    });
  },

  removeEntry: async (id) => {
    await customEntriesApi.delete(id);
    set((s) => {
      const newEntries = { ...s.entries };
      for (const [catId, entries] of Object.entries(newEntries)) {
        newEntries[catId] = entries.filter((e) => e.id !== id);
      }
      return { entries: newEntries };
    });
  },
}));
