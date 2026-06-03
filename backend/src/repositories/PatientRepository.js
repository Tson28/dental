import mongoose from 'mongoose';
import { Patient } from '../models/index.js';

export class PatientRepository {
  async create(patientData) {
    const patient = new Patient(patientData);
    return patient.save();
  }

  async findById(id, selectFields = '') {
    return Patient.findById(id).select(selectFields);
  }

  async findByCode(code) {
    return Patient.findOne({ code });
  }

  async findByPhone(phone) {
    return Patient.findOne({ phone });
  }

  async findByEmail(email) {
    return Patient.findOne({ email: email?.toLowerCase() });
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      gender,
      isActive,
      tag,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query = {};

    if (gender) {
      query.gender = gender;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (tag) {
      query['tags.name'] = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const baseQuery = search ? { $text: { $score: { $meta: 'textScore' } } } : {};
    if (gender) baseQuery.gender = gender;
    if (isActive !== undefined) baseQuery.isActive = isActive;
    if (tag) baseQuery['tags.name'] = tag;

    const [patients, total] = await Promise.all([
      Patient.find(baseQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email')
        .lean(),
      Patient.countDocuments(baseQuery),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id, updateData) {
    return Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Patient.findByIdAndDelete(id);
  }

  async softDelete(id) {
    return Patient.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async restore(id) {
    return Patient.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }

  async addDocument(patientId, documentData) {
    return Patient.findByIdAndUpdate(
      patientId,
      { $push: { documents: documentData } },
      { new: true, runValidators: true }
    );
  }

  async removeDocument(patientId, documentId) {
    return Patient.findByIdAndUpdate(
      patientId,
      { $pull: { documents: { _id: documentId } } },
      { new: true, runValidators: true }
    );
  }

  async addTag(patientId, tag) {
    return Patient.findByIdAndUpdate(
      patientId,
      { $addToSet: { tags: tag } },
      { new: true, runValidators: true }
    );
  }

  async removeTag(patientId, tagName) {
    return Patient.findByIdAndUpdate(
      patientId,
      { $pull: { tags: { name: tagName } } },
      { new: true, runValidators: true }
    );
  }

  async getMedicalHistory(patientId, medicalRecordRepo) {
    if (!medicalRecordRepo) {
      const { medicalRecordRepository } = await import('./index.js');
      medicalRecordRepo = medicalRecordRepository;
    }
    return medicalRecordRepo.findByPatient(patientId);
  }

  async countByGender() {
    return Patient.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getPatientStats() {
    const [total, active, byGender] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ isActive: true }),
      this.countByGender(),
    ]);

    const genderStats = byGender.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive: total - active,
      byGender: genderStats,
    };
  }
}

export const patientRepository = new PatientRepository();
