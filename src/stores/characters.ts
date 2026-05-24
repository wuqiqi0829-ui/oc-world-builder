import { create } from 'zustand';
import { charactersApi } from '@/lib/db';
import type { Character } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CharactersState {
  characters: Character[];
  loading: boolean;
  error: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<Character> & { world_id: string; name: string }) => Promise<Character>;
  update: (id: string, changes: Partial<Character>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (ids: string[]) => void;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useCharacters = create<CharactersState>((set, get) => ({
  characters: [],
  loading: false,
  error: null,
  activeId: null,

  setActiveId: (id) => set({ activeId: id }),

  fetch: async (worldId) => {
    set({ loading: true, error: null });
    try {
      const characters = await charactersApi.list(worldId);
      set({ characters, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  create: async (data) => {
    const character = await charactersApi.create(data as Record<string, unknown>) as Character;
    set((s) => ({ characters: [character, ...s.characters] }));
    return character;
  },

  update: async (id, changes) => {
    const updated = await charactersApi.update(id, changes as Record<string, unknown>) as Character;
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? updated : c)) }));
  },

  remove: async (id) => {
    await charactersApi.delete(id);
    set((s) => ({
      characters: s.characters.filter((c) => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }));
  },

  reorder: (ids) => {
    const current = get().characters;
    const reordered = ids.map((id) => current.find((c) => c.id === id)!).filter(Boolean);
    set({ characters: reordered });
    ids.forEach((id, i) => { charactersApi.update(id, { sort_order: i } as Record<string, unknown>).catch(() => {}); });
  },

  startRealtime: (worldId) => {
    return charactersApi.subscribe(
      worldId,
      (row) => {
        const ch = row as Character;
        set((s) => {
          const idx = s.characters.findIndex((c) => c.id === ch.id);
          if (idx >= 0) return { characters: s.characters.map((c) => (c.id === ch.id ? ch : c)) };
          return { characters: [ch, ...s.characters] };
        });
      },
      (id) => set((s) => ({ characters: s.characters.filter((c) => c.id !== id) })),
    );
  },
}));
