import { appointmentRepository } from '../repositories/index.js';
import { userRepository } from '../repositories/index.js';
import { serviceRepository } from '../repositories/index.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../middleware/errors/index.js';

export class AppointmentService {
  async createAppointment(appointmentData, userId, userRole) {
    const patient = await userRepository.findById(appointmentData.patient);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    const doctor = await userRepository.findById(appointmentData.doctor);
    if (!doctor) {
      throw new NotFoundError('Bác sĩ không tồn tại');
    }

    if (doctor.role !== 'DOCTOR' && doctor.role !== 'ADMIN') {
      throw new ValidationError('Người được chọn không phải là bác sĩ');
    }

    const service = await serviceRepository.findById(appointmentData.service);
    if (!service) {
      throw new NotFoundError('Dịch vụ không tồn tại');
    }

    if (userRole === 'USER' && appointmentData.patient.toString() !== userId.toString()) {
      throw new ForbiddenError('Bạn chỉ có thể đặt lịch cho bản thân');
    }

    const isAvailable = await appointmentRepository.checkTimeSlotAvailable(
      appointmentData.doctor,
      appointmentData.appointmentDate,
      appointmentData.appointmentTime
    );

    if (!isAvailable) {
      throw new ValidationError('Khung giờ này đã có người đặt');
    }

    if (userRole === 'USER') {
      appointmentData.status = 'pending';
    }

    const appointment = await appointmentRepository.create({
      ...appointmentData,
      totalPrice: service.price,
    });

    return appointment;
  }

  async getAppointments(options, userId, userRole) {
    const filters = {};

    if (userRole === 'USER') {
      filters.patientId = userId;
    } else if (userRole === 'DOCTOR') {
      filters.doctorId = userId;
    }

    if (options.patientId && userRole !== 'USER') {
      filters.patientId = options.patientId;
    }

    if (options.doctorId && userRole === 'ADMIN') {
      filters.doctorId = options.doctorId;
    }

    if (options.status) {
      filters.status = options.status;
    }

    if (options.startDate) {
      filters.startDate = options.startDate;
    }

    if (options.endDate) {
      filters.endDate = options.endDate;
    }

    return appointmentRepository.findAll(filters, options);
  }

  async getAppointmentById(id, userId, userRole) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError('Lịch hẹn không tồn tại');
    }

    if (userRole === 'USER' && appointment.patient._id.toString() !== userId.toString()) {
      throw new ForbiddenError('Bạn không có quyền xem lịch hẹn này');
    }

    if (userRole === 'DOCTOR' && appointment.doctor._id.toString() !== userId.toString()) {
      throw new ForbiddenError('Bạn không có quyền xem lịch hẹn này');
    }

    return appointment;
  }

  async updateAppointment(id, updateData, userId, userRole) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError('Lịch hẹn không tồn tại');
    }

    if (userRole === 'USER' && appointment.patient._id.toString() !== userId.toString()) {
      throw new ForbiddenError('Bạn không có quyền cập nhật lịch hẹn này');
    }

    if (userRole === 'DOCTOR' && appointment.doctor._id.toString() !== userId.toString()) {
      throw new ForbiddenError('Bạn không có quyền cập nhật lịch hẹn này');
    }

    if (updateData.doctor || updateData.appointmentDate || updateData.appointmentTime) {
      if (userRole === 'USER') {
        throw new ForbiddenError('Bạn không có quyền thay đổi lịch hẹn');
      }

      const isAvailable = await appointmentRepository.checkTimeSlotAvailable(
        updateData.doctor || appointment.doctor._id,
        updateData.appointmentDate || appointment.appointmentDate,
        updateData.appointmentTime || appointment.appointmentTime
      );

      if (!isAvailable) {
        throw new ValidationError('Khung giờ này đã có người đặt');
      }
    }

    const updatedAppointment = await appointmentRepository.update(id, updateData);

    return updatedAppointment;
  }

  async cancelAppointment(id, reason, userId, userRole) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError('Lịch hẹn không tồn tại');
    }

    if (appointment.status === 'cancelled') {
      throw new ValidationError('Lịch hẹn đã bị hủy trước đó');
    }

    if (appointment.status === 'completed') {
      throw new ValidationError('Không thể hủy lịch hẹn đã hoàn thành');
    }

    const isOwner = appointment.patient._id.toString() === userId.toString();
    const isDoctor = appointment.doctor._id.toString() === userId.toString();
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isDoctor && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền hủy lịch hẹn này');
    }

    const updatedAppointment = await appointmentRepository.updateStatus(id, 'cancelled', {
      cancellationReason: reason,
      cancelledBy: userId,
    });

    return updatedAppointment;
  }

  async updateStatus(id, status, userId, userRole) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError('Lịch hẹn không tồn tại');
    }

    if (userRole === 'USER') {
      throw new ForbiddenError('Bạn không có quyền thay đổi trạng thái');
    }

    if (userRole === 'DOCTOR' && appointment.doctor._id.toString() !== userId.toString()) {
      throw new ForbiddenError('Bạn chỉ có thể thay đổi trạng thái lịch hẹn của mình');
    }

    const updatedAppointment = await appointmentRepository.updateStatus(id, status);

    return updatedAppointment;
  }

  async getDoctorAppointments(doctorId, date) {
    return appointmentRepository.findByDate(doctorId, date);
  }

  async getUpcomingForDoctor(doctorId, limit = 5) {
    return appointmentRepository.getUpcomingAppointments(doctorId, limit);
  }

  async getAppointmentStats(userId, userRole) {
    const doctorId = userRole === 'DOCTOR' ? userId : undefined;
    const stats = await appointmentRepository.countByStatus(doctorId);

    return stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }
}

export const appointmentService = new AppointmentService();
