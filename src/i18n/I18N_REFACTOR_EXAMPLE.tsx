/**
 * ============================================
 * EnhancedTaskCenter.tsx i18n 重构示例
 * ============================================
 * 本文件展示如何将硬编码的中文字符串转换为 i18n 翻译
 */

// ============================================
// 🔴 BEFORE (原始代码 - 仅中文)
// ============================================

/*
export default function EnhancedTaskCenter({ selectedSkill, allSkills, onTaskComplete }: EnhancedTaskCenterProps) {
  const { dynamicRoadmap, activeRoadmapNodeId, ... } = useGameStore();
  
  // 硬编码的中文字符串分散在代码各处
  const handleTaskComplete = async (task: Task) => {
    // ...
    toast.success('任务完成，进度已记录。');
  };

  const handleSubmitFeynman = async () => {
    if (!feynmanAnswer.trim()) {
      toast.error('请先概括核心逻辑，再提交校验。');
      return;
    }
    // ...
  };

  return (
    <div>
      {!activeNode ? (
        <div>
          <h3>任务中心待激活</h3>
          <p>请在左侧「学习路线图」中选择一个战略节点</p>
          <p>系统将自动生成针对性任务</p>
        </div>
      ) : (
        <div>
          <h2>当前攻克节点</h2>
          <h3>直击痛点：</h3>
          {shouldShowBreakdownHint && (
            <p>看起来有些棘手？试试将其拆解为微任务</p>
          )}
          <button onClick={() => breakdownTask(task.id)}>调用 AI 拆解</button>
          <p>拆解中...</p>
          <h3>本节点专属任务</h3>
          <button>开启深度强化 (Reinforce)</button>
          <p>强化生成中...</p>
          <h3>费曼校验</h3>
          <p>请概括此节点的核心逻辑</p>
          <p>任务：</p>
          <p>用你自己的话总结原理、边界与落地方式...</p>
          <button>稍后再写</button>
          <button>提交校验</button>
        </div>
      )}
    </div>
  );
}
*/

// ============================================
// 🟢 AFTER (重构代码 - 支持中英双语)
// ============================================

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
  // ✨ 添加 useTranslation hook
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
    
    // ✨ 使用 t() 函数进行翻译
    toast.success(t('taskCenter.completed'));
  };

  const handleSubmitFeynman = async () => {
    if (!activeNode || !pendingFeynmanTask) {
      return;
    }

    if (!feynmanAnswer.trim()) {
      // ✨ 使用翻译 key
      toast.error(t('taskCenter.summarizeFirst'));
      return;
    }

    setIsSubmittingFeynman(true);

    try {
      setCompletedTaskIds((previous) => ({
        ...previous,
        [pendingFeynmanTask!.id]: true,
      }));

      onTaskComplete?.(pendingFeynmanTask.id, {
        xp: pendingFeynmanTask.estimatedXP ?? 20,
        skillPoints: 1,
      });

      await trackProgress(activeNode.id, pendingFeynmanTask.estimatedXP ?? 20, true);
      
      // ✨ 使用翻译 key
      toast.success(t('taskCenter.feynmanPassed'));

      setPendingFeynmanTask(null);
      setFeynmanAnswer('');
    } catch (error) {
      console.error('[EnhancedTaskCenter:handleSubmitFeynman] Error:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmittingFeynman(false);
    }
  };

  const handleBreakdown = async () => {
    if (!activeNode) {
      return;
    }

    setIsTriggeringBreakdown(true);

    try {
      const taskToBreak = activeNode.tasks[0];
      if (!taskToBreak) {
        return;
      }

      await breakdownTask(taskToBreak.id);
    } catch (error) {
      console.error('[EnhancedTaskCenter:handleBreakdown] Error:', error);
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
    } catch (error) {
      console.error('[EnhancedTaskCenter:handleReinforce] Error:', error);
    } finally {
      setIsTriggeringReinforce(false);
    }
  };

  if (!activeNode) {
    return (
      <Card className="p-6 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Target className="h-12 w-12 text-slate-600" />
          
          {/* ✨ 使用翻译 key 替换硬编码中文 */}
          <h3 className="text-lg font-semibold text-slate-200">
            {t('taskCenter.waitingActivation')}
          </h3>
          <p className="text-sm text-slate-400">
            {t('taskCenter.selectNode')}
          </p>
          <p className="text-sm text-slate-400">
            {t('taskCenter.autoGenerate')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-6 border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
      {/* 当前节点 */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          {t('taskCenter.currentNode')}
        </h2>
        <h3 className="font-semibold text-slate-300">{activeNode.title}</h3>
        <p className="text-sm text-slate-400">{activeNode.focus}</p>
      </div>

      {/* 拆解建议区 */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <h3 className="font-semibold text-slate-300 flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-400" />
          {t('taskCenter.hitPoint')}
        </h3>

        {shouldShowBreakdownHint && (
          <>
            <p className="text-sm text-slate-400">
              {t('taskCenter.tricky')}
            </p>
            <p className="text-sm text-slate-500 italic">
              {t('taskCenter.breakdown')}
            </p>
          </>
        )}

        <Button
          onClick={handleBreakdown}
          disabled={isTriggeringBreakdown}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {isTriggeringBreakdown ? (
            <>
              <span className="animate-spin mr-2">⚙️</span>
              {t('taskCenter.decomposing')}
            </>
          ) : (
            t('taskCenter.callAI')
          )}
        </Button>
      </div>

      {/* 本节点专属任务 */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <h3 className="font-semibold text-slate-300">
          {t('taskCenter.nodeExclusive')}
        </h3>

        <div className="space-y-2">
          {activeNode.tasks.map((task, idx) => (
            <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <span className="text-xs font-semibold text-slate-500 mt-1">{idx + 1}.</span>
              <div className="flex-1">
                <p className="text-sm text-slate-300">{task.title}</p>
                <Badge className="mt-2 text-xs">
                  {t(`skillTree.rarity.${task.type}`)}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => handleTaskComplete(task)}
                disabled={completedTaskIds[task.id]}
                className={completedTaskIds[task.id] ? 'opacity-50' : ''}
              >
                {completedTaskIds[task.id] ? '✓' : t('common.confirm')}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 强化区域 */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <Button
          onClick={handleReinforce}
          disabled={isTriggeringReinforce}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isTriggeringReinforce ? (
            <>
              <span className="animate-spin mr-2">⚙️</span>
              {t('taskCenter.reinforcing')}
            </>
          ) : (
            t('taskCenter.startReinforce')
          )}
        </Button>
      </div>

      {/* 费曼校验 */}
      <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700">
        <div className="flex items-start gap-3">
          <BrainCircuit className="h-5 w-5 text-amber-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-200">
              {t('taskCenter.feynman')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {t('taskCenter.feynmanPrompt')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            {t('taskCenter.feynmanTask')}
          </label>
          <p className="text-xs text-slate-500 italic">
            {t('taskCenter.feynmanDesc')}
          </p>

          {pendingFeynmanTask ? (
            <>
              <Textarea
                placeholder={t('taskCenter.feynmanDesc')}
                value={feynmanAnswer}
                onChange={(e) => setFeynmanAnswer(e.target.value)}
                className="min-h-24 bg-slate-800 border-slate-700 text-slate-200"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setPendingFeynmanTask(null);
                    setFeynmanAnswer('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t('taskCenter.laterWrite')}
                </Button>
                <Button
                  onClick={handleSubmitFeynman}
                  disabled={isSubmittingFeynman}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmittingFeynman ? '提交中...' : t('taskCenter.submitValidation')}
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => setPendingFeynmanTask(activeNode.tasks.find((t) => t.type === 'feynman') || null)}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {t('taskCenter.feynman')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================
// 📝 关键修改总结
// ============================================

/*
1. 导入 useTranslation hook:
   import { useTranslation } from 'react-i18next';

2. 在组件内使用 hook:
   const { t } = useTranslation();

3. 替换所有硬编码的中文字符串:
   旧: toast.success('任务完成，进度已记录。');
   新: toast.success(t('taskCenter.completed'));

4. 在 JSX 中使用翻译:
   旧: <h3>任务中心待激活</h3>
   新: <h3>{t('taskCenter.waitingActivation')}</h3>

5. 支持动态文本:
   t('taskCenter.congratulations') + ' ' + xp + ' XP'

============================================
*/
