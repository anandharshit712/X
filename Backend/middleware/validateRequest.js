// middleware/validateRequest.js
// Works with either Zod (safeParse) or Joi (validate)
function runSchema(schema, data) {
  // Zod
  if (schema && typeof schema.safeParse === "function") {
    const result = schema.safeParse(data);
    if (!result.success) {
      const zodErr = new Error("Validation failed");
      zodErr.issues = result.error.issues; // handled by errorHandler
      zodErr.badRequest = true;
      throw zodErr;
    }
    return result.data;
  }
  // Joi
  if (schema && typeof schema.validate === "function") {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      error.isJoi = true; // handled by errorHandler
      error.badRequest = true;
      throw error;
    }
    return value;
  }
  // No schema provided – pass through
  return data;
}

function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = runSchema(schema, req.body);
      next();
    } catch (e) {
      next(e);
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.validatedQuery = runSchema(schema, req.query);
      next();
    } catch (e) {
      next(e);
    }
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.validatedParams = runSchema(schema, req.params);
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
