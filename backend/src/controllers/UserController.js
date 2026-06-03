import { userService } from '../services/index.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/responseHelper.js';

export class UserController {
  async getAllUsers(req, res, next) {
    try {
      const options = {
        page: req.validatedQuery.page,
        limit: req.validatedQuery.limit,
        search: req.validatedQuery.search,
        role: req.validatedQuery.role,
        isActive: req.validatedQuery.isActive,
        sortBy: req.validatedQuery.sortBy,
        sortOrder: req.validatedQuery.sortOrder,
      };

      const result = await userService.getAllUsers(options);

      return paginatedResponse(res, {
        data: result.users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }, 'Lấy danh sách người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const userData = req.validatedBody;
      const createdBy = req.userRole;

      const user = await userService.createUser(userData, createdBy);

      return createdResponse(res, user, 'Tạo người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      const updatedBy = req.userRole;

      const user = await userService.updateUser(id, updateData, updatedBy);

      return successResponse(res, user, 'Cập nhật người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const result = await userService.deleteUser(id);

      return successResponse(res, result, 'Xóa người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;

      const user = await userService.toggleUserStatus(id);

      return successResponse(res, user, 'Thay đổi trạng thái người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req, res, next) {
    try {
      const doctors = await userService.getDoctors();

      return successResponse(res, doctors, 'Lấy danh sách bác sĩ thành công');
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats();

      return successResponse(res, stats, 'Lấy thống kê người dùng thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
