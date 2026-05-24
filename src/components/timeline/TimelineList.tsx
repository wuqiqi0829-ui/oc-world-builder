import { useEffect, useState } from 'react';
import { useTimeline } from '@/stores/timeline';
import { Plus, Trash2, Clock, Columns2, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import clsx from 'clsx';

function TimelineItem({ tl, activeId, onSelect, onDelete, onRename, onCompare, isParent, hasChildren, childrenExpanded, onToggleChildren, selected }: {
  tl: { id: string; name: string };
  activeId: string | null;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onCompare: () => void;
  isParent?: boolean;
  hasChildren?: boolean;
  childrenExpanded?: boolean;
  onToggleChildren?: () => void;
  selected?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(tl.name);

  const handleSubmit = () => {
    if (editName.trim()) onRename(editName.trim());
    else setEditName(tl.name);
    setEditing(false);
  };

  return (
    <div className={clsx('group flex items-center', isParent && 'mt-1')}>
      {editing ? (
        <input
          type="text"
          className="flex-1 text-xs px-1 py-0.5 rounded border border-primary-300 bg-white dark:bg-gray-800 outline-none"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setEditName(tl.name); setEditing(false); } }}
          autoFocus
        />
      ) : (
        <button
          className={clsx(
            'flex-1 text-xs px-2 py-1 rounded-md truncate transition-colors flex items-center gap-0.5 relative',
            isParent ? 'justify-center font-medium border-l-2' : 'text-left',
            activeId === tl.id
              ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
              : isParent
                ? 'bg-primary-100/50 dark:bg-primary-900/20 hover:bg-primary-100/70 dark:hover:bg-primary-900/30 text-[rgb(var(--color-text))] border-l-primary-300 dark:border-l-primary-600'
                : 'hover:bg-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))]'
          )}
          onClick={onSelect}
          onDoubleClick={() => { setEditName(tl.name); setEditing(true); }}
          title="双击重命名"
        >
          {hasChildren ? (
            <span
              className={clsx(
                'text-[rgb(var(--color-text-secondary))] flex-shrink-0',
                isParent && 'absolute left-1.5'
              )}
              onClick={(e) => { e.stopPropagation(); onToggleChildren?.(); }}
            >
              {childrenExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </span>
          ) : (
            <Clock size={10} className="flex-shrink-0 opacity-50" />
          )}
          <span className="truncate">{tl.name}</span>
        </button>
      )}
      <button
        className={clsx(
          'p-0.5 rounded transition-colors',
          selected
            ? 'opacity-100 bg-primary-100 dark:bg-primary-900/30 text-primary-500'
            : 'text-primary-400 opacity-0 group-hover:opacity-100 hover:bg-primary-50 dark:hover:bg-primary-900/20'
        )}
        onClick={onCompare}
        title={selected ? '取消对比' : '加入对比'}
      >
        <Columns2 size={10} />
      </button>
      <button
        className="p-0.5 rounded text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={onDelete}
        title="删除"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}

interface Props {
  worldId: string;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onStartCompare: () => void;
  inCompare?: boolean;
}

export default function TimelineList({ worldId, compareIds, onToggleCompare, onStartCompare, inCompare }: Props) {
  const { timelines, activeTimelineId, setActiveTimeline, fetchTimelines, createTimeline, removeTimeline, renameTimeline } = useTimeline();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

  useEffect(() => { fetchTimelines(worldId); }, [worldId, fetchTimelines]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createTimeline({ world_id: worldId, name: newName.trim() });
    setNewName('');
    setShowNew(false);
  };

  const toggleParent = (id: string) => {
    setCollapsedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rootTimelines = timelines.filter(t => !t.parent_id);
  const compareCount = compareIds.length;

  if (collapsed) {
    return (
      <div className="flex-shrink-0 border-r border-[rgb(var(--color-border))] pr-1">
        <button
          className="p-1 rounded text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-border))]"
          onClick={() => setCollapsed(false)}
          title="展开时间轴列表"
        >
          <PanelLeft size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-44 flex-shrink-0 border-r border-[rgb(var(--color-border))] pr-3 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">时间轴</h3>
        <div className="flex items-center gap-0.5">
          <button className="btn-ghost text-xs !px-1.5 !py-0.5" onClick={() => setShowNew(true)}>
            <Plus size={12} />
          </button>
          <button
            className="p-0.5 rounded text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]"
            onClick={() => setCollapsed(true)}
            title="折叠时间轴列表"
          >
            <PanelLeftClose size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {rootTimelines.map((root) => {
          const children = timelines.filter(t => t.parent_id === root.id);
          const isCollapsed = collapsedParents.has(root.id);
          return (
            <div key={root.id}>
              <TimelineItem
                tl={root}
                activeId={activeTimelineId}
                onSelect={() => setActiveTimeline(root.id)}
                onDelete={() => { if (confirm('确定删除此时间轴及其所有事件？')) removeTimeline(root.id); }}
                onRename={(name) => renameTimeline(root.id, name)}
                onCompare={() => onToggleCompare(root.id)}
                isParent
                hasChildren={children.length > 0}
                childrenExpanded={!isCollapsed}
                onToggleChildren={() => toggleParent(root.id)}
                selected={compareIds.includes(root.id)}
              />
              {!isCollapsed && children.length > 0 && (
                <div className="ml-3 pl-3 border-l border-primary-200 dark:border-primary-800/50 space-y-0.5">
                  {children.map(child => (
                    <TimelineItem
                      key={child.id}
                      tl={child}
                      activeId={activeTimelineId}
                      onSelect={() => setActiveTimeline(child.id)}
                      onDelete={() => { if (confirm('确定删除此时间轴及其所有事件？')) removeTimeline(child.id); }}
                      onRename={(name) => renameTimeline(child.id, name)}
                      onCompare={() => onToggleCompare(child.id)}
                      selected={compareIds.includes(child.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!inCompare && compareCount > 0 && (
        <button
          className="mt-2 w-full text-xs py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
          onClick={onStartCompare}
        >
          对比 ({compareCount})
        </button>
      )}

      {showNew && (
        <div className="mt-2 space-y-1">
          <input
            type="text"
            className="input w-full text-xs h-7"
            placeholder="时间轴名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setShowNew(false); setNewName(''); }
            }}
          />
          <div className="flex gap-1">
            <button className="btn-primary text-[10px] !px-2 !py-0.5" onClick={handleCreate}>创建</button>
            <button className="btn-ghost text-[10px] !px-2 !py-0.5" onClick={() => { setShowNew(false); setNewName(''); }}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
