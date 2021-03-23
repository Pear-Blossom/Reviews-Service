const mongoose = require('mongoose');

// mongoose.connect('mongodb://54.183.228.228/review-service', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://localhost/review-service', { useNewUrlParser: true, useUnifiedTopology: true });
module.exports = mongoose;
