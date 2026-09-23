import pino from 'pino';
import { config } from './index';

export const logger = pino({
  level: config.logging.level,
  transport:
    config.env === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

// Never log sensitive information
export function sanitizeForLogging(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitive = ['password', 'apiKey', 'token', 'secret', 'authorization'];
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}
