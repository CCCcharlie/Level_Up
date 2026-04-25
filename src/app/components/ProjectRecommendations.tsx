import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { 
  FolderKanban,
  Trophy,
  Clock,
  Zap,
  Star,
  CheckCircle2,
  Code,
  Palette,
  Database,
  Smartphone,
  Cloud,
  Brain,
  ChevronRight,
  Play,
  Award,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  xpReward: number;
  skillPointsReward: number;
  skills: string[];
  icon: React.ReactNode;
  color: string;
  milestones: {
    title: string;
    description: string;
    xp: number;
    completed: boolean;
  }[];
  recommendedFor: string[];
}

interface ProjectRecommendationsProps {
  selectedCareers: string[];
  skillsData: {
    frontend: number;
    backend: number;
    design: number;
    database: number;
    devops: number;
  };
  onProjectComplete?: (projectId: string, xp: number, sp: number) => void;
}

export function ProjectRecommendations({ 
  selectedCareers, 
  skillsData,
  onProjectComplete 
}: ProjectRecommendationsProps) {
  const { t } = useTranslation();
  const [activeProjects, setActiveProjects] = useState<string[]>([]);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, number[]>>({});

  const projects: Project[] = [
    {
      id: 'proj-1',
      title: '个人作品集网站',
      description: '打造一个展示你技能和项目的专业作品集网站，包含响应式设计、动画效果和暗黑模式',
      category: '前端开发',
      difficulty: 'beginner',
      duration: '1-2周',
      xpReward: 500,
      skillPointsReward: 3,
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Responsive Design'],
      icon: <Code className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      recommendedFor: ['前端开发工程师', 'UI/UX设计师'],
      milestones: [
        {
          title: '设计原型和规划',
          description: '设计网站结构和UI布局',
          xp: 100,
          completed: false,
        },
        {
          title: '实现首页和导航',
          description: '创建响应式导航栏和首页设计',
          xp: 150,
          completed: false,
        },
        {
          title: '项目展示页面',
          description: '实现项目卡片和详情页面',
          xp: 150,
          completed: false,
        },
        {
          title: '添加动画和交互',
          description: '使用CSS/JS添加平滑过渡和动画效果',
          xp: 100,
          completed: false,
        },
      ],
    },
    {
      id: 'proj-2',
      title: 'RESTful API 待办事项后端',
      description: '使用Node.js和Express构建完整的RESTful API，包含身份认证、数据验证和错误处理',
      category: '后端开发',
      difficulty: 'intermediate',
      duration: '2-3周',
      xpReward: 800,
      skillPointsReward: 5,
      skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'REST API'],
      icon: <Database className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      recommendedFor: ['后端开发工程师', '全栈开发工程师'],
      milestones: [
        {
          title: '项目搭建和数据库设计',
          description: '初始化项目并设计MongoDB数据模型',
          xp: 150,
          completed: false,
        },
        {
          title: '用户认证系统',
          description: '实现注册、登录和JWT令牌验证',
          xp: 250,
          completed: false,
        },
        {
          title: 'CRUD操作实现',
          description: '实现待办事项的增删改查功能',
          xp: 200,
          completed: false,
        },
        {
          title: 'API文档和测试',
          description: '编写API文档和单元测试',
          xp: 200,
          completed: false,
        },
      ],
    },
    {
      id: 'proj-3',
      title: '移动端电商应用',
      description: '使用React Native开发跨平台电商应用，包含商品列表、购物车和支付流程',
      category: '移动开发',
      difficulty: 'intermediate',
      duration: '3-4周',
      xpReward: 1000,
      skillPointsReward: 6,
      skills: ['React Native', 'Redux', 'API集成', '移动UI'],
      icon: <Smartphone className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      recommendedFor: ['移动开发工程师', '全栈开发工程师'],
      milestones: [
        {
          title: '项目初始化和导航',
          description: '设置React Native项目和导航结构',
          xp: 200,
          completed: false,
        },
        {
          title: '商品列表和详情页',
          description: '实现商品展示和搜索功能',
          xp: 300,
          completed: false,
        },
        {
          title: '购物车功能',
          description: '实现购物车状态管理和计算',
          xp: 250,
          completed: false,
        },
        {
          title: '支付流程集成',
          description: '集成支付API和订单管理',
          xp: 250,
          completed: false,
        },
      ],
    },
    {
      id: 'proj-4',
      title: 'AI智能聊天机器人',
      description: '构建一个基于机器学习的聊天机器人，使用自然语言处理技术理解用户意图',
      category: 'AI/机器学习',
      difficulty: 'advanced',
      duration: '4-6周',
      xpReward: 1500,
      skillPointsReward: 10,
      skills: ['Python', 'TensorFlow', 'NLP', 'FastAPI'],
      icon: <Brain className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-500',
      recommendedFor: ['AI/机器学习工程师'],
      milestones: [
        {
          title: '数据收集和预处理',
          description: '收集对话数据并进行清洗和标注',
          xp: 300,
          completed: false,
        },
        {
          title: '模型训练',
          description: '训练意图识别和实体提取模型',
          xp: 500,
          completed: false,
        },
        {
          title: '对话管理系统',
          description: '实现上下文管理和对话流程',
          xp: 400,
          completed: false,
        },
        {
          title: 'API部署',
          description: '使用FastAPI部署模型服务',
          xp: 300,
          completed: false,
        },
      ],
    },
    {
      id: 'proj-5',
      title: 'DevOps CI/CD 流水线',
      description: '为项目配置完整的CI/CD流水线，包含自动化测试、构建和部署到云平台',
      category: 'DevOps',
      difficulty: 'advanced',
      duration: '2-3周',
      xpReward: 900,
      skillPointsReward: 7,
      skills: ['Docker', 'Jenkins', 'Kubernetes', 'AWS/Azure'],
      icon: <Cloud className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-500',
      recommendedFor: ['DevOps工程师', '全栈开发工程师'],
      milestones: [
        {
          title: '容器化应用',
          description: '编写Dockerfile并构建容器镜像',
          xp: 200,
          completed: false,
        },
        {
          title: '配置Jenkins流水线',
          description: '设置自动化测试和构建流程',
          xp: 300,
          completed: false,
        },
        {
          title: 'Kubernetes部署',
          description: '创建K8s配置并部署到集群',
          xp: 250,
          completed: false,
        },
        {
          title: '监控和日志',
          description: '配置监控告警和日志收集',
          xp: 150,
          completed: false,
        },
      ],
    },
    {
      id: 'proj-6',
      title: 'UI设计系统',
      description: '设计并实现一套完整的UI组件库，包含设计规范、组件和使用文档',
      category: 'UI/UX设计',
      difficulty: 'intermediate',
      duration: '3-4周',
      xpReward: 750,
      skillPointsReward: 5,
      skills: ['Figma', 'React', 'Storybook', '设计系统'],
      icon: <Palette className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      recommendedFor: ['UI/UX设计师', '前端开发工程师'],
      milestones: [
        {
          title: '设计规范定义',
          description: '定义颜色、字体、间距等设计token',
          xp: 150,
          completed: false,
        },
        {
          title: '基础组件设计',
          description: '在Figma中设计按钮、输入框等组件',
          xp: 200,
          completed: false,
        },
        {
          title: '组件开发',
          description: '使用React实现可复用组件',
          xp: 250,
          completed: false,
        },
        {
          title: 'Storybook文档',
          description: '编写组件文档和使用示例',
          xp: 150,
          completed: false,
        },
      ],
    },
  ];

  // Filter projects based on selected careers
  const recommendedProjects = projects.filter(project =>
    project.recommendedFor.some(career => selectedCareers.includes(career))
  );

  const otherProjects = projects.filter(project =>
    !project.recommendedFor.some(career => selectedCareers.includes(career))
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return t('customProject.difficultyBeginner');
      case 'intermediate': return t('customProject.difficultyIntermediate');
      case 'advanced': return t('customProject.difficultyAdvanced');
      default: return '';
    }
  };

  const startProject = (projectId: string) => {
    if (!activeProjects.includes(projectId)) {
      setActiveProjects(prev => [...prev, projectId]);
      toast.success(t('customProject.projectStarted'));
    }
  };

  const toggleMilestone = (projectId: string, milestoneIndex: number) => {
    setCompletedMilestones(prev => {
      const projectMilestones = prev[projectId] || [];
      const isCompleted = projectMilestones.includes(milestoneIndex);
      
      if (isCompleted) {
        return {
          ...prev,
          [projectId]: projectMilestones.filter(i => i !== milestoneIndex),
        };
      } else {
        const project = projects.find(p => p.id === projectId);
        const milestone = project?.milestones[milestoneIndex];
        
        toast.success(t('customProject.milestoneComplete', { xp: milestone?.xp ?? 0 }), {
          icon: '🎉',
        });
        
        return {
          ...prev,
          [projectId]: [...projectMilestones, milestoneIndex],
        };
      }
    });
  };

  const completeProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const completedCount = completedMilestones[projectId]?.length || 0;
    if (completedCount === project.milestones.length) {
      toast.success(
        t('customProject.projectComplete', { xp: project.xpReward, skillPoints: project.skillPointsReward }),
        {
          icon: '🏆',
          duration: 5000,
        }
      );
      
      setActiveProjects(prev => prev.filter(id => id !== projectId));
      onProjectComplete?.(projectId, project.xpReward, project.skillPointsReward);
    } else {
      toast.error(t('customProject.completeAllMilestones'));
    }
  };

  const getProjectProgress = (projectId: string, totalMilestones: number) => {
    const completed = completedMilestones[projectId]?.length || 0;
    return (completed / totalMilestones) * 100;
  };

  const renderProjectCard = (project: Project, isRecommended: boolean) => {
    const isActive = activeProjects.includes(project.id);
    const progress = getProjectProgress(project.id, project.milestones.length);
    const completedCount = completedMilestones[project.id]?.length || 0;

    return (
      <Card
        key={project.id}
        className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all ${
          isActive ? 'ring-2 ring-purple-500' : ''
        }`}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 bg-gradient-to-br ${project.color} rounded-xl text-white flex-shrink-0`}>
              {project.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <CardTitle className="text-white text-xl">{project.title}</CardTitle>
                {isRecommended && (
                  <Badge className="bg-yellow-500 text-black flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    推荐
                  </Badge>
                )}
              </div>
              <CardDescription className="text-gray-400">{project.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge className={`${getDifficultyColor(project.difficulty)} text-white`}>
              {getDifficultyText(project.difficulty)}
            </Badge>
            <span className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              {project.duration}
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <Zap className="w-4 h-4" />
              +{project.xpReward} XP
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Trophy className="w-4 h-4" />
              +{project.skillPointsReward} SP
            </span>
          </div>

          {/* Skills */}
          <div>
            <p className="text-gray-500 text-sm mb-2">所需技能</p>
            <div className="flex flex-wrap gap-2">
              {project.skills.map(skill => (
                <Badge key={skill} variant="outline" className="text-gray-300 border-gray-600">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Milestones (shown only when active) */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      项目里程碑
                    </h4>
                    <span className="text-sm text-gray-400">
                      {completedCount}/{project.milestones.length}
                    </span>
                  </div>

                  <Progress value={progress} className="h-2 mb-4" />

                  <div className="space-y-2">
                    {project.milestones.map((milestone, index) => {
                      const isCompleted = completedMilestones[project.id]?.includes(index);
                      
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isCompleted
                              ? 'bg-green-500/10 border-green-500/50'
                              : 'bg-slate-700/30 border-slate-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleMilestone(project.id, index)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h5 className={`font-semibold mb-1 ${
                                isCompleted ? 'text-green-400 line-through' : 'text-white'
                              }`}>
                                {milestone.title}
                              </h5>
                              <p className="text-sm text-gray-400">{milestone.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                                  +{milestone.xp} XP
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {!isActive ? (
              <Button
                onClick={() => startProject(project.id)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('customProject.startProject')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => completeProject(project.id)}
                  disabled={completedCount !== project.milestones.length}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Award className="w-4 h-4 mr-2" />
                  {t('customProject.completeProject')}
                </Button>
                <Button
                  onClick={() => setActiveProjects(prev => prev.filter(id => id !== project.id))}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  {t('customProject.abandonProject')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Recommended Projects */}
      {recommendedProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FolderKanban className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">{t('customProject.title')}</h3>
          </div>
          <p className="text-gray-400 mb-6">{t('customProject.selectNodeForSuggestions')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendedProjects.map(project => renderProjectCard(project, true))}
          </div>
        </div>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FolderKanban className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">{t('customProject.exploreMoreProjects')}</h3>
          </div>
          <p className="text-gray-400 mb-6">{t('customProject.projectBonus')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {otherProjects.map(project => renderProjectCard(project, false))}
          </div>
        </div>
      )}

      {/* Active Projects Summary */}
      {activeProjects.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              {t('customProject.activeProjects', { count: activeProjects.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{t('customProject.activeProjectsHint')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
