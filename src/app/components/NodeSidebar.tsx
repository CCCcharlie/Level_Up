"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AILogTicker } from "./AITicker";
import { cn } from "@/lib/utils";  // 使用绝对路径别名
import { ExternalLink, X, ChevronRight, FileText } from "lucide-react";
import useGameStore from "@/store/useGameStore";  // 使用绝对路径别名
import { makeMockData, MOCK_LOGS } from "@/lib/mock-data";  // 使用绝对路径别名
import { CategoryChecklist } from "../types/database";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { NodeEditorTab } from "./NodeEditorTab";
import { SourceManagerTab } from "./SourceManagerTab";

type SidebarStatus = "idle" | "scraping" | "active";

interface NodeSidebarProps {
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

export function NodeSidebar({
  className,
  node,
  onSearchRequest,
  onStatusChange,
  onSourceOpen,
  onSourceClose,
  onChecklistChange,
}: NodeSidebarProps) {
  return (
    <Tabs defaultValue="current-node" className="flex h-full w-full flex-col">
      <TabsList className="grid w-full grid-cols-2 bg-slate-900/80">
        <TabsTrigger value="current-node" className="data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-100">
          Current Node
        </TabsTrigger>
        <TabsTrigger value="sources" className="data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-100">
          Sources
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="current-node" className="flex-1 overflow-hidden p-0 mt-0">
        <NodeEditorTab
          className={className}
          node={node}
          onSearchRequest={onSearchRequest}
          onStatusChange={onStatusChange}
          onSourceOpen={onSourceOpen}
          onSourceClose={onSourceClose}
          onChecklistChange={onChecklistChange}
        />
      </TabsContent>
      
      <TabsContent value="sources" className="flex-1 overflow-hidden p-0 mt-0">
        <SourceManagerTab className={className} />
      </TabsContent>
    </Tabs>
  );
}