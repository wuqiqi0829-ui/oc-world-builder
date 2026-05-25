import { supabase } from './supabase';
import type {
  World, NewWorld, UpdateWorld,
  Character, Timeline, TimelineEvent, Location,
  Organization, Item, Relationship,
  Storyline, Note, NewNote, UpdateNote,
  Illustration, TableItem,
  Tag, CustomCategory, CustomEntry,
} from './database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// 通用 CRUD 工厂
// ============================================

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

function crud<T extends { id: string }>(table: string) {
  return {
    list: async (worldId: string) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('world_id', worldId)
        .order('sort_order').order('created_at', { ascending: false });
      if (error) throw error;
      return data as T[];
    },

    get: async (id: string) => {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data as T;
    },

    create: async (row: Record<string, unknown>) => {
      const userId = await getUserId();
      const { data, error } = await supabase.from(table).insert({ ...row, user_id: userId }).select().single();
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
    const { data, error } = await supabase.from('worlds').select('*').order('sort_order').order('created_at');
    if (error) throw error;
    return data as World[];
  },
  create: async (row: NewWorld) => {
    const userId = await getUserId();
    const { data, error } = await supabase.from('worlds').insert({ ...row, user_id: userId }).select().single();
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
export const timelinesApi = crud<Timeline>('timelines');
export const timelineApi = {
  ...crud<TimelineEvent>('timeline_events'),
  listByTimeline: async (timelineId: string) => {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('timeline_id', timelineId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data as TimelineEvent[];
  },
};
export const locationsApi = {
  ...crud<Location>('locations'),
  list: async (worldId: string) => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('world_id', worldId)
      .order('sort_order').order('created_at', { ascending: true });
    if (error) throw error;
    return data as Location[];
  },
};
export const organizationsApi = crud<Organization>('organizations');
export const itemsApi = crud<Item>('items');
export const storylinesApi = crud<Storyline>('storylines');
export const illustrationsApi = crud<Illustration>('illustrations');
export const tablesApi = crud<TableItem>('tables');

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
    const userId = await getUserId();
    const { data, error } = await supabase.from('notes').insert({ ...row, user_id: userId }).select().single();
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
    const userId = await getUserId();
    const { data, error } = await supabase.from('tags').insert({ name, color: color || '#7C5CBF', user_id: userId }).select().single();
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
export const customEntriesApi = {
  ...crud<CustomEntry>('custom_entries'),
  listByCategory: async (categoryId: string): Promise<CustomEntry[]> => {
    const { data, error } = await supabase.from('custom_entries').select('*').eq('category_id', categoryId).order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CustomEntry[];
  },
};

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

export async function uploadImageOriginal(file: File, path: string): Promise<string> {
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

// ============================================
// 全局搜索
// ============================================
export interface SearchResult {
  id: string;
  type: 'character' | 'timeline' | 'location' | 'organization' | 'item' | 'storyline' | 'illustration' | 'note';
  title: string;
  subtitle: string;
  world_id: string;
  world_name: string;
}

// ============================================
// 分享链接
// ============================================
export const shareApi = {
  enable: async (): Promise<string> => {
    const data = await appDataApi.get('share-token');
    const token = data?.token || crypto.randomUUID();
    await appDataApi.set('share-token', { token, enabled: true });
    return token;
  },
  disable: async () => {
    await appDataApi.set('share-token', { token: '', enabled: false });
  },
  getByToken: async (token: string) => {
    const data = await appDataApi.get('share-token');
    if (!data?.enabled || data.token !== token) return null;
    return { valid: true };
  },
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim() || query.trim().length < 1) return [];
  const pattern = `%${query.trim()}%`;
  const results: SearchResult[] = [];

  const tables = [
    { table: 'characters', type: 'character' as const, nameField: 'name', subField: 'nickname' },
    { table: 'timeline_events', type: 'timeline' as const, nameField: 'title', subField: 'time_label' },
    { table: 'locations', type: 'location' as const, nameField: 'name', subField: 'region' },
    { table: 'organizations', type: 'organization' as const, nameField: 'name', subField: 'type' },
    { table: 'items', type: 'item' as const, nameField: 'name', subField: 'category' },
    { table: 'storylines', type: 'storyline' as const, nameField: 'title', subField: null },
    { table: 'illustrations', type: 'illustration' as const, nameField: 'name', subField: 'description' },
    { table: 'notes', type: 'note' as const, nameField: null, subField: null },
  ];

  // Get world names first
  const { data: worlds } = await supabase.from('worlds').select('id, name');

  for (const { table, type, nameField, subField } of tables) {
    let q = supabase.from(table).select('id, world_id');
    if (nameField) q = q.select(`id, world_id, ${nameField}`);
    if (subField) q = q.select(`id, world_id, ${nameField}, ${subField}`);

    if (table === 'notes') {
      q = q.ilike('content', pattern);
    } else {
      const orParts = nameField ? [`${nameField}.ilike.${pattern}`] : [];
      if (subField) orParts.push(`${subField}.ilike.${pattern}`);
      q = q.or(orParts.join(','));
    }

    q = q.limit(10);

    const { data, error } = await q;
    if (error || !data) continue;

    for (const row of data as Record<string, string>[]) {
      const world = worlds?.find((w) => w.id === row.world_id);
      results.push({
        id: row.id,
        type,
        title: type === 'note' ? (row.content || '').slice(0, 60) : (row[nameField || 'id'] || ''),
        subtitle: subField ? (row[subField] || '') : '',
        world_id: row.world_id,
        world_name: world?.name || '未知世界观',
      });
    }
  }

  return results;
}

// ============================================
// App Data — cross-device key-value sync
// ============================================
export const appDataApi = {
  get: async (key: string): Promise<any | null> => {
    const { data, error } = await supabase.from('app_data').select('value').eq('key', key).single();
    if (error) return null;
    return data?.value || null;
  },
  set: async (key: string, value: any) => {
    const userId = await getUserId();
    const { error } = await supabase.from('app_data').upsert({ key, value, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'key,user_id' });
    if (error) throw error;
  },
  remove: async (key: string) => {
    const { error } = await supabase.from('app_data').delete().eq('key', key);
    if (error && error.code !== 'PGRST116') throw error;
  },
};

// Initialize app_data table and migrate localStorage data to DB
export async function initAppData() {
  // Try to create the table (will fail silently if already exists via RLS)
  try {
    await supabase.from('app_data').select('key').limit(1);
  } catch {
    // Table doesn't exist, try to create it
    try {
      await supabase.rpc('create_app_data_table' as any).select();
    } catch {
      // RPC may not exist — table will need manual creation via migration
      console.warn('app_data table not found. Run supabase migration: 20260525_app_data.sql');
      return;
    }
  }
}
