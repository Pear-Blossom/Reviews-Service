const { Pool } = require('pg');

const poolReviews = new Pool({
  user: 'postgres',
  // password: ------,
  // host: 'aws-publicIPv4-DNS',
  host: 'localhost',
  database: 'reviews-reviews',
  max: 20,
  port: 5432,
});

const poolCharacteristics = new Pool({
  user: 'postgres',
  // password: ------,
  // host: 'aws-publicIPv4-DNS',
  host: 'localhost',
  database: 'reviews-characteristics',
  max: 20,
  port: 5432,
});

poolReviews.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

poolCharacteristics.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports.poolReviews = poolReviews;
module.exports.poolCharacteristics = poolCharacteristics;
