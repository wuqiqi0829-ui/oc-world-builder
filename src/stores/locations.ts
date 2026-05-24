import { create } from 'zustand';
import { locationsApi } from '@/lib/db';
import type { Location } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface LocationsState {
  locations: Location[];
  loading: boolean;
  mapImageUrl: string;
  setMapImageUrl: (url: string, worldId?: string) => void;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<Location> & { world_id: string; name: string }) => Promise<Location>;
  update: (id: string, changes: Partial<Location>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => void;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useLocations = create<LocationsState>((set, get) => ({
  locations: [],
  loading: false,
  mapImageUrl: '',

  setMapImageUrl: (url, worldId?: string) => {
    set({ mapImageUrl: url });
    const wid = worldId || get().locations[0]?.world_id;
    if (wid) {
      if (url) localStorage.setItem(`oc-map-${wid}`, url);
      else localStorage.removeItem(`oc-map-${wid}`);
    }
  },

  fetch: async (worldId) => {
    set({ loading: true });
    try {
      const locations = await locationsApi.list(worldId);
      const savedMapUrl = localStorage.getItem(`oc-map-${worldId}`) || '';
      set({ locations, loading: false, mapImageUrl: savedMapUrl });
    } catch {
      set({ loading: false });
    }
  },

  create: async (data) => {
    const loc = await locationsApi.create(data as Record<string, unknown>) as Location;
    set((s) => ({ locations: [...s.locations, loc] }));
    return loc;
  },

  update: async (id, changes) => {
    const updated = await locationsApi.update(id, changes as Record<string, unknown>) as Location;
    set((s) => ({ locations: s.locations.map((l) => (l.id === id ? updated : l)) }));
  },

  remove: async (id) => {
    await locationsApi.delete(id);
    set((s) => ({ locations: s.locations.filter((l) => l.id !== id) }));
  },

  reorder: (ids) => {
    const current = get().locations;
    const reordered = ids.map((id) => current.find((l) => l.id === id)!).filter(Boolean);
    set({ locations: reordered });
    ids.forEach((id, i) => { locationsApi.update(id, { sort_order: i } as Record<string, unknown>).catch(() => {}); });
  },

  startRealtime: (worldId) => {
    return locationsApi.subscribe(
      worldId,
      (row) => {
        const loc = row as Location;
        set((s) => {
          const idx = s.locations.findIndex((l) => l.id === loc.id);
          if (idx >= 0) return { locations: s.locations.map((l) => (l.id === loc.id ? loc : l)) };
          return { locations: [...s.locations, loc] };
        });
      },
      (id) => set((s) => ({ locations: s.locations.filter((l) => l.id !== id) })),
    );
  },
}));
