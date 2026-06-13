import { useState, useCallback } from 'react';
import { requestAIMarkdownStream } from '../lib/aiService';

export function useAIStreamChat() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);

  const startStream = useCallback(async (systemPrompt: string, userPrompt: string) => {
    setContent('');
    setIsStreaming(true);
    setIsError(false);

    try {
      const generator = requestAIMarkdownStream(systemPrompt, userPrompt);
      
      for await (const chunk of generator) {
        setContent((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setIsError(true);
      setContent((prev) => prev + '\n\n**[系统提示]** 生成过程中断，请重试或检查 API 配置。');
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { content, isStreaming, isError, startStream, setContent };
}
