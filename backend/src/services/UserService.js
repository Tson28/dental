import { userRepository } from '../repositories/index.js';
import { NotFoundError, ForbiddenError } from '../middleware/errors/index.js';

export class UserService {
  async getAllUsers(options) {
    return userRepository.findAll(options);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    return user.toPublicJSON();
  }

  async createUser(userData, createdBy) {
    if (createdBy !== 'ADMIN' && userData.role !== 'USER') {
      throw new ForbiddenError('Chỉ admin mới có thể tạo người dùng với vai trò ADMIN hoặc DOCTOR');
    }

    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new NotFoundError('Email đã được sử dụng');
    }

    const user = await userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    return user.toPublicJSON();
  }

  async updateUser(id, updateData, updatedBy) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (updateData.role && updatedBy !== 'ADMIN') {
      throw new ForbiddenError('Chỉ admin mới có thể thay đổi vai trò');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(updateData.email);
      if (existingUser) {
        throw new NotFoundError('Email đã được sử dụng');
      }
    }

    const updatedUser = await userRepository.update(id, {
      ...updateData,
      ...(updateData.email && { email: updateData.email.toLowerCase() }),
    });

    return updatedUser.toPublicJSON();
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenError('Không thể xóa tài khoản admin');
    }

    await userRepository.softDelete(id);

    return { message: 'Xóa người dùng thành công' };
  }

  async toggleUserStatus(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenError('Không thể vô hiệu hóa tài khoản admin');
    }

    const updatedUser = await userRepository.update(id, {
      isActive: !user.isActive,
    });

    return updatedUser.toPublicJSON();
  }

  async getDoctors() {
    const doctors = await userRepository.getDoctors();
    return doctors;
  }

  async getUserStats() {
    const stats = await userRepository.countByRole();
    
    const total = stats.reduce((sum, item) => sum + item.count, 0);
    
    return {
      total,
      byRole: stats.reduce((acc, item) => {
        acc[item._id.toLowerCase()] = item.count;
        return acc;
      }, {}),
    };
  }
}

export const userService = new UserService();
