import type { RoadmapNode, TargetLevel } from '../store/useGameStore';

export const INITIAL_ROADMAPS: Record<TargetLevel, RoadmapNode[]> = {
  Junior: [
    {
      id: 'j-seed-1',
      title: '语言与工程基础',
      focus: '建立稳定的语法、调试与代码组织能力',
      status: 'current',
      requiredXP: 400,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        {
          id: 'j-seed-1-concept-1',
          title: '梳理作用域、闭包与异步模型并输出学习卡片',
          type: 'concept',
          estimatedXP: 15,
        },
        {
          id: 'j-seed-1-project-2',
          title: '实现带表单校验和本地存储的任务管理小应用',
          type: 'project',
          estimatedXP: 25,
        },
        {
          id: 'j-seed-1-leetcode-3',
          title: '完成 3 道数组与哈希表基础题并总结解题模板',
          type: 'leetcode',
          estimatedXP: 20,
        },
      ],
    },
    {
      id: 'j-seed-2',
      title: '前端组件协作',
      focus: '掌握组件拆分、状态提升与接口联调流程',
      status: 'locked',
      requiredXP: 800,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        {
          id: 'j-seed-2-concept-1',
          title: '总结可复用组件设计规范与常见反模式',
          type: 'concept',
          estimatedXP: 15,
        },
        {
          id: 'j-seed-2-project-2',
          title: '封装一组可复用表单组件并接入真实 API',
          type: 'project',
          estimatedXP: 25,
        },
        {
          id: 'j-seed-2-leetcode-3',
          title: '完成 3 道双指针与滑动窗口题并录制讲解',
          type: 'leetcode',
          estimatedXP: 20,
        },
      ],
    },
  ],
  Mid: [
    {
      id: 'm-seed-1',
      title: '系统化性能优化',
      focus: '建立从监控到优化落地的闭环能力',
      status: 'current',
      requiredXP: 1800,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        {
          id: 'm-seed-1-concept-1',
          title: '梳理渲染链路性能指标并建立排查清单',
          type: 'concept',
          estimatedXP: 25,
        },
        {
          id: 'm-seed-1-project-2',
          title: '对核心页面实施分包、预加载与缓存策略改造',
          type: 'project',
          estimatedXP: 35,
        },
        {
          id: 'm-seed-1-leetcode-3',
          title: '完成 3 道二分与前缀和题并沉淀复杂度分析模板',
          type: 'leetcode',
          estimatedXP: 25,
        },
      ],
    },
    {
      id: 'm-seed-2',
      title: '工程化与质量体系',
      focus: '构建可持续交付的测试与发布能力',
      status: 'locked',
      requiredXP: 2600,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        {
          id: 'm-seed-2-concept-1',
          title: '建立测试分层策略并定义质量门禁',
          type: 'concept',
          estimatedXP: 25,
        },
        {
          id: 'm-seed-2-project-2',
          title: '搭建 CI 流水线实现自动测试与预发部署',
          type: 'project',
          estimatedXP: 35,
        },
        {
          id: 'm-seed-2-leetcode-3',
          title: '完成 3 道图与拓扑排序题并总结工程场景映射',
          type: 'leetcode',
          estimatedXP: 25,
        },
      ],
    },
  ],
  Senior: [
    {
      id: 's-seed-1',
      title: '架构决策与演进',
      focus: '提升复杂系统边界划分与演进决策能力',
      status: 'current',
      requiredXP: 4500,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        {
          id: 's-seed-1-concept-1',
          title: '输出服务拆分与数据一致性权衡决策框架',
          type: 'concept',
          estimatedXP: 35,
        },
        {
          id: 's-seed-1-project-2',
          title: '主导一次核心链路灰度发布与故障演练',
          type: 'project',
          estimatedXP: 45,
        },
        {
          id: 's-seed-1-leetcode-3',
          title: '完成 3 道高频系统设计配套算法题并沉淀讲稿',
          type: 'leetcode',
          estimatedXP: 35,
        },
      ],
    },
    {
      id: 's-seed-2',
      title: '技术领导力与组织赋能',
      focus: '形成团队级技术标准与交付治理能力',
      status: 'locked',
      requiredXP: 6200,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: [
        {
          id: 's-seed-2-concept-1',
          title: '制定跨团队架构评审标准与风险评估模板',
          type: 'concept',
          estimatedXP: 35,
        },
        {
          id: 's-seed-2-project-2',
          title: '推动一次跨团队重构项目并输出可复用方法论',
          type: 'project',
          estimatedXP: 45,
        },
        {
          id: 's-seed-2-leetcode-3',
          title: '完成 3 道高级图论题并映射到容量规划场景',
          type: 'leetcode',
          estimatedXP: 35,
        },
      ],
    },
  ],
};
