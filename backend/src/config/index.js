import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_clinic',
  },
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecret: process.env.COOKIE_SECRET,
  
  security: {
    bcryptRounds: 12,
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMax: 100,
  },
};

if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
  console.error('❌ JWT secrets are not configured in environment variables');
  process.exit(1);
}
