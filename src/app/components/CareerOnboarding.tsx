import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Code, 
  Palette, 
  Database, 
  Cloud, 
  Smartphone,
  Brain,
  LineChart,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface Career {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  salary: string;
  demand: number;
  color: string;
}

interface CareerOnboardingProps {
  onComplete: (selectedCareers: string[]) => void;
}

export function CareerOnboarding({ onComplete }: CareerOnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);

  const careers: Career[] = [
    {
      id: 'frontend',
      name: '前端开发工程师',
      icon: <Code className="w-8 h-8" />,
      description: '构建用户界面和交互体验，让网页更加美观易用',
      skills: ['HTML/CSS', 'JavaScript', 'React/Vue', 'UI/UX设计'],
      difficulty: 'beginner',
      salary: '15-35K',
      demand: 95,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'backend',
      name: '后端开发工程师',
      icon: <Database className="w-8 h-8" />,
      description: '负责服务器端逻辑、数据库设计和API开发',
      skills: ['Java/Python', 'SQL/NoSQL', 'API设计', '系统架构'],
      difficulty: 'intermediate',
      salary: '18-40K',
      demand: 92,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'fullstack',
      name: '全栈开发工程师',
      icon: <Rocket className="w-8 h-8" />,
      description: '精通前后端技术，能够独立完成完整产品开发',
      skills: ['前端框架', 'Node.js', '数据库', 'DevOps'],
      difficulty: 'advanced',
      salary: '25-50K',
      demand: 88,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'mobile',
      name: '移动开发工程师',
      icon: <Smartphone className="w-8 h-8" />,
      description: '开发iOS和Android应用，创建移动端体验',
      skills: ['React Native', 'Flutter', 'Swift/Kotlin', '移动UI'],
      difficulty: 'intermediate',
      salary: '20-40K',
      demand: 85,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'ui-designer',
      name: 'UI/UX设计师',
      icon: <Palette className="w-8 h-8" />,
      description: '设计用户界面和交互流程，提升用户体验',
      skills: ['Figma/Sketch', '用户研究', '交互设计', '视觉设计'],
      difficulty: 'beginner',
      salary: '12-30K',
      demand: 82,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'devops',
      name: 'DevOps工程师',
      icon: <Cloud className="w-8 h-8" />,
      description: '负责自动化部署、持续集成和系统运维',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      difficulty: 'advanced',
      salary: '22-45K',
      demand: 78,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      id: 'ai-engineer',
      name: 'AI/机器学习工程师',
      icon: <Brain className="w-8 h-8" />,
      description: '研究和开发人工智能解决方案，构建智能系统',
      skills: ['Python', 'TensorFlow', '深度学习', '数据科学'],
      difficulty: 'advanced',
      salary: '30-60K',
      demand: 90,
      color: 'from-violet-500 to-purple-500',
    },
    {
      id: 'data-analyst',
      name: '数据分析师',
      icon: <LineChart className="w-8 h-8" />,
      description: '从数据中提取洞察，支持业务决策',
      skills: ['SQL', 'Python/R', 'BI工具', '统计学'],
      difficulty: 'intermediate',
      salary: '15-35K',
      demand: 86,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'security',
      name: '网络安全工程师',
      icon: <Shield className="w-8 h-8" />,
      description: '保护系统和数据安全，防范网络攻击',
      skills: ['渗透测试', '加密技术', '安全协议', '威胁分析'],
      difficulty: 'advanced',
      salary: '20-45K',
      demand: 75,
      color: 'from-red-500 to-pink-500',
    },
  ];

  const toggleCareer = (careerId: string) => {
    setSelectedCareers(prev => {
      if (prev.includes(careerId)) {
        return prev.filter(id => id !== careerId);
      }
      return [...prev, careerId];
    });
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-500 text-white">入门友好</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-500 text-white">中等难度</Badge>;
      case 'advanced':
        return <Badge className="bg-red-500 text-white">高级进阶</Badge>;
      default:
        return null;
    }
  };

  const handleContinue = () => {
    if (selectedCareers.length === 0) return;
    
    if (step === 0) {
      setStep(1);
    } else {
      const careerNames = selectedCareers.map(id => 
        careers.find(c => c.id === id)?.name || id
      );
      onComplete(careerNames);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                欢迎来到技能树系统
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                选择你感兴趣的职业方向，我们将为你定制专属学习路径
              </p>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-lg px-4 py-2">
                💡 可以选择多个职业方向
              </Badge>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-5xl font-bold text-white mb-4">
                太棒了！准备开始你的学习之旅
              </h1>
              <p className="text-xl text-gray-300">
                你选择了 {selectedCareers.length} 个职业方向
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Career Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {careers.map((career, index) => {
            const isSelected = selectedCareers.includes(career.id);
            
            return (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:scale-105 bg-slate-800/50 backdrop-blur-sm border-2 ${
                    isSelected
                      ? 'ring-4 ring-purple-500 border-purple-500 bg-gradient-to-br ' + career.color + ' bg-opacity-20'
                      : 'border-slate-700 hover:border-purple-500/50'
                  }`}
                  onClick={() => toggleCareer(career.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${career.color} text-white`}>
                        {career.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          </motion.div>
                        )}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCareer(career.id)}
                          className="w-5 h-5"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {career.name}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {career.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      {getDifficultyBadge(career.difficulty)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">薪资范围</span>
                        <span className="text-green-400 font-semibold">{career.salary}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">市场需求</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${career.demand}%` }}
                            />
                          </div>
                          <span className="text-green-400 font-semibold">{career.demand}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-xs text-gray-500 mb-2">核心技能</p>
                      <div className="flex flex-wrap gap-1">
                        {career.skills.slice(0, 3).map(skill => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs bg-slate-700 text-gray-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {career.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-slate-700 text-gray-300">
                            +{career.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          {step === 1 && (
            <Button
              onClick={() => setStep(0)}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800"
              size="lg"
            >
              返回修改
            </Button>
          )}
          
          <Button
            onClick={handleContinue}
            disabled={selectedCareers.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
            size="lg"
          >
            {step === 0 ? (
              <>
                继续 ({selectedCareers.length} 个已选)
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                开始学习之旅
                <Rocket className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {selectedCareers.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 mt-4"
          >
            请至少选择一个职业方向
          </motion.p>
        )}
      </div>
    </div>
  );
}
