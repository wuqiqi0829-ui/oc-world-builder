import { create } from 'zustand';
import { itemsApi } from '@/lib/db';
import type { Item } from '@/lib/database';

interface ItemsState {
  items: Item[];
  loading: boolean;
  fetch: (worldId: string) => Promise<void>;
  create: (data: { world_id: string; name: string; category?: string; description?: string; images?: Item['images']; attributes?: Item['attributes'] }) => Promise<Item>;
  update: (id: string, changes: Partial<Item>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => void;
}

export const useItems = create<ItemsState>((set, get) => ({
  items: [],
  loading: false,
  fetch: async (worldId) => {
    set({ loading: true });
    try { set({ items: await itemsApi.list(worldId), loading: false }); }
    catch { set({ loading: false }); }
  },
  create: async (data) => {
    const item = await itemsApi.create(data as Record<string, unknown>) as Item;
    set((st) => ({ items: [...st.items, item] }));
    return item;
  },
  update: async (id, changes) => {
    const updated = await itemsApi.update(id, changes as Record<string, unknown>) as Item;
    set((st) => ({ items: st.items.map((i) => (i.id === id ? updated : i)) }));
  },
  remove: async (id) => {
    await itemsApi.delete(id);
    set((st) => ({ items: st.items.filter((i) => i.id !== id) }));
  },

  reorder: (ids) => {
    const current = get().items;
    const reordered = ids.map((id) => current.find((i) => i.id === id)!).filter(Boolean);
    set({ items: reordered });
    ids.forEach((id, i) => { itemsApi.update(id, { sort_order: i } as Record<string, unknown>).catch(() => {}); });
  },
}));
