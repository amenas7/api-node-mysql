const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// modificar estado de usuario
// ==========================================
const actualizarUsuarioEstado = async(req, res = response) => {
    const id = req.params.id;

    const p_estado = req.body.estado;

    const obtenerReg = await consultar_existe_usuario(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }

    const p_dos_actualizar_estado_usuario = await dos_actualizar_estado_usuario(p_estado, res, id);

    if ( p_dos_actualizar_estado_usuario.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se modificó el estado del usuario'
        });
    }

    return res.status(200).json({
        ok: true,
        mensaje: "Estado del usuario modificado"
    });

 };

 function consultar_existe_usuario(req, res, id) {
    const query = `
    select count(usuarioID) as cantidad from usuario
    where usuarioID = "${id}" `;

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['cantidad']);
        });
    });
}



function dos_actualizar_estado_usuario(p_estado, res, id) {
    const p_idu = id;
    const estado = p_estado;

    // modificar el estado de la autorizacion
    const query = `
    UPDATE usuario
    SET estado = "${estado}" 
    WHERE usuarioID = "${p_idu}"
    `;

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                console.log("Error: " + err.message);
                throw err;
            }
            resolve(rows);
        });
    });
}

module.exports = {
    actualizarUsuarioEstado
}