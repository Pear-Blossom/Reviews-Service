/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-underscore-dangle: 0 */

module.exports.transformCharacteristics = (productId, characteristics) => {
  const meta = { product_id: productId.toString(), characteristics: {} };

  characteristics.forEach((char) => {
    meta.characteristics[char.name] = {};
  });

  return meta;
};

module.exports.collectReviewIds = (reviews) => {
  const collectedReviewIds = [];

  reviews.forEach((review) => collectedReviewIds.push(review.review_id));

  return collectedReviewIds;
};

module.exports.populateCharacteristicAverages = (meta, characteristics, characteristicAverages) => {
  const mapCharacteristics = {};
  characteristics.forEach((characteristic) => {
    mapCharacteristics[characteristic.id] = characteristic.name;
  });

  characteristicAverages.forEach((characteristicAverage) => {
    meta.characteristics[mapCharacteristics[characteristicAverage._id]] = {
      id: characteristicAverage._id,
      value: characteristicAverage.avg.toString(),
    };
  });

  return meta;
};

module.exports.populateRatingAverages = (meta, ratingAverages) => {
  meta.ratings = {};

  ratingAverages.forEach((ratingAverage) => {
    meta.ratings[ratingAverage._id] = ratingAverage.count;
  });

  return meta;
};

module.exports.populateRecommendedCounts = (meta, recommendedCounts) => {
  meta.recommended = {};
  meta.recommended.true = recommendedCounts[0].recommendCount;
  meta.recommended.false = recommendedCounts[0].notRecommendCount;
  return meta;
};
