import ErrorLog from '../models/ErrorLog';
import { Request } from 'express';

export const logError = async (
  error: Error,
  req?: Request,
  statusCode?: number
): Promise<void> => {
  try {
    await ErrorLog.create({
      message: error.message,
      stack: error.stack,
      route: req?.originalUrl,
      method: req?.method,
      statusCode: statusCode || 500,
      user: (req as any)?.user?.id,
      timestamp: new Date(),
    });
  } catch (logError) {
    console.error('Failed to log error to database:', logError);
  }
};


