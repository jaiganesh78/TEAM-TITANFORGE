"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (req, res, next) => authController_1.authController.register(req, res, next));
router.post('/login', (req, res, next) => authController_1.authController.login(req, res, next));
router.post('/google', (req, res, next) => authController_1.authController.loginWithGoogle(req, res, next));
router.get('/verify-email', (req, res, next) => authController_1.authController.verifyEmail(req, res, next));
router.post('/forgot-password', (req, res, next) => authController_1.authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController_1.authController.resetPassword(req, res, next));
router.post('/refresh', (req, res, next) => authController_1.authController.refresh(req, res, next));
router.post('/logout', (req, res, next) => authController_1.authController.logout(req, res, next));
// Protected routes
router.get('/me', authMiddleware_1.requireAuth, (req, res, next) => authController_1.authController.me(req, res, next));
exports.default = router;
