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
  ensureDefaultCategories: (worldId: string) => Promise<void>;
  fetchCategories: (worldId: string) => Promise<void>;
  fetchEntries: (categoryId: string) => Promise<void>;
  createCategory: (data: { world_id: string; name: string; fields?: CustomCategory['fields'] }) => Promise<CustomCategory>;
  updateCategory: (id: string, changes: Partial<CustomCategory>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  createEntry: (data: { category_id: string; name: string }) => Promise<CustomEntry>;
  updateEntry: (id: string, changes: Partial<CustomEntry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  reorderEntries: (_categoryId: string, orderedIds: string[]) => Promise<void>;
}

export const useCategories = create<CategoriesState>((set, get) => ({
  categories: [],
  entries: {},
  loading: false,
  entryLoading: false,
  activeCategoryId: null,

  setActiveCategory: (id) => set({ activeCategoryId: id }),

  ensureDefaultCategories: async (worldId: string) => {
    // 去重已有分类
    const cats = await customCategoriesApi.list(worldId);
    const seen = new Map<string, string[]>();
    for (const c of cats) {
      if (!seen.has(c.name)) seen.set(c.name, []);
      seen.get(c.name)!.push(c.id);
    }
    // 删除重复项（保留最早创建的）
    for (const [, ids] of seen) {
      if (ids.length > 1) {
        const [, ...remove] = ids;
        for (const id of remove) {
          customCategoriesApi.delete(id).catch(() => {});
        }
      }
    }
    // 创建缺失的分类
    const defaults = ['种族', '职业', '组织', '势力'];
    for (const name of defaults) {
      if (!seen.has(name)) {
        await customCategoriesApi.create({ world_id: worldId, name, fields: [] } as Record<string, unknown>);
      }
    }
  },

  fetchCategories: async (worldId) => {
    set({ loading: true });
    try {
      await get().ensureDefaultCategories(worldId);
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
      const entries = await customEntriesApi.listByCategory(categoryId);
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

  reorderEntries: async (_categoryId, orderedIds) => {
    await Promise.all(
      orderedIds.map((id, i) =>
        customEntriesApi.update(id, { sort_order: i } as Record<string, unknown>).catch(() => {})
      )
    );
  },
}));
