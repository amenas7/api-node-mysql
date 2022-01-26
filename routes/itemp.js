
/*
    Ruta : /api/itemp
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getItems, getItemByParametro } = require('../controllers/itemp');


const router = Router();

router.get('/', 
            validarJWT, 
            getItems
);

router.get('/:id', 
            validarJWT,
            getItemByParametro 
);

module.exports = router;