import type { CategoryChecklist } from "../types/database";

export const MOCK_LOGS = [
  "初始化检索上下文...",
  "识别关键概念与术语",
  "分析用户学习目标",
  "定位相关知识领域",
  "构建概念依赖图谱",
  "提取核心知识点",
  "生成学习路径规划",
  "完成上下文构建",
];

interface MockDataResult {
  categories: CategoryChecklist[];
  sources: Array<{
    id: string;
    sourceLabel: string;
    title: string;
    excerpt: string;
    body: string;
    origin: string;
    url?: string;
  }>;
}

export function makeMockData(nodeTitle: string): MockDataResult {
  return {
    categories: [
      {
        id: "category-1",
        title: "基础知识",
        summary: "掌握核心概念和原理",
        defaultOpen: true,
        items: [
          {
            id: "item-1",
            title: "了解基本定义",
            detail: "熟悉核心概念和术语",
            completed: false,
            type: "concept"
          },
          {
            id: "item-2",
            title: "理解应用场景",
            detail: "掌握实际应用方法",
            completed: false,
            type: "practice"
          }
        ]
      },
      {
        id: "category-2",
        title: "进阶技能",
        summary: "深入理解和实践应用",
        defaultOpen: false,
        items: [
          {
            id: "item-3",
            title: "复杂问题解决",
            detail: "运用知识解决实际问题",
            completed: false,
            type: "practice"
          }
        ]
      }
    ],
    sources: [
      {
        id: "source-1",
        sourceLabel: "DOC",
        title: "官方文档指南",
        excerpt: "详细介绍了核心概念和使用方法...",
        body: "这里是完整的文档内容...",
        origin: "Official Documentation"
      },
      {
        id: "source-2",
        sourceLabel: "ART",
        title: "学术论文参考",
        excerpt: "深入研究了相关理论基础...",
        body: "这里是完整的论文内容...",
        origin: "Academic Paper"
      }
    ]
  };
}