module.exports.getAllReviews = (client, params) => {
  const ordering = params.sort ? 'date ASC, helpfulness DESC' : 'helpfulness DESC, date ASC';
  const query = `
    SELECT
      product_id, r.id AS review_id, rating, summary, recommend,
      response, body, date, reviewer_name,
      helpfulness, rp.id AS review_photo_id, rp.url
    FROM reviews r
    LEFT JOIN reviews_photos rp ON r.id = rp.review_id
    WHERE
      product_id = $1
      AND reported = FALSE
    ORDER BY ${ordering}
  `;

  return client.query(query, [params.product_id]);
};

module.exports.getRatingsAndRecommended = (client, productId) => {
  const query = `
    SELECT
      product_id,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS "1",
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS "2",
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS "3",
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS "4",
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS "5",
      SUM(CASE WHEN recommend = TRUE THEN 1 ELSE 0 END) AS "recommended",
      SUM(CASE WHEN recommend = FALSE THEN 1 ELSE 0 END) AS "notRecommended"
    FROM reviews
    WHERE
      product_id = $1
    GROUP BY product_id
  `;

  return client.query(query, [productId]);
};

module.exports.getCharacteristics = (client, productId) => {
  const query = `
    SELECT c.id, c.name, AVG(cr.value) AS average
    FROM characteristic_reviews cr
    JOIN characteristics c ON cr.characteristic_id = c.id
    WHERE cr.review_id IN (
      SELECT id
      FROM reviews
      WHERE product_id = $1
    )
    GROUP BY c.id, c.name
    ORDER BY c.id ASC
  `;

  return client.query(query, [productId]);
};

module.exports.addReview = (client, params) => {
  const query = `
    INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;

  const queryParams = [
    Number(params.product_id),
    Number(params.rating),
    params.summary,
    params.body,
    params.recommend,
    params.name,
    params.email,
    new Date(),
  ];

  return client.query(query, queryParams);
};

module.exports.addPhotos = (client, reviewId, photos) => {
  const inserts = [];
  photos.forEach((photo) => {
    const query = `
      INSERT INTO reviews_photos (review_id, url)
      VALUES ($1, $2)
    `;

    inserts.push(client.query(query, [reviewId, photo]));
  });

  return Promise.all(inserts);
};

module.exports.addCharacteristicReviews = (client, reviewId, characteristics) => {
  const inserts = [];
  Object.entries(characteristics).forEach((char) => {
    const query = `
      INSERT INTO characteristic_reviews (characteristic_id, review_id, value)
      VALUES ($1, $2, $3)
    `;
    inserts.push(client.query(query, [char[0], reviewId, char[1]]));
  });

  return Promise.all(inserts);
};

module.exports.markHelpful = (client, reviewId) => {
  const query = `
    UPDATE reviews
    SET helpfulness = helpfulness + 1
    WHERE id = $1
  `;

  return client.query(query, [reviewId]);
};

module.exports.report = (client, reviewId) => {
  const query = `
    UPDATE reviews
    SET reported = TRUE
    WHERE id = $1
  `;

  return client.query(query, [reviewId]);
};
