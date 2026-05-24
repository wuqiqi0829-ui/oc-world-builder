import { create } from 'zustand';
import { tablesApi } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { TableItem } from '@/lib/database';

interface TablesState {
  tables: TableItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: { world_id: string; title: string; category?: string; description?: string; images?: TableItem['images']; linked_characters?: string[]; show?: boolean }) => Promise<TableItem>;
  update: (id: string, changes: Partial<TableItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
}

export const useTables = create<TablesState>((set, get) => ({
  tables: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('sort_order').order('created_at', { ascending: false });
      if (error) throw error;
      set({ tables: data as TableItem[], loading: false });
    } catch { set({ loading: false }); }
  },

  create: async (data) => {
    const item = await tablesApi.create(data as Record<string, unknown>) as TableItem;
    set((s) => ({ tables: [...s.tables, item] }));
    return item;
  },

  update: async (id, changes) => {
    const updated = await tablesApi.update(id, changes as Record<string, unknown>) as TableItem;
    set((s) => ({ tables: s.tables.map((t) => t.id === id ? updated : t) }));
  },

  remove: async (id) => {
    await tablesApi.delete(id);
    set((s) => ({ tables: s.tables.filter((t) => t.id !== id) }));
  },

  reorder: async (ids) => {
    const current = get().tables;
    const reordered = ids.map((id) => current.find((t) => t.id === id)!).filter(Boolean);
    set({ tables: reordered });
    for (let i = 0; i < ids.length; i++) {
      await tablesApi.update(ids[i], { sort_order: i } as Record<string, unknown>).catch(() => {});
    }
  },
}));
