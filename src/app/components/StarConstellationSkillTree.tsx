import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useGameStore } from '../../store/useGameStore'; // 确保路径正确

import { cn } from './ui/utils';
import { 
  Star, Sparkles, Lock, CheckCircle2, Zap, Code, 
  Palette, Database, GitBranch, Server, Cloud, Smartphone, Brain, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// --- 接口定义 ---
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
  angle: number;
  radius: number;
}
// 子组件：技能节点
const SkillNode = ({ skill, progress }: { skill: any, progress?: any }) => {
  const { gapNodes } = useGameStore();
  
  // 核心逻辑：判断是否为 PRD 定义的缺口节点
  const isGapNode = gapNodes.includes(skill.id);
  const percent = (progress?.currentXP / progress?.threshold) * 100 || 0;

  return (
    <div className="relative group cursor-pointer">
      {/* 1. 缺口节点高亮层 (PRD 3.2 特效) */}
      {isGapNode && (
        <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl animate-pulse z-0" />
      )}

      {/* 2. 环形进度条 (SVG) */}
      <svg className="absolute -inset-2 w-12 h-12 transform -rotate-90 z-10">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-800" />
        <circle
          cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="transparent"
          strokeDasharray={125.6}
          strokeDashoffset={125.6 - (125.6 * percent) / 100}
          className={cn(
            "transition-all duration-1000",
            isGapNode ? "text-amber-500" : "text-blue-500"
          )}
        />
      </svg>

      {/* 3. 核心星点 */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 relative border-2",
        // 缺口节点样式：琥珀色发光
        isGapNode 
          ? "bg-slate-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" 
          : "bg-slate-800 border-slate-700",
        // 满级样式
        percent >= 100 && "bg-yellow-400 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,1)]"
      )}>
        <span className={cn("text-[10px]", isGapNode ? "text-amber-500" : "text-slate-400")}>
          {skill.icon}
        </span>
      </div>

      {/* 4. 标签提示 */}
      {isGapNode && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge className="bg-amber-600 text-[8px] px-1 py-0 uppercase">Gap Node</Badge>
        </div>
      )}
    </div>
  );
};


// 现在 Props 变为空，因为数据全部来自 Store
export function StarConstellationSkillTree() {
  // --- 1. 从 Store 获取全局状态 (PRD 4.1) ---
  const skillPoints = useGameStore((state) => state.skillPoints);
  const addExp = useGameStore((state) => state.addExp);
  const gapNodes = useGameStore((state) => state.gapNodes);
  // 假设我们在 Store 中补全了更新技能点的方法，如果没有，可以临时定义
  const setSkillPoints = useGameStore((state: any) => state.setSkillPoints); 

  // --- 2. 本地状态（仅保留 UI 交互状态） ---
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // 初始化技能数据（实际开发中建议也移入 Store 以便持久化）
  const [skills, setSkills] = useState<Skill[]>([
    { id: 'core', name: '编程基础', category: '核心', description: '所有技能的起点', icon: <Star />, currentLevel: 5, maxLevel: 5, costPerLevel: 0, prerequisites: [], unlocked: true, angle: 0, radius: 0 },
    { id: 'html', name: 'HTML', category: '前端', description: '网页结构基础', icon: <Code />, currentLevel: 5, maxLevel: 5, costPerLevel: 1, prerequisites: ['core'], unlocked: true, angle: 0, radius: 1 },
    // ... 其他技能数据保持不变 ...
    { id: 'javascript', name: 'JavaScript', category: '前端', description: '前端编程语言', icon: <Code />, currentLevel: 4, maxLevel: 5, costPerLevel: 2, prerequisites: ['core'], unlocked: true, angle: 120, radius: 1 },
    { id: 'react', name: 'React', category: '前端', description: 'UI框架', icon: <Code />, currentLevel: 3, maxLevel: 5, costPerLevel: 3, prerequisites: ['javascript'], unlocked: true, angle: 30, radius: 2 },
  ]);

  // --- 3. 核心逻辑：AI 缺口高亮 (PRD 3.2) ---
  const isRecommended = (skill: Skill) => {
    // 根据 PRD，gapNodes 存储的是目标段位所需的“缺口技能”ID
    return gapNodes.includes(skill.id);
  };

  // 坐标计算逻辑
  const centerX = 400;
  const centerY = 400;
  const ringRadii = [0, 120, 220, 320];
  const getPosition = (angle: number, radius: number) => {
    const actualRadius = ringRadii[radius];
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + actualRadius * Math.cos(radian),
      y: centerY + actualRadius * Math.sin(radian),
    };
  };

  // 升级逻辑
  const levelUpSkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || !skill.unlocked || skill.currentLevel >= skill.maxLevel || skillPoints < skill.costPerLevel) {
      toast.error('无法升级：条件不足');
      return;
    }

    // 更新本地技能状态
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, currentLevel: s.currentLevel + 1 } : s));
    
    // 同步到全局 Store (PRD 3.3)
    if (setSkillPoints) setSkillPoints(skillPoints - skill.costPerLevel);
    addExp(skill.costPerLevel * 100); // 升级技能奖励经验

    toast.success(`${skill.name} 提升至 LV ${skill.currentLevel + 1}`, { icon: '🚀' });
  };

  // --- 4. 渲染逻辑 (Tailwind + Framer Motion) ---
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950/50">
      {/* 渲染星盘 Canvas 和 节点，逻辑与你之前的一致，但数据源已切换 */}
      <div className="absolute inset-0 flex items-center justify-center scale-90 lg:scale-100">
        <div className="relative w-[800px] h-[800px]">
           {/* 背景圆环 */}
           {[1, 2, 3].map(ring => (
            <div key={ring} className="absolute rounded-full border border-purple-500/10"
              style={{
                left: centerX - ringRadii[ring], top: centerY - ringRadii[ring],
                width: ringRadii[ring] * 2, height: ringRadii[ring] * 2,
              }}
            />
          ))}

          {/* 技能节点 */}
          {skills.map((skill) => {
            const pos = getPosition(skill.angle, skill.radius);
            const isRec = isRecommended(skill); // 使用 gapNodes 判断
            
            return (
              <motion.div
                key={skill.id}
                className="absolute z-20"
                style={{ left: pos.x - 40, top: pos.y - 40 }}
                onClick={() => setSelectedSkill(skill)}
              >
                {/* 推荐光晕动画 (PRD 4.1) */}
                {isRec && (
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                
                <div className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all
                  ${skill.unlocked ? 'border-purple-500 bg-slate-900 shadow-lg' : 'border-slate-800 bg-slate-950 opacity-40'}
                  ${isRec ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : ''}
                `}>
                  <div className="text-white scale-75">{skill.icon}</div>
                  <span className="text-[10px] text-slate-400 font-medium">{skill.name}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

{/* Selected Skill Detail - 这就是那行注释代表的完整内容 */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* 技能图标预览 */}
                  <div className={`p-4 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl text-white shadow-lg`}>
                    {selectedSkill.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{selectedSkill.name}</h3>
                        <p className="text-gray-400">{selectedSkill.description}</p>
                      </div>
                    </div>

                    {/* 三列属性看板 */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/30 p-3 rounded-lg border border-slate-700">
                        <p className="text-gray-500 text-xs uppercase mb-1">当前等级</p>
                        <p className="text-white text-2xl font-bold">{selectedSkill.currentLevel} / {selectedSkill.maxLevel}</p>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-slate-700">
                        <p className="text-gray-500 text-xs uppercase mb-1">升级消耗</p>
                        <p className="text-yellow-400 text-2xl font-bold">{selectedSkill.costPerLevel} SP</p>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-slate-700">
                        <p className="text-gray-500 text-xs uppercase mb-1">当前状态</p>
                        <p className="text-white text-lg font-bold">
                          {!selectedSkill.unlocked ? '🔒 未解锁' : 
                           selectedSkill.currentLevel === selectedSkill.maxLevel ? '⭐ 已精通' : '📈 可升级'}
                        </p>
                      </div>
                    </div>

                    {/* 操作按钮组 */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => levelUpSkill(selectedSkill.id)}
                        disabled={!selectedSkill.unlocked || selectedSkill.currentLevel >= selectedSkill.maxLevel || skillPoints < selectedSkill.costPerLevel}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/20"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        立即升级
                      </Button>
                      
                      <Button
                        onClick={() => setSelectedSkill(null)}
                        variant="outline"
                        className="border-slate-700 text-slate-400 hover:bg-slate-800"
                      >
                        取消选择
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>    </div>
  );
}