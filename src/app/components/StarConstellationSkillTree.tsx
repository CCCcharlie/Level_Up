import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useGameStore } from '../../store/useGameStore';
import { cn } from './ui/utils';
import { Star, Sparkles, Lock, CheckCircle2, Zap, Code, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// --- 接口定义 ---
interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: ReactNode;
  currentLevel: number;
  maxLevel: number;
  costPerLevel: number;
  prerequisites: string[];
  unlocked: boolean;
  angle: number;
  radius: number;
}


// 现在 Props 变为空，因为数据全部来自 Store
export function StarConstellationSkillTree() {
  // --- 1. 从 Store 获取全局状态 (PRD 4.1) ---
  const skillPoints = useGameStore((state) => state.skillPoints);
  const addExp = useGameStore((state) => state.addExp);
  const gapNodes = useGameStore((state) => state.gapNodes);
  const setSkillPoints = useGameStore((state) => state.setSkillPoints);
  const completeGapNode = useGameStore((state) => state.completeGapNode);

  // --- 2. 本地状态（仅保留 UI 交互状态） ---
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [nebulaBursts, setNebulaBursts] = useState<Array<{ id: string; x: number; y: number; key: number }>>([]);
  const previousGapNodesRef = useRef<string[]>(gapNodes);

  // 初始化技能数据（实际开发中建议也移入 Store 以便持久化）
  const [skills, setSkills] = useState<Skill[]>([
    { id: 'core', name: '编程基础', category: '核心', description: '所有技能的起点', icon: <Star />, currentLevel: 5, maxLevel: 5, costPerLevel: 0, prerequisites: [], unlocked: true, angle: 0, radius: 0 },
    { id: 'html', name: 'HTML', category: '前端', description: '网页结构基础', icon: <Code />, currentLevel: 5, maxLevel: 5, costPerLevel: 1, prerequisites: ['core'], unlocked: true, angle: -48, radius: 1 },
    { id: 'javascript', name: 'JavaScript', category: '前端', description: '前端编程语言', icon: <Code />, currentLevel: 4, maxLevel: 5, costPerLevel: 2, prerequisites: ['core'], unlocked: true, angle: 120, radius: 1 },
    { id: 'react', name: 'React', category: '前端', description: 'UI框架', icon: <Code />, currentLevel: 3, maxLevel: 5, costPerLevel: 3, prerequisites: ['javascript'], unlocked: true, angle: 24, radius: 2 },
    { id: 'database', name: '数据建模', category: '后端', description: '结构化数据管理', icon: <Sparkles />, currentLevel: 1, maxLevel: 5, costPerLevel: 3, prerequisites: ['javascript'], unlocked: false, angle: 146, radius: 2 },
    { id: 'security', name: '安全防护', category: '工程', description: '守护系统边界', icon: <ShieldIcon />, currentLevel: 0, maxLevel: 5, costPerLevel: 4, prerequisites: ['database'], unlocked: false, angle: 214, radius: 3 },
  ]);

  const centerX = 400;
  const centerY = 400;
  const ringRadii = [0, 120, 220, 320];

  const getPosition = useMemo(() => {
    return (angle: number, radius: number) => {
      const actualRadius = ringRadii[radius] ?? ringRadii[ringRadii.length - 1];
      const radian = (angle - 90) * (Math.PI / 180);

      return {
        x: centerX + actualRadius * Math.cos(radian),
        y: centerY + actualRadius * Math.sin(radian),
      };
    };
  }, []);

  // --- 3. 核心逻辑：AI 缺口高亮 (PRD 3.2) ---
  const isRecommended = (skill: Skill) => {
    return gapNodes.includes(skill.id);
  };

  useEffect(() => {
    const previousGapNodes = previousGapNodesRef.current;
    const completedNodes = previousGapNodes.filter((nodeId) => !gapNodes.includes(nodeId));

    if (completedNodes.length > 0) {
      const bursts = completedNodes
        .map((nodeId, index) => {
          const skill = skills.find((item) => item.id === nodeId);

          if (!skill) {
            return null;
          }

          const position = getPosition(skill.angle, skill.radius);
          return {
            id: nodeId,
            x: position.x,
            y: position.y,
            key: Date.now() + index,
          };
        })
        .filter(Boolean) as Array<{ id: string; x: number; y: number; key: number }>;

      if (bursts.length > 0) {
        setNebulaBursts((current) => [...current, ...bursts]);

        bursts.forEach((burst) => {
          window.setTimeout(() => {
            setNebulaBursts((current) => current.filter((item) => item.key !== burst.key));
          }, 1000);
        });
      }
    }

    previousGapNodesRef.current = gapNodes;
  }, [gapNodes, getPosition, skills]);

  // 升级逻辑
  const levelUpSkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || !skill.unlocked || skill.currentLevel >= skill.maxLevel || skillPoints < skill.costPerLevel) {
      toast.error('无法升级：条件不足');
      return;
    }

    setSkills((prev) =>
      prev.map((item) =>
        item.id === skillId
          ? {
              ...item,
              currentLevel: Math.min(item.currentLevel + 1, item.maxLevel),
              unlocked: true,
            }
          : item
      )
    );

    setSkillPoints(skillPoints - skill.costPerLevel);
    addExp(skill.costPerLevel * 100);

    if (gapNodes.includes(skillId)) {
      completeGapNode(skillId);
    }

    toast.success(`${skill.name} 提升至 LV ${skill.currentLevel + 1}`, { icon: '🚀' });
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050814] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(168,85,247,0.18),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.08),transparent_24%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:96px_96px]" />

      <div className="absolute left-5 top-5 z-20 rounded-full border border-blue-400/20 bg-slate-950/70 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-blue-200/80">
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          星系引爆
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full max-w-[920px] max-h-[920px] scale-90 lg:scale-100">
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border border-purple-500/10"
              style={{
                left: centerX - ringRadii[ring],
                top: centerY - ringRadii[ring],
                width: ringRadii[ring] * 2,
                height: ringRadii[ring] * 2,
              }}
            />
          ))}

          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <AnimatePresence>
            {nebulaBursts.map((burst) => {
              const particles = Array.from({ length: 10 }, (_, index) => index);

              return (
                <motion.div
                  key={burst.key}
                  className="pointer-events-none absolute z-30"
                  style={{ left: burst.x, top: burst.y }}
                  initial={{ opacity: 1, scale: 0.55 }}
                  animate={{ opacity: 0, scale: 2.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full border border-cyan-300/70 shadow-[0_0_35px_rgba(56,189,248,0.7)]" />
                  <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full border border-purple-400/60 shadow-[0_0_45px_rgba(168,85,247,0.65)]" />
                  {particles.map((index) => {
                    const angle = (Math.PI * 2 * index) / particles.length;
                    const distance = 28 + (index % 3) * 16;

                    return (
                      <motion.div
                        key={`${burst.key}-${index}`}
                        className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-white"
                        initial={{ x: 0, y: 0, scale: 0.8, opacity: 0.95 }}
                        animate={{
                          x: Math.cos(angle) * distance,
                          y: Math.sin(angle) * distance,
                          scale: 0.2,
                          opacity: 0,
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ boxShadow: '0 0 16px rgba(125, 211, 252, 0.8)' }}
                      />
                    );
                  })}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {skills.map((skill) => {
            const pos = getPosition(skill.angle, skill.radius);
            const isRec = isRecommended(skill);
            const isSelected = selectedSkill?.id === skill.id;
            const isHovered = hoveredSkill === skill.id;

            return (
              <motion.div
                key={skill.id}
                className="absolute z-20"
                style={{ left: pos.x - 40, top: pos.y - 40 }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: skill.radius * 0.05 }}
                onClick={() => setSelectedSkill(skill)}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                {isRec && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-cyan-400/18 blur-xl"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.7, 0.35] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}

                <div
                  className={cn(
                    'relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 transition-all duration-300',
                    skill.unlocked
                      ? 'border-purple-400/80 bg-slate-900/90 shadow-[0_0_18px_rgba(168,85,247,0.24),0_0_30px_rgba(59,130,246,0.10)]'
                      : 'border-slate-700 bg-slate-950/80 opacity-15',
                    isRec && 'border-cyan-400/80 shadow-[0_0_20px_rgba(56,189,248,0.45)]',
                    isSelected && 'scale-110 border-fuchsia-400/90 shadow-[0_0_30px_rgba(168,85,247,0.45)]',
                    isHovered && 'scale-105'
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full opacity-0 transition-opacity duration-300',
                      skill.unlocked && 'opacity-100 bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_65%)]',
                      isRec && 'bg-[radial-gradient(circle,rgba(56,189,248,0.22),transparent_65%)]'
                    )}
                  />

                  <div className={cn('relative scale-90', skill.unlocked ? 'text-white' : 'text-slate-500')}>
                    {skill.icon}
                  </div>
                  <span className={cn('relative mt-1 text-[10px] font-medium', skill.unlocked ? 'text-slate-200' : 'text-slate-500')}>
                    {skill.name}
                  </span>

                  {!skill.unlocked && (
                    <div className="absolute -right-1 -top-1 rounded-full border border-slate-700 bg-slate-950 p-1 text-slate-500 shadow-lg">
                      <Lock className="h-3 w-3" />
                    </div>
                  )}

                  {skill.currentLevel >= skill.maxLevel && (
                    <div className="absolute -left-1 -top-1 rounded-full border border-yellow-200 bg-yellow-400 p-1 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.85)]">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}

                  {isHovered && skill.unlocked && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-700 bg-slate-950/80 px-2 py-1 text-[8px] uppercase tracking-[0.25em] text-slate-200">
                      Ready
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 z-40 w-[min(92vw,920px)] -translate-x-1/2"
          >
            <Card className="border border-purple-500/40 bg-slate-950/85 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="rounded-xl bg-gradient-to-br from-purple-600 to-blue-700 p-4 text-white shadow-lg shadow-purple-500/20">
                    {selectedSkill.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{selectedSkill.name}</h3>
                        <p className="text-gray-400">{selectedSkill.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="rounded-lg border border-slate-700 bg-black/30 p-3">
                        <p className="text-gray-500 text-xs uppercase mb-1">当前等级</p>
                        <p className="text-white text-2xl font-bold">{selectedSkill.currentLevel} / {selectedSkill.maxLevel}</p>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-black/30 p-3">
                        <p className="text-gray-500 text-xs uppercase mb-1">升级消耗</p>
                        <p className="text-yellow-400 text-2xl font-bold">{selectedSkill.costPerLevel} SP</p>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-black/30 p-3">
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
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-blue-700"
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

function ShieldIcon() {
  return <Shield className="h-5 w-5" />;
}