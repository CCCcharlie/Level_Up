import { requestAI } from './aiService';

// 定义AI提炼结果的数据结构
export interface ExtractionResult {
  categories: Category[];
  extractedContent: ExtractedContent[];
}

export interface Category {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  type: 'concept' | 'question' | 'practice';
}

export interface ExtractedContent {
  id: string;
  title: string;
  type: 'concept' | 'question' | 'practice';
  content: string;
}

// AI提炼提示词
const EXTRACTION_SYSTEM_PROMPT = [
  '你是一个资深技术面试教练和学习内容架构师。',
  '你的任务是分析用户提供的面经/笔记文本，完成以下工作：',
  '1. 识别知识领域：将内容归类到不同的知识主题（如 "浏览器渲染机制"、"React 原理"、"算法"）',
  '2. 提炼 Checklist：为每个知识主题生成可勾选的学习检查项',
  '3. 区分内容类型：标注每条内容是"基础概念"、"大厂真题"还是"实操练习"',
  '4. 保留原始出处：如果内容中有明确的公司/轮次信息，需标注',
  '5. 输出格式必须是严格的JSON，不要任何额外解释或标记。',
  '输出JSON结构：{"categories":[{"id":"string","title":"string","items":[{"id":"string","title":"string","completed":false,"type":"concept|question|practice"}]}],"extractedContent":[{"id":"string","title":"string","type":"concept|question|practice","content":"string"}]}',
].join('\n');

/**
 * 提取和提炼来源内容
 * @param sourceContent 来源内容
 * @returns 提炼结果
 */
export const extractSourceContent = async (sourceContent: string): Promise<ExtractionResult> => {
  const userPrompt = `请分析以下学习资料内容并进行提炼：

${sourceContent}

请按照系统提示词的要求输出JSON格式的结果。`;

  try {
    const result = await requestAI(EXTRACTION_SYSTEM_PROMPT, userPrompt);
    
    // 验证结果结构
    if (typeof result === 'object' && result !== null) {
      const extractionResult = result as ExtractionResult;
      
      // 确保所有checklist项初始状态为未完成
      if (extractionResult.categories) {
        extractionResult.categories = extractionResult.categories.map(category => ({
          ...category,
          items: category.items.map(item => ({
            ...item,
            completed: false // 初始化为未完成状态
          }))
        }));
      }
      
      return extractionResult;
    } else {
      throw new Error('AI返回的结果不是有效的对象');
    }
  } catch (error) {
    console.error('AI内容提炼失败:', error);
    
    // 返回默认结果作为备选
    return {
      categories: [
        {
          id: 'fallback-category',
          title: '基础知识',
          items: [
            {
              id: 'fallback-item-1',
              title: '理解核心概念',
              completed: false,
              type: 'concept'
            }
          ]
        }
      ],
      extractedContent: [
        {
          id: 'fallback-content-1',
          title: '核心知识点',
          type: 'concept',
          content: 'AI提炼未能成功处理内容，请稍后重试。'
        }
      ]
    };
  }
};