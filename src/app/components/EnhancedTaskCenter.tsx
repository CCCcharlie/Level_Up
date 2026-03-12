import { useState } from 'react';
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
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface LearningResource {
  title: string;
  url: string;
  type: 'leetcode' | 'hackerrank' | 'youtube' | 'article' | 'documentation';
  icon: React.ReactNode;
}

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
  resources: LearningResource[];
}

interface EnhancedTaskCenterProps {
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

export function EnhancedTaskCenter({ selectedSkill, allSkills, onTaskComplete }: EnhancedTaskCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'skill-specific'>('recommended');
  const [activeTasks, setActiveTasks] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({});
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [expandedResources, setExpandedResources] = useState<string[]>([]);

  const allTasks: Task[] = [
    {
      id: 'task-algo-1',
      title: '算法基础训练',
      description: '完成LeetCode上的数组和字符串基础题目，掌握常见算法模式',
      requiredSkills: [
        { skillId: 'javascript', skillName: 'JavaScript', minLevel: 3 },
      ],
      rewards: {
        xp: 400,
        skillPoints: 3,
        targetSkillId: 'javascript',
        targetSkillName: 'JavaScript',
      },
      difficulty: 'easy',
      category: '算法',
      estimatedTime: '5-7天',
      steps: [
        '完成10道数组操作题目',
        '完成10道字符串处理题目',
        '完成5道双指针问题',
        '总结常见算法模式',
        '编写学习笔记',
      ],
      icon: <Code className="w-5 h-5" />,
      resources: [
        {
          title: 'LeetCode - 数组题库',
          url: 'https://leetcode.com/tag/array/',
          type: 'leetcode',
          icon: <Code className="w-4 h-4" />,
        },
        {
          title: 'LeetCode - 字符串题库',
          url: 'https://leetcode.com/tag/string/',
          type: 'leetcode',
          icon: <Code className="w-4 h-4" />,
        },
        {
          title: 'JavaScript算法视频教程',
          url: 'https://www.youtube.com/results?search_query=javascript+algorithms',
          type: 'youtube',
          icon: <Youtube className="w-4 h-4" />,
        },
      ],
    },
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
      resources: [
        {
          title: 'React官方文档 - 组件设计',
          url: 'https://react.dev/learn/thinking-in-react',
          type: 'documentation',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          title: 'Storybook文档',
          url: 'https://storybook.js.org/',
          type: 'documentation',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          title: '构建React组件库教程',
          url: 'https://www.youtube.com/results?search_query=react+component+library',
          type: 'youtube',
          icon: <Youtube className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'task-algo-2',
      title: '数据结构进阶挑战',
      description: '在HackerRank上完成树、图和动态规划相关题目',
      requiredSkills: [
        { skillId: 'javascript', skillName: 'JavaScript', minLevel: 4 },
      ],
      rewards: {
        xp: 700,
        skillPoints: 5,
        targetSkillId: 'javascript',
        targetSkillName: 'JavaScript',
      },
      difficulty: 'hard',
      category: '算法',
      estimatedTime: '10-14天',
      steps: [
        '完成5道二叉树题目',
        '完成5道图算法题目',
        '完成8道动态规划题目',
        '参加一次编程竞赛',
        '总结解题思路',
      ],
      icon: <TrendingUp className="w-5 h-5" />,
      resources: [
        {
          title: 'HackerRank - 数据结构',
          url: 'https://www.hackerrank.com/domains/data-structures',
          type: 'hackerrank',
          icon: <Code className="w-4 h-4" />,
        },
        {
          title: 'HackerRank - 算法',
          url: 'https://www.hackerrank.com/domains/algorithms',
          type: 'hackerrank',
          icon: <Code className="w-4 h-4" />,
        },
        {
          title: '动态规划讲解视频',
          url: 'https://www.youtube.com/results?search_query=dynamic+programming',
          type: 'youtube',
          icon: <Youtube className="w-4 h-4" />,
        },
        {
          title: '算法导论 - 动态规划章节',
          url: 'https://mitpress.mit.edu/books/introduction-algorithms',
          type: 'article',
          icon: <Book className="w-4 h-4" />,
        },
      ],
    },
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
      resources: [
        {
          title: 'Express官方文档',
          url: 'https://expressjs.com/',
          type: 'documentation',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          title: 'Node.js REST API教程',
          url: 'https://www.youtube.com/results?search_query=nodejs+rest+api',
          type: 'youtube',
          icon: <Youtube className="w-4 h-4" />,
        },
        {
          title: 'JWT认证详解',
          url: 'https://jwt.io/introduction',
          type: 'documentation',
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'task-sql-1',
      title: 'SQL查询优化挑战',
      description: '在HackerRank完成SQL查询题目，掌握复杂查询和性能优化',
      requiredSkills: [
        { skillId: 'sql', skillName: 'SQL', minLevel: 3 },
      ],
      rewards: {
        xp: 500,
        skillPoints: 4,
        targetSkillId: 'sql',
        targetSkillName: 'SQL',
      },
      difficulty: 'medium',
      category: '数据库',
      estimatedTime: '5-7天',
      steps: [
        '完成15道基础查询题目',
        '完成10道连接查询题目',
        '完成5道窗口函数题目',
        '学习查询执行计划',
        '优化慢查询案例',
      ],
      icon: <Database className="w-5 h-5" />,
      resources: [
        {
          title: 'HackerRank - SQL题库',
          url: 'https://www.hackerrank.com/domains/sql',
          type: 'hackerrank',
          icon: <Code className="w-4 h-4" />,
        },
        {
          title: 'LeetCode - 数据库题库',
          url: 'https://leetcode.com/problemset/database/',
          type: 'leetcode',
          icon: <Code className="w-4 h-4" />,
        },
        {
          title: 'SQL优化教程',
          url: 'https://www.youtube.com/results?search_query=sql+optimization',
          type: 'youtube',
          icon: <Youtube className="w-4 h-4" />,
        },
      ],
    },
  ];

  const tasksWithLevels = allTasks.map(task => ({
    ...task,
    requiredSkills: task.requiredSkills.map(req => ({
      ...req,
      currentLevel: allSkills.find(s => s.id === req.skillId)?.currentLevel || 0,
    })),
  }));

  // Apply difficulty filter
  const filteredTasks = tasksWithLevels.filter(task => 
    difficultyFilter === 'all' || task.difficulty === difficultyFilter
  );

  const skillSpecificTasks = selectedSkill
    ? filteredTasks.filter(task =>
        task.requiredSkills.some(req => req.skillId === selectedSkill.id) ||
        task.rewards.targetSkillId === selectedSkill.id
      )
    : [];

  const recommendedTasks = filteredTasks.filter(task => {
    const meetsRequirements = task.requiredSkills.every(
      req => req.currentLevel >= req.minLevel
    );
    return meetsRequirements && !completedTasks.includes(task.id);
  });

  const tasksWithGaps = filteredTasks.filter(task => {
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
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'leetcode':
      case 'hackerrank':
        return <Code className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'article':
        return <Book className="w-4 h-4" />;
      case 'documentation':
        return <FileText className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const canStartTask = (task: Task) => {
    return task.requiredSkills.every(req => req.currentLevel! >= req.minLevel);
  };

  const startTask = (taskId: string) => {
    if (!activeTasks.includes(taskId)) {
      setActiveTasks(prev => [...prev, taskId]);
      setTaskProgress(prev => ({ ...prev, [taskId]: 0 }));
      toast.success('任务已接受！查看推荐资源开始学习吧', { icon: '📝' });
    }
  };

  const toggleResources = (taskId: string) => {
    setExpandedResources(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
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
      toast.error('请先完成所有任务步骤！');
      return;
    }

    setCompletedTasks(prev => [...prev, taskId]);
    setActiveTasks(prev => prev.filter(id => id !== taskId));
    
    toast.success(
      `恭喜完成任务！获得 ${task.rewards.xp} XP 和 ${task.rewards.skillPoints} 技能点`,
      { icon: '🎉', duration: 5000 }
    );

    onTaskComplete?.(taskId, task.rewards);
  };

  const renderTask = (task: Task) => {
    const isActive = activeTasks.includes(task.id);
    const isCompleted = completedTasks.includes(task.id);
    const canStart = canStartTask(task);
    const progress = taskProgress[task.id] || 0;
    const showResources = expandedResources.includes(task.id);

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

              <div className="mb-3">
                <p className="text-gray-500 text-xs mb-2">技能要求</p>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleResources(task.id)}
                  className="text-purple-400 hover:text-purple-300 h-auto p-0"
                >
                  <Book className="w-4 h-4 mr-1" />
                  {task.resources.length}个学习资源
                </Button>
              </div>

              {task.rewards.targetSkillName && (
                <Badge className="bg-purple-600 text-white mb-3">
                  提升 {task.rewards.targetSkillName} 技能
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Learning Resources */}
          <AnimatePresence>
            {showResources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-700 pt-4"
              >
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  推荐学习资源
                </h4>
                <div className="space-y-2">
                  {task.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all group"
                    >
                      <div className={`p-2 rounded-lg ${
                        resource.type === 'leetcode' ? 'bg-orange-500/20 text-orange-400' :
                        resource.type === 'hackerrank' ? 'bg-green-500/20 text-green-400' :
                        resource.type === 'youtube' ? 'bg-red-500/20 text-red-400' :
                        resource.type === 'article' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm group-hover:text-purple-300 transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-gray-500 text-xs capitalize">{resource.type}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task Steps */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-700 pt-4"
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">任务进度</span>
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
                    接受任务
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    技能不足
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
                  提交任务
                </Button>
                <Button
                  onClick={() => setActiveTasks(prev => prev.filter(id => id !== task.id))}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  放弃
                </Button>
              </>
            )}

            {isCompleted && (
              <Badge className="flex-1 bg-green-600 text-white justify-center py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                已完成
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">增强任务中心</h2>
                <p className="text-gray-300 mb-3">
                  挑战更难的任务，获取精选学习资源
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

            {/* Difficulty Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white text-sm mb-1">
                <Filter className="w-4 h-4" />
                难度筛选
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('all')}
                  className={difficultyFilter === 'all' ? 'bg-purple-600' : ''}
                >
                  全部
                </Button>
                <Button
                  size="sm"
                  variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('easy')}
                  className={difficultyFilter === 'easy' ? 'bg-green-600' : 'border-green-500 text-green-500'}
                >
                  简单
                </Button>
                <Button
                  size="sm"
                  variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('medium')}
                  className={difficultyFilter === 'medium' ? 'bg-yellow-600' : 'border-yellow-500 text-yellow-500'}
                >
                  中等
                </Button>
                <Button
                  size="sm"
                  variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('hard')}
                  className={difficultyFilter === 'hard' ? 'bg-red-600' : 'border-red-500 text-red-500'}
                >
                  困难
                </Button>
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
                <p className="text-gray-400">
                  {difficultyFilter !== 'all' 
                    ? `暂无${getDifficultyText(difficultyFilter)}难度的可接受任务` 
                    : '暂无可接受的任务，继续提升技能解锁更多任务！'}
                </p>
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
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => renderTask(task))
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">暂无{getDifficultyText(difficultyFilter)}难度的任务</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {selectedSkill && (
          <TabsContent value="skill-specific" className="space-y-4 mt-6">
            {skillSpecificTasks.length > 0 ? (
              skillSpecificTasks.map(task => renderTask(task))
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    暂无与 {selectedSkill.name} 相关的{difficultyFilter !== 'all' ? getDifficultyText(difficultyFilter) + '难度' : ''}任务
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
