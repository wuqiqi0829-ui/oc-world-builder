import { create } from 'zustand';
import { organizationsApi } from '@/lib/db';
import type { Organization } from '@/lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface OrgsState {
  organizations: Organization[];
  loading: boolean;
  fetch: (worldId: string) => Promise<void>;
  create: (data: Partial<Organization> & { world_id: string; name: string }) => Promise<Organization>;
  update: (id: string, changes: Partial<Organization>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  startRealtime: (worldId: string) => RealtimeChannel;
}

export const useOrganizations = create<OrgsState>((set) => ({
  organizations: [],
  loading: false,

  fetch: async (worldId) => {
    set({ loading: true });
    try {
      const orgs = await organizationsApi.list(worldId);
      set({ organizations: orgs, loading: false });
    } catch { set({ loading: false }); }
  },

  create: async (data) => {
    const org = await organizationsApi.create(data as Record<string, unknown>) as Organization;
    set((s) => ({ organizations: [...s.organizations, org] }));
    return org;
  },

  update: async (id, changes) => {
    const updated = await organizationsApi.update(id, changes as Record<string, unknown>) as Organization;
    set((s) => ({ organizations: s.organizations.map((o) => (o.id === id ? updated : o)) }));
  },

  remove: async (id) => {
    await organizationsApi.delete(id);
    set((s) => ({ organizations: s.organizations.filter((o) => o.id !== id) }));
  },

  startRealtime: (worldId) => {
    return organizationsApi.subscribe(
      worldId,
      (row) => {
        const org = row as Organization;
        set((s) => {
          const idx = s.organizations.findIndex((o) => o.id === org.id);
          if (idx >= 0) return { organizations: s.organizations.map((o) => (o.id === org.id ? org : o)) };
          return { organizations: [...s.organizations, org] };
        });
      },
      (id) => set((s) => ({ organizations: s.organizations.filter((o) => o.id !== id) })),
    );
  },
}));
