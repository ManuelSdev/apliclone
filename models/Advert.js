'use strict'

const mongoose = require('mongoose')
//var hash = require('hash.js')

const advertSchema = mongoose.Schema({
  name: { type: String, index: true },
  sale: { type: Boolean, index: true },
  price: { type: Number, index: true },
  author: { type: String, index: true },
  description: String,
  // images: [String],
  tags: { type: [String], index: true }
})
/*
usuarioSchema.statics.hashPassword = function (plain) {
  return hash.sha256().update(plain).digest('hex')
}
*/
var Advert = mongoose.model('Advert', advertSchema)

module.exports = Advert
