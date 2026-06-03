import { MedicalRecord } from '../models/index.js';

export class MedicalRecordRepository {
  async create(recordData) {
    const record = new MedicalRecord(recordData);
    return record.save();
  }

  async findById(id) {
    return MedicalRecord.findById(id)
      .populate('patient', 'fullName email phone dateOfBirth gender')
      .populate('doctor', 'fullName email');
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      patientId,
      doctorId,
      startDate,
      endDate,
      sortBy = 'recordDate',
      sortOrder = 'desc',
    } = options;

    const query = {};

    if (patientId) {
      query.patient = patientId;
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) {
        query.recordDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.recordDate.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [records, total] = await Promise.all([
      MedicalRecord.find(query)
        .populate('patient', 'fullName email phone')
        .populate('doctor', 'fullName email')
        .populate('appointment', 'appointmentDate appointmentTime')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicalRecord.countDocuments(query),
    ]);

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id, updateData) {
    return MedicalRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'fullName email phone')
      .populate('doctor', 'fullName email');
  }

  async delete(id) {
    return MedicalRecord.findByIdAndDelete(id);
  }

  async findByPatient(patientId, options = {}) {
    return this.findAll({ ...options, patientId });
  }

  async findByDoctor(doctorId, options = {}) {
    return this.findAll({ ...options, doctorId });
  }

  async getPatientHistory(patientId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      MedicalRecord.find({ patient: patientId })
        .populate('doctor', 'fullName')
        .populate('appointment', 'appointmentDate')
        .sort({ recordDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicalRecord.countDocuments({ patient: patientId }),
    ]);

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countByDoctor(doctorId) {
    return MedicalRecord.countDocuments({ doctor: doctorId });
  }

  async getRecentRecords(limit = 10) {
    return MedicalRecord.find()
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName')
      .sort({ recordDate: -1 })
      .limit(limit)
      .lean();
  }
}

export const medicalRecordRepository = new MedicalRecordRepository();
