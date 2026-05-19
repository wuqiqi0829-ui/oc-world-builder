import { create } from 'zustand';
import { tagsApi } from '@/lib/db';
import type { Tag } from '@/lib/database';

interface TagsState {
  tags: Tag[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (name: string, color?: string) => Promise<Tag>;
  update: (id: string, changes: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  assign: (tagId: string, targetType: string, targetId: string) => Promise<void>;
  unassign: (tagId: string, targetType: string, targetId: string) => Promise<void>;
  getForTarget: (targetType: string, targetId: string) => Promise<string[]>;
}

export const useTags = create<TagsState>((set) => ({
  tags: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const tags = await tagsApi.list();
      set({ tags, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  create: async (name, color) => {
    const tag = await tagsApi.create(name, color);
    set((s) => ({ tags: [...s.tags, tag] }));
    return tag;
  },

  update: async (id, changes) => {
    const updated = await tagsApi.update(id, changes);
    set((s) => ({ tags: s.tags.map((t) => (t.id === id ? updated : t)) }));
  },

  remove: async (id) => {
    await tagsApi.delete(id);
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
  },

  assign: async (tagId, targetType, targetId) => {
    await tagsApi.assign(tagId, targetType, targetId);
  },

  unassign: async (tagId, targetType, targetId) => {
    await tagsApi.unassign(tagId, targetType, targetId);
  },

  getForTarget: async (targetType, targetId) => {
    return tagsApi.getForTarget(targetType, targetId);
  },
}));
