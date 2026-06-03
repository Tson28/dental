import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(255, 'Email không được quá 255 ký tự')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
  
  confirmPassword: z
    .string()
    .optional(),
  
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .trim(),
  
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),
  
  role: z
    .enum(['ADMIN', 'DOCTOR', 'USER'])
    .optional()
    .default('USER'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Mật khẩu hiện tại là bắt buộc'),
  
  newPassword: z
    .string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu mới không được quá 100 ký tự')
    .refine(
      (val, ctx) => val !== ctx.original?.currentPassword,
      'Mật khẩu mới không được trùng với mật khẩu cũ'
    ),
  
  confirmNewPassword: z
    .string()
    .min(1, 'Xác nhận mật khẩu mới là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token là bắt buộc'),
  newPassword: z
    .string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu mới không được quá 100 ký tự'),
  confirmNewPassword: z
    .string()
    .min(1, 'Xác nhận mật khẩu mới là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .optional(),
  
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),
  
  dateOfBirth: z
    .string()
    .datetime()
    .optional()
    .nullable(),
  
  gender: z
    .enum(['male', 'female', 'other'])
    .optional()
    .nullable(),
  
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    ward: z.string().max(100).optional(),
  }).optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'DOCTOR', 'USER']).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'fullName', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID người dùng không hợp lệ'),
});

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .optional(),
  
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),
  
  role: z
    .enum(['ADMIN', 'DOCTOR', 'USER'])
    .optional(),
  
  isActive: z.boolean().optional(),
  
  isVerified: z.boolean().optional(),
});

// Patient schemas
export const createPatientSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .trim(),

  dateOfBirth: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  gender: z
    .enum(['male', 'female', 'other'])
    .optional()
    .nullable(),

  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),

  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\S+@\S+\.\S+$/.test(val),
      'Email không hợp lệ'
    ),

  address: z.object({
    street: z.string().max(200).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    district: z.string().max(100).optional().nullable(),
    ward: z.string().max(100).optional().nullable(),
  }).optional().nullable(),

  emergencyContact: z.object({
    name: z.string().max(100).optional().nullable(),
    phone: z.string().optional().nullable()
      .refine((val) => !val || /^[0-9]{10,11}$/.test(val), 'Số điện thoại không hợp lệ'),
    relationship: z.string().max(50).optional().nullable(),
  }).optional().nullable(),

  insuranceNumber: z
    .string()
    .max(50)
    .optional()
    .nullable(),

  bloodType: z
    .enum(['A', 'B', 'AB', 'O', 'unknown'])
    .optional()
    .default('unknown'),

  allergies: z.array(z.string().max(200)).optional().default([]),

  notes: z
    .string()
    .max(1000)
    .optional()
    .nullable(),

  tags: z.array(z.object({
    name: z.string().min(1).max(50).trim(),
    color: z.string().default('default'),
  })).optional().default([]),
});

export const updatePatientSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .optional()
    .nullable(),

  dateOfBirth: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  gender: z
    .enum(['male', 'female', 'other'])
    .optional()
    .nullable(),

  phone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),

  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .nullable(),

  address: z.object({
    street: z.string().max(200).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    district: z.string().max(100).optional().nullable(),
    ward: z.string().max(100).optional().nullable(),
  }).optional().nullable(),

  emergencyContact: z.object({
    name: z.string().max(100).optional().nullable(),
    phone: z.string().optional().nullable()
      .refine((val) => !val || /^[0-9]{10,11}$/.test(val), 'Số điện thoại không hợp lệ'),
    relationship: z.string().max(50).optional().nullable(),
  }).optional().nullable(),

  insuranceNumber: z
    .string()
    .max(50)
    .optional()
    .nullable(),

  bloodType: z
    .enum(['A', 'B', 'AB', 'O', 'unknown'])
    .optional()
    .nullable(),

  allergies: z.array(z.string().max(200)).optional(),

  notes: z
    .string()
    .max(1000)
    .optional()
    .nullable(),

  tags: z.array(z.object({
    name: z.string().min(1).max(50).trim(),
    color: z.string().default('default'),
  })).optional(),
});

export const patientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  isActive: z.coerce.boolean().optional(),
  tag: z.string().optional(),
  sortBy: z.enum(['createdAt', 'fullName', 'dateOfBirth']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const patientIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bệnh nhân không hợp lệ'),
});

export const addDocumentSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên tài liệu là bắt buộc')
    .max(200, 'Tên tài liệu không được quá 200 ký tự')
    .trim(),

  type: z
    .string()
    .min(1, 'Loại tài liệu là bắt buộc')
    .max(100, 'Loại tài liệu không được quá 100 ký tự'),

  url: z
    .string()
    .min(1, 'Đường dẫn tài liệu là bắt buộc')
    .url('Đường dẫn không hợp lệ'),

  size: z.number().min(0).optional().default(0),
});

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên tag là bắt buộc')
    .max(50, 'Tag không được quá 50 ký tự')
    .trim(),

  color: z.string().default('default'),
});
