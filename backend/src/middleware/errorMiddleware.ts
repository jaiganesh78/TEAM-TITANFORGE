import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logRequest } from '../utils/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: any;

  constructor(message: string, statusCode: number = 400, errorCode: string = 'BAD_REQUEST', details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Input validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  } else {
    // Log actual stack trace for unhandled errors
    logRequest(req, 'error', `Unhandled Exception: ${err.message}\nStack: ${err.stack}`);
  }

  // Log error response
  if (statusCode >= 500) {
    logRequest(req, 'error', `Response Error 500: ${message}`);
  } else {
    logRequest(req, 'warn', `Response Warning ${statusCode}: ${message} (${errorCode})`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      details,
    },
    correlationId: (req as any).correlationId,
  });
}
