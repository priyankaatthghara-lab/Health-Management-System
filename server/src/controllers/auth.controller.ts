import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { User } from '../models/User';
import { DonorProfile } from '../models/DonorProfile';
import { Hospital } from '../models/Hospital';
import { AuditLog } from '../models/AuditLog';

/**
 * Helper to generate JWT token for authenticated session
 */
export const generateToken = (
  userId: string | mongoose.Types.ObjectId,
  role: string
): string => {
  return jwt.sign(
    {
      id: userId.toString(),
      role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpire as any,
    }
  );
};

/**
 * Helper to extract client IP safely
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Register a new individual blood donor
 * POST /api/auth/register/donor
 */
export const registerDonor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      city,
      state,
      bloodGroup,
      contactPreference,
      coordinates,
      consentToContact = true,
      consentToLocationSharing = false,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already in use
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('An account with this email address already exists', 400));
    }

    // Create User record with role 'donor'
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'donor',
      status: 'active',
      emailVerified: false,
    });

    // Create associated DonorProfile record
    const donorProfile = await DonorProfile.create({
      userId: user._id,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      city,
      state,
      bloodGroup,
      contactPreference: contactPreference || 'both',
      coordinates,
      consentToContact,
      consentToLocationSharing,
      availability: 'available',
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Record audit log entry
    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      action: 'DONOR_REGISTRATION',
      targetType: 'user',
      targetId: user._id,
      metadata: {
        email: user.email,
        donorProfileId: donorProfile._id,
        city,
        state,
        bloodGroup,
      },
      ipAddress: getClientIp(req),
    });

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new hospital or blood bank facility
 * POST /api/auth/register/hospital
 */
export const registerHospital = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      hospitalName,
      address,
      city,
      state,
      phone,
      type,
      registrationNumber,
      licenseNumber,
      website,
      operatingHours,
      emergencyContact,
      coordinates,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already in use
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('An account with this email address already exists', 400));
    }

    // Create User account with role 'hospital'
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'hospital',
      status: 'active',
      emailVerified: false,
    });

    // Create Hospital facility profile with pending verification
    const hospital = await Hospital.create({
      userId: user._id,
      name: hospitalName,
      address,
      city,
      state,
      phone,
      email: normalizedEmail,
      type,
      registrationNumber,
      licenseNumber,
      website,
      operatingHours,
      emergencyContact,
      coordinates,
      verificationStatus: 'pending',
      verificationHistory: [
        {
          status: 'pending',
          reason: 'Initial registration submitted, pending administrative review',
          timestamp: new Date(),
        },
      ],
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Record audit log entry
    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      action: 'HOSPITAL_REGISTRATION',
      targetType: 'hospital',
      targetId: hospital._id,
      metadata: {
        hospitalName,
        email: user.email,
        type,
        city,
        state,
      },
      ipAddress: getClientIp(req),
    });

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Account pending clinical verification.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate existing user with email and password
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Verify password with bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Verify user account status
    if (user.status !== 'active') {
      return next(
        new AppError(
          `Your account is currently ${user.status}. Please contact system support for assistance.`,
          403
        )
      );
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Record audit log entry
    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      targetType: 'user',
      targetId: user._id,
      metadata: {
        email: user.email,
        role: user.role,
      },
      ipAddress: getClientIp(req),
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user (JWT is stateless, client clears token from storage)
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?._id) {
      await AuditLog.create({
        actorId: new mongoose.Types.ObjectId(req.user._id),
        actorRole: req.user.role,
        action: 'USER_LOGOUT',
        targetType: 'user',
        targetId: new mongoose.Types.ObjectId(req.user._id),
        metadata: { email: req.user.email },
        ipAddress: getClientIp(req),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset token
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    let rawToken: string | undefined;

    if (user && user.status === 'active') {
      // Generate unhashed random crypto token
      rawToken = crypto.randomBytes(32).toString('hex');

      // Hash token to store in database
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      user.resetPasswordToken = hashedToken;
      // Token expires in 1 hour
      user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);

      await user.save({ validateBeforeSave: false });

      // Audit log the password reset request
      await AuditLog.create({
        actorId: user._id,
        actorRole: user.role,
        action: 'PASSWORD_RESET_REQUESTED',
        targetType: 'user',
        targetId: user._id,
        metadata: { email: user.email },
        ipAddress: getClientIp(req),
      });

      /**
       * In a production environment, an email service (e.g. AWS SES, SendGrid, Nodemailer)
       * would dispatch a secure password reset link containing rawToken:
       * `${config.clientUrl}/reset-password?token=${rawToken}`
       *
       * In development/demo mode, we expose the token directly in the response payload.
       */
    }

    // Always respond with a generic success message to prevent user enumeration attacks
    const responseData: Record<string, any> = {
      success: true,
      message:
        'If an active account exists with the provided email address, a password reset link has been dispatched.',
    };

    if (config.nodeEnv === 'development' && rawToken) {
      responseData.devResetToken = rawToken;
      responseData.devNote =
        '[DEVELOPMENT ONLY] Reset token returned directly because email service is disabled in local environment.';
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using valid reset token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Hash the candidate token to match database record
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token and unexpired window
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return next(
        new AppError('Password reset token is invalid or has expired', 400)
      );
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Audit log successful password reset
    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      action: 'PASSWORD_RESET_SUCCESS',
      targetType: 'user',
      targetId: user._id,
      metadata: { email: user.email },
      ipAddress: getClientIp(req),
    });

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve authenticated user profile with associated donor or hospital details
 * GET /api/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      return next(new AppError('Authentication required', 401));
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return next(new AppError('User account not found', 404));
    }

    let profile: any = null;

    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerDonor,
  registerHospital,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  generateToken,
};
