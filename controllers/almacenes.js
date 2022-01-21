const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los almacenes
// ==========================================
const getAlmacenes = (req, res) => {
    consql.query(` SELECT *
    from almacen
    ORDER BY almacenID DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando almacenes',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                data: filas,
                uid: req.uid
            })
        }
    });
}

// ==========================================
// obtener un almacen por el ID
// ==========================================
const getAlmacenByID = (req, res) => {
    const id = req.params.id;

    consql.query(` SELECT *
    from almacen
    where almacenID = "${id}" `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe una almacen con el parametro buscado'
                })
            }
            else{
               return res.status(200).json({
                    ok: true,
                    data: filas,
                    uid: req.uid
                }) 
            }

        } catch (error) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando almacenes',
                error: err
            })
        }

    });
}



module.exports = {
    getAlmacenes,
    getAlmacenByID
}