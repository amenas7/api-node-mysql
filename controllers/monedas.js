const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las monedas
// ==========================================
const getMonedas = (req, res) => {
    consql.query(` SELECT monedaID, nombre_moneda, signo_moneda
    from moneda
    ORDER BY nombre_moneda DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando monedas',
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
// obtener una moneda por el ID
// ==========================================
const getMonedaByID = (req, res) => {
    const id = req.params.id;

    consql.query(` SELECT monedaID, nombre_moneda, signo_moneda
    from moneda
    where monedaID = "${id}" `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe una moneda con el parametro buscado'
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
                mensaje: 'Error cargando monedas',
                error: err
            })
        }

    });
}



module.exports = {
    getMonedas,
    getMonedaByID
}