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

  for (const [table, rows] of Object.entries(backup.data)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;

    // Strip id and timestamps to let Supabase generate new ones
    const cleanRows = rows.map((row) => {
      const { id, created_at, updated_at, ...rest } = row as Record<string, unknown>;
      return rest;
    });

    const { error } = await supabase.from(table).insert(cleanRows);
    if (error) {
      errors.push(`${table}: ${error.message}`);
    } else {
      success += cleanRows.length;
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
