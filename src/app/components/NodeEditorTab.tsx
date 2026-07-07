import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AILogTicker } from "./AITicker";
import { cn } from "@/lib/utils"; // 使用绝对路径别名
import { ExternalLink, X, ChevronRight, FileText } from "lucide-react";
import useGameStore from "@/store/useGameStore"; // 使用绝对路径别名
import { makeMockData, MOCK_LOGS } from "@/lib/mock-data"; // 使用绝对路径别名
import { CategoryChecklist } from "@/types/database"; // 使用绝对路径别名

type SidebarStatus = "idle" | "scraping" | "active";

interface NodeEditorTabProps {
  node?: {
    id: string;
    title: string;
    focus?: string;
  };
  onSearchRequest?: (params: { nodeTitle: string; query: string }) => Promise<void>;
  onStatusChange?: (status: SidebarStatus) => void;
  onSourceOpen?: (sourceId: string) => void;
  onSourceClose?: () => void;
  onChecklistChange?: (params: { categoryId: string; itemId: string; completed: boolean }) => void;
  className?: string;
}

interface MockDataResult {
  categories: CategoryChecklist[];
  sources: Array<{
    id: string;
    sourceLabel: string;
    title: string;
    excerpt: string;
    body: string;
    origin: string;
    url?: string;
  }>;
}

export function NodeEditorTab({
  node,
  onSearchRequest,
  onStatusChange,
  onSourceOpen,
  onSourceClose,
  onChecklistChange,
  className
}: NodeEditorTabProps) {
  const activeRoadmapNodeId = useGameStore((state: any) => state.activeRoadmapNodeId);
  const dynamicRoadmap = useGameStore((state: any) => state.dynamicRoadmap);
  const focusedNode = node ?? dynamicRoadmap.find((item: any) => item.id === activeRoadmapNodeId) ?? dynamicRoadmap[0] ?? null;
  const nodeTitle = focusedNode?.title ?? "Tier-1 Node";

  const [sidebarStatus, setSidebarStatus] = React.useState<SidebarStatus>("idle");
  const [searchQuery, setSearchQuery] = React.useState(nodeTitle);
  const [activeSourceId, setActiveSourceId] = React.useState<string | null>(null);
  const [openCategoryIds, setOpenCategoryIds] = React.useState<string[]>([]);
  const [inlineEditId, setInlineEditId] = React.useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = React.useState("了解基础概念");
  
  // 使用React.useRef来保存checklists状态，避免切换时丢失
  const checklistsRef = React.useRef<CategoryChecklist[]>(makeMockData(nodeTitle).categories);
  const [checklists, setChecklists] = React.useState<CategoryChecklist[]>(checklistsRef.current);

  const mockData = React.useMemo(() => makeMockData(nodeTitle) as MockDataResult, [nodeTitle]);
  const activeSource = mockData.sources.find((source: any) => source.id === activeSourceId) ?? null;

  // 只在nodeTitle真正改变时才重置状态
  const prevNodeTitleRef = React.useRef(nodeTitle);
  React.useEffect(() => {
    if (prevNodeTitleRef.current !== nodeTitle) {
      setSearchQuery(nodeTitle);
      const newChecklists = makeMockData(nodeTitle).categories;
      checklistsRef.current = newChecklists;
      setChecklists(newChecklists);
      setInlineEditValue("了解基础概念");
      setInlineEditId(null);
      setActiveSourceId(null);
      setSidebarStatus("idle");
      prevNodeTitleRef.current = nodeTitle;
    }
  }, [nodeTitle]);

  React.useEffect(() => {
    const defaultOpen = checklists.filter((category: any) => category.defaultOpen).map((category: any) => category.id);
    setOpenCategoryIds(defaultOpen.length > 0 ? defaultOpen : [checklists[0]?.id].filter(Boolean) as string[]);
  }, [checklists]);

  React.useEffect(() => {
    onStatusChange?.(sidebarStatus);
  }, [onStatusChange, sidebarStatus]);

  const beginSearch = async () => {
    setSidebarStatus("scraping");
    setActiveSourceId(null);
    await onSearchRequest?.({ nodeTitle, query: searchQuery });
  };

  const handleTickerComplete = () => {
    setSidebarStatus("active");
  };

  const handleSourceOpen = (sourceId: string) => {
    setActiveSourceId(sourceId);
    onSourceOpen?.(sourceId);
  };

  const handleSourceClose = () => {
    setActiveSourceId(null);
    onSourceClose?.();
  };

  const updateChecklist = (categoryId: string, itemId: string, completed: boolean) => {
    const updatedChecklists = checklists.map((category: any) =>
      category.id !== categoryId
        ? category
        : {
            ...category,
            items: category.items.map((item: any) => (item.id === itemId ? { ...item, completed } : item)),
          }
    );
    checklistsRef.current = updatedChecklists;
    setChecklists(updatedChecklists);
    onChecklistChange?.({ categoryId, itemId, completed });
  };

  const renderIdleState = () => (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-white/5 backdrop-blur-2xl"
    >
      <div className="border-b border-slate-800/70 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/60">Focused Tier-1 Node</p>
        <h2 className="mt-2 truncate text-lg font-semibold text-slate-50">{nodeTitle}</h2>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-5 p-5">
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <label className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-slate-400">检索目标</label>
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-11 border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:border-cyan-500/60 focus-visible:ring-cyan-500/20"
          />

          <Button
            onClick={beginSearch}
            className="mt-4 h-11 w-full border border-cyan-400/30 bg-cyan-400/15 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.12)] hover:bg-cyan-400/20 hover:text-white"
          >
            [🔍 联网检索相关信息]
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-slate-500">默认子任务</p>
          <button
            type="button"
            onClick={() => setInlineEditId("concept-1")}
            className="flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-cyan-500/20 hover:bg-white/5"
          >
            <span className="mt-0.5 size-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.6)]" />
            <div className="min-w-0 flex-1">
              {inlineEditId === "concept-1" ? (
                <Input
                  value={inlineEditValue}
                  autoFocus
                  onChange={(event) => setInlineEditValue(event.target.value)}
                  onBlur={() => setInlineEditId(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setInlineEditId(null);
                    }
                  }}
                  className="h-9 border-slate-800 bg-slate-900/80 text-slate-100"
                />
              ) : (
                <>
                  <p className="text-sm text-slate-100">{inlineEditValue}</p>
                  <p className="mt-1 text-xs text-slate-500">点击可直接行内编辑。</p>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderLoadingState = () => (
    <motion.div
      key="scraping"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70"
    >
      <div className="border-b border-slate-800/70 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/60">Scraping Context</p>
        <h2 className="mt-2 truncate text-lg font-semibold text-slate-50">{nodeTitle}</h2>
      </div>

      <div className="flex-1 p-4">
        <AILogTicker active entries={MOCK_LOGS} onComplete={handleTickerComplete} />
      </div>
    </motion.div>
  );

  const renderActiveState = () => (
    <motion.div
      key="active"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70"
    >
      <div className="border-b border-slate-800/70 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/60">Active Node</p>
            <h2 className="mt-2 truncate text-lg font-semibold text-slate-50">{nodeTitle}</h2>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-emerald-200">
            Active
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <motion.div
          animate={{ opacity: activeSourceId ? 0 : 1, x: activeSourceId ? -24 : 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className={cn("absolute inset-0 flex min-h-0 flex-col", activeSourceId && "pointer-events-none")}
        >
          <ScrollArea className="flex-1 px-4 py-4">
            <Accordion
              type="multiple"
              value={openCategoryIds}
              onValueChange={(value) => setOpenCategoryIds(value as string[])}
              className="space-y-3"
            >
              {checklists.map((category: any) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="rounded-2xl border border-slate-800/70 bg-slate-900/50 px-4"
                >
                  <AccordionTrigger className="py-4 no-underline hover:no-underline">
                    <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                      <span className="text-sm font-semibold text-slate-100">{category.title}</span>
                      <span className="mt-1 text-xs text-slate-400">{category.summary}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {category.items.map((item: any) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-slate-700 hover:bg-white/5"
                        >
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) => updateChecklist(category.id, item.id, Boolean(checked))}
                            className="mt-1 border-slate-700 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-400"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-100">{item.title}</p>
                            {item.detail ? <p className="mt-1 text-xs text-slate-500">{item.detail}</p> : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>

          <div className="border-t border-slate-800/70 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Sources</p>
                <p className="mt-1 text-xs text-slate-400">点击卡片进入溯源阅读视图。</p>
              </div>
              <ExternalLink className="size-4 text-slate-500" />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {mockData.sources.map((source: any) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => handleSourceOpen(source.id)}
                  className="group flex min-w-[15rem] items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-slate-900"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 text-xs font-semibold text-cyan-100">
                    {source.sourceLabel.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{source.sourceLabel}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-100">{source.title}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{source.excerpt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence initial={false} mode="wait">
          {activeSource ? (
            <motion.div
              key={activeSource.id}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0 flex min-h-0 flex-col bg-slate-950/95"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800/70 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/60">Source Reading</p>
                  <h3 className="mt-2 truncate text-base font-semibold text-slate-50">{activeSource.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{activeSource.origin}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleSourceClose}
                  className="shrink-0 border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
                >
                  <X className="size-4" />
                  [X 返回]
                </Button>
              </div>

              <ScrollArea className="min-h-0 flex-1 px-5 py-4">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800/70 bg-white/5 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Source Citation</p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{activeSource.body}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Excerpt</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{activeSource.excerpt}</p>
                  </div>

                  {activeSource.url ? (
                    <a
                      href={activeSource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-cyan-200 transition-colors hover:text-cyan-100"
                    >
                      <FileText className="size-4" />
                      打开原始来源
                    </a>
                  ) : null}
                </div>
              </ScrollArea>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col gap-4 bg-slate-950 px-4 py-4 text-slate-200",
        className
      )}
    >
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Current Node</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <ChevronRight className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-50">{nodeTitle}</h1>
            <p className="truncate text-xs text-slate-500">{focusedNode?.focus ?? "聚焦当前 Tier-1 Node 的检索、整理和溯源。"}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {sidebarStatus === "idle" ? renderIdleState() : null}
          {sidebarStatus === "scraping" ? renderLoadingState() : null}
          {sidebarStatus === "active" ? renderActiveState() : null}
        </AnimatePresence>
      </div>

      {sidebarStatus === "idle" ? null : (
        <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-slate-500">
          <span>Status</span>
          <span>{sidebarStatus}</span>
        </div>
      )}
    </section>
  );
}