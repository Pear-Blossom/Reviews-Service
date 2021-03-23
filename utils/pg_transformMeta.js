module.exports.transformMeta = (ratingsAndRecommended, characteristics) => {
  const result = {
    product_id: ratingsAndRecommended.product_id,
    ratings: {},
    recommended: {},
    characteristics: {},
  };

  ['1', '2', '3', '4', '5'].forEach((num) => {
    if (ratingsAndRecommended[num] !== '0') {
      result.ratings[num] = Number(ratingsAndRecommended[num]);
    }
  });

  result.recommended.true = Number(ratingsAndRecommended.recommended);
  result.recommended.false = Number(ratingsAndRecommended.notRecommended);

  characteristics.forEach((char) => {
    result.characteristics[char.name] = {
      id: char.id,
      value: Number(char.average).toFixed(4),
    };
  });

  return result;
};
