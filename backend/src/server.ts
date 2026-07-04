import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { authRouter } from './routes/auth.routes.js';
import { charactersRouter } from './routes/characters.routes.js';
import { scenariosRouter } from './routes/scenarios.routes.js';
import { sessionsRouter } from './routes/sessions.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { metricsRouter } from './routes/metrics.routes.js';
import { rulesRouter } from './routes/rules.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'https://les-voix-du-destin-frontend.vercel.app',
  process.env.CORS_ORIGIN
]
  .filter(Boolean)
  .map((origin) => origin!.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origine CORS refusée : ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'les-voix-du-destin-backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/metrics', metricsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`API Les Voix du Destin lancée sur http://localhost:${env.PORT}`);
});
