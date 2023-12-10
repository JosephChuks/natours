/* eslint-disable no-lonely-if */
const sendError = (res, message, code) =>
  res.status(code).render('error', {
    title: 'Something went wrong',
    message: message,
    errorCode: code,
  });

const devError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message,
    errorCode: err.statusCode,
  });
};

const prodError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      //error: err,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
      errorCode: err.statusCode,
    });
  }

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later',
    errorCode: err.statusCode,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devError(err, req, res);
  }

  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      sendError(req, res, `Invalid ${err.path}: ${err.value}`, 400);
    }

    if (err.name === 'JsonWebTokenError') {
      sendError(req, res, 'Invalid Token, please login again', 401);
    }
    if (err.name === 'TokenExpiredError') {
      sendError(req, res, 'Your Token has expired, please login again', 401);
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((el) => el.message);
      const message = `Invalid input data. ${errors.join('. ')}`;
      sendError(req, res, message, 400);
    }

    if (err.code === 11000) {
      sendError(
        req,
        res,
        `Duplicate field value: (${err.keyValue.name}). Please use another value`,
        400,
      );
    }
    prodError(err, req, res);
  }
};
