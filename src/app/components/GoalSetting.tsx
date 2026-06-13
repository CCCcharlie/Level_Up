import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Target, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import useGameStore from '../../store/useGameStore';
import { buildOnboardingPrompt, requestAI } from '../../lib/aiService';
import type { OnboardingChecklistResponse } from '../../lib/aiService';
import { AIFollowUpBlock } from './AIFollowUpBlock';
import { toast } from 'sonner';

interface GoalSettingProps {
  onGoalChange: (goal: string) => void;
}

export function GoalSetting({ onGoalChange }: GoalSettingProps) {
  const [goal, setGoal] = useState('');
  const { 
    aiInteractionState, 
    setAiInteractionState, 
    unconfirmedChecklist, 
    setUnconfirmedChecklist 
  } = useGameStore();

  const handleAnalyzeGoal = async () => {
    if (!goal.trim()) {
      toast.error('请输入您的学习目标');
      return;
    }
    setAiInteractionState('ANALYZING');
    try {
      const prompt = buildOnboardingPrompt(goal, 'General', 'Beginner');
      const response = await requestAI(prompt.systemPrompt, prompt.userPrompt) as OnboardingChecklistResponse;
      setUnconfirmedChecklist(response);
      setAiInteractionState('AWAITING_CONFIRMATION');
    } catch (error) {
      console.error(error);
      toast.error('AI 分析失败，请重试');
      setAiInteractionState('IDLE');
    }
  };

  const handleConfirm = (isBeginner: boolean) => {
    if (!unconfirmedChecklist) return;
    
    // 如果不是初学者，可以在这里触发更高难度的生成。
    // 按需求，确认后提交到主 Store。
    setAiInteractionState('CONFIRMED');
    onGoalChange(goal);
    toast.success('学习路径已生成并确认！');
  };

  const handleReject = () => {
    setAiInteractionState('IDLE');
    setUnconfirmedChecklist(null);
  };

  return (
    <div className="space-y-6 min-h-screen h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
                disabled={aiInteractionState === 'ANALYZING' || aiInteractionState === 'AWAITING_CONFIRMATION'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyzeGoal();
                }}
              />
              <Button
                onClick={handleAnalyzeGoal}
                disabled={!goal.trim() || aiInteractionState === 'ANALYZING' || aiInteractionState === 'AWAITING_CONFIRMATION'}
                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-md font-medium"
              >
                {aiInteractionState === 'ANALYZING' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    生成学习路径
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {aiInteractionState === 'AWAITING_CONFIRMATION' && unconfirmedChecklist && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <AIFollowUpBlock 
            checklist={unconfirmedChecklist} 
            onConfirm={handleConfirm} 
            onReject={handleReject} 
          />
        </motion.div>
      )}
    </div>
  );
}
