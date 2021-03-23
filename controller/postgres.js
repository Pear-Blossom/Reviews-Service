const pool = require('../db/postgres.js');
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

  const client = await pool.connect();
  try {
    const results = await getAllReviews(client, queryParams);
    const payload = transformReviews(queryParams.product_id, queryParams.count, results.rows);
    res.status(200).send(payload);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    client.release();
  }
};

module.exports.getMeta = async (req, res) => {
  const productId = Number(req.query.product_id);

  const client = await pool.connect();
  try {
    const ratingsAndRecommended = await getRatingsAndRecommended(client, productId);
    const characteristics = await getCharacteristics(client, productId);
    const payload = transformMeta(ratingsAndRecommended.rows[0], characteristics.rows);
    res.status(200).send(payload);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    client.release();
  }
};

module.exports.addReview = async (req, res) => {
  const client = await pool.connect();
  try {
    const newReview = await addReview(client, req.body);
    const newReviewId = newReview.rows[0].id;
    if (req.body.photos.length > 0) {
      await addPhotos(client, newReviewId, req.body.photos);
    }
    await addCharacteristicReviews(client, newReviewId, req.body.characteristics);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    client.release();
  }
};

module.exports.markHelpful = async (req, res) => {
  const client = await pool.connect();
  try {
    await markHelpful(client, Number(req.params.review_id));
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    client.release();
  }
};

module.exports.markReported = async (req, res) => {
  const client = await pool.connect();
  try {
    await report(client, Number(req.params.review_id));
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  } finally {
    client.release();
  }
};
