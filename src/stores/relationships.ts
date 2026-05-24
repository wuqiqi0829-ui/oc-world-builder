import { create } from 'zustand';
import { relationshipsApi } from '@/lib/db';
import type { Relationship } from '@/lib/database';

interface RelationshipsState {
  relationships: Relationship[];
  loading: boolean;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<Relationship> & { world_id: string; source_type: string; source_id: string; target_type: string; target_id: string; relation_type: string }) => Promise<Relationship>;
  update: (id: string, changes: Partial<Relationship>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removePair: (id1: string, id2: string) => Promise<void>;
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

  update: async (id, changes) => {
    const updated = await relationshipsApi.update(id, changes as Record<string, unknown>) as Relationship;
    set((s) => ({
      relationships: s.relationships.map((r) => (r.id === id ? updated : r)),
    }));
  },

  remove: async (id) => {
    await relationshipsApi.delete(id);
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) }));
  },

  removePair: async (id1, id2) => {
    await Promise.all([
      relationshipsApi.delete(id1),
      relationshipsApi.delete(id2),
    ]);
    set((s) => ({
      relationships: s.relationships.filter((r) => r.id !== id1 && r.id !== id2),
    }));
  },
}));
