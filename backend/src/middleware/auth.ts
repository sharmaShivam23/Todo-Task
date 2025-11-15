import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logError } from '../utils/errorLogger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
      return;
    }

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
      return;
    }
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};


