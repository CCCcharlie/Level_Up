import { create } from 'zustand';

interface Progress {
  [skill: string]: number;
}

interface RoadmapNode {
  id: string;
  title: string;                    // 节点名称
  focus: string;                    // 核心痛点 / 面试常考点描述
  status: 'locked' | 'active' | 'completed';
  tasks: string[];                  // 关联的任务数组
}

interface GameState {
  // 原有状态
  level: number;
  exp: number;
  currentTasks: string[];
  progress: Progress;

  // 新增：动态学习路线图（PRD 要求）
  dynamicRoadmap: RoadmapNode[];
  activeRoadmapNodeId: string | null;

  // 原有方法
  setLevel: (level: number) => void;
  setExp: (exp: number) => void;
  addExp: (amount: number) => void;
  setCurrentTasks: (tasks: string[]) => void;
  addTask: (task: string) => void;
  removeTask: (task: string) => void;
  trackProgress: (skill: string, progressAmount: number) => void;
  getLearningFocus: () => string;

  // 新增 / 修改方法（PRD 要求）
  setTargetLevel: (target: 'Junior' | 'Mid' | 'Senior') => void;
  setActiveRoadmapNode: (id: string | null) => void;
}

/**
 * Mock 数据生成函数（后续可替换为真实 AI 调用）
 * 根据目标等级生成不同的动态路线图节点
 */
const generateDynamicRoadmap = (target: 'Junior' | 'Mid' | 'Senior'): RoadmapNode[] => {
  const baseId = Date.now().toString();

  if (target === 'Junior') {
    return [
      {
        id: `${baseId}-1`,
        title: '基础语法避坑',
        focus: '掌握 JavaScript/TypeScript 核心语法，规避常见面试陷阱与隐式转换问题',
        status: 'active',
        tasks: ['变量提升与作用域', 'this 指向与箭头函数', '类型守卫与类型收窄'],
      },
      {
        id: `${baseId}-2`,
        title: '高频面试八股文',
        focus: '梳理前端高频基础知识点，形成系统化面试答案框架',
        status: 'locked',
        tasks: ['事件循环与异步', '闭包与内存泄漏', '原型链与继承'],
      },
      {
        id: `${baseId}-3`,
        title: 'Git 与团队协作',
        focus: '掌握版本控制与分支管理，提升团队开发效率',
        status: 'locked',
        tasks: ['Git 工作流', '代码审查规范', '分支合并策略'],
      },
      {
        id: `${baseId}-4`,
        title: 'React 基础组件开发',
        focus: '熟练使用 React 构建可复用组件',
        status: 'locked',
        tasks: ['Hooks 使用规范', '组件通信', '条件渲染与列表优化'],
      },
    ];
  }

  if (target === 'Mid') {
    return [
      {
        id: `${baseId}-1`,
        title: '组件库源码剖析',
        focus: '深入理解 Ant Design / Material UI 等主流组件库的实现原理',
        status: 'active',
        tasks: ['组件封装思想', '受控与非受控', '性能优化技巧'],
      },
      {
        id: `${baseId}-2`,
        title: '性能调优实战',
        focus: '定位并解决前端性能瓶颈，提升页面流畅度',
        status: 'locked',
        tasks: ['React.memo 与 useCallback', '虚拟列表实现', '渲染优化策略'],
      },
      {
        id: `${baseId}-3`,
        title: '工程化基建',
        focus: '构建现代前端工程化体系',
        status: 'locked',
        tasks: ['Monorepo 架构', 'CI/CD 流水线', '代码规范与 Lint'],
      },
    ];
  }

  // Senior
  return [
    {
      id: `${baseId}-1`,
      title: '微前端架构设计',
      focus: '设计可扩展的微前端解决方案，解决大型应用治理难题',
      status: 'active',
      tasks: ['Module Federation', '应用隔离方案', '路由与状态共享'],
    },
    {
      id: `${baseId}-2`,
      title: '系统设计与高并发',
      focus: '从 0 到 1 完成复杂系统设计，应对高并发场景',
      status: 'locked',
      tasks: ['秒杀系统设计', '缓存与限流', '分布式一致性'],
    },
    {
      id: `${baseId}-3`,
      title: '技术债治理与架构演进',
      focus: '系统性重构遗留系统，推动技术栈升级',
      status: 'locked',
      tasks: ['遗留代码评估', '增量重构策略', '架构决策记录'],
    },
  ];
};

const useGameStore = create<GameState>()((set, get) => ({
  // 原有初始状态
  level: 1,
  exp: 0,
  currentTasks: [],
  progress: {},

  // 新增初始状态
  dynamicRoadmap: [],
  activeRoadmapNodeId: null,

  setLevel: (level) => set({ level }),
  setExp: (exp) => set({ exp }),
  addExp: (amount) => set((state) => ({ exp: state.exp + amount })),

  setCurrentTasks: (tasks) => set({ currentTasks: tasks }),
  addTask: (task) => set((state) => ({ currentTasks: [...state.currentTasks, task] })),
  removeTask: (task) => set((state) => ({
    currentTasks: state.currentTasks.filter((t) => t !== task),
  })),

  trackProgress: (skill, progressAmount) => set((state) => ({
    progress: {
      ...state.progress,
      [skill]: (state.progress[skill] || 0) + progressAmount,
    },
  })),

  getLearningFocus: () => {
    const { progress } = get();
    const skills = Object.keys(progress);
    if (skills.length === 0) return "No skills tracked yet.";
    return skills.reduce((a, b) => (progress[a] < progress[b] ? a : b));
  },

  // 重构核心：setTargetLevel（根据 PRD 生成动态路线图）
  setTargetLevel: (target) => {
    const newRoadmap = generateDynamicRoadmap(target);

    set({
      dynamicRoadmap: newRoadmap,
      // 默认激活第一个节点
      activeRoadmapNodeId: newRoadmap.length > 0 ? newRoadmap[0].id : null,
      // 可选：根据等级调整玩家等级（根据实际业务决定是否需要）
      // level: target === 'Junior' ? 1 : target === 'Mid' ? 10 : 20,
    });
  },

  // 新增：切换当前正在攻克的路线图节点
  setActiveRoadmapNode: (id) => {
    // 可加入校验：id 必须存在于当前 roadmap 中
    const { dynamicRoadmap } = get();
    const exists = dynamicRoadmap.some((node) => node.id === id);

    if (id === null || exists) {
      set({ activeRoadmapNodeId: id });
    }
  },
}));

export default useGameStore;