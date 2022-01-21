
/*
    Ruta : /api/usuarios
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getUsuarios, crearUsuario, actualizarUsuario, 
    borrarUsuario, getUsuarioByID } = require('../controllers/usuarios');


const router = Router();

router.get('/', 
            validarJWT, 
            getUsuarios
);

router.get('/:id', 
            validarJWT,
            getUsuarioByID 
);


router.post('/', 
            [
                check('nombres', 'El nombre es obligatorio').not().isEmpty(),
                check('password', 'El password es obligatorio').not().isEmpty(),
                check('usuario', 'El usuario es obligatorio').not().isEmpty(),
                validarCampos,
            ],
            crearUsuario 
);

router.put('/:id', 
            [    validarJWT,
                 check('nombres', 'El nombre es obligatorio').not().isEmpty(),
                 check('role', 'El role es obligatorio').not().isEmpty(),
                 check('usuario', 'El usuario es obligatorio').not().isEmpty(),
                validarCampos,
            ],
            validarJWT,
            actualizarUsuario 
);

router.delete('/:id', 
            validarJWT,
            borrarUsuario 
);

module.exports = router;