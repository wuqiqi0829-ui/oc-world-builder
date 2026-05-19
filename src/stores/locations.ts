import { create } from 'zustand';
import { locationsApi } from '@/lib/db';
import type { Location } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface LocationsState {
  locations: Location[];
  loading: boolean;
  mapImageUrl: string;
  setMapImageUrl: (url: string) => void;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<Location> & { world_id: string; name: string }) => Promise<Location>;
  update: (id: string, changes: Partial<Location>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useLocations = create<LocationsState>((set) => ({
  locations: [],
  loading: false,
  mapImageUrl: '',

  setMapImageUrl: (url) => {
    set({ mapImageUrl: url });
    if (url) localStorage.setItem('oc-map-url', url);
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
