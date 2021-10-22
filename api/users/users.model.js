const mongoose = require('mongoose');

var USERschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    tweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tweet"
    }],
    created: {
        type: Date, 
        default: Date.now
    }
})

var USER = mongoose.model('user', USERschema);

module.exports = USER;