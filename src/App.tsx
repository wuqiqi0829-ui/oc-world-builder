import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useWorlds } from '@/stores/worlds';
import { useCharacters } from '@/stores/characters';
import { useTimeline } from '@/stores/timeline';
import { useLocations } from '@/stores/locations';
import { useCategories } from '@/stores/categories';

import { useRelationships } from '@/stores/relationships';
import { useStorylines } from '@/stores/storylines';
import { useBooks } from '@/stores/books';
import { useItems } from '@/stores/items';
import { useIllustrations } from '@/stores/illustrations';
import { useTables } from '@/stores/tables';
import { useSettings } from '@/stores/settings';
import SettingsView from '@/components/settings/SettingsView';
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
import TimelineList from '@/components/timeline/TimelineList';
import MapView from '@/components/map/MapView';
import LocationEditPanel from '@/components/map/LocationEditPanel';
import CategoryEditPanel from '@/components/categories/CategoryEditPanel';
import EntryEditPanel from '@/components/categories/EntryEditPanel';
import RaceClassView from '@/components/categories/RaceClassView';
import RaceClassEditPanel from '@/components/categories/RaceClassEditPanel';
import RaceClassPreview from '@/components/categories/RaceClassPreview';
import OrgPowerView from '@/components/organizations/OrgPowerView';
import OrgPowerEditPanel from '@/components/organizations/OrgPowerEditPanel';
import OrgPowerPreview from '@/components/organizations/OrgPowerPreview';
import RelationshipGraph from '@/components/relationships/RelationshipGraph';
import RelationshipEditPanel from '@/components/relationships/RelationshipEditPanel';
import RelationshipPreview from '@/components/relationships/RelationshipPreview';
import StorylineList from '@/components/storylines/StorylineList';
import StorylineEditPanel from '@/components/storylines/StorylineEditPanel';
import ChapterEditPanel from '@/components/storylines/ChapterEditPanel';
import ChapterPreview from '@/components/storylines/ChapterPreview';
import NotesView from '@/components/notes/NotesView';
import ItemsView from '@/components/items/ItemsView';
import IllustrationGallery from '@/components/illustrations/IllustrationGallery';
import IllustrationEditPanel from '@/components/illustrations/IllustrationEditPanel';
import TablesView from '@/components/tables/TablesView';
import TableEditPanel from '@/components/tables/TableEditPanel';

import type { SearchResult } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { exportAllData, downloadJson, importAllData } from '@/lib/backup';
import { Globe, Plus, Users, Clock, Map, Image, Loader2 } from 'lucide-react';
import PreviewModal from '@/components/ui/PreviewModal';
import EditModal from '@/components/ui/EditModal';
import CharacterPreview from '@/components/characters/CharacterPreview';
import TimelineEventPreview from '@/components/timeline/TimelineEventPreview';

import ItemPreview from '@/components/items/ItemPreview';
import ItemEditPanel from '@/components/items/ItemEditPanel';
import WorldPreview from '@/components/worlds/WorldPreview';
import LocationPreview from '@/components/map/LocationPreview';
import UserProfileModal from '@/components/user/UserProfileModal';
import SharePage from '@/pages/SharePage';

const modulePlaceholders: Record<string, { icon: typeof Globe; title: string; description: string }> = {
  characters: { icon: Users, title: '人物设定库', description: '在这里创建和管理你的OC人设卡' },
  timeline: { icon: Clock, title: '时间线', description: '可视化展示世界观的时间轴' },
  map: { icon: Map, title: '地图', description: '上传世界观地图，添加可拖拽的地点标记' },
  categories: { icon: Globe, title: '职业种族', description: '自定义分类模板，管理职业、种族等设定' },
  organizations: { icon: Globe, title: '组织势力', description: '记录国家、帮派、公会等集团信息' },
  items: { icon: Globe, title: '物品图鉴', description: '记录特殊物品、武器、道具的信息' },
  illustrations: { icon: Image, title: '插图集', description: '管理世界观相关的插图素材，支持无损上传与拖拽排序' },
  relationships: { icon: Globe, title: '关系图谱', description: '可视化人物、组织之间的关联网络' },
  storylines: { icon: Globe, title: '主线剧情', description: '记录世界观的主线故事和章节' },
  notes: { icon: Globe, title: '灵感速记', description: '随手记录碎片想法，后续关联到具体模块' },
};

function AuthenticatedApp() {
  const { user, signOut } = useAuth();
  const {
    worlds, activeWorldId, loading: worldsLoading, setActiveWorld,
    fetchWorlds, createWorld, deleteWorld, updateWorld, reorderWorlds, startRealtime,
  } = useWorlds();
  const {
    characters, fetch: fetchChars,
    startRealtime: charRealtime,
  } = useCharacters();
  const {
    events, fetch: fetchTimeline,
    timelines: allTimelines, activeTimelineId, fetchTimelines,
    compareTimelineIds, compareEventsMap, toggleCompareTimeline, clearCompare, fetchCompare,
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
    fetch: fetchRels, remove: removeRel,
  } = useRelationships();
  const {
    fetch: fetchStorylines, startRealtime: storylinesRealtime,
  } = useStorylines();
  const {
    fetch: fetchItems,
  } = useItems();
  const {
    fetch: fetchIllustrations,
  } = useIllustrations();
  const {
    fetch: fetchTables,
  } = useTables();
  const [activeModule, setActiveModule] = useState('characters');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'category'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState<ReactNode>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewEditAction, setPreviewEditAction] = useState<() => void>(() => {});
  const [previewEnterAction, setPreviewEnterAction] = useState<(() => void) | null>(null);
  const [drawerKey, setDrawerKey] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalContent, setEditModalContent] = useState<ReactNode>(null);
  const [newWorldOpen, setNewWorldOpen] = useState(false);
  const [editWorldData, setEditWorldData] = useState<{ id: string; name: string; description: string; cover_url: string } | null>(null);
  const [deleteWorldId, setDeleteWorldId] = useState<string | null>(null);
  const [showWorldSelector, setShowWorldSelector] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const meta = data.user.user_metadata || {};
      setUserName((meta.display_name as string) || '');
      setUserAvatar((meta.avatar_url as string) || '');
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const { init: initSettings } = useSettings();
  useEffect(() => { initSettings(); }, [initSettings]);

  useEffect(() => {
    fetchWorlds();
    fetchTables();
    const channel = startRealtime();
    return () => { channel.unsubscribe(); };
  }, [fetchWorlds, fetchTables, startRealtime]);

  useEffect(() => {
    if (activeWorldId) {
      fetchChars(activeWorldId);
      fetchTimelines(activeWorldId);
      fetchLocations(activeWorldId);
      fetchCategories(activeWorldId);
      fetchRels(activeWorldId);
      fetchStorylines(activeWorldId);
      fetchItems(activeWorldId);
      fetchIllustrations(activeWorldId);
      const chChannel = charRealtime(activeWorldId);
      const tlChannel = timelineRealtime(activeWorldId);
      const locChannel = locationsRealtime(activeWorldId);
      const slChannel = storylinesRealtime(activeWorldId);
      return () => { chChannel.unsubscribe(); tlChannel.unsubscribe(); locChannel.unsubscribe(); slChannel.unsubscribe(); };
    }
  }, [activeWorldId, fetchChars, fetchTimelines, charRealtime, timelineRealtime]);

  useEffect(() => {
    if (activeWorldId && activeTimelineId) fetchTimeline(activeWorldId);
  }, [activeWorldId, activeTimelineId, fetchTimeline]);

  useEffect(() => {
    if (activeWorldId && compareTimelineIds.length > 0) fetchCompare(activeWorldId);
  }, [activeWorldId, compareTimelineIds, fetchCompare]);

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

  const openEditModal = (title: string, content: ReactNode) => {
    setEditModalTitle(title);
    setEditModalContent(content);
    setEditModalOpen(true);
    setDrawerKey((k) => k + 1);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditId(null);
    setCategoryEditId(null);
  };

  const openPreview = (title: string, content: ReactNode, text: string, onEdit: () => void, onEnter?: () => void) => {
    setPreviewTitle(title);
    setPreviewContent(content);
    setPreviewText(text);
    setPreviewEditAction(() => onEdit);
    setPreviewEnterAction(onEnter ? () => onEnter : null);
    setPreviewOpen(true);
  };

  const drawerTitle = () => {
    if (activeModule === 'characters') return drawerMode === 'create' ? '新建角色' : '编辑角色';
    if (activeModule === 'map') return drawerMode === 'create' ? '新建地点' : '编辑地点';
    if (activeModule === 'categories' && drawerMode === 'category') return '编辑分类';
    if (activeModule === 'categories') return drawerMode === 'create' ? '新建条目' : '编辑条目';
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
      illustration: 'illustrations', note: 'notes',
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
        onSelectWorld={(id) => {
          const w = worlds.find(x => x.id === id);
          if (w) openPreview(w.name, <WorldPreview world={w} />, w.description || '', () => {
            setEditWorldData({ id: w.id, name: w.name, description: w.description, cover_url: w.cover_url || '' });
          }, () => { setActiveWorld(w.id); setShowWorldSelector(false); });
        }}
        onDeleteWorld={handleDeleteWorld}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        drawerOpen={drawerOpen}
        drawerTitle={drawerTitle()}
        onCloseDrawer={closeDrawer}
        onNewWorld={() => setNewWorldOpen(true)}
        onSelectSearchResult={handleSearchResult}
        onExport={handleExport}
        onImport={handleImport}
        onShowAllWorlds={() => setShowWorldSelector(true)}
        userEmail={user?.email}
        userName={userName}
        userAvatar={userAvatar}
        onLogout={signOut}
        onProfile={() => setProfileOpen(true)}
        drawerContent={
          activeModule === 'characters' && activeWorldId ? null : activeModule === 'map' && activeWorldId ? (
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
            onReorder={reorderWorlds}
            onPreview={(id) => {
              const w = worlds.find(x => x.id === id);
              if (w) openPreview(w.name, <WorldPreview world={w} />, w.description || '', () => {
                setEditWorldData({ id: w.id, name: w.name, description: w.description, cover_url: w.cover_url || '' });
              });
            }}
          />
        ) : activeModule === 'characters' && activeWorldId ? (
          <div className="p-6">
            <CharacterList characters={characters} activeId={null}
                onSelect={(id) => { const c = characters.find(x => x.id === id); if (c) openPreview(c.name, <CharacterPreview character={c} />, [c.appearance,c.personality,c.background,c.abilities].join(''), () => openEditModal(c.name, <CharacterEditPanel key={`char-${drawerKey}`} worldId={activeWorldId!} characterId={id} onClose={() => setEditModalOpen(false)} />)); }}
                onCreate={() => openEditModal('新建角色', <CharacterEditPanel key={`char-new-${drawerKey}`} worldId={activeWorldId!} characterId={null} onClose={() => setEditModalOpen(false)} />)} />
          </div>
        ) : activeModule === 'timeline' && activeWorldId ? (
          compareTimelineIds.length > 0 ? (
            /* Compare mode */
            <div className="flex h-full">
              <div className="p-4">
                <TimelineList worldId={activeWorldId!}
                  compareIds={compareTimelineIds}
                  onToggleCompare={toggleCompareTimeline}
                  onStartCompare={async () => { await fetchCompare(activeWorldId!); }}
                  inCompare />
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-3 px-6 py-2 border-b border-[rgb(var(--color-border))] bg-primary-50/30 dark:bg-primary-900/10">
                  <button className="text-xs px-3 py-1 rounded-lg bg-white/80 dark:bg-white/10 border border-primary-200 dark:border-primary-700/30 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" onClick={clearCompare}>退出对比</button>
                  <span className="text-xs text-primary-500 dark:text-primary-400 font-medium">对比模式 ({compareTimelineIds.length} 条时间轴)</span>
                </div>
                <div className="flex flex-1 overflow-x-auto">
                  {compareTimelineIds.map((tlId, i) => (
                    <div key={tlId} className={`flex-1 p-4 min-w-0${i < compareTimelineIds.length - 1 ? ' border-r border-[rgb(var(--color-border))]' : ''}`}>
                      <TimelineView events={tlId === activeTimelineId ? events : (compareEventsMap[tlId] || [])}
                        title={allTimelines.find(t => t.id === tlId)?.name}
                        onEdit={(id) => openEditModal('编辑事件', <TimelineEditPanel key={`tl-cmp-${tlId}-${drawerKey}`} worldId={activeWorldId!} eventId={id} onClose={() => setEditModalOpen(false)} />)}
                        onPreview={(id) => {
                          const evs = tlId === activeTimelineId ? events : (compareEventsMap[tlId] || []);
                          const e = evs.find(x => x.id === id);
                          if (e) openPreview(e.title, <TimelineEventPreview event={e} />, e.description, () => openEditModal('编辑事件', <TimelineEditPanel key={`tl-cmp-${tlId}-${drawerKey}`} worldId={activeWorldId!} eventId={id} onClose={() => setEditModalOpen(false)} />));
                        }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full">
              <div className="p-4">
                <TimelineList worldId={activeWorldId!}
                  compareIds={compareTimelineIds}
                  onToggleCompare={toggleCompareTimeline}
                  onStartCompare={async () => {
                    if (activeTimelineId && !compareTimelineIds.includes(activeTimelineId)) {
                      toggleCompareTimeline(activeTimelineId);
                    }
                    await fetchCompare(activeWorldId!);
                  }} />
              </div>
              <div className="flex-1 p-6 min-w-0">
                <TimelineView events={events}
                    title={allTimelines.find(t => t.id === activeTimelineId)?.name}
                      onCreate={() => openEditModal('新建事件', <TimelineEditPanel key={`tl-new-${drawerKey}`} worldId={activeWorldId!} eventId={null} timelineId={activeTimelineId!} onClose={() => setEditModalOpen(false)} />)}
                      onCreateSubTimeline={(() => {
                        const activeTl = allTimelines.find(t => t.id === activeTimelineId);
                        if (activeTl && !activeTl.parent_id) {
                          return (timeLabel: string) => {
                            openEditModal(`新建事件 - ${timeLabel}`, <TimelineEditPanel key={`tl-sub-${drawerKey}`} worldId={activeWorldId!} eventId={null} parentTimelineId={activeTimelineId!} initialTimeLabel={timeLabel} onClose={() => setEditModalOpen(false)} />);
                          };
                        }
                        return undefined;
                      })()}
                      onEdit={(id) => openEditModal('编辑事件', <TimelineEditPanel key={`tl-${drawerKey}`} worldId={activeWorldId!} eventId={id} onClose={() => setEditModalOpen(false)} />)}
                      onPreview={(id) => { const e = events.find(x => x.id === id); if (e) openPreview(e.title, <TimelineEventPreview event={e} />, e.description, () => openEditModal('编辑事件', <TimelineEditPanel key={`tl-${drawerKey}`} worldId={activeWorldId!} eventId={id} onClose={() => setEditModalOpen(false)} />)); }} />
                </div>
              </div>
          )
        ) : activeModule === 'map' && activeWorldId ? (
          <div className="p-4 h-full">
            <MapView locations={locations} onCreate={() => {
              openEditModal('新建地点', <LocationEditPanel worldId={activeWorldId!} locationId={null} onClose={() => setEditModalOpen(false)} />);
            }} onEdit={(id) => {
              openEditModal('编辑地点', <LocationEditPanel worldId={activeWorldId!} locationId={id} onClose={() => setEditModalOpen(false)} />);
            }} onPreview={(id) => {
              const l = locations.find(x => x.id === id);
              if (l) openPreview(l.name, <LocationPreview location={l} />, l.description, () => {
                openEditModal('编辑地点', <LocationEditPanel worldId={activeWorldId!} locationId={id} onClose={() => setEditModalOpen(false)} />);
              });
            }}
              worldId={activeWorldId} />
          </div>
        ) : activeModule === 'categories' && activeWorldId ? (
          <RaceClassView
            worldId={activeWorldId}
            onCreateEntry={(categoryId) => {
              const cat = categories.find(c => c.id === categoryId);
              openEditModal(`新建${cat?.name || '条目'}`,
                <RaceClassEditPanel key={`rc-new-${drawerKey}`} entryId={null} categoryId={categoryId} onClose={() => setEditModalOpen(false)} />);
            }}
            onPreviewEntry={(categoryId, entryId) => {
              const catEntries = entries[categoryId] || [];
              const ent = catEntries.find(e => e.id === entryId);
              const cat = categories.find(c => c.id === categoryId);
              if (ent) {
                openPreview(ent.name, <RaceClassPreview entry={ent} typeLabel={cat?.name || ''} />,
                  (ent.description || '') + Object.values(ent.field_values || {}).join(''),
                  () => openEditModal(`编辑${cat?.name || '条目'}`,
                    <RaceClassEditPanel key={`rc-${drawerKey}`} entryId={entryId} categoryId={categoryId} onClose={() => setEditModalOpen(false)} />));
              }
            }}
          />
        ) : activeModule === 'organizations' && activeWorldId ? (
          <OrgPowerView
            worldId={activeWorldId}
            onCreateEntry={(categoryId) => {
              const cat = categories.find(c => c.id === categoryId);
              openEditModal(`新建${cat?.name || '条目'}`,
                <OrgPowerEditPanel key={`org-new-${drawerKey}`} entryId={null} categoryId={categoryId} onClose={() => setEditModalOpen(false)} />);
            }}
            onPreviewEntry={(categoryId, entryId) => {
              const catEntries = entries[categoryId] || [];
              const ent = catEntries.find(e => e.id === entryId);
              const cat = categories.find(c => c.id === categoryId);
              if (ent) {
                openPreview(ent.name, <OrgPowerPreview entry={ent} typeLabel={cat?.name || ''} />,
                  (ent.description || '') + Object.values(ent.field_values || {}).join(''),
                  () => openEditModal(`编辑${cat?.name || '条目'}`,
                    <OrgPowerEditPanel key={`org-${drawerKey}`} entryId={entryId} categoryId={categoryId} onClose={() => setEditModalOpen(false)} />));
              }
            }}
          />
        ) : activeModule === 'relationships' && activeWorldId ? (
          <div className="h-full">
            <RelationshipGraph
              worldId={activeWorldId} characters={characters}
              onCreateNew={(sourceId, targetId) => {
                const key = `rel-new-${drawerKey}`;
                openEditModal('新建关系',
                  <RelationshipEditPanel key={key} worldId={activeWorldId!} characters={characters}
                    prefillSourceId={sourceId}
                    prefillTargetId={targetId}
                    onClose={() => setEditModalOpen(false)} />);
              }}
              onPreview={(rel) => {
                const { relationships } = useRelationships.getState();
                const backward = relationships.find(
                  (r) => r.source_id === rel.target_id && r.target_id === rel.source_id
                );
                const srcChar = characters.find((c) => c.id === rel.source_id);
                const tgtChar = characters.find((c) => c.id === rel.target_id);
                openPreview(
                  `${srcChar?.name || '?'} ↔ ${tgtChar?.name || '?'}`,
                  <RelationshipPreview forward={rel} backward={backward} sourceChar={srcChar} targetChar={tgtChar} />,
                  `${srcChar?.name || ''} ${rel.relation_type} ${tgtChar?.name || ''}`,
                  () => {
                    const key = `rel-edit-${drawerKey}`;
                    openEditModal('编辑关系',
                      <RelationshipEditPanel key={key} worldId={activeWorldId!} characters={characters}
                        editData={{ sourceId: rel.source_id, targetId: rel.target_id, forward: rel, backward }}
                        onClose={() => setEditModalOpen(false)} />);
                  }
                );
              }}
              onEdit={(rel) => {
                const key = `rel-edit-${drawerKey}`;
                const { relationships } = useRelationships.getState();
                const backward = relationships.find(
                  (r) => r.source_id === rel.target_id && r.target_id === rel.source_id
                );
                openEditModal('编辑关系',
                  <RelationshipEditPanel key={key} worldId={activeWorldId!} characters={characters}
                    editData={{
                      sourceId: rel.source_id,
                      targetId: rel.target_id,
                      forward: rel,
                      backward,
                    }}
                    onClose={() => setEditModalOpen(false)} />);
              }}
              onDeleteRelation={async (id) => { await removeRel(id); }}
            />
          </div>
        ) : activeModule === 'storylines' && activeWorldId ? (
          <div className="p-6">
            <StorylineList worldId={activeWorldId}
              onPreviewChapter={(_storylineId, volumeId, chapterId) => {
                const { storylines } = useStorylines.getState();
                const { activeBookId, bookSlMap } = useBooks.getState();
                // Flatten chapters from current book only
                const allChapters: { chapter: any; volTitle: string; volId: string; slId: string; volChIdx: number }[] = [];
                for (const sl of storylines) {
                  const mappedBook = bookSlMap[sl.id];
                  if (mappedBook && mappedBook !== activeBookId) continue;
                  if (!mappedBook && activeBookId !== useBooks.getState().books[0]?.id) continue;
                  const volumes = (sl.chapters || []) as { id: string; title: string; chapters: any[] }[];
                  for (const vol of volumes) {
                    for (let ci = 0; ci < vol.chapters.length; ci++) {
                      allChapters.push({ chapter: vol.chapters[ci], volTitle: vol.title || '未命名', volId: vol.id, slId: sl.id, volChIdx: ci });
                    }
                  }
                }
                const globalIdx = allChapters.findIndex(e => e.chapter.id === chapterId && e.volId === volumeId);
                if (globalIdx >= 0) {
                  const { chapter: ch, volChIdx } = allChapters[globalIdx];
                  openPreview(`第${volChIdx + 1}章 ${ch.title || ''}`,
                    <ChapterPreview
                      entries={allChapters.map(e => ({ ...e.chapter, _volTitle: e.volTitle, _volId: e.volId, _slId: e.slId, _volChIdx: e.volChIdx }))}
                      initialIndex={globalIdx}
                    />,
                    (ch.brief || '') + (ch.content || ''),
                    () => {
                      const cur = allChapters[globalIdx];
                      if (cur) {
                        openEditModal('编辑章节',
                          <ChapterEditPanel key={`ch-${drawerKey}`} storylineId={cur.slId} volumeId={cur.volId} chapterId={cur.chapter.id} onClose={() => setEditModalOpen(false)} />);
                      }
                    }
                  );
                }
              }}
              onAddChapter={(storylineId, volumeId) => {
                openEditModal('新建章节',
                  <ChapterEditPanel key={`ch-new-${drawerKey}`} storylineId={storylineId} volumeId={volumeId} chapterId={null} onClose={() => setEditModalOpen(false)} />);
              }}
              onCreate={() => {
                openEditModal('新建卷',
                  <StorylineEditPanel key={`sl-new-${drawerKey}`} worldId={activeWorldId!} storylineId={null} hideChapters
                    onCreated={(newSlId) => {
                      const { activeBookId, assignStoryline } = useBooks.getState();
                      if (activeBookId) assignStoryline(newSlId, activeBookId);
                    }}
                    onClose={() => setEditModalOpen(false)} />);
              }}
              onCreateBook={() => {
                openEditModal('新建故事线',
                  <StorylineEditPanel key={`sl-new-${drawerKey}`} worldId={activeWorldId!} storylineId={null} hideChapters showSlTitle
                    onCreated={(newSlId) => {
                      const book = useBooks.getState().createBook('新故事线');
                      const { assignStoryline, renameBook } = useBooks.getState();
                      assignStoryline(newSlId, book.id);
                      const { storylines } = useStorylines.getState();
                      const newSl = storylines.find(s => s.id === newSlId);
                      if (newSl?.title) renameBook(book.id, newSl.title);
                    }}
                    onClose={() => setEditModalOpen(false)} />);
              }}
            />
          </div>
        ) : activeModule === 'notes' ? (
          <div className="p-4 h-full">
            <NotesView worldId={activeWorldId || undefined} />
          </div>
        ) : activeModule === 'illustrations' && activeWorldId ? (
          <div className="p-4">
            <IllustrationGallery
              onEdit={(id) => { openEditModal('编辑插图', <IllustrationEditPanel worldId={activeWorldId!} illustrationId={id} onClose={() => setEditModalOpen(false)} />); }}
              onCreate={() => { openEditModal('新建插图', <IllustrationEditPanel worldId={activeWorldId!} illustrationId={null} onClose={() => setEditModalOpen(false)} />); }}
            />
          </div>
        ) : activeModule === 'tables' ? (
          <div className="p-4">
            <TablesView
              onEdit={(id) => { openEditModal('编辑OC表格', <TableEditPanel worldId={activeWorldId || worlds[0]?.id || ''} tableId={id} onClose={() => setEditModalOpen(false)} />); }}
              onCreate={() => { openEditModal('新建OC表格', <TableEditPanel worldId={activeWorldId || worlds[0]?.id || ''} tableId={null} onClose={() => setEditModalOpen(false)} />); }}
            />
          </div>
        ) : activeModule === 'items' && activeWorldId ? (
          <div className="p-4">
            <ItemsView worldId={activeWorldId}
              onPreview={(id) => { const { items } = useItems.getState(); const it = items.find(x => x.id === id); if (it) openPreview(it.name, <ItemPreview item={it} />, (it.description||'') + Object.values(it.attributes||{}).join(''), () => openEditModal('编辑物品', <ItemEditPanel key={`item-${drawerKey}`} worldId={activeWorldId!} itemId={id} onClose={() => setEditModalOpen(false)} />)); }}
              onCreate={() => openEditModal('新建物品', <ItemEditPanel key={`item-new-${drawerKey}`} worldId={activeWorldId!} itemId={null} onClose={() => setEditModalOpen(false)} />)}
            />
          </div>
        ) : activeModule === 'settings' ? (
          <div className="p-6">
            <SettingsView />
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

      <EditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editModalTitle}
      >
        {editModalContent}
      </EditModal>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        contentText={previewText}
        onEdit={() => { setPreviewOpen(false); previewEditAction(); }}
        onEnter={previewEnterAction ? () => { setPreviewOpen(false); previewEnterAction(); } : undefined}
      >
        {previewContent}
      </PreviewModal>

      <NewWorldModal
        open={newWorldOpen}
        onClose={() => setNewWorldOpen(false)}
        onSave={handleCreateWorld}
      />

      <UserProfileModal
        open={profileOpen}
        onClose={() => { setProfileOpen(false); refreshUser(); }}
      />

      <NewWorldModal
        open={!!editWorldData}
        onClose={() => setEditWorldData(null)}
        initialData={editWorldData || undefined}
        onDelete={() => {
          if (editWorldData) {
            const id = editWorldData.id;
            setEditWorldData(null);
            handleDeleteWorld(id);
          }
        }}
        onSave={async (data) => {
          if (editWorldData) {
            await updateWorld(editWorldData.id, data);
            setEditWorldData(null);
          }
        }}
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
      <Route path="/share/:token" element={<SharePage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={user ? <AuthenticatedApp /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
