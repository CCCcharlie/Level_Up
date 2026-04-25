'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore, { type Task } from '../../store/useGameStore';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { StepBreakdown } from './StepBreakdown';
import { BrainCircuit, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedTaskCenterProps {
  selectedSkill?: any;
  allSkills?: any[];
  onTaskComplete?: (taskId: string, rewards: { xp: number; skillPoints: number }) => void;
}

export default function EnhancedTaskCenter({
  selectedSkill,
  allSkills,
  onTaskComplete,
}: EnhancedTaskCenterProps) {
  const { t } = useTranslation();
  const {
    dynamicRoadmap,
    activeRoadmapNodeId,
    breakdownTask,
    reinforceNode,
    trackProgress,
    skillProgress,
  } = useGameStore();
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});
  const [pendingFeynmanTask, setPendingFeynmanTask] = useState<Task | null>(null);
  const [feynmanAnswer, setFeynmanAnswer] = useState('');
  const [isSubmittingFeynman, setIsSubmittingFeynman] = useState(false);
  const [isTriggeringBreakdown, setIsTriggeringBreakdown] = useState(false);
  const [isTriggeringReinforce, setIsTriggeringReinforce] = useState(false);

  const activeNode = dynamicRoadmap.find((node) => node.id === activeRoadmapNodeId);

  const shouldShowBreakdownHint = useMemo(() => {
    if (!activeNode) {
      return false;
    }

    const lastActiveValue = skillProgress[activeNode.id]?.lastActive;

    if (!lastActiveValue) {
      return false;
    }

    const lastActiveTime = new Date(lastActiveValue).getTime();

    if (Number.isNaN(lastActiveTime)) {
      return false;
    }

    return Date.now() - lastActiveTime > 2 * 24 * 60 * 60 * 1000;
  }, [activeNode, skillProgress]);

  const handleTaskComplete = async (task: Task) => {
    if (!activeNode) {
      return;
    }

    if (task.type === 'feynman' && !completedTaskIds[task.id]) {
      setPendingFeynmanTask(task);
      setFeynmanAnswer('');
      return;
    }

    setCompletedTaskIds((previous) => ({
      ...previous,
      [task.id]: true,
    }));

    onTaskComplete?.(task.id, {
      xp: task.estimatedXP ?? 15,
      skillPoints: 0,
    });

    await trackProgress(activeNode.id, task.estimatedXP ?? 15, false);
    toast.success(t('taskCenter.completed'));
  };

  const handleSubmitFeynman = async () => {
    if (!activeNode || !pendingFeynmanTask) {
      return;
    }

    if (!feynmanAnswer.trim()) {
      toast.error(t('taskCenter.summarizeFirst'));
      return;
    }

    setIsSubmittingFeynman(true);

    try {
      setCompletedTaskIds((previous) => ({
        ...previous,
        [pendingFeynmanTask.id]: true,
      }));

      onTaskComplete?.(pendingFeynmanTask.id, {
        xp: pendingFeynmanTask.estimatedXP ?? 15,
        skillPoints: 0,
      });

      await trackProgress(activeNode.id, pendingFeynmanTask.estimatedXP ?? 15, false);
      toast.success(t('taskCenter.feynmanPassed'));
      setPendingFeynmanTask(null);
      setFeynmanAnswer('');
    } finally {
      setIsSubmittingFeynman(false);
    }
  };

  const handleBreakdownSuggestion = async () => {
    if (!activeNode) {
      return;
    }

    const firstTargetTask = activeNode.tasks.find((task) => !task.subTasks || task.subTasks.length === 0);

    if (!firstTargetTask) {
      toast.message(t('taskCenter.noFurtherDecompose'));
      return;
    }

    setIsTriggeringBreakdown(true);

    try {
      await breakdownTask(firstTargetTask.id);
    } finally {
      setIsTriggeringBreakdown(false);
    }
  };

  const handleReinforce = async () => {
    if (!activeNode) {
      return;
    }

    setIsTriggeringReinforce(true);

    try {
      await reinforceNode(activeNode.id);
    } finally {
      setIsTriggeringReinforce(false);
    }
  };

  if (!activeNode) {
    return (
      <Card className="p-10 text-center bg-slate-900/60 border border-slate-700">
        <Target className="w-12 h-12 mx-auto mb-6 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-200 mb-2">{t('taskCenter.waitingActivation')}</h3>
        <p className="text-slate-400">{t('taskCenter.selectNode')}</p>
        <p className="text-sm text-slate-500 mt-2">{t('taskCenter.autoGenerate')}</p>
      </Card>
    );
  }

  return (
    <div className="h-auto w-full min-w-0 shrink-0 space-y-6">
      <div className="border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5">
            {t('taskCenter.currentNode')}
          </Badge>
          <h2 className="text-2xl font-bold text-slate-100">{activeNode.title}</h2>
        </div>
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-amber-400/90">
          <span className="font-medium">{t('taskCenter.hitPoint')}</span>
          {activeNode.focus}
        </p>
      </div>

      {shouldShowBreakdownHint ? (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-200">{t('taskCenter.tricky')}</p>
              <p className="mt-1 text-xs text-amber-100/80">{t('taskCenter.breakdown')}</p>
            </div>
            <Button
              size="sm"
              disabled={isTriggeringBreakdown}
              className="border border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30"
              onClick={handleBreakdownSuggestion}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {isTriggeringBreakdown ? t('taskCenter.decomposing') : t('taskCenter.callAI')}
            </Button>
          </div>
        </Card>
      ) : null}

      <div>
        <h3 className="text-lg font-medium text-slate-200 mb-4">
          {t('taskCenter.nodeExclusive')} ({activeNode.tasks.length})
        </h3>

        <StepBreakdown
          tasks={activeNode.tasks}
          completedTaskIds={completedTaskIds}
          onTaskComplete={handleTaskComplete}
        />
      </div>

      {activeNode.status === 'completed' ? (
        <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/10 to-transparent p-4 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
          <Button
            disabled={isTriggeringReinforce}
            onClick={handleReinforce}
            className="h-11 w-full border border-violet-300/40 bg-violet-500/25 text-violet-100 shadow-[0_0_28px_rgba(139,92,246,0.35)] hover:bg-violet-500/35"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isTriggeringReinforce ? t('taskCenter.reinforcing') : t('taskCenter.startReinforce')}
          </Button>
        </div>
      ) : null}

      {pendingFeynmanTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl border border-emerald-500/30 bg-slate-900/95 p-5 shadow-[0_0_28px_rgba(16,185,129,0.2)]">
            <div className="space-y-4">
              <div>
                  <h4 className="text-lg font-semibold text-emerald-200">{t('taskCenter.feynman')}</h4>
                  <p className="mt-1 text-sm text-emerald-100/80">{t('taskCenter.feynmanPrompt')}</p>
                  <p className="mt-2 text-xs text-slate-400">{t('taskCenter.feynmanTask')}{pendingFeynmanTask.title}</p>
              </div>

              <Textarea
                value={feynmanAnswer}
                onChange={(event) => setFeynmanAnswer(event.target.value)}
                  placeholder={t('taskCenter.feynmanDesc')}
                className="min-h-32 border-emerald-500/30 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300"
                  onClick={() => {
                    setPendingFeynmanTask(null);
                    setFeynmanAnswer('');
                  }}
                >
                  {t('taskCenter.laterWrite')}
                </Button>
                <Button
                  disabled={isSubmittingFeynman}
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={handleSubmitFeynman}
                >
                  {isSubmittingFeynman ? t('common.loading') : t('taskCenter.submitValidation')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
