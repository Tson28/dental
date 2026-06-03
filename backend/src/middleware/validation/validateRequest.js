import { z } from 'zod';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'body' ? req.body
        : source === 'query' ? req.query
        : source === 'params' ? req.params
        : req.body;

      console.log(`[VALIDATION] ${req.method} ${req.originalUrl}`);
      console.log('[VALIDATION] Data received:', JSON.stringify(dataToValidate));

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = result.error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {});

        console.log('[VALIDATION] FAILED - Errors:', JSON.stringify(errors, null, 2));

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

      console.log('[VALIDATION] PASSED - Validated data:', JSON.stringify(result.data));
      next();
    } catch (error) {
      console.error('[VALIDATION] Unexpected error:', error);
      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
