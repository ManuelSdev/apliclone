'use strict'

const mongoose = require('mongoose')
//var hash = require('hash.js')

const advertSchema = mongoose.Schema({
  name: { type: String, index: true },
  sale: { type: Boolean, index: true },
  price: { type: Number, index: true },
  author: { type: String, index: true },
  description: String,
  images: String,
  tags: { type: [String], index: true },
  userId: { type: String, index: true },
  requesterId: { type: String, index: true },
})


//Sin uso
advertSchema.statics.findFavoritesAds = async function (favoritesIds) {
  return Promise.all(
    favoritesIds.map(async function (_id) {
      return await Advert.findById(_id)
    })
  ).then(allFavoritesAds => allFavoritesAds)
}

// 
/**
 * find recibe un objeto, por ejemplo Advert.find({name: "Ramon"})
 * Ahora le pasamos un objeto filter que puede tener varias claves
 * Ej: si filters = {name: "Ramon", age: 20}, hacemos Advert.find(filters)
 * 
 */
advertSchema.statics.list = async function (filters) {
  console.log("FILTERS QUE LLEGAN A LIST: ", filters)
  const query = Advert.find(filters)
  return await query.exec();
}

advertSchema.index({ name: 'text', description: 'text' });
var Advert = mongoose.model('Advert', advertSchema)

module.exports = Advert
