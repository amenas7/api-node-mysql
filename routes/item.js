
/*
    Ruta : /api/item
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getItems, getItemByID } = require('../controllers/item');


const router = Router();

router.get('/', 
            validarJWT, 
            getItems
);

router.get('/:id', 
            validarJWT,
            getItemByID 
);

module.exports = router;