import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bệnh nhân là bắt buộc'],
  },
  
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bác sĩ là bắt buộc'],
  },
  
  recordDate: {
    type: Date,
    default: Date.now,
  },
  
  chiefComplaint: {
    type: String,
    required: [true, 'Lý do khám là bắt buộc'],
    maxlength: [500, 'Lý do khám không được quá 500 ký tự'],
  },
  
  diagnosis: {
    type: String,
    maxlength: [1000, 'Chẩn đoán không được quá 1000 ký tự'],
  },
  
  treatmentPlan: {
    type: String,
    maxlength: [2000, 'Kế hoạch điều trị không được quá 2000 ký tự'],
  },
  
  procedures: [{
    toothNumber: {
      type: String,
      match: [/^[0-9]{2}(-[0-9]{2})*$/, 'Số răng không hợp lệ'],
    },
    procedureName: {
      type: String,
      required: true,
    },
    description: String,
    price: Number,
  }],
  
  medications: [{
    name: {
      type: String,
      required: true,
    },
    dosage: String,
    frequency: String,
    duration: String,
    notes: String,
  }],
  
  allergies: [{
    type: String,
  }],
  
  notes: {
    type: String,
    maxlength: [2000, 'Ghi chú không được quá 2000 ký tự'],
  },
  
  followUpDate: {
    type: Date,
  },
  
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
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

medicalRecordSchema.index({ patient: 1 });
medicalRecordSchema.index({ doctor: 1 });
medicalRecordSchema.index({ recordDate: -1 });
medicalRecordSchema.index({ patient: 1, recordDate: -1 });

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
