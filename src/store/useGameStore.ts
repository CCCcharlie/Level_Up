import { create } from 'zustand';

// --- 类型定义 ---

export type TargetLevel = 'Junior' | 'Mid' | 'Senior';

/**
 * 路线图节点接口 (PRD 3.2)
 */
export interface RoadmapNode {
  id: string;
  title: string;       // 对应之前的 label
  focus: string;       // 对应之前的 description
  status: 'locked' | 'current' | 'completed';
  requiredXP: number;
  tasks: string[];     // 节点关联的任务列表
}

/**
 * 装备接口
 */
export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  description: string;
  stats: {
    frontend?: number; backend?: number; design?: number;
    database?: number; devops?: number; ai?: number;
  };
  sourceProject: { title: string; aiScore: number; difficulty: string; };
  icon: any; // 建议使用 string (Lucide 图标名) 或 ReactNode
  equippedSlot: 'weapon' | 'helmet' | 'chest' | 'accessory1' | 'accessory2' | null;
}

interface GameState {
  // 1. 职业定锚状态 (PRD 3.1)
  careerDirection: string | null;
  userTargetLevel: TargetLevel;
  isOnboarded: boolean;

  // 2. 核心进度与经验值 (PRD 3.3)
  totalExp: number;
  level: number;
  skillPoints: number;

  // 3. AI 生成的动态数据 (PRD 3.2)
  gapNodes: string[];                // 星盘高亮节点 ID
  dynamicRoadmap: RoadmapNode[];     // 动态学习路线
  activeRoadmapNodeId: string | null; // 当前激活的路线节点

  // 4. 装备系统
  equipment: Equipment[];

  // --- Actions ---
  addExp: (amount: number) => void;
  setSkillPoints: (skillPoints: number) => void;
  setTargetLevel: (direction: string, level: TargetLevel) => void;
  setActiveRoadmapNode: (nodeId: string) => void;
  completeGapNode: (nodeId: string) => void;
  equipItem: (id: string, slot: Equipment['equippedSlot']) => void;
  unequipItem: (id: string) => void;
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
  activeRoadmapNodeId: null,
equipment: [
    {
      id: 'e1', name: '神经连结头盔', type: 'armor', rarity: 'rare', category: '硬件',
      description: '提升代码逻辑处理速度', stats: { frontend: 15 },
      sourceProject: { title: 'AI 聊天机器人', aiScore: 88, difficulty: '中级' },
      icon: 'Shield', equippedSlot: null
    }
  ],

  // 经验值累加逻辑
  addExp: (amount) => {
    const newTotal = get().totalExp + amount;
    const newLevel = Math.floor(newTotal / 1000) + 1;
    set({ 
      totalExp: newTotal,
      level: newLevel
    });
  },

  // 技能点更新
  setSkillPoints: (skillPoints) => set({ skillPoints }),

  // 核心重构：双重定锚方法 (PRD 3.1)
  setTargetLevel: (direction, level) => {
    let mockRoadmap: RoadmapNode[] = [];
    let mockGapNodes: string[] = [];

    // 根据不同段位生成路线图 (PRD Mock 逻辑)
    if (level === 'Junior') {
      mockRoadmap = [
        { 
          id: 'j1', title: '核心基础构建', focus: '掌握语言底层原理与核心语法', status: 'current', requiredXP: 500,
          tasks: ['阅读核心语法文档', '手写实现基础算法', '完成 5 道基础练习题'] 
        },
        { 
          id: 'j2', title: '版本控制专家', focus: 'Git 协同开发与分流策略', status: 'locked', requiredXP: 800,
          tasks: ['执行一次 Rebase', '解决合并冲突', '配置 Git Hooks']
        },
        { 
          id: 'j3', title: '初级实战工程', focus: '独立完成模块化组件开发', status: 'locked', requiredXP: 1200,
          tasks: ['封装 Button 组件', '实现 Todo List', '学习 CSS Modules']
        },
      ];
      mockGapNodes = ['base_syntax', 'git_flow', 'component_logic'];
    } else if (level === 'Mid') {
      mockRoadmap = [
        { 
          id: 'm1', title: '架构模式实践', focus: '深入理解 MVC/MVVM 与设计模式', status: 'current', requiredXP: 2000,
          tasks: ['重构旧模块逻辑', '接入状态管理', '设计组件通信方案']
        },
        { id: 'm2', title: '性能优化专项', focus: '全链路性能瓶颈分析与调优', status: 'locked', requiredXP: 2500, tasks: [] },
        { id: 'm3', title: '工程化体系建设', focus: 'CI/CD 流水线与自动化测试', status: 'locked', requiredXP: 3000, tasks: [] },
      ];
      mockGapNodes = ['design_patterns', 'perf_optimization', 'ci_cd'];
    } else {
      mockRoadmap = [
        { id: 's1', title: '系统架构演进', focus: '从单体到微服务的分布式决策', status: 'current', requiredXP: 5000, tasks: [] },
        { id: 's2', title: '技术选型方法论', focus: '复杂业务场景下的技术栈评估', status: 'locked', requiredXP: 6000, tasks: [] },
        { id: 's3', title: '团队技术领导力', focus: '技术架构委员会与标准制定', status: 'locked', requiredXP: 8000, tasks: [] },
      ];
      mockGapNodes = ['dist_systems', 'tech_strategy', 'leadership'];
    }

    set({
      careerDirection: direction,
      userTargetLevel: level,
      isOnboarded: true,
      dynamicRoadmap: mockRoadmap,
      gapNodes: mockGapNodes,
      activeRoadmapNodeId: mockRoadmap[0]?.id || null
    });
  },

  // 切换激活节点
  setActiveRoadmapNode: (nodeId) => set({ activeRoadmapNodeId: nodeId }),

  // 缺口节点完成后，从待办列表中移除
  completeGapNode: (nodeId) =>
    set((state) => ({
      gapNodes: state.gapNodes.filter((gapNodeId) => gapNodeId !== nodeId),
    })),

  // 装备逻辑
  equipItem: (itemId) => {
    set((state) => ({
      equipment: state.equipment.map((item) =>
        item.id === itemId ? { ...item, isEquipped: true } : item
      ),
    }));
  },

  // 卸下逻辑
  unequipItem: (itemId) => {
    set((state) => ({
      equipment: state.equipment.map((item) =>
        item.id === itemId ? { ...item, isEquipped: false } : item
      ),
    }));
  },

  // 重置系统
  resetOnboarding: () => set({ 
    isOnboarded: false, 
    careerDirection: null, 
    dynamicRoadmap: [], 
    gapNodes: [],
    activeRoadmapNodeId: null 
  }),
}));

export default useGameStore;