import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên tài liệu là bắt buộc'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Loại tài liệu là bắt buộc'],
  },
  url: {
    type: String,
    required: [true, 'Đường dẫn tài liệu là bắt buộc'],
  },
  size: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Tag không được quá 50 ký tự'],
  },
  color: {
    type: String,
    default: 'default',
  },
});

const patientSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    trim: true,
    index: true,
  },

  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Họ tên phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Họ tên không được quá 100 ký tự'],
  },

  dateOfBirth: {
    type: Date,
  },

  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Giới tính không hợp lệ',
    },
  },

  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
  },

  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Địa chỉ không được quá 200 ký tự'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'Thành phố không được quá 100 ký tự'],
    },
    district: {
      type: String,
      trim: true,
      maxlength: [100, 'Quận/Huyện không được quá 100 ký tự'],
    },
    ward: {
      type: String,
      trim: true,
      maxlength: [100, 'Phường/Xã không được quá 100 ký tự'],
    },
  },

  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Tên người liên hệ không được quá 100 ký tự'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Mối quan hệ không được quá 50 ký tự'],
    },
  },

  insuranceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Số bảo hiểm không được quá 50 ký tự'],
  },

  bloodType: {
    type: String,
    enum: ['A', 'B', 'AB', 'O', 'unknown'],
    default: 'unknown',
  },

  allergies: [{
    type: String,
    trim: true,
    maxlength: [200, 'Dị ứng không được quá 200 ký tự'],
  }],

  notes: {
    type: String,
    maxlength: [1000, 'Ghi chú không được quá 1000 ký tự'],
  },

  tags: [tagSchema],

  documents: [documentSchema],

  isActive: {
    type: Boolean,
    default: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

patientSchema.index({ fullName: 'text', phone: 'text', code: 'text' });
patientSchema.index({ isActive: 1 });
patientSchema.index({ createdBy: 1 });

patientSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.model('Patient').countDocuments();
    this.code = `BN${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

patientSchema.methods.toPublicJSON = function() {
  return this.toJSON();
};

export const Patient = mongoose.model('Patient', patientSchema);
