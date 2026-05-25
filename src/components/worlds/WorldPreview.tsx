import { useState } from 'react';
import type { World } from '@/lib/database';
import { shareApi } from '@/lib/db';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import { Share2, Copy, Check } from 'lucide-react';

interface Props { world: World }

export default function WorldPreview({ world }: Props) {
  const readOnly = useReadOnly();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleShare = async () => {
    if (shareToken) {
      await shareApi.disable();
      setShareToken(null);
    } else {
      const token = await shareApi.enable();
      setShareToken(token);
    }
  };

  const copyLink = () => {
    if (!shareToken) return;
    const link = `${window.location.origin}/#/share/${shareToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="text-center">
      {world.cover_url && (
        <div className="rounded-lg overflow-hidden mb-4 border border-[rgb(var(--color-border))] inline-block">
          <img src={world.cover_url} alt={world.name} className="max-w-full max-h-64 object-cover" />
        </div>
      )}
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">名称</span>
          <p className="text-sm mt-0.5">{world.name}</p>
        </div>
        {world.description && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">「{world.description}」</p>
          </div>
        )}
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">创建时间</span>
          <p className="text-sm mt-0.5">{new Date(world.created_at).toLocaleString('zh-CN')}</p>
        </div>

        {/* Share section — only for owner */}
        {!readOnly && (
        <div className="border-t border-[rgb(var(--color-border))] pt-3 mt-3">
          <button
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 mx-auto transition-colors ${shareToken ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}
            onClick={toggleShare}
          >
            <Share2 size={14} />
            {shareToken ? '已开启分享（所有世界观）' : '开启分享（所有世界观）'}
          </button>
          {shareToken && (
            <div className="mt-2 flex items-center gap-2 justify-center">
              <code className="text-[10px] bg-[rgb(var(--color-bg))] px-2 py-1 rounded border border-[rgb(var(--color-border))] truncate max-w-[200px]">
                {`${window.location.origin}/#/share/${shareToken}`}
              </code>
              <button className="btn-ghost !p-1.5" onClick={copyLink}>
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
