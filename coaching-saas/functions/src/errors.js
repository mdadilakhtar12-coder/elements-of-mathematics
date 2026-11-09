'use strict';
/** An error that is safe to show to the user. `code` is a Firebase HttpsError code. */
class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
module.exports = { AppError };
