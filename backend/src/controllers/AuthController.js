import { authService } from '../services/index.js';
import { successResponse, createdResponse } from '../utils/responseHelper.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, fullName, phone, role } = req.validatedBody;

      const result = await authService.register({
        email,
        password,
        fullName,
        phone,
        role,
      });

      return createdResponse(res, result, 'Đăng ký thành công');
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody;

      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Đăng nhập thành công');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.userId;

      const result = await authService.logout(userId);

      res.clearCookie('refreshToken');

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      let refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          refreshToken = authHeader.substring(7);
        }
      }

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token là bắt buộc',
        });
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, tokens, 'Làm mới token thành công');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.userId;

      const profile = await authService.getProfile(userId);

      return successResponse(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const updateData = req.validatedBody;

      const profile = await authService.updateProfile(userId, updateData);

      return successResponse(res, profile, 'Cập nhật hồ sơ thành công');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.validatedBody;

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.clearCookie('refreshToken');

      return successResponse(res, result, 'Đổi mật khẩu thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
