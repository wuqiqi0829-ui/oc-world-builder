import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Globe, Plus, Users, Clock, Map, Loader2 } from 'lucide-react';

interface World {
  id: string;
  name: string;
}

const demoWorlds: World[] = [
  { id: '1', name: '艾泽拉斯·改' },
  { id: '2', name: '星落之海' },
];

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
  const [worlds] = useState<World[]>(demoWorlds);
  const [activeWorldId, setActiveWorldId] = useState<string | null>('1');
  const [activeModule, setActiveModule] = useState('characters');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteWorldId, setDeleteWorldId] = useState<string | null>(null);

  const confirmDeleteWorld = () => {
    if (deleteWorldId) {
      if (activeWorldId === deleteWorldId) {
        setActiveWorldId(worlds.find((w) => w.id !== deleteWorldId)?.id || null);
      }
      setDeleteWorldId(null);
    }
  };

  const placeholder = modulePlaceholders[activeModule];

  return (
    <Layout
      worlds={worlds}
      activeWorldId={activeWorldId}
      onSelectWorld={setActiveWorldId}
      onDeleteWorld={(id) => setDeleteWorldId(id)}
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      drawerOpen={drawerOpen}
      drawerTitle="新建"
      onCloseDrawer={() => setDrawerOpen(false)}
      drawerContent={
        <div className="space-y-4">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">编辑面板将在后续阶段实现</p>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            当前登录：{user?.email}
          </p>
          <button className="btn-ghost text-sm" onClick={signOut}>退出登录</button>
        </div>
      }
    >
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
          description="此模块将在后续开发阶段实现。当前阶段 2 已完成用户认证系统。"
          action={
            <button className="btn-primary text-sm" onClick={() => setDrawerOpen(true)}>
              预览编辑面板
            </button>
          }
        />
      </div>

      <ConfirmDialog
        open={!!deleteWorldId}
        onClose={() => setDeleteWorldId(null)}
        onConfirm={confirmDeleteWorld}
        title="删除世界观"
        message="确定要删除吗？此操作不可恢复。"
        confirmLabel="删除"
        dangerous
      />
    </Layout>
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
