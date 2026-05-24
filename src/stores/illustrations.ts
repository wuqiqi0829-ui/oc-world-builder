import { create } from 'zustand';
import { illustrationsApi } from '@/lib/db';
import type { Illustration } from '@/lib/database';

interface IllustrationsState {
  illustrations: Illustration[];
  loading: boolean;
  fetch: (worldId: string) => Promise<void>;
  create: (data: {
    world_id: string; name: string; description?: string;
    images?: Illustration['images']; linked_characters?: string[];
    linked_timeline_events?: string[]; linked_storylines?: string[];
    sort_order?: number;
  }) => Promise<Illustration>;
  update: (id: string, changes: Partial<Illustration>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
}

export const useIllustrations = create<IllustrationsState>((set, get) => ({
  illustrations: [],
  loading: false,
  fetch: async (worldId) => {
    set({ loading: true });
    try { set({ illustrations: await illustrationsApi.list(worldId), loading: false }); }
    catch { set({ loading: false }); }
  },
  create: async (data) => {
    const ill = await illustrationsApi.create(data as Record<string, unknown>) as Illustration;
    set((st) => ({ illustrations: [...st.illustrations, ill] }));
    return ill;
  },
  update: async (id, changes) => {
    const updated = await illustrationsApi.update(id, changes as Record<string, unknown>) as Illustration;
    set((st) => ({ illustrations: st.illustrations.map((i) => (i.id === id ? updated : i)) }));
  },
  remove: async (id) => {
    await illustrationsApi.delete(id);
    set((st) => ({ illustrations: st.illustrations.filter((i) => i.id !== id) }));
  },
  reorder: async (ids) => {
    const { illustrations } = get();
    const reordered = ids.map((id, i) => {
      const ill = illustrations.find((x) => x.id === id)!;
      return { ...ill, sort_order: i };
    });
    set({ illustrations: reordered });
    for (const [i, id] of ids.entries()) {
      await illustrationsApi.update(id, { sort_order: i } as Record<string, unknown>);
    }
  },
}));
