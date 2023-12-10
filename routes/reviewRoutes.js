const express = require('express');
const review = require('../controllers/reviewController');
const auth = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(auth.protect);

router
  .route('/')
  .post(auth.restrictTo('user'), review.setTourUserIds, review.createReview)
  .get(review.allReviews);

router
  .route('/:id')
  .delete(auth.restrictTo('user', 'admin'), review.deleteReview)
  .patch(auth.restrictTo('user', 'admin'), review.updateReview)
  .get(review.getReview);

module.exports = router;
