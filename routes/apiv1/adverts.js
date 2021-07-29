'use strict';

var express = require('express');
var router = express.Router();
const { Advert } = require('../../models')

//const Advert = require('../../models/Advert');

router.get('/', async function (req, res, next) {
    try {
        const query = await Advert.find({})
        res.send(query)
    } catch (err) { next(err) }
    //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);

    //console.log(query)
})

router.post('/', async function (req, res, next) {
    try {
        //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);
        //await res.send('hola')
        //console.log(req)
        const newAdvert = new Advert(req.body)
        const saved = await newAdvert.save()
        res.json({ ok: true, result: saved })
    } catch (err) { next(err) }

})

module.exports = router;