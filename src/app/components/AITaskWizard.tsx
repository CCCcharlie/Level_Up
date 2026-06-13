import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Target, Sparkles, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { buildOnboardingMarkdownPrompt } from '../../lib/aiService';
import { useAIStreamChat } from '../../hooks/useAIStreamChat';

interface AITaskWizardProps {
  onGoalChange: (goal: string) => void;
}

export function AITaskWizard({ onGoalChange }: AITaskWizardProps) {
  const [goal, setGoal] = useState('');
  const { content, isStreaming, isError, startStream } = useAIStreamChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom as content streams
  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [content, isStreaming]);

  const handleAnalyzeGoal = async () => {
    if (!goal.trim()) return;
    const prompt = buildOnboardingMarkdownPrompt(goal, 'General', 'Beginner');
    await startStream(prompt.systemPrompt, prompt.userPrompt);
  };

  const hasContent = content.length > 0;

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-2rem)]">
      {/* Input Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 z-10 sticky top-4">
        <Card className="border-indigo-100 shadow-md">
          <CardHeader className="bg-indigo-50/30">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Target className="w-5 h-5 text-indigo-600" />
              设定你的学习目标
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="例如：成为一名全栈开发工程师，或者掌握 React 核心原理..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="flex-1 text-lg h-12"
                disabled={isStreaming}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyzeGoal(); }}
              />
              <Button
                onClick={handleAnalyzeGoal}
                disabled={!goal.trim() || isStreaming}
                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-md font-medium shrink-0"
              >
                {isStreaming && !hasContent ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在连线AI...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> 拆解目标</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streaming Message Thread */}
      <AnimatePresence>
        {hasContent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 pb-20 mt-4 flex-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1 border border-indigo-200">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 bg-white p-6 rounded-2xl rounded-tl-sm border border-indigo-100 shadow-sm transition-all duration-300">
                {/* 
                  Use prose to style Markdown natively. 
                  Staggered reveal is naturally achieved via stream + react-markdown updating.
                */}
                <div className="prose prose-indigo prose-sm sm:prose-base max-w-none 
                                prose-headings:font-bold prose-headings:text-indigo-900 
                                prose-li:marker:text-indigo-500
                                prose-hr:border-indigo-100 prose-hr:my-6
                                [&>ul>li>input[type=checkbox]]:text-indigo-600
                                [&>ul>li>input[type=checkbox]]:rounded-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
                
                {/* Cursor animation while streaming */}
                {isStreaming && (
                  <div className="mt-4 flex items-center gap-1 text-indigo-400">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-75">●</span>
                    <span className="animate-pulse delay-150">●</span>
                  </div>
                )}
                
                {/* Action buttons appear only when stream is fully complete */}
                {!isStreaming && !isError && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="mt-8 pt-4 border-t border-indigo-50 flex gap-3"
                  >
                    <Button onClick={() => onGoalChange(goal)} className="bg-indigo-600 hover:bg-indigo-700">
                      方向合适，开始学习
                    </Button>
                    <Button variant="outline" onClick={handleAnalyzeGoal}>
                      重新调整
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Scroll anchor */}
            <div ref={bottomRef} className="h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
