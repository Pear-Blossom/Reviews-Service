const mongoose = require('../db/mongodb.js');

mongoose.set('useFindAndModify', false);

const reviewsSchema = mongoose.Schema({
  review_id: Number,
  product_id: Number,
  rating: Number,
  summary: String,
  recommend: Boolean,
  reported: Boolean,
  response: String,
  body: String,
  date: Date,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number,
});

const reviewsPhotosSchema = mongoose.Schema({
  id: Number,
  review_id: Number,
  url: String,
});

const characteristicsSchema = mongoose.Schema({
  id: Number,
  product_id: Number,
  name: String,
});

const characteristicReviewsSchema = mongoose.Schema({
  id: Number,
  characteristic_id: Number,
  review_id: Number,
  value: Number,
});

const countersSchema = mongoose.Schema({
  seqName: String,
  value: Number,
});

const Reviews = mongoose.model('reviews', reviewsSchema);
const ReviewsPhotos = mongoose.model('reviews_photos', reviewsPhotosSchema);
const Characteristics = mongoose.model('characteristics', characteristicsSchema);
const CharacteristicReviews = mongoose.model('characteristic_reviews', characteristicReviewsSchema);
const Counters = mongoose.model('counters', countersSchema);

const getReviews = (productId, limit) => Reviews.find({ product_id: productId })
  .select({ _id: 0, product_id: 0, date: 0 })
  .limit(limit)
  .lean();

const getPhotos = (reviewIds) => ReviewsPhotos.find({ review_id: { $in: reviewIds } })
  .select({ _id: 0 })
  .lean();

const getCharacteristics = (productId) => Characteristics.find({ product_id: productId })
  .select({ _id: 0 })
  .lean();

const getReviewIds = (productId) => Reviews.find({ product_id: productId })
  .select({ _id: 0, review_id: 1 })
  .lean();

const getAggregatedCharacteristics = (reviewIds) => CharacteristicReviews
  .aggregate([
    { $match: { review_id: { $in: reviewIds } } },
    { $group: { _id: '$characteristic_id', avg: { $avg: '$value' } } },
  ]);

const getAggregatedRatings = (reviewIds) => Reviews
  .aggregate([
    { $match: { review_id: { $in: reviewIds } } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

const getAggregatedRecommend = (reviewIds) => Reviews
  .aggregate([
    { $match: { review_id: { $in: reviewIds } } },
    {
      $group: {
        _id: null,
        recommendCount: {
          $sum: {
            $cond: [
              {
                $eq: [true, '$recommend'],
              }, 1, 0,
            ],
          },
        },
        notRecommendCount: {
          $sum: {
            $cond: [
              {
                $eq: [false, '$recommend'],
              }, 1, 0,
            ],
          },
        },
      },
    },
  ]);

const getNextId = (field) => Counters
  .findOneAndUpdate(
    { seqName: field },
    { $inc: { value: 1 } },
    { new: true, lean: true },
  );

const addReview = (bodyParams) => {
  let newReviewId;
  getNextId('review_id')
    .then((reviewCounter) => {
      newReviewId = reviewCounter.value;
      console.log(bodyParams.recommend);
      return Reviews.create({
        review_id: newReviewId,
        product_id: Number(bodyParams.product_id),
        rating: Number(bodyParams.rating),
        summary: bodyParams.summary,
        recommend: bodyParams.recommend,
        reported: false,
        body: bodyParams.body,
        date: new Date(),
        reviewer_name: bodyParams.name,
        reviewer_email: bodyParams.email,
        helpfulness: 0,
      });
    })
    .then(() => {
      const photoInserts = [];
      if (bodyParams.photos && bodyParams.photos.length > 0) {
        bodyParams.photos.forEach((photo) => {
          photoInserts.push(getNextId('review_photos_id')
            .then((reviewPhotoCounter) => {
              const newPhotoId = reviewPhotoCounter.value;
              return ReviewsPhotos.create({
                id: newPhotoId,
                review_id: newReviewId,
                url: photo,
              });
            }));
        });
      }
      return Promise.all(photoInserts);
    })
    .then(() => {
      const chracteristicInserts = [];
      Object.entries(bodyParams.characteristics).forEach((characteristic) => {
        chracteristicInserts.push(getNextId('characteristic_reviews_id')
          .then((characteristicReviewsCounter) => {
            const newCharReviewId = characteristicReviewsCounter.value;
            return CharacteristicReviews.create({
              id: newCharReviewId,
              characteristic_id: Number(characteristic[0]),
              review_id: newReviewId,
              value: characteristic[1],
            });
          }));
      });
      return Promise.all(chracteristicInserts);
    });
};

const markHelpful = (reviewId) => Reviews.findOneAndUpdate(
  { review_id: reviewId },
  { $inc: { helpfulness: 1 } },
);

const markReported = (reviewId) => Reviews.findOneAndUpdate(
  { review_id: reviewId },
  { $set: { reported: true } },
);

module.exports.getReviews = getReviews;
module.exports.getPhotos = getPhotos;
module.exports.getCharacteristics = getCharacteristics;
module.exports.getReviewIds = getReviewIds;
module.exports.getAggregatedCharacteristics = getAggregatedCharacteristics;
module.exports.getAggregatedRatings = getAggregatedRatings;
module.exports.getAggregatedRecommend = getAggregatedRecommend;
module.exports.addReview = addReview;
module.exports.markHelpful = markHelpful;
module.exports.markReported = markReported;
