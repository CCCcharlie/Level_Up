import { create } from 'zustand';
import type { Source, SourceStatus, SourceType } from '../types/source';

export interface SourceDraft {
  title?: string;
  type?: SourceType;
  rawContent: string;
  status?: SourceStatus;
}

export interface SourceUpdate {
  title?: string;
  type?: SourceType;
  rawContent?: string;
  status?: SourceStatus;
}

interface SourceStore {
  sources: Source[];
  selectedSourceId: string | null;
  isLoading: boolean;
  fetchSources: () => Promise<void>;
  addSource: (draft: SourceDraft) => Source;
  deleteSource: (sourceId: string) => void;
  updateSource: (sourceId: string, update: SourceUpdate) => void;
  setSelectedSourceId: (sourceId: string | null) => void;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `source-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createTitleFromContent = (content: string) => {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  return normalizedContent.slice(0, 15) || 'Untitled Source';
};

const initialSources: Source[] = [
  {
    id: 'mock-source-react-18',
    title: 'React 18 Notes',
    type: 'markdown',
    rawContent:
      '# React 18 Notes\n\nConcurrent rendering lets React interrupt and resume rendering work. Use transitions for non-urgent UI updates.\n\n- Keep urgent input responsive\n- Mark heavy navigation as a transition\n- Prefer predictable state boundaries',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    status: 'completed',
  },
];

export const useSourceStore = create<SourceStore>((set, get) => ({
  sources: initialSources,
  selectedSourceId: initialSources[0]?.id ?? null,
  isLoading: false,

  fetchSources: async () => {
    set({ isLoading: true });
    set({ isLoading: false });
  },

  addSource: (draft) => {
    const now = Date.now();
    const source: Source = {
      id: createId(),
      title: draft.title?.trim() || createTitleFromContent(draft.rawContent),
      type: draft.type ?? 'text',
      rawContent: draft.rawContent,
      createdAt: now,
      updatedAt: now,
      status: draft.status ?? 'pending',
    };

    set((state) => ({
      sources: [source, ...state.sources],
      selectedSourceId: source.id,
    }));

    return source;
  },

  deleteSource: (sourceId) => {
    set((state) => {
      const nextSources = state.sources.filter((source) => source.id !== sourceId);
      const nextSelectedSourceId =
        state.selectedSourceId === sourceId ? nextSources[0]?.id ?? null : state.selectedSourceId;

      return {
        sources: nextSources,
        selectedSourceId: nextSelectedSourceId,
      };
    });
  },

  updateSource: (sourceId, update) => {
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === sourceId
          ? {
              ...source,
              ...update,
              title:
                update.title !== undefined
                  ? update.title.trim() || createTitleFromContent(update.rawContent ?? source.rawContent)
                  : source.title,
              updatedAt: Date.now(),
            }
          : source
      ),
    }));
  },

  setSelectedSourceId: (sourceId) => {
    const exists = sourceId === null || get().sources.some((source) => source.id === sourceId);
    if (exists) {
      set({ selectedSourceId: sourceId });
    }
  },
}));

export default useSourceStore;
