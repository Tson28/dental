import { ForbiddenError } from '../errors/index.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Vui lòng đăng nhập để tiếp tục'));
    }
    
    if (!allowedRoles.includes(req.userRole)) {
      return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này'));
    }
    
    next();
  };
};

export const isAdmin = authorize('ADMIN');

export const isDoctor = authorize('ADMIN', 'DOCTOR');

export const isAdminOrDoctor = authorize('ADMIN', 'DOCTOR');

export const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('Vui lòng đăng nhập để tiếp tục'));
      }
      
      if (req.userRole === 'ADMIN') {
        return next();
      }
      
      let resourceUserId;
      
      if (typeof getResourceUserId === 'function') {
        resourceUserId = await getResourceUserId(req);
      } else if (getResourceUserId === 'userId') {
        resourceUserId = req.params.userId || req.params.id;
      }
      
      if (req.userId.toString() === resourceUserId?.toString()) {
        return next();
      }
      
      return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này'));
    } catch (error) {
      next(error);
    }
  };
};
