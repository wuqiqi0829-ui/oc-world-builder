import { useReactFlow, BaseEdge, type EdgeProps } from 'reactflow';

interface ParallelEdgeData {
  forwardLabel?: string;
  forwardColor?: string;
  backwardLabel?: string;
  backwardColor?: string;
}

const R = 40; // 圆半径
const GAP = 6;  // 线离圆的空隙

function ArrowHead({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  const size = 8;
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  const points = [
    `${x},${y}`,
    `${x + Math.cos(a1) * size},${y + Math.sin(a1) * size}`,
    `${x + Math.cos(a2) * size},${y + Math.sin(a2) * size}`,
  ].join(' ');
  return <polygon points={points} fill={color} />;
}

function circleIntersect(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, r: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const acx = ax - cx;
  const acy = ay - cy;
  const b = 2 * (acx * ux + acy * uy);
  const c = acx * acx + acy * acy - r * r;
  const disc = b * b - 4 * c;
  if (disc < 0) return { x: ax, y: ay };
  const t1 = (-b + Math.sqrt(disc)) / 2;
  const t2 = (-b - Math.sqrt(disc)) / 2;
  const t = [t1, t2].find((v) => v > 0 && v <= len);
  if (t == null) return { x: ax, y: ay };
  return { x: ax + ux * t, y: ay + uy * t };
}

export default function ParallelEdge({
  source, target, data,
}: EdgeProps) {
  const d = (data || {}) as ParallelEdgeData;
  const { getNode } = useReactFlow();
  const srcNode = getNode(source);
  const tgtNode = getNode(target);
  const scx = (srcNode?.position.x ?? 0) + R;
  const scy = (srcNode?.position.y ?? 0) + R;
  const tcx = (tgtNode?.position.x ?? 0) + R;
  const tcy = (tgtNode?.position.y ?? 0) + R;

  const srcPt = circleIntersect(tcx, tcy, scx, scy, scx, scy, R + GAP);
  const tgtPt = circleIntersect(scx, scy, tcx, tcy, tcx, tcy, R + GAP);

  const hasBackward = !!(d.backwardLabel || d.backwardColor);
  const forwardColor = d.forwardColor || '#999';
  const backwardColor = d.backwardColor || '#999';

  const dx = tgtPt.x - srcPt.x;
  const dy = tgtPt.y - srcPt.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const angle = Math.atan2(dy, dx);
  const px = -uy;
  const py = ux;

  const lineOffset = hasBackward ? 5 : 0;
  const labelOffset = 14;
  const arrowInset = 6;

  if (hasBackward) {
    const s1x = srcPt.x + px * lineOffset;
    const s1y = srcPt.y + py * lineOffset;
    const t1x = tgtPt.x + px * lineOffset;
    const t1y = tgtPt.y + py * lineOffset;
    const s2x = srcPt.x - px * lineOffset;
    const s2y = srcPt.y - py * lineOffset;
    const t2x = tgtPt.x - px * lineOffset;
    const t2y = tgtPt.y - py * lineOffset;

    const path1 = `M${s1x},${s1y}L${t1x},${t1y}`;
    const path2 = `M${s2x},${s2y}L${t2x},${t2y}`;

    const a1x = t1x + ux * arrowInset;
    const a1y = t1y + uy * arrowInset;
    const a2x = s2x - ux * arrowInset;
    const a2y = s2y - uy * arrowInset;

    const lx1 = (s1x + t1x) / 2 + px * labelOffset;
    const ly1 = (s1y + t1y) / 2 + py * labelOffset;
    const lx2 = (s2x + t2x) / 2 - px * labelOffset;
    const ly2 = (s2y + t2y) / 2 - py * labelOffset;

    const deg = (angle * 180) / Math.PI;
    const rot = deg > 90 || deg < -90 ? deg + 180 : deg;

    return (
      <>
        <BaseEdge path={path1} style={{ stroke: forwardColor, strokeWidth: 0.5 }} />
        <ArrowHead x={a1x} y={a1y} angle={angle} color={forwardColor} />
        {d.forwardLabel && (
          <text x={lx1} y={ly1} textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${rot}, ${lx1}, ${ly1})`}
            fontSize={9} fill={forwardColor} pointerEvents="none" fontWeight={500}>
            {d.forwardLabel}
          </text>
        )}
        <BaseEdge path={path2} style={{ stroke: backwardColor, strokeWidth: 0.5 }} />
        <ArrowHead x={a2x} y={a2y} angle={angle + Math.PI} color={backwardColor} />
        {d.backwardLabel && (
          <text x={lx2} y={ly2} textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${rot}, ${lx2}, ${ly2})`}
            fontSize={9} fill={backwardColor} pointerEvents="none" fontWeight={500}>
            {d.backwardLabel}
          </text>
        )}
      </>
    );
  }

  // 单向
  const path = `M${srcPt.x},${srcPt.y}L${tgtPt.x},${tgtPt.y}`;
  const ax = tgtPt.x + ux * arrowInset;
  const ay = tgtPt.y + uy * arrowInset;
  const midX = (srcPt.x + tgtPt.x) / 2 + px * labelOffset;
  const midY = (srcPt.y + tgtPt.y) / 2 + py * labelOffset;
  const deg = (angle * 180) / Math.PI;
  const rot = deg > 90 || deg < -90 ? deg + 180 : deg;

  return (
    <>
      <BaseEdge path={path} style={{ stroke: forwardColor, strokeWidth: 0.5 }} />
      <ArrowHead x={ax} y={ay} angle={angle} color={forwardColor} />
      {d.forwardLabel && (
        <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle"
          transform={`rotate(${rot}, ${midX}, ${midY})`}
          fontSize={9} fill={forwardColor} pointerEvents="none" fontWeight={500}>
          {d.forwardLabel}
        </text>
      )}
    </>
  );
}
