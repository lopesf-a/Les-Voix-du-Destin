import pino from 'pino';
import { isDev } from '../config/env.js';

export const logger = pino({
  level: isDev ? 'debug' : 'info'
});
