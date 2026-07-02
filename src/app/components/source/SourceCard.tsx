import type { Source } from '../../../types/source';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { formatSourceDate, getSourceStatusClassName } from './sourceUtils';

interface SourceCardProps {
  source: Source;
  active: boolean;
  onSelect: (sourceId: string) => void;
}

export function SourceCard({ source, active, onSelect }: SourceCardProps) {
  return (
    <button type="button" className="w-full text-left" onClick={() => onSelect(source.id)}>
      <Card
        className={cn(
          'border-slate-800 bg-slate-900/55 p-3 transition-colors hover:border-cyan-400/35 hover:bg-slate-900',
          active && 'border-cyan-400/40 bg-cyan-400/10'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-slate-100">{source.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{formatSourceDate(source.createdAt)}</p>
          </div>
          <Badge className={cn('shrink-0 border text-[10px] capitalize', getSourceStatusClassName(source.status))}>
            {source.status}
          </Badge>
        </div>
      </Card>
    </button>
  );
}
