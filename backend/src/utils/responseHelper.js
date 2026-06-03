export const successResponse = (res, data, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const createdResponse = (res, data, message = 'Tạo mới thành công') => {
  return successResponse(res, data, message, 201);
};

export const paginatedResponse = (
  res,
  { data, total, page, limit, totalPages },
  message = 'Lấy dữ liệu thành công'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

export const errorResponse = (res, message = 'Đã xảy ra lỗi', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

export const unauthorizedResponse = (res, message = 'Không có quyền truy cập') => {
  return errorResponse(res, message, 401);
};

export const forbiddenResponse = (res, message = 'Bị cấm truy cập') => {
  return errorResponse(res, message, 403);
};

export const notFoundResponse = (res, message = 'Không tìm thấy tài nguyên') => {
  return errorResponse(res, message, 404);
};

export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
};

export const conflictResponse = (res, message = 'Tài nguyên đã tồn tại') => {
  return errorResponse(res, message, 409);
};

export const tooManyRequestsResponse = (res, message = 'Quá nhiều yêu cầu') => {
  return errorResponse(res, message, 429);
};
