const express = require('express');
const path = require('path');
const cors = require('cors');
// const morgan = require('morgan');
const bodyParser = require('body-parser');
const controller = require('./controller/postgres.js');

const app = express();
// app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.get('/', (req, res) => res.send('hello!'));
app.get('/reviews/', controller.getReviews);
app.get('/reviews/meta', controller.getMeta);
app.post('/reviews', controller.addReview);
app.put('/reviews/:review_id/helpful', controller.markHelpful);
app.put('/reviews/:review_id/report', controller.markReported);

app.get(`${process.env.LOADERIO}`, (req, res) => res.sendFile(path.resolve('loaderio.txt')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
