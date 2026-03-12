import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Lock, 
  Star, 
  Zap, 
  CheckCircle2,
  Plus,
  Minus,
  Code,
  Palette,
  Database,
  Server,
  Cloud,
  Shield,
  Smartphone,
  GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

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
  position: { x: number; y: number };
}

interface GameSkillTreeProps {
  skillPoints: number;
  onSkillPointsChange: (points: number) => void;
  onSkillsDataChange: (data: any) => void;
}

export function GameSkillTree({ skillPoints, onSkillPointsChange, onSkillsDataChange }: GameSkillTreeProps) {
  const [skills, setSkills] = useState<Skill[]>([
    // Frontend Branch
    {
      id: 'html',
      name: 'HTML基础',
      category: '前端开发',
      description: '掌握网页结构的基础标记语言',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 5,
      maxLevel: 5,
      costPerLevel: 1,
      prerequisites: [],
      unlocked: true,
      position: { x: 1, y: 1 },
    },
    {
      id: 'css',
      name: 'CSS样式',
      category: '前端开发',
      description: '样式设计和布局技术',
      icon: <Palette className="w-6 h-6" />,
      currentLevel: 5,
      maxLevel: 5,
      costPerLevel: 1,
      prerequisites: ['html'],
      unlocked: true,
      position: { x: 2, y: 0.5 },
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      category: '前端开发',
      description: '网页交互编程语言',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 4,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['html'],
      unlocked: true,
      position: { x: 2, y: 1.5 },
    },
    {
      id: 'react',
      name: 'React框架',
      category: '前端开发',
      description: '现代化前端框架',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 3,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['javascript', 'css'],
      unlocked: true,
      position: { x: 3, y: 1 },
    },
    {
      id: 'vue',
      name: 'Vue.js',
      category: '前端开发',
      description: '渐进式前端框架',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['javascript'],
      unlocked: true,
      position: { x: 3, y: 2 },
    },
    
    // Backend Branch
    {
      id: 'nodejs',
      name: 'Node.js',
      category: '后端开发',
      description: 'JavaScript运行时环境',
      icon: <Server className="w-6 h-6" />,
      currentLevel: 2,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['javascript'],
      unlocked: true,
      position: { x: 2, y: 3 },
    },
    {
      id: 'express',
      name: 'Express',
      category: '后端开发',
      description: 'Node.js Web框架',
      icon: <Server className="w-6 h-6" />,
      currentLevel: 1,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['nodejs'],
      unlocked: true,
      position: { x: 3, y: 3 },
    },
    {
      id: 'python',
      name: 'Python',
      category: '后端开发',
      description: '通用编程语言',
      icon: <Code className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: [],
      unlocked: true,
      position: { x: 1, y: 3.5 },
    },
    
    // Database Branch
    {
      id: 'sql',
      name: 'SQL数据库',
      category: '数据库',
      description: '关系型数据库查询语言',
      icon: <Database className="w-6 h-6" />,
      currentLevel: 3,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: [],
      unlocked: true,
      position: { x: 1, y: 5 },
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: '数据库',
      description: 'NoSQL文档数据库',
      icon: <Database className="w-6 h-6" />,
      currentLevel: 2,
      maxLevel: 5,
      costPerLevel: 2,
      prerequisites: ['nodejs'],
      unlocked: true,
      position: { x: 2, y: 4.5 },
    },
    {
      id: 'redis',
      name: 'Redis',
      category: '数据库',
      description: '内存数据存储',
      icon: <Database className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['sql', 'mongodb'],
      unlocked: true,
      position: { x: 3, y: 5 },
    },
    
    // DevOps Branch
    {
      id: 'git',
      name: 'Git',
      category: '工具链',
      description: '版本控制系统',
      icon: <GitBranch className="w-6 h-6" />,
      currentLevel: 4,
      maxLevel: 5,
      costPerLevel: 1,
      prerequisites: [],
      unlocked: true,
      position: { x: 4, y: 0.5 },
    },
    {
      id: 'docker',
      name: 'Docker',
      category: '工具链',
      description: '容器化技术',
      icon: <Cloud className="w-6 h-6" />,
      currentLevel: 1,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['nodejs', 'git'],
      unlocked: true,
      position: { x: 4, y: 2 },
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      category: '工具链',
      description: '容器编排平台',
      icon: <Cloud className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 4,
      prerequisites: ['docker'],
      unlocked: false,
      position: { x: 5, y: 2 },
    },
    {
      id: 'security',
      name: '网络安全',
      category: '安全',
      description: 'Web安全基础知识',
      icon: <Shield className="w-6 h-6" />,
      currentLevel: 0,
      maxLevel: 5,
      costPerLevel: 3,
      prerequisites: ['nodejs', 'sql'],
      unlocked: true,
      position: { x: 4, y: 4 },
    },
  ]);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Update skills data for dashboard
  useEffect(() => {
    const categories = {
      frontend: 0,
      backend: 0,
      database: 0,
      devops: 0,
      design: 0,
    };

    skills.forEach(skill => {
      const progress = (skill.currentLevel / skill.maxLevel) * 100;
      if (skill.category === '前端开发') categories.frontend += progress;
      if (skill.category === '后端开发') categories.backend += progress;
      if (skill.category === '数据库') categories.database += progress;
      if (skill.category === '工具链' || skill.category === '安全') categories.devops += progress;
    });

    // Normalize by number of skills in each category
    onSkillsDataChange({
      frontend: Math.round(categories.frontend / 5),
      backend: Math.round(categories.backend / 3),
      database: Math.round(categories.database / 3),
      devops: Math.round(categories.devops / 3),
      design: 60, // Static for now
    });
  }, [skills, onSkillsDataChange]);

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
        // Check if this skill unlocks any others
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

  const levelDownSkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentLevel <= 0) return;

    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, currentLevel: s.currentLevel - 1 } : s
    ));

    onSkillPointsChange(skillPoints + skill.costPerLevel);
  };

  const getSkillColor = (skill: Skill) => {
    if (!skill.unlocked) return 'from-gray-700 to-gray-800';
    if (skill.currentLevel === 0) return 'from-blue-600 to-blue-700';
    if (skill.currentLevel === skill.maxLevel) return 'from-yellow-500 to-orange-600';
    return 'from-purple-600 to-pink-600';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '前端开发': return 'text-blue-400';
      case '后端开发': return 'text-green-400';
      case '数据库': return 'text-purple-400';
      case '工具链': return 'text-orange-400';
      case '安全': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Skill Tree Canvas */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[1200px] h-[700px] relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-lg p-8 border border-purple-500/30">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.5 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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

                const startX = prereq.position.x * 200 + 100;
                const startY = prereq.position.y * 110 + 80;
                const endX = skill.position.x * 200 + 100;
                const endY = skill.position.y * 110 + 80;

                const isActive = prereq.currentLevel > 0 && skill.unlocked;

                return (
                  <line
                    key={`${prereqId}-${skill.id}`}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isActive ? 'url(#lineGradient)' : '#475569'}
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
            const canLevelUp = skill.unlocked && skill.currentLevel < skill.maxLevel && skillPoints >= skill.costPerLevel;
            
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: 'spring' }}
                className="absolute"
                style={{
                  left: `${skill.position.x * 200}px`,
                  top: `${skill.position.y * 110}px`,
                  zIndex: 2,
                }}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <div className="relative">
                  <Card
                    className={`w-48 cursor-pointer transition-all bg-gradient-to-br ${getSkillColor(skill)} border-2 ${
                      selectedSkill?.id === skill.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                    } ${canLevelUp ? 'ring-2 ring-green-400 animate-pulse' : ''} ${
                      !skill.unlocked ? 'opacity-50' : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                          {skill.icon}
                        </div>
                        {!skill.unlocked && <Lock className="w-5 h-5 text-gray-400" />}
                        {skill.currentLevel === skill.maxLevel && (
                          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                        )}
                      </div>

                      <h3 className="text-white font-bold mb-1 text-sm">{skill.name}</h3>
                      <Badge className={`${getCategoryColor(skill.category)} bg-black/30 border-0 text-xs`}>
                        {skill.category}
                      </Badge>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/80 mb-1">
                          <span>等级</span>
                          <span className="font-bold">{skill.currentLevel} / {skill.maxLevel}</span>
                        </div>
                        <Progress 
                          value={(skill.currentLevel / skill.maxLevel) * 100} 
                          className="h-2 bg-white/20"
                        />
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: skill.maxLevel }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < skill.currentLevel
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level indicators */}
                  {skill.currentLevel > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white"
                    >
                      {skill.currentLevel}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Skill Detail Panel */}
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
                  <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                    {selectedSkill.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {selectedSkill.name}
                        </h3>
                        <Badge className={`${getCategoryColor(selectedSkill.category)} bg-black/30 border-0`}>
                          {selectedSkill.category}
                        </Badge>
                        <p className="text-gray-400 mt-2">{selectedSkill.description}</p>
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

                    {selectedSkill.prerequisites.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">前置技能要求</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSkill.prerequisites.map(prereqId => {
                            const prereq = skills.find(s => s.id === prereqId);
                            return prereq ? (
                              <Badge key={prereqId} variant="outline" className="text-white border-purple-500">
                                {prereq.name} (LV {prereq.currentLevel})
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

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
                        <Plus className="w-4 h-4 mr-2" />
                        升级 ({selectedSkill.costPerLevel} SP)
                      </Button>
                      
                      {selectedSkill.currentLevel > 0 && (
                        <Button
                          onClick={() => levelDownSkill(selectedSkill.id)}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <Minus className="w-4 h-4 mr-2" />
                          降级 (+{selectedSkill.costPerLevel} SP)
                        </Button>
                      )}
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
