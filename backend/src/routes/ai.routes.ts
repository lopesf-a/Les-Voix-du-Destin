import { Router, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { generateMistralTurn, streamMistralTurn, type ChatMessage, type MistralTurnResult } from '../services/mistral.service.js';
import { resolvePlayerAction, type RuleCheckResult, type CharacterStats } from '../services/rules-engine.service.js';

export const aiRouter = Router();

const turnSchema = z.object({
  sessionId: z.string().min(1),
  action: z.string().min(1).max(1200),
  // Utile pour tester en local : ex. forcedRoll=5 pour vérifier le comportement d'un mauvais jet.
  forcedRoll: z.number().int().min(1).max(20).optional()
});

type LoadedSession = NonNullable<Awaited<ReturnType<typeof loadSession>>>;

aiRouter.use(requireAuth);

function safeCharacter(character: LoadedSession['character']) {
  return {
    id: character.id,
    name: character.name,
    className: character.className,
    level: character.level,
    hp: character.hp,
    maxHp: character.maxHp,
    xp: character.xp,
    stats: character.stats,
    inventory: character.inventory,
    backstory: character.backstory
  };
}

function sendSse(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function loadSession(sessionId: string, userId: string) {
  return prisma.gameSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      character: true,
      scenario: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 8
      }
    }
  });
}

function buildHistory(session: LoadedSession) {
  return [...session.messages].reverse().map((message) => ({
    role: message.role === 'PLAYER' ? 'user' as const : 'assistant' as const,
    content: message.content
  }));
}

function buildSystemPrompt(session: LoadedSession, ruleCheck: RuleCheckResult, updatedCharacter: LoadedSession['character']) {
  return [
    'Tu es un maître du jeu de rôle francophone.',
    'Tu dois produire une narration immersive, fluide et concise.',
    'Le moteur de règles backend a déjà lancé le dé, calculé la réussite, les dégâts, les soins et les PV.',
    'Tu dois respecter exactement le résultat de règles fourni. Ne relance jamais de dé. Ne modifie jamais les PV toi-même.',
    'Mentionne naturellement le résultat du jet, la conséquence et les PV actuels si cela a du sens.',
    'Finis toujours par 2 à 4 choix possibles.',
    `Personnage: ${updatedCharacter.name}, classe ${updatedCharacter.className}, niveau ${updatedCharacter.level}.`,
    `PV actuels: ${updatedCharacter.hp}/${updatedCharacter.maxHp}. XP: ${updatedCharacter.xp}.`,
    `Stats: ${JSON.stringify(updatedCharacter.stats)}.`,
    session.scenario ? `Scénario: ${session.scenario.title}. ${session.scenario.prompt}` : 'Scénario libre.',
    '',
    'RÉSULTAT DE RÈGLES À RESPECTER:',
    JSON.stringify(ruleCheck, null, 2)
  ].join('\n');
}

async function applyRules(session: LoadedSession, action: string, forcedRoll?: number) {
  const ruleCheck = resolvePlayerAction({
    action,
    stats: session.character.stats as CharacterStats,
    hp: session.character.hp,
    maxHp: session.character.maxHp,
    forcedRoll
  });

  const updatedCharacter = await prisma.character.update({
    where: { id: session.character.id },
    data: {
      hp: ruleCheck.hpAfter,
      xp: { increment: ruleCheck.xpDelta }
    }
  });

  return { ruleCheck, updatedCharacter };
}

async function saveFailureLog(sessionId: string | undefined, startedAt: number, error: unknown) {
  await prisma.aiUsageLog.create({
    data: {
      sessionId,
      model: 'unknown',
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }).catch(() => undefined);
}

async function persistMjTurn(
  sessionId: string,
  content: string,
  ruleCheck: RuleCheckResult,
  usage: MistralTurnResult,
  startedAt: number
) {
  const mjMessage = await prisma.gameMessage.create({
    data: {
      sessionId,
      role: 'MJ',
      content,
      metadata: { ruleCheck }
    }
  });

  await prisma.aiUsageLog.create({
    data: {
      sessionId,
      model: usage.model,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      latencyMs: Date.now() - startedAt,
      success: true
    }
  });

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() }
  });

  return mjMessage;
}

async function prepareTurn(body: z.infer<typeof turnSchema>, userId: string) {
  const session = await loadSession(body.sessionId, userId);

  if (!session) {
    throw new HttpError(404, 'Session introuvable.');
  }

  const playerMessage = await prisma.gameMessage.create({
    data: {
      sessionId: session.id,
      role: 'PLAYER',
      content: body.action
    }
  });

  const { ruleCheck, updatedCharacter } = await applyRules(session, body.action, body.forcedRoll);
  const history = buildHistory(session);

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(session, ruleCheck, updatedCharacter) },
    ...history,
    { role: 'user', content: body.action }
  ];

  return {
    session,
    playerMessage,
    ruleCheck,
    updatedCharacter,
    messages
  };
}

aiRouter.post('/turn', async (req, res, next) => {
  const startedAt = Date.now();
  let sessionId: string | undefined;

  try {
    const body = turnSchema.parse(req.body);
    sessionId = body.sessionId;

    const prepared = await prepareTurn(body, req.user!.id);
    const result = await generateMistralTurn(prepared.messages, body.action);
    const content = result.content || 'Le MJ observe la scène, mais aucune narration exploitable n’a été générée.';
    const mjMessage = await persistMjTurn(prepared.session.id, content, prepared.ruleCheck, result, startedAt);

    res.json({
      playerMessage: prepared.playerMessage,
      message: mjMessage,
      ruleCheck: prepared.ruleCheck,
      character: safeCharacter(prepared.updatedCharacter),
      usage: result
    });
  } catch (error) {
    await saveFailureLog(sessionId, startedAt, error);
    next(error);
  }
});

aiRouter.post('/turn/stream', async (req, res, next) => {
  const startedAt = Date.now();
  let sessionId: string | undefined;

  try {
    const body = turnSchema.parse(req.body);
    sessionId = body.sessionId;

    const prepared = await prepareTurn(body, req.user!.id);

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    sendSse(res, 'meta', {
      playerMessage: prepared.playerMessage,
      ruleCheck: prepared.ruleCheck,
      character: safeCharacter(prepared.updatedCharacter)
    });

    const stream = streamMistralTurn(prepared.messages, body.action);
    let content = '';
    let usage: MistralTurnResult | undefined;

    while (true) {
      const nextChunk = await stream.next();

      if (nextChunk.done) {
        usage = nextChunk.value;
        break;
      }

      content += nextChunk.value.content;
      sendSse(res, 'delta', { content: nextChunk.value.content });
    }

    const finalUsage = usage ?? {
      content,
      model: 'unknown',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      mock: false
    };

    const finalContent = content || finalUsage.content || 'Le MJ observe la scène, mais aucune narration exploitable n’a été générée.';
    const mjMessage = await persistMjTurn(prepared.session.id, finalContent, prepared.ruleCheck, finalUsage, startedAt);

    sendSse(res, 'done', {
      message: mjMessage,
      ruleCheck: prepared.ruleCheck,
      character: safeCharacter(prepared.updatedCharacter),
      usage: finalUsage
    });
    res.end();
  } catch (error) {
    await saveFailureLog(sessionId, startedAt, error);

    if (res.headersSent) {
      sendSse(res, 'error', {
        message: error instanceof Error ? error.message : 'Erreur inconnue pendant le streaming.'
      });
      res.end();
      return;
    }

    next(error);
  }
});
