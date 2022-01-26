
/*
    Ruta : /api/area
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getAreas } = require('../controllers/areas');


const router = Router();

router.get('/', 
            //validarJWT, 
            getAreas
);



module.exports = router;