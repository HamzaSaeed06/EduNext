const { validationResult } = require('express-validator')

/**
 * Runs after express-validator chains.
 * Returns a 400 with all validation errors if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.array().map((e) => e.msg).join('; '),
        fields: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    })
  }
  next()
}

module.exports = validate
