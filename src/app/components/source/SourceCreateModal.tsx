import * as React from 'react';
import { Plus } from 'lucide-react';

import useSourceStore from '../../../store/useSourceStore';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { SourceForm, type SourceFormValues } from './SourceForm';

export function SourceCreateModal() {
  const [open, setOpen] = React.useState(false);
  const addSource = useSourceStore((state) => state.addSource);

  const handleSubmit = (values: SourceFormValues) => {
    addSource({
      title: values.title,
      type: values.type,
      rawContent: values.rawContent,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 w-full justify-start bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25">
          <Plus className="size-4" />
          New Source Content
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden border-border bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Source</DialogTitle>
          <DialogDescription>Add raw content for later extraction and review.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-1">
          <SourceForm submitLabel="Create Source" onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
