const EDGE_FUNCTION_URL = (import.meta.env.VITE_AI_EDGE_FUNCTION_URL as string | undefined) ?? '';
const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? '';
const OPENAI_MODEL = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o-mini';

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
    throw new Error(errorText || `Edge function request failed with status ${response.status}`);
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
    throw new Error(errorText || `OpenAI request failed with status ${response.status}`);
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

export const buildBreakdownPrompt = (taskTitle: string, nodeFocus: string, nodeTitle?: string) => ({
  systemPrompt: BREAKDOWN_PROMPT,
  userPrompt: [
    '请基于以下上下文生成 3 个原子化子任务。',
    `当前节点标题：${nodeTitle ?? '未提供'}`,
    `当前节点 focus：${nodeFocus}`,
    `待拆解任务标题：${taskTitle}`,
    '请输出符合约束的 JSON。',
  ].join('\n'),
});

export const buildReinforcePrompt = (
  nodeTitle: string,
  nodeFocus: string,
  historyTasks: Array<{ title: string; type: string }>
) => ({
  systemPrompt: REINFORCE_PROMPT,
  userPrompt: [
    '请基于以下节点历史生成 3 个递进式追问任务。',
    `节点标题：${nodeTitle}`,
    `节点 focus：${nodeFocus}`,
    `历史任务：${JSON.stringify(historyTasks, null, 2)}`,
    '请输出符合约束的 JSON。',
  ].join('\n'),
});

export async function requestAI(systemPrompt: string, userPrompt: string): Promise<unknown> {
  if (EDGE_FUNCTION_URL) {
    return requestViaEdgeFunction(systemPrompt, userPrompt);
  }

  if (OPENAI_API_KEY) {
    return requestViaOpenAI(systemPrompt, userPrompt);
  }

  throw new Error('AI provider is not configured. Set VITE_AI_EDGE_FUNCTION_URL or VITE_OPENAI_API_KEY.');
}

export const normalizeTaskType = <T extends string>(value: unknown, allowedTypes: readonly T[], fallback: T): T =>
  typeof value === 'string' && allowedTypes.includes(value as T) ? (value as T) : fallback;
