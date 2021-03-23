const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const controller = require('./controller/postgres.js');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/reviews/', controller.getReviews);
app.get('/reviews/meta', controller.getMeta);
app.post('/reviews', controller.addReview);
app.put('/reviews/:review_id/helpful', controller.markHelpful);
app.put('/reviews/:review_id/report', controller.markReported);

const PORT = 1337;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
