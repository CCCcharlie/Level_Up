import * as React from "react";
import { FileText } from "lucide-react";
import { SourceList } from "./source/SourceList";
import { SourceCreateModal } from "./source/SourceCreateModal";
import { Source } from "./source/types"; // 假设 Source 类型定义在 types.ts 文件中

interface SourceManagerTabProps {
  className?: string;
}

export function SourceManagerTab({ className }: SourceManagerTabProps) {
  return (
    <section className={`flex h-full min-h-0 flex-col gap-4 bg-slate-950 px-4 py-4 text-slate-200 ${className}`}>
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Knowledge Sources</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-50">Source Management</h1>
            <p className="truncate text-xs text-slate-500">Manage all knowledge sources for learning and reference.</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <SourceCreateModal />
        
        <div className="mt-4 flex h-full min-h-0 flex-col">
          <SourceList />
        </div>
      </div>
    </section>
  );
}