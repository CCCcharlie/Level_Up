import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import {
  Target,
  Award,
  Clock,
  Zap,
  Star,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Book,
  Code,
  Database,
  Server,
  Cloud,
  Smartphone,
  ExternalLink,
  Filter,
  Youtube,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  requiredSkills: { skillId: string; skillName: string; minLevel: number; currentLevel?: number }[];
  rewards: {
    xp: number;
    skillPoints: number;
    targetSkillId?: string;
    targetSkillName?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedTime: string;
  steps: string[];
  icon: React.ReactNode;
}

interface TaskCenterProps {
  selectedSkill?: {
    id: string;
    name: string;
    category: string;
    currentLevel: number;
  } | null;
  allSkills: Array<{
    id: string;
    name: string;
    currentLevel: number;
  }>;
  onTaskComplete?: (taskId: string, rewards: { xp: number; skillPoints: number }) => void;
}

export function TaskCenter({ selectedSkill, allSkills, onTaskComplete }: TaskCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'skill-specific'>('recommended');
  const { t } = useTranslation();
  const [activeTasks, setActiveTasks] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({});

  // All available tasks
  const allTasks: Task[] = [
    // React Tasks
    {
      id: 'task-react-1',
      title: 'React组件库开发',
      description: '创建一个可复用的React组件库，包含按钮、输入框、模态框等基础组件',
      requiredSkills: [
        { skillId: 'react', skillName: 'React', minLevel: 3 },
        { skillId: 'css', skillName: 'CSS', minLevel: 4 },
      ],
      rewards: {
        xp: 500,
        skillPoints: 3,
        targetSkillId: 'react',
        targetSkillName: 'React',
      },
      difficulty: 'medium',
      category: '前端',
      estimatedTime: '5-7天',
      steps: [
        '设计组件API接口',
        '实现基础组件（Button、Input）',
        '添加主题系统支持',
        '编写组件文档',
        '发布到npm',
      ],
      icon: <Code className="w-5 h-5" />,
    },
    {
      id: 'task-react-2',
      title: 'React性能优化实战',
      description: '优化一个现有React应用的性能，减少重渲染，实现代码分割',
      requiredSkills: [
        { skillId: 'react', skillName: 'React', minLevel: 4 },
        { skillId: 'javascript', skillName: 'JavaScript', minLevel: 4 },
      ],
      rewards: {
        xp: 600,
        skillPoints: 4,
        targetSkillId: 'react',
        targetSkillName: 'React',
      },
      difficulty: 'hard',
      category: '前端',
      estimatedTime: '3-5天',
      steps: [
        '使用React DevTools分析性能',
        '实现useMemo和useCallback优化',
        '添加React.lazy代码分割',
        '优化列表渲染',
        '性能对比测试',
      ],
      icon: <TrendingUp className="w-5 h-5" />,
    },

    // Node.js Tasks
    {
      id: 'task-node-1',
      title: 'Express RESTful API开发',
      description: '使用Express构建完整的RESTful API，包含CRUD操作和身份验证',
      requiredSkills: [
        { skillId: 'nodejs-basic', skillName: 'Node基础', minLevel: 2 },
        { skillId: 'javascript', skillName: 'JavaScript', minLevel: 3 },
      ],
      rewards: {
        xp: 700,
        skillPoints: 5,
        targetSkillId: 'nodejs-basic',
        targetSkillName: 'Node.js',
      },
      difficulty: 'medium',
      category: '后端',
      estimatedTime: '7-10天',
      steps: [
        '项目初始化和路由设计',
        '实现数据库模型',
        '开发CRUD端点',
        '添加JWT身份验证',
        'API测试和文档',
      ],
      icon: <Server className="w-5 h-5" />,
    },

    // Database Tasks
    {
      id: 'task-db-1',
      title: 'MongoDB数据建模',
      description: '为电商系统设计MongoDB数据模型，实现用户、商品、订单管理',
      requiredSkills: [
        { skillId: 'mongodb', skillName: 'MongoDB', minLevel: 2 },
        { skillId: 'nodejs-basic', skillName: 'Node基础', minLevel: 2 },
      ],
      rewards: {
        xp: 450,
        skillPoints: 3,
        targetSkillId: 'mongodb',
        targetSkillName: 'MongoDB',
      },
      difficulty: 'medium',
      category: '数据库',
      estimatedTime: '4-6天',
      steps: [
        '分析业务需求',
        '设计数据模型Schema',
        '实现关联和嵌入',
        '创建索引优化查询',
        '数据验证和测试',
      ],
      icon: <Database className="w-5 h-5" />,
    },

    // DevOps Tasks
    {
      id: 'task-docker-1',
      title: 'Docker容器化应用',
      description: '将一个全栈应用容器化，编写Dockerfile和docker-compose配置',
      requiredSkills: [
        { skillId: 'docker', skillName: 'Docker', minLevel: 1 },
        { skillId: 'nodejs-basic', skillName: 'Node基础', minLevel: 2 },
      ],
      rewards: {
        xp: 550,
        skillPoints: 4,
        targetSkillId: 'docker',
        targetSkillName: 'Docker',
      },
      difficulty: 'medium',
      category: '工具',
      estimatedTime: '3-5天',
      steps: [
        '编写应用Dockerfile',
        '配置docker-compose',
        '设置数据持久化',
        '优化镜像大小',
        '部署测试',
      ],
      icon: <Cloud className="w-5 h-5" />,
    },

    // TypeScript Tasks
    {
      id: 'task-ts-1',
      title: 'TypeScript类型系统深入',
      description: '将JavaScript项目迁移到TypeScript，掌握高级类型特性',
      requiredSkills: [
        { skillId: 'typescript', skillName: 'TypeScript', minLevel: 2 },
        { skillId: 'javascript', skillName: 'JavaScript', minLevel: 4 },
      ],
      rewards: {
        xp: 600,
        skillPoints: 4,
        targetSkillId: 'typescript',
        targetSkillName: 'TypeScript',
      },
      difficulty: 'hard',
      category: '前端',
      estimatedTime: '5-7天',
      steps: [
        '配置TypeScript项目',
        '定义基础类型接口',
        '使用泛型和高级类型',
        '类型守卫和断言',
        '严格模式下编译通过',
      ],
      icon: <Code className="w-5 h-5" />,
    },

    // Mobile Tasks
    {
      id: 'task-mobile-1',
      title: 'React Native跨平台应用',
      description: '开发一个跨平台移动应用，包含导航、状态管理和API集成',
      requiredSkills: [
        { skillId: 'react-native', skillName: 'React Native', minLevel: 1 },
        { skillId: 'react', skillName: 'React', minLevel: 3 },
      ],
      rewards: {
        xp: 800,
        skillPoints: 6,
        targetSkillId: 'react-native',
        targetSkillName: 'React Native',
      },
      difficulty: 'hard',
      category: '移动',
      estimatedTime: '10-14天',
      steps: [
        '项目初始化和导航设置',
        '实现核心功能页面',
        '集成Redux状态管理',
        '对接后端API',
        'iOS和Android测试',
      ],
      icon: <Smartphone className="w-5 h-5" />,
    },

    // Beginner Tasks
    {
      id: 'task-beginner-1',
      title: '个人博客网站',
      description: '使用HTML、CSS和JavaScript创建一个个人博客网站',
      requiredSkills: [
        { skillId: 'html', skillName: 'HTML', minLevel: 3 },
        { skillId: 'css', skillName: 'CSS', minLevel: 3 },
        { skillId: 'javascript', skillName: 'JavaScript', minLevel: 2 },
      ],
      rewards: {
        xp: 300,
        skillPoints: 2,
      },
      difficulty: 'easy',
      category: '前端',
      estimatedTime: '3-5天',
      steps: [
        '设计网站结构',
        '实现响应式布局',
        '添加文章列表和详情',
        '实现评论功能',
        '部署到GitHub Pages',
      ],
      icon: <Book className="w-5 h-5" />,
    },
  ];

  // Add current levels to required skills
  const tasksWithLevels = allTasks.map(task => ({
    ...task,
    requiredSkills: task.requiredSkills.map(req => ({
      ...req,
      currentLevel: allSkills.find(s => s.id === req.skillId)?.currentLevel || 0,
    })),
  }));

  // Filter tasks based on selected skill
  const skillSpecificTasks = selectedSkill
    ? tasksWithLevels.filter(task =>
        task.requiredSkills.some(req => req.skillId === selectedSkill.id) ||
        task.rewards.targetSkillId === selectedSkill.id
      )
    : [];

  // Recommended tasks (skills user can do now)
  const recommendedTasks = tasksWithLevels.filter(task => {
    const meetsRequirements = task.requiredSkills.every(
      req => req.currentLevel >= req.minLevel
    );
    return meetsRequirements && !completedTasks.includes(task.id);
  });

  // Tasks with skill gaps
  const tasksWithGaps = tasksWithLevels.filter(task => {
    const hasGaps = task.requiredSkills.some(
      req => req.currentLevel < req.minLevel
    );
    return hasGaps && !completedTasks.includes(task.id);
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t('taskCenter.difficultyEasy');
        case 'medium': return t('taskCenter.difficultyMedium');
        case 'hard': return t('taskCenter.difficultyHard');
      default: return '';
    }
  };

  const canStartTask = (task: Task) => {
    return task.requiredSkills.every(req => req.currentLevel! >= req.minLevel);
  };

  const startTask = (taskId: string) => {
    if (!activeTasks.includes(taskId)) {
      setActiveTasks(prev => [...prev, taskId]);
      setTaskProgress(prev => ({ ...prev, [taskId]: 0 }));
      toast.success(t('taskCenter.accepted'), { icon: '📝' });
    }
  };

  const updateProgress = (taskId: string, stepIndex: number, checked: boolean) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const totalSteps = task.steps.length;
    const currentProgress = taskProgress[taskId] || 0;
    
    const newProgress = checked
      ? Math.min(currentProgress + (100 / totalSteps), 100)
      : Math.max(currentProgress - (100 / totalSteps), 0);

    setTaskProgress(prev => ({ ...prev, [taskId]: newProgress }));
  };

  const completeTask = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const progress = taskProgress[taskId] || 0;
    if (progress < 100) {
      toast.error(t('taskCenter.completeAllSteps'));
      return;
    }

    setCompletedTasks(prev => [...prev, taskId]);
    setActiveTasks(prev => prev.filter(id => id !== taskId));
    
    toast.success(
      t('taskCenter.congratulations', { xp: task.rewards.xp, skillPoints: task.rewards.skillPoints }),
      { icon: '🎉', duration: 5000 }
    );

    onTaskComplete?.(taskId, task.rewards);
  };

  const renderTask = (task: Task) => {
    const isActive = activeTasks.includes(task.id);
    const isCompleted = completedTasks.includes(task.id);
    const canStart = canStartTask(task);
    const progress = taskProgress[task.id] || 0;

    return (
      <Card
        key={task.id}
        className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all ${
          isActive ? 'ring-2 ring-purple-500' : ''
        } ${isCompleted ? 'opacity-60' : ''}`}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${canStart ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gray-700'} text-white`}>
              {task.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <CardTitle className="text-white text-lg">{task.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  <Badge className={`${getDifficultyColor(task.difficulty)} text-white`}>
                    {getDifficultyText(task.difficulty)}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">{task.description}</p>

              {/* Required Skills */}
              <div className="mb-3">
                  <p className="text-gray-500 text-xs mb-2">{t('taskCenter.skillRequirements')}</p>
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills.map(req => {
                    const meetsRequirement = req.currentLevel! >= req.minLevel;
                    return (
                      <Badge
                        key={req.skillId}
                        variant="outline"
                        className={`${
                          meetsRequirement
                            ? 'border-green-500 text-green-400'
                            : 'border-red-500 text-red-400'
                        }`}
                      >
                        {req.skillName} LV{req.minLevel}
                        {meetsRequirement ? ' ✓' : ` (当前LV${req.currentLevel})`}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-4 text-sm mb-3">
                <span className="flex items-center gap-1 text-blue-400">
                  <Zap className="w-4 h-4" />
                  +{task.rewards.xp} XP
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4" />
                  +{task.rewards.skillPoints} SP
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {task.estimatedTime}
                </span>
              </div>

              {task.rewards.targetSkillName && (
                <Badge className="bg-purple-600 text-white mb-3">
                  提升 {task.rewards.targetSkillName} 技能
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Task Steps (shown when active) */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">{t('taskCenter.taskProgress')}</span>
                    <span className="text-gray-400 text-sm">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  {task.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 bg-slate-700/30 rounded-lg"
                    >
                      <Checkbox
                        onCheckedChange={(checked) => updateProgress(task.id, index, checked === true)}
                      />
                      <span className="text-gray-300 text-sm flex-1">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            {!isActive && !isCompleted && (
              <Button
                onClick={() => startTask(task.id)}
                disabled={!canStart}
                className={`flex-1 ${
                  canStart
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-700'
                }`}
              >
                {canStart ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    {t('taskCenter.acceptTask')}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {t('taskCenter.insufficientSkills')}
                  </>
                )}
              </Button>
            )}

            {isActive && (
              <>
                <Button
                  onClick={() => completeTask(task.id)}
                  disabled={progress < 100}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Award className="w-4 h-4 mr-2" />
                  {t('taskCenter.submitTask')}
                </Button>
                <Button
                  onClick={() => setActiveTasks(prev => prev.filter(id => id !== task.id))}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  {t('taskCenter.abandon')}
                </Button>
              </>
            )}

            {isCompleted && (
              <Badge className="flex-1 bg-green-600 text-white justify-center py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('taskCenter.completedStatus')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">任务中心</h2>
              <p className="text-gray-300 mb-3">
                根据你的技能水平，系统为你推荐适合的学习任务
              </p>
              {selectedSkill && (
                <Badge className="bg-yellow-500 text-black">
                  当前查看: {selectedSkill.name} 相关任务
                </Badge>
              )}
              <div className="flex gap-4 mt-4 text-sm">
                <span className="text-gray-400">
                  进行中: <span className="text-purple-400 font-bold">{activeTasks.length}</span>
                </span>
                <span className="text-gray-400">
                  已完成: <span className="text-green-400 font-bold">{completedTasks.length}</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="recommended" className="data-[state=active]:bg-green-600">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            推荐任务 ({recommendedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
            <Target className="w-4 h-4 mr-2" />
            全部任务
          </TabsTrigger>
          {selectedSkill && (
            <TabsTrigger value="skill-specific" className="data-[state=active]:bg-blue-600">
              <Star className="w-4 h-4 mr-2" />
              {selectedSkill.name} ({skillSpecificTasks.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="recommended" className="space-y-4 mt-6">
          {recommendedTasks.length > 0 ? (
            recommendedTasks.map(task => renderTask(task))
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">暂无可接受的任务，继续提升技能解锁更多任务！</p>
              </CardContent>
            </Card>
          )}

          {tasksWithGaps.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                提升技能后可解锁
              </h3>
              <div className="space-y-4">
                {tasksWithGaps.slice(0, 3).map(task => renderTask(task))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-6">
          {tasksWithLevels.map(task => renderTask(task))}
        </TabsContent>

        {selectedSkill && (
          <TabsContent value="skill-specific" className="space-y-4 mt-6">
            {skillSpecificTasks.length > 0 ? (
              skillSpecificTasks.map(task => renderTask(task))
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">暂无与 {selectedSkill.name} 相关的任务</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}