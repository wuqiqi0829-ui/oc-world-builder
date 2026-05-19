import { create } from 'zustand';
import { timelineApi } from '@/lib/db';
import type { TimelineEvent } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TimelineState {
  events: TimelineEvent[];
  loading: boolean;
  error: string | null;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<TimelineEvent> & { world_id: string; title: string }) => Promise<TimelineEvent>;
  update: (id: string, changes: Partial<TimelineEvent>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useTimeline = create<TimelineState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  sortOrder: 'asc',

  setSortOrder: (order) => set({ sortOrder: order }),

  fetch: async (worldId) => {
    set({ loading: true, error: null });
    try {
      const events = await timelineApi.list(worldId);
      set({ events, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  create: async (data) => {
    const event = await timelineApi.create({
      ...data,
      sort_order: get().events.length,
    } as Record<string, unknown>) as TimelineEvent;
    set((s) => ({ events: [...s.events, event] }));
    return event;
  },

  update: async (id, changes) => {
    const updated = await timelineApi.update(id, changes as Record<string, unknown>) as TimelineEvent;
    set((s) => ({ events: s.events.map((e) => (e.id === id ? updated : e)) }));
  },

  remove: async (id) => {
    await timelineApi.delete(id);
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },

  reorder: async (ids) => {
    const { events } = get();
    const reordered = ids.map((id, i) => {
      const e = events.find((ev) => ev.id === id)!;
      return { ...e, sort_order: i };
    });
    set({ events: reordered });
    for (const [i, id] of ids.entries()) {
      await timelineApi.update(id, { sort_order: i } as Record<string, unknown>);
    }
  },

  startRealtime: (worldId) => {
    return timelineApi.subscribe(
      worldId,
      (row) => {
        const ev = row as TimelineEvent;
        set((s) => {
          const idx = s.events.findIndex((e) => e.id === ev.id);
          if (idx >= 0) return { events: s.events.map((e) => (e.id === ev.id ? ev : e)) };
          return { events: [...s.events, ev] };
        });
      },
      (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    );
  },
}));
