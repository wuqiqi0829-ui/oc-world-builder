import { useState } from 'react';
import type { Character } from '@/lib/database';
import OutfitDetail from './OutfitDetail';

interface Props { character: Character }

export default function CharacterPreview({ character }: Props) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const images = character.images || [];
  const groups = [...new Set(images.map((i) => i.group || '默认'))];

  const basicInfo = [
    character.nickname && `昵称：${character.nickname}`,
    character.gender && `性别：${character.gender}`,
    character.age && `年龄：${character.age}`,
    character.occupation && `职业：${character.occupation}`,
    character.faction && `阵营：${character.faction}`,
  ].filter(Boolean).join(' | ');

  const introFields = [
    ['外貌描述', character.appearance],
    ['性格', character.personality],
    ['背景故事', character.background],
    ['能力设定', character.abilities],
  ] as const;

  // If viewing a specific outfit detail
  if (activeGroup !== null) {
    const groupImgs = images.filter((i) => (i.group || '默认') === activeGroup);
    return (
      <OutfitDetail
        groupName={activeGroup}
        images={groupImgs}
        onBack={() => setActiveGroup(null)}
      />
    );
  }

  return (
    <div>
      {/* 服设卡片列表 */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {groups.map((group) => {
            const groupImgs = images.filter((i) => (i.group || '默认') === group);
            const cover = groupImgs.find((i) => i.isCover) || groupImgs[0];
            const secondImg = groupImgs.find((i) => i !== cover && i.url)?.url || null;

            return (
              <div
                key={group}
                className="flex gap-4 p-3 bg-white/70 dark:bg-surface-800/70 backdrop-blur-md rounded-xl border border-[rgb(var(--color-border))] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0_4px_16px_rgb(var(--primary-600)/0.08)] transition-shadow"
                onClick={() => setActiveGroup(group)}
              >
                {/* 左侧：堆叠封面 */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  {secondImg && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden border border-[rgb(var(--color-border))] translate-x-1 translate-y-1 opacity-60">
                      <img src={secondImg} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-lg overflow-hidden border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] shadow-sm">
                    {cover?.url ? (
                      <img src={cover.url} alt={group} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[rgb(var(--color-border))] text-xl font-bold">{group[0]}</div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                    +{groupImgs.length}
                  </div>
                </div>

                {/* 右侧：标题+描述+统计 */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-center">
                  <h3 className="font-semibold text-sm text-[rgb(var(--color-text))]">{group}</h3>
                  {character.outfit_descriptions?.[group] && (
                    <>
                      <span className="text-primary-400/40 text-sm mt-1 block">✦ ✦ ✦</span>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">「{character.outfit_descriptions[group]}」</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 原有字段保持不变 */}
      <div className="space-y-3">
        {basicInfo && (
          <div className="text-center">
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">基础信息</span>
            <p className="text-sm mt-0.5">{basicInfo}</p>
          </div>
        )}
        {character.catchphrase && (
          <div className="text-center">
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">「{character.catchphrase}」</p>
          </div>
        )}
        {introFields.some(([, v]) => v) && (
          <div>
            <p className="text-sm font-semibold text-[rgb(var(--color-text))] text-center mb-3">
              <span className="text-primary-400/60 mr-2">✦</span>
              人物介绍
              <span className="text-primary-400/60 ml-2">✦</span>
            </p>
            <div className="relative p-5 pt-4">
              {/* 四角菱形 + 断开线 */}
              <span className="absolute top-0 left-4 right-4 h-px bg-primary-200/80 dark:bg-primary-800/80" />
              <span className="absolute bottom-0 left-4 right-4 h-px bg-primary-200/80 dark:bg-primary-800/80" />
              <span className="absolute left-0 top-4 bottom-4 w-px bg-primary-200/80 dark:bg-primary-800/80" />
              <span className="absolute right-0 top-4 bottom-4 w-px bg-primary-200/80 dark:bg-primary-800/80" />
              <span className="absolute -top-2 -left-2 text-primary-400/60 select-none text-base">◇</span>
              <span className="absolute -top-2 -right-2 text-primary-400/60 select-none text-base">◇</span>
              <span className="absolute -bottom-2 -left-2 text-primary-400/60 select-none text-base">◇</span>
              <span className="absolute -bottom-2 -right-2 text-primary-400/60 select-none text-base">◇</span>
              <div className="text-sm prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: introFields.map(([, v]) => v).filter(Boolean).join('<br/><br/>') }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
