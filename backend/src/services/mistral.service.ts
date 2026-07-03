import { env } from '../config/env.js';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type MistralTurnResult = {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  mock: boolean;
};

export type MistralStreamDelta = {
  type: 'delta';
  content: string;
};

function buildMockAnswer(playerAction: string) {
  return [
    `Tu tentes : "${playerAction}".`,
    'Le maître du jeu applique le résultat du dé et fait progresser la scène sans modifier les PV de son côté.',
    '',
    'La pluie redouble sur les pavés. Une silhouette encapuchonnée réagit à ton action, et la tension monte autour de toi.',
    '',
    'Choix possibles :',
    '1. Continuer sur ta lancée malgré le danger.',
    '2. Observer les environs pour repérer une issue.',
    '3. Changer d’approche et tenter une action plus prudente.'
  ].join('\n');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractDeltaContent(data: unknown): string {
  if (!data || typeof data !== 'object') return '';

  const root = data as {
    choices?: Array<{
      delta?: { content?: string | Array<{ text?: string; content?: string }> };
      message?: { content?: string | Array<{ text?: string; content?: string }> };
    }>;
  };

  const content = root.choices?.[0]?.delta?.content ?? root.choices?.[0]?.message?.content;

  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((chunk) => chunk.text ?? chunk.content ?? '').join('');
  }

  return '';
}

export async function generateMistralTurn(messages: ChatMessage[], playerAction: string): Promise<MistralTurnResult> {
  if (!env.MISTRAL_API_KEY) {
    return {
      content: buildMockAnswer(playerAction),
      model: 'mock-mistral-dev',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      mock: true
    };
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.MISTRAL_MODEL,
      temperature: 0.7,
      max_tokens: 700,
      messages
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur Mistral ${response.status}: ${text}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    model?: string;
  };

  return {
    content: data.choices?.[0]?.message?.content ?? 'Le MJ reste silencieux. Aucune réponse générée.',
    model: data.model ?? env.MISTRAL_MODEL,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    totalTokens: data.usage?.total_tokens ?? 0,
    mock: false
  };
}

export async function* streamMistralTurn(
  messages: ChatMessage[],
  playerAction: string
): AsyncGenerator<MistralStreamDelta, MistralTurnResult, void> {
  if (!env.MISTRAL_API_KEY) {
    const content = buildMockAnswer(playerAction);
    const chunks = content.match(/.{1,28}(\s|$)/g) ?? [content];

    for (const chunk of chunks) {
      await sleep(35);
      yield { type: 'delta', content: chunk };
    }

    return {
      content,
      model: 'mock-mistral-dev',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      mock: true
    };
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.MISTRAL_MODEL,
      temperature: 0.7,
      max_tokens: 700,
      stream: true,
      messages
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur Mistral ${response.status}: ${text}`);
  }

  if (!response.body) {
    throw new Error('Flux Mistral indisponible.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let model = env.MISTRAL_MODEL;
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const data = JSON.parse(payload) as {
          model?: string;
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
          };
        };

        model = data.model ?? model;
        promptTokens = data.usage?.prompt_tokens ?? promptTokens;
        completionTokens = data.usage?.completion_tokens ?? completionTokens;
        totalTokens = data.usage?.total_tokens ?? totalTokens;

        const delta = extractDeltaContent(data);
        if (delta) {
          content += delta;
          yield { type: 'delta', content: delta };
        }
      } catch {
        // Certaines lignes SSE peuvent être vides ou partielles : on les ignore.
      }
    }
  }

  return {
    content,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    mock: false
  };
}
