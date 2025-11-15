import { Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';
import { logError } from '../utils/errorLogger';
import crypto from 'crypto';

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Server error during signup',
    });
  }
};

export const signin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Server error during signin',
    });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Please provide an email',
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error: any) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      await logError(error as Error, req);

      // Provide more helpful error message
      const errorMessage = error.message?.includes('not configured')
        ? 'Email service is not configured. Please contact administrator.'
        : 'Email could not be sent. Please try again later.';

      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset request',
    });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide reset token and new password',
      });
      return;
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset',
    });
  }
};

