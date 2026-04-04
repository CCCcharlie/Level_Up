'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type Task, useGameStore } from '../../store/useGameStore';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Target, Flame, CheckCircle, Rocket } from 'lucide-react';

type Point = {
  x: number;
  y: number;
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
    setActiveRoadmapNode,
    setTargetLevel,
  } = useGameStore();

  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 });

  const roadmapLayout = useMemo(() => {
    const nodeSpacingX = 560;
    const canvasWidth = Math.max(2200, 1120 + Math.max(dynamicRoadmap.length - 1, 0) * nodeSpacingX);
    const canvasHeight = 1480;

    const nodes = dynamicRoadmap.map((node, index) => {
      const x = 260 + index * nodeSpacingX;
      const wave = Math.sin(index * 0.85) * 150;
      const y = canvasHeight / 2 + (index % 2 === 0 ? -220 : 170) + wave;

      return {
        ...node,
        x,
        y,
      } as typeof node & Point;
    });

    return { nodes, canvasWidth, canvasHeight };
  }, [dynamicRoadmap]);

  const activeNodeIndex = useMemo(() => {
    const index = dynamicRoadmap.findIndex((node) => node.id === activeRoadmapNodeId);
    return index >= 0 ? index : 0;
  }, [dynamicRoadmap, activeRoadmapNodeId]);

  const updateTranslate = (clientX: number, clientY: number) => {
    if (!isDragging) {
      return;
    }

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    setTranslateX(dragStartRef.current.translateX + deltaX);
    setTranslateY(dragStartRef.current.translateY + deltaY);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      translateX,
      translateY,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    updateTranslate(event.clientX, event.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    const handleWindowMouseMove = (event: MouseEvent) => {
      updateTranslate(event.clientX, event.clientY);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

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
      className={`relative h-full w-full overflow-hidden select-none bg-[#050814] text-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(168,85,247,0.2),transparent_26%),radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(16,185,129,0.08),transparent_22%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.11)_1px,transparent_1px)] [background-size:104px_104px]" />

      <div className="absolute left-5 top-5 z-30 pointer-events-none rounded-full border border-purple-400/20 bg-slate-950/70 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-purple-200/80">
          <Target className="h-3.5 w-3.5 text-purple-300" />
          {userTargetLevel} 星图
        </div>
      </div>

      <div
        className="absolute left-0 top-0"
        style={{
          width: roadmapLayout.canvasWidth,
          height: roadmapLayout.canvasHeight,
          transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
          willChange: 'transform',
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
          viewBox={`0 0 ${roadmapLayout.canvasWidth} ${roadmapLayout.canvasHeight}`}
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

          {roadmapLayout.nodes.slice(1).map((node, index) => {
            const previousNode = roadmapLayout.nodes[index];
            const midX = (previousNode.x + node.x) / 2;
            const bend = index % 2 === 0 ? -180 : 180;
            const path = `M ${previousNode.x} ${previousNode.y} C ${midX} ${previousNode.y + bend}, ${midX} ${node.y - bend}, ${node.x} ${node.y}`;
            const isCompletedTrail = index < activeNodeIndex - 1;
            const isActiveBridge = index === activeNodeIndex - 1;

            return (
              <g key={`segment-${previousNode.id}-${node.id}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(168,85,247,0.16)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity={isCompletedTrail || isActiveBridge ? 1 : 0.25}
                />
                <path
                  d={path}
                  fill="none"
                  stroke="url(#energyGradient)"
                  strokeWidth={isActiveBridge ? 4 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray={isActiveBridge ? '18 12' : '10 14'}
                  strokeDashoffset="0"
                  filter="url(#energyGlow)"
                  opacity={isCompletedTrail ? 0.35 : isActiveBridge ? 1 : 0.16}
                  style={{
                    animation: isCompletedTrail || isActiveBridge ? 'energyFlow 2.4s linear infinite' : undefined,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {roadmapLayout.nodes.map((node, index) => {
          const isActiveNode = node.id === activeRoadmapNodeId;
          const tone = getNodeTone(node.status, isActiveNode);
          const isCurrentStatus = node.status === 'current';

          return (
            <motion.button
              key={node.id}
              type="button"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
              whileHover={{ y: -8, scale: 1.01 }}
              onClick={() => setActiveRoadmapNode(node.id)}
              className="absolute z-20 w-[360px] -translate-x-1/2 -translate-y-1/2 text-left outline-none"
              style={{ left: node.x, top: node.y }}
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
            </motion.button>
          );
        })}
      </div>

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
