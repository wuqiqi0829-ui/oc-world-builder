import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useRelationships } from '@/stores/relationships';
import type { Character, Relationship } from '@/lib/database';
import { parseLabel } from '@/lib/labelUtils';
import { appDataApi } from '@/lib/db';
import { Plus, X, PanelLeft, PanelRight } from 'lucide-react';
import CharacterNode from './CharacterNode';
import ParallelEdge from './ParallelEdge';
import RelationshipList from './RelationshipList';

const nodeTypes = { character: CharacterNode };
const edgeTypes = { parallel: ParallelEdge };

const relationLabels: Record<string, string> = {
  friend: '亲友', enemy: '敌对', mentor: '师徒', lover: '恋人',
  colleague: '同僚', belong: '所属', located: '位于', other: '其他',
};

interface Props {
  worldId: string;
  characters: Character[];
  onCreateNew: (sourceId: string, targetId: string) => void;
  onPreview?: (rel: Relationship) => void;
  onEdit: (rel: Relationship) => void;
  onDeleteRelation: (id: string) => void;
}

const POS_KEY = 'oco-graph-positions';

async function loadPositions(worldId: string): Promise<Record<string, { x: number; y: number }>> {
  try {
    const data = await appDataApi.get(`graph-${worldId}`);
    if (data?.positions) return data.positions;
  } catch {}
  // Fallback to localStorage, and sync to DB
  try {
    const raw = localStorage.getItem(`${POS_KEY}-${worldId}`);
    if (raw) {
      const pos = JSON.parse(raw);
      // Upload to DB so shared viewers can see the same layout
      appDataApi.set(`graph-${worldId}`, { positions: pos }).catch(() => {});
      return pos;
    }
  } catch {}
  return {};
}

async function savePositions(worldId: string, pos: Record<string, { x: number; y: number }>) {
  try { localStorage.setItem(`${POS_KEY}-${worldId}`, JSON.stringify(pos)); } catch {}
  try { await appDataApi.set(`graph-${worldId}`, { positions: pos }); } catch {}
}

export default function RelationshipGraph({ worldId, characters, onCreateNew, onPreview, onEdit, onDeleteRelation }: Props) {
  const { relationships } = useRelationships();
  const [importOpen, setImportOpen] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [listCollapsed, setListCollapsed] = useState(true);
  const connectingRef = useRef<string | null>(null);
  useEffect(() => { connectingRef.current = connectingFrom; }, [connectingFrom]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef({ x: 0, y: 0, zoom: 1 });
  const [savedPositions, setSavedPositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    loadPositions(worldId).then(setSavedPositions);
  }, [worldId]);

  const characterMap = useMemo(() => {
    const map: Record<string, Character> = {};
    characters.forEach((c) => { map[c.id] = c; });
    return map;
  }, [characters]);

  const characterNames = useMemo(() => {
    const map: Record<string, string> = {};
    characters.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [characters]);

  // 哪些人物已有关系
  const linkedCharIds = useMemo(() => {
    const set = new Set<string>();
    relationships.forEach((r) => {
      if (r.source_type === 'character') set.add(r.source_id);
      if (r.target_type === 'character') set.add(r.target_id);
    });
    return set;
  }, [relationships]);

  // 手动导入的人物（用数组确保 React 检测变化）
  const [importedIds, setImportedIds] = useState<string[]>([]);

  // 已有关系的人物也自动标记为已导入，删线不会丢人物
  useEffect(() => {
    setImportedIds((prev) => {
      const cur = new Set(prev);
      let changed = false;
      linkedCharIds.forEach((id) => {
        if (!cur.has(id)) { cur.add(id); changed = true; }
      });
      return changed ? [...cur] : prev;
    });
  }, [linkedCharIds]);

  const allNodeIds = useMemo(() => {
    const set = new Set(linkedCharIds);
    importedIds.forEach((id) => set.add(id));
    return set;
  }, [linkedCharIds, importedIds]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const pairMap = new Map<string, Relationship[]>();

    for (const rel of relationships) {
      if (rel.source_type !== 'character' || rel.target_type !== 'character') continue;
      if (!characterMap[rel.source_id] || !characterMap[rel.target_id]) continue;
      const key = [rel.source_id, rel.target_id].sort().join('::');
      if (!pairMap.has(key)) pairMap.set(key, []);
      pairMap.get(key)!.push(rel);
    }

    // 创建节点，优先用保存的位置，否则网格布局
    const sortedIds = [...allNodeIds].sort();
    const cols = 5;
    sortedIds.forEach((id, i) => {
      if (characterMap[id]) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const saved = savedPositions[id];
        nodes.push({
          id,
          type: 'character',
          position: saved || { x: 100 + col * 160, y: 80 + row * 140 },
          data: { character: characterMap[id], color: '#7C5CBF' },
        });
      }
    });

    // 创建连线
    for (const [key, rels] of pairMap) {
      const [id1, id2] = key.split('::');
      const forward = rels.find((r) => r.source_id === id1 && r.target_id === id2);
      const backward = rels.find((r) => r.source_id === id2 && r.target_id === id1);

      if (forward || backward) {
        const edgeSource = forward ? id1 : id2;
        const edgeTarget = forward ? id2 : id1;
        // 正向：总是取 forward（如果有），否则取 backward 的数据
        const primary = forward || backward;
        const secondary = forward && backward ? backward : undefined;
        const primaryParsed = parseLabel(primary!.label);
        const secondaryParsed = secondary ? parseLabel(secondary.label) : { color: '#999', opinion: '', details: '' };
        const primaryType = relationLabels[primary!.relation_type] || primary!.relation_type;
        const secondaryType = secondary ? (relationLabels[secondary.relation_type] || secondary.relation_type) : '';

        edges.push({
          id: `${id1}::${id2}`,
          source: edgeSource,
          target: edgeTarget,
          type: 'parallel',
          data: {
            forwardLabel: primaryType ? (primaryParsed.opinion ? `${primaryType} ${primaryParsed.opinion}` : primaryType) : '',
            forwardColor: primaryParsed.color || '#7C5CBF',
            backwardLabel: secondary ? (secondaryType ? (secondaryParsed.opinion ? `${secondaryType} ${secondaryParsed.opinion}` : secondaryType) : '') : undefined,
            backwardColor: secondary ? (secondaryParsed.color || '#7C5CBF') : undefined,
            forwardRel: forward,
            backwardRel: backward,
          },
        });
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [relationships, characterMap, allNodeIds, savedPositions]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 持久化节点位置到 localStorage
  useEffect(() => {
    if (nodes.length > 0) {
      const pos: Record<string, { x: number; y: number }> = {};
      nodes.forEach((n) => { pos[n.id] = n.position; });
      savePositions(worldId, pos);
    }
  }, [nodes, worldId]);

  // 只新增节点（保留已有位置），不重置拖拽后的位置
  useEffect(() => {
    setNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      const updated = initialNodes.map((n) => {
        const existing = prevMap.get(n.id);
        return existing
          ? { ...n, position: existing.position } // 保留拖拽位置
          : n;
      });
      return updated;
    });
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // 点击节点：开始连线或完成连线（用 ref 避免闭包过期）
  const handleNodeClickDirect = useCallback((nodeId: string) => {
    const from = connectingRef.current;
    if (from) {
      if (nodeId !== from) {
        setImportedIds((prev) => [...new Set([...prev, from, nodeId])]);
        onCreateNew(from, nodeId);
      }
      setConnectingFrom(null);
      setMousePos(null);
    } else {
      setConnectingFrom(nodeId);
    }
  }, [onCreateNew]);

  // 鼠标跟随（屏幕坐标，用于临时虚线 SVG）
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!connectingRef.current || !graphRef.current) return;
    const rect = graphRef.current.getBoundingClientRect();
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, [connectingFrom]);

  // 取消连线
  const handlePaneClick = useCallback(() => {
    if (connectingRef.current) {
      setConnectingFrom(null);
      setMousePos(null);
    }
  }, []);

  // 点击连线 → 预览
  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    const data = edge.data as any;
    const rel = data?.forwardRel || data?.backwardRel;
    if (rel && onPreview) onPreview(rel);
  }, [onPreview]);

  // 获取连线源节点的屏幕位置
  const connectingNode = connectingFrom ? nodes.find((n) => n.id === connectingFrom) : null;

  const charList = characters.filter((c) => !allNodeIds.has(c.id));

  return (
    <div className="flex h-full" ref={graphRef} onMouseMove={handleMouseMove}>
      <div className="flex-1 relative min-w-0">
        {/* 顶栏 */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <h3 className="text-sm font-medium bg-[rgb(var(--color-surface))] px-2 py-0.5 rounded">关系图谱</h3>
          <div className="flex items-center gap-2">
            <button
              className="btn-ghost text-xs !px-1.5 !py-1"
              onClick={() => setListCollapsed(!listCollapsed)}
              title={listCollapsed ? '展开关系列表' : '收起关系列表'}
            >
              {listCollapsed ? <PanelLeft size={12} /> : <PanelRight size={12} />}
            </button>
            <button className="btn-primary text-xs flex items-center gap-1" onClick={() => setImportOpen(true)}>
              <Plus size={12} /> 导入人物
            </button>
            {connectingFrom && (
              <button className="btn-ghost text-xs text-[rgb(var(--color-text-secondary))]" onClick={() => { setConnectingFrom(null); setMousePos(null); }}>
                取消连线
              </button>
            )}
          </div>
        </div>

        {connectingFrom && (
          <div className="absolute top-12 left-3 right-3 z-10 text-xs text-primary-500 bg-[rgb(var(--color-surface))] px-2 py-0.5 rounded">
            点击另一个头像完成连线
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => handleNodeClickDirect(node.id)}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onMove={(_, v) => { viewportRef.current = v; }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MiniMap
            nodeColor={() => '#7C5CBF'}
            style={{ backgroundColor: '#fff', width: 100, height: 70 }}
            maskColor="rgba(0,0,0,0.1)"
          />
        </ReactFlow>

        {/* 临时连线（屏幕坐标） */}
        {connectingFrom && connectingNode && mousePos && (() => {
          const v = viewportRef.current;
          const cx = (connectingNode.position.x + 40) * v.zoom + v.x;
          const cy = (connectingNode.position.y + 40) * v.zoom + v.y;
          return (
            <svg className="absolute inset-0 pointer-events-none z-20" style={{ width: '100%', height: '100%' }}>
              <line x1={cx} y1={cy} x2={mousePos.x} y2={mousePos.y}
                stroke="rgb(var(--primary-600))" strokeWidth={2} strokeDasharray="6 3" />
            </svg>
          );
        })()}

        <div className="absolute bottom-2 left-3 text-[10px] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] px-2 py-1 rounded">
          点击头像开始连线 · 再点另一个完成 · 点击线编辑
        </div>
      </div>

      <div className={`${listCollapsed ? 'hidden' : 'w-[260px]'} flex-shrink-0`}>
        <RelationshipList
          relationships={relationships.filter((r) => r.source_type === 'character' && r.target_type === 'character')}
          characterNames={characterNames}
          onEdit={onEdit}
          onDelete={onDeleteRelation}
        />
      </div>

      {/* 导入人物弹窗 */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setImportOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-80 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--color-border))]">
              <h3 className="text-sm font-semibold">导入人物</h3>
              <button className="p-1 rounded hover:bg-[rgb(var(--color-bg))]" onClick={() => setImportOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {charList.length === 0 ? (
                <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center py-4">所有人物已在图谱中</p>
              ) : (
                charList.map((c) => (
                  <button
                    key={c.id}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[rgb(var(--color-bg))] flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setImportedIds((prev) => [...new Set([...prev, c.id])]);
                      setImportOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold flex-shrink-0">
                      {c.avatar_url || c.images?.[0]?.url ? (
                        <img src={c.avatar_url || c.images?.[0]?.url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        c.name?.charAt(0) || '?'
                      )}
                    </div>
                    <span className="text-sm">{c.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
