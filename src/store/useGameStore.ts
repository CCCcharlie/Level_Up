import { create } from 'zustand';

// --- 类型定义 ---

export type TargetLevel = 'Junior' | 'Mid' | 'Senior';

export interface RoadmapNode {
  id: string;
  title: string;
  focus: string;
  status: 'locked' | 'current' | 'completed';
  requiredXP: number;
  tasks: string[];
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

  //在接口中增加激活节点的定义
  activeRoadmapNodeId: string | null;

  // --- Actions ---
  
  // 更新经验值并自动计算等级 (保留原逻辑)
  addExp: (amount: number) => void;
  
  // 核心重构：双重定锚方法 (PRD 3.1)
  setTargetLevel: (direction: string, level: TargetLevel) => void;

  //在接口中增加切换方法的定义
  setActiveRoadmapNode: (nodeId: string) => void;
  
  // 重置系统
  resetOnboarding: () => void;
}

// --- Store 实现 ---

export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  activeRoadmapNodeId: null, // 新增：记录当前选中的路线图节点 ID
  careerDirection: null,
  userTargetLevel: 'Junior',
  isOnboarded: false,
  totalExp: 3250,
  level: 8,
  skillPoints: 15,
  gapNodes: [],
  dynamicRoadmap: [],
//初始化状态


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
      { 
        id: 'j1', 
        title: '核心基础构建', 
        focus: '掌握语言底层原理与核心语法', 
        status: 'current', 
        requiredXP: 500,
        tasks: ['阅读《You Don\'t Know JS》前三章', '手写实现一个深度克隆函数', '解决 5 道 LeetCode 基础数组题']
      },
      { 
        id: 'j2', 
        title: '版本控制专家', 
        focus: 'Git 协同开发与分流策略', 
        status: 'locked', 
        requiredXP: 800,
        tasks: ['完成一次复杂的 Git Rebase 操作', '模拟解决一个 Merge Conflict', '配置本地 Git Hooks']
      },
      { 
        id: 'j3', 
        title: '初级实战工程', 
        focus: '独立完成模块化组件开发', 
        status: 'locked', 
        requiredXP: 1200,
        tasks: ['封装一个高可用的 Button 组件', '实现简单的 Todo List 状态管理', '学习并应用 CSS Modules']
      },
    ];
    mockGapNodes = ['base_syntax', 'git_flow', 'component_logic'];
  } else if (level === 'Mid') {
    mockRoadmap = [
      { 
        id: 'm1', 
        title: '架构模式实践', 
        focus: '深入理解 MVC/MVVM 与设计模式', 
        status: 'current', 
        requiredXP: 2000,
        tasks: ['重构一个旧模块，使用组合优于继承', '为项目接入状态管理最佳实践', '设计一个通用的组件通信方案']
      },
      { 
        id: 'm2', 
        title: '性能优化专项', 
        focus: '全链路性能瓶颈分析与调优', 
        status: 'locked', 
        requiredXP: 2500,
        tasks: ['分析并优化首页首屏加载时间', '实现图片懒加载与预加载策略', '排查并修复内存泄漏问题']
      },
      { 
        id: 'm3', 
        title: '工程化体系建设', 
        focus: 'CI/CD 流水线与自动化测试', 
        status: 'locked', 
        requiredXP: 3000,
        tasks: ['配置 GitHub Actions 自动部署', '编写核心逻辑的单元测试', '集成 ESLint 与 Prettier 自动化校验']
      },
    ];
    mockGapNodes = ['design_patterns', 'perf_optimization', 'ci_cd'];
  } else {
    mockRoadmap = [
      { 
        id: 's1', 
        title: '系统架构演进', 
        focus: '从单体到微服务的分布式决策', 
        status: 'current', 
        requiredXP: 5000,
        tasks: ['设计微服务间的通信协议', '实现分布式系统下的缓存一致性', '调研并落地容器化部署方案']
      },
      { 
        id: 's2', 
        title: '技术选型方法论', 
        focus: '复杂业务场景下的技术栈评估', 
        status: 'locked', 
        requiredXP: 6000,
        tasks: ['对比并选型下一代前端框架', '制定全公司的技术规范标准', '撰写复杂系统的架构设计文档']
      },
      { 
        id: 's3', 
        title: '团队技术领导力', 
        focus: '技术架构委员会与标准制定', 
        status: 'locked', 
        requiredXP: 8000,
        tasks: ['组织内部技术沙龙分享', '指导初中级开发人员成长', '推动研发流程的自动化改进']
      },
    ];
    mockGapNodes = ['dist_systems', 'tech_strategy', 'leadership'];
  }

    // 更新状态
    set({
      careerDirection: direction,
      userTargetLevel: level,
      isOnboarded: true,
      dynamicRoadmap: mockRoadmap,
      gapNodes: mockGapNodes,
      activeRoadmapNodeId: mockRoadmap[0]?.id || null // 默认激活第一个节点
    });
  },
setActiveRoadmapNode: (nodeId: string) => set({ activeRoadmapNodeId: nodeId }),
  resetOnboarding: () => set({ 
    isOnboarded: false, 
    careerDirection: null, 
    dynamicRoadmap: [], 
    gapNodes: [] 
  }),
}));

export default useGameStore;
