import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ProgressRow, RoadmapRow, UserRow } from '../types/database';

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRoadmapNode = (value: unknown): value is RoadmapNode => {
  if (!isRecord(value)) return false;

  const status = value.status;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.focus === 'string' &&
    (status === 'locked' || status === 'current' || status === 'completed') &&
    typeof value.requiredXP === 'number' &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => typeof task === 'string')
  );
};

const normalizeRoadmapNodes = (value: unknown): RoadmapNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRoadmapNode);
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

  // 2. 核心进度与经验值 (PRD 3.3)
  totalExp: number;
  level: number;
  skillPoints: number;
  skillProgress: Record<string, SkillProgressEntry>;

  // 3. AI 生成的动态数据 (PRD 3.2)
  gapNodes: string[];                // 星盘高亮节点 ID
  dynamicRoadmap: RoadmapNode[];     // 动态学习路线
  activeRoadmapNodeId: string | null; // 当前激活的路线节点

  // 4. 装备系统
  equipment: Equipment[];

  // --- Actions ---
  addExp: (amount: number) => void;
  fetchUserData: () => Promise<void>;
  setSkillPoints: (skillPoints: number) => void;
  setTargetLevel: (direction: string, level: TargetLevel) => void;
  setActiveRoadmapNode: (nodeId: string) => void;
  completeGapNode: (nodeId: string) => void;
  trackProgress: (skillId: string, xpGained: number, isfinished?: boolean) => Promise<void>;
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
  currentUser: null,
  isSyncing: false,
  totalExp: 3250,
  level: 8,
  skillPoints: 15,
  skillProgress: {},
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
        set({
          currentUser: null,
          isSyncing: false,
        });

        return;
      }

      const userId = session.user.id;

      const [userResult, progressResult, roadmapResult] = await Promise.all([
        queryClient
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
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

      const userRow: UserRow | null = userResult.data ?? null;
      const progressRows: ProgressRow[] = progressResult.data ?? [];
      const roadmapRow: RoadmapRow | null = roadmapResult.data?.[0] ?? null;

      if (userResult.error) {
        throw userResult.error;
      }

      if (progressResult.error) {
        throw progressResult.error;
      }

      if (roadmapResult.error) {
        throw roadmapResult.error;
      }

      const nextTotalExp = userRow?.total_exp ?? get().totalExp;
      const nextLevel = userRow?.user_level ?? Math.floor(nextTotalExp / 1000) + 1;
      const nextCareerDirection = userRow?.career_direction ?? get().careerDirection;
      const nextCurrentUser = userRow
        ? mapUserRowToCurrentUser(userRow, session.user.email ?? '')
        : {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName: session.user.user_metadata?.display_name ?? null,
            avatarUrl: session.user.user_metadata?.avatar_url ?? null,
            userLevel: nextLevel,
            totalExp: nextTotalExp,
            careerDirection: nextCareerDirection,
          };

      set({
        currentUser: nextCurrentUser,
        totalExp: nextTotalExp,
        level: nextLevel,
        careerDirection: nextCareerDirection,
        skillProgress: normalizeSkillProgress(progressRows),
        gapNodes: progressRows.filter((row) => !row.is_finished).map((row) => row.skill_id),
        dynamicRoadmap: roadmapRow ? normalizeRoadmapNodes(roadmapRow.roadmap_data) : [],
      });
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

  // 重置系统
  resetOnboarding: () => set({ 
    isOnboarded: false, 
    careerDirection: null, 
    dynamicRoadmap: [], 
    gapNodes: [],
    activeRoadmapNodeId: null,
    currentUser: null,
    skillProgress: {},
  }),
}));

export default useGameStore;