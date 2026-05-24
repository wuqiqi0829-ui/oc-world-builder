import { create } from 'zustand';
import { storylinesApi } from '@/lib/db';
import type { Storyline } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface StorylinesState {
  storylines: Storyline[];
  loading: boolean;
  error: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  fetch: (worldId: string) => Promise<void>;
  create: (data: { world_id: string; title: string; description?: string }) => Promise<Storyline>;
  update: (id: string, changes: Partial<Storyline>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => void;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useStorylines = create<StorylinesState>((set, get) => ({
  storylines: [],
  loading: false,
  error: null,
  activeId: null,

  setActiveId: (id) => set({ activeId: id }),

  fetch: async (worldId) => {
    set({ loading: true, error: null });
    try { set({ storylines: await storylinesApi.list(worldId), loading: false }); }
    catch (e) { set({ error: (e as Error).message, loading: false }); }
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
    set((st) => ({
      storylines: st.storylines.filter((s) => s.id !== id),
      activeId: st.activeId === id ? null : st.activeId,
    }));
  },

  reorder: (ids) => {
    const current = get().storylines;
    const reordered = ids.map((id) => current.find((s) => s.id === id)!).filter(Boolean);
    set({ storylines: reordered });
    ids.forEach((id, i) => { storylinesApi.update(id, { sort_order: i } as Record<string, unknown>).catch(() => {}); });
  },

  startRealtime: (worldId) => {
    return storylinesApi.subscribe(
      worldId,
      (row) => {
        const sl = row as Storyline;
        set((s) => {
          const idx = s.storylines.findIndex((x) => x.id === sl.id);
          if (idx >= 0) return { storylines: s.storylines.map((x) => (x.id === sl.id ? sl : x)) };
          return { storylines: [...s.storylines, sl] };
        });
      },
      (id) => set((s) => ({
        storylines: s.storylines.filter((x) => x.id !== id),
        activeId: s.activeId === id ? null : s.activeId,
      })),
    );
  },
}));
