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

  const clientReviews = await poolReviews.connect();
  try {
    const results = await getAllReviews(clientReviews, queryParams);
    const payload = transformReviews(queryParams.product_id, queryParams.count, results.rows);
    res.status(200).send(payload);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    clientReviews.release();
  }
};

module.exports.getMeta = async (req, res) => {
  const productId = Number(req.query.product_id);

  const clientReviews = await poolReviews.connect();
  const clientCharacteristics = await poolCharacteristics.connect();
  try {
    const ratingsAndRecommended = await getRatingsAndRecommended(clientReviews, productId);
    if (ratingsAndRecommended.rows[0]) {
      const characteristics = await getCharacteristics(clientCharacteristics, productId);
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
  } finally {
    clientReviews.release();
    clientCharacteristics.release();
  }
};

module.exports.addReview = async (req, res) => {
  const clientReviews = await poolReviews.connect();
  const clientCharacteristics = await poolCharacteristics.connect();
  try {
    const newReview = await addReview(clientReviews, req.body);
    const newReviewId = newReview.rows[0].id;
    if (req.body.photos.length > 0) {
      await addPhotos(clientReviews, newReviewId, req.body.photos);
    }
    await addCharacteristicReviews(clientCharacteristics, newReviewId, req.body.characteristics);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    clientReviews.release();
    clientCharacteristics.release();
  }
};

module.exports.markHelpful = async (req, res) => {
  const clientReviews = await poolReviews.connect();
  try {
    await markHelpful(clientReviews, Number(req.params.review_id));
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    clientReviews.release();
  }
};

module.exports.markReported = async (req, res) => {
  const clientReviews = await poolReviews.connect();
  try {
    await report(clientReviews, Number(req.params.review_id));
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    clientReviews.release();
  }
};
