import { Appointment } from '../models/index.js';

export class AppointmentRepository {
  async create(appointmentData) {
    const appointment = new Appointment(appointmentData);
    return appointment.save();
  }

  async findById(id) {
    return Appointment.findById(id)
      .populate('patient', 'fullName email phone')
      .populate('doctor', 'fullName email phone')
      .populate('service', 'name code price duration');
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      patientId,
      doctorId,
      status,
      startDate,
      endDate,
      sortBy = 'appointmentDate',
      sortOrder = 'desc',
    } = options;

    const query = {};

    if (patientId) {
      query.patient = patientId;
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) {
        query.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.appointmentDate.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patient', 'fullName email phone')
        .populate('doctor', 'fullName email phone')
        .populate('service', 'name code price duration')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id, updateData) {
    return Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'fullName email phone')
      .populate('doctor', 'fullName email phone')
      .populate('service', 'name code price duration');
  }

  async delete(id) {
    return Appointment.findByIdAndDelete(id);
  }

  async findByPatient(patientId, options = {}) {
    return this.findAll({ ...options, patientId });
  }

  async findByDoctor(doctorId, options = {}) {
    return this.findAll({ ...options, doctorId });
  }

  async findByDate(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    }).populate('patient', 'fullName phone');
  }

  async countByStatus(doctorId = null) {
    const match = doctorId ? { doctor: doctorId } : {};
    
    return Appointment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getUpcomingAppointments(doctorId, limit = 5) {
    return Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('patient', 'fullName phone')
      .populate('service', 'name duration')
      .sort({ appointmentDate: 1 })
      .limit(limit)
      .lean();
  }

  async checkTimeSlotAvailable(doctorId, date, time) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: time,
      status: { $nin: ['cancelled'] },
    });

    return !existingAppointment;
  }

  async updateStatus(id, status, additionalData = {}) {
    const updateData = { status, ...additionalData };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    return this.update(id, updateData);
  }
}

export const appointmentRepository = new AppointmentRepository();
