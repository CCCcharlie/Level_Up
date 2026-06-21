"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, ExternalLink, FileText, Sparkles, X } from "lucide-react";

import useGameStore, { type RoadmapNode } from "../../store/useGameStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";

export type SidebarStatus = "idle" | "scraping" | "active";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  detail?: string;
}

export interface CategoryChecklist {
  id: string;
  title: string;
  summary: string;
  defaultOpen?: boolean;
  items: ChecklistItem[];
}

export interface SourceCitation {
  id: string;
  sourceLabel: string;
  title: string;
  excerpt: string;
  body: string;
  origin: string;
  url?: string;
}

interface NodeSidebarProps {
  className?: string;
  node?: RoadmapNode | null;
  onSearchRequest?: (payload: { nodeTitle: string; query: string }) => void | Promise<void>;
  onStatusChange?: (status: SidebarStatus) => void;
  onSourceOpen?: (sourceId: string) => void;
  onSourceClose?: () => void;
  onChecklistChange?: (payload: { categoryId: string; itemId: string; completed: boolean }) => void;
}

const MOCK_LOGS = [
  "🔍 正在检索大厂面经...",
  "🤖 正在提取核心考点...",
  "📚 正在聚合高频知识点与溯源材料...",
  "🧭 正在整理当前 Tier-1 Node 的学习边界...",
];

const makeMockData = (nodeTitle: string): {
  categories: CategoryChecklist[];
  sources: SourceCitation[];
} => ({
  categories: [
    {
      id: "core-concepts",
      title: "核心概念",
      summary: "先把定义、边界和关键术语钉牢。",
      defaultOpen: true,
      items: [
        { id: "concept-1", title: "了解基础概念", completed: false, detail: `围绕 ${nodeTitle} 建立第一层认知。` },
        { id: "concept-2", title: "梳理术语与边界", completed: true, detail: "把相关概念分清，避免混淆。" },
        { id: "concept-3", title: "找到典型应用场景", completed: false, detail: "知道它解决什么问题。" },
      ],
    },
    {
      id: "practice",
      title: "实战推演",
      summary: "把抽象概念映射到行为和结果。",
      items: [
        { id: "practice-1", title: "复盘一个真实案例", completed: false, detail: "从输入、处理到输出完整走一遍。" },
        { id: "practice-2", title: "整理面试高频问答", completed: false, detail: "优先覆盖最容易被追问的部分。" },
      ],
    },
    {
      id: "source-reading",
      title: "溯源阅读",
      summary: "把结论和资料来源一一对齐。",
      items: [
        { id: "source-1", title: "对照原文确认结论", completed: true, detail: "确保卡片摘要不是断章取义。" },
        { id: "source-2", title: "补充个人笔记", completed: false, detail: "记录你自己的理解和疑问。" },
      ],
    },
  ],
  sources: [
    {
      id: "juejin",
      sourceLabel: "掘金",
      title: `${nodeTitle} 响应式机制与实践拆解`,
      excerpt: "从核心原理、常见陷阱到工程实践，适合快速建立知识地图。",
      body:
        "这是一段用于 mock 的溯源文本。点击胶囊卡片后，主视图会切换到阅读模式。你可以在这里接入真实文章正文、段落高亮、引用锚点和全文检索。",
      origin: "掘金专栏",
      url: "https://juejin.cn/",
    },
    {
      id: "zhihu",
      sourceLabel: "知乎",
      title: `${nodeTitle} 的本质是什么`,
      excerpt: "从概念层解释它为何存在，以及和相邻概念的差异。",
      body:
        "这里是第二条 mock 溯源内容。可替换为真实 API 返回的全文、摘录、页内锚点和引用编号，保留当前阅读态的滚动位置。",
      origin: "知乎回答",
      url: "https://www.zhihu.com/",
    },
    {
      id: "mdn",
      sourceLabel: "MDN",
      title: `${nodeTitle} 的标准定义与兼容性`,
      excerpt: "用于补强标准定义、浏览器行为和实现细节。",
      body:
        "这里展示标准类资料的 mock 读物。真实接入时可以切换为规范摘要、代码片段和术语解释，形成 NotebookLM 风格的知识阅读面板。",
      origin: "MDN 文档",
      url: "https://developer.mozilla.org/",
    },
  ],
});

function AILogTicker({
  active,
  entries,
  onComplete,
}: {
  active: boolean;
  entries: string[];
  onComplete?: () => void;
}) {
  const [visibleLogs, setVisibleLogs] = React.useState<string[]>([]);
  const [typingLine, setTypingLine] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (!active) {
      setVisibleLogs([]);
      setTypingLine("");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const clearAll = () => {
      while (timers.length > 0) {
        const timer = timers.pop();
        if (typeof timer === "number") {
          window.clearTimeout(timer);
        }
      }
    };

    const typeLine = (lineIndex: number) => {
      const text = entries[lineIndex];
      let charIndex = 0;

      const tick = () => {
        if (cancelled) {
          return;
        }

        charIndex += 1;
        setTypingLine(text.slice(0, charIndex));

        if (charIndex < text.length) {
          timers.push(window.setTimeout(tick, 24));
          return;
        }

        timers.push(
          window.setTimeout(() => {
            if (cancelled) {
              return;
            }

            setVisibleLogs((current) => [...current, text]);
            setTypingLine("");

            if (lineIndex + 1 >= entries.length) {
              timers.push(
                window.setTimeout(() => {
                  if (!cancelled) {
                    onCompleteRef.current?.();
                  }
                }, 700)
              );
              return;
            }

            timers.push(window.setTimeout(() => typeLine(lineIndex + 1), 220));
          }, 260)
        );
      };

      tick();
    };

    setVisibleLogs([]);
    setTypingLine("");
    timers.push(window.setTimeout(() => typeLine(0), 220));

    return () => {
      cancelled = true;
      clearAll();
    };
  }, [active, entries]);

  React.useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [visibleLogs, typingLine]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-auto rounded-2xl border border-cyan-500/15 bg-slate-950/90 p-4 shadow-[0_0_40px_rgba(2,132,199,0.08)]"
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">AI Work Log</p>
          <p className="mt-1 text-sm text-slate-300">NotebookLM 式检索流正在构建上下文。</p>
        </div>
        <Sparkles className="size-4 text-cyan-300/80" />
      </div>

      <div className="space-y-3 font-mono text-xs text-slate-300">
        {visibleLogs.map((line) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2"
          >
            {line}
          </motion.div>
        ))}

        {typingLine ? (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-cyan-100"
          >
            <span>{typingLine}</span>
            <span className="ml-1 inline-block h-4 w-[1px] animate-pulse bg-cyan-200 align-middle" />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export function NodeSidebar({
  className,
  node,
  onSearchRequest,
  onStatusChange,
  onSourceOpen,
  onSourceClose,
  onChecklistChange,
}: NodeSidebarProps) {
  const activeRoadmapNodeId = useGameStore((state) => state.activeRoadmapNodeId);
  const dynamicRoadmap = useGameStore((state) => state.dynamicRoadmap);
  const focusedNode = node ?? dynamicRoadmap.find((item) => item.id === activeRoadmapNodeId) ?? dynamicRoadmap[0] ?? null;
  const nodeTitle = focusedNode?.title ?? "Tier-1 Node";

  const [sidebarStatus, setSidebarStatus] = React.useState<SidebarStatus>("idle");
  const [searchQuery, setSearchQuery] = React.useState(nodeTitle);
  const [activeSourceId, setActiveSourceId] = React.useState<string | null>(null);
  const [openCategoryIds, setOpenCategoryIds] = React.useState<string[]>([]);
  const [inlineEditId, setInlineEditId] = React.useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = React.useState("了解基础概念");
  const [checklists, setChecklists] = React.useState<CategoryChecklist[]>(() => makeMockData(nodeTitle).categories);

  const mockData = React.useMemo(() => makeMockData(nodeTitle), [nodeTitle]);
  const activeSource = mockData.sources.find((source) => source.id === activeSourceId) ?? null;

  React.useEffect(() => {
    setSearchQuery(nodeTitle);
    setChecklists(makeMockData(nodeTitle).categories);
    setInlineEditValue("了解基础概念");
    setInlineEditId(null);
    setActiveSourceId(null);
    setSidebarStatus("idle");
  }, [nodeTitle]);

  React.useEffect(() => {
    const defaultOpen = checklists.filter((category) => category.defaultOpen).map((category) => category.id);
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
    setChecklists((current) =>
      current.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: category.items.map((item) => (item.id === itemId ? { ...item, completed } : item)),
            }
      )
    );
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
              {checklists.map((category) => (
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
                      {category.items.map((item) => (
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
              {mockData.sources.map((source) => (
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

export default NodeSidebar;
