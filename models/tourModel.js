const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'Maximum length is 40 characters'],
      minlength: [10, 'Minimum length is 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain alphabets'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' Works only on create()
          return val < this.price;
        },
        message: 'Discount must be less than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //Hide created at
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //geoJSON for geo data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], //implmenting referencing
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* tourSchema.index({ price: 1 }); */
tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create() only
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* Implementing Embedding */
/* tourSchema.pre('save', async function (next) {
  const guidesPromise = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromise);
  next();
}); */

/* tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
}); */

//QUERY MIDDLEWARE
// /^find/ finds all queries that starts with 'find'
tourSchema.pre(/^find/, function (next) {
  //tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} ms!`);
  //console.log(doc);
  next();
});

//AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
}); */

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
