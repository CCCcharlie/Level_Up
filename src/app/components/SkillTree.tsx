import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Star, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  prerequisites: string[];
  xpCost: number;
}

export function SkillTree() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [userXP, setUserXP] = useState(850);

  const [skills, setSkills] = useState<Skill[]>([
    // Frontend Foundation
    { id: 'html', name: 'HTML基础', description: '掌握网页结构的基本标签和语义化', category: '前端基础', level: 3, maxLevel: 3, unlocked: true, prerequisites: [], xpCost: 100 },
    { id: 'css', name: 'CSS样式', description: '学习样式设计和布局技巧', category: '前端基础', level: 3, maxLevel: 3, unlocked: true, prerequisites: ['html'], xpCost: 100 },
    { id: 'js-basics', name: 'JavaScript基础', description: 'JS核心语法和DOM操作', category: '前端基础', level: 2, maxLevel: 3, unlocked: true, prerequisites: ['html'], xpCost: 150 },
    
    // Advanced JS
    { id: 'js-advanced', name: 'JavaScript进阶', description: '异步编程、闭包、原型链', category: 'JavaScript', level: 1, maxLevel: 3, unlocked: true, prerequisites: ['js-basics'], xpCost: 200 },
    { id: 'es6', name: 'ES6+特性', description: '现代JavaScript新特性', category: 'JavaScript', level: 0, maxLevel: 3, unlocked: true, prerequisites: ['js-basics'], xpCost: 150 },
    { id: 'typescript', name: 'TypeScript', description: '类型安全的JavaScript超集', category: 'JavaScript', level: 0, maxLevel: 3, unlocked: false, prerequisites: ['js-advanced', 'es6'], xpCost: 250 },
    
    // React Ecosystem
    { id: 'react', name: 'React基础', description: '组件化开发和虚拟DOM', category: 'React生态', level: 1, maxLevel: 3, unlocked: true, prerequisites: ['js-advanced'], xpCost: 200 },
    { id: 'react-hooks', name: 'React Hooks', description: '函数组件和状态管理', category: 'React生态', level: 0, maxLevel: 3, unlocked: true, prerequisites: ['react'], xpCost: 200 },
    { id: 'react-router', name: 'React Router', description: '单页应用路由管理', category: 'React生态', level: 0, maxLevel: 3, unlocked: false, prerequisites: ['react'], xpCost: 150 },
    { id: 'redux', name: 'Redux', description: '可预测的状态容器', category: 'React生态', level: 0, maxLevel: 3, unlocked: false, prerequisites: ['react-hooks'], xpCost: 250 },
    
    // Build Tools
    { id: 'git', name: 'Git版本控制', description: '代码版本管理和协作', category: '工具链', level: 2, maxLevel: 3, unlocked: true, prerequisites: [], xpCost: 100 },
    { id: 'webpack', name: 'Webpack', description: '模块打包工具', category: '工具链', level: 0, maxLevel: 3, unlocked: false, prerequisites: ['react'], xpCost: 200 },
    { id: 'vite', name: 'Vite', description: '下一代前端构建工具', category: '工具链', level: 0, maxLevel: 3, unlocked: false, prerequisites: ['react'], xpCost: 150 },
  ]);

  const categories = ['前端基础', 'JavaScript', 'React生态', '工具链'];

  const unlockSkill = (skill: Skill) => {
    if (userXP >= skill.xpCost && !skill.unlocked) {
      const prereqsMet = skill.prerequisites.every(
        (prereqId) => skills.find((s) => s.id === prereqId)?.unlocked
      );
      
      if (prereqsMet) {
        setSkills((prev) =>
          prev.map((s) => (s.id === skill.id ? { ...s, unlocked: true } : s))
        );
        setUserXP((prev) => prev - skill.xpCost);
        setSelectedSkill(null);
      }
    }
  };

  const levelUpSkill = (skill: Skill) => {
    if (skill.unlocked && skill.level < skill.maxLevel && userXP >= skill.xpCost) {
      setSkills((prev) =>
        prev.map((s) =>
          s.id === skill.id ? { ...s, level: s.level + 1 } : s
        )
      );
      setUserXP((prev) => prev - skill.xpCost);
      setSelectedSkill({ ...skill, level: skill.level + 1 });
    }
  };

  const getSkillColor = (skill: Skill) => {
    if (!skill.unlocked) return 'from-gray-200 to-gray-300';
    if (skill.level === skill.maxLevel) return 'from-yellow-200 to-yellow-400';
    if (skill.level > 0) return 'from-blue-200 to-blue-400';
    return 'from-green-200 to-green-300';
  };

  return (
    <div className="space-y-6">
      {/* XP Display */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              可用经验值
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              完成任务获得经验值来解锁新技能
            </p>
          </div>
          <div className="text-4xl font-bold text-purple-600">{userXP} XP</div>
        </div>
      </div>

      {/* Skill Tree by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categorySkills = skills.filter((s) => s.category === category);
          
          return (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-500 rounded" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all bg-gradient-to-br ${getSkillColor(
                        skill
                      )} ${
                        !skill.unlocked ? 'opacity-60' : ''
                      } hover:shadow-lg border-2`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 flex-1">
                            {skill.name}
                          </h4>
                          {!skill.unlocked && (
                            <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          )}
                          {skill.level === skill.maxLevel && (
                            <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          {skill.description}
                        </p>

                        {/* Level Progress */}
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: skill.maxLevel }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-2 rounded ${
                                i < skill.level
                                  ? 'bg-indigo-600'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {skill.level}/{skill.maxLevel}
                          </Badge>
                          <span className="text-xs font-semibold text-purple-700">
                            {skill.xpCost} XP
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent>
          {selectedSkill && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedSkill.name}</DialogTitle>
                <DialogDescription>{selectedSkill.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">等级</span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: selectedSkill.maxLevel }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedSkill.level
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">升级费用</span>
                  <span className="text-lg font-bold text-purple-600">
                    {selectedSkill.xpCost} XP
                  </span>
                </div>

                {selectedSkill.prerequisites.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      前置技能
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.prerequisites.map((prereqId) => {
                        const prereq = skills.find((s) => s.id === prereqId);
                        return (
                          <Badge key={prereqId} variant="outline">
                            {prereq?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!selectedSkill.unlocked ? (
                  <Button
                    className="w-full"
                    onClick={() => unlockSkill(selectedSkill)}
                    disabled={
                      userXP < selectedSkill.xpCost ||
                      !selectedSkill.prerequisites.every(
                        (prereqId) => skills.find((s) => s.id === prereqId)?.unlocked
                      )
                    }
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    解锁技能
                  </Button>
                ) : selectedSkill.level < selectedSkill.maxLevel ? (
                  <Button
                    className="w-full"
                    onClick={() => levelUpSkill(selectedSkill)}
                    disabled={userXP < selectedSkill.xpCost}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    升级 ({selectedSkill.level + 1}/{selectedSkill.maxLevel})
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      已达到最高等级！
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
