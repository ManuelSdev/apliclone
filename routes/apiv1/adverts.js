'use strict';

var express = require('express');
var router = express.Router();
const { Advert, User } = require('../../models')
const jwtAuth = require('../../lib/jwtAuth')
const jwtSofAuth = require('../../lib/jwtSofAuth')
const upload = require('../../lib/multerUploadS3')
const { buildAdFilterFromReq } = require("../../lib/utils")

/**
 *  
    console.log("REQ.QUERY", req.query)
    console.log("REQ.PARAMS", req.params)
    console.log("REQ.BODY", req.body)
 */


/**
 * Obtener anuncios
 */
router.get('/', async function (req, res, next) {
    const filters = buildAdFilterFromReq(req)



    console.log("QUERY STRING PARAMS QUE CONTIENE REQ.QUERY", req.query)
    //console.log("RETORNO DE CONSTRUCCIÓN DE FILTERS", filters)
    /*
    filters.tags = req.query.tags;
    filters.sale = req.query.sale ?? req.query.sale
    const start = parseInt(req.query.start) || 0;
    // nuestro api devuelve max 1000 registros
    const limit = parseInt(req.query.limit) || 1000;
    //const skip = parseInt(req.query.skip);
    const maxPrice = parseInt(req.query.maxPrice) || 1000000
    const minPrice = parseInt(req.query.minPrice) || 0
    const sort = req.query.sort || '_id';

    try {
        const query = await Advert.find({})
        console.log("ssssssssssssssssssssssssssss", query)
        res.send(query.reverse())
    } catch (err) { next(err) }
    */
    try {
        const query = await Advert.list(filters)
        console.log("QUERY QUE OBTIENES CON LOS FILTERS", query)
        res.send(query)
    } catch (err) { next(err) }
})

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
 * Obtener anuncios propios
 */
router.get('/my-ads', jwtAuth, async function (req, res, next) {
    try {
        //console.log('my-adssssssssssss')
        const userId = req.body.userId;
        // console.log('USER ID', userId)
        const query = await Advert.find({ userId })
        //  console.log("la query", query)
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
        //  console.log("ad id", _id)
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
    //console.log("PETICIÓN FAVS")
    try {
        //Uso el id del usuario que hace la petición para obtener un array con los id´s de sus favoritos
        //console.log("PETICIÓN FAVS", req)

        const userId = req.body.userId
        const user = await User.findById(userId)
        const userFavsIds = user.favorites
        //console.log(userFavsIds)
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
        // console.log(eror)
        next(err)
    }
})
/**
 * Obtener anuncios de un miembro que no tiene por que ser el usuario
 * Los anuncios se buscan por campo author 
 */
router.get('/memberAds/:memberName', async function (req, res, next) {
    try {
        const author = req.params.memberName
        const memberAds = await Advert.find({ author })
        res.send(memberAds)
    } catch (err) {
        // console.log(eror)
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

        const { name, price, tags, sale } = req.body
        if (!name) {
            const error = new Error('Debe indicar que producto quiere vender para subir un anuncio');
            error.status = 401;
            next(error);
        }
        if (sale === true && !price) {
            const error = new Error('Indique un precio valido para subir el anuncio');
            error.status = 401;
            next(error);
        }
        if (!tags || tags.length == 0) {
            const error = new Error('Seleccione, al menos, un tag');
            error.status = 401;
            next(error);
            return;
        }

        req.body.price = sale == 'false' ?
            null
            :
            price
        //await res.send('hola')
        //console.log("REQ FILE", req.file)
        console.log("REQ BODY", req.body)
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
        // console.log(err)
        next(err)
    }

})


/**
 * Actualizar anuncio
 * CLAVE: necesitas el middleware multer/upload para tratar la petición en formdata
 */
router.put('/:adId', upload.single("images"), jwtAuth, async function (req, res, next) {
    try {

        const { name, price, tags, sale } = req.body
        if (!name) {
            const error = new Error('Debe indicar que producto quiere vender para subir un anuncio');
            error.status = 401;
            next(error);
        }
        if (sale === true && !price) {
            const error = new Error('Indique un precio valido para subir el anuncio');
            error.status = 401;
            next(error);
        }
        if (!tags || tags.length == 0) {
            const error = new Error('Seleccione, al menos, un tag');
            error.status = 401;
            next(error);
            return;
        }

        const adId = req.params.adId;
        const newAdValues = req.file ?
            { images: req.file.location, ...req.body }
            :
            req.body


        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", newAdValues)
        console.log("---------------------------------------------------------------", adId)
        const updatedAd = await Advert.findByIdAndUpdate(adId, newAdValues, {
            new: true,
            useFindAndModify: false
        });
        // usamos { new: true } para que nos devuelva el anuncio actualizado

        if (!updatedAd) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        res.json({ result: updatedAd });
    } catch (err) {
        //console.log(err)
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
        // console.log(adId)
        const deletedAd = await Advert.findByIdAndDelete(adId)
        res.json({ ok: true, result: deletedAd })
    } catch (err) {
        //console.log(err)
        next(err)
    }

})


module.exports = router;