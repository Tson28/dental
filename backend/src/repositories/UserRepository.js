import { User } from '../models/index.js';

export class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findById(id, selectFields = '') {
    return User.findById(id).select(selectFields);
  }

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query;
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async softDelete(id) {
    return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async updateRefreshToken(userId, refreshToken, expiresAt) {
    return User.findByIdAndUpdate(
      userId,
      {
        refreshToken,
        refreshTokenExpires: expiresAt,
      },
      { new: true }
    );
  }

  async clearRefreshToken(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        $unset: { refreshToken: 1, refreshTokenExpires: 1 },
      },
      { new: true }
    );
  }

  async findByRefreshToken(token) {
    return User.findOne({ refreshToken: token })
      .select('+refreshToken +refreshTokenExpires');
  }

  async updateLastLogin(userId) {
    return User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async countByRole() {
    return User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async existsByEmail(email) {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  async getDoctors() {
    return User.find({ role: 'DOCTOR', isActive: true })
      .select('fullName email phone')
      .lean();
  }
}

export const userRepository = new UserRepository();
