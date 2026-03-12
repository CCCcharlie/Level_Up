import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Star,
  Sparkles,
  Lock,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Code,
  Database,
  Server,
  Palette,
  Shield,
  Cloud,
  Brain,
  Smartphone,
  Globe,
  Terminal,
  Layout,
  GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// 定义技能所属职业类别
const skillCareerMapping: Record<string, string[]> = {
  'frontend': ['前端工程师', 'UI/UX设计师', '全栈工程师', '移动端开发'],
  'backend': ['后端工程师', '全栈工程师', 'DevOps工程师', '云架构师'],
  'design': ['UI/UX设计师', '前端工程师', '产品经理'],
  'database': ['后端工程师', '数据工程师', '全栈工程师', 'DevOps工程师'],
  'devops': ['DevOps工程师', '云架构师', '后端工程师'],
  'mobile': ['移动端开发', '全栈工程师', '前端工程师'],
  'ai': ['AI/ML工程师', '数据工程师', '后端工程师'],
};

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  currentLevel: number;
  maxLevel: number;
  costPerLevel: number;
  prerequisites: string[];
  unlocked: boolean;
  angle: number; // 0-360 degrees
  radius: number; // distance from center (0-3 rings)
}

interface Task {
  id: string;
  title: string;
  description: string;
  requiredSkills: { skillId: string; minLevel: number }[];
  rewards: {
    xp: number;
    skillPoints: number;
    skillId?: string; // Optional: specific skill to boost
  };
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface StarConstellationSkillTreeProps {
  skillPoints: number;
  onSkillPointsChange: (points: number) => void;
  onSkillsDataChange: (data: any) => void;
  selectedCareers?: string[];
}

export function StarConstellationSkillTree({ 
  skillPoints, 
  onSkillPointsChange,
  onSkillsDataChange,
  selectedCareers = []
}: StarConstellationSkillTreeProps) {
  const [skills, setSkills] = useState<Skill[]>([
    // Center Core Skill
    {
      id: 'core',
      name: '编程基础',
      category: '核心',
      description: '所有技能的起点',
      icon: <Star className="w-8 h-8" />,
      currentLevel: 5,
      maxLevel: 5,
      costPerLevel: 0,
      prerequisites: [],
      unlocked: true,
      angle: 0,
      radius: 0,
    },
    
    // Ring 1 - Basic Skills (6 skills, 60 degrees apart)
    {
      id: 'html',
      name: 'HTML',
      category: '前端',
      description: '页结构基础',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 5,
      maxLevel: 5,
      costPerLevel: 1,
      prerequisites: ['core'],
      unlocked: true,
      angle: 0,
      radius: 1,
    },
    {
      id: 'css',
      name: 'CSS',
      category: '前端',
      description: '样式设计',
      icon: <Palette className="w-6 h-6" />,
      currentLevel: 5,
      maxLevel: 5,
      costPerLevel: 1,
      prerequisites: ['core'],
      unlocked: true,
      angle: 60,
      radius: 1,
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      category: '前端',
      description: '前端编程语言',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 4,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['core'],
      unlocked: true,
      angle: 120,
      radius: 1,
    },
    {
      id: 'sql',
      name: 'SQL',
      category: '数据库',
      description: '数据库查询',
      icon: <Database className="w-6 h-6" />,
      currentLevel: 3,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['core'],
      unlocked: true,
      angle: 180,
      radius: 1,
    },
    {
      id: 'git',
      name: 'Git',
      category: '工具',
      description: '版本控制',
      icon: <GitBranch className="w-6 h-6" />,
      currentLevel: 4,
      maxLevel: 5,
      costPerLevel: 1,
      prerequisites: ['core'],
      unlocked: true,
      angle: 240,
      radius: 1,
    },
    {
      id: 'nodejs-basic',
      name: 'Node基础',
      category: '后端',
      description: 'JavaScript运行时',
      icon: <Server className="w-6 h-6" />,
      currentLevel: 2,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['core'],
      unlocked: true,
      angle: 300,
      radius: 1,
    },

    // Ring 2 - Intermediate Skills
    {
      id: 'react',
      name: 'React',
      category: '前端',
      description: 'UI框架',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 3,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['javascript', 'html', 'css'],
      unlocked: true,
      angle: 30,
      radius: 2,
    },
    {
      id: 'vue',
      name: 'Vue.js',
      category: '前端',
      description: '渐进式框架',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['javascript'],
      unlocked: true,
      angle: 90,
      radius: 2,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: '前端',
      description: '类型化JS',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 2,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['javascript'],
      unlocked: true,
      angle: 150,
      radius: 2,
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: '数据库',
      description: 'NoSQL数据库',
      icon: <Database className="w-6 h-6" />,
      currentLevel: 2,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['sql', 'nodejs-basic'],
      unlocked: true,
      angle: 210,
      radius: 2,
    },
    {
      id: 'docker',
      name: 'Docker',
      category: '工具',
      description: '容器技术',
      icon: <Cloud className="w-6 h-6" />,
      currentLevel: 1,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['git', 'nodejs-basic'],
      unlocked: true,
      angle: 270,
      radius: 2,
    },
    {
      id: 'react-native',
      name: 'React Native',
      category: '移动',
      description: '移动开发',
      icon: <Smartphone className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['react'],
      unlocked: true,
      angle: 330,
      radius: 2,
    },

    // Ring 3 - Advanced Skills
    {
      id: 'nextjs',
      name: 'Next.js',
      category: '前端',
      description: 'React全栈框架',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 1,
      maxLevel: 5,
      costPerLevel: 4,
      prerequisites: ['react', 'nodejs-basic'],
      unlocked: true,
      angle: 0,
      radius: 3,
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      category: '后端',
      description: 'API查询语言',
      icon: <Database className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 4,
      prerequisites: ['nodejs-basic', 'mongodb'],
      unlocked: true,
      angle: 60,
      radius: 3,
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      category: '工具',
      description: '容器编排',
      icon: <Cloud className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 5,
      prerequisites: ['docker'],
      unlocked: false,
      angle: 120,
      radius: 3,
    },
    {
      id: 'ai-ml',
      name: 'AI/ML',
      category: 'AI',
      description: '人工智能',
      icon: <Brain className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 5,
      prerequisites: ['nodejs-basic', 'mongodb'],
      unlocked: true,
      angle: 180,
      radius: 3,
    },
    {
      id: 'security',
      name: '网络安全',
      category: '安全',
      description: 'Web安全',
      icon: <Shield className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 4,
      prerequisites: ['nodejs-basic', 'sql'],
      unlocked: true,
      angle: 240,
      radius: 3,
    },
    {
      id: 'microservices',
      name: '微服务',
      category: '后端',
      description: '服务架构',
      icon: <Server className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 5,
      prerequisites: ['docker', 'nodejs-basic'],
      unlocked: true,
      angle: 300,
      radius: 3,
    },
  ]);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Check if skill is recommended for selected career
  const isCareerRecommended = (skill: Skill) => {
    const categoryKey = skill.category.toLowerCase();
    const careerMapping = skillCareerMapping[categoryKey];
    if (!careerMapping || selectedCareers.length === 0) return false;
    return selectedCareers.some(career => careerMapping.includes(career));
  };

  // Calculate brightness/opacity based on skill level (0-1)
  const getSkillBrightness = (skill: Skill) => {
    if (!skill.unlocked) return 0.3;
    if (skill.currentLevel === 0) return 0.5;
    // Brightness increases with level: 0.6 to 1.0
    return 0.6 + (skill.currentLevel / skill.maxLevel) * 0.4;
  };

  // Center and radius for the constellation
  const centerX = 400;
  const centerY = 400;
  const ringRadii = [0, 120, 220, 320]; // Radii for each ring

  const getPosition = (angle: number, radius: number) => {
    const actualRadius = ringRadii[radius];
    const radian = (angle - 90) * (Math.PI / 180); // -90 to start from top
    return {
      x: centerX + actualRadius * Math.cos(radian),
      y: centerY + actualRadius * Math.sin(radian),
    };
  };

  const levelUpSkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    if (!skill.unlocked) {
      toast.error('技能未解锁！需要先完成前置技能。');
      return;
    }

    if (skill.currentLevel >= skill.maxLevel) {
      toast.error('技能已达到最高等级！');
      return;
    }

    if (skillPoints < skill.costPerLevel) {
      toast.error('技能点不足！');
      return;
    }

    setSkills(prev => prev.map(s => {
      if (s.id === skillId) {
        const newLevel = s.currentLevel + 1;
        
        // Unlock dependent skills
        setTimeout(() => {
          setSkills(prevSkills => prevSkills.map(dependent => {
            if (dependent.prerequisites.includes(skillId)) {
              const allPrereqsMet = dependent.prerequisites.every(prereqId => {
                const prereq = prevSkills.find(p => p.id === prereqId);
                return prereq && prereq.currentLevel > 0;
              });
              if (allPrereqsMet) {
                return { ...dependent, unlocked: true };
              }
            }
            return dependent;
          }));
        }, 100);

        return { ...s, currentLevel: newLevel };
      }
      return s;
    }));

    onSkillPointsChange(skillPoints - skill.costPerLevel);
    toast.success(`${skill.name} 升级到 LV ${skill.currentLevel + 1}！`, {
      icon: '⭐',
    });
  };

  const getSkillColor = (skill: Skill) => {
    if (!skill.unlocked) return { bg: 'from-gray-700 to-gray-800', border: 'border-gray-600' };
    if (skill.currentLevel === 0) return { bg: 'from-slate-700 to-slate-800', border: 'border-slate-500' };
    if (skill.currentLevel === skill.maxLevel) return { bg: 'from-yellow-500 to-orange-600', border: 'border-yellow-400' };
    
    // Color by category
    switch (skill.category) {
      case '前端': return { bg: 'from-blue-600 to-blue-700', border: 'border-blue-500' };
      case '后端': return { bg: 'from-green-600 to-green-700', border: 'border-green-500' };
      case '数据库': return { bg: 'from-purple-600 to-purple-700', border: 'border-purple-500' };
      case '工具': return { bg: 'from-orange-600 to-orange-700', border: 'border-orange-500' };
      case '移动': return { bg: 'from-pink-600 to-pink-700', border: 'border-pink-500' };
      case 'AI': return { bg: 'from-violet-600 to-violet-700', border: 'border-violet-500' };
      case '安全': return { bg: 'from-red-600 to-red-700', border: 'border-red-500' };
      default: return { bg: 'from-gray-600 to-gray-700', border: 'border-gray-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Constellation Canvas */}
      <div className="relative w-full overflow-auto bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 rounded-lg border-2 border-purple-500/30">
        <div className="relative w-[800px] h-[800px] mx-auto">
          {/* Background Rings */}
          {[1, 2, 3].map(ring => (
            <div
              key={ring}
              className="absolute rounded-full border border-purple-500/20"
              style={{
                left: centerX - ringRadii[ring],
                top: centerY - ringRadii[ring],
                width: ringRadii[ring] * 2,
                height: ringRadii[ring] * 2,
              }}
            />
          ))}

          {/* Constellation Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.6 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {skills.map(skill => 
              skill.prerequisites.map(prereqId => {
                const prereq = skills.find(s => s.id === prereqId);
                if (!prereq) return null;

                const start = getPosition(prereq.angle, prereq.radius);
                const end = getPosition(skill.angle, skill.radius);
                const isActive = prereq.currentLevel > 0 && skill.unlocked;

                return (
                  <line
                    key={`${prereqId}-${skill.id}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isActive ? 'url(#lineGlow)' : '#475569'}
                    strokeWidth={isActive ? 3 : 2}
                    strokeDasharray={isActive ? '0' : '5,5'}
                    filter={isActive ? 'url(#glow)' : ''}
                  />
                );
              })
            )}
          </svg>

          {/* Skill Nodes */}
          {skills.map((skill, index) => {
            const position = getPosition(skill.angle, skill.radius);
            const colors = getSkillColor(skill);
            const canLevelUp = skill.unlocked && skill.currentLevel < skill.maxLevel && skillPoints >= skill.costPerLevel;
            const size = skill.radius === 0 ? 100 : 80;
            const isRecommended = isCareerRecommended(skill);
            const brightness = getSkillBrightness(skill);
            
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03, type: 'spring' }}
                className="absolute cursor-pointer"
                style={{
                  left: position.x - size / 2,
                  top: position.y - size / 2,
                  width: size,
                  height: size,
                  zIndex: 2,
                  opacity: brightness,
                }}
                onClick={() => setSelectedSkill(skill)}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                {/* Career Recommended Breathing Light Effect */}
                {isRecommended && skill.unlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)`,
                      filter: 'blur(8px)',
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <motion.div
                  className={`relative w-full h-full rounded-full bg-gradient-to-br ${colors.bg} border-4 ${colors.border} flex items-center justify-center transition-all ${
                    selectedSkill?.id === skill.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                  } ${canLevelUp ? 'ring-2 ring-green-400 animate-pulse' : ''} ${
                    !skill.unlocked ? 'opacity-50' : 'hover:scale-110'
                  } ${isRecommended && skill.unlocked ? 'ring-2 ring-yellow-400/60' : ''}`}
                  whileHover={{ scale: skill.unlocked ? 1.1 : 1 }}
                  style={{
                    boxShadow: isRecommended && skill.unlocked 
                      ? `0 0 20px rgba(251, 191, 36, ${brightness * 0.6})` 
                      : undefined,
                  }}
                >
                  <div className="text-white flex flex-col items-center justify-center">
                    {skill.icon}
                    {skill.radius > 0 && (
                      <span className="text-xs mt-1 font-bold text-center px-1">{skill.name}</span>
                    )}
                  </div>

                  {/* Career Recommended Badge */}
                  {isRecommended && skill.unlocked && (
                    <motion.div
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                      animate={{
                        y: [-2, 2, -2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                    </motion.div>
                  )}

                  {/* Level indicator */}
                  {skill.currentLevel > 0 && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-yellow-500 rounded-full text-xs font-bold text-black border-2 border-white">
                      {skill.currentLevel}/{skill.maxLevel}
                    </div>
                  )}

                  {/* Lock icon */}
                  {!skill.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Max level check */}
                  {skill.currentLevel === skill.maxLevel && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle2 className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                    </div>
                  )}

                  {/* Can level up indicator */}
                  {canLevelUp && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Zap className="w-6 h-6 text-green-400 fill-green-400" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Tooltip on hover */}
                {hoveredSkill === skill.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-48"
                  >
                    <div className="bg-slate-900 border-2 border-purple-500/50 rounded-lg p-3 shadow-xl">
                      <h4 className="text-white font-bold mb-1">{skill.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">{skill.description}</p>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Badge className={colors.border}>{skill.category}</Badge>
                        <span className="text-yellow-400">{skill.costPerLevel} SP</span>
                      </div>
                      {isRecommended && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500 w-full justify-center mt-2">
                          <Sparkles className="w-3 h-3 mr-1" />
                          职业推荐
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Skill Detail */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className={`p-4 bg-gradient-to-br ${getSkillColor(selectedSkill).bg} rounded-xl`}>
                    {selectedSkill.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {selectedSkill.name}
                        </h3>
                        <p className="text-gray-400">{selectedSkill.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-black/30 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">当前等级</p>
                        <p className="text-white text-2xl font-bold">{selectedSkill.currentLevel} / {selectedSkill.maxLevel}</p>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">升级消耗</p>
                        <p className="text-yellow-400 text-2xl font-bold">{selectedSkill.costPerLevel} SP</p>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">状态</p>
                        <p className="text-white text-lg font-bold">
                          {!selectedSkill.unlocked ? '🔒 未解锁' : 
                           selectedSkill.currentLevel === selectedSkill.maxLevel ? '⭐ 已精通' : '📈 可升级'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => levelUpSkill(selectedSkill.id)}
                        disabled={
                          !selectedSkill.unlocked ||
                          selectedSkill.currentLevel >= selectedSkill.maxLevel ||
                          skillPoints < selectedSkill.costPerLevel
                        }
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        升级 ({selectedSkill.costPerLevel} SP)
                      </Button>
                      
                      <Button
                        onClick={() => setSelectedSkill(null)}
                        variant="outline"
                        className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                      >
                        查看相关任务
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}