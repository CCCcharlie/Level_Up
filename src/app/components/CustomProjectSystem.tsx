import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Equipment } from './EquipmentSystem';
import {
  Plus,
  Sparkles,
  Award,
  Star,
  Zap,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Code,
  Palette,
  Database,
  Server,
  Cloud,
  Brain,
  Sword
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CustomProject {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  skillsUsed: string[];
  aiRating: {
    score: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xpReward: number;
    skillPointsReward: number;
    feedback: string[];
    strengths: string[];
    improvements: string[];
  } | null;
  status: 'draft' | 'rated' | 'completed';
  createdAt: Date;
}

interface CustomProjectSystemProps {
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
  onProjectComplete?: (projectTitle: string, category: string, aiScore: number, difficulty: string, xp: number, sp: number, skillsUsed: string[]) => void;
}

export function CustomProjectSystem({ onProjectComplete }: CustomProjectSystemProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projects, setProjects] = useState<CustomProject[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimatedTime: '',
    skillsUsed: '',
  });

  const aiRecommendedProjects = [
    {
      title: '智能待办事项应用',
      description: '使用AI自动分类和优先级排序的待办应用',
      category: '全栈',
      skills: ['React', 'Node.js', 'MongoDB', 'AI/ML'],
      difficulty: 'intermediate' as const,
    },
    {
      title: '实时协作白板',
      description: '多人实时协作的在线白板工具，支持绘图和文本',
      category: '前端',
      skills: ['React', 'WebSocket', 'Canvas API'],
      difficulty: 'intermediate' as const,
    },
    {
      title: '个性化新闻聚合器',
      description: '根据用户兴趣推荐新闻的聚合平台',
      category: '全栈',
      skills: ['Next.js', 'API集成', 'PostgreSQL'],
      difficulty: 'intermediate' as const,
    },
  ];

  const simulateAIRating = (project: Omit<CustomProject, 'id' | 'aiRating' | 'status' | 'createdAt'>) => {
    // Simulate AI analysis delay
    const skillCount = project.skillsUsed.length;
    const descriptionLength = project.description.length;
    
    // Calculate difficulty based on skills and description
    let difficulty: 'beginner' | 'intermediate' | 'advanced';
    let score = 0;
    let xpReward = 0;
    let skillPointsReward = 0;

    if (skillCount <= 2 && descriptionLength < 200) {
      difficulty = 'beginner';
      score = 65 + Math.floor(Math.random() * 20);
      xpReward = 300 + Math.floor(Math.random() * 200);
      skillPointsReward = 2;
    } else if (skillCount <= 4 || descriptionLength < 400) {
      difficulty = 'intermediate';
      score = 70 + Math.floor(Math.random() * 20);
      xpReward = 500 + Math.floor(Math.random() * 300);
      skillPointsReward = 4;
    } else {
      difficulty = 'advanced';
      score = 75 + Math.floor(Math.random() * 20);
      xpReward = 800 + Math.floor(Math.random() * 500);
      skillPointsReward = 6;
    }

    const feedbackTemplates = [
      '项目创意独特，具有实际应用价值',
      '技术栈选择合理，符合项目需求',
      '项目描述清晰，目标明确',
      '涉及的技能点覆盖面广',
      '具有良好的学习和实践价值',
    ];

    const strengthTemplates = [
      '充分利用了现代前端技术',
      '数据架构设计合理',
      '考虑了用户体验',
      '具有扩展性',
      '技术难度适中，适合学习',
    ];

    const improvementTemplates = [
      '可以考虑添加单元试',
      '建议实现CI/CD流程',
      '可以优化性能监控',
      '考虑添加错误追踪',
      '建议增加文档完善度',
    ];

    return {
      score,
      difficulty,
      xpReward,
      skillPointsReward,
      feedback: feedbackTemplates.slice(0, 3),
      strengths: strengthTemplates.slice(0, 2),
      improvements: improvementTemplates.slice(0, 2),
    };
  };

  const handleCreateProject = () => {
    if (!formData.title || !formData.description) {
      toast.error('请填写项目标题和描述');
      return;
    }

    const newProject: CustomProject = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category || '自定义',
      estimatedTime: formData.estimatedTime || '待定',
      skillsUsed: formData.skillsUsed.split(',').map(s => s.trim()).filter(Boolean),
      aiRating: null,
      status: 'draft',
      createdAt: new Date(),
    };

    setProjects(prev => [newProject, ...prev]);
    setFormData({
      title: '',
      description: '',
      category: '',
      estimatedTime: '',
      skillsUsed: '',
    });
    setShowCreateForm(false);
    toast.success('项目创建成功！点击"AI评级"获取智能分析', { icon: '✅' });
  };

  const handleAIRate = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    toast.loading('AI正在分析你的项目...', { id: 'ai-rating' });

    setTimeout(() => {
      const rating = simulateAIRating(project);
      
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, aiRating: rating, status: 'rated' as const }
          : p
      ));

      toast.success(`AI评级完成！得分: ${rating.score}/100`, { 
        id: 'ai-rating',
        icon: '🎯',
        duration: 3000
      });
    }, 2000);
  };

  const handleUseRecommendation = (rec: typeof aiRecommendedProjects[0]) => {
    setFormData({
      title: rec.title,
      description: rec.description,
      category: rec.category,
      estimatedTime: '1-2周',
      skillsUsed: rec.skills.join(', '),
    });
    setShowCreateForm(true);
    toast.success('已应用AI推荐项目模板', { icon: '✨' });
  };

  const completeProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.aiRating) return;

    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'completed' as const } : p
    ));

    toast.success(
      `项目完成！获得 ${project.aiRating.xpReward} XP 和 ${project.aiRating.skillPointsReward} 技能点`,
      { icon: '🎉', duration: 5000 }
    );

    onProjectComplete?.(project.title, project.category, project.aiRating.score, project.aiRating.difficulty, project.aiRating.xpReward, project.aiRating.skillPointsReward, project.skillsUsed);
  };

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
      case 'beginner': return '入门';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('前端')) return <Code className="w-5 h-5" />;
    if (category.includes('后端')) return <Server className="w-5 h-5" />;
    if (category.includes('数据')) return <Database className="w-5 h-5" />;
    if (category.includes('AI') || category.includes('ML')) return <Brain className="w-5 h-5" />;
    if (category.includes('DevOps')) return <Cloud className="w-5 h-5" />;
    return <Target className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">自定义项目系统</h2>
                <p className="text-gray-300 mb-3">
                  创建你的项目，让AI评估难度并给出智能反馈
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">
                    我的项目: <span className="text-purple-400 font-bold">{projects.length}</span>
                  </span>
                  <span className="text-gray-400">
                    已完成: <span className="text-green-400 font-bold">{projects.filter(p => p.status === 'completed').length}</span>
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建项目
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommended Projects */}
      {projects.length === 0 && !showCreateForm && (
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              AI推荐项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">根据当前流行趋势和你的技能水平，AI为你推荐以下项目</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiRecommendedProjects.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-blue-500/50 transition-all"
                >
                  <h4 className="text-white font-semibold mb-2">{rec.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{rec.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rec.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Badge className={`${getDifficultyColor(rec.difficulty)} text-white mb-3`}>
                    {getDifficultyText(rec.difficulty)}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleUseRecommendation(rec)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    使用此模板
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">创建新项目</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">项目标题 *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：智能待办事项应用"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">项目描述 *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="详细描述你的项目功能、目标和特色..."
                    className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">项目类别</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="例如：前端、全栈、移动端"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">预计时间</label>
                    <Input
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="例如：2-3周"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">使用的技能（用逗号分隔）</label>
                  <Input
                    value={formData.skillsUsed}
                    onChange={(e) => setFormData({ ...formData, skillsUsed: e.target.value })}
                    placeholder="例如：React, Node.js, MongoDB"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateProject}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    创建项目
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="border-gray-500 text-gray-400"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold">我的项目</h3>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-slate-800/50 border-slate-700 ${
                project.status === 'completed' ? 'opacity-70' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white">
                      {getCategoryIcon(project.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-white text-lg">{project.title}</CardTitle>
                        {project.status === 'completed' && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            已完成
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-gray-400">
                          {project.category}
                        </Badge>
                        <Badge variant="outline" className="text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {project.estimatedTime}
                        </Badge>
                      </div>

                      {project.skillsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.skillsUsed.map(skill => (
                            <Badge key={skill} className="bg-blue-600/20 text-blue-400 border-0">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* AI Rating Results */}
                  {project.aiRating && (
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-4 border border-purple-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h4 className="text-white font-semibold">AI评级结果</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-black/30 p-3 rounded-lg">
                              <p className="text-gray-400 text-xs mb-1">综合得分</p>
                              <p className="text-yellow-400 text-2xl font-bold">{project.aiRating.score}</p>
                              <p className="text-gray-500 text-xs">/100</p>
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg">
                              <p className="text-gray-400 text-xs mb-1">难度等级</p>
                              <Badge className={`${getDifficultyColor(project.aiRating.difficulty)} text-white mt-1`}>
                                {getDifficultyText(project.aiRating.difficulty)}
                              </Badge>
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg">
                              <p className="text-gray-400 text-xs mb-1">奖励</p>
                              <div className="flex flex-col gap-1 mt-1">
                                <span className="text-blue-400 text-sm">+{project.aiRating.xpReward} XP</span>
                                <span className="text-yellow-400 text-sm">+{project.aiRating.skillPointsReward} SP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-green-400 font-semibold text-sm mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            项目优势
                          </h5>
                          <ul className="space-y-1">
                            {project.aiRating.strengths.map((strength, i) => (
                              <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-yellow-400 font-semibold text-sm mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            改进建议
                          </h5>
                          <ul className="space-y-1">
                            {project.aiRating.improvements.map((improvement, i) => (
                              <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                                <Target className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {project.status === 'draft' && (
                      <Button
                        onClick={() => handleAIRate(project.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI评级
                      </Button>
                    )}

                    {project.status === 'rated' && (
                      <Button
                        onClick={() => completeProject(project.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        标记完成
                      </Button>
                    )}

                    {project.status === 'completed' && (
                      <Badge className="flex-1 bg-green-600 text-white justify-center py-2">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        项目已完成
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}