import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="h-14 border-b border-[rgb(var(--color-border))] flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-primary-600">OC World Builder</h1>
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">阶段 0 - 项目骨架</span>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[rgb(var(--color-text-secondary))] text-lg">
            OC 世界观收纳整理软件 — 项目已就绪
          </p>
        </main>
      </div>
    </BrowserRouter>
  );
}
