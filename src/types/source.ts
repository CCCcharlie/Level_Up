export type SourceStatus = 'pending' | 'processing' | 'completed' | 'error';
export type SourceType = 'text' | 'markdown' | 'url';

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  rawContent: string;
  createdAt: number;
  updatedAt: number;
  status: SourceStatus;
}

export interface ExtractedItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  type: 'concept' | 'question' | 'practice';
  source: string;
  completed: boolean;
}

export interface ExtractedCategory {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  items: ExtractedItem[];
  order: number;
}
