import { Router } from 'express';
import { patientController } from '../controllers/index.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation/index.js';
import { authenticate, authorize } from '../middleware/auth/index.js';
import {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
  patientIdSchema,
  addDocumentSchema,
  tagSchema,
} from '../utils/validationSchemas.js';

const router = Router();

router.get(
  '/',
  authenticate,
  validateQuery(patientQuerySchema),
  patientController.getAllPatients.bind(patientController)
);

router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN', 'DOCTOR']),
  patientController.getPatientStats.bind(patientController)
);

router.get(
  '/:id',
  authenticate,
  validateParams(patientIdSchema),
  patientController.getPatientById.bind(patientController)
);

router.get(
  '/code/:code',
  authenticate,
  patientController.getPatientByCode.bind(patientController)
);

router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'DOCTOR', 'USER']),
  validateBody(createPatientSchema),
  patientController.createPatient.bind(patientController)
);

router.put(
  '/:id',
  authenticate,
  validateParams(patientIdSchema),
  validateBody(updatePatientSchema),
  patientController.updatePatient.bind(patientController)
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'DOCTOR']),
  validateParams(patientIdSchema),
  patientController.deletePatient.bind(patientController)
);

router.patch(
  '/:id/restore',
  authenticate,
  authorize(['ADMIN']),
  validateParams(patientIdSchema),
  patientController.restorePatient.bind(patientController)
);

router.post(
  '/:id/documents',
  authenticate,
  authorize(['ADMIN', 'DOCTOR']),
  validateParams(patientIdSchema),
  validateBody(addDocumentSchema),
  patientController.addDocument.bind(patientController)
);

router.delete(
  '/:id/documents/:documentId',
  authenticate,
  authorize(['ADMIN', 'DOCTOR']),
  validateParams(patientIdSchema),
  patientController.removeDocument.bind(patientController)
);

router.post(
  '/:id/tags',
  authenticate,
  authorize(['ADMIN', 'DOCTOR']),
  validateParams(patientIdSchema),
  validateBody(tagSchema),
  patientController.addTag.bind(patientController)
);

router.delete(
  '/:id/tags/:tagName',
  authenticate,
  authorize(['ADMIN', 'DOCTOR']),
  validateParams(patientIdSchema),
  patientController.removeTag.bind(patientController)
);

router.get(
  '/:id/medical-history',
  authenticate,
  validateParams(patientIdSchema),
  patientController.getMedicalHistory.bind(patientController)
);

export default router;
