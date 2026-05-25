import { useState, useEffect, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { shareApi } from '@/lib/db';
import { ReadOnlyProvider } from '@/contexts/ReadOnlyContext';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import WorldSelector from '@/components/worlds/WorldSelector';
import PreviewModal from '@/components/ui/PreviewModal';
import WorldPreview from '@/components/worlds/WorldPreview';
import CharacterList from '@/components/characters/CharacterList';
import CharacterPreview from '@/components/characters/CharacterPreview';
import TimelineView from '@/components/timeline/TimelineView';
import TimelineEventPreview from '@/components/timeline/TimelineEventPreview';
import TimelineList from '@/components/timeline/TimelineList';
import MapView from '@/components/map/MapView';
import LocationPreview from '@/components/map/LocationPreview';
import RaceClassView from '@/components/categories/RaceClassView';
import RaceClassPreview from '@/components/categories/RaceClassPreview';
import OrgPowerView from '@/components/organizations/OrgPowerView';
import OrgPowerPreview from '@/components/organizations/OrgPowerPreview';
import RelationshipGraph from '@/components/relationships/RelationshipGraph';
import RelationshipPreview from '@/components/relationships/RelationshipPreview';
import StorylineList from '@/components/storylines/StorylineList';
import ChapterPreview from '@/components/storylines/ChapterPreview';
import ItemsView from '@/components/items/ItemsView';
import ItemPreview from '@/components/items/ItemPreview';
import IllustrationGallery from '@/components/illustrations/IllustrationGallery';
import TablesView from '@/components/tables/TablesView';
import NotesView from '@/components/notes/NotesView';
import { useWorlds } from '@/stores/worlds';
import { useCharacters } from '@/stores/characters';
import { useTimeline } from '@/stores/timeline';
import { useLocations } from '@/stores/locations';
import { useCategories } from '@/stores/categories';
import { useRelationships } from '@/stores/relationships';
import { useStorylines } from '@/stores/storylines';
import { useBooks } from '@/stores/books';
import { useItems } from '@/stores/items';
import { useIllustrations } from '@/stores/illustrations';
import { useTables } from '@/stores/tables';
import { Globe, Loader2 } from 'lucide-react';

function SharedContent() {
  const [activeModule, setActiveModule] = useState('characters');
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState<ReactNode>(null);
  const [previewText, setPreviewText] = useState('');
  const [showAllWorlds, setShowAllWorlds] = useState(true);

  const { worlds, fetchWorlds } = useWorlds();
  const { characters, fetch: fetchChars } = useCharacters();
  const { events, timelines: allTimelines, activeTimelineId, fetchTimelines, fetch: fetchTimeline } = useTimeline();
  const { locations, fetch: fetchLocations } = useLocations();
  const { categories, entries, fetchCategories } = useCategories();
  const { relationships, fetch: fetchRels } = useRelationships();
  const { fetch: fetchStorylines } = useStorylines();
  const { items, fetch: fetchItems } = useItems();
  const { fetch: fetchIllustrations } = useIllustrations();
  const { fetch: fetchTables } = useTables();

  useEffect(() => { fetchWorlds(); fetchTables(); }, []);

  useEffect(() => {
    if (activeWorldId) {
      fetchChars(activeWorldId);
      fetchTimelines(activeWorldId);
      fetchLocations(activeWorldId);
      fetchCategories(activeWorldId);
      fetchRels(activeWorldId);
      fetchStorylines(activeWorldId);
      useBooks.getState().fetchBooks();
      fetchItems(activeWorldId);
      fetchIllustrations(activeWorldId);
    }
  }, [activeWorldId]);

  useEffect(() => {
    if (activeWorldId && activeTimelineId) fetchTimeline(activeWorldId);
  }, [activeWorldId, activeTimelineId]);

  const openPreview = (title: string, content: ReactNode, text: string) => {
    setPreviewTitle(title);
    setPreviewContent(content);
    setPreviewText(text);
    setPreviewOpen(true);
  };

  return (
    <Layout
      worlds={worlds}
      activeWorldId={activeWorldId}
      onSelectWorld={(id) => { setActiveWorldId(id); setShowAllWorlds(false); }}
      onDeleteWorld={() => {}}
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      drawerOpen={false}
      drawerTitle=""
      onCloseDrawer={() => {}}
      onShowAllWorlds={() => setShowAllWorlds(true)}
      drawerContent={null}
    >
      {showAllWorlds || !activeWorldId ? (
        <WorldSelector
          worlds={worlds}
          onSelect={(id) => { setActiveWorldId(id); setShowAllWorlds(false); }}
          onNew={() => {}}
          onReorder={() => {}}
          onPreview={(id) => {
            const w = worlds.find(x => x.id === id);
            if (w) openPreview(w.name, <WorldPreview world={w} />, w.description || '');
          }}
        />
      ) : activeModule === 'characters' ? (
        <div className="p-6">
          <CharacterList characters={characters} activeId={null}
            onSelect={(id) => {
              const c = characters.find(x => x.id === id);
              if (c) openPreview(c.name, <CharacterPreview character={c} />, [c.appearance,c.personality,c.background,c.abilities].join(''));
            }}
            onCreate={() => {}} />
        </div>
      ) : activeModule === 'timeline' ? (
        <div className="flex h-full">
          <div className="p-4">
            <TimelineList worldId={activeWorldId!} compareIds={[]} onToggleCompare={() => {}} onStartCompare={async () => {}} />
          </div>
          <div className="flex-1 p-6 min-w-0">
            <TimelineView events={events}
              title={allTimelines.find(t => t.id === activeTimelineId)?.name}
              onEdit={() => {}}
              onPreview={(id) => {
                const e = events.find(x => x.id === id);
                if (e) openPreview(e.title, <TimelineEventPreview event={e} />, e.description);
              }} />
          </div>
        </div>
      ) : activeModule === 'map' ? (
        <div className="p-4 h-full">
          <MapView locations={locations} onCreate={() => {}} onEdit={() => {}}
            onPreview={(id) => {
              const l = locations.find(x => x.id === id);
              if (l) openPreview(l.name, <LocationPreview location={l} />, l.description);
            }} worldId={activeWorldId!} />
        </div>
      ) : activeModule === 'categories' ? (
        <RaceClassView worldId={activeWorldId!} onCreateEntry={() => {}}
          onPreviewEntry={(categoryId, entryId) => {
            const catEntries = entries[categoryId] || [];
            const ent = catEntries.find(e => e.id === entryId);
            const cat = categories.find(c => c.id === categoryId);
            if (ent) openPreview(ent.name, <RaceClassPreview entry={ent} typeLabel={cat?.name || ''} />, ent.description || '');
          }} />
      ) : activeModule === 'organizations' ? (
        <OrgPowerView worldId={activeWorldId!} onCreateEntry={() => {}}
          onPreviewEntry={(categoryId, entryId) => {
            const catEntries = entries[categoryId] || [];
            const ent = catEntries.find(e => e.id === entryId);
            const cat = categories.find(c => c.id === categoryId);
            if (ent) openPreview(ent.name, <OrgPowerPreview entry={ent} typeLabel={cat?.name || ''} />, ent.description || '');
          }} />
      ) : activeModule === 'relationships' ? (
        <div className="h-full">
          <RelationshipGraph worldId={activeWorldId!} characters={characters} onCreateNew={() => {}}
            onPreview={(rel) => {
              const srcChar = characters.find(c => c.id === rel.source_id);
              const tgtChar = characters.find(c => c.id === rel.target_id);
              const backward = relationships.find(r => r.source_id === rel.target_id && r.target_id === rel.source_id);
              openPreview(`${srcChar?.name || '?'} ↔ ${tgtChar?.name || '?'}`,
                <RelationshipPreview forward={rel} backward={backward} sourceChar={srcChar} targetChar={tgtChar} />,
                `${srcChar?.name || ''} ${rel.relation_type} ${tgtChar?.name || ''}`);
            }}
            onEdit={() => {}} onDeleteRelation={async () => {}} />
        </div>
      ) : activeModule === 'storylines' ? (
        <div className="p-6">
          <StorylineList worldId={activeWorldId!}
            onPreviewChapter={(_storylineId, _volumeId, chapterId) => {
              const { storylines } = useStorylines.getState();
              const allChapters: any[] = [];
              for (const sl of storylines) {
                const volumes = (sl.chapters || []) as any[];
                for (const vol of volumes) {
                  for (let ci = 0; ci < vol.chapters.length; ci++) {
                    allChapters.push({ ...vol.chapters[ci], _volTitle: vol.title || '', _volId: vol.id, _slId: sl.id, _volChIdx: ci });
                  }
                }
              }
              const globalIdx = allChapters.findIndex((e: any) => e.id === chapterId);
              if (globalIdx >= 0) {
                const ch = allChapters[globalIdx];
                openPreview(`第${ch._volChIdx + 1}章 ${ch.title || ''}`,
                  <ChapterPreview entries={allChapters} initialIndex={globalIdx} />,
                  (ch.brief || '') + (ch.content || ''));
              }
            }}
            onAddChapter={() => {}} onCreate={() => {}} onCreateBook={() => {}} />
        </div>
      ) : activeModule === 'items' ? (
        <div className="p-4">
          <ItemsView worldId={activeWorldId!}
            onPreview={(id) => { const it = items.find(x => x.id === id); if (it) openPreview(it.name, <ItemPreview item={it} />, it.description || ''); }}
            onCreate={() => {}} />
        </div>
      ) : activeModule === 'illustrations' ? (
        <div className="p-4"><IllustrationGallery onEdit={() => {}} onCreate={() => {}} /></div>
      ) : activeModule === 'tables' ? (
        <div className="p-4"><TablesView onEdit={() => {}} onCreate={() => {}} /></div>
      ) : activeModule === 'notes' ? (
        <div className="p-4 h-full"><NotesView worldId={activeWorldId!} /></div>
      ) : null}

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} title={previewTitle} onEdit={() => {}} contentText={previewText}>
        {previewContent}
      </PreviewModal>
    </Layout>
  );
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('无效链接'); setLoading(false); return; }
    shareApi.getByToken(token).then((data) => {
      if (!data) { setError('链接无效或已失效'); } else { setValid(true); }
      setLoading(false);
    }).catch(() => { setError('加载失败'); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  if (error || !valid) return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
      <EmptyState icon={<Globe size={48} />} title="无法访问" description={error || '未知错误'} />
    </div>
  );

  return (
    <ReadOnlyProvider value={true}>
      <SharedContent />
    </ReadOnlyProvider>
  );
}
