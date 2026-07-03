import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const charactersRouter = Router();

const statsSchema = z.object({
  force: z.coerce.number().int().min(1).max(20),
  dexterite: z.coerce.number().int().min(1).max(20),
  intelligence: z.coerce.number().int().min(1).max(20)
});

const createCharacterSchema = z.object({
  name: z.string().min(2).max(60),
  className: z.string().min(2).max(60),
  stats: statsSchema.default({ force: 10, dexterite: 10, intelligence: 10 }),
  inventory: z.array(z.string()).default(['Épée', 'Potion']),
  backstory: z.string().max(1000).optional()
});

charactersRouter.use(requireAuth);

charactersRouter.get('/', async (req, res, next) => {
  try {
    const characters = await prisma.character.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ characters });
  } catch (error) {
    next(error);
  }
});

charactersRouter.post('/', async (req, res, next) => {
  try {
    const body = createCharacterSchema.parse(req.body);
    const character = await prisma.character.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        className: body.className,
        stats: body.stats,
        inventory: body.inventory,
        backstory: body.backstory
      }
    });

    res.status(201).json({ character });
  } catch (error) {
    next(error);
  }
});
