import { patientService } from '../services/index.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/responseHelper.js';

export class PatientController {
  async getAllPatients(req, res, next) {
    try {
      const options = {
        page: req.validatedQuery.page,
        limit: req.validatedQuery.limit,
        search: req.validatedQuery.search,
        gender: req.validatedQuery.gender,
        isActive: req.validatedQuery.isActive,
        tag: req.validatedQuery.tag,
        sortBy: req.validatedQuery.sortBy,
        sortOrder: req.validatedQuery.sortOrder,
      };

      const result = await patientService.getAllPatients(options);

      return paginatedResponse(res, {
        data: result.patients,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }, 'Lấy danh sách bệnh nhân thành công');
    } catch (error) {
      next(error);
    }
  }

  async getPatientById(req, res, next) {
    try {
      const { id } = req.params;
      const patient = await patientService.getPatientById(id);
      return successResponse(res, patient);
    } catch (error) {
      next(error);
    }
  }

  async getPatientByCode(req, res, next) {
    try {
      const { code } = req.params;
      const patient = await patientService.getPatientByCode(code);
      return successResponse(res, patient);
    } catch (error) {
      next(error);
    }
  }

  async createPatient(req, res, next) {
    try {
      const patientData = req.validatedBody;
      const userId = req.userId;

      const patient = await patientService.createPatient(patientData, userId);
      return createdResponse(res, patient, 'Tạo bệnh nhân thành công');
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      const userId = req.userId;

      const patient = await patientService.updatePatient(id, updateData, userId);
      return successResponse(res, patient, 'Cập nhật bệnh nhân thành công');
    } catch (error) {
      next(error);
    }
  }

  async deletePatient(req, res, next) {
    try {
      const { id } = req.params;
      const result = await patientService.deletePatient(id);
      return successResponse(res, result, 'Xóa bệnh nhân thành công');
    } catch (error) {
      next(error);
    }
  }

  async restorePatient(req, res, next) {
    try {
      const { id } = req.params;
      const patient = await patientService.restorePatient(id);
      return successResponse(res, patient, 'Khôi phục bệnh nhân thành công');
    } catch (error) {
      next(error);
    }
  }

  async addDocument(req, res, next) {
    try {
      const { id } = req.params;
      const documentData = req.validatedBody;
      const userId = req.userId;

      const document = await patientService.addDocument(id, documentData, userId);
      return createdResponse(res, document, 'Thêm tài liệu thành công');
    } catch (error) {
      next(error);
    }
  }

  async removeDocument(req, res, next) {
    try {
      const { id, documentId } = req.params;
      const result = await patientService.removeDocument(id, documentId);
      return successResponse(res, result, 'Xóa tài liệu thành công');
    } catch (error) {
      next(error);
    }
  }

  async addTag(req, res, next) {
    try {
      const { id } = req.params;
      const tag = req.validatedBody;
      const tagResult = await patientService.addTag(id, tag);
      return createdResponse(res, tagResult, 'Thêm tag thành công');
    } catch (error) {
      next(error);
    }
  }

  async removeTag(req, res, next) {
    try {
      const { id, tagName } = req.params;
      const result = await patientService.removeTag(id, decodeURIComponent(tagName));
      return successResponse(res, result, 'Xóa tag thành công');
    } catch (error) {
      next(error);
    }
  }

  async getMedicalHistory(req, res, next) {
    try {
      const { id } = req.params;
      const history = await patientService.getMedicalHistory(id);
      return successResponse(res, history, 'Lấy lịch sử y tế thành công');
    } catch (error) {
      next(error);
    }
  }

  async getPatientStats(req, res, next) {
    try {
      const stats = await patientService.getPatientStats();
      return successResponse(res, stats, 'Lấy thống kê bệnh nhân thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
