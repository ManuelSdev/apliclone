'use strict';

var express = require('express');
var router = express.Router();
const { Advert, User } = require('../../models')
const jwtAuth = require('../../lib/jwtAuth')
const jwtSofAuth = require('../../lib/jwtSofAuth')
const upload = require('../../lib/multerUploadS3')

//const Advert = require('../../models/Advert');

/**
 * Obtener tags / Aquí se definen los tag seleccionables
 */
router.get('/tags', async function (req, res, next) {
    try {
        const selectablesTags = ['hogar', 'motor', 'informática']
        res.send(selectablesTags)
    } catch (err) { next(err) }
})
/**
 * Obtener todos los anuncios
 */
router.get('/', async function (req, res, next) {
    try {
        const query = await Advert.find({})
        res.send(query)
    } catch (err) { next(err) }
})

/**
 * Obtener anuncios propios
 */
router.get('/my-ads', jwtAuth, async function (req, res, next) {
    try {
        console.log('my-adssssssssssss')
        const userId = req.body.userId;
        console.log('USER ID', userId)
        const query = await Advert.find({ userId })
        console.log("la query", query)
        res.send(query)
    } catch (err) { next(err) }
    //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);

    //console.log(query)
})

/**
 * Obtener un anuncio
 */
router.get('/oneAd/:adId', jwtSofAuth, async function (req, res, next) {

    try {
        //console.log('PETICION /one-ads')
        //const _id = req.body.adId;
        const _id = req.params.adId;
        console.log("ad id", _id)
        //jwtAuth mete en req.body el id del usuario que hace
        //la peticion: lo guardo en requesterId

        const query = await Advert.findOne({ _id })
        if (req.body.userId) {
            const requesterId = req.body.userId
            query.requesterId = requesterId
        }
        res.send(query)
    } catch (err) { next(err) }
})

/**
 * Obtener anuncios favoritos
 * El modelo de usuario tiene un objeto "favoritos" con los id´s
 *  de los anuncios favoritos tanto para clave como para valor
 */
router.get('/favs-NO', jwtAuth, async function (req, res, next) {
    try {
        //Uso el id del usuario que hace la petición para obtener un array con los id´s de sus favoritos
        const userId = req.body.userId
        const user = await User.findById(userId)
        const favoritesIds = user.getArrayWithFavoritesIds()

        //Uso el método estático del modelo Adverts para encontrar todos los anuncios que corresponden a los id´s de favoritos
        const favoritesAds = await Advert.findFavoritesAds(favoritesIds)

        res.send(favoritesAds)
    } catch (err) { next(err) }
})

router.get('/favs', jwtAuth, async function (req, res, next) {
    console.log("PETICIÓN FAVS")
    try {
        //Uso el id del usuario que hace la petición para obtener un array con los id´s de sus favoritos
        //console.log("PETICIÓN FAVS", req)

        const userId = req.body.userId
        const user = await User.findById(userId)
        const userFavsIds = user.favorites
        console.log(userFavsIds)
        // const favoritesIds = user.getArrayWithFavoritesIds()

        //Uso el método estático del modelo Adverts para encontrar todos los anuncios que corresponden a los id´s de favoritos
        const favoritesAds = await Promise.all(
            userFavsIds.map(async function (_id) {
                return await Advert.findById(_id)
            })
        ).then(allFavoritesAds => allFavoritesAds)
        // console.log(favoritesAds)
        res.send(favoritesAds)
    } catch (err) {
        console.log(eror)
        next(err)
    }
})
/**
 * Obtener anuncios de un miembro que no tiene por que ser el usuario
 * Los anuncios se buscan por campo author
 * Tambien 
 */
router.get('/memberAds/:memberName', jwtAuth, async function (req, res, next) {
    console.log("PETICIÓN memberAds")
    try {
        //Uso el id del usuario que hace la petición para obtener un array con los id´s de sus favoritos
        //console.log("PETICIÓN FAVS", req)

        const author = req.params.memberName

        console.log("AUTHOR ###############", author)
        // const favoritesIds = user.getArrayWithFavoritesIds()

        //Uso el método estático del modelo Adverts para encontrar todos los anuncios que corresponden a los id´s de favoritos
        const memberAds = await Advert.find({ author })
        console.log("MEMBER ADSSS ##########################", memberAds)
        res.send(memberAds)
    } catch (err) {
        console.log(eror)
        next(err)
    }
})
/**
 * Crear anuncios
 * el método jwtAuth() verifica el token de la cabecera
 * si el token es correcto, permite acceder a la ruta y añade req.body.userId a petición
 * el esquema de anuncios debe integrar este id del usuario que los crea
 * Al ejecutar el middleware upload.single, req.file contendrá toda la info del archivo de imagen que hemos cargado
 * y ha sido devuelto por amazon
 * la propiedad req.file.location contiene la ruta al archivo en el bucket
 */
router.post('/', upload.single("images"), jwtAuth, async function (req, res, next) {
    try {
        //await res.send('hola')

        //console.log("REQ FILE", req.file)
        //console.log("REQ BODY", req.body)
        const user = await User.findById(req.body.userId)
        // console.log("%%%%%%%%%%", user)
        req.body.author = user.username
        // console.log("@@@@@@@@@@@@@@@@@@@", req.body.userId)
        const advert = req.file ?
            { images: req.file.location, ...req.body }
            :
            req.body
        //console.log("@@@@@@@@@@@@@@@@@@@", req.body)
        const newAdvert = new Advert(advert)
        const saved = await newAdvert.save()
        res.json({ ok: true, result: saved })
    } catch (err) {
        console.log(err)
        next(err)
    }

})


/**
 * Actualizar anuncio
 */
router.put('/:adId', jwtAuth, async function (req, res, next) {
    try {
        //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);
        //await res.send('hola')
        //console.log(req)
        const adId = req.params.adId;
        const newAdValues = req.body
        const updatedAd = await Advert.findByIdAndUpdate(adId, newAdValues, {
            new: true,
            useFindAndModify: false
        });
        // usamos { new: true } para que nos devuelva el agente actualizado

        if (!updatedAd) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        res.json({ result: updatedAd });
    } catch (err) {
        console.log(err)
        next(err)
    }
})

/**
 * Borrar anuncio
 */
router.delete('/:adId', jwtAuth, async function (req, res, next) {
    try {
        //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);
        //await res.send('hola')
        //console.log(req)
        const userId = req.body.userId
        const adId = req.params.adId;
        console.log(adId)
        const deletedAd = await Advert.findByIdAndDelete(adId)
        res.json({ ok: true, result: deletedAd })
    } catch (err) {
        console.log(err)
        next(err)
    }

})


module.exports = router;