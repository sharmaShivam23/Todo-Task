import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/errorLogger';

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const statusCode = (res.statusCode && res.statusCode !== 200) 
    ? res.statusCode 
    : 500;

  await logError(err, req, statusCode);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


