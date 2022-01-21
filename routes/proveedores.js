
/*
    Ruta : /api/proveedores
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getProveedores, getProveedorByID } = require('../controllers/proveedores');


const router = Router();

router.get('/', 
            validarJWT, 
            getProveedores
);

router.get('/:id', 
            validarJWT,
            getProveedorByID 
);

module.exports = router;