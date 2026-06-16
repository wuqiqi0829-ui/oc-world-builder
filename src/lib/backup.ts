import { supabase } from './supabase';

// ============================================
// 全量导出
// ============================================
export async function exportAllData(): Promise<string> {
  const tables = [
    'worlds', 'characters', 'timeline_events', 'locations',
    'organizations', 'items', 'relationships', 'tags',
    'tag_assignments', 'storylines', 'notes',
    'custom_categories', 'custom_entries',
  ];

  const exportData: Record<string, unknown[]> = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (!error && data) {
      exportData[table] = data;
    }
  }

  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    data: exportData,
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// 全量导入
// ============================================

// Tables in dependency order: parent tables first
const TABLE_ORDER = [
  'worlds',
  'characters',
  'timelines',
  'timeline_events',
  'locations',
  'organizations',
  'items',
  'relationships',
  'tags',
  'tag_assignments',
  'storylines',
  'notes',
  'custom_categories',
  'custom_entries',
  'books',
  'book_storylines',
  'illustrations',
  'tables',
];

// Columns that are foreign keys referencing other tables (old_id → new_id)
const FK_COLUMNS: Record<string, string[]> = {
  characters: ['world_id'],
  timeline_events: ['world_id', 'timeline_id'],
  timelines: ['world_id', 'parent_id'],
  locations: ['world_id'],
  organizations: ['world_id'],
  items: ['world_id'],
  relationships: ['world_id', 'source_id', 'target_id'],
  storylines: ['world_id'],
  notes: ['world_id', 'linked_id'],
  custom_categories: ['world_id'],
  custom_entries: ['category_id'],
  illustrations: ['world_id'],
  tables: ['world_id'],
  tag_assignments: ['tag_id', 'target_id'],
  book_storylines: ['book_id', 'storyline_id'],
  books: [],
};

export async function importAllData(json: string): Promise<{ success: number; errors: string[] }> {
  let backup: { version: number; data: Record<string, unknown[]> };
  try {
    backup = JSON.parse(json);
    if (!backup.version || !backup.data) throw new Error('无效的备份文件格式');
  } catch {
    return { success: 0, errors: ['文件格式不正确，无法解析'] };
  }

  const errors: string[] = [];
  let success = 0;

  // Get current user ID
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id;
  if (!currentUserId) return { success: 0, errors: ['未登录，无法导入'] };

  // Map old IDs → new IDs for FK remapping
  const idMap: Record<string, Record<string, string>> = {};

  for (const table of TABLE_ORDER) {
    const rows = backup.data[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const fkCols = FK_COLUMNS[table] || [];

    const cleanRows = rows.map((row: any) => {
      const { id, created_at, updated_at, ...rest } = row;
      // Replace user_id with current user
      rest.user_id = currentUserId;
      // Remap foreign keys using idMap
      for (const col of fkCols) {
        if (rest[col] && idMap[col]) {
          rest[col] = idMap[col][rest[col]] || rest[col];
        }
        // Handle special case: parent_id for timelines
        if (col === 'parent_id' && rest.parent_id && idMap['timelines']) {
          rest.parent_id = idMap['timelines'][rest.parent_id] || null;
        }
      }
      return { id, ...rest }; // keep old id temporarily for mapping
    });

    // Insert and track new IDs
    const rowsToInsert = cleanRows.map((r: any) => {
      const { id: oldId, ...insertRow } = r;
      return { oldId, insertRow };
    });

    for (const { oldId, insertRow } of rowsToInsert) {
      const { data: inserted, error } = await supabase.from(table).insert(insertRow).select('id').single();
      if (error) {
        errors.push(`${table}: ${error.message}`);
      } else if (inserted) {
        success++;
        if (!idMap[table]) idMap[table] = {};
        idMap[table][oldId] = inserted.id;
      }
    }
  }

  return { success, errors };
}

// ============================================
// 单世界观导出为文本/Markdown
// ============================================
export async function exportWorldAsMarkdown(worldName: string): Promise<string> {
  const { data: worlds } = await supabase.from('worlds').select('id').eq('name', worldName).single();
  if (!worlds) return '# 未找到世界观';

  const worldId = worlds.id;
  let md = `# ${worldName}\n\n`;

  const sections = [
    { table: 'characters', label: '## 人物设定', fields: ['name', 'nickname', 'gender', 'age', 'personality', 'background'] },
    { table: 'timeline_events', label: '## 时间线', fields: ['title', 'time_label', 'description'] },
    { table: 'locations', label: '## 地点', fields: ['name', 'description', 'region'] },
    { table: 'organizations', label: '## 组织', fields: ['name', 'type', 'description'] },
    { table: 'items', label: '## 物品', fields: ['name', 'category', 'description'] },
  ];

  for (const { table, label, fields } of sections) {
    const { data } = await supabase.from(table).select(fields.join(',')).eq('world_id', worldId);
    if (!data || data.length === 0) continue;
    md += `\n${label}\n\n`;
    for (const row of (data as unknown as Record<string, string>[])) {
      md += `### ${row[fields[0]] || '(未命名)'}\n`;
      for (const f of fields.slice(1)) {
        if (row[f]) {
          const clean = row[f].replace(/<[^>]*>/g, '');
          md += `- ${f}: ${clean.slice(0, 200)}\n`;
        }
      }
      md += '\n';
    }
  }

  return md;
}
