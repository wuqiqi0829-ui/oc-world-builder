import { create } from 'zustand';
import { relationshipsApi } from '@/lib/db';
import type { Relationship } from '@/lib/database';

interface RelationshipsState {
  relationships: Relationship[];
  loading: boolean;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<Relationship> & { world_id: string; source_type: string; source_id: string; target_type: string; target_id: string; relation_type: string }) => Promise<Relationship>;
  remove: (id: string) => Promise<void>;
}

export const useRelationships = create<RelationshipsState>((set) => ({
  relationships: [],
  loading: false,

  fetch: async (worldId) => {
    set({ loading: true });
    try {
      const rels = await relationshipsApi.list(worldId);
      set({ relationships: rels, loading: false });
    } catch { set({ loading: false }); }
  },

  create: async (data) => {
    const rel = await relationshipsApi.create(data as Record<string, unknown>) as Relationship;
    set((s) => ({ relationships: [...s.relationships, rel] }));
    return rel;
  },

  remove: async (id) => {
    await relationshipsApi.delete(id);
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) }));
  },
}));
