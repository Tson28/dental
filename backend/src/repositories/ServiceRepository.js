import { Service } from '../models/index.js';

export class ServiceRepository {
  async create(serviceData) {
    const service = new Service(serviceData);
    return service.save();
  }

  async findById(id) {
    return Service.findById(id);
  }

  async findByCode(code) {
    return Service.findOne({ code: code.toUpperCase() });
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      isActive = true,
      search,
      sortBy = 'order',
      sortOrder = 'asc',
    } = options;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [services, total] = await Promise.all([
      Service.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query),
    ]);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id, updateData) {
    return Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Service.findByIdAndDelete(id);
  }

  async getAllActive() {
    return Service.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
  }

  async getByCategory(category) {
    return Service.find({ category, isActive: true })
      .sort({ order: 1 })
      .lean();
  }

  async getPopular(limit = 5) {
    return Service.find({ isActive: true, isPopular: true })
      .sort({ order: 1 })
      .limit(limit)
      .lean();
  }

  async existsByCode(code) {
    const count = await Service.countDocuments({ code: code.toUpperCase() });
    return count > 0;
  }

  async countByCategory() {
    return Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async reorder(ids) {
    const updates = ids.map((id, index) =>
      Service.findByIdAndUpdate(id, { order: index })
    );
    return Promise.all(updates);
  }
}

export const serviceRepository = new ServiceRepository();
