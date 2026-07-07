import * as React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";  // 使用绝对路径别名
import { MoreVertical, FileText, Sparkles, Tag, Check } from "lucide-react";
import { SourceCard } from "./SourceCard";
import useSourceStore from "@/store/useSourceStore"; // 使用绝对路径别名
import { formatSourceDate, getSourceStatusClassName } from "./sourceUtils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

interface SourceListProps {
  selectedSourceIds?: string[];  // 用于多选模式
  onSelectedSourceIdsChange?: (ids: string[]) => void;  // 选择变化回调
  onAIExtract?: (selectedIds: string[]) => void;  // AI提炼回调
}

export function SourceList({ selectedSourceIds = [], onSelectedSourceIdsChange, onAIExtract }: SourceListProps) {
  const sources = useSourceStore((state) => state.sources);
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId);
  const setSelectedSourceId = useSourceStore((state) => state.setSelectedSourceId);
  const fetchSources = useSourceStore((state) => state.fetchSources);

  React.useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  // 处理全选/取消全选
  const toggleSelectAll = () => {
    if (onSelectedSourceIdsChange) {
      if (selectedSourceIds.length === sources.length) {
        // 如果全部选中，则清空选择
        onSelectedSourceIdsChange([]);
      } else {
        // 否则选中全部
        onSelectedSourceIdsChange(sources.map(source => source.id));
      }
    }
  };

  // 处理单个source的选择/取消选择
  const toggleSourceSelection = (sourceId: string) => {
    if (onSelectedSourceIdsChange) {
      if (selectedSourceIds.includes(sourceId)) {
        // 如果已选中，则移除
        onSelectedSourceIdsChange(selectedSourceIds.filter(id => id !== sourceId));
      } else {
        // 如果未选中，则添加
        onSelectedSourceIdsChange([...selectedSourceIds, sourceId]);
      }
    }
  };

  // 处理AI提炼
  const handleAIExtract = () => {
    if (onAIExtract && selectedSourceIds.length > 0) {
      onAIExtract(selectedSourceIds);
    }
  };

  return (
    <section className="flex min-h-0 flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Sources</p>
          <h2 className="mt-1 truncate text-sm font-semibold text-slate-100">Source Management</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* 全选复选框 */}
          {onSelectedSourceIdsChange && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={sources.length > 0 && selectedSourceIds.length === sources.length}
                onCheckedChange={toggleSelectAll}
                className="border-slate-700 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-400"
              />
              <label htmlFor="select-all" className="text-xs text-slate-400">
                全选
              </label>
            </div>
          )}
          <FileText className="size-4 shrink-0 text-cyan-200/70" />
        </div>
      </div>

      {/* AI 提炼触发按钮 - 只在有选中项目时显示 */}
      {onSelectedSourceIdsChange && selectedSourceIds.length > 0 && onAIExtract && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start border-cyan-500/30 bg-cyan-500/5 text-cyan-200 hover:bg-cyan-500/10"
            onClick={handleAIExtract}
          >
            <Tag className="size-3.5 mr-2" />
            AI 提炼选中内容
          </Button>
        </div>
      )}

      {/* Removed SourceCreateModal from here as requested */}

      <ScrollArea className="min-h-0 flex-1 pr-3">
        <div className="space-y-2">
          {sources.length > 0 ? (
            sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                active={source.id === selectedSourceId}
                onSelect={setSelectedSourceId}
                isSelected={onSelectedSourceIdsChange ? selectedSourceIds.includes(source.id) : undefined}
                onToggleSelect={onSelectedSourceIdsChange ? () => toggleSourceSelection(source.id) : undefined}
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