import { userRepository } from '../repositories/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getTokenExpiry } from '../utils/jwt.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../middleware/errors/index.js';

export class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new ConflictError('Email đã được sử dụng');
    }

    if (userData.role && userData.role !== 'USER') {
      delete userData.role;
    }

    const user = await userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    const tokens = await this.generateTokens(user);

    await userRepository.updateRefreshToken(
      user._id,
      tokens.refreshToken,
      getTokenExpiry(tokens.refreshToken)
    );

    return {
      user: user.toPublicJSON(),
      ...tokens,
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateTokens(user);

    await userRepository.updateRefreshToken(
      user._id,
      tokens.refreshToken,
      getTokenExpiry(tokens.refreshToken)
    );

    await userRepository.updateLastLogin(user._id);

    return {
      user: user.toPublicJSON(),
      ...tokens,
    };
  }

  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
    return { message: 'Đăng xuất thành công' };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token là bắt buộc');
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await userRepository.findByRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedError('Refresh token không hợp lệ');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }

    const tokens = await this.generateTokens(user);

    await userRepository.updateRefreshToken(
      user._id,
      tokens.refreshToken,
      getTokenExpiry(tokens.refreshToken)
    );

    return tokens;
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    return user.toPublicJSON();
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictError('Email đã được sử dụng');
      }
    }

    const updatedUser = await userRepository.update(userId, {
      ...updateData,
      ...(updateData.email && { email: updateData.email.toLowerCase() }),
    });

    return updatedUser.toPublicJSON();
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId, '+password');

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Mật khẩu hiện tại không đúng');
    }

    await userRepository.update(userId, { password: newPassword });

    await userRepository.clearRefreshToken(userId);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async generateTokens(user) {
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
