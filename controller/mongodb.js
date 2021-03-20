const db = require('../model/mongodb.js');
const { transformReviews, populateWithPhotos } = require('../utils/transformReviews.js');
const {
  transformCharacteristics, collectReviewIds,
  populateCharacteristicAverages, populateRatingAverages, populateRecommendedCounts,
} = require('../utils/transformMeta.js');

module.exports.getReviews = async (req, res) => {
  const queryParams = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || 5,
    sort: req.query.sort || 'helpful',
    product_id: Number(req.query.product_id),
  };

  try {
    const queryResults = await db.getReviews(queryParams.product_id, queryParams.count);
    const [reviews, reviewIds] = transformReviews(req.query.product_id, queryResults);
    const photos = await db.getPhotos(reviewIds);
    const payload = populateWithPhotos(photos, reviews);
    res.status(201);
    res.send(payload);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
};

module.exports.getMeta = async (req, res) => {
  const productId = Number(req.query.product_id);
  try {
    const characteristics = await db.getCharacteristics(productId);
    let meta = transformCharacteristics(productId, characteristics);
    let reviews = await db.getReviewIds(productId);
    reviews = collectReviewIds(reviews);
    const characteristicAverages = await db.getAggregatedCharacteristics(reviews);
    meta = populateCharacteristicAverages(meta, characteristics, characteristicAverages);
    const ratingAverages = await db.getAggregatedRatings(reviews);
    meta = populateRatingAverages(meta, ratingAverages);
    const recommendCounts = await db.getAggregatedRecommend(reviews);
    const payload = populateRecommendedCounts(meta, recommendCounts);
    res.status(200).send(payload);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
};

module.exports.addReview = async (req, res) => {
  console.log(req.body.photos);
  try {
    await db.addReview(req.body);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
};
