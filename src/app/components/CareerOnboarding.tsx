import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  Database,
  Layout,
  Loader2,
  Sparkles,
  Terminal,
  WandSparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import {
  buildOnboardingPrompt,
  requestAI,
  type OnboardingChecklistModule,
  type OnboardingChecklistResponse,
} from '../../lib/aiService';
import { signInWithGoogle } from '../../lib/supabase';
import useGameStore, { type RoadmapNode, type TargetLevel } from '../../store/useGameStore';
import { toast } from 'sonner';

const QUICK_STARTS = [
  { id: 'frontend', label: '前端', icon: <Layout className="h-4 w-4" />, intent: '成为初级前端工程师，聚焦大厂技术面试通关' },
  { id: 'backend', label: '后端', icon: <Database className="h-4 w-4" />, intent: '成为初级后端工程师，聚焦大厂技术面试通关' },
  { id: 'fullstack', label: '全栈', icon: <Terminal className="h-4 w-4" />, intent: '成为初级全栈工程师，聚焦大厂技术面试通关' },
] as const;

const TARGET_LEVEL_META: Record<TargetLevel, { label: string; accent: string }> = {
  Junior: { label: '初级', accent: 'from-sky-400 to-cyan-300' },
  Mid: { label: '中级', accent: 'from-violet-400 to-fuchsia-300' },
  Senior: { label: '高级', accent: 'from-amber-400 to-orange-300' },
};

const TASK_TYPES = ['concept', 'project', 'leetcode', 'feynman'] as const;
const DEFAULT_INTENT = '成为初级前端/移动开发工程师';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

const detectDirection = (intent: string) => {
  if (/(独立开发|独立创作|indie|solo|个人产品|自由开发)/i.test(intent)) {
    return '独立开发者';
  }

  if (/(移动|app|原生|android|ios|小程序)/i.test(intent)) {
    return '移动开发';
  }

  if (/(后端|服务端|server|backend|golang|java|node)/i.test(intent)) {
    return '后端开发';
  }

  if (/(全栈|full\s*stack|fullstack)/i.test(intent)) {
    return '全栈开发';
  }

  return '前端开发';
};

const detectLevel = (intent: string): TargetLevel => {
  if (/(高级|资深|senior|架构)/i.test(intent)) {
    return 'Senior';
  }

  if (/(中级|进阶|mid|成长)/i.test(intent)) {
    return 'Mid';
  }

  return 'Junior';
};

const normalizeOnboardingTaskType = (value: unknown): OnboardingChecklistModule['tasks'][number]['type'] =>
  typeof value === 'string' && TASK_TYPES.includes(value as (typeof TASK_TYPES)[number])
    ? (value as OnboardingChecklistModule['tasks'][number]['type'])
    : 'concept';

const buildFallbackChecklist = (direction: string, level: TargetLevel): OnboardingChecklistModule[] => {
  const levelBoost = level === 'Senior' ? 120 : level === 'Mid' ? 80 : 40;
  const directionHints: Record<string, string> = {
    前端开发: 'React 18、状态管理、性能优化与浏览器机制',
    后端开发: '接口设计、缓存、并发与数据一致性',
    全栈开发: '前后端协同、鉴权、部署链路与项目交付',
    移动开发: '跨端工程、性能、发布流程与端侧体验',
    独立开发者: '产品闭环、MVP 迭代、增长表达与交付节奏',
  };

  return [
    {
      title: '【LeetCode 精选】',
      focus: `${directionHints[direction] ?? directionHints.前端开发}中的高频算法面试题`,
      summary: '先把面试中最容易被追问的基础题型打穿，建立最短答题路径。',
      tasks: [
        { title: '整理 6 道高频题的题型模板与边界条件', type: 'leetcode', estimatedXP: levelBoost },
        { title: '复盘双指针、哈希表、滑动窗口的出题信号', type: 'concept', estimatedXP: levelBoost - 10 },
        { title: '把其中 2 道题录成 90 秒口述讲解', type: 'feynman', estimatedXP: levelBoost - 15 },
      ],
    },
    {
      title: '【字节常考点】',
      focus: `${directionHints[direction] ?? directionHints.前端开发}里的组件设计、性能与工程协作`,
      summary: '把高频追问收束成能直接开口表达的结构化答案。',
      tasks: [
        { title: '梳理一次组件/接口/状态流的设计答题框架', type: 'concept', estimatedXP: levelBoost + 10 },
        { title: '完成 1 个能体现协作能力的小功能复盘', type: 'project', estimatedXP: levelBoost + 20 },
        { title: '总结 3 个性能优化与排障案例', type: 'feynman', estimatedXP: levelBoost - 5 },
      ],
    },
    {
      title: '【项目面试通关】',
      focus: `${directionHints[direction] ?? directionHints.前端开发}下可展示的个人项目与表达材料`,
      summary: '把项目经历整理成可讲、可追问、可落地的主线。',
      tasks: [
        { title: '整理 1 个代表项目的技术选型与权衡', type: 'project', estimatedXP: levelBoost + 20 },
        { title: '输出 1 份项目面试答辩提纲', type: 'concept', estimatedXP: levelBoost },
        { title: '准备 1 套“为什么是你”式的自我陈述', type: 'feynman', estimatedXP: levelBoost - 10 },
      ],
    },
  ];
};

const normalizeChecklist = (
  response: OnboardingChecklistResponse,
  fallbackDirection: string,
  fallbackLevel: TargetLevel
): { direction: string; level: TargetLevel; headline: string; checklist: OnboardingChecklistModule[]; followUp: string } => {
  const fallbackChecklist = buildFallbackChecklist(fallbackDirection, fallbackLevel);
  const rawChecklist = Array.isArray(response.checklist) ? response.checklist : fallbackChecklist;

  const checklist = rawChecklist.slice(0, 3).map((module, index) => {
    const fallbackModule = fallbackChecklist[index] ?? fallbackChecklist[0];
    const tasks = Array.isArray(module.tasks) && module.tasks.length > 0 ? module.tasks : fallbackModule.tasks;

    return {
      title: typeof module.title === 'string' && module.title.trim() ? module.title : fallbackModule.title,
      focus: typeof module.focus === 'string' && module.focus.trim() ? module.focus : fallbackModule.focus,
      summary: typeof module.summary === 'string' && module.summary.trim() ? module.summary : fallbackModule.summary,
      tasks: tasks.map((task, taskIndex) => ({
        title:
          typeof task.title === 'string' && task.title.trim()
            ? task.title
            : fallbackModule.tasks[taskIndex % fallbackModule.tasks.length].title,
        type: normalizeOnboardingTaskType(task.type),
        estimatedXP:
          typeof task.estimatedXP === 'number' && Number.isFinite(task.estimatedXP)
            ? Math.max(5, Math.round(task.estimatedXP))
            : fallbackModule.tasks[taskIndex % fallbackModule.tasks.length].estimatedXP,
      })),
    };
  });

  return {
    direction:
      typeof response.detectedDirection === 'string' && response.detectedDirection.trim()
        ? response.detectedDirection
        : fallbackDirection,
    level: response.detectedLevel ?? fallbackLevel,
    headline: typeof response.headline === 'string' && response.headline.trim() ? response.headline : '大厂技术面试通关',
    checklist,
    followUp:
      typeof response.followUp === 'string' && response.followUp.trim()
        ? response.followUp
        : "是否需要切换到'独立开发者'或自定义其他方向？",
  };
};

const buildRoadmapFromChecklist = (modules: OnboardingChecklistModule[]): RoadmapNode[] =>
  modules.map((module, index) => {
    const nodeId = `tier-1-${index + 1}-${slugify(module.title) || 'node'}`;

    return {
      id: nodeId,
      parentId: index === 0 ? null : `tier-1-${index}-${slugify(modules[index - 1]?.title) || 'node'}`,
      title: module.title,
      focus: `${module.summary} ${module.focus}`.trim(),
      status: index === 0 ? 'current' : 'locked',
      requiredXP: 320 + index * 220,
      reinforcementLevel: 0,
      isReinforcing: false,
      tasks: module.tasks.map((task, taskIndex) => ({
        id: `${nodeId}-${taskIndex + 1}`,
        title: task.title,
        type: task.type,
        estimatedXP: task.estimatedXP,
        referenceId: nodeId,
      })),
    };
  });

export function CareerOnboarding() {
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [checklist, setChecklist] = useState<OnboardingChecklistModule[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [headline, setHeadline] = useState('大厂技术面试通关');
  const [followUp, setFollowUp] = useState("是否需要切换到'独立开发者'或自定义其他方向？");
  const [detectedDirection, setDetectedDirection] = useState('前端开发');
  const [selectedLevel, setSelectedLevel] = useState<TargetLevel>('Junior');
  const [customDirection, setCustomDirection] = useState('独立开发者');
  const [questionOpen, setQuestionOpen] = useState(false);

  const currentUser = useGameStore((state) => state.currentUser);
  const setTargetLevel = useGameStore((state) => state.setTargetLevel);

  const activeChecklist = useMemo(() => checklist.slice(0, revealedCount), [checklist, revealedCount]);
  const promptTone = TARGET_LEVEL_META[selectedLevel];
  const revealTimers = useRef<number[]>([]);

  useEffect(() => {
    revealTimers.current.forEach((timer) => window.clearTimeout(timer));
    revealTimers.current = [];

    if (isGenerating || checklist.length === 0) {
      setRevealedCount(0);
      return undefined;
    }

    setRevealedCount(0);
    checklist.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setRevealedCount((current) => Math.max(current, index + 1));
      }, 180 + index * 260);
      revealTimers.current.push(timer);
    });

    return () => {
      revealTimers.current.forEach((timer) => window.clearTimeout(timer));
      revealTimers.current = [];
    };
  }, [checklist, isGenerating]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      toast.error('Google 登录失败，请稍后重试。');
      setIsSigningIn(false);
    }
  };

  const handleGenerate = async (nextIntent: string) => {
    const trimmedIntent = nextIntent.trim();
    if (!trimmedIntent) {
      toast.error('请输入一个职业意图。');
      return;
    }

    setIntent(trimmedIntent);
    setIsGenerating(true);
    setQuestionOpen(false);
    setChecklist([]);
    setRevealedCount(0);

    const fallbackDirection = detectDirection(trimmedIntent);
    const fallbackLevel = detectLevel(trimmedIntent);
    setDetectedDirection(fallbackDirection);
    setSelectedLevel(fallbackLevel);
    setCustomDirection(fallbackDirection);

    try {
      const prompt = buildOnboardingPrompt(trimmedIntent, fallbackDirection, fallbackLevel);
      const response = (await requestAI(prompt.systemPrompt, prompt.userPrompt)) as OnboardingChecklistResponse;
      const normalized = normalizeChecklist(response, fallbackDirection, fallbackLevel);

      setHeadline(normalized.headline);
      setChecklist(normalized.checklist);
      setFollowUp(normalized.followUp);
      setDetectedDirection(normalized.direction);
      setSelectedLevel(normalized.level);
    } catch (error) {
      console.error('[CareerOnboarding] AI generation failed:', error);
      toast.warning('AI 生成暂不可用，已切换到本地兜底大盘。');

      const fallbackChecklist = buildFallbackChecklist(fallbackDirection, fallbackLevel);
      setHeadline('大厂技术面试通关');
      setChecklist(fallbackChecklist);
      setFollowUp("是否需要切换到'独立开发者'或自定义其他方向？");
      setDetectedDirection(fallbackDirection);
      setSelectedLevel(fallbackLevel);
      setCustomDirection(fallbackDirection);
    } finally {
      setIsGenerating(false);
      setQuestionOpen(true);
    }
  };

  const commitOnboarding = (direction: string, level: TargetLevel) => {
    const roadmap = buildRoadmapFromChecklist(checklist.length > 0 ? checklist : buildFallbackChecklist(direction, level));
    setQuestionOpen(false);
    setIsBooting(true);

    window.setTimeout(() => {
      setTargetLevel(direction, level, roadmap);
    }, 900);
  };

  const handleConfirmCurrent = () => commitOnboarding(detectedDirection, selectedLevel);
  const handleSwitchToIndie = () => commitOnboarding('独立开发者', selectedLevel);
  const handleCustomDirection = () => commitOnboarding(customDirection.trim() || detectedDirection, selectedLevel);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(56,189,248,0.24),transparent_36%),radial-gradient(circle_at_18%_82%,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(251,191,36,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:96px_96px]" />

      <div className="absolute right-4 top-4 z-20">
        {!currentUser ? (
          <Button
            variant="ghost"
            onClick={() => void handleGoogleSignIn()}
            disabled={isSigningIn}
            className="border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
            {isSigningIn ? '连接中' : 'Google 登录'}
          </Button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {!isBooting ? (
          <motion.div
            key="onboarding-shell"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-5xl"
          >
            <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-white/5 shadow-[0_0_60px_rgba(34,211,238,0.16)] backdrop-blur-xl"
              >
                <Sparkles className="h-8 w-8 text-cyan-300" />
              </motion.div>

              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
                意图驱动的大盘生成器
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                输入一句目标，系统会先抽取方向，再流式展开 Tier-1 Checklist，最后把它锚定成可进入主看板的星图。
              </p>
            </div>

            <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-slate-950/65 p-4 shadow-[0_40px_120px_rgba(2,6,23,0.6)] backdrop-blur-2xl md:p-6">
              <div className="rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.12),transparent_44%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-5 md:p-7">
                <div className="mb-6 text-center">
                  <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-200/70">CORE SYLLABUS</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">大厂技术面试通关</h2>
                  <p className="mt-2 text-sm text-slate-400">段落级聚合生成，避免逐字输出。</p>
                </div>

                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                      <Input
                        value={intent}
                        onChange={(event) => setIntent(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleGenerate(intent);
                          }
                        }}
                        placeholder="成为初级前端/移动开发工程师"
                        className="h-16 rounded-2xl border-white/10 bg-white/5 px-5 text-lg text-white placeholder:text-slate-500 focus-visible:ring-cyan-400/40"
                      />
                    </div>

                    <Button
                      size="lg"
                      onClick={() => void handleGenerate(intent)}
                      disabled={isGenerating}
                      className="h-16 rounded-2xl bg-white text-slate-950 hover:bg-cyan-200"
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      生成大盘
                    </Button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {QUICK_STARTS.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        onClick={() => {
                          setIntent(preset.intent);
                          void handleGenerate(preset.intent);
                        }}
                        disabled={isGenerating}
                        className="rounded-full border-white/10 bg-white/5 text-slate-100 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white"
                      >
                        {preset.icon}
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-cyan-300/10 bg-cyan-500/5 px-4 py-3 text-center text-xs text-cyan-100/80 md:text-sm">
                  默认核心考纲为“大厂技术面试通关”，生成后会自动追问是否切换到独立开发者或自定义方向。
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {activeChecklist.map((module, index) => (
                  <motion.div
                    key={`${module.title}-${index}`}
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                  >
                    <Card className="h-full border-white/10 bg-slate-950/80 text-white shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="text-base font-semibold">{module.title}</h3>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                            Tier {index + 1}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-slate-300">{module.summary}</p>
                        <p className="mt-3 text-xs leading-5 text-cyan-100/70">{module.focus}</p>
                        <div className="mt-4 space-y-2">
                          {module.tasks.map((task) => (
                            <div key={task.title} className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                              <span>{task.title}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {checklist.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <span className={`mr-3 inline-flex rounded-full bg-gradient-to-r ${promptTone.accent} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-950`}>
                    {TARGET_LEVEL_META[selectedLevel].label}
                  </span>
                  {headline}
                </div>
              ) : null}
            </div>

            <AnimatePresence>
              {isGenerating ? (
                <motion.div
                  key="generator-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-5 rounded-[30px] border border-white/10 bg-slate-950/80 px-8 py-10 text-center shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.55, 1, 0.55],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="relative"
                    >
                      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl" />
                      <WandSparkles className="relative z-10 h-14 w-14 text-cyan-300" />
                    </motion.div>
                    <p className="text-sm uppercase tracking-[0.45em] text-cyan-100/75">生成 Tier-1 Checklist</p>
                    <p className="max-w-xs text-sm leading-6 text-slate-400">AI 正在聚合模块、提炼常考点，并为下一步追问做准备。</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}

        {isBooting ? (
          <motion.div
            key="booting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.65, 1, 0.65],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl" />
                <Sparkles className="relative z-10 h-20 w-20 text-cyan-300" />
              </motion.div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.45em] text-cyan-100/70">锚定星图</p>
                <h3 className="text-2xl font-semibold text-white">正在把 checklist 映射为主看板节点</h3>
                <p className="text-sm text-slate-400">{followUp}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Dialog open={questionOpen && !isGenerating && !isBooting} onOpenChange={setQuestionOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-white shadow-[0_40px_120px_rgba(2,6,23,0.75)] sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{followUp}</DialogTitle>
            <DialogDescription className="text-slate-400">
              当前识别为 {detectedDirection} · {TARGET_LEVEL_META[selectedLevel].label}。你可以直接确认，或切换为独立开发者并自定义方向。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {(['Junior', 'Mid', 'Senior'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    selectedLevel === level
                      ? 'border-cyan-300/60 bg-cyan-400/10 text-white shadow-[0_0_30px_rgba(34,211,238,0.14)]'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.35em] text-slate-500">Target</div>
                  <div className="mt-1 text-sm font-medium">{TARGET_LEVEL_META[level].label}</div>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button onClick={handleConfirmCurrent} className="justify-center bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                确认当前方向
              </Button>
              <Button onClick={handleSwitchToIndie} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                切换到独立开发者
              </Button>
              <Button onClick={handleCustomDirection} variant="secondary" className="bg-white text-slate-950 hover:bg-slate-200">
                应用自定义方向
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">自定义方向</p>
              <Input
                value={customDirection}
                onChange={(event) => setCustomDirection(event.target.value)}
                placeholder="例如：独立开发者 / 移动开发 / AI 产品工程师"
                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400/40"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setQuestionOpen(false)} className="text-slate-300 hover:bg-white/5 hover:text-white">
              稍后再说
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CareerOnboarding;
