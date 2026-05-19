import { create } from 'zustand';
import { worldsApi } from '@/lib/db';
import type { World, NewWorld, UpdateWorld } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface WorldsState {
  worlds: World[];
  activeWorldId: string | null;
  loading: boolean;
  error: string | null;
  setActiveWorld: (id: string | null) => void;
  fetchWorlds: () => Promise<void>;
  createWorld: (data: NewWorld) => Promise<World>;
  updateWorld: (id: string, changes: UpdateWorld) => Promise<void>;
  deleteWorld: (id: string) => Promise<void>;
  startRealtime: () => RealtimeChannel;
}

export const useWorlds = create<WorldsState>((set, get) => ({
  worlds: [],
  activeWorldId: null,
  loading: false,
  error: null,

  setActiveWorld: (id) => {
    set({ activeWorldId: id });
    if (id) localStorage.setItem('oc-active-world', id);
    else localStorage.removeItem('oc-active-world');
  },

  fetchWorlds: async () => {
    set({ loading: true, error: null });
    try {
      const worlds = await worldsApi.list();
      set({ worlds, loading: false });
      // Restore last active world
      const saved = localStorage.getItem('oc-active-world');
      if (saved && worlds.find((w) => w.id === saved)) {
        set({ activeWorldId: saved });
      } else if (worlds.length > 0 && !get().activeWorldId) {
        set({ activeWorldId: worlds[0].id });
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createWorld: async (data) => {
    const world = await worldsApi.create(data);
    set((s) => ({ worlds: [...s.worlds, world], activeWorldId: world.id }));
    return world;
  },

  updateWorld: async (id, changes) => {
    const updated = await worldsApi.update(id, changes);
    set((s) => ({ worlds: s.worlds.map((w) => (w.id === id ? updated : w)) }));
  },

  deleteWorld: async (id) => {
    await worldsApi.delete(id);
    set((s) => {
      const remaining = s.worlds.filter((w) => w.id !== id);
      return {
        worlds: remaining,
        activeWorldId: s.activeWorldId === id ? (remaining[0]?.id || null) : s.activeWorldId,
      };
    });
  },

  startRealtime: () => {
    return worldsApi.subscribe(
      (row) => {
        set((s) => {
          const idx = s.worlds.findIndex((w) => w.id === row.id);
          if (idx >= 0) return { worlds: s.worlds.map((w) => (w.id === row.id ? row : w)) };
          return { worlds: [...s.worlds, row] };
        });
      },
      (id) => {
        set((s) => ({ worlds: s.worlds.filter((w) => w.id !== id) }));
      }
    );
  },
}));
