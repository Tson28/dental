import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  USER: 'USER',
}

export const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  DOCTOR: 'Bác sĩ',
  USER: 'Người dùng',
}

export const APPOINTMENT_STATUS = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Đang thực hiện', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
}

export const SERVICE_CATEGORIES = {
  examination: 'Khám tổng quát',
  cleaning: 'Vệ sinh răng miệng',
  filling: 'Hàn răng',
  extraction: 'Nhổ răng',
  root_canal: 'Điều trị tủy',
  crown: 'Gắn mão răng',
  bridge: 'Cầu răng',
  implant: 'Cấy ghép implant',
  orthodontics: 'Niềng răng',
  cosmetic: 'Thẩm mỹ nha khoa',
  pediatric: 'Nha khoa trẻ em',
  emergency: 'Cấp cứu',
  other: 'Khác',
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}
