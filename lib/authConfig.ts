export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  JWT_EXPIRES_IN: 3600, // 1 hour in seconds
} as const;

// Add validation
if (!AUTH_CONFIG.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}