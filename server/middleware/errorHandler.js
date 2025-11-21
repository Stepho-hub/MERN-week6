export function errorHandler(err, req, res, next) {
  // Log error details
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error(`Request: ${req.method} ${req.url} - IP: ${req.ip}`);

  // Determine status code
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // In development, include stack trace
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const errorResponse = {
    error: message,
    ...(isDevelopment && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
}