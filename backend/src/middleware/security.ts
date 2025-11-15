import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xss = require('xss-clean');

// Rate limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 5 requests per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// MongoDB injection protection
export const mongoSanitization = mongoSanitize();

// HTTP Parameter Pollution protection
export const httpParameterPollution = hpp();

// XSS protection - additional sanitization (commented out as xss-clean handles this)
// export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
//   // Clean request body
//   if (req.body) {
//     req.body = sanitizeObject(req.body);
//   }
//   // Clean query params
//   if (req.query) {
//     req.query = sanitizeObject(req.query);
//   }
//   // Clean params
//   if (req.params) {
//     req.params = sanitizeObject(req.params);
//   }
//   next();
// };

// Helper function to sanitize objects recursively
const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

// XSS protection middleware
export const xssProtectionMiddleware = xss();

