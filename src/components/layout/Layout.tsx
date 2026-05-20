import { useState, useCallback, type ReactNode } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Drawer from './Drawer';
import MobileNav from './MobileNav';
import type { SearchResult } from '@/lib/db';

interface World {
  id: string;
  name: string;
  cover_url?: string | null;
  description?: string;
}

interface LayoutProps {
  worlds: World[];
  activeWorldId: string | null;
  onSelectWorld: (id: string) => void;
  onDeleteWorld: (id: string) => void;
  activeModule: string;
  onSelectModule: (module: string) => void;
  drawerOpen: boolean;
  drawerTitle?: string;
  onCloseDrawer: () => void;
  onNewWorld?: () => void;
  onNew?: () => void;
  onSelectSearchResult?: (result: SearchResult) => void;
  onExport?: () => void;
  onImport?: () => void;
  onShowAllWorlds?: () => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onProfile?: () => void;
  children: ReactNode;
  drawerContent?: ReactNode;
}

export default function Layout({
  worlds, activeWorldId, onSelectWorld, onDeleteWorld,
  activeModule, onSelectModule,
  drawerOpen, drawerTitle, onCloseDrawer, onNewWorld, onNew,
  onSelectSearchResult, onExport, onImport, onShowAllWorlds, userEmail, userName, userAvatar, onLogout, onProfile, children, drawerContent,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectModule = useCallback((module: string) => {
    onSelectModule(module);
    setMobileSidebarOpen(false);
  }, [onSelectModule]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar onNew={onNew} onNewWorld={onNewWorld} onSelectSearchResult={onSelectSearchResult} onExport={onExport} onImport={onImport} userEmail={userEmail} userName={userName} userAvatar={userAvatar} onLogout={onLogout} onProfile={onProfile} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            worlds={worlds}
            activeWorldId={activeWorldId}
            activeModule={activeModule}
            onSelectWorld={onSelectWorld}
            onDeleteWorld={onDeleteWorld}
            onSelectModule={onSelectModule}
            onNewWorld={onNewWorld}
            onShowAllWorlds={onShowAllWorlds}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64">
              <Sidebar
                worlds={worlds}
                activeWorldId={activeWorldId}
                activeModule={activeModule}
                onSelectWorld={onSelectWorld}
                onDeleteWorld={onDeleteWorld}
                onSelectModule={handleSelectModule}
                onNewWorld={onNewWorld}
                onShowAllWorlds={onShowAllWorlds}
                collapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[rgb(var(--color-bg))]">
          {children}
        </main>

        {/* Drawer */}
        <Drawer open={drawerOpen} onClose={onCloseDrawer} title={drawerTitle}>
          {drawerContent}
        </Drawer>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav
        activeModule={activeModule}
        onSelectModule={onSelectModule}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />
    </div>
  );
}
