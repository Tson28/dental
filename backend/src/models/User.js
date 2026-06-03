import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/index.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
  },
  
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false,
  },
  
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'DOCTOR', 'USER'],
      message: 'Vai trò không hợp lệ',
    },
    default: 'USER',
  },
  
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Họ tên phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Họ tên không được quá 100 ký tự'],
  },
  
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
  },
  
  dateOfBirth: {
    type: Date,
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  
  address: {
    street: String,
    city: String,
    district: String,
    ward: String,
  },
  
  avatar: {
    type: String,
    default: null,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  lastLogin: {
    type: Date,
  },
  
  refreshToken: {
    type: String,
    select: false,
  },
  
  refreshTokenExpires: {
    type: Date,
    select: false,
  },
  
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.refreshTokenExpires;
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  return this.toJSON();
};

export const User = mongoose.model('User', userSchema);
