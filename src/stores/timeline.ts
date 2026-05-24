import { create } from 'zustand';
import { timelineApi } from '@/lib/db';
import type { TimelineEvent, Timeline } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// localStorage keys
const TL_LIST_KEY = 'oc-timeline-list';
const TL_EVENT_MAP_KEY = 'oc-timeline-event-map';

interface LocalTimeline { id: string; world_id: string; name: string; parent_id?: string; sort_order: number; }

function loadLocalTimelines(worldId: string): LocalTimeline[] {
  try {
    const raw = localStorage.getItem(TL_LIST_KEY + '-' + worldId);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalTimelines(worldId: string, tls: LocalTimeline[]) {
  localStorage.setItem(TL_LIST_KEY + '-' + worldId, JSON.stringify(tls));
}

function loadEventTimelineMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TL_EVENT_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveEventTimelineMap(map: Record<string, string>) {
  localStorage.setItem(TL_EVENT_MAP_KEY, JSON.stringify(map));
}

function uuid() { return 'tl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); }

function localToTimeline(l: LocalTimeline): Timeline {
  return { id: l.id, world_id: l.world_id, user_id: '', name: l.name, parent_id: l.parent_id, sort_order: l.sort_order, created_at: '', updated_at: '' } as Timeline;
}

interface TimelineState {
  timelines: Timeline[];
  events: TimelineEvent[];
  activeTimelineId: string | null;
  parentTimelineId: string | null;
  compareTimelineIds: string[];
  compareEventsMap: Record<string, TimelineEvent[]>;
  loading: boolean;
  error: string | null;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  setActiveTimeline: (id: string) => void;
  toggleCompareTimeline: (id: string) => void;
  clearCompare: () => void;
  fetchCompare: (worldId: string) => Promise<void>;
  fetchTimelines: (worldId: string) => Promise<void>;
  createTimeline: (data: { world_id: string; name: string; parent_id?: string }, switchTo?: boolean) => Promise<Timeline>;
  removeTimeline: (id: string) => Promise<void>;
  renameTimeline: (id: string, name: string) => void;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<TimelineEvent> & { world_id: string; title: string; timeline_id?: string }) => Promise<TimelineEvent>;
  update: (id: string, changes: Partial<TimelineEvent>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useTimeline = create<TimelineState>((set, get) => ({
  timelines: [],
  events: [],
  activeTimelineId: null,
  parentTimelineId: null,
  compareTimelineIds: [],
  compareEventsMap: {},
  loading: false,
  error: null,
  sortOrder: 'asc',

  setSortOrder: (order) => set({ sortOrder: order }),

  setActiveTimeline: (id) => {
    const tl = get().timelines.find(t => t.id === id);
    set({ activeTimelineId: id, parentTimelineId: tl?.parent_id || null, loading: true });
    if (id) localStorage.setItem('oc-active-timeline', id);
  },

  toggleCompareTimeline: (id) => {
    set(s => {
      const ids = s.compareTimelineIds.includes(id)
        ? s.compareTimelineIds.filter(x => x !== id)
        : [...s.compareTimelineIds, id];
      return { compareTimelineIds: ids };
    });
  },

  clearCompare: () => set({ compareTimelineIds: [], compareEventsMap: {} }),

  fetchCompare: async (worldId) => {
    const { compareTimelineIds, timelines } = get();
    if (!compareTimelineIds.length || !worldId) return;
    const allEvents = await timelineApi.list(worldId);
    const eventMap = loadEventTimelineMap();
    const map: Record<string, TimelineEvent[]> = {};
    for (const tlId of compareTimelineIds) {
      map[tlId] = allEvents.filter(e => {
        const mappedTlId = eventMap[e.id];
        if (!mappedTlId) return tlId === timelines.find(t => !t.parent_id)?.id;
        return mappedTlId === tlId;
      });
    }
    set({ compareEventsMap: map });
  },

  fetchTimelines: async (worldId) => {
    let localTLs = loadLocalTimelines(worldId);
    if (localTLs.length === 0) {
      const defaultTL: LocalTimeline = { id: uuid(), world_id: worldId, name: '主线', sort_order: 0 };
      localTLs = [defaultTL];
      saveLocalTimelines(worldId, localTLs);
    }
    const timelines = localTLs.map(localToTimeline);
    set({ timelines });
    const saved = localStorage.getItem('oc-active-timeline');
    const activeId = saved && timelines.find(t => t.id === saved) ? saved : timelines[0]?.id || null;
    if (activeId && !get().activeTimelineId) {
      const activeTl = timelines.find(t => t.id === activeId);
      set({ activeTimelineId: activeId, parentTimelineId: activeTl?.parent_id || null });
    }
  },

  createTimeline: async (data, switchTo) => {
    const worldId = data.world_id;
    const localTLs = loadLocalTimelines(worldId);
    const newTL: LocalTimeline = { id: uuid(), world_id: worldId, name: data.name, parent_id: data.parent_id, sort_order: localTLs.length };
    localTLs.push(newTL);
    saveLocalTimelines(worldId, localTLs);
    const tl = localToTimeline(newTL);
    set(s => ({ timelines: [...s.timelines, tl], ...(switchTo !== false ? { activeTimelineId: tl.id, parentTimelineId: tl.parent_id || null, loading: true } : {}) }));
    if (switchTo !== false) localStorage.setItem('oc-active-timeline', tl.id);
    return tl;
  },

  removeTimeline: async (id) => {
    const worldId = get().timelines.find(t => t.id === id)?.world_id;
    if (worldId) {
      const localTLs = loadLocalTimelines(worldId).filter(t => t.id !== id);
      const idsToRemove = new Set([id, ...localTLs.filter(t => t.parent_id === id).map(t => t.id)]);
      saveLocalTimelines(worldId, localTLs.filter(t => !idsToRemove.has(t.id)));
    }
    set(s => {
      const remaining = s.timelines.filter(t => t.id !== id && t.parent_id !== id);
      return {
        timelines: remaining,
        activeTimelineId: s.activeTimelineId === id ? (remaining.find(t => !t.parent_id)?.id || remaining[0]?.id || null) : s.activeTimelineId,
        events: s.activeTimelineId === id ? [] : s.events,
        parentTimelineId: s.activeTimelineId === id ? null : s.parentTimelineId,
        compareTimelineIds: s.compareTimelineIds.filter(x => x !== id),
      };
    });
  },

  renameTimeline: (id, name) => {
    set(s => ({ timelines: s.timelines.map(t => t.id === id ? { ...t, name } : t) }));
    const tl = get().timelines.find(t => t.id === id);
    if (tl) {
      const localTLs = loadLocalTimelines(tl.world_id);
      const idx = localTLs.findIndex(t => t.id === id);
      if (idx >= 0) { localTLs[idx].name = name; saveLocalTimelines(tl.world_id, localTLs); }
    }
  },

  fetch: async (worldId) => {
    if (!worldId) return;
    set({ loading: true, error: null });
    try {
      const allEvents = await timelineApi.list(worldId);
      const eventMap = loadEventTimelineMap();
      const activeId = get().activeTimelineId;
      const filtered = allEvents.filter(e => {
        const tlId = eventMap[e.id];
        if (!tlId) {
          return activeId === get().timelines.find(t => !t.parent_id)?.id;
        }
        return tlId === activeId;
      });
      set({ events: filtered, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  create: async (data) => {
    const tlId = data.timeline_id || get().activeTimelineId || '';
    const cleanData: Record<string, unknown> = { ...data, sort_order: get().events.length };
    delete cleanData.timeline_id;
    const event = await timelineApi.create(cleanData) as TimelineEvent;
    if (tlId) {
      const eventMap = loadEventTimelineMap();
      eventMap[event.id] = tlId;
      saveEventTimelineMap(eventMap);
      event.timeline_id = tlId;
    }
    set((s) => ({ events: [...s.events, event] }));
    return event;
  },

  update: async (id, changes) => {
    const clean: Record<string, unknown> = { ...changes };
    delete clean.timeline_id;
    const updated = await timelineApi.update(id, clean) as TimelineEvent;
    set((s) => {
      const newCompareMap = { ...s.compareEventsMap };
      for (const tlId of Object.keys(newCompareMap)) {
        newCompareMap[tlId] = newCompareMap[tlId].map((e) => (e.id === id ? { ...updated, timeline_id: e.timeline_id } : e));
      }
      return {
        events: s.events.map((e) => (e.id === id ? { ...updated, timeline_id: e.timeline_id } : e)),
        compareEventsMap: newCompareMap,
      };
    });
  },

  remove: async (id) => {
    await timelineApi.delete(id);
    const eventMap = loadEventTimelineMap();
    delete eventMap[id];
    saveEventTimelineMap(eventMap);
    set((s) => {
      const newCompareMap = { ...s.compareEventsMap };
      for (const tlId of Object.keys(newCompareMap)) {
        newCompareMap[tlId] = newCompareMap[tlId].filter((e) => e.id !== id);
      }
      return {
        events: s.events.filter((e) => e.id !== id),
        compareEventsMap: newCompareMap,
      };
    });
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
          const newEvents = idx >= 0
            ? s.events.map((e) => (e.id === ev.id ? { ...ev, timeline_id: e.timeline_id } : e))
            : [...s.events, ev];
          const newCompareMap = { ...s.compareEventsMap };
          for (const tlId of Object.keys(newCompareMap)) {
            const cIdx = newCompareMap[tlId].findIndex((e) => e.id === ev.id);
            if (cIdx >= 0) {
              newCompareMap[tlId] = newCompareMap[tlId].map((e) => (e.id === ev.id ? { ...ev, timeline_id: e.timeline_id } : e));
            }
          }
          return { events: newEvents, compareEventsMap: newCompareMap };
        });
      },
      (id) => set((s) => {
        const newCompareMap = { ...s.compareEventsMap };
        for (const tlId of Object.keys(newCompareMap)) {
          newCompareMap[tlId] = newCompareMap[tlId].filter((e) => e.id !== id);
        }
        return { events: s.events.filter((e) => e.id !== id), compareEventsMap: newCompareMap };
      }),
    );
  },
}));
