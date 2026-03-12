import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Step {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export function StepBreakdown() {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: '1',
      title: '基础HTML/CSS学习',
      description: '掌握网页结构和样式的基础知识',
      duration: '2周',
      completed: true,
      subtasks: [
        { id: '1-1', title: '学习HTML标签和语义化', completed: true },
        { id: '1-2', title: '掌握CSS选择器和布局', completed: true },
        { id: '1-3', title: '响应式设计基础', completed: true },
      ],
    },
    {
      id: '2',
      title: 'JavaScript核心概念',
      description: '深入理解JavaScript语言特性',
      duration: '3周',
      completed: false,
      subtasks: [
        { id: '2-1', title: '变量、数据类型和运算符', completed: true },
        { id: '2-2', title: '函数和作用域', completed: true },
        { id: '2-3', title: '异步编程和Promise', completed: false },
        { id: '2-4', title: 'ES6+新特性', completed: false },
      ],
    },
    {
      id: '3',
      title: 'React框架入门',
      description: '学习现代前端框架React',
      duration: '4周',
      completed: false,
      subtasks: [
        { id: '3-1', title: '组件和Props', completed: false },
        { id: '3-2', title: 'State和生命周期', completed: false },
        { id: '3-3', title: 'Hooks使用', completed: false },
        { id: '3-4', title: '项目实战', completed: false },
      ],
    },
    {
      id: '4',
      title: '构建工具和部署',
      description: '学习项目构建和部署流程',
      duration: '2周',
      completed: false,
      subtasks: [
        { id: '4-1', title: 'Webpack/Vite配置', completed: false },
        { id: '4-2', title: 'Git版本控制', completed: false },
        { id: '4-3', title: '部署到云平台', completed: false },
      ],
    },
  ]);

  const [expandedStep, setExpandedStep] = useState<string | null>('2');

  const toggleSubtask = (stepId: string, subtaskId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === stepId) {
          const updatedSubtasks = step.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );
          const allCompleted = updatedSubtasks.every((st) => st.completed);
          return {
            ...step,
            subtasks: updatedSubtasks,
            completed: allCompleted,
          };
        }
        return step;
      })
    );
  };

  const calculateProgress = (step: Step) => {
    const completed = step.subtasks.filter((st) => st.completed).length;
    return (completed / step.subtasks.length) * 100;
  };

  const overallProgress =
    (steps.filter((s) => s.completed).length / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">总体进度</h3>
          <span className="text-2xl font-bold text-indigo-600">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-sm text-gray-600 mt-2">
          已完成 {steps.filter((s) => s.completed).length} / {steps.length} 个主要步骤
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const progress = calculateProgress(step);
          const isExpanded = expandedStep === step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer p-4 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : step.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            步骤 {index + 1}: {step.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            {step.duration}
                          </Badge>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className="text-sm text-gray-600 font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-4 pt-0 bg-gray-50">
                        <div className="space-y-2 ml-10">
                          {step.subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <Checkbox
                                id={subtask.id}
                                checked={subtask.completed}
                                onCheckedChange={() =>
                                  toggleSubtask(step.id, subtask.id)
                                }
                              />
                              <label
                                htmlFor={subtask.id}
                                className={`flex-1 text-sm cursor-pointer ${
                                  subtask.completed
                                    ? 'line-through text-gray-500'
                                    : 'text-gray-700'
                                }`}
                              >
                                {subtask.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
