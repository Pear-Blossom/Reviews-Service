const { Pool } = require('pg');

const pool = new Pool({
  user: 'wilsoncheah',
  host: 'localhost',
  database: 'reviews-service',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
