import { useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useWorlds } from '@/stores/worlds';
import { useCharacters } from '@/stores/characters';
import { useTimeline } from '@/stores/timeline';
import { useLocations } from '@/stores/locations';
import { useCategories } from '@/stores/categories';
import { useOrganizations } from '@/stores/organizations';
import { useRelationships } from '@/stores/relationships';
import { useStorylines } from '@/stores/storylines';
import { useItems } from '@/stores/items';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import NewWorldModal from '@/components/worlds/NewWorldModal';
import WorldSelector from '@/components/worlds/WorldSelector';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CharacterList from '@/components/characters/CharacterList';
import CharacterEditPanel from '@/components/characters/CharacterEditPanel';
import TimelineView from '@/components/timeline/TimelineView';
import TimelineEditPanel from '@/components/timeline/TimelineEditPanel';
import MapView from '@/components/map/MapView';
import LocationEditPanel from '@/components/map/LocationEditPanel';
import CategoryView from '@/components/categories/CategoryView';
import CategoryEditPanel from '@/components/categories/CategoryEditPanel';
import EntryEditPanel from '@/components/categories/EntryEditPanel';
import OrganizationView from '@/components/organizations/OrganizationView';
import OrganizationEditPanel from '@/components/organizations/OrganizationEditPanel';
import RelationshipGraph from '@/components/relationships/RelationshipGraph';
import RelationshipEditPanel from '@/components/relationships/RelationshipEditPanel';
import StorylineList from '@/components/storylines/StorylineList';
import NotesView from '@/components/notes/NotesView';
import ItemsView from '@/components/items/ItemsView';
import type { SearchResult } from '@/lib/db';
import { exportAllData, downloadJson, importAllData } from '@/lib/backup';
import { Globe, Plus, Users, Clock, Map, Loader2 } from 'lucide-react';
import PreviewModal from '@/components/ui/PreviewModal';
import CharacterPreview from '@/components/characters/CharacterPreview';
import TimelineEventPreview from '@/components/timeline/TimelineEventPreview';
import LocationPreview from '@/components/map/LocationPreview';
import OrganizationPreview from '@/components/organizations/OrganizationPreview';
import ItemPreview from '@/components/items/ItemPreview';
import EntryPreview from '@/components/categories/EntryPreview';
import StorylinePreview from '@/components/storylines/StorylinePreview';
import WorldPreview from '@/components/worlds/WorldPreview';

const modulePlaceholders: Record<string, { icon: typeof Globe; title: string; description: string }> = {
  characters: { icon: Users, title: '人物设定库', description: '在这里创建和管理你的OC人设卡' },
  timeline: { icon: Clock, title: '时间线', description: '可视化展示世界观的时间轴' },
  map: { icon: Map, title: '地图', description: '上传世界观地图，添加可拖拽的地点标记' },
  categories: { icon: Globe, title: '职业/种族设定', description: '自定义分类模板，管理职业、种族等设定' },
  organizations: { icon: Globe, title: '组织势力', description: '记录国家、帮派、公会等集团信息' },
  items: { icon: Globe, title: '物品图鉴', description: '记录特殊物品、武器、道具的信息' },
  relationships: { icon: Globe, title: '关系图谱', description: '可视化人物、组织之间的关联网络' },
  storylines: { icon: Globe, title: '主线剧情', description: '记录世界观的主线故事和章节' },
  notes: { icon: Globe, title: '灵感速记', description: '随手记录碎片想法，后续关联到具体模块' },
};

function AuthenticatedApp() {
  const { user, signOut } = useAuth();
  const {
    worlds, activeWorldId, loading: worldsLoading, setActiveWorld,
    fetchWorlds, createWorld, deleteWorld, updateWorld, startRealtime,
  } = useWorlds();
  const {
    characters, fetch: fetchChars,
    startRealtime: charRealtime,
  } = useCharacters();
  const {
    events, fetch: fetchTimeline,
    startRealtime: timelineRealtime,
  } = useTimeline();
  const {
    locations, fetch: fetchLocations,
    startRealtime: locationsRealtime,
  } = useLocations();
  const {
    categories, entries, activeCategoryId, fetchCategories,
  } = useCategories();
  const {
    fetch: fetchOrgs, startRealtime: orgsRealtime,
    organizations,
  } = useOrganizations();
  const {
    fetch: fetchRels, remove: removeRel,
  } = useRelationships();
  const {
    storylines, fetch: fetchStorylines,
  } = useStorylines();
  const {
    fetch: fetchItems,
  } = useItems();
  const [activeModule, setActiveModule] = useState('characters');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'category'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [relSourceType, setRelSourceType] = useState('');
  const [relSourceId, setRelSourceId] = useState('');
  const [itemEditId, setItemEditId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState<ReactNode>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewEditAction, setPreviewEditAction] = useState<() => void>(() => {});
  const [newWorldOpen, setNewWorldOpen] = useState(false);
  const [deleteWorldId, setDeleteWorldId] = useState<string | null>(null);
  const [showWorldSelector, setShowWorldSelector] = useState(false);

  useEffect(() => {
    fetchWorlds();
    const channel = startRealtime();
    return () => { channel.unsubscribe(); };
  }, [fetchWorlds, startRealtime]);

  useEffect(() => {
    if (activeWorldId) {
      fetchChars(activeWorldId);
      fetchTimeline(activeWorldId);
      fetchLocations(activeWorldId);
      fetchCategories(activeWorldId);
      fetchOrgs(activeWorldId);
      fetchRels(activeWorldId);
      fetchStorylines(activeWorldId);
      fetchItems(activeWorldId);
      const chChannel = charRealtime(activeWorldId);
      const tlChannel = timelineRealtime(activeWorldId);
      const locChannel = locationsRealtime(activeWorldId);
      const orgChannel = orgsRealtime(activeWorldId);
      return () => { chChannel.unsubscribe(); tlChannel.unsubscribe(); locChannel.unsubscribe(); orgChannel.unsubscribe(); };
    }
  }, [activeWorldId, fetchChars, fetchTimeline, charRealtime, timelineRealtime]);

  const handleCreateWorld = async (data: { name: string; description: string; cover_url: string }) => {
    await createWorld(data);
  };

  const handleDeleteWorld = (id: string) => {
    setDeleteWorldId(id);
  };

  const confirmDeleteWorld = async () => {
    if (deleteWorldId) {
      await deleteWorld(deleteWorldId);
      setDeleteWorldId(null);
    }
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setEditId(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (id: string) => {
    setDrawerMode('edit');
    setEditId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditId(null);
    setCategoryEditId(null);
  };

  const openPreview = (title: string, content: ReactNode, text: string, onEdit: () => void) => {
    setPreviewTitle(title);
    setPreviewContent(content);
    setPreviewText(text);
    setPreviewEditAction(() => onEdit);
    setPreviewOpen(true);
  };

  const drawerTitle = () => {
    if (activeModule === 'characters') return drawerMode === 'create' ? '新建角色' : '编辑角色';
    if (activeModule === 'timeline') return drawerMode === 'create' ? '新建事件' : '编辑事件';
    if (activeModule === 'map') return drawerMode === 'create' ? '新建地点' : '编辑地点';
    if (activeModule === 'categories' && drawerMode === 'category') return '编辑分类';
    if (activeModule === 'categories') return drawerMode === 'create' ? '新建条目' : '编辑条目';
    if (activeModule === 'organizations') return drawerMode === 'create' ? '新建组织' : '编辑组织';
    if (activeModule === 'relationships') return '添加关系';
    return '新建';
  };

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      downloadJson(json, `oc-backup-${new Date().toISOString().slice(0, 10)}.json`);
    } catch { alert('导出失败'); }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const { success, errors } = await importAllData(text);
        if (errors.length > 0) alert(`导入完成：${success} 条成功\n错误：${errors.join('\n')}`);
        else alert(`成功导入 ${success} 条数据`);
        window.location.reload();
      } catch { alert('导入失败，请检查文件格式'); }
    };
    input.click();
  };

  const handleSearchResult = (result: SearchResult) => {
    const moduleMap: Record<string, string> = {
      character: 'characters', timeline: 'timeline', location: 'map',
      organization: 'organizations', item: 'items', storyline: 'storylines',
      note: 'notes',
    };
    const mod = moduleMap[result.type] || result.type;
    if (result.world_id) setActiveWorld(result.world_id);
    setActiveModule(mod);
    // Open the edit drawer for the matching item
    setTimeout(() => {
      setEditId(result.id);
      setDrawerMode('edit');
      setDrawerOpen(true);
    }, 100);
  };

  const placeholder = modulePlaceholders[activeModule];

  if (worldsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <>
      <Layout
        worlds={worlds}
        activeWorldId={activeWorldId}
        onSelectWorld={setActiveWorld}
        onDeleteWorld={handleDeleteWorld}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        drawerOpen={drawerOpen}
        drawerTitle={drawerTitle()}
        onCloseDrawer={closeDrawer}
        onNewWorld={() => setNewWorldOpen(true)}
        onNew={() => {
          if (activeModule === 'categories' && !activeCategoryId) {
            setCategoryEditId(null); setDrawerMode('category'); setDrawerOpen(true);
          } else { openCreateDrawer(); }
        }}
        onSelectSearchResult={handleSearchResult}
        onExport={handleExport}
        onImport={handleImport}
        onShowAllWorlds={() => setShowWorldSelector(true)}
        drawerContent={
          activeModule === 'characters' && activeWorldId ? (
            <CharacterEditPanel worldId={activeWorldId} characterId={drawerMode === 'edit' ? editId : null} onClose={closeDrawer} />
          ) : activeModule === 'timeline' && activeWorldId ? (
            <TimelineEditPanel worldId={activeWorldId} eventId={drawerMode === 'edit' ? editId : null} onClose={closeDrawer} />
          ) : activeModule === 'map' && activeWorldId ? (
            <LocationEditPanel worldId={activeWorldId} locationId={drawerMode === 'edit' ? editId : null} onClose={closeDrawer} />
          ) : activeModule === 'categories' && activeWorldId ? (
            categoryEditId ? (
              <CategoryEditPanel worldId={activeWorldId} categoryId={categoryEditId} onClose={() => { setCategoryEditId(null); closeDrawer(); }} />
            ) : activeCategoryId ? (
              <EntryEditPanel worldId={activeWorldId} categoryId={activeCategoryId} entryId={drawerMode === 'edit' ? editId : null}
                category={categories.find((c) => c.id === activeCategoryId)} onClose={closeDrawer} />
            ) : (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">请先选择或创建一个分类</p>
            )
          ) : activeModule === 'organizations' && activeWorldId ? (
            <OrganizationEditPanel worldId={activeWorldId} orgId={drawerMode === 'edit' ? editId : null} onClose={closeDrawer} />
          ) : activeModule === 'relationships' && activeWorldId ? (
            <RelationshipEditPanel
              worldId={activeWorldId}
              characters={characters}
              organizations={organizations}
              locations={locations}
              prefillSourceType={relSourceType}
              prefillSourceId={relSourceId}
              onClose={closeDrawer}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">编辑面板将在后续阶段实现</p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">当前登录：{user?.email}</p>
              <button className="btn-ghost text-sm" onClick={signOut}>退出登录</button>
            </div>
          )
        }
      >
        {worlds.length === 0 || showWorldSelector || !activeWorldId ? (
          <WorldSelector
            worlds={worlds}
            onSelect={(id) => { setActiveWorld(id); setShowWorldSelector(false); }}
            onNew={() => setNewWorldOpen(true)}
            onDelete={handleDeleteWorld}
            onRename={async (id) => {
              const name = prompt('重命名世界观：', worlds.find(w => w.id === id)?.name);
              if (name && name.trim()) await updateWorld(id, { name: name.trim() });
            }}
            onPreview={(id) => {
              const w = worlds.find(x => x.id === id);
              if (w) openPreview(w.name, <WorldPreview world={w} />, w.description || '', () => { setActiveWorld(id); setShowWorldSelector(false); });
            }}
          />
        ) : activeModule === 'characters' && activeWorldId ? (
          <div className="p-6">
            <CharacterList characters={characters} activeId={null}
                onSelect={(id) => { const c = characters.find(x => x.id === id); if (c) openPreview(c.name, <CharacterPreview character={c} />, [c.appearance,c.personality,c.background,c.abilities,c.weaknesses].join(''), () => openEditDrawer(id)); }}
                onCreate={openCreateDrawer} />
          </div>
        ) : activeModule === 'timeline' && activeWorldId ? (
          <div className="p-6">
            <TimelineView events={events} onCreate={openCreateDrawer}
                onEdit={(id) => openEditDrawer(id)}
                onPreview={(id) => { const e = events.find(x => x.id === id); if (e) openPreview(e.title, <TimelineEventPreview event={e} />, e.description, () => openEditDrawer(id)); }} />
          </div>
        ) : activeModule === 'map' && activeWorldId ? (
          <div className="p-4 h-full">
            <MapView locations={locations} onCreate={(_x, _y) => {
              setEditId(null); setDrawerMode('create'); setDrawerOpen(true);
            }} onEdit={(id) => { const l = locations.find(x => x.id === id); if (l) openPreview(l.name, <LocationPreview location={l} />, l.description, () => openEditDrawer(id)); }}
              worldId={activeWorldId} />
          </div>
        ) : activeModule === 'categories' && activeWorldId ? (
          <div className="p-4 h-full">
            <CategoryView
              worldId={activeWorldId}
              onCreateCategory={() => { setCategoryEditId(null); setDrawerMode('category'); setDrawerOpen(true); }}
              onEditCategory={(id) => { setCategoryEditId(id); setDrawerMode('category'); setDrawerOpen(true); }}
              onEditEntry={(_catId, entryId) => {
                setCategoryEditId(null); setEditId(entryId);
                setDrawerMode(entryId ? 'edit' : 'create'); setDrawerOpen(true);
              }}
              onPreviewEntry={(catId, entryId) => {
                const catEntries = entries[catId] || [];
                const ent = catEntries.find(e => e.id === entryId);
                if (ent) openPreview(ent.name, <EntryPreview entry={ent} category={categories.find(c => c.id === catId)} />, ent.description + Object.values(ent.field_values||{}).join(''), () => { setEditId(entryId); setDrawerMode('edit'); setDrawerOpen(true); });
              }}
            />
          </div>
        ) : activeModule === 'organizations' && activeWorldId ? (
          <div className="p-6">
            <OrganizationView worldId={activeWorldId} onCreate={openCreateDrawer}
                onEdit={(id) => { const o = organizations.find(x => x.id === id); if (o) openPreview(o.name, <OrganizationPreview organization={o} />, o.description, () => openEditDrawer(id)); }} />
          </div>
        ) : activeModule === 'relationships' && activeWorldId ? (
          <div className="p-4 h-full">
            <RelationshipGraph
              worldId={activeWorldId} characters={characters} organizations={organizations} locations={locations}
              onCreate={(sourceType, sourceId) => {
                setRelSourceType(sourceType); setRelSourceId(sourceId);
                setDrawerMode('create'); setEditId(null); setDrawerOpen(true);
              }}
              onDeleteRelation={async (id) => { await removeRel(id); }}
            />
          </div>
        ) : activeModule === 'storylines' && activeWorldId ? (
          <div className="p-6">
            <StorylineList worldId={activeWorldId} activeId={null}
              onSelect={(id) => { const s = storylines.find(x => x.id === id); if (s) openPreview(s.title, <StorylinePreview storyline={s} />, s.description + (s.chapters||[]).map(c=>c.content).join(''), () => openEditDrawer(id)); }}
              onCreate={() => {}} />
          </div>
        ) : activeModule === 'notes' ? (
          <div className="p-4 h-full">
            <NotesView worldId={activeWorldId || undefined} />
          </div>
        ) : activeModule === 'items' && activeWorldId ? (
          <div className="p-4">
            <ItemsView worldId={activeWorldId}
              onPreview={(id) => { const { items } = useItems.getState(); const it = items.find(x => x.id === id); if (it) openPreview(it.name, <ItemPreview item={it} />, it.description + Object.values(it.attributes||{}).join(''), () => { setItemEditId(id); }); }}
              onEdit={(id) => { setItemEditId(id); }}
              onCreate={() => { setItemEditId(null); }}
              editId={itemEditId}
              onCloseEdit={() => setItemEditId(null)}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{placeholder?.title}</h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">{placeholder?.description}</p>
              </div>
              <button className="btn-primary flex items-center gap-2" onClick={() => setDrawerOpen(true)}>
                <Plus size={16} />
                新建
              </button>
            </div>

            <EmptyState
              icon={placeholder && <placeholder.icon size={48} />}
              title={`${placeholder?.title}模块`}
              description="此模块将在后续开发阶段实现。"
              action={
                <button className="btn-primary text-sm" onClick={() => setDrawerOpen(true)}>
                  预览编辑面板
                </button>
              }
            />
          </div>
        )}
      </Layout>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        contentText={previewText}
        onEdit={() => { setPreviewOpen(false); previewEditAction(); }}
      >
        {previewContent}
      </PreviewModal>

      <NewWorldModal
        open={newWorldOpen}
        onClose={() => setNewWorldOpen(false)}
        onSave={handleCreateWorld}
      />

      <ConfirmDialog
        open={!!deleteWorldId}
        onClose={() => setDeleteWorldId(null)}
        onConfirm={confirmDeleteWorld}
        title="删除世界观"
        message={`确定要删除"${worlds.find((w) => w.id === deleteWorldId)?.name}"吗？此操作不可恢复。`}
        confirmLabel="删除"
        dangerous
      />
    </>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={user ? <AuthenticatedApp /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
