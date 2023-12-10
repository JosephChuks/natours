const express = require('express');
const tour = require('../controllers/toursController');
const auth = require('../controllers/authController');
const review = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', review);

router.route('/top-5-cheap').get(tour.aliasTopTours, tour.getAllTours);
router.route('/tour-stats').get(tour.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(auth.protect, auth.restrictTo('admin', 'guide'), tour.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tour.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tour.getDistances);

router
  .route('/')
  .post(auth.protect, auth.restrictTo('admin', 'lead-guide'), tour.createTour)
  .get(tour.getAllTours);

router
  .route('/:id')
  .get(tour.getTour)
  .patch(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tour.resizeTourImages,
    tour.updateTour,
  )
  .delete(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tour.deleteTour,
  );

module.exports = router;
