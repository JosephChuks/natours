const express = require('express');
const booking = require('../controllers/bookingController');
const auth = require('../controllers/authController');

const router = express.Router();
router.use(auth.protect);

router.get(
  '/checkout-session/:tourId',
  auth.protect,
  booking.getCheckoutSession,
);

router.use(auth.restrictTo('admin', 'lead-guide'));
router.route('/').get(booking.getAllBookings).post(booking.createBooking);

router
  .route('/:id')
  .get(booking.getBooking)
  .patch(booking.updateBooking)
  .delete(booking.deleteBooking);

module.exports = router;
