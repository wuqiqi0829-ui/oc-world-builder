import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useWorlds } from '@/stores/worlds';
import { useCharacters } from '@/stores/characters';
import { useTimeline } from '@/stores/timeline';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import NewWorldModal from '@/components/worlds/NewWorldModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CharacterList from '@/components/characters/CharacterList';
import CharacterEditPanel from '@/components/characters/CharacterEditPanel';
import TimelineView from '@/components/timeline/TimelineView';
import TimelineEditPanel from '@/components/timeline/TimelineEditPanel';
import { Globe, Plus, Users, Clock, Map, Loader2, Sparkles } from 'lucide-react';

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
    fetchWorlds, createWorld, deleteWorld, startRealtime,
  } = useWorlds();
  const {
    characters, fetch: fetchChars,
    startRealtime: charRealtime,
  } = useCharacters();
  const {
    events, fetch: fetchTimeline,
    startRealtime: timelineRealtime,
  } = useTimeline();
  const [activeModule, setActiveModule] = useState('characters');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [newWorldOpen, setNewWorldOpen] = useState(false);
  const [deleteWorldId, setDeleteWorldId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorlds();
    const channel = startRealtime();
    return () => { channel.unsubscribe(); };
  }, [fetchWorlds, startRealtime]);

  useEffect(() => {
    if (activeWorldId) {
      fetchChars(activeWorldId);
      fetchTimeline(activeWorldId);
      const chChannel = charRealtime(activeWorldId);
      const tlChannel = timelineRealtime(activeWorldId);
      return () => { chChannel.unsubscribe(); tlChannel.unsubscribe(); };
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
  };

  const drawerTitle = () => {
    if (activeModule === 'characters') return drawerMode === 'create' ? '新建角色' : '编辑角色';
    if (activeModule === 'timeline') return drawerMode === 'create' ? '新建事件' : '编辑事件';
    return '新建';
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
        onNew={activeModule !== 'categories' ? openCreateDrawer : () => setDrawerOpen(true)}
        drawerContent={
          activeModule === 'characters' && activeWorldId ? (
            <CharacterEditPanel worldId={activeWorldId} characterId={drawerMode === 'edit' ? editId : null} onClose={closeDrawer} />
          ) : activeModule === 'timeline' && activeWorldId ? (
            <TimelineEditPanel worldId={activeWorldId} eventId={drawerMode === 'edit' ? editId : null} onClose={closeDrawer} />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">编辑面板将在后续阶段实现</p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">当前登录：{user?.email}</p>
              <button className="btn-ghost text-sm" onClick={signOut}>退出登录</button>
            </div>
          )
        }
      >
        {worlds.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={36} className="text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">欢迎使用 OC World Builder</h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                创建你的第一个世界观，开始记录人物、时间线、地图等设定。
                所有数据自动云端同步，换设备也不会丢失。
              </p>
              <button className="btn-primary text-sm" onClick={() => setNewWorldOpen(true)}>
                创建第一个世界观
              </button>
            </div>
          </div>
        ) : activeModule === 'characters' && activeWorldId ? (
          <div className="p-6">
            <CharacterList characters={characters} activeId={null} onSelect={openEditDrawer} onCreate={openCreateDrawer} />
          </div>
        ) : activeModule === 'timeline' && activeWorldId ? (
          <div className="p-6">
            <TimelineView events={events} onCreate={openCreateDrawer} onEdit={openEditDrawer} />
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
