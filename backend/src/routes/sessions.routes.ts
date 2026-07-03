import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';

export const sessionsRouter = Router();

const createSessionSchema = z.object({
  characterId: z.string().min(1),
  scenarioId: z.string().optional(),
  title: z.string().min(2).max(120)
});

sessionsRouter.use(requireAuth);

sessionsRouter.get('/', async (req, res, next) => {
  try {
    const sessions = await prisma.gameSession.findMany({
      where: { userId: req.user!.id },
      include: {
        character: true,
        scenario: true,
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

sessionsRouter.post('/', async (req, res, next) => {
  try {
    const body = createSessionSchema.parse(req.body);

    const character = await prisma.character.findFirst({
      where: { id: body.characterId, userId: req.user!.id }
    });

    if (!character) {
      throw new HttpError(404, 'Personnage introuvable.');
    }

    const scenario = body.scenarioId
      ? await prisma.scenario.findUnique({ where: { id: body.scenarioId } })
      : null;

    const session = await prisma.gameSession.create({
      data: {
        userId: req.user!.id,
        characterId: body.characterId,
        scenarioId: body.scenarioId,
        title: body.title,
        messages: {
          create: [
            {
              role: 'SYSTEM',
              content: scenario
                ? `Scénario sélectionné : ${scenario.title}. ${scenario.summary}`
                : 'Session libre créée.'
            },
            {
              role: 'MJ',
              content: `Bienvenue ${character.name}. Décris ta première action pour lancer l’aventure.`
            }
          ]
        }
      },
      include: {
        character: true,
        scenario: true,
        messages: true
      }
    });

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

sessionsRouter.get('/:id/messages', async (req, res, next) => {
  try {
    const session = await prisma.gameSession.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!session) {
      throw new HttpError(404, 'Session introuvable.');
    }

    const messages = await prisma.gameMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});
