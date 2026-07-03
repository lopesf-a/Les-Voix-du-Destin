import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const rulesRouter = Router();

rulesRouter.get('/', async (_req, res, next) => {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: [{ category: 'asc' }, { title: 'asc' }]
    });

    res.json({ rules });
  } catch (error) {
    next(error);
  }
});
