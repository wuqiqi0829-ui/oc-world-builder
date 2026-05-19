import { create } from 'zustand';
import { storylinesApi } from '@/lib/db';
import type { Storyline } from '@/lib/database';

interface StorylinesState {
  storylines: Storyline[];
  loading: boolean;
  fetch: (worldId: string) => Promise<void>;
  create: (data: { world_id: string; title: string; description?: string }) => Promise<Storyline>;
  update: (id: string, changes: Partial<Storyline>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useStorylines = create<StorylinesState>((set) => ({
  storylines: [],
  loading: false,
  fetch: async (worldId) => {
    set({ loading: true });
    try { set({ storylines: await storylinesApi.list(worldId), loading: false }); }
    catch { set({ loading: false }); }
  },
  create: async (data) => {
    const s = await storylinesApi.create(data as Record<string, unknown>) as Storyline;
    set((st) => ({ storylines: [...st.storylines, s] }));
    return s;
  },
  update: async (id, changes) => {
    const updated = await storylinesApi.update(id, changes as Record<string, unknown>) as Storyline;
    set((st) => ({ storylines: st.storylines.map((s) => (s.id === id ? updated : s)) }));
  },
  remove: async (id) => {
    await storylinesApi.delete(id);
    set((st) => ({ storylines: st.storylines.filter((s) => s.id !== id) }));
  },
}));
