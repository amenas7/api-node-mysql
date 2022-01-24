
/*
    Ruta : /api/usuarios_estado
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    actualizarUsuarioEstado } = require('../controllers/usuarios_estado');


const router = Router();

// router.get('/', 
//             validarJWT, 
//             getOComprasTodas
// );

// router.get('/:id', 
//             validarJWT,
//             getOCompraByID 
// );

// router.post('/', 
//             [
//                 //check('nombres', 'El nombre es obligatorio').not().isEmpty(),
//                 //check('password', 'El password es obligatorio').not().isEmpty(),
//                 //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             crearOCompra 
// );

router.put('/:id', 
            [    //validarJWT,
                 check('estado', 'El estado es obligatorio').not().isEmpty(),
                 //check('role', 'El role es obligatorio').not().isEmpty(),
                 //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
                validarCampos
            ],
            //validarJWT,
            actualizarUsuarioEstado 
);

// router.delete('/:id', 
//             //validarJWT,
//             borrarOcompra
// );

module.exports = router;