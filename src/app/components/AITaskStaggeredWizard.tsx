import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import {
  buildOnboardingPrompt,
  requestAI,
  type OnboardingChecklistQuickReply,
  type OnboardingChecklistResponse,
  type OnboardingChecklistStep,
} from '../../lib/aiService';

export type QuickReply = {
  id: string;
  label: string;
  value: string;
  intent?: string;
};

export interface StaggeredTask {
  id: string;
  title: string;
  description: string;
  type: OnboardingChecklistStep['type'];
  estimatedXP?: number;
}

export interface AITaskStaggeredResult {
  userGoal: string;
  tasks: StaggeredTask[];
  followUpQuestion: string;
  quickReplies: QuickReply[];
  rawResponse: OnboardingChecklistResponse;
}

interface AITaskStaggeredWizardProps {
  initialGoal?: string;
  useMock?: boolean;
  onCommit?: (data: AITaskStaggeredResult) => void;
  onQuickReply?: (reply: QuickReply, data: AITaskStaggeredResult) => void;
}

const MOCK_RESPONSE: OnboardingChecklistResponse = {
  detectedDirection: 'Frontend Engineering',
  inferredLevel: 'Beginner',
  headline: 'React interview sprint',
  tasks: [
    {
      id: 'react-state-map',
      title: 'Map React state boundaries',
      description: 'List the local, shared, and server state in one existing screen, then mark the owner for each state value.',
      summary: 'Build a concrete state ownership map before writing code.',
      type: 'concept',
      estimatedXP: 60,
    },
    {
      id: 'counter-refactor',
      title: 'Refactor a counter into reusable hooks',
      description: 'Create a small counter feature, extract the state transition rules into a hook, and document the public API.',
      summary: 'Turn a simple widget into a reusable React pattern.',
      type: 'project',
      estimatedXP: 90,
    },
    {
      id: 'effect-debugging',
      title: 'Debug one useEffect loop',
      description: 'Reproduce an infinite effect loop, identify the unstable dependency, and fix it with the smallest code change.',
      summary: 'Practice the most common useEffect interview trap.',
      type: 'feynman',
      estimatedXP: 75,
    },
  ],
  followUpQuestion: 'Do you want this plan to stay interview-focused, or should the next pass bias toward portfolio projects?',
  quickReplies: [
    { label: 'Stay interview-focused', value: 'Keep the roadmap optimized for interviews.', intent: 'confirm' },
    { label: 'More portfolio projects', value: 'Bias the next version toward portfolio-ready projects.', intent: 'adjust_level' },
    { label: 'Add TypeScript depth', value: 'Add more TypeScript and architecture depth.', intent: 'add_context' },
  ],
};

const taskContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
};

const taskTypeLabel: Record<OnboardingChecklistStep['type'], string> = {
  concept: 'Concept',
  project: 'Project',
  leetcode: 'LeetCode',
  feynman: 'Feynman',
};

const isQuickReplyObject = (value: string | OnboardingChecklistQuickReply): value is OnboardingChecklistQuickReply =>
  typeof value === 'object' && value !== null && typeof value.label === 'string';

const normalizeQuickReplies = (quickReplies: OnboardingChecklistResponse['quickReplies']): QuickReply[] => {
  if (!Array.isArray(quickReplies)) {
    return [];
  }

  return quickReplies
    .map((reply, index): QuickReply | null => {
      if (typeof reply === 'string') {
        const trimmed = reply.trim();
        return trimmed ? { id: `quick-reply-${index + 1}`, label: trimmed, value: trimmed } : null;
      }

      if (!isQuickReplyObject(reply) || !reply.label.trim()) {
        return null;
      }

      return {
        id: reply.id || `quick-reply-${index + 1}`,
        label: reply.label,
        value: reply.value || reply.label,
        intent: reply.intent,
      };
    })
    .filter((reply): reply is QuickReply => Boolean(reply))
    .slice(0, 4);
};

const normalizeTasks = (response: OnboardingChecklistResponse): StaggeredTask[] => {
  const rawTasks = Array.isArray(response.tasks) && response.tasks.length > 0 ? response.tasks : response.steps ?? [];

  return rawTasks
    .map((task, index): StaggeredTask | null => {
      if (!task.title?.trim()) {
        return null;
      }

      return {
        id: task.id || `ai-task-${index + 1}`,
        title: task.title,
        description: task.description || task.summary || 'Complete this focused task and record the result.',
        type: task.type,
        estimatedXP: task.estimatedXP,
      };
    })
    .filter((task): task is StaggeredTask => Boolean(task));
};

const buildResult = (userGoal: string, response: OnboardingChecklistResponse): AITaskStaggeredResult => ({
  userGoal,
  tasks: normalizeTasks(response),
  followUpQuestion: response.followUpQuestion || response.followUp || 'What should the AI optimize in the next pass?',
  quickReplies: normalizeQuickReplies(response.quickReplies),
  rawResponse: response,
});

export function AITaskStaggeredWizard({
  initialGoal = '',
  useMock = false,
  onCommit,
  onQuickReply,
}: AITaskStaggeredWizardProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AITaskStaggeredResult | null>(null);
  const [followUpVisible, setFollowUpVisible] = useState(false);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const userScrollLockUntilRef = useRef(0);

  const canGenerate = goal.trim().length > 0 && !isGenerating;
  const headline = result?.rawResponse.headline || 'AI task breakdown';

  const commitDisabled = useMemo(() => !result || result.tasks.length === 0, [result]);

  useEffect(() => {
    const lockManualScroll = () => {
      userScrollLockUntilRef.current = Date.now() + 1400;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) {
        lockManualScroll();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', lockManualScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', lockManualScroll);
    };
  }, []);

  useEffect(() => {
    if (!followUpVisible || !scrollAnchorRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (Date.now() < userScrollLockUntilRef.current) {
        return;
      }

      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [followUpVisible]);

  const loadResponse = async (nextGoal: string, shouldUseMock: boolean) => {
    setError(null);
    setResult(null);
    setFollowUpVisible(false);
    setIsGenerating(true);

    try {
      const prompt = buildOnboardingPrompt(nextGoal, 'General', 'Beginner');
      const response = shouldUseMock
        ? await new Promise<OnboardingChecklistResponse>((resolve) => {
            window.setTimeout(() => resolve(MOCK_RESPONSE), 650);
          })
        : ((await requestAI(prompt.systemPrompt, prompt.userPrompt)) as OnboardingChecklistResponse);

      const nextResult = buildResult(nextGoal, response);

      if (nextResult.tasks.length === 0) {
        throw new Error('AI response did not include any renderable tasks.');
      }

      setResult(nextResult);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'AI task generation failed.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal) {
      return;
    }

    void loadResponse(trimmedGoal, useMock);
  };

  const handleLoadMock = () => {
    const mockGoal = goal.trim() || 'Prepare for a React frontend interview';
    setGoal(mockGoal);
    void loadResponse(mockGoal, true);
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (!result) {
      return;
    }

    setGoal(reply.value);
    onQuickReply?.(reply, result);
  };

  return (
    <section className="dark w-full bg-gray-950 px-4 py-6 text-gray-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-4 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">Level_Up V4.0</p>
              <h2 className="mt-1 text-lg font-semibold text-white">AI staggered task reveal</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-300">
              <WandSparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleGenerate();
                }
              }}
              disabled={isGenerating}
              placeholder="Describe your goal, for example: master React interview fundamentals"
              className="min-h-11 flex-1 rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Generate
            </button>
            <button
              type="button"
              onClick={handleLoadMock}
              disabled={isGenerating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-700 bg-gray-900 px-4 text-sm font-semibold text-gray-200 transition hover:border-blue-500 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Mock
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        {result && (
          <motion.ul
            key={`${result.userGoal}-${result.tasks.length}`}
            variants={taskContainerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            <motion.li variants={itemVariants} className="list-none">
              <div className="rounded-lg border border-gray-700 bg-gray-900/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-300">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Generated from</p>
                    <h3 className="mt-1 text-base font-semibold text-white">{headline}</h3>
                    <p className="mt-1 text-sm text-gray-400">{result.userGoal}</p>
                  </div>
                </div>
              </div>
            </motion.li>

            {result.tasks.map((task, index) => (
              <motion.li
                key={task.id}
                variants={itemVariants}
                className="group list-none rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg shadow-black/20 transition hover:border-blue-500/60 hover:bg-gray-800/90"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs font-mono text-gray-400">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300">
                        {taskTypeLabel[task.type]}
                      </span>
                      {typeof task.estimatedXP === 'number' && (
                        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                          +{task.estimatedXP} XP
                        </span>
                      )}
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-white">{task.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-gray-400">{task.description}</p>
                  </div>
                </div>
              </motion.li>
            ))}

            <motion.li variants={itemVariants} onAnimationComplete={() => setFollowUpVisible(true)} className="list-none">
              <motion.div className="rounded-lg border border-blue-500/40 bg-blue-950/30 p-4 shadow-[0_0_30px_rgba(37,99,235,0.18)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-400/40 bg-blue-400/10 text-blue-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">AI follow-up</p>
                    <p className="mt-2 text-sm leading-6 text-blue-100">{result.followUpQuestion}</p>

                    {result.quickReplies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.quickReplies.map((reply) => (
                          <button
                            key={reply.id}
                            type="button"
                            onClick={() => handleQuickReply(reply)}
                            className="rounded-md border border-blue-500/40 bg-gray-900/70 px-3 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-300 hover:bg-blue-500/20"
                          >
                            {reply.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex justify-end border-t border-blue-500/20 pt-4">
                      <button
                        type="button"
                        disabled={commitDisabled}
                        onClick={() => result && onCommit?.(result)}
                        className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Generate Tasks
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div ref={scrollAnchorRef} className="h-1 w-full" />
              </motion.div>
            </motion.li>
          </motion.ul>
        )}
      </div>
    </section>
  );
}

export function AITaskStaggeredWizardDemo() {
  const [committed, setCommitted] = useState<AITaskStaggeredResult | null>(null);

  return (
    <div className="min-h-screen bg-gray-950">
      <AITaskStaggeredWizard useMock onCommit={setCommitted} />
      {committed && (
        <div className="mx-auto max-w-3xl px-4 pb-8 text-sm text-gray-400 sm:px-6">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <span className="font-semibold text-cyan-300">{committed.tasks.length}</span> tasks ready for store commit.
          </div>
        </div>
      )}
    </div>
  );
}

export default AITaskStaggeredWizard;
