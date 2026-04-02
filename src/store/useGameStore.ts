import { create } from 'zustand';

// --- 类型定义 ---

export type TargetLevel = 'Junior' | 'Mid' | 'Senior';

export interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  requiredXP: number;
}

interface GameState {
  // 1. 职业定锚状态 (PRD 3.1)
  careerDirection: string | null;     // 职业方向 (如: 前端, 后端)
  userTargetLevel: TargetLevel;      // 目标段位
  isOnboarded: boolean;              // 是否完成引导

  // 2. 核心进度与经验值 (PRD 3.3)
  totalExp: number;
  level: number;
  skillPoints: number;

  // 3. AI 生成的动态数据 (PRD 3.2)
  gapNodes: string[];                // 星盘中需要高亮的缺口技能 ID
  dynamicRoadmap: RoadmapNode[];     // 逻辑先后顺序的学习路线

  // --- Actions ---
  
  // 更新经验值并自动计算等级 (保留原逻辑)
  addExp: (amount: number) => void;
  
  // 核心重构：双重定锚方法 (PRD 3.1)
  setTargetLevel: (direction: string, level: TargetLevel) => void;
  
  // 重置系统
  resetOnboarding: () => void;
}

// --- Store 实现 ---

export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  careerDirection: null,
  userTargetLevel: 'Junior',
  isOnboarded: false,
  totalExp: 3250,
  level: 8,
  skillPoints: 15,
  gapNodes: [],
  dynamicRoadmap: [],

  // 经验值累加逻辑
  addExp: (amount) => {
    const newTotal = get().totalExp + amount;
    // 简单的等级计算公式：每 1000 XP 升一级
    const newLevel = Math.floor(newTotal / 1000) + 1;
    set({ 
      totalExp: newTotal,
      level: newLevel
    });
  },

  // 重写 setTargetLevel：实现“AI 觉醒”逻辑
  setTargetLevel: (direction, level) => {
    // 根据职业和等级生成的 Mock 数据逻辑
    let mockRoadmap: RoadmapNode[] = [];
    let mockGapNodes: string[] = [];

    // 根据不同段位生成路线图 (PRD Mock 逻辑)
    if (level === 'Junior') {
      mockRoadmap = [
        { id: 'j1', label: '核心基础构建', description: '掌握语言底层原理与核心语法', status: 'current', requiredXP: 500 },
        { id: 'j2', label: '版本控制专家', description: 'Git 协同开发与分流策略', status: 'locked', requiredXP: 800 },
        { id: 'j3', label: '初级实战工程', description: '独立完成模块化组件开发', status: 'locked', requiredXP: 1200 },
      ];
      mockGapNodes = ['base_syntax', 'git_flow', 'component_logic'];
    } else if (level === 'Mid') {
      mockRoadmap = [
        { id: 'm1', label: '架构模式实践', description: '深入理解 MVC/MVVM 与设计模式', status: 'current', requiredXP: 2000 },
        { id: 'm2', label: '性能优化专项', description: '全链路性能瓶颈分析与调优', status: 'locked', requiredXP: 2500 },
        { id: 'm3', label: '工程化体系建设', description: 'CI/CD 流水线与自动化测试', status: 'locked', requiredXP: 3000 },
      ];
      mockGapNodes = ['design_patterns', 'perf_optimization', 'ci_cd'];
    } else {
      mockRoadmap = [
        { id: 's1', label: '系统架构演进', description: '从单体到微服务的分布式决策', status: 'current', requiredXP: 5000 },
        { id: 's2', label: '技术选型方法论', description: '复杂业务场景下的技术栈评估', status: 'locked', requiredXP: 6000 },
        { id: 's3', label: '团队技术领导力', description: '技术架构委员会与标准制定', status: 'locked', requiredXP: 8000 },
      ];
      mockGapNodes = ['dist_systems', 'tech_strategy', 'leadership'];
    }

    // 更新状态
    set({
      careerDirection: direction,
      userTargetLevel: level,
      isOnboarded: true,
      dynamicRoadmap: mockRoadmap,
      gapNodes: mockGapNodes
    });
  },

  resetOnboarding: () => set({ 
    isOnboarded: false, 
    careerDirection: null, 
    dynamicRoadmap: [], 
    gapNodes: [] 
  }),
}));

export default useGameStore;
