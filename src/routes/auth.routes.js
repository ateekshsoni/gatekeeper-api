import express from "express";
import rateLimit from "express-rate-limit";
import authController from "../controller/auth.controller.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.middleware.js";
import {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  validateChangePassword,
  validateProfileUpdate
} from "../middleware/validation.middleware.js";

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes with rate limiting
router.post("/register", authLimiter, validateRegistration, authController.register);
router.post("/login", authLimiter, validateLogin, authController.login);
router.post("/refresh-token", generalLimiter, authController.refreshToken);
router.post("/logout", generalLimiter, authController.logout);

// Protected routes
router.post("/logout-all", authenticateToken, authController.logoutAll);
router.get("/profile", authenticateToken, authController.getProfile);

// Optional auth route example
router.get("/public-profile/:id", optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: "Public profile endpoint",
    authenticated: !!req.user
  });
});

export default router;