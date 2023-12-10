const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.overview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('index', {
    title: 'All Tours',
    tours,
  });
});

exports.tour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    fileds: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  const descriptions = tour.description.split('\n');

  res
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests; worker-src 'self' blob:",
    )
    .status(200)
    .render('tour', {
      title: `${tour.name} Tour`,
      locationsJSON: JSON.stringify(tour.locations),
      tour,
      descriptions,
    });
});

exports.login = catchAsync(async (req, res, next) => {
  res
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests; worker-src 'self' blob:",
    )
    .status(200)
    .render('login', {
      title: 'Login',
    });
});

exports.account = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'User Dashboard',
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings
  const bookings = await Booking.find({
    user: req.user.id,
  });

  // Find tours with returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({
    _id: { $in: tourIDs },
  });

  res.status(200).render('index', {
    title: 'My Tours',
    tours,
  });
});
