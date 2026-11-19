import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { User } from '../models/User';
import '../types/express';

export interface DecodedToken {
  id?: string;
  _id?: string;
  email?: string;
  role?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please log in to access this resource.', 401)
      );
    }

    // Verify token with jwtSecret
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return next(new AppError('Invalid token payload. User ID not found.', 401));
    }

    // Find user by decoded id
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // Attach user to req
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please authenticate again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError('User not authenticated. Please log in first.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};

export default { protect, authorize };
