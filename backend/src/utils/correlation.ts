import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export const CORRELATION_HEADER = 'x-correlation-id';

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.header(CORRELATION_HEADER) as string) || randomUUID();
  req.correlationId = correlationId;
  res.setHeader(CORRELATION_HEADER, correlationId);
  next();
}
