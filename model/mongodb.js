const mongoose = require('../db/mongodb.js');

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

const Reviews = mongoose.model('reviews', reviewsSchema);

const getReviews = (productId, limit) => Reviews.find({ product_id: productId })
  .select({ _id: 0, product_id: 0, date: 0 })
  .limit(limit)
  .lean();

const reviewsPhotosSchema = mongoose.Schema({
  id: Number,
  review_id: Number,
  url: String,
});

const ReviewsPhotos = mongoose.model('reviews_photos', reviewsPhotosSchema);

const getPhotos = (reviewIds) => ReviewsPhotos.find({ review_id: { $in: reviewIds } })
  .select({ _id: 0 })
  .lean();

const characteristicsSchema = mongoose.Schema({
  id: Number,
  product_id: Number,
  name: String,
});

const Characteristics = mongoose.model('characteristics', characteristicsSchema);

const getCharacteristics = (productId) => Characteristics.find({ product_id: productId })
  .select({ _id: 0 })
  .lean();

const getReviewIds = (productId) => Reviews.find({ product_id: productId })
  .select({ _id: 0, review_id: 1 })
  .lean();

const characteristicReviewsSchema = mongoose.Schema({
  id: Number,
  characteristic_id: Number,
  review_id: Number,
  value: Number,
});

const CharacteristicReviews = mongoose.model('characteristic_reviews', characteristicReviewsSchema);

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

module.exports.getReviews = getReviews;
module.exports.getPhotos = getPhotos;
module.exports.getCharacteristics = getCharacteristics;
module.exports.getReviewIds = getReviewIds;
module.exports.getAggregatedCharacteristics = getAggregatedCharacteristics;
module.exports.getAggregatedRatings = getAggregatedRatings;
module.exports.getAggregatedRecommend = getAggregatedRecommend;
