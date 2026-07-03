import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const metricsRouter = Router();

metricsRouter.use(requireAuth);

metricsRouter.get('/overview', async (req, res, next) => {
  try {
    const [characters, sessions, messages, aiCalls, failedAiCalls, tokenAgg] = await Promise.all([
      prisma.character.count({ where: { userId: req.user!.id } }),
      prisma.gameSession.count({ where: { userId: req.user!.id } }),
      prisma.gameMessage.count({ where: { session: { userId: req.user!.id } } }),
      prisma.aiUsageLog.count({ where: { session: { userId: req.user!.id } } }),
      prisma.aiUsageLog.count({ where: { session: { userId: req.user!.id }, success: false } }),
      prisma.aiUsageLog.aggregate({
        where: { session: { userId: req.user!.id } },
        _sum: { totalTokens: true, latencyMs: true },
        _avg: { latencyMs: true }
      })
    ]);

    res.json({
      overview: {
        characters,
        sessions,
        messages,
        aiCalls,
        failedAiCalls,
        totalTokens: tokenAgg._sum.totalTokens ?? 0,
        averageLatencyMs: Math.round(tokenAgg._avg.latencyMs ?? 0)
      }
    });
  } catch (error) {
    next(error);
  }
});
