const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const jwtToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

const createSendToken = (user, statusCode, res) => {
  const token = jwtToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //Hide password from output
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  /* const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  }); */
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/account`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });

  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  /*******Autorization************/

  //Check for token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //Validate token
  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to gain access', 401),
    );
  }
  //Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check if user exist
  const checkUser = await User.findById(decoded.id);
  if (!checkUser) {
    return next(new AppError('The user account no longer exists', 401));
  }

  //Check if user changed password after token was generated
  if (checkUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently updated password, please login and try again',
        401,
      ),
    );
  }
  req.user = checkUser;
  res.locals.user = checkUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const checkUser = await User.findById(decoded.id);
      if (!checkUser) {
        return next();
      }
      if (checkUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = checkUser;
      return next();
    } catch (e) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles: ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user with that email address', 404));
  }

  //Generate the random token and save for user
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email, please try again', 500),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token and check token expiraion
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  //Update new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //Update changedPasswordAt property for user
  //Log user in and send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.validatePassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, res);
});
