const EDGE_FUNCTION_URL = (import.meta.env.VITE_AI_EDGE_FUNCTION_URL as string | undefined) ?? '';
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? '';
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-2.0-flash';
const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? '';
const OPENAI_MODEL = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o-mini';

const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY as string | undefined) ?? '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';



export const BREAKDOWN_PROMPT = [
  '你是一个学习路径重构引擎。',
  '你的任务是把一个学习任务拆解成 3 个可以在咖啡时间完成的原子化子任务。',
  '每个子任务必须足够具体、可执行、低认知负担，避免笼统表达。',
  '子任务类型只能是 concept、project、leetcode 之一。',
  '只允许输出严格 JSON，不要输出 Markdown、解释、前后缀文本。',
  'JSON 结构必须为：{"subTasks":[{"title":"string","type":"concept|project|leetcode","estimatedXP":number}]}.',
].join('\n');

export const REINFORCE_PROMPT = [
  '你是一名严格的面试官与知识追问教练。',
  '你的任务是围绕当前学习节点生成 3 个递进式追问任务。',
  '每个追问必须针对可能存在的薄弱点，逐步提高理解深度，并带有针对性弱点打击。',
  '子任务类型必须统一为 reinforcement。',
  '只允许输出严格 JSON，不要输出 Markdown、解释、前后缀文本。',
  'JSON 结构必须为：{"subTasks":[{"title":"string","type":"reinforcement","estimatedXP":number}]}.',
].join('\n');

export const ROADMAP_PROMPT = [
  '你是一个职业成长路线图设计引擎。',
  '你的任务是基于用户职业方向和目标等级，输出 3-4 个阶段节点。',
  '每个节点必须包含：title、focus、requiredXP、tasks。',
  '每个节点 tasks 必须恰好 3 个，且任务类型应混合使用 concept、project、leetcode、feynman。',
  '节点顺序必须体现渐进难度，首个节点默认 current，其余默认 locked。',
  '只允许输出严格 JSON，不要输出 Markdown、解释、前后缀文本。',
  'JSON 结构必须为：{"nodes":[{"title":"string","focus":"string","requiredXP":number,"tasks":[{"title":"string","type":"concept|project|leetcode|feynman","estimatedXP":number}]}]}.',
].join('\n');

type PromptMode = 'breakdown' | 'reinforce' | 'roadmap';
type TargetLevel = 'Junior' | 'Mid' | 'Senior';

export interface RoadmapContext {
  mode: PromptMode;
  targetLevel?: TargetLevel;
  careerDirection?: string;
  nodeTitle?: string;
  nodeFocus?: string;
  taskTitle?: string;
  historyTasks?: Array<{ title: string; type: string }>;
}

const BASE_JSON_CONTRACT = [
  '严格输出 JSON 对象，不要 Markdown、不要解释、不要多余字段。',
  '任务 type 仅允许：concept、project、leetcode、feynman、reinforcement。',
  '标题必须可执行且简洁，estimatedXP 为正整数。',
].join('\n');

export const generateNodePrompt = (context: RoadmapContext) => {
  if (context.mode === 'breakdown') {
    return {
      systemPrompt: [
        BREAKDOWN_PROMPT,
        BASE_JSON_CONTRACT,
        '你是“任务碎化专家”。每个子任务必须在咖啡时间内可完成（约 15-30 分钟）。',
      ].join('\n'),
      userPrompt: [
        '请将原任务拆成 3 个微任务。',
        `当前节点标题：${context.nodeTitle ?? '未提供'}`,
        `当前节点 focus：${context.nodeFocus ?? '未提供'}`,
        `待拆解任务标题：${context.taskTitle ?? '未提供'}`,
        '输出 JSON：{"subTasks":[{"title":"string","type":"concept|project|leetcode","estimatedXP":number}]}',
      ].join('\n'),
    };
  }

  if (context.mode === 'reinforce') {
    return {
      systemPrompt: [
        REINFORCE_PROMPT,
        BASE_JSON_CONTRACT,
        '你是“技术面试官”。必须按三段递进生成 3 个任务：概念抽查 -> 边界 Case -> 代码纠错。',
      ].join('\n'),
      userPrompt: [
        '请围绕节点生成强化追问。',
        `节点标题：${context.nodeTitle ?? '未提供'}`,
        `节点 focus：${context.nodeFocus ?? '未提供'}`,
        `历史任务：${JSON.stringify(context.historyTasks ?? [], null, 2)}`,
        '输出 JSON：{"subTasks":[{"title":"string","type":"reinforcement","estimatedXP":number}]}',
      ].join('\n'),
    };
  }

  const seniorRule = context.targetLevel === 'Senior'
    ? '若目标等级为 Senior，至少一个节点的任务中必须包含 feynman 类型任务。'
    : '按常规任务生成规则输出。';

  return {
    systemPrompt: [
      ROADMAP_PROMPT,
      BASE_JSON_CONTRACT,
      '你是“动态学习路线架构师”。需要保证节点和任务都可直接执行。',
      seniorRule,
    ].join('\n'),
    userPrompt: [
      '请生成完整学习路线图。',
      `职业方向：${context.careerDirection ?? '未提供'}`,
      `目标等级：${context.targetLevel ?? '未提供'}`,
      '要求：输出 3-4 个节点，每个节点 3 个任务，难度逐步提升。',
      '输出 JSON：{"nodes":[{"title":"string","focus":"string","requiredXP":number,"tasks":[{"title":"string","type":"concept|project|leetcode|feynman","estimatedXP":number}]}]}',
    ].join('\n'),
  };
};

interface AIJsonResponse {
  subTasks?: unknown;
  tasks?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const stripCodeFences = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

const parseJson = (value: string): unknown => JSON.parse(stripCodeFences(value));

interface ProviderError extends Error {
  status?: number;
  provider?: string;
}

const createProviderError = (provider: string, status: number, details: string): ProviderError => {
  const error = new Error(`${provider} request failed with status ${status}${details ? `: ${details}` : ''}`) as ProviderError;
  error.status = status;
  error.provider = provider;
  return error;
};

const getErrorStatus = (error: unknown): number | null => {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  if ('status' in error && typeof error.status === 'number') {
    return error.status;
  }

  if ('message' in error && typeof error.message === 'string') {
    const statusMatch = error.message.match(/status\s+(\d{3})/i);
    if (statusMatch) {
      return Number(statusMatch[1]);
    }
  }

  return null;
};

const isRateLimitError = (error: unknown): boolean => getErrorStatus(error) === 429;

const RATE_LIMIT_MAX_RETRIES = 3;
const FALLBACK_BACKOFF_MS = [2000, 4000, 8000] as const;
const JITTER_RATIO = 0.2;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const applyJitter = (baseDelayMs: number): number => {
  const boundedBase = Math.max(250, Math.round(baseDelayMs));
  const jitterSpan = Math.round(boundedBase * JITTER_RATIO);
  const jitterOffset = Math.floor(Math.random() * (jitterSpan * 2 + 1)) - jitterSpan;

  return Math.max(250, boundedBase + jitterOffset);
};

const parseRetryDelayToMs = (error: unknown): number | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message;

  // Gemini quota errors often contain retryDelay fields like "retryDelay":"36s".
  const retryDelayMatch = message.match(/retryDelay\s*"?\s*:\s*"?(\d+(?:\.\d+)?)\s*(ms|s)?"?/i);
  if (!retryDelayMatch) {
    return null;
  }

  const numericValue = Number(retryDelayMatch[1]);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  const unit = (retryDelayMatch[2] ?? 's').toLowerCase();
  const delayMs = unit === 'ms' ? numericValue : numericValue * 1000;

  return Math.round(delayMs);
};

const getRateLimitDelayMs = (error: unknown, retryIndex: number): number => {
  const parsedRetryDelay = parseRetryDelayToMs(error);
  const baseDelayMs =
    parsedRetryDelay && parsedRetryDelay > 0
      ? parsedRetryDelay
      : FALLBACK_BACKOFF_MS[Math.min(retryIndex, FALLBACK_BACKOFF_MS.length - 1)];

  return applyJitter(baseDelayMs);
};

const extractJsonPayload = (value: unknown): AIJsonResponse => {
  if (typeof value === 'string') {
    const parsed = parseJson(value);
    if (isRecord(parsed)) {
      return parsed as AIJsonResponse;
    }

    throw new Error('AI response is not a JSON object.');
  }

  if (isRecord(value)) {
    if (typeof value.output_text === 'string') {
      return extractJsonPayload(value.output_text);
    }

    if (typeof value.content === 'string') {
      return extractJsonPayload(value.content);
    }

    if (isRecord(value.data)) {
      return extractJsonPayload(value.data);
    }

    return value as AIJsonResponse;
  }

  throw new Error('AI response is empty or invalid.');
};

const requestViaEdgeFunction = async (systemPrompt: string, userPrompt: string): Promise<unknown> => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createProviderError('Edge function', response.status, errorText);
  }

  const responseText = await response.text();
  if (!responseText.trim()) {
    throw new Error('Edge function returned an empty response.');
  }

  try {
    return extractJsonPayload(responseText);
  } catch {
    const json = JSON.parse(responseText) as unknown;
    return extractJsonPayload(json);
  }
};

const requestViaOpenAI = async (systemPrompt: string, userPrompt: string): Promise<unknown> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createProviderError('OpenAI', response.status, errorText);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not contain JSON content.');
  }

  return extractJsonPayload(content);
};

const requestViaGemini = async (systemPrompt: string, userPrompt: string): Promise<unknown> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: { text: systemPrompt },
        },
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw createProviderError('Gemini', response.status, errorText);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('Gemini response did not contain text content.');
  }

  return extractJsonPayload(content);
};


const requestViaGroq = async (systemPrompt: string, userPrompt: string): Promise<unknown> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createProviderError('Groq', response.status, errorText);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Groq response did not contain JSON content.');
  }

  return extractJsonPayload(content);
};
//

export const buildBreakdownPrompt = (taskTitle: string, nodeFocus: string, nodeTitle?: string) => ({
  ...generateNodePrompt({
    mode: 'breakdown',
    nodeTitle,
    nodeFocus,
    taskTitle,
  }),
});

export const buildReinforcePrompt = (
  nodeTitle: string,
  nodeFocus: string,
  historyTasks: Array<{ title: string; type: string }>
) => ({
  ...generateNodePrompt({
    mode: 'reinforce',
    nodeTitle,
    nodeFocus,
    historyTasks,
  }),
});

export interface ExtensionHistoryTask {
  title: string;
  type: string;
  currentXp?: number;
  lastActive?: string | null;
}

export const buildExtensionPrompt = (
  historyTasks: ExtensionHistoryTask[],
  weakPoints: string[]
) => ({
  systemPrompt: [
    ROADMAP_PROMPT,
    BASE_JSON_CONTRACT,
    '你是“JIT 进阶路线生成器”。用户已完成基础节点，需要你生成个性化进阶挑战。',
    '必须输出 2 个 RoadmapNode，每个节点 3 个任务，任务类型应覆盖 concept/project/leetcode 并可加入 feynman。',
    '必须围绕用户薄弱点补强，同时保持挑战性和可执行性。',
    '节点状态统一设为 locked。',
  ].join('\n'),
  userPrompt: [
    '用户已完成基础节点，请根据其耗时和弱点，生成 2 个定制化的进阶 RoadmapNode。',
    `已完成任务样本（含进度信息）：${JSON.stringify(historyTasks, null, 2)}`,
    `薄弱点：${JSON.stringify(weakPoints, null, 2)}`,
    '输出 JSON：{"nodes":[{"title":"string","focus":"string","requiredXP":number,"tasks":[{"title":"string","type":"concept|project|leetcode|feynman","estimatedXP":number}]}]}',
  ].join('\n'),
});

const isBranchType = (value: unknown): value is 'deep_dive' | 'side_quest' | 'speed_run' =>
  value === 'deep_dive' || value === 'side_quest' || value === 'speed_run';

const normalizeBranchPayload = (payload: unknown) => {
  const rawNodes = (() => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (isRecord(payload) && Array.isArray(payload.nodes)) {
      return payload.nodes;
    }

    return [];
  })();

  const fallbackBranchTypes: Array<'deep_dive' | 'side_quest' | 'speed_run'> = ['deep_dive', 'side_quest', 'speed_run'];

  return rawNodes
    .map((node, index) => {
      if (!isRecord(node)) {
        return null;
      }

      const tasks = Array.isArray(node.tasks)
        ? node.tasks.filter(
            (task): task is { title: string; type: string; estimatedXP?: number } =>
              isRecord(task) && typeof task.title === 'string' && typeof task.type === 'string'
          )
        : [];

      if (
        typeof node.id !== 'string' ||
        typeof node.title !== 'string' ||
        typeof node.focus !== 'string' ||
        tasks.length < 2
      ) {
        return null;
      }

      return {
        id: node.id,
        title: node.title,
        focus: node.focus,
        requiredXP: typeof node.requiredXP === 'number' && Number.isFinite(node.requiredXP) ? Math.round(node.requiredXP) : 1500,
        status: node.status === 'current' || node.status === 'completed' ? node.status : 'locked',
        reinforcementLevel: typeof node.reinforcementLevel === 'number' ? node.reinforcementLevel : 0,
        isReinforcing: typeof node.isReinforcing === 'boolean' ? node.isReinforcing : false,
        branchType: isBranchType(node.branchType) ? node.branchType : fallbackBranchTypes[index % fallbackBranchTypes.length],
        tasks,
      };
    })
    .filter((node): node is {
      id: string;
      title: string;
      focus: string;
      requiredXP: number;
      status: 'locked' | 'current' | 'completed';
      reinforcementLevel: number;
      isReinforcing: boolean;
      branchType: 'deep_dive' | 'side_quest' | 'speed_run';
      tasks: Array<{ title: string; type: string; estimatedXP?: number }>;
    } => Boolean(node));
};

export const requestBranchSuggestions = async (
  nodeTitle: string,
  nodeFocus: string,
  userLevel: string
): Promise<unknown> => {
  const systemPrompt = [
    '你是一个严谨的技术导师与学习路径架构师。',
    BASE_JSON_CONTRACT,
    '你必须严格返回 JSON 数组，数组长度必须为 3，且每一项都是完整的 RoadmapNode 对象。',
    '每个节点必须包含 id、title、focus、requiredXP、branchType、tasks 字段。',
    '每个节点 tasks 至少 2 个，推荐 2-3 个，任务类型可在 concept/project/leetcode/feynman 中组合。',
    '节点 1 必须是 deep_dive：聚焦底层原理进阶。',
    '节点 2 必须是 side_quest：聚焦相关生态或工具扩展。',
    '节点 3 必须是 speed_run：聚焦高难度综合实战或面试挑战。',
    '三个分支都必须收束回用户最终目标，避免知识迷失。',
  ].join('\n');

  const userPrompt = [
    `用户刚刚完成了节点【${nodeTitle}】，其核心是【${nodeFocus}】。`,
    `请基于此生成 3 个后续的单节点路线，并收束回用户的 ${userLevel} 最终目标。`,
    '输出必须是 JSON 数组，不要对象包裹，不要 Markdown。',
    '输出示例：[{"id":"string","title":"string","focus":"string","requiredXP":number,"branchType":"deep_dive|side_quest|speed_run","tasks":[{"title":"string","type":"concept|project|leetcode|feynman","estimatedXP":number}]}]',
  ].join('\n');

  const response = await requestAI(systemPrompt, userPrompt);
  const normalized = normalizeBranchPayload(response);

  if (normalized.length !== 3) {
    throw new Error('Branch suggestion response is invalid. Expected exactly 3 roadmap nodes.');
  }

  return normalized;
};

export async function requestAI(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const providers: Array<{
    name: string;
    isConfigured: boolean;
    request: (systemPrompt: string, userPrompt: string) => Promise<unknown>;
  }> = [
    {
      name: 'Groq',
      isConfigured: Boolean(GROQ_API_KEY),
      request: requestViaGroq,
    },
    {
      name: 'Edge function',
      isConfigured: Boolean(EDGE_FUNCTION_URL),
      request: requestViaEdgeFunction,
    },
    {
      name: 'Gemini',
      isConfigured: Boolean(GEMINI_API_KEY),
      request: requestViaGemini,
    },
    {
      name: 'OpenAI',
      isConfigured: Boolean(OPENAI_API_KEY),
      request: requestViaOpenAI,
    },
  ].filter((provider) => provider.isConfigured);

  if (providers.length === 0) {
    throw new Error('AI provider is not configured. Set VITE_AI_EDGE_FUNCTION_URL, VITE_GEMINI_API_KEY, or VITE_OPENAI_API_KEY.');
  }

  const errors: string[] = [];

  for (const provider of providers) {
    let retryCount = 0;

    // Retry only when provider is rate-limited; otherwise fail over immediately.
    while (true) {
      try {
        return await provider.request(systemPrompt, userPrompt);
      } catch (error) {
        if (isRateLimitError(error) && retryCount < RATE_LIMIT_MAX_RETRIES) {
          const delayMs = getRateLimitDelayMs(error, retryCount);
          retryCount += 1;
          console.warn(
            `[requestAI] ${provider.name} rate-limited (429). Retry ${retryCount}/${RATE_LIMIT_MAX_RETRIES} in ${Math.ceil(delayMs / 1000)}s...`
          );
          await sleep(delayMs);
          continue;
        }

        const status = getErrorStatus(error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${provider.name}${status ? ` (${status})` : ''}: ${errorMessage}`);

        if (isRateLimitError(error)) {
          console.warn(`[requestAI] ${provider.name} exceeded retry limit, trying next provider...`);
        } else {
          console.warn(`[requestAI] ${provider.name} failed, trying next provider...`, error);
        }

        break;
      }
    }
  }

  throw new Error(`All configured AI providers failed. ${errors.join(' | ')}`);
}

export const normalizeTaskType = <T extends string>(value: unknown, allowedTypes: readonly T[], fallback: T): T =>
  typeof value === 'string' && allowedTypes.includes(value as T) ? (value as T) : fallback;
