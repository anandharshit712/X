// middleware/asyncHandler.js
// Wrap async controllers to auto-forward errors to errorHandler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { asyncHandler };
