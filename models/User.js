'use strict'

const mongoose = require('mongoose')
//var hash = require('hash.js')
const bcrypt = require('bcrypt')


const userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String
})

userSchema.statics.hashPassword = function (cleanPassword) {
    return bcrypt.hash(cleanPassword, 7);
}

//Método de instancia
userSchema.methods.comparePassword = function (cleanPassword) {
    return bcrypt.compare(cleanPassword, this.password);

}
/*
usuarioSchema.statics.hashPassword = function (plain) {
  return hash.sha256().update(plain).digest('hex')
}
*/
var User = mongoose.model('User', userSchema)

module.exports = User