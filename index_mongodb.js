const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const controller = require('./controller/mongodb.js');
// const { transformReviews, populateWithPhotos } = require('./utils/transformReviews.js');

const app = express();
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/reviews/', controller.getReviews);
app.get('/reviews/meta', controller.getMeta);

const PORT = 1337;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
