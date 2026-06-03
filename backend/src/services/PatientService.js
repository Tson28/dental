import { patientRepository } from '../repositories/index.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../middleware/errors/index.js';

export class PatientService {
  async getAllPatients(options) {
    return patientRepository.findAll({}, options);
  }

  async getPatientById(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }
    return patient.toPublicJSON();
  }

  async getPatientByCode(code) {
    const patient = await patientRepository.findByCode(code);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }
    return patient.toPublicJSON();
  }

  async createPatient(patientData, userId) {
    if (patientData.phone) {
      const existingPhone = await patientRepository.findByPhone(patientData.phone);
      if (existingPhone) {
        throw new ConflictError('Số điện thoại đã được sử dụng');
      }
    }

    if (patientData.email) {
      const existingEmail = await patientRepository.findByEmail(patientData.email);
      if (existingEmail) {
        throw new ConflictError('Email đã được sử dụng');
      }
    }

    const patient = await patientRepository.create({
      ...patientData,
      createdBy: userId,
    });

    return patient.toPublicJSON();
  }

  async updatePatient(id, updateData, userId) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    if (updateData.phone && updateData.phone !== patient.phone) {
      const existingPhone = await patientRepository.findByPhone(updateData.phone);
      if (existingPhone) {
        throw new ConflictError('Số điện thoại đã được sử dụng');
      }
    }

    if (updateData.email && updateData.email !== patient.email) {
      const existingEmail = await patientRepository.findByEmail(updateData.email);
      if (existingEmail) {
        throw new ConflictError('Email đã được sử dụng');
      }
    }

    const updated = await patientRepository.update(id, {
      ...updateData,
      updatedBy: userId,
    });

    return updated.toPublicJSON();
  }

  async deletePatient(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    await patientRepository.softDelete(id);
    return { message: 'Xóa bệnh nhân thành công' };
  }

  async restorePatient(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    const restored = await patientRepository.restore(id);
    return restored.toPublicJSON();
  }

  async addDocument(patientId, documentData, userId) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    const updated = await patientRepository.addDocument(patientId, {
      ...documentData,
      uploadedBy: userId,
    });

    return updated.documents[updated.documents.length - 1];
  }

  async removeDocument(patientId, documentId) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    const updated = await patientRepository.removeDocument(patientId, documentId);
    return { message: 'Xóa tài liệu thành công' };
  }

  async addTag(patientId, tag) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    const existingTag = patient.tags.find(t => t.name === tag.name);
    if (existingTag) {
      throw new ConflictError('Tag đã tồn tại');
    }

    const updated = await patientRepository.addTag(patientId, tag);
    return updated.tags[updated.tags.length - 1];
  }

  async removeTag(patientId, tagName) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    await patientRepository.removeTag(patientId, tagName);
    return { message: 'Xóa tag thành công' };
  }

  async getMedicalHistory(patientId) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Bệnh nhân không tồn tại');
    }

    return patientRepository.getMedicalHistory(patientId);
  }

  async getPatientStats() {
    return patientRepository.getPatientStats();
  }
}

export const patientService = new PatientService();
