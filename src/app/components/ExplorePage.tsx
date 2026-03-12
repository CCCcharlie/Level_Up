import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProjectRecommendations } from './ProjectRecommendations';
import { 
  Sparkles, 
  TrendingUp, 
  Target,
  BookOpen,
  Award,
  Clock,
  Zap,
  Lightbulb,
  ArrowRight,
  Star,
  Brain,
  Rocket,
  ChevronRight,
  FolderKanban
} from 'lucide-react';
import { motion } from 'motion/react';

interface ExplorePageProps {
  selectedCareers: string[];
  skillsData: {
    frontend: number;
    backend: number;
    design: number;
    database: number;
    devops: number;
  };
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  matchScore: number;
  skills: string[];
  difficulty: string;
  estimatedTime: string;
  icon: React.ReactNode;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: string[];
  duration: string;
  skills: string[];
  level: string;
}

export function ExplorePage({ selectedCareers, skillsData }: ExplorePageProps) {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // AI Recommendations based on current skills
  const recommendations: Recommendation[] = [
    {
      id: 'rec-1',
      title: '深入学习TypeScript',
      reason: '你的JavaScript基础很好，TypeScript能提升代码质量和开发效率',
      matchScore: 95,
      skills: ['TypeScript', '类型系统', '高级特性'],
      difficulty: '中级',
      estimatedTime: '2-3周',
      icon: <Code className="w-6 h-6" />,
    },
    {
      id: 'rec-2',
      title: 'Next.js全栈开发',
      reason: '基于你的React技能，Next.js是自然的进阶选择',
      matchScore: 88,
      skills: ['Next.js', 'SSR', 'API Routes'],
      difficulty: '中级',
      estimatedTime: '3-4周',
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      id: 'rec-3',
      title: 'GraphQL API设计',
      reason: '相比REST API，GraphQL能让你的后端技能更上一层楼',
      matchScore: 82,
      skills: ['GraphQL', 'Apollo', 'Schema设计'],
      difficulty: '中高级',
      estimatedTime: '2周',
      icon: <Database className="w-6 h-6" />,
    },
    {
      id: 'rec-4',
      title: '系统设计与架构',
      reason: '你已具备多项技能，是时候学习整体系统架构了',
      matchScore: 78,
      skills: ['微服务', '负载均衡', '缓存策略'],
      difficulty: '高级',
      estimatedTime: '4-6周',
      icon: <Brain className="w-6 h-6" />,
    },
  ];

  // Learning Paths
  const learningPaths: LearningPath[] = [
    {
      id: 'path-1',
      title: '现代化前端工程师进阶路径',
      description: '从React基础到高级架构设计的完整学习路径',
      steps: [
        'React Hooks深度掌握',
        '状态管理 (Redux/Zustand)',
        '性能优化技巧',
        '测试驱动开发',
        '前端工程化',
      ],
      duration: '3个月',
      skills: ['React', 'TypeScript', '测试', '性能优化'],
      level: '中高级',
    },
    {
      id: 'path-2',
      title: '全栈开发者养成计划',
      description: '掌握前后端全栈开发能力，独立完成项目',
      steps: [
        'Node.js后端开发',
        'RESTful API设计',
        '数据库设计与优化',
        '身份认证与授权',
        '部署与运维',
      ],
      duration: '4个月',
      skills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
      level: '中级',
    },
    {
      id: 'path-3',
      title: 'DevOps实战精通',
      description: '从容器化到自动化部署的完整DevOps流程',
      steps: [
        'Docker容器化',
        'Kubernetes编排',
        'CI/CD流水线',
        '监控与日志',
        '云原生架构',
      ],
      duration: '2.5个月',
      skills: ['Docker', 'K8s', 'Jenkins', 'AWS/Azure'],
      level: '高级',
    },
  ];

  // Career insights
  const insights = [
    {
      title: '技能缺口分析',
      description: '你在后端开发方面还有提升空间，建议加强Node.js和数据库技能',
      type: 'warning',
      icon: <Target className="w-5 h-5" />,
      action: '查看推荐课程',
    },
    {
      title: '优势技能',
      description: '你的前端技能已经达到中高级水平，可以考虑学习更高级的架构设计',
      type: 'success',
      icon: <Award className="w-5 h-5" />,
      action: '探索高级课程',
    },
    {
      title: '学习建议',
      description: '根据你的学习速度，预计6个月可以达到全栈开发工程师水平',
      type: 'info',
      icon: <Lightbulb className="w-5 h-5" />,
      action: '制定学习计划',
    },
  ];

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'warning': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'info': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                AI 智能职业探索
              </h2>
              <p className="text-gray-300 mb-4">
                基于你的技能水平和职业方向，我们为你推荐最适合的学习路径
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCareers.map(career => (
                  <Badge key={career} className="bg-purple-600 text-white">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${getTypeColor(insight.type)} backdrop-blur-sm h-full`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
                    <p className="text-gray-300 text-sm">{insight.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  {insight.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="projects" className="data-[state=active]:bg-green-600">
            <FolderKanban className="w-4 h-4 mr-2" />
            实战项目
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-600">
            <Sparkles className="w-4 h-4 mr-2" />
            AI 推荐
          </TabsTrigger>
          <TabsTrigger value="paths" className="data-[state=active]:bg-blue-600">
            <BookOpen className="w-4 h-4 mr-2" />
            学习路径
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <ProjectRecommendations 
            selectedCareers={selectedCareers} 
            skillsData={skillsData}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all hover:scale-[1.02]">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white flex-shrink-0">
                        {rec.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {rec.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-3">
                              <Lightbulb className="w-4 h-4 inline mr-1 text-yellow-400" />
                              {rec.reason}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              <span className={`text-2xl font-bold ${getMatchColor(rec.matchScore)}`}>
                                {rec.matchScore}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">匹配度</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {rec.skills.map(skill => (
                            <Badge key={skill} variant="secondary" className="bg-slate-700 text-gray-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {rec.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {rec.estimatedTime}
                            </span>
                          </div>

                          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            开始学习
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paths" className="mt-6">
          <div className="space-y-4">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl mb-2">
                          {path.title}
                        </CardTitle>
                        <p className="text-gray-400 text-sm">{path.description}</p>
                      </div>
                      <Badge className="bg-blue-600 text-white ml-4">
                        {path.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Learning Steps */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          学习步骤
                        </h4>
                        <div className="space-y-2">
                          {path.steps.map((step, stepIndex) => (
                            <div
                              key={stepIndex}
                              className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg"
                            >
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {stepIndex + 1}
                              </div>
                              <span className="text-gray-300 text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills & Duration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                        <div>
                          <p className="text-gray-500 text-sm mb-2">涉及技能</p>
                          <div className="flex flex-wrap gap-2">
                            {path.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-gray-300 border-gray-600">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm mb-2">预计时长</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-semibold">{path.duration}</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                        开始此路径
                        <Rocket className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            你的学习进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(skillsData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm capitalize">{key}</span>
                  <span className="text-white font-bold">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Missing imports
import { Code, Database } from 'lucide-react';