import type { Relationship, Character } from '@/lib/database';
import { parseLabel } from '@/lib/labelUtils';

const relationLabels: Record<string, string> = {
  friend: '亲友', enemy: '敌对', mentor: '师徒', lover: '恋人',
  colleague: '同僚', belong: '所属', located: '位于', other: '其他',
};

interface Props {
  forward: Relationship;
  backward?: Relationship;
  sourceChar?: Character;
  targetChar?: Character;
}

function CharAvatar({ char }: { char?: Character }) {
  const url = char?.avatar_url || char?.images?.[0]?.url || '';
  const initial = char?.name?.charAt(0) || '?';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center shadow-sm">
        {url ? (
          <img src={url} alt={char?.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold text-primary-500">{initial}</span>
        )}
      </div>
      <span className="text-xs font-medium">{char?.name || '未知'}</span>
    </div>
  );
}

export default function RelationshipPreview({ forward, backward, sourceChar, targetChar }: Props) {
  const fwd = parseLabel(forward.label);
  const fwdType = relationLabels[forward.relation_type] || forward.relation_type || '关联';
  const fwdLabel = fwd.opinion ? `${fwdType} · ${fwd.opinion}` : fwdType;
  const bwd = backward ? parseLabel(backward.label) : null;
  const bwdType = backward ? (relationLabels[backward.relation_type] || backward.relation_type) : '';
  const bwdLabel = bwd && bwdType ? (bwd.opinion ? `${bwdType} · ${bwd.opinion}` : bwdType) : '';

  const lineW = 120;
  const lineY1 = 24;
  const lineY2 = 38;
  const fwdColor = fwd.color || '#7C5CBF';
  const bwdColor = bwd?.color || '#999';

  return (
    <div className="space-y-4 text-center">
      {/* 头像 + 连线 + 箭头 */}
      <div className="flex items-center justify-center">
        <CharAvatar char={sourceChar} />
        <svg width={lineW} height={bwd ? 60 : 40} className="flex-shrink-0">
          <line x1={4} y1={lineY1} x2={lineW - 10} y2={lineY1}
            stroke={fwdColor} strokeWidth={1} />
          <polygon
            points={`${lineW - 10},${lineY1} ${lineW - 18},${lineY1 - 4} ${lineW - 18},${lineY1 + 4}`}
            fill={fwdColor} />
          <text x={lineW / 2} y={lineY1 - 4} textAnchor="middle" fontSize={9}
            fill={fwdColor} fontWeight={500}>
            {fwdLabel}
          </text>
          {bwd && (
            <>
              <line x1={lineW - 10} y1={lineY2} x2={4} y2={lineY2}
                stroke={bwdColor} strokeWidth={1} />
              <polygon
                points={`${4},${lineY2} ${12},${lineY2 - 4} ${12},${lineY2 + 4}`}
                fill={bwdColor} />
              <text x={lineW / 2} y={lineY2 + 12} textAnchor="middle" fontSize={9}
                fill={bwdColor} fontWeight={500}>
                {bwdLabel}
              </text>
            </>
          )}
        </svg>
        <CharAvatar char={targetChar} />
      </div>

      {/* 详细补充 */}
      {(fwd.details || bwd?.details) && (
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--color-text))] text-center mb-3">
            <span className="text-primary-400/60 mr-2">✦</span>
            详细补充
            <span className="text-primary-400/60 ml-2">✦</span>
          </p>
          <div className="relative p-5 pt-4 space-y-4">
            <span className="absolute top-2 left-4 right-4 h-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute bottom-0 left-4 right-4 h-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute left-0 top-4 bottom-4 w-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute right-0 top-4 bottom-4 w-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute -top-2 -left-2 text-primary-400/60 select-none text-base">◇</span>
            <span className="absolute -top-2 -right-2 text-primary-400/60 select-none text-base">◇</span>
            <span className="absolute -bottom-2 -left-2 text-primary-400/60 select-none text-base">◇</span>
            <span className="absolute -bottom-2 -right-2 text-primary-400/60 select-none text-base">◇</span>
            <div className="text-sm leading-relaxed text-left max-w-none whitespace-pre-wrap">{fwd.details}</div>
          </div>
        </div>
      )}
    </div>
  );
}
