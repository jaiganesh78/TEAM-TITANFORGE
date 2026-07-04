import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../utils/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      logRequest(req, 'error', message);
    } else if (statusCode >= 400) {
      logRequest(req, 'warn', message);
    } else {
      logRequest(req, 'info', message);
    }
  });

  next();
}
