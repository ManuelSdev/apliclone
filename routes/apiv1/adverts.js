'use strict';

var express = require('express');
var router = express.Router();
const { Advert } = require('../../models')
const jwtAuth = require('../../lib/jwtAuth')

//const Advert = require('../../models/Advert');
/**
 * Obtener todos los anuncios
 */
router.get('/', async function (req, res, next) {
    try {
        const query = await Advert.find({})
        res.send(query)
    } catch (err) { next(err) }
    //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);

    //console.log(query)
})

/**
 * Obtener anuncios propios
 */
router.get('/my-ads', jwtAuth, async function (req, res, next) {
    try {
        console.log('my-ads')
        const userId = req.body.userId;
        const query = await Advert.find({ userId })
        console.log(query)
        res.send(query)
    } catch (err) { next(err) }
    //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);

    //console.log(query)
})

/**
 * Obtener un anuncio
 */
router.post('/one-ad', jwtAuth, async function (req, res, next) {
    try {
        console.log('one-ads')
        const _id = req.body.adId;
        console.log("ppppppppppppp", _id)
        const query = await Advert.findOne({ _id })
        console.log('QUERY', query)
        res.send(query)
    } catch (err) { next(err) }
})
/**
 * Crear anuncios
 * el método jwtAuth() verifica el token de la cabecera
 * si el token es correcto, permite acceder a la ruta y añade req.body.userId a petición
 * el esquema de anuncios debe integrar este id del usuario que los crea
 */
router.post('/', jwtAuth, async function (req, res, next) {
    try {
        //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);
        //await res.send('hola')
        //console.log(req)
        const newAdvert = new Advert(req.body)
        console.log(req.body)
        const saved = await newAdvert.save()
        res.json({ ok: true, result: saved })
    } catch (err) {
        console.log(err)
        next(err)
    }

})

module.exports = router;