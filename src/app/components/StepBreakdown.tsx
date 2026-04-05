import type { Task } from '../../store/useGameStore';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, Code2, Dumbbell, MessageSquare, Rocket, Sparkles } from 'lucide-react';

interface StepBreakdownProps {
  tasks: Task[];
  completedTaskIds: Record<string, boolean>;
  onTaskComplete: (task: Task) => void;
}

const getTaskVisual = (type: Task['type']) => {
  if (type === 'leetcode') {
    return {
      icon: Code2,
      iconClassName: 'text-sky-400',
      badgeClassName: 'border-sky-500/40 text-sky-300 bg-sky-500/10',
      label: 'LeetCode',
    };
  }

  if (type === 'project') {
    return {
      icon: Rocket,
      iconClassName: 'text-violet-400',
      badgeClassName: 'border-violet-500/40 text-violet-300 bg-violet-500/10',
      label: 'Project',
    };
  }

  if (type === 'feynman') {
    return {
      icon: MessageSquare,
      iconClassName: 'text-emerald-400',
      badgeClassName: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
      label: 'Feynman',
    };
  }

  if (type === 'reinforcement') {
    return {
      icon: Dumbbell,
      iconClassName: 'text-amber-400',
      badgeClassName: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
      label: 'Reinforcement',
    };
  }

  return {
    icon: Sparkles,
    iconClassName: 'text-slate-300',
    badgeClassName: 'border-slate-600 text-slate-300 bg-slate-800/40',
    label: 'Concept',
  };
};

export function StepBreakdown({ tasks, completedTaskIds, onTaskComplete }: StepBreakdownProps) {
  return (
    <div className="grid gap-3">
      {tasks.map((task, index) => {
        const visual = getTaskVisual(task.type);
        const Icon = visual.icon;
        const isCompleted = Boolean(completedTaskIds[task.id]);

        return (
          <Card
            key={task.id}
            className="group border-slate-800 bg-slate-950/40 p-3 transition-all duration-300 hover:border-amber-500/30"
          >
            <CardContent className="p-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-sm border border-slate-800 bg-slate-900 text-[10px] font-mono text-slate-500 transition-colors group-hover:text-amber-400">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-200 transition-colors group-hover:text-slate-100">
                        {task.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${visual.badgeClassName}`}>
                          <Icon className={`mr-1 h-3 w-3 ${visual.iconClassName}`} />
                          {visual.label}
                        </Badge>
                        {task.subTasks?.length ? (
                          <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-300">
                            {task.subTasks.length} sub tasks
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isCompleted ? 'secondary' : 'outline'}
                      className={isCompleted ? 'h-7 border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'h-7 border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'}
                      onClick={() => onTaskComplete(task)}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      {isCompleted ? '已完成' : '完成'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
