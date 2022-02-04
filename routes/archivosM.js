const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const multer = require("multer");
//const subir = multer({ dest: './public' });

const storage = multer.diskStorage({
    filename: function (res, file, cb) {




      const ext = file.originalname.split(".").pop(); //TODO pdf / jpeg / mp3
      const fileName = Date.now(); //TODO 12312321321
      cb(null, `${fileName}.${ext}`); //TODO 123123213232.pdf
    },
    destination: function (res, file, cb) {
      cb(null, `./public`);
    },
});

const upload = multer({ storage: storage });




const { 
    SubirMultir, cargaArchivo } = require('../controllers/archivosM');

const router = Router();

// router.get('/:id', 
//             //validarJWT, 
//             getArchivosByID
// );

router.post('/', 
            //validarJWT,
            upload.single('archivo'),
            SubirMultir
             
);

// router.put('/:id', 
//             [    //validarJWT,
//                  //check('nombres', 'El nombre es obligatorio').not().isEmpty(),
//                  //check('role', 'El role es obligatorio').not().isEmpty(),
//                  //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             //validarJWT,
//             borrarArchivo 
// );

// router.delete('/:id', 
//             //validarJWT,
//             borrarArchivo
// );

module.exports = router;