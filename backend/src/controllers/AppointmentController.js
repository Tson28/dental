import { appointmentService } from '../services/index.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/responseHelper.js';

export class AppointmentController {
  async createAppointment(req, res, next) {
    try {
      const appointmentData = req.validatedBody;
      const userId = req.userId;
      const userRole = req.userRole;

      const appointment = await appointmentService.createAppointment(
        appointmentData,
        userId,
        userRole
      );

      return createdResponse(res, appointment, 'Tạo lịch hẹn thành công');
    } catch (error) {
      next(error);
    }
  }

  async getAppointments(req, res, next) {
    try {
      const options = {
        ...req.validatedQuery,
        patientId: req.query.patientId,
        doctorId: req.query.doctorId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const userId = req.userId;
      const userRole = req.userRole;

      const result = await appointmentService.getAppointments(options, userId, userRole);

      return paginatedResponse(res, {
        data: result.appointments,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }, 'Lấy danh sách lịch hẹn thành công');
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      const appointment = await appointmentService.getAppointmentById(id, userId, userRole);

      return successResponse(res, appointment);
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      const userId = req.userId;
      const userRole = req.userRole;

      const appointment = await appointmentService.updateAppointment(
        id,
        updateData,
        userId,
        userRole
      );

      return successResponse(res, appointment, 'Cập nhật lịch hẹn thành công');
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      const appointment = await appointmentService.cancelAppointment(
        id,
        reason,
        userId,
        userRole
      );

      return successResponse(res, appointment, 'Hủy lịch hẹn thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      const appointment = await appointmentService.updateStatus(
        id,
        status,
        userId,
        userRole
      );

      return successResponse(res, appointment, 'Cập nhật trạng thái thành công');
    } catch (error) {
      next(error);
    }
  }

  async getDoctorAppointments(req, res, next) {
    try {
      const { doctorId, date } = req.query;

      const appointments = await appointmentService.getDoctorAppointments(doctorId, date);

      return successResponse(res, appointments);
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingForDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const limit = parseInt(req.query.limit) || 5;

      const appointments = await appointmentService.getUpcomingForDoctor(doctorId, limit);

      return successResponse(res, appointments);
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentStats(req, res, next) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      const stats = await appointmentService.getAppointmentStats(userId, userRole);

      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
