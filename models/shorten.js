const mongoose = require('mongoose');
const shortUrlSchema = mongoose.Schema({
        urlid: String,
        url: String,
        urlpath: String,
        protocal: String,
})

module.exports = mongoose.model('shorturl', shortUrlSchema)