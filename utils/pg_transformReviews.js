module.exports.transformReviews = (productId, count, queryResults) => {
  const transformed = {
    product: productId.toString(),
    page: 0,
  };

  const reviews = [];
  const reviewsCache = [];

  queryResults.forEach((result) => {
    if (reviewsCache.length <= count) {
      if (reviewsCache.indexOf(result.review_id) < 0) {
        reviewsCache.push(result.review_id);

        const tempReview = {
          review_id: result.review_id,
          rating: result.rating,
          summary: result.summary,
          recommend: result.recommend,
          response: result.response,
          body: result.body,
          date: result.date,
          reviewer_name: result.reviewer_name,
          helpfulness: result.helpfulness,
          photos: [],
        };

        if (result.review_photo_id) {
          tempReview.photos.push({
            id: result.review_photo_id,
            url: result.url,
          });
        }

        reviews.push(tempReview);
      } else {
        const indexReview = reviewsCache.indexOf(result.review_id);
        reviews[indexReview].photos.push({
          id: result.review_photo_id,
          url: result.url,
        });
      }
    }
  });

  transformed.count = reviews.length;
  transformed.results = reviews.slice(0, count);

  return transformed;
};
