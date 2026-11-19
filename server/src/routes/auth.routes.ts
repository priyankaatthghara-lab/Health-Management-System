import { Router } from 'express';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerDonorSchema,
  registerHospitalSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';
import {
  registerDonor,
  registerHospital,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /register/donor
 * @desc    Register a new individual donor account
 * @access  Public
 */
router.post('/register/donor', validate(registerDonorSchema), registerDonor);

/**
 * @route   POST /register/hospital
 * @desc    Register a new hospital or blood bank facility account
 * @access  Public
 */
router.post('/register/hospital', validate(registerHospitalSchema), registerHospital);

/**
 * @route   POST /login
 * @desc    Log in with email and password
 * @access  Public (Rate limited)
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @route   POST /logout
 * @desc    Log out current authenticated session
 * @access  Protected
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /forgot-password
 * @desc    Request a password reset token
 * @access  Public (Rate limited)
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /reset-password
 * @desc    Reset password using valid reset token
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * @route   GET /me
 * @desc    Get currently logged in user profile with linked entity
 * @access  Protected
 */
router.get('/me', protect, getMe);

export { router as authRoutes };
export default router;
