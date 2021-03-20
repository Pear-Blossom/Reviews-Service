const db = require('../model/mongodb.js');
const { transformReviews, populateWithPhotos } = require('../utils/transformReviews.js');
const {
  transformCharacteristics, collectReviewIds,
  populateCharacteristicAverages, populateRatingAverages, populateRecommendedCounts
} = require('../utils/transformMeta.js');

// module.exports.getReviews = (params) => db.getReviews(params.product_id, params.limit);
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
    // console.log(characteristics);
    let reviews = await db.getReviewIds(productId);
    reviews = collectReviewIds(reviews);
    // console.log(reviews);
    const characteristicAverages = await db.getAggregatedCharacteristics(reviews);
    // console.log(characteristicAverages);
    meta = populateCharacteristicAverages(meta, characteristics, characteristicAverages);
    const ratingAverages = await db.getAggregatedRatings(reviews);
    // console.log(ratingAverages);
    const recommendCounts = await db.getAggregatedRecommend(reviews);
    console.log(recommendCounts);
    console.log(meta);
    res.send(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
};
