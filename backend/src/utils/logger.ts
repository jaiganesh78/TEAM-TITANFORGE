import winston from 'winston';
import { env } from '../config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const corr = info.correlationId ? ` [CorrelationID: ${info.correlationId}]` : '';
      return `[${info.timestamp}] [${info.level.toUpperCase()}]${corr}: ${info.message}`;
    }
  )
);

const transports = [
  new winston.transports.Console(),
];

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});

export function logRequest(req: any, level: 'info' | 'error' | 'warn' | 'debug', message: string) {
  logger.log({
    level,
    message,
    correlationId: req.correlationId,
  });
}
