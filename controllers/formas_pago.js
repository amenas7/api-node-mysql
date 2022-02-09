const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todas las formas de pago
// ==========================================
const getFormasPago = (req, res) => {

    try {
        consql.query(` select 
        forma_pagoID, descripcion
        from forma_pago`, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando formas de pago',
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
    } catch (e) {
        console.error('err thrown: ' + e);
    }
    finally{
        consql.end(function(){
            // La conexión se ha cerrado
        });
    }
    
}



module.exports = {
    getFormasPago
}