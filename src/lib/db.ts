import { supabase } from './supabase';
import type {
  World, NewWorld, UpdateWorld,
  Character, TimelineEvent, Location,
  Organization, Item, Relationship,
  Storyline, Note, NewNote, UpdateNote,
  Tag, CustomCategory, CustomEntry,
} from './database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// 通用 CRUD 工厂
// ============================================

function crud<T extends { id: string }>(table: string) {
  return {
    list: async (worldId: string) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as T[];
    },

    get: async (id: string) => {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data as T;
    },

    create: async (row: Record<string, unknown>) => {
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) throw error;
      return data as T;
    },

    update: async (id: string, changes: Record<string, unknown>) => {
      const { data, error } = await supabase.from(table).update(changes).eq('id', id).select().single();
      if (error) throw error;
      return data as T;
    },

    delete: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },

    subscribe: (worldId: string, onUpsert: (row: T) => void, onDelete: (id: string) => void): RealtimeChannel => {
      return supabase
        .channel(`${table}-${worldId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter: `world_id=eq.${worldId}` },
          (payload) => onUpsert(payload.new as T))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter: `world_id=eq.${worldId}` },
          (payload) => onUpsert(payload.new as T))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table, filter: `world_id=eq.${worldId}` },
          (payload) => onDelete((payload.old as T).id))
        .subscribe();
    },
  };
}

// ============================================
// 各模块 API
// ============================================

export const worldsApi = {
  list: async () => {
    const { data, error } = await supabase.from('worlds').select('*').order('sort_order');
    if (error) throw error;
    return data as World[];
  },
  create: async (row: NewWorld) => {
    const { data, error } = await supabase.from('worlds').insert(row).select().single();
    if (error) throw error;
    return data as World;
  },
  update: async (id: string, changes: UpdateWorld) => {
    const { data, error } = await supabase.from('worlds').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data as World;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('worlds').delete().eq('id', id);
    if (error) throw error;
  },
  subscribe: (onUpsert: (row: World) => void, onDelete: (id: string) => void) => {
    return supabase
      .channel('worlds')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'worlds' }, (p) => onUpsert(p.new as World))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'worlds' }, (p) => onUpsert(p.new as World))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'worlds' }, (p) => onDelete((p.old as World).id))
      .subscribe();
  },
};

export const charactersApi = crud<Character>('characters');
export const timelineApi = crud<TimelineEvent>('timeline_events');
export const locationsApi = crud<Location>('locations');
export const organizationsApi = crud<Organization>('organizations');
export const itemsApi = crud<Item>('items');
export const storylinesApi = crud<Storyline>('storylines');

// Relationships needs special query (by source or target)
export const relationshipsApi = {
  ...crud<Relationship>('relationships'),
  listForEntity: async (worldId: string, _entityType: string, entityId: string) => {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('world_id', worldId)
      .or(`source_id.eq.${entityId},target_id.eq.${entityId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Relationship[];
  },
};

export const notesApi = {
  list: async (worldId?: string) => {
    let q = supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (worldId) q = q.eq('world_id', worldId);
    const { data, error } = await q;
    if (error) throw error;
    return data as Note[];
  },
  create: async (row: NewNote) => {
    const { data, error } = await supabase.from('notes').insert(row).select().single();
    if (error) throw error;
    return data as Note;
  },
  update: async (id: string, changes: UpdateNote) => {
    const { data, error } = await supabase.from('notes').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data as Note;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },
};

export const tagsApi = {
  list: async () => {
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) throw error;
    return data as Tag[];
  },
  create: async (name: string, color?: string) => {
    const { data, error } = await supabase.from('tags').insert({ name, color: color || '#7C5CBF' }).select().single();
    if (error) throw error;
    return data as Tag;
  },
  update: async (id: string, changes: Partial<Pick<Tag, 'name' | 'color'>>) => {
    const { data, error } = await supabase.from('tags').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data as Tag;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;
  },
  assign: async (tagId: string, targetType: string, targetId: string) => {
    const { error } = await supabase.from('tag_assignments').insert({ tag_id: tagId, target_type: targetType, target_id: targetId });
    if (error && error.code !== '23505') throw error; // ignore duplicate
  },
  unassign: async (tagId: string, targetType: string, targetId: string) => {
    const { error } = await supabase
      .from('tag_assignments')
      .delete()
      .eq('tag_id', tagId)
      .eq('target_type', targetType)
      .eq('target_id', targetId);
    if (error) throw error;
  },
  getForTarget: async (targetType: string, targetId: string) => {
    const { data, error } = await supabase
      .from('tag_assignments')
      .select('tag_id')
      .eq('target_type', targetType)
      .eq('target_id', targetId);
    if (error) throw error;
    return (data || []).map((a: { tag_id: string }) => a.tag_id);
  },
};

export const customCategoriesApi = crud<CustomCategory>('custom_categories');
export const customEntriesApi = crud<CustomEntry>('custom_entries');

// ============================================
// 图片上传
// ============================================
export async function uploadImage(file: File, path: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error, data } = await supabase.storage.from('images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteImage(url: string) {
  const path = url.split('/images/')[1];
  if (path) {
    await supabase.storage.from('images').remove([path]);
  }
}
