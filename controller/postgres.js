const { poolReviews, poolCharacteristics } = require('../db/postgres.js');
const {
  getAllReviews, getRatingsAndRecommended, getCharacteristics,
  addReview, addPhotos, addCharacteristicReviews,
  markHelpful, report,
} = require('../model/postgres.js');
const { transformReviews } = require('../utils/pg_transformReviews.js');
const { transformMeta } = require('../utils/pg_transformMeta.js');

module.exports.getReviews = async (req, res) => {
  let sorting = false;
  if (req.query.sort) sorting = req.query.sort.toLowerCase() === 'newest';
  const queryParams = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || 5,
    sort: sorting,
    product_id: Number(req.query.product_id),
  };

  try {
    const results = await getAllReviews(poolReviews, queryParams);
    const payload = transformReviews(queryParams.product_id, queryParams.count, results.rows);
    res.status(200).send(payload);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
};

module.exports.getMeta = async (req, res) => {
  const productId = Number(req.query.product_id);

  try {
    const ratingsAndRecommended = await getRatingsAndRecommended(poolReviews, productId);
    if (ratingsAndRecommended.rows[0]) {
      const characteristics = await getCharacteristics(poolCharacteristics, productId);
      const payload = transformMeta(ratingsAndRecommended.rows[0], characteristics.rows);
      res.status(200).send(payload);
    } else {
      res.status(200).send({
        product_id: productId.toString(),
        ratings: {},
        recommended: {},
        characteristics: {},
      });
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
};

module.exports.addReview = async (req, res) => {
  const clientReviews = await poolReviews.connect();
  try {
    const newReview = await addReview(clientReviews, req.body);
    const newReviewId = newReview.rows[0].id;
    if (req.body.photos.length > 0) {
      await addPhotos(clientReviews, newReviewId, req.body.photos);
    }
    clientReviews.release();
    await addCharacteristicReviews(poolCharacteristics, newReviewId, req.body.characteristics);
    res.sendStatus(201);
  } catch (error) {
    clientReviews.release();
    console.error(error);
    res.sendStatus(404);
  }
};

module.exports.markHelpful = async (req, res) => {
  try {
    await markHelpful(poolReviews, Number(req.params.review_id));
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
};

module.exports.markReported = async (req, res) => {
  try {
    await report(poolReviews, Number(req.params.review_id));
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
};
