import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiting for the /unlock endpoint to prevent brute-force GPS spoofing.
 */
export const unlockLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Max 10 unlock attempts per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: "Whoa, chill! You're trying to unlock too rapidly. The capsule isn't running away! ⏳"
  }
});

/**
 * General API rate limiter for regular traffic
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this device. Please try again later.'
  }
});

/**
 * Memory Wall post creation limiter — 10 posts per 15 minutes per IP.
 */
export const memoryPostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You're posting too fast! Take a breath and try again in a few minutes. 🌸"
  }
});
