import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/google', (req, res, next) => authController.loginWithGoogle(req, res, next));
router.get('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/debug-cookies', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    authorizationHeader: req.headers.authorization || null
  });
});

// Protected routes
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));

export default router;
