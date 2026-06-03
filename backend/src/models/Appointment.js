import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bệnh nhân là bắt buộc'],
  },
  
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bác sĩ là bắt buộc'],
  },
  
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Dịch vụ là bắt buộc'],
  },
  
  appointmentDate: {
    type: Date,
    required: [true, 'Ngày hẹn là bắt buộc'],
  },
  
  appointmentTime: {
    type: String,
    required: [true, 'Giờ hẹn là bắt buộc'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ hẹn không hợp lệ (định dạng: HH:MM)'],
  },
  
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      message: 'Trạng thái không hợp lệ',
    },
    default: 'pending',
  },
  
  reason: {
    type: String,
    maxlength: [500, 'Lý do không được quá 500 ký tự'],
  },
  
  notes: {
    type: String,
    maxlength: [1000, 'Ghi chú không được quá 1000 ký tự'],
  },
  
  diagnosis: {
    type: String,
    maxlength: [1000, 'Chẩn đoán không được quá 1000 ký tự'],
  },
  
  treatment: {
    type: String,
    maxlength: [1000, 'Phương pháp điều trị không được quá 1000 ký tự'],
  },
  
  totalPrice: {
    type: Number,
    min: [0, 'Giá không được âm'],
  },
  
  isPaid: {
    type: Boolean,
    default: false,
  },
  
  cancellationReason: {
    type: String,
    maxlength: [500, 'Lý do hủy không được quá 500 ký tự'],
  },
  
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  cancelledAt: {
    type: Date,
  },
  
  completedAt: {
    type: Date,
  },
  
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
