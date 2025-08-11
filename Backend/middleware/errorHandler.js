// middleware/errorHandler.js
// Centralized error handler. Put at the BOTTOM of server.js after all routes.
function errorHandler(err, req, res, next) {
  // Already sent?
  if (res.headersSent) return next(err);

  // Default status & payload
  let status = err.status || err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Something went wrong";
  let details;

  // Zod error (safeParse)
  if (err?.issues && Array.isArray(err.issues)) {
    status = 400;
    code = "VALIDATION_ERROR";
    details = err.issues.map((i) => ({
      path: Array.isArray(i.path) ? i.path.join(".") : String(i.path || ""),
      message: i.message,
    }));
  }

  // Joi error
  if (err?.isJoi) {
    status = 400;
    code = "VALIDATION_ERROR";
    details = err.details?.map((d) => ({
      path: d.path?.join("."),
      message: d.message,
    }));
  }

  // JSON parse error from express.json()
  if (err?.type === "entity.parse.failed") {
    status = 400;
    code = "BAD_JSON";
    message = "Invalid JSON payload";
  }

  // Postgres errors (pg)
  if (err?.code && typeof err.code === "string" && err?.routine) {
    // Common PG codes
    switch (err.code) {
      case "23505": // unique_violation
        status = 409;
        code = "UNIQUE_CONSTRAINT";
        break;
      case "23503": // foreign_key_violation
        status = 409;
        code = "FK_CONSTRAINT";
        break;
      case "22P02": // invalid_text_representation
        status = 400;
        code = "INVALID_INPUT_SYNTAX";
        break;
      default:
        // keep defaults
        break;
    }
    details = {
      pgCode: err.code,
      table: err.table,
      constraint: err.constraint,
      detail: err.detail,
      hint: err.hint,
    };
  }

  // Fallback to 400 for obvious client mistakes if flagged
  if (err?.badRequest && status === 500) status = 400;

  // Consistent JSON
  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      // Optional trace in dev
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    },
  });
}

module.exports = { errorHandler };
