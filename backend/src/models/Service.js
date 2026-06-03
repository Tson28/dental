import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên dịch vụ là bắt buộc'],
    trim: true,
    unique: true,
    maxlength: [200, 'Tên dịch vụ không được quá 200 ký tự'],
  },
  
  code: {
    type: String,
    required: [true, 'Mã dịch vụ là bắt buộc'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Mã dịch vụ không được quá 20 ký tự'],
  },
  
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: {
      values: [
        'examination',
        'cleaning',
        'filling',
        'extraction',
        'root_canal',
        'crown',
        'bridge',
        'implant',
        'orthodontics',
        'cosmetic',
        'pediatric',
        'emergency',
        'other',
      ],
      message: 'Danh mục không hợp lệ',
    },
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự'],
  },
  
  price: {
    type: Number,
    required: [true, 'Giá dịch vụ là bắt buộc'],
    min: [0, 'Giá không được âm'],
  },
  
  duration: {
    type: Number,
    required: [true, 'Thời gian thực hiện là bắt buộc'],
    min: [5, 'Thời gian tối thiểu là 5 phút'],
    max: [480, 'Thời gian tối đa là 480 phút'],
    comment: 'Thời gian thực hiện tính bằng phút',
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  isPopular: {
    type: Boolean,
    default: false,
  },
  
  image: {
    type: String,
    default: null,
  },
  
  requiresAnesthesia: {
    type: Boolean,
    default: false,
  },
  
  preparationInstructions: {
    type: String,
    maxlength: [500, 'Hướng dẫn chuẩn bị không được quá 500 ký tự'],
  },
  
  aftercareInstructions: {
    type: String,
    maxlength: [500, 'Hướng dẫn chăm sóc sau không được quá 500 ký tự'],
  },
  
  order: {
    type: Number,
    default: 0,
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

serviceSchema.index({ code: 1 }, { unique: true });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

export const Service = mongoose.model('Service', serviceSchema);
