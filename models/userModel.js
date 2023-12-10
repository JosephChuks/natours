const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fullname is required'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 5,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation required'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password must be the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //substract 1sec due to delay between creating JWT and updating the DB
  next();
});

userSchema.pre(/^find/, function (next) {
  // /^find/: every query that starts with 'find'
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.validatePassword = async function (pswd, storedPass) {
  return await bcrypt.compare(pswd, storedPass);
};

userSchema.methods.changedPasswordAfter = function (jwtTime) {
  if (this.passwordChangedAt) {
    const seconds = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return jwtTime < seconds;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  //Encrypt token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //(10 * 60 * 1000 == 10mins)

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
