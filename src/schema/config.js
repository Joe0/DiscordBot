const mongoose = require('mongoose')

var config = new mongoose.Schema({
  _server: String,
  _player_threshold: String,
  _deck_threshold: String,
  _timeout: String,
  _admin: String
})

module.exports = mongoose.model('Config', config)
