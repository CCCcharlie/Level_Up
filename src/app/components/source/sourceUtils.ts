import type { SourceStatus } from '../../../types/source';

export const formatSourceDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getSourceStatusClassName = (status: SourceStatus) => {
  switch (status) {
    case 'completed':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
    case 'processing':
      return 'border-blue-400/30 bg-blue-400/10 text-blue-200';
    case 'error':
      return 'border-red-400/30 bg-red-400/10 text-red-200';
    case 'pending':
    default:
      return 'border-yellow-400/30 bg-yellow-400/10 text-yellow-200';
  }
};

export const countWords = (content: string) => {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return 0;
  }

  return normalizedContent.split(/\s+/).filter(Boolean).length;
};

export const createFallbackTitle = (content: string) => {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  return normalizedContent.slice(0, 15) || 'Untitled Source';
};
