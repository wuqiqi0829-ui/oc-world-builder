import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import { Globe, Plus, Users, Clock, Map } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface World {
  id: string;
  name: string;
}

const demoWorlds: World[] = [
  { id: '1', name: '艾泽拉斯·改' },
  { id: '2', name: '星落之海' },
];

const modulePlaceholders: Record<string, { icon: typeof Globe; title: string; description: string }> = {
  characters: { icon: Users, title: '人物设定库', description: '在这里创建和管理你的OC人设卡，包含外貌、性格、背景故事等' },
  timeline: { icon: Clock, title: '时间线', description: '可视化展示世界观的时间轴，记录关键历史事件' },
  map: { icon: Map, title: '地图', description: '上传世界观地图，添加可拖拽的地点标记' },
  categories: { icon: Globe, title: '职业/种族设定', description: '自定义分类模板，管理职业、种族、势力等设定' },
  organizations: { icon: Globe, title: '组织势力', description: '记录国家、帮派、公会等集团信息' },
  items: { icon: Globe, title: '物品图鉴', description: '记录特殊物品、武器、道具的信息' },
  relationships: { icon: Globe, title: '关系图谱', description: '可视化人物、组织之间的关联网络' },
  storylines: { icon: Globe, title: '主线剧情', description: '记录世界观的主线故事和章节' },
  notes: { icon: Globe, title: '灵感速记', description: '随手记录碎片想法，后续关联到具体模块' },
};

export default function App() {
  const [worlds, setWorlds] = useState<World[]>(demoWorlds);
  const [activeWorldId, setActiveWorldId] = useState<string | null>('1');
  const [activeModule, setActiveModule] = useState('characters');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteWorldId, setDeleteWorldId] = useState<string | null>(null);

  const handleDeleteWorld = (id: string) => {
    setDeleteWorldId(id);
  };

  const confirmDeleteWorld = () => {
    if (deleteWorldId) {
      setWorlds((prev) => prev.filter((w) => w.id !== deleteWorldId));
      if (activeWorldId === deleteWorldId) {
        setActiveWorldId(worlds.find((w) => w.id !== deleteWorldId)?.id || null);
      }
      setDeleteWorldId(null);
    }
  };

  const placeholder = modulePlaceholders[activeModule];

  return (
    <BrowserRouter>
      <Layout
        worlds={worlds}
        activeWorldId={activeWorldId}
        onSelectWorld={setActiveWorldId}
        onDeleteWorld={handleDeleteWorld}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        drawerOpen={drawerOpen}
        drawerTitle="新建"
        onCloseDrawer={() => setDrawerOpen(false)}
        drawerContent={
          <div className="space-y-4">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">编辑面板将在后续阶段实现</p>
            <Card>
              <h3 className="font-medium text-sm mb-2">预览：人物编辑表单</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[rgb(var(--color-text-secondary))] mb-1 block">姓名</label>
                  <input type="text" className="input w-full" placeholder="角色姓名" />
                </div>
                <div>
                  <label className="text-xs text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
                  <textarea className="input w-full h-24 resize-none" placeholder="简要描述..." />
                </div>
              </div>
            </Card>
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
            description="此模块将在后续开发阶段实现。当前阶段 1 已完成布局框架和设计系统。"
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
          message={`确定要删除"${worlds.find((w) => w.id === deleteWorldId)?.name}"吗？此操作不可恢复。`}
          confirmLabel="删除"
          dangerous
        />
      </Layout>
    </BrowserRouter>
  );
}
