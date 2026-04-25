import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import i18n from '../i18n/config';
import {
  buildExtensionPrompt,
  generateNodePrompt,
  normalizeTaskType,
  requestAI,
  requestBranchSuggestions,
} from '../lib/aiService.ts';
import { INITIAL_ROADMAPS } from '../data/roadmapTemplates';
import { ensureUserProfile, supabase } from '../lib/supabase';
import type { ProgressRow, RoadmapRow, UserRow } from '../types/database';

// --- 类型定义 ---

export type TargetLevel = 'Junior' | 'Mid' | 'Senior';

export type TaskType = 'concept' | 'leetcode' | 'project' | 'feynman' | 'reinforcement';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  referenceId?: string;
  subTasks?: Task[];
  estimatedXP?: number;
}

/**
 * 路线图节点接口 (PRD 3.2)
 */
export interface RoadmapNode {
  id: string;
  parentId?: string | null;
  title: string;       // 对应之前的 label
  focus: string;       // 对应之前的 description
  status: 'locked' | 'current' | 'completed';
  requiredXP: number;
  reinforcementLevel: number;
  isReinforcing: boolean;
  hasBranched?: boolean;
  branchType?: 'deep_dive' | 'side_quest' | 'speed_run';
  tasks: Task[];     // 节点关联的任务列表
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

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  userLevel: number;
  totalExp: number;
  careerDirection: string | null;
}

export interface SkillProgressEntry {
  currentXp: number;
  isFinished: boolean;
  lastActive: string | null;
}

const queryClient = supabase as any;

const TASK_TYPES: TaskType[] = ['concept', 'leetcode', 'project', 'feynman', 'reinforcement'];

const isTaskType = (value: unknown): value is TaskType =>
  typeof value === 'string' && TASK_TYPES.includes(value as TaskType);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createTaskId = (scopeId: string, title: string, index: number) =>
  `${scopeId}-${slugify(title) || 'task'}-${index}`;

const createTask = (
  scopeId: string,
  title: string,
  type: TaskType,
  index: number,
  options: Partial<Omit<Task, 'id' | 'title' | 'type'>> = {}
): Task => ({
  id: createTaskId(scopeId, title, index),
  title,
  type,
  ...options,
});

const normalizeTask = (value: unknown, scopeId: string, index: number): Task | null => {
  if (typeof value === 'string') {
    return createTask(scopeId, value, 'concept', index, { estimatedXP: 10 });
  }

  if (!isRecord(value) || typeof value.title !== 'string') {
    return null;
  }

  const normalizedSubTasks = Array.isArray(value.subTasks)
    ? value.subTasks
        .map((subTask, subIndex) => normalizeTask(subTask, `${scopeId}-${index}`, subIndex))
        .filter((subTask): subTask is Task => Boolean(subTask))
    : undefined;

  return {
    id: typeof value.id === 'string' ? value.id : createTaskId(scopeId, value.title, index),
    title: value.title,
    type: isTaskType(value.type) ? value.type : 'concept',
    referenceId: typeof value.referenceId === 'string' ? value.referenceId : undefined,
    subTasks: normalizedSubTasks && normalizedSubTasks.length > 0 ? normalizedSubTasks : undefined,
    estimatedXP: typeof value.estimatedXP === 'number' ? value.estimatedXP : undefined,
  };
};

const normalizeRoadmapNodes = (value: unknown): RoadmapNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index): RoadmapNode | null => {
      if (!isRecord(item)) {
        return null;
      }

      const status = item.status;
      const normalizedTasks = Array.isArray(item.tasks)
        ? item.tasks
            .map((task, taskIndex) => normalizeTask(task, typeof item.id === 'string' ? item.id : `roadmap-${index}`, taskIndex))
            .filter((task): task is Task => Boolean(task))
        : [];

      if (
        typeof item.id !== 'string' ||
        typeof item.title !== 'string' ||
        typeof item.focus !== 'string' ||
        !(status === 'locked' || status === 'current' || status === 'completed') ||
        typeof item.requiredXP !== 'number'
      ) {
        return null;
      }

      return {
        id: item.id,
        parentId: typeof item.parentId === 'string' ? item.parentId : null,
        title: item.title,
        focus: item.focus,
        status,
        requiredXP: item.requiredXP,
        reinforcementLevel: typeof item.reinforcementLevel === 'number' ? item.reinforcementLevel : 0,
        isReinforcing: typeof item.isReinforcing === 'boolean' ? item.isReinforcing : false,
        tasks: normalizedTasks,
      };
    })
    .filter((node): node is RoadmapNode => Boolean(node));
};

const serializeRoadmapNodes = (nodes: RoadmapNode[]) =>
  nodes.map((node) => ({
    ...node,
    tasks: node.tasks.map((task) => ({ ...task })),
  }));

const cloneTaskTree = (task: Task): Task => ({
  ...task,
  subTasks: task.subTasks?.map((subTask) => cloneTaskTree(subTask)),
});

const cloneRoadmapSeed = (level: TargetLevel): RoadmapNode[] =>
  INITIAL_ROADMAPS[level].map((node) => ({
    ...node,
    parentId: node.parentId ?? null,
    tasks: node.tasks.map((task) => cloneTaskTree(task)),
  }));

const flattenTaskTree = (task: Task): Task[] => [
  task,
  ...(task.subTasks?.flatMap((subTask) => flattenTaskTree(subTask)) ?? []),
];

const flattenRoadmapTasks = (roadmap: RoadmapNode[]): Task[] =>
  roadmap.flatMap((node) => node.tasks.flatMap((task) => flattenTaskTree(task)));

const mapTasksById = (roadmap: RoadmapNode[]): Record<string, Task> =>
  flattenRoadmapTasks(roadmap).reduce<Record<string, Task>>((accumulator, task) => {
    accumulator[task.id] = task;
    return accumulator;
  }, {});

const createUniqueNodeId = (baseId: string, existingIds: Set<string>, indexHint: number) => {
  let candidate = `${baseId}-jit-${indexHint + 1}`;
  let suffix = 1;

  while (existingIds.has(candidate)) {
    candidate = `${baseId}-jit-${indexHint + 1}-${suffix}`;
    suffix += 1;
  }

  existingIds.add(candidate);
  return candidate;
};

const normalizeExtensionNodes = (
  nodes: RoadmapNode[],
  existingRoadmap: RoadmapNode[]
): RoadmapNode[] => {
  const existingIds = new Set(existingRoadmap.map((node) => node.id));

  return nodes.map((node, nodeIndex) => {
    const nextNodeId = createUniqueNodeId(slugify(node.title) || node.id, existingIds, nodeIndex);

    const nextTasks = node.tasks.map((task, taskIndex) => ({
      ...task,
      id: createTaskId(nextNodeId, task.title, taskIndex + 1),
      referenceId: nextNodeId,
      subTasks: task.subTasks?.map((subTask, subTaskIndex) => ({
        ...subTask,
        id: createTaskId(`${nextNodeId}-${taskIndex + 1}`, subTask.title, subTaskIndex + 1),
      })),
    }));

    return {
      ...node,
      id: nextNodeId,
      parentId: null,
      status: 'locked',
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: nextTasks,
    };
  });
};

const BREAKDOWN_TASK_TYPES: TaskType[] = ['concept', 'project', 'leetcode'];
const ROADMAP_TASK_TYPES: TaskType[] = ['concept', 'project', 'leetcode', 'feynman'];

const ROADMAP_FALLBACK_TASK_BLUEPRINTS: Array<{ title: (nodeTitle: string) => string; type: TaskType }> = [
  {
    title: (nodeTitle) => `梳理 ${nodeTitle} 的关键概念并输出结构化笔记`,
    type: 'concept',
  },
  {
    title: (nodeTitle) => `完成一个 ${nodeTitle} 的实战小项目并记录复盘`,
    type: 'project',
  },
  {
    title: (nodeTitle) => `完成 3 道与 ${nodeTitle} 相关的算法训练题`,
    type: 'leetcode',
  },
];

const getRoadmapBaseRequiredXP = (level: TargetLevel) => {
  if (level === 'Junior') {
    return 500;
  }

  if (level === 'Mid') {
    return 2000;
  }

  return 5000;
};

const normalizeNodeStatus = (value: unknown, index: number): RoadmapNode['status'] => {
  if (value === 'locked' || value === 'current' || value === 'completed') {
    return value;
  }

  return index === 0 ? 'current' : 'locked';
};

const normalizeRequiredXP = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;

const normalizeEstimatedXP = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;

const extractAIRoadmapNodes = (payload: unknown, level: TargetLevel): RoadmapNode[] => {
  const rawNodes = (() => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!isRecord(payload)) {
      return [];
    }

    if (Array.isArray(payload.nodes)) {
      return payload.nodes;
    }

    if (Array.isArray(payload.roadmap)) {
      return payload.roadmap;
    }

    if (Array.isArray(payload.stages)) {
      return payload.stages;
    }

    return [];
  })();

  const baseXP = getRoadmapBaseRequiredXP(level);

  return rawNodes
    .map((item, index): RoadmapNode | null => {
      if (!isRecord(item)) {
        return null;
      }

      const fallbackNodeTitle = `阶段 ${index + 1}`;
      const nodeTitle = typeof item.title === 'string' ? item.title : fallbackNodeTitle;
      const nodeFocus = typeof item.focus === 'string' ? item.focus : `${nodeTitle} 的核心能力建设`;
      const nodeId =
        typeof item.id === 'string' ? item.id : `${level.toLowerCase()}-${slugify(nodeTitle) || `stage-${index + 1}`}-${index + 1}`;
      const rawTasks = Array.isArray(item.tasks) ? item.tasks : [];

      const mappedTasks = rawTasks
        .map((taskItem, taskIndex): Task | null => {
          if (typeof taskItem === 'string') {
            const fallbackType = ROADMAP_FALLBACK_TASK_BLUEPRINTS[taskIndex % ROADMAP_FALLBACK_TASK_BLUEPRINTS.length]?.type ?? 'concept';

            return createTask(nodeId, taskItem, fallbackType, taskIndex + 1, {
              referenceId: nodeId,
              estimatedXP: 20,
            });
          }

          if (!isRecord(taskItem) || typeof taskItem.title !== 'string') {
            return null;
          }

          return createTask(
            nodeId,
            taskItem.title,
            normalizeTaskType(taskItem.type, ROADMAP_TASK_TYPES, 'concept'),
            taskIndex + 1,
            {
              referenceId: nodeId,
              estimatedXP: normalizeEstimatedXP(taskItem.estimatedXP, 20),
            }
          );
        })
        .filter((task): task is Task => Boolean(task));

      const normalizedTasks = [...mappedTasks];

      for (let taskIndex = normalizedTasks.length; taskIndex < 3; taskIndex += 1) {
        const blueprint = ROADMAP_FALLBACK_TASK_BLUEPRINTS[taskIndex % ROADMAP_FALLBACK_TASK_BLUEPRINTS.length];

        normalizedTasks.push(
          createTask(nodeId, blueprint.title(nodeTitle), blueprint.type, taskIndex + 1, {
            referenceId: nodeId,
            estimatedXP: 20,
          })
        );
      }

      return {
        id: nodeId,
        parentId: typeof item.parentId === 'string' ? item.parentId : null,
        title: nodeTitle,
        focus: nodeFocus,
        status: normalizeNodeStatus(item.status, index),
        requiredXP: normalizeRequiredXP(item.requiredXP, baseXP + index * 400),
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: normalizedTasks.slice(0, 3),
      };
    })
    .filter((node): node is RoadmapNode => Boolean(node));
};

const buildSafeHarborRoadmap = (level: TargetLevel): RoadmapNode[] => {
  if (level === 'Junior') {
    return [
      {
        id: 'j1',
        title: '核心基础构建',
        focus: '掌握语言底层原理与核心语法',
        status: 'current',
        requiredXP: 500,
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: [
          createTask('j1', '阅读核心语法文档', 'concept', 1, { estimatedXP: 15 }),
          createTask('j1', '手写实现基础算法', 'leetcode', 2, { estimatedXP: 20 }),
          createTask('j1', '完成 5 道基础练习题', 'project', 3, { estimatedXP: 25 }),
        ],
      },
      {
        id: 'j2',
        title: '版本控制专家',
        focus: 'Git 协同开发与分流策略',
        status: 'locked',
        requiredXP: 800,
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: [
          createTask('j2', '执行一次 Rebase', 'concept', 1, { estimatedXP: 15 }),
          createTask('j2', '解决合并冲突', 'project', 2, { estimatedXP: 20 }),
          createTask('j2', '配置 Git Hooks', 'concept', 3, { estimatedXP: 15 }),
        ],
      },
      {
        id: 'j3',
        title: '初级实战工程',
        focus: '独立完成模块化组件开发',
        status: 'locked',
        requiredXP: 1200,
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: [
          createTask('j3', '封装 Button 组件', 'project', 1, { estimatedXP: 20 }),
          createTask('j3', '实现 Todo List', 'project', 2, { estimatedXP: 25 }),
          createTask('j3', '学习 CSS Modules', 'concept', 3, { estimatedXP: 15 }),
        ],
      },
    ];
  }

  if (level === 'Mid') {
    return [
      {
        id: 'm1',
        title: '架构模式实践',
        focus: '深入理解 MVC/MVVM 与设计模式',
        status: 'current',
        requiredXP: 2000,
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: [
          createTask('m1', '重构旧模块逻辑', 'project', 1, { estimatedXP: 30 }),
          createTask('m1', '接入状态管理', 'concept', 2, { estimatedXP: 20 }),
          createTask('m1', '设计组件通信方案', 'feynman', 3, { estimatedXP: 20 }),
        ],
      },
      {
        id: 'm2',
        title: '性能优化专项',
        focus: '全链路性能瓶颈分析与调优',
        status: 'locked',
        requiredXP: 2500,
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: [
          createTask('m2', '定位首屏性能瓶颈并输出诊断报告', 'concept', 1, { estimatedXP: 25 }),
          createTask('m2', '完成关键页面懒加载与缓存策略改造', 'project', 2, { estimatedXP: 30 }),
          createTask('m2', '解决 3 个典型性能优化面试题', 'leetcode', 3, { estimatedXP: 25 }),
        ],
      },
      {
        id: 'm3',
        title: '工程化体系建设',
        focus: 'CI/CD 流水线与自动化测试',
        status: 'locked',
        requiredXP: 3000,
        reinforcementLevel: 0,
        isReinforcing: false,
        tasks: [
          createTask('m3', '搭建最小可用 CI Pipeline', 'project', 1, { estimatedXP: 30 }),
          createTask('m3', '为关键模块补齐单元测试与覆盖率门槛', 'concept', 2, { estimatedXP: 25 }),
          createTask('m3', '完成 3 道与测试设计相关题目', 'leetcode', 3, { estimatedXP: 25 }),
        ],
      },
    ];
  }

  return [
    {
      id: 's1',
      title: '系统架构演进',
      focus: '从单体到微服务的分布式决策',
      status: 'current',
      requiredXP: 5000,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        createTask('s1', '梳理服务拆分边界与数据一致性权衡', 'concept', 1, { estimatedXP: 30 }),
        createTask('s1', '完成一次故障降级策略演练', 'project', 2, { estimatedXP: 35 }),
        createTask('s1', '向 AI 解释此核心原理，并接受逻辑评估', 'feynman', 3, { estimatedXP: 35 }),
      ],
    },
    {
      id: 's2',
      title: '技术选型方法论',
      focus: '复杂业务场景下的技术栈评估',
      status: 'locked',
      requiredXP: 6000,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        createTask('s2', '建立选型评估矩阵并对比三套方案', 'concept', 1, { estimatedXP: 30 }),
        createTask('s2', '输出带成本估算的技术决策记录', 'project', 2, { estimatedXP: 35 }),
        createTask('s2', '向 AI 解释此核心原理，并接受逻辑评估', 'feynman', 3, { estimatedXP: 35 }),
      ],
    },
    {
      id: 's3',
      title: '团队技术领导力',
      focus: '技术架构委员会与标准制定',
      status: 'locked',
      requiredXP: 8000,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        createTask('s3', '制定跨团队代码评审标准与准入规范', 'concept', 1, { estimatedXP: 30 }),
        createTask('s3', '组织一次架构评审并沉淀决策文档', 'project', 2, { estimatedXP: 35 }),
        createTask('s3', '向 AI 解释此核心原理，并接受逻辑评估', 'feynman', 3, { estimatedXP: 35 }),
      ],
    },
  ];
};

const extractAIMappedTasks = (
  payload: unknown,
  allowedTypes: readonly TaskType[],
  fallbackType: TaskType,
  scopeId: string,
  referenceId: string
): Task[] => {
  const rawTasks = (() => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (isRecord(payload) && Array.isArray(payload.subTasks)) {
      return payload.subTasks;
    }

    if (isRecord(payload) && Array.isArray(payload.tasks)) {
      return payload.tasks;
    }

    return [];
  })();

  return rawTasks
    .map((item, index): Task | null => {
      if (!isRecord(item) || typeof item.title !== 'string') {
        return null;
      }

      return createTask(
        scopeId,
        item.title,
        normalizeTaskType(item.type, allowedTypes, fallbackType),
        index + 1,
        {
          referenceId,
          estimatedXP: normalizeEstimatedXP(item.estimatedXP, 10),
        }
      );
    })
    .filter((task): task is Task => Boolean(task));
};

const syncRoadmapToSupabase = async (userId: string, roadmap: RoadmapNode[]) => {
  const now = new Date().toISOString();

  try {
    const { data: roadmapRow, error: fetchError } = await queryClient
      .from('roadmaps')
      .select('id')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (roadmapRow?.id) {
      const { error: updateError } = await queryClient
        .from('roadmaps')
        .update({
          roadmap_data: serializeRoadmapNodes(roadmap),
          updated_at: now,
        })
        .eq('id', roadmapRow.id);

      if (updateError) {
        throw updateError;
      }

      return;
    }

    const { error: insertError } = await queryClient.from('roadmaps').insert({
      user_id: userId,
      roadmap_data: serializeRoadmapNodes(roadmap),
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    console.error('[useGameStore:syncRoadmap] Failed to sync roadmap:', error);
  }
};

const normalizeSkillProgress = (rows: ProgressRow[]): Record<string, SkillProgressEntry> =>
  rows.reduce<Record<string, SkillProgressEntry>>((accumulator, row) => {
    accumulator[row.skill_id] = {
      currentXp: row.current_xp,
      isFinished: row.is_finished,
      lastActive: row.last_active,
    };

    return accumulator;
  }, {});

const mapUserRowToCurrentUser = (
  userRow: UserRow,
  fallbackEmail: string
): CurrentUser => ({
  id: userRow.id,
  email: userRow.email || fallbackEmail,
  displayName: userRow.display_name,
  avatarUrl: userRow.avatar_url,
  userLevel: userRow.user_level,
  totalExp: userRow.total_exp,
  careerDirection: userRow.career_direction,
});

interface GameState {
  // 1. 职业定锚状态 (PRD 3.1)
  careerDirection: string | null;
  userTargetLevel: TargetLevel;
  isOnboarded: boolean;
  currentUser: CurrentUser | null;
  isSyncing: boolean;
  isExtending: boolean;
  branchingNodeId: string | null;
  branchSuggestions: RoadmapNode[] | null;

  // 2. 核心进度与经验值 (PRD 3.3)
  totalExp: number;
  level: number;
  skillPoints: number;
  skillProgress: Record<string, SkillProgressEntry>;

  // 3. AI 生成的动态数据 (PRD 3.2)
  gapNodes: string[];                // 星盘高亮节点 ID
  dynamicRoadmap: RoadmapNode[];     // 动态学习路线
  activeRoadmapNodeId: string | null; // 当前激活的路线节点
  lastAddedBranchNodeId: string | null;

  // 4. 装备系统
  equipment: Equipment[];

  // 5. 国际化 (i18n)
  language: 'zh' | 'en';

  // --- Actions ---
  addExp: (amount: number) => void;
  fetchUserData: () => Promise<void>;
  setSkillPoints: (skillPoints: number) => void;
  setTargetLevel: (direction: string, level: TargetLevel) => void;
  extendRoadmapWithAI: () => Promise<void>;
  generateBranchSuggestions: (nodeId: string) => Promise<void>;
  addBranchToRoadmap: (parentNodeId: string, chosenNode: RoadmapNode) => Promise<void>;
  setActiveRoadmapNode: (nodeId: string) => void;
  completeGapNode: (nodeId: string) => void;
  trackProgress: (skillId: string, xpGained: number, isfinished?: boolean) => Promise<void>;
  reinforceNode: (nodeId: string) => Promise<void>;
  breakdownTask: (taskId: string) => Promise<void>;
  equipItem: (id: string, slot: Equipment['equippedSlot']) => void;
  unequipItem: (id: string) => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  resetOnboarding: () => void;
  signOut: () => Promise<void>;
}

// --- Store 实现 ---

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  // 初始状态
  careerDirection: null,
  userTargetLevel: 'Junior',
  isOnboarded: false,
  currentUser: null,
  isSyncing: false,
  isExtending: false,
  branchingNodeId: null,
  branchSuggestions: null,
  totalExp: 3250,
  level: 8,
  skillPoints: 15,
  skillProgress: {},
  gapNodes: [],
  dynamicRoadmap: [],
  activeRoadmapNodeId: null,
  lastAddedBranchNodeId: null,
  language: 'zh',
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
    const nextState = get();
    const newTotal = nextState.totalExp + amount;
    const newLevel = Math.floor(newTotal / 1000) + 1;
    set({
      totalExp: newTotal,
      level: newLevel,
      currentUser: nextState.currentUser
        ? {
            ...nextState.currentUser,
            totalExp: newTotal,
            userLevel: newLevel,
          }
        : null,
    });

    void (async () => {
      const currentUser = get().currentUser;

      if (!currentUser) {
        return;
      }

      try {
        const { error } = await queryClient
          .from('users')
          .update({
            total_exp: newTotal,
            user_level: newLevel,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('[useGameStore:addExp] Failed to sync user exp:', error);
      }
    })();
  },

  fetchUserData: async () => {
    set({ isSyncing: true });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await queryClient.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        get().resetOnboarding();
        set({ isSyncing: false });

        return;
      }

      const userId = session.user.id;

      let userResult = await queryClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userResult.error) {
        throw userResult.error;
      }

      let userRow: UserRow | null = userResult.data ?? null;

      if (!userRow) {
        await ensureUserProfile(session);

        userResult = await queryClient
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (userResult.error) {
          throw userResult.error;
        }

        userRow = userResult.data ?? null;
      }

      if (!userRow) {
        throw new Error('Missing users row after ensureUserProfile.');
      }

      const [progressResult, roadmapResult] = await Promise.all([
        queryClient
          .from('progress')
          .select('*')
          .eq('user_id', userId),
        queryClient
          .from('roadmaps')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1),
      ]);

      const progressRows: ProgressRow[] = progressResult.data ?? [];
      const roadmapRow: RoadmapRow | null = roadmapResult.data?.[0] ?? null;

      if (progressResult.error) {
        throw progressResult.error;
      }

      if (roadmapResult.error) {
        throw roadmapResult.error;
      }

      const nextTotalExp = userRow.total_exp;
      const nextLevel = userRow.user_level;
      const nextCareerDirection = userRow.career_direction;
      const nextCurrentUser = mapUserRowToCurrentUser(userRow, session.user.email ?? '');
      const nextDynamicRoadmap = roadmapRow ? normalizeRoadmapNodes(roadmapRow.roadmap_data) : [];
      const hasPersistedOnboardingData = Boolean(nextCareerDirection) || nextDynamicRoadmap.length > 0;

      set({
        currentUser: nextCurrentUser,
        totalExp: nextTotalExp,
        level: nextLevel,
        careerDirection: nextCareerDirection,
        isOnboarded: hasPersistedOnboardingData,
        skillProgress: normalizeSkillProgress(progressRows),
        gapNodes: progressRows.filter((row) => !row.is_finished).map((row) => row.skill_id),
        dynamicRoadmap: nextDynamicRoadmap,
        activeRoadmapNodeId: nextDynamicRoadmap[0]?.id ?? null,
      });

      if (hasPersistedOnboardingData) {
        set({ isOnboarded: true });
      }
    } catch (error) {
      console.error('[useGameStore:fetchUserData] Failed to load user data:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  // 技能点更新
  setSkillPoints: (skillPoints) => set({ skillPoints }),

  // 核心重构：双重定锚方法 (PRD 3.1)
  setTargetLevel: (direction, level) => {
    const nextRoadmap = cloneRoadmapSeed(level);
    const nextGapNodes = nextRoadmap.flatMap((node) => node.tasks.map((task) => task.id));
    const now = new Date().toISOString();

    set({
      careerDirection: direction,
      userTargetLevel: level,
      isOnboarded: true,
      dynamicRoadmap: nextRoadmap,
      skillProgress: {},
      gapNodes: nextGapNodes,
      activeRoadmapNodeId: nextRoadmap[0]?.id || null,
      lastAddedBranchNodeId: null,
      isSyncing: false,
    });

    const currentUser = get().currentUser;
    if (currentUser) {
      void (async () => {
        try {
          const { error } = await queryClient.from('users').upsert(
            {
              id: currentUser.id,
              email: currentUser.email,
              display_name: currentUser.displayName,
              avatar_url: currentUser.avatarUrl,
              career_direction: direction,
              user_level: currentUser.userLevel,
              total_exp: currentUser.totalExp,
              updated_at: now,
            },
            {
              onConflict: 'id',
            }
          );

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error('[useGameStore:setTargetLevel] Failed to sync user baseline:', error);
        }
      })();

      void syncRoadmapToSupabase(currentUser.id, nextRoadmap);
    }
  },

  extendRoadmapWithAI: async () => {
    const currentState = get();

    if (currentState.isExtending || currentState.dynamicRoadmap.length === 0) {
      return;
    }

    set({ isExtending: true });

    try {
      const taskMap = mapTasksById(currentState.dynamicRoadmap);
      const completedHistoryTasks = Object.entries(currentState.skillProgress).reduce<
        Array<{ title: string; type: TaskType; currentXp: number; lastActive: string | null }>
      >((accumulator, [taskId, entry]) => {
        if (!entry.isFinished) {
          return accumulator;
        }

        const task = taskMap[taskId];
        if (!task) {
          return accumulator;
        }

        accumulator.push({
          title: task.title,
          type: task.type,
          currentXp: entry.currentXp,
          lastActive: entry.lastActive,
        });

        return accumulator;
      }, []);

      if (completedHistoryTasks.length === 0) {
        return;
      }

      const weakPoints = currentState.gapNodes
        .map((taskId) => taskMap[taskId]?.title)
        .filter((title): title is string => Boolean(title))
        .slice(0, 8);

      const prompt = buildExtensionPrompt(completedHistoryTasks, weakPoints);
      const aiResponse = await requestAI(prompt.systemPrompt, prompt.userPrompt);
      const generatedNodes = extractAIRoadmapNodes(aiResponse, currentState.userTargetLevel).slice(0, 2);

      if (generatedNodes.length === 0) {
        throw new Error('AI did not return extension roadmap nodes.');
      }

      const currentRoadmap = get().dynamicRoadmap;
      const normalizedExtensionNodes = normalizeExtensionNodes(generatedNodes, currentRoadmap);
      const nextRoadmap = [...currentRoadmap, ...normalizedExtensionNodes];

      set({ dynamicRoadmap: nextRoadmap, lastAddedBranchNodeId: null });

      const currentUser = get().currentUser;
      if (currentUser) {
        await syncRoadmapToSupabase(currentUser.id, nextRoadmap);
      }
    } catch (error) {
      console.error('[useGameStore:extendRoadmapWithAI] Failed to extend roadmap:', error);
    } finally {
      set({ isExtending: false });
    }
  },

  generateBranchSuggestions: async (nodeId) => {
    set({ branchingNodeId: nodeId, branchSuggestions: null });

    try {
      const sourceNode = get().dynamicRoadmap.find((node) => node.id === nodeId);

      if (!sourceNode) {
        throw new Error('Source roadmap node not found.');
      }

      const aiResponse = await requestBranchSuggestions(sourceNode.title, sourceNode.focus, get().userTargetLevel);
      const branchTypes: Array<'deep_dive' | 'side_quest' | 'speed_run'> = ['deep_dive', 'side_quest', 'speed_run'];
      const suggestions = extractAIRoadmapNodes(aiResponse, get().userTargetLevel)
        .slice(0, 3)
        .map((node, index) => ({
          ...node,
          status: 'locked' as const,
          branchType: node.branchType ?? branchTypes[index % branchTypes.length],
          hasBranched: false,
        }));

      if (suggestions.length === 0) {
        throw new Error('AI did not return branch suggestions.');
      }

      set({ branchSuggestions: suggestions, branchingNodeId: null });
    } catch (error) {
      set({ branchingNodeId: null, branchSuggestions: null });
      toast.error('分支建议生成失败，请稍后重试。');
      console.error('[useGameStore:generateBranchSuggestions] Failed to generate branch suggestions:', error);
    }
  },

  addBranchToRoadmap: async (parentNodeId, chosenNode) => {
    const currentState = get();
    const parentNode = currentState.dynamicRoadmap.find((node) => node.id === parentNodeId);

    if (!parentNode) {
      toast.error('未找到可插入分支的父节点。');
      return;
    }

    const existingIds = new Set(currentState.dynamicRoadmap.map((node) => node.id));
    const insertedNodeId = createUniqueNodeId(
      slugify(chosenNode.title) || chosenNode.id,
      existingIds,
      currentState.dynamicRoadmap.length + 1
    );
    const insertedNode: RoadmapNode = {
      ...chosenNode,
      id: insertedNodeId,
      parentId: parentNodeId,
      status: 'locked',
      reinforcementLevel: 0,
      isReinforcing: false,
      hasBranched: false,
      tasks: chosenNode.tasks.map((task, taskIndex) => ({
        ...task,
        id: createTaskId(insertedNodeId, task.title, taskIndex + 1),
        referenceId: insertedNodeId,
        subTasks: task.subTasks?.map((subTask, subTaskIndex) => ({
          ...subTask,
          id: createTaskId(`${insertedNodeId}-${taskIndex + 1}`, subTask.title, subTaskIndex + 1),
        })),
      })),
    };

    const nextRoadmap = [
      ...currentState.dynamicRoadmap.map((node) =>
        node.id === parentNodeId
          ? {
              ...node,
              hasBranched: true,
            }
          : node
      ),
      insertedNode,
    ];

    set({
      dynamicRoadmap: nextRoadmap,
      branchSuggestions: null,
      branchingNodeId: null,
      lastAddedBranchNodeId: insertedNodeId,
    });

    const currentUser = get().currentUser;
    if (currentUser) {
      await syncRoadmapToSupabase(currentUser.id, nextRoadmap);
    }
  },

  // 切换激活节点
  setActiveRoadmapNode: (nodeId) => set({ activeRoadmapNodeId: nodeId }),

  // 缺口节点完成后，从待办列表中移除
  completeGapNode: (nodeId) =>
    set((state) => ({
      gapNodes: state.gapNodes.filter((gapNodeId) => gapNodeId !== nodeId),
    })),

  reinforceNode: async (nodeId) => {
    const currentRoadmap = get().dynamicRoadmap;
    const nodeIndex = currentRoadmap.findIndex((node) => node.id === nodeId);

    if (nodeIndex < 0) {
      toast.error('未找到可强化的节点。');
      return;
    }

    const sourceNode = currentRoadmap[nodeIndex];
    const nextReinforcementLevel = sourceNode.reinforcementLevel + 1;
    const loadingToastId = toast.loading('AI 正在重构你的学习路径...');

    set((state) => ({
      dynamicRoadmap: state.dynamicRoadmap.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              reinforcementLevel: nextReinforcementLevel,
              isReinforcing: true,
            }
          : node
      ),
    }));

    try {
      const historyTasks = sourceNode.tasks.map((task) => ({
        title: task.title,
        type: task.type,
      }));
      const prompt = generateNodePrompt({
        mode: 'reinforce',
        nodeTitle: sourceNode.title,
        nodeFocus: sourceNode.focus,
        historyTasks,
      });
      const aiResponse = await requestAI(prompt.systemPrompt, prompt.userPrompt);
      const reinforcementTasks = extractAIMappedTasks(
        aiResponse,
        ['reinforcement'],
        'reinforcement',
        sourceNode.id,
        sourceNode.id
      );

      if (reinforcementTasks.length === 0) {
        throw new Error('AI did not return valid reinforcement tasks.');
      }

      const nextRoadmap = currentRoadmap.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              reinforcementLevel: nextReinforcementLevel,
              isReinforcing: false,
              tasks: [...node.tasks, ...reinforcementTasks],
            }
          : node
      );

      set({ dynamicRoadmap: nextRoadmap });
      toast.success('AI 已完成节点强化。', { id: loadingToastId });

      const currentUser = get().currentUser;

      if (currentUser) {
        await syncRoadmapToSupabase(currentUser.id, nextRoadmap);
      }
    } catch (error) {
      set((state) => ({
        dynamicRoadmap: state.dynamicRoadmap.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                reinforcementLevel: sourceNode.reinforcementLevel,
                isReinforcing: false,
              }
            : node
        ),
      }));
      toast.error('AI 接口失败，已保留原任务，请稍后再试。', { id: loadingToastId });
      console.error('[useGameStore:reinforceNode] Failed to reinforce node:', error);
    }
  },

  breakdownTask: async (taskId) => {
    const currentRoadmap = get().dynamicRoadmap;
    const targetNode = currentRoadmap.find((node) => node.tasks.some((task) => task.id === taskId));

    if (!targetNode) {
      toast.error('未找到可拆解的任务。');
      return;
    }

    const targetTask = targetNode.tasks.find((task) => task.id === taskId);

    if (!targetTask) {
      toast.error('未找到可拆解的任务。');
      return;
    }

    const loadingToastId = toast.loading('AI 正在重构你的学习路径...');

    try {
      const prompt = generateNodePrompt({
        mode: 'breakdown',
        nodeTitle: targetNode.title,
        nodeFocus: targetNode.focus,
        taskTitle: targetTask.title,
      });
      const aiResponse = await requestAI(prompt.systemPrompt, prompt.userPrompt);
      const subTasks = extractAIMappedTasks(
        aiResponse,
        BREAKDOWN_TASK_TYPES,
        'concept',
        targetNode.id,
        targetTask.id
      );

      if (subTasks.length === 0) {
        throw new Error('AI did not return valid breakdown tasks.');
      }

      const totalAllocatedXp = subTasks.reduce((sum, subTask) => sum + (subTask.estimatedXP ?? 0), 0);
      const nextRoadmap = currentRoadmap.map((node) => {
        if (node.id !== targetNode.id) {
          return node;
        }

        return {
          ...node,
          tasks: node.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks,
                  estimatedXP: totalAllocatedXp,
                }
              : task
          ),
        };
      });

      set({ dynamicRoadmap: nextRoadmap });
      toast.success('AI 已完成任务拆解。', { id: loadingToastId });

      const currentUser = get().currentUser;

      if (!currentUser) {
        return;
      }

      await syncRoadmapToSupabase(currentUser.id, nextRoadmap);
    } catch (error) {
      toast.error('AI 接口失败，已保留原任务，请稍后再试。', { id: loadingToastId });
      console.error('[useGameStore:breakdownTask] Failed to breakdown task:', error);
    }
  },

  trackProgress: async (skillId, xpGained, isfinished) => {
    const currentState = get();
    const currentProgress = currentState.skillProgress[skillId] ?? {
      currentXp: 0,
      isFinished: false,
      lastActive: null,
    };
    const nextCurrentXp = currentProgress.currentXp + xpGained;
    const nextIsFinished = Boolean(isfinished ?? currentProgress.isFinished);
    const nextLastActive = new Date().toISOString();

    set((state) => ({
      skillProgress: {
        ...state.skillProgress,
        [skillId]: {
          currentXp: nextCurrentXp,
          isFinished: nextIsFinished,
          lastActive: nextLastActive,
        },
      },
      gapNodes: nextIsFinished
        ? state.gapNodes.filter((gapNodeId) => gapNodeId !== skillId)
        : state.gapNodes.includes(skillId)
          ? state.gapNodes
          : [...state.gapNodes, skillId],
    }));

    const postUpdateState = get();
    const allTasks = flattenRoadmapTasks(postUpdateState.dynamicRoadmap);
    const totalTaskCount = allTasks.length;
    const completedTaskCount = allTasks.reduce(
      (count, task) => (postUpdateState.skillProgress[task.id]?.isFinished ? count + 1 : count),
      0
    );
    const completionRate = totalTaskCount > 0 ? completedTaskCount / totalTaskCount : 0;

    if (completionRate > 0.7 && !postUpdateState.isExtending) {
      void postUpdateState.extendRoadmapWithAI();
    }

    const currentUser = get().currentUser;

    if (!currentUser) {
      return;
    }

    try {
      const { error } = await queryClient.from('progress').upsert(
        {
          user_id: currentUser.id,
          skill_id: skillId,
          current_xp: nextCurrentXp,
          is_finished: nextIsFinished,
          last_active: nextLastActive,
        },
        {
          onConflict: 'user_id,skill_id',
        }
      );

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[useGameStore:trackProgress] Failed to sync progress:', error);
    }
  },

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

  // 语言切换
  setLanguage: (lang: 'zh' | 'en') => {
    set({ language: lang });
    void i18n.changeLanguage(lang);
  },

  // 重置系统
  resetOnboarding: () => set({ 
    isOnboarded: false, 
    careerDirection: null, 
    dynamicRoadmap: [], 
    gapNodes: [],
    activeRoadmapNodeId: null,
    lastAddedBranchNodeId: null,
    branchingNodeId: null,
    branchSuggestions: null,
    currentUser: null,
    skillProgress: {},
  }),

  signOut: async () => {
    const resetState = {
      isOnboarded: false,
      careerDirection: null,
      userTargetLevel: 'Junior' as TargetLevel,
      currentUser: null,
      isSyncing: false,
      isExtending: false,
      branchingNodeId: null,
      branchSuggestions: null,
      dynamicRoadmap: [],
      gapNodes: [],
      skillProgress: {},
      activeRoadmapNodeId: null,
      lastAddedBranchNodeId: null,
      totalExp: 3250,
      level: 8,
      skillPoints: 15,
    };

    try {
      const { error } = await queryClient.auth.signOut();

      if (error) {
        throw error;
      }

      set(resetState);
      toast.success('已退出登录');
    } catch (error) {
      set(resetState);
      toast.error('退出登录失败，已清理本地会话状态');
      console.error('[useGameStore:signOut] Failed to sign out:', error);
    }
  },
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);

export default useGameStore;