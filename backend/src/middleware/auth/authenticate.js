import { User } from '../../models/index.js';
import { verifyAccessToken } from '../../utils/jwt.js';
import { UnauthorizedError } from '../errors/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục');
    }
    
    const decoded = verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new UnauthorizedError('Người dùng không tồn tại');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }
    
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: error.message || 'Token không hợp lệ',
        code: 'TOKEN_ERROR',
      });
    }
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
          req.userRole = user.role;
        }
      } catch {
        // Token invalid, continue without auth
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
