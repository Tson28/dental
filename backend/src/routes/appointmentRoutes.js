import { Router } from 'express';
import { appointmentController } from '../controllers/index.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation/index.js';
import { authenticate, authorize, isAdminOrDoctor } from '../middleware/auth/index.js';
import { z } from 'zod';

const router = Router();

const createAppointmentSchema = z.object({
  patient: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bệnh nhân không hợp lệ'),
  doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bác sĩ không hợp lệ'),
  service: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID dịch vụ không hợp lệ'),
  appointmentDate: z.string().datetime({ message: 'Ngày hẹn không hợp lệ' }),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ hẹn không hợp lệ'),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

const updateAppointmentSchema = z.object({
  doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bác sĩ không hợp lệ').optional(),
  service: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID dịch vụ không hợp lệ').optional(),
  appointmentDate: z.string().datetime({ message: 'Ngày hẹn không hợp lệ' }).optional(),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ hẹn không hợp lệ').optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  diagnosis: z.string().max(1000).optional(),
  treatment: z.string().max(1000).optional(),
  totalPrice: z.number().min(0).optional(),
  isPaid: z.boolean().optional(),
});

const appointmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['appointmentDate', 'createdAt']).optional().default('appointmentDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const appointmentIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID lịch hẹn không hợp lệ'),
});

router.get(
  '/',
  authenticate,
  validateQuery(appointmentQuerySchema),
  appointmentController.getAppointments.bind(appointmentController)
);

router.get(
  '/stats',
  authenticate,
  appointmentController.getAppointmentStats.bind(appointmentController)
);

router.get(
  '/doctor/:doctorId',
  authenticate,
  appointmentController.getUpcomingForDoctor.bind(appointmentController)
);

router.get(
  '/doctor-appointments',
  authenticate,
  appointmentController.getDoctorAppointments.bind(appointmentController)
);

router.get(
  '/:id',
  authenticate,
  validateParams(appointmentIdSchema),
  appointmentController.getAppointmentById.bind(appointmentController)
);

router.post(
  '/',
  authenticate,
  validateBody(createAppointmentSchema),
  appointmentController.createAppointment.bind(appointmentController)
);

router.put(
  '/:id',
  authenticate,
  validateParams(appointmentIdSchema),
  validateBody(updateAppointmentSchema),
  appointmentController.updateAppointment.bind(appointmentController)
);

router.patch(
  '/:id/cancel',
  authenticate,
  validateParams(appointmentIdSchema),
  appointmentController.cancelAppointment.bind(appointmentController)
);

router.patch(
  '/:id/status',
  authenticate,
  isAdminOrDoctor,
  validateParams(appointmentIdSchema),
  appointmentController.updateStatus.bind(appointmentController)
);

export default router;
