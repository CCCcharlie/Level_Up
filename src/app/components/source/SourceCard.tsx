import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";  // 使用绝对路径别名
import { MoreVertical, Edit3, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import useSourceStore from "@/store/useSourceStore"; // 使用绝对路径别名
import { formatSourceDate, getSourceStatusClassName } from "./sourceUtils";
import { Checkbox } from "../ui/checkbox";

interface SourceCardProps {
  source: {
    id: string;
    title: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    createdAt: number;
    updatedAt: number;
  };
  active: boolean;
  onSelect: (id: string) => void;
  isSelected?: boolean;  // 是否被选中
  onToggleSelect?: () => void;  // 切换选择状态的回调
}

export function SourceCard({ source, active, onSelect, isSelected, onToggleSelect }: SourceCardProps) {
  const deleteSource = useSourceStore((state) => state.deleteSource);
  const updateSource = useSourceStore((state) => state.updateSource);
  
  const handleRename = () => {
    const newTitle = prompt("请输入新的标题:", source.title);
    if (newTitle && newTitle.trim() !== source.title) {
      updateSource(source.id, { title: newTitle.trim() });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`确定要删除 "${source.title}" 吗？`)) {
      deleteSource(source.id);
    }
  };

  return (
    <Card
      className={cn(
        'border-slate-800 bg-slate-900/55 p-3 transition-colors hover:border-cyan-400/35 hover:bg-slate-900',
        active && 'border-cyan-400/40 bg-cyan-400/10',
        isSelected && 'ring-2 ring-cyan-500/50 border-cyan-500/50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {onToggleSelect ? (
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="mt-1 border-slate-700 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-400"
            />
            <div className="flex-1">
              <button 
                type="button" 
                className="flex-1 text-left"
                onClick={() => onSelect(source.id)}
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-slate-100">{source.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{formatSourceDate(source.createdAt)}</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            className="flex-1 text-left"
            onClick={() => onSelect(source.id)}
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-slate-100">{source.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{formatSourceDate(source.createdAt)}</p>
            </div>
          </button>
        )}
        <Badge className={cn('shrink-0 border text-[10px] capitalize', getSourceStatusClassName(source.status))}>
          {source.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md hover:bg-slate-800">
              <MoreVertical className="size-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-slate-800 border-slate-700">
            <DropdownMenuItem 
              className="cursor-pointer text-amber-200 hover:bg-amber-900/30 focus:bg-amber-900/30"
              onClick={handleRename}
            >
              <Edit3 className="mr-2 size-4" />
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-300 hover:bg-red-900/30 focus:bg-red-900/30"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 size-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}