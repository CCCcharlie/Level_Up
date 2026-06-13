import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Target, Sparkles, BrainCircuit } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import type { OnboardingChecklistResponse } from '../../lib/aiService';

interface AIFollowUpBlockProps {
  checklist: OnboardingChecklistResponse;
  onConfirm: (isBeginner: boolean) => void;
  onReject: () => void;
}

export function AIFollowUpBlock({ checklist, onConfirm, onReject }: AIFollowUpBlockProps) {
  return (
    <div className="sticky top-4 z-10">
      <Card className="border-indigo-200 shadow-lg">
        <CardHeader className="bg-indigo-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI 分析结果
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              为您量身定制的行动计划
            </h4>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3 mt-2">
                {checklist.steps.map((step, index) => (
                  <div key={index} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-800">{index + 1}. {step.title}</span>
                      <Badge variant="outline" className="text-xs">{step.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{step.summary}</p>
                    {step.estimatedXP && <span className="text-xs text-indigo-500">+{step.estimatedXP} XP</span>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {checklist.followUpQuestion && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-600" />
                AI 的追问
              </h4>
              <p className="text-sm text-amber-800 mb-4">{checklist.followUpQuestion}</p>
              <div className="flex gap-2">
                <Button onClick={() => onConfirm(true)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                  是的，我是初学者
                </Button>
                <Button onClick={() => onConfirm(false)} variant="outline" className="flex-1 border-amber-500 text-amber-700 hover:bg-amber-50">
                  不，请调整为高级
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
