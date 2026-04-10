'use client';

import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type WheelEvent } from 'react';
import { type RoadmapNode, type Task, useGameStore } from '../../store/useGameStore';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Target, Flame, CheckCircle, Rocket, Sparkles, Orbit, FlameKindling, BrainCircuit } from 'lucide-react';

type Point = {
  x: number;
  y: number;
};

type PositionedRoadmapNode = RoadmapNode & Point & { depth: number };
type RoadmapEdge = {
  id: string;
  parentId: string;
  childId: string;
  path: string;
};

const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
const SOFT_DRAG_CONSTRAINTS = {
  left: -5000,
  right: 5000,
  top: -5000,
  bottom: 5000,
};

const ROOT_KEY = '__root__';
const NODE_SPACING_X = 520;
const NODE_SPACING_Y = 260;
const PADDING_X = 280;
const PADDING_Y = 220;

const buildRoadmapTreeLayout = (roadmap: RoadmapNode[]) => {
  const indexById = new Map(roadmap.map((node, index) => [node.id, index]));
  const nodeById = new Map<string, RoadmapNode>(roadmap.map((node) => [node.id, node]));
  const childrenMap = new Map<string, RoadmapNode[]>();

  childrenMap.set(ROOT_KEY, []);

  roadmap.forEach((node) => {
    const parentKey = node.parentId && indexById.has(node.parentId) ? node.parentId : ROOT_KEY;
    const siblings = childrenMap.get(parentKey) ?? [];
    siblings.push(node);
    childrenMap.set(parentKey, siblings);
  });

  childrenMap.forEach((children) => {
    children.sort((a, b) => (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0));
  });

  const positionedById = new Map<string, PositionedRoadmapNode>();
  let maxDepth = 0;

  const placeSubtree = (nodeId: string, depth: number, rowStart: number): { rowCenter: number; rowEnd: number } => {
    const node = nodeById.get(nodeId);
    if (!node) {
      return { rowCenter: rowStart, rowEnd: rowStart + 1 };
    }

    const children = childrenMap.get(nodeId) ?? [];
    let rowCenter = rowStart;
    let rowCursor = rowStart;

    if (children.length === 0) {
      rowCursor = rowStart + 1;
    } else {
      const centers: number[] = [];

      children.forEach((child) => {
        const childPlacement = placeSubtree(child.id, depth + 1, rowCursor);
        centers.push(childPlacement.rowCenter);
        rowCursor = childPlacement.rowEnd;
      });

      rowCenter = (centers[0] + centers[centers.length - 1]) / 2;
    }

    maxDepth = Math.max(maxDepth, depth);

    positionedById.set(node.id, {
      ...node,
      depth,
      x: PADDING_X + depth * NODE_SPACING_X,
      y: PADDING_Y + rowCenter * NODE_SPACING_Y,
    });

    return { rowCenter, rowEnd: rowCursor };
  };

  let usedRows = 0;
  const roots = childrenMap.get(ROOT_KEY) ?? [];

  roots.forEach((rootNode) => {
    const rootPlacement = placeSubtree(rootNode.id, 0, usedRows);
    usedRows = rootPlacement.rowEnd + 1;
  });

  const positionedNodes = roadmap
    .map((node) => positionedById.get(node.id))
    .filter((node): node is PositionedRoadmapNode => Boolean(node));

  const edges: RoadmapEdge[] = positionedNodes
    .map((childNode) => {
      if (!childNode.parentId) {
        return null;
      }

      const parentNode = positionedById.get(childNode.parentId);
      if (!parentNode) {
        return null;
      }

      const distanceX = childNode.x - parentNode.x;
      const controlOffset = Math.max(120, Math.min(260, distanceX * 0.42));
      const path = `M ${parentNode.x} ${parentNode.y} C ${parentNode.x + controlOffset} ${parentNode.y}, ${childNode.x - controlOffset} ${childNode.y}, ${childNode.x} ${childNode.y}`;

      return {
        id: `${parentNode.id}->${childNode.id}`,
        parentId: parentNode.id,
        childId: childNode.id,
        path,
      };
    })
    .filter((edge): edge is RoadmapEdge => Boolean(edge));

  return {
    nodes: positionedNodes,
    edges,
    nodeById: positionedById,
    canvasWidth: Math.max(2200, PADDING_X * 2 + (maxDepth + 1) * NODE_SPACING_X + 360),
    canvasHeight: Math.max(1480, PADDING_Y * 2 + Math.max(4, usedRows + 1) * NODE_SPACING_Y),
  };
};

const getNodeTone = (nodeStatus: string, isActiveNode: boolean) => {
  if (isActiveNode) {
    return {
      border: 'border-purple-400/80',
      surface: 'bg-[#0a0b1c]/95',
      halo: 'shadow-[0_0_40px_rgba(168,85,247,0.25)] drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]',
      badge: 'bg-purple-500/15 text-purple-100 border-purple-400/30',
    };
  }

  if (nodeStatus === 'completed') {
    return {
      border: 'border-emerald-400/50',
      surface: 'bg-[#0a1020]/90',
      halo: 'shadow-[0_0_28px_rgba(16,185,129,0.18)]',
      badge: 'bg-emerald-500/10 text-emerald-100 border-emerald-400/30',
    };
  }

  return {
    border: 'border-slate-700/80',
    surface: 'bg-[#090d1a]/85',
    halo: 'shadow-[0_0_24px_rgba(15,23,42,0.45)]',
    badge: 'bg-slate-500/10 text-slate-200 border-slate-500/30',
  };
};

const getTaskLabel = (task: Task) => task.title;

const LearningPathFlow = () => {
  const {
    dynamicRoadmap,
    userTargetLevel,
    activeRoadmapNodeId,
    lastAddedBranchNodeId,
    branchingNodeId,
    branchSuggestions,
    setActiveRoadmapNode,
    setTargetLevel,
    generateBranchSuggestions,
    addBranchToRoadmap,
  } = useGameStore();

  const [branchParentNodeId, setBranchParentNodeId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lastSafeOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const treeLayout = useMemo(() => buildRoadmapTreeLayout(dynamicRoadmap), [dynamicRoadmap]);
  const layoutNodes = treeLayout.nodes;
  const layoutEdges = treeLayout.edges;

  const activeNode = useMemo(() => {
    if (activeRoadmapNodeId) {
      const matchedNode = treeLayout.nodeById.get(activeRoadmapNodeId);
      if (matchedNode) {
        return matchedNode;
      }
    }

    return layoutNodes[0] ?? null;
  }, [activeRoadmapNodeId, layoutNodes, treeLayout.nodeById]);

  useEffect(() => {
    if (!branchSuggestions || branchSuggestions.length === 0) {
      setBranchParentNodeId(null);
    }
  }, [branchSuggestions]);

  const getBranchPanelTone = (branchType?: 'deep_dive' | 'side_quest' | 'speed_run') => {
    if (branchType === 'deep_dive') {
      return {
        border: 'border-cyan-400/65 hover:border-cyan-300',
        halo: 'shadow-[0_0_40px_rgba(34,211,238,0.2)]',
        surface: 'bg-cyan-500/10',
        label: '掌握底层原理',
        icon: <BrainCircuit className="h-4 w-4 text-cyan-300" />,
      };
    }

    if (branchType === 'speed_run') {
      return {
        border: 'border-rose-400/65 hover:border-rose-300',
        halo: 'shadow-[0_0_40px_rgba(251,113,133,0.2)]',
        surface: 'bg-rose-500/10',
        label: '大厂面试必过',
        icon: <FlameKindling className="h-4 w-4 text-rose-300" />,
      };
    }

    return {
      border: 'border-violet-400/65 hover:border-violet-300',
      halo: 'shadow-[0_0_40px_rgba(167,139,250,0.2)]',
      surface: 'bg-violet-500/10',
      label: '拓宽技术视野',
      icon: <Orbit className="h-4 w-4 text-violet-300" />,
    };
  };

  useEffect(() => {
    if (!activeNode) {
      return;
    }

    const viewportWidth = viewportRef.current?.clientWidth ?? window.innerWidth;
    const viewportHeight = viewportRef.current?.clientHeight ?? window.innerHeight;
    const currentScale = scale.get();
    const targetX = viewportWidth / 2 - activeNode.x * currentScale;
    const targetY = viewportHeight / 2 - activeNode.y * currentScale;

    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
      return;
    }

    lastSafeOffsetRef.current = { x: targetX, y: targetY };

    const controlsX = animate(x, targetX, { type: 'spring', damping: 25, stiffness: 80 });
    const controlsY = animate(y, targetY, { type: 'spring', damping: 25, stiffness: 80 });

    return () => {
      controlsX.stop();
      controlsY.stop();
    };
  }, [activeNode, scale, x, y]);

  const handleViewportWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const prevScale = scale.get();
    const delta = -event.deltaY * 0.0015;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale * (1 + delta)));

    if (!Number.isFinite(nextScale) || nextScale === prevScale) {
      return;
    }

    const ratio = nextScale / prevScale;
    const currentX = x.get();
    const currentY = y.get();
    const nextX = cursorX - (cursorX - currentX) * ratio;
    const nextY = cursorY - (cursorY - currentY) * ratio;

    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
      return;
    }

    const controlsX = animate(x, nextX, { type: 'spring', damping: 32, stiffness: 280, mass: 0.35 });
    const controlsY = animate(y, nextY, { type: 'spring', damping: 32, stiffness: 280, mass: 0.35 });
    const controlsScale = animate(scale, nextScale, { type: 'spring', damping: 30, stiffness: 260, mass: 0.35 });

    lastSafeOffsetRef.current = { x: nextX, y: nextY };

    window.setTimeout(() => {
      controlsX.stop();
      controlsY.stop();
      controlsScale.stop();
    }, 220);
  };

  if (!dynamicRoadmap || dynamicRoadmap.length === 0) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#050814] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,0.08),transparent_24%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:96px_96px]" />

        <div className="relative z-10 flex max-w-md flex-col items-center rounded-[28px] border border-slate-800/80 bg-slate-950/70 px-8 py-10 text-center shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <Rocket className="mb-6 h-16 w-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.65)]" />
          <h3 className="text-2xl font-semibold tracking-tight text-white">学习航线尚未校准</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            选择一个目标段位后，系统会生成专属路线图并将你带入星图画布。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {(['Junior', 'Mid', 'Senior'] as const).map((lvl) => (
              <Button
                key={lvl}
                variant="outline"
                size="sm"
                onClick={() => setTargetLevel('默认', lvl)}
                className="border-slate-700 bg-slate-950/40 text-slate-100 hover:border-purple-400 hover:bg-purple-500/10"
              >
                {lvl} 模式
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      onWheel={handleViewportWheel}
      className="relative h-full w-full overflow-hidden select-none bg-[#050814] text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(168,85,247,0.2),transparent_26%),radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(16,185,129,0.08),transparent_22%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.11)_1px,transparent_1px)] [background-size:104px_104px]" />

      <div className="absolute left-5 top-5 z-30 pointer-events-none rounded-full border border-purple-400/20 bg-slate-950/70 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-purple-200/80">
          <Target className="h-3.5 w-3.5 text-purple-300" />
          {userTargetLevel} 星图
        </div>
      </div>

      <motion.div
        drag
        dragConstraints={SOFT_DRAG_CONSTRAINTS}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={() => {
          const currentX = x.get();
          const currentY = y.get();
          if (Number.isFinite(currentX) && Number.isFinite(currentY)) {
            lastSafeOffsetRef.current = { x: currentX, y: currentY };
            return;
          }
          x.set(lastSafeOffsetRef.current.x);
          y.set(lastSafeOffsetRef.current.y);
        }}
        className="absolute left-0 top-0 cursor-grab active:cursor-grabbing"
        style={{
          x,
          y,
          scale,
          transformOrigin: '0 0',
          width: treeLayout.canvasWidth,
          height: treeLayout.canvasHeight,
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
          viewBox={`0 0 ${treeLayout.canvasWidth} ${treeLayout.canvasHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.02)" />
              <stop offset="18%" stopColor="rgba(168,85,247,0.72)" />
              <stop offset="52%" stopColor="rgba(196,181,253,1)" />
              <stop offset="82%" stopColor="rgba(168,85,247,0.72)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.02)" />
            </linearGradient>
            <filter id="energyGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {layoutEdges.map((edge) => {
            const isNewEdge = edge.childId === lastAddedBranchNodeId;

            if (!isNewEdge) {
              return (
                <g key={edge.id}>
                  <path
                    d={edge.path}
                    fill="none"
                    stroke="rgba(168,85,247,0.2)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    opacity={0.52}
                  />
                  <path
                    d={edge.path}
                    fill="none"
                    stroke="url(#energyGradient)"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeDasharray="12 14"
                    filter="url(#energyGlow)"
                    opacity={0.22}
                  />
                </g>
              );
            }

            return (
              <g key={edge.id}>
                <motion.path
                  d={edge.path}
                  fill="none"
                  stroke="rgba(168,85,247,0.24)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
                <motion.path
                  d={edge.path}
                  fill="none"
                  stroke="url(#energyGradient)"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  strokeDasharray="16 12"
                  filter="url(#energyGlow)"
                  initial={{ pathLength: 0, opacity: 0.35 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.62, ease: 'easeOut' }}
                  style={{ animation: 'energyFlow 1.8s linear infinite' }}
                />
              </g>
            );
          })}
        </svg>

        {layoutNodes.map((node, index) => {
          const isActiveNode = node.id === activeRoadmapNodeId;
          const tone = getNodeTone(node.status, isActiveNode);
          const isCurrentStatus = node.status === 'current';
          const canExploreBranch = isActiveNode || node.status === 'completed';
          const isGeneratingBranch = branchingNodeId === node.id;
          const isNewNode = node.id === lastAddedBranchNodeId;

          return (
            <motion.div
              key={node.id}
              initial={isNewNode ? { opacity: 0, y: 24, scale: 0.92 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={isNewNode ? { type: 'spring', stiffness: 135, damping: 18 } : { duration: 0 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="absolute z-20 w-[360px] -translate-x-1/2 -translate-y-1/2 text-left outline-none"
              style={{ left: node.x, top: node.y }}
            >
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveRoadmapNode(node.id);
                }}
                className="w-full text-left"
              >
                <Card
                  className={`relative overflow-hidden border ${tone.border} ${tone.surface} ${tone.halo} backdrop-blur-xl transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(168,85,247,0.14),transparent_30%,transparent_70%,rgba(59,130,246,0.08))]" />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <Badge variant="outline" className={`w-fit border text-[10px] uppercase tracking-[0.35em] ${tone.badge}`}>
                          Step {index + 1} · {node.status}
                        </Badge>
                        <h4 className={`text-xl font-semibold leading-none ${isActiveNode ? 'text-white' : 'text-slate-100'}`}>
                          {node.title}
                        </h4>
                        <p className="max-w-[280px] text-sm leading-6 text-slate-400">
                          {node.focus}
                        </p>
                      </div>

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                          isCurrentStatus ? 'border-purple-400/50 bg-purple-500/15 text-purple-200' : 'border-slate-700/70 bg-slate-950/60 text-slate-300'
                        } ${isActiveNode ? 'drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]' : ''}`}
                      >
                        {isCurrentStatus ? <Flame className="h-5 w-5 text-orange-400" /> : <CheckCircle className="h-5 w-5" />}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {node.tasks.slice(0, 3).map((task, taskIndex) => (
                        <span
                          key={`${node.id}-task-${taskIndex}`}
                          className="rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1 text-[11px] text-slate-300"
                        >
                          {getTaskLabel(task)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
                      <span className="text-[10px] uppercase tracking-[0.32em] text-purple-300/80">
                        {isActiveNode ? '当前激活节点' : node.status === 'completed' ? '已完成节点' : '待解锁节点'}
                      </span>
                      <Badge className="bg-purple-600/90 text-[10px] text-white">{node.requiredXP} XP</Badge>
                    </div>
                  </div>
                </Card>
              </button>

              {canExploreBranch && (
                <div className="mt-3 flex justify-center">
                  {isGeneratingBranch ? (
                    <div
                      className="animate-pulse rounded-xl border border-cyan-400/45 bg-cyan-400/10 px-4 py-2 text-[11px] font-medium tracking-wide text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.22)]"
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                      AI 正在联想未来航线...
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setBranchParentNodeId(node.id);
                        void generateBranchSuggestions(node.id);
                      }}
                      className="h-8 rounded-xl border border-violet-400/50 bg-violet-500/14 px-4 text-[11px] font-medium text-violet-100 shadow-[0_0_24px_rgba(168,85,247,0.22)] hover:bg-violet-500/24"
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      探索分支 (Explore Branches)
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {branchSuggestions && branchSuggestions.length > 0 && branchParentNodeId && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/72 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[min(96vw,1080px)] rounded-2xl border border-slate-700/70 bg-[#070b17]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.55)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">全息分叉推演完成</h3>
                <p className="mt-1 text-xs text-slate-400">选择一条冒险路线，系统将把该分支挂载为当前节点的子节点。</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                onClick={() => setBranchParentNodeId(null)}
              >
                暂不选择
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {branchSuggestions.slice(0, 3).map((suggestion) => {
                const tone = getBranchPanelTone(suggestion.branchType);

                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => {
                      void addBranchToRoadmap(branchParentNodeId, suggestion);
                      setBranchParentNodeId(null);
                    }}
                    className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${tone.border} ${tone.halo} ${tone.surface}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/90">
                        {tone.icon}
                        {tone.label}
                      </span>
                      <Badge className="bg-black/30 text-[10px] text-slate-100">{suggestion.requiredXP} XP</Badge>
                    </div>
                    <h4 className="text-base font-semibold text-white group-hover:text-white/95">{suggestion.title}</h4>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{suggestion.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestion.tasks.slice(0, 3).map((task, taskIndex) => (
                        <span
                          key={`${suggestion.id}-branch-task-${taskIndex}`}
                          className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] text-slate-200"
                        >
                          {task.title}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes energyFlow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -96;
          }
        }
      `}</style>
    </div>
  );
};

export default LearningPathFlow;
