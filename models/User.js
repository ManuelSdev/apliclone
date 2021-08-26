'use strict'

const mongoose = require('mongoose')
//var hash = require('hash.js')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
//const { getMaxListeners } = require('./Advert');


const userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    active: false,
    favorites: { type: [String], index: true },
})

userSchema.statics.hashPassword = function (cleanPassword) {
    return bcrypt.hash(cleanPassword, 7);
}

//Métodos de instancia
userSchema.methods.comparePassword = function (cleanPassword) {
    return bcrypt.compare(cleanPassword, this.password);

}

userSchema.methods.deleteFavoriteElement = function (adId) {
    console.log("Fav existe, se borrará")
    delete this.favorites[adId]

}
userSchema.methods.addFavoriteElement = function (adId) {
    console.log("Fav no existe, se añadirá")
    adId ?
        this.favorites[adId] = adId
        :
        console.log(adId)

}
userSchema.methods.getArrayWithFavoritesIds = function () {
    return Object.getOwnPropertyNames(this.favorites)

}
userSchema.methods.checkFavoriteElement = function (adId) {
    return (
        this.favorites[adId] ? true : false
    )
}
userSchema.methods.sendRegisterMail = function (subject, body) {
    //Crear un transport = canal para enviar mail
    const transport = nodemailer.createTransport(
        {
            service: 'SendinBlue',
            auth: {
                user: 'masanchezzm@gmail.com',
                pass: 'I4twOXb0vNVJ7sF9'
            }
        }
    )
    //Enviar mail
    //Retornamos la promesa que devuelve sendMail para que se gestione  en otro sitio
    return transport.sendMail(
        {
            from: "test@apiclone.com",
            to: this.email,
            subject: subject,
            html: body
        }
    )
}
/*
usuarioSchema.statics.hashPassword = function (plain) {
  return hash.sha256().update(plain).digest('hex')
}
*/
var User = mongoose.model('User', userSchema)

module.exports = User