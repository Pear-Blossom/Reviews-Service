/* eslint no-param-reassign: ["error", { "props": false }] */

module.exports.transformCharacteristics = (productId, characteristics) => {
  const meta = { product_id: productId, characteristics: {} };

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

};

module.exports.populateRecommendedCounts = (meta, ratingAverages) => {

};
