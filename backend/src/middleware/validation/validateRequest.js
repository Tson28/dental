import { z } from 'zod';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'body' ? req.body 
        : source === 'query' ? req.query 
        : source === 'params' ? req.params 
        : req.body;
      
      const result = schema.safeParse(dataToValidate);
      
      if (!result.success) {
        const errors = result.error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {});
        
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors,
        });
      }
      
      if (source === 'body') {
        req.validatedBody = result.data;
      } else if (source === 'query') {
        req.validatedQuery = result.data;
      } else if (source === 'params') {
        req.validatedParams = result.data;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
