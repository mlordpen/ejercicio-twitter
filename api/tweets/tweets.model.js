const mongoose = require('mongoose');

var TWEETschema = new mongoose.Schema({
    text: String,
    owner: {
        type: String,
        required: true,
        ref: "user"
    },
    createdAt: Date
})

var TWEET = mongoose.model('tweet', TWEETschema);

module.exports = TWEET;