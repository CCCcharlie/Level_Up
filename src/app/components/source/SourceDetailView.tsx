import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';

import type { Source } from '../../../types/source';
import useSourceStore from '../../../store/useSourceStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { cn } from '../ui/utils';
import { SourceForm, type SourceFormValues } from './SourceForm';
import { formatSourceDate, getSourceStatusClassName } from './sourceUtils';

interface SourceDetailViewProps {
  source: Source | null;
  onReExtract?: (source: Source) => void;
}

export function SourceDetailView({ source, onReExtract }: SourceDetailViewProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const updateSource = useSourceStore((state) => state.updateSource);
  const deleteSource = useSourceStore((state) => state.deleteSource);

  React.useEffect(() => {
    setIsEditOpen(false);
  }, [source?.id]);

  if (!source) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-md border-slate-800 bg-slate-900/40 p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-100">Select a source</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Choose a source from the sidebar or create a new one to review its content.
          </p>
        </Card>
      </div>
    );
  }

  const handleEditSubmit = (values: SourceFormValues) => {
    updateSource(source.id, values);
    setIsEditOpen(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/70 px-6 py-5">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={cn('border capitalize', getSourceStatusClassName(source.status))}>{source.status}</Badge>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {source.type}
            </Badge>
            <span className="text-xs text-slate-500">{formatSourceDate(source.createdAt)}</span>
          </div>
          <h1 className="truncate text-xl font-semibold text-slate-50">{source.title}</h1>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-blue-400/25 bg-blue-400/10 text-blue-100 hover:bg-blue-400/15"
            onClick={() => onReExtract?.(source)}
          >
            <RefreshCw className="size-4" />
            Re-extract
          </Button>
          <Button variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-100" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border bg-background text-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this source?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the source content from the current workspace state.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => deleteSource(source.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {source.type === 'markdown' ? (
          <div className="prose prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-950/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{source.rawContent}</ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm leading-7 text-slate-200">
            {source.rawContent}
          </pre>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden border-border bg-background text-foreground sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Source</DialogTitle>
            <DialogDescription>Update title, type, or raw content.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-1">
            <SourceForm
              source={source}
              submitLabel="Save Changes"
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
