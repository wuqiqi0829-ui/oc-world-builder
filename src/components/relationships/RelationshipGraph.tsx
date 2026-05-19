import { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useRelationships } from '@/stores/relationships';
import type { Character, Organization, Location } from '@/lib/database';
import EmptyState from '@/components/ui/EmptyState';
import { GitBranch } from 'lucide-react';

const nodeColors: Record<string, string> = {
  character: '#7C5CBF',
  organization: '#E85D75',
  location: '#4CAF50',
};

const relationLabels: Record<string, string> = {
  friend: '亲友', enemy: '敌对', mentor: '师徒', lover: '恋人',
  colleague: '同僚', belong: '所属', located: '位于', other: '其他',
};

interface Props {
  worldId: string;
  characters: Character[];
  organizations: Organization[];
  locations: Location[];
  onCreate: (sourceType: string, sourceId: string) => void;
  onDeleteRelation: (id: string) => void;
}

export default function RelationshipGraph({ worldId: _worldId, characters, organizations, locations, onCreate, onDeleteRelation }: Props) {
  const { relationships } = useRelationships();

  const entityMap = useMemo(() => {
    const map: Record<string, { name: string; type: string }> = {};
    characters.forEach((c) => { map[c.id] = { name: c.name, type: 'character' }; });
    organizations.forEach((o) => { map[o.id] = { name: o.name, type: 'organization' }; });
    locations.forEach((l) => { map[l.id] = { name: l.name, type: 'location' }; });
    return map;
  }, [characters, organizations, locations]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const addedNodes = new Set<string>();
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add participating entities as nodes
    for (const rel of relationships) {
      for (const [entityId, entityType] of [[rel.source_id, rel.source_type], [rel.target_id, rel.target_type]]) {
        if (!addedNodes.has(entityId as string) && entityMap[entityId as string]) {
          const info = entityMap[entityId as string];
          addedNodes.add(entityId as string);
          nodes.push({
            id: entityId as string,
            type: 'default',
            position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
            data: {
              label: (
                <div className="px-3 py-2 rounded-card border-2 shadow-sm text-xs font-medium"
                  style={{ borderColor: nodeColors[entityType as string] || '#999', backgroundColor: 'rgb(var(--color-surface))' }}>
                  <div style={{ color: nodeColors[entityType as string] || '#999', fontSize: '9px' }}>
                    {{ character: '人物', organization: '组织', location: '地点' }[entityType as string]}
                  </div>
                  {info.name}
                </div>
              ),
            },
            style: { background: 'transparent', border: 'none' },
          });
        }
      }

      // Add edge
      if (entityMap[rel.source_id] && entityMap[rel.target_id]) {
        edges.push({
          id: rel.id,
          source: rel.source_id,
          target: rel.target_id,
          label: relationLabels[rel.relation_type] || rel.relation_type || '关联',
          animated: false,
          style: { stroke: nodeColors[rel.source_type] || '#999', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors[rel.source_type] || '#999' },
          labelStyle: { fontSize: 10, fill: 'rgb(var(--color-text-secondary))' },
          labelBgStyle: { fill: 'rgb(var(--color-surface))', fillOpacity: 0.9 },
        });
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [relationships, entityMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    const entityType = entityMap[node.id]?.type;
    if (entityType) onCreate(entityType, node.id);
  }, [entityMap, onCreate]);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    if (confirm('删除这条关系？')) onDeleteRelation(edge.id);
  }, [onDeleteRelation]);

  if (relationships.length === 0) {
    return (
      <EmptyState
        icon={<GitBranch size={48} />}
        title="还没有关系连线"
        description="右键点击图谱中的节点添加关系，或通过人物/组织详情页添加关联"
      />
    );
  }

  return (
    <div className="h-[500px] rounded-card border border-[rgb(var(--color-border))] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="rgb(var(--color-border))" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const info = entityMap[n.id];
            return info ? nodeColors[info.type] || '#999' : '#999';
          }}
          style={{ backgroundColor: 'rgb(var(--color-surface))' }}
        />
      </ReactFlow>
      <div className="absolute bottom-2 right-2 text-[10px] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] px-2 py-1 rounded">
        右键节点添加关系 · 右键连线删除
      </div>
    </div>
  );
}
