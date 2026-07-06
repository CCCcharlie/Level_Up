import * as React from "react";
import { FileText, Sparkles, CheckSquare, Tags } from "lucide-react";
import { SourceList } from "./source/SourceList";
import { SourceCreateModal } from "./source/SourceCreateModal";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { AILogTicker } from "./AITicker";
import useSourceStore from "@/store/useSourceStore"; // 使用绝对路径别名
import { cn } from "@/lib/utils";

interface SourceManagerTabProps {
  className?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  type: 'concept' | 'question' | 'practice';
}

interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface ExtractedContent {
  id: string;
  title: string;
  type: 'concept' | 'question' | 'practice';
  content: string;
}

export function SourceManagerTab({ className }: SourceManagerTabProps) {
  const sources = useSourceStore((state) => state.sources);
  const [selectedSourceIds, setSelectedSourceIds] = React.useState<string[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [checklists, setChecklists] = React.useState<ChecklistCategory[]>([]);
  const [extractedContents, setExtractedContents] = React.useState<ExtractedContent[]>([]);
  const [showOriginalContent, setShowOriginalContent] = React.useState(true);
  
  const toggleSelectAll = () => {
    if (selectedSourceIds.length === sources.length) {
      setSelectedSourceIds([]);
    } else {
      setSelectedSourceIds(sources.map(source => source.id));
    }
  };

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSourceIds(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const handleAIProcess = () => {
    if (selectedSourceIds.length === 0) return;
    
    setProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Generate sample checklists
      const newChecklists: ChecklistCategory[] = [
        {
          id: 'category-1',
          title: '基础知识',
          items: [
            { id: 'item-1', title: '理解核心概念', completed: false, type: 'concept' },
            { id: 'item-2', title: '掌握基本原理', completed: false, type: 'concept' }
          ]
        },
        {
          id: 'category-2',
          title: '实践应用',
          items: [
            { id: 'item-3', title: '完成示例练习', completed: false, type: 'practice' },
            { id: 'item-4', title: '解决常见问题', completed: false, type: 'question' }
          ]
        }
      ];
      
      // Generate sample extracted content
      const newExtractedContents: ExtractedContent[] = [
        { id: 'extract-1', title: '核心概念解释', type: 'concept', content: '这是从来源中提取的核心概念...' },
        { id: 'extract-2', title: '实践案例', type: 'practice', content: '这是从来源中提取的实践案例...' }
      ];
      
      setChecklists(newChecklists);
      setExtractedContents(newExtractedContents);
      setProcessing(false);
    }, 2000);
  };

  const updateChecklistItem = (categoryId: string, itemId: string, completed: boolean) => {
    setChecklists(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              items: category.items.map(item => 
                item.id === itemId ? { ...item, completed } : item
              )
            }
          : category
      )
    );
  };

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

      <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <SourceCreateModal />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedSourceIds.length > 0 && selectedSourceIds.length === sources.length}
                onCheckedChange={toggleSelectAll}
                className="border-slate-700 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-400"
              />
              <label htmlFor="select-all" className="text-xs text-slate-400">
                全选
              </label>
            </div>
            
            <Button
              onClick={handleAIProcess}
              disabled={selectedSourceIds.length === 0 || processing}
              className="h-9 bg-indigo-500/15 text-indigo-100 hover:bg-indigo-500/25 disabled:opacity-50"
            >
              <Sparkles className="size-4 mr-2" />
              AI 提炼
            </Button>
          </div>
        </div>
        
        {processing && (
          <div className="mb-4 rounded-2xl border border-cyan-500/15 bg-slate-950/90 p-4">
            <AILogTicker active entries={[
              "正在分析选中的来源...",
              "提取关键概念...",
              "生成学习要点...",
              "整理内容结构..."
            ]} />
          </div>
        )}

        {/* Checklist Section - Appears after AI processing */}
        {checklists.length > 0 && (
          <div className="mb-4 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="size-4 text-cyan-300" />
              <h3 className="font-semibold text-slate-100">学习 Checklist</h3>
            </div>
            
            <Accordion type="multiple" className="space-y-2">
              {checklists.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border border-slate-800/70 rounded-xl">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Tags className="size-4 text-amber-300" />
                      <span className="text-slate-100">{category.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 pl-1">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) => updateChecklistItem(category.id, item.id, Boolean(checked))}
                            className="mt-1 border-slate-700 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-400"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-slate-100">{item.title}</p>
                            <Badge variant="secondary" className="text-[10px] capitalize mt-1">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Extracted Content Section - Appears after AI processing */}
        {extractedContents.length > 0 && (
          <div className="mb-4 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-green-300" />
                <h3 className="font-semibold text-slate-100">提炼内容</h3>
              </div>
            </div>
            
            <ScrollArea className="h-40">
              <div className="space-y-3">
                {extractedContents.map((content) => (
                  <Card key={content.id} className="border-slate-800 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-100">{content.title}</h4>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {content.type}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{content.content}</p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Original Content Toggle */}
        {sources.length > 0 && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginalContent(!showOriginalContent)}
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              {showOriginalContent ? '隐藏' : '显示'} 原始内容
            </Button>
          </div>
        )}

        {/* Original Sources List */}
        {showOriginalContent && (
          <div className="flex h-full min-h-0 flex-col">
            <SourceList />
          </div>
        )}
      </div>
    </section>
  );
}