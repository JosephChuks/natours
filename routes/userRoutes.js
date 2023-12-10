/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const user = require('../controllers/userController');
const auth = require('../controllers/authController');

const router = express.Router();

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/logout', auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.patch('/reset-password/:token', auth.resetPassword);

router.use(auth.protect); //adds protect to all routes that comes after it

router.get('/profile', user.myProfile, user.getUser);
router.patch('/update-password', auth.updatePassword);
router.patch(
  '/update-profile',
  user.uploadUserPhoto,
  user.resizeUserPhoto,
  user.updateProfile,
);
router.delete('/delete-profile', user.deleteProfile);

router.use(auth.restrictTo('admin')); // Only admin will perform the below actions

router.route('/').get(user.allUsers);
router
  .route('/:id')
  .get(user.getUser)
  .patch(user.updateUser)
  .delete(user.deleteUser);

module.exports = router;
