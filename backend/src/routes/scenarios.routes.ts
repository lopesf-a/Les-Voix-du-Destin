import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const scenariosRouter = Router();

scenariosRouter.get('/', async (_req, res, next) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ scenarios });
  } catch (error) {
    next(error);
  }
});
