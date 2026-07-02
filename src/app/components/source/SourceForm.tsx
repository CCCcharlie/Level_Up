import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import type { Source, SourceType } from '../../../types/source';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { countWords, createFallbackTitle } from './sourceUtils';

export interface SourceFormValues {
  title: string;
  type: SourceType;
  rawContent: string;
}

interface SourceFormProps {
  source?: Source;
  submitLabel: string;
  onSubmit: (values: SourceFormValues) => void;
  onCancel?: () => void;
}

export function SourceForm({ source, submitLabel, onSubmit, onCancel }: SourceFormProps) {
  const [title, setTitle] = React.useState(source?.title ?? '');
  const [type, setType] = React.useState<SourceType>(source?.type ?? 'text');
  const [rawContent, setRawContent] = React.useState(source?.rawContent ?? '');
  const [error, setError] = React.useState<string | null>(null);

  const wordCount = React.useMemo(() => countWords(rawContent), [rawContent]);
  const characterCount = rawContent.length;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = rawContent.trim();
    if (!trimmedContent) {
      setError('Content cannot be empty.');
      return;
    }

    onSubmit({
      title: title.trim() || createFallbackTitle(trimmedContent),
      type,
      rawContent: trimmedContent,
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="source-title">Title</Label>
        <Input
          id="source-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={createFallbackTitle(rawContent)}
          className="border-border bg-background text-foreground"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="source-type">Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as SourceType)}>
          <SelectTrigger id="source-type" className="border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="url">URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="source-content">Content</Label>
        <div className="relative">
          <Textarea
            id="source-content"
            value={rawContent}
            onChange={(event) => {
              setRawContent(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="Paste text, Markdown, or URL content here..."
            className="min-h-[18rem] resize-y border-border bg-background pb-8 text-foreground"
            aria-invalid={Boolean(error)}
          />
          <div className="pointer-events-none absolute bottom-2 right-3 rounded bg-background/85 px-2 py-1 text-xs text-muted-foreground">
            {wordCount} words · {characterCount} chars
          </div>
        </div>
        {error ? (
          <p className="flex items-center gap-2 text-sm text-red-300">
            <AlertCircle className="size-4" />
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
