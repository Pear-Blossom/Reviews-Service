/* eslint no-param-reassign: ["error", { "props": false }] */

// I need to convert response from "null" to null when needed
// update to an acceptable format
module.exports.transformReviews = (product, reviews) => {
  const transformedReviews = {
    product: Number(product),
    page: 0,
    count: reviews.length,
    results: [],
  };

  const reviewIds = [];

  reviews.forEach((review) => {
    delete review.date;
    delete review.product_id;
    if (!review.reported || review.reported === 'false') {
      // delete review.reported;
      reviewIds.push(review.review_id);
      review.response = review.response === 'null' ? null : review.response;
      transformedReviews.results.push(review);
    }
  });

  return [transformedReviews, reviewIds];
};

module.exports.populateWithPhotos = (photos, reviews) => {
  const copyReviews = [...reviews.results];
  photos.forEach((photo) => {
    for (let i = 0; i < copyReviews.length; i += 1) {
      const review = copyReviews[i];
      if (photo.review_id === review.review_id) {
        review.photos = review.photos && review.photos.length > 0 ? review.photos : [];
        review.photos.push({ id: photo.id, url: photo.url });
        break;
      }
    }
  });
  reviews.results = copyReviews;
  return reviews;
};
