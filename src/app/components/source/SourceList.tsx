import * as React from 'react';
import { FileText } from 'lucide-react';

import useSourceStore from '../../../store/useSourceStore';
import { ScrollArea } from '../ui/scroll-area';
import { SourceCard } from './SourceCard';
import { SourceCreateModal } from './SourceCreateModal';

export function SourceList() {
  const sources = useSourceStore((state) => state.sources);
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId);
  const setSelectedSourceId = useSourceStore((state) => state.setSelectedSourceId);
  const fetchSources = useSourceStore((state) => state.fetchSources);

  React.useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  return (
    <section className="flex min-h-0 flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Sources</p>
          <h2 className="mt-1 truncate text-sm font-semibold text-slate-100">Source Management</h2>
        </div>
        <FileText className="size-4 shrink-0 text-cyan-200/70" />
      </div>

      <SourceCreateModal />

      <ScrollArea className="min-h-0 flex-1 pr-3">
        <div className="space-y-2">
          {sources.length > 0 ? (
            sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                active={source.id === selectedSourceId}
                onSelect={setSelectedSourceId}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
              No sources yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
