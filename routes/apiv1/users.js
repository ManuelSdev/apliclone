'use strict';

var express = require('express');
var router = express.Router();
const { User } = require('../../models')


router.get('/', async function (req, res, next) {
    try {
        const query = await User.find({})
        res.send(query)
    } catch (err) { next(err) }
    //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);

    //console.log(query)
})

router.post('/', async function (req, res, next) {
    try {
        //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);
        //await res.send('hola')
        console.log(req.body)
        const newUser = new User(req.body)
        newUser.password = await User.hashPassword(req.body.password)
        const saved = await newUser.save()
        await newUser.sendRegisterMail('Este es el asunto', 'Bienvenido a NodeAPI');
        res.json({ ok: true, result: saved })
    } catch (err) { next(err) }

})

module.exports = router;