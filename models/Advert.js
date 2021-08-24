'use strict'

const mongoose = require('mongoose')
//var hash = require('hash.js')

const advertSchema = mongoose.Schema({
  name: { type: String, index: true },
  sale: { type: Boolean, index: true },
  price: { type: Number, index: true },
  author: { type: String, index: true },
  description: String,
  images: [String],
  tags: { type: [String], index: true },
  userId: { type: String, index: true },

})

advertSchema.statics.findFavoritesAds = async function (favoritesIds) {
  return Promise.all(
    favoritesIds.map(async function (_id) {
      return await Advert.findById(_id)
    })
  ).then(allFavoritesAds => allFavoritesAds)
}


var Advert = mongoose.model('Advert', advertSchema)

module.exports = Advert
