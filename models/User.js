'use strict'

const mongoose = require('mongoose')
//var hash = require('hash.js')

const usuarioSchema = mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String
})
/*
usuarioSchema.statics.hashPassword = function (plain) {
  return hash.sha256().update(plain).digest('hex')
}
*/
var User = mongoose.model('User', usuarioSchema)

module.exports = User