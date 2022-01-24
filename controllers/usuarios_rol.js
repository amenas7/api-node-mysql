const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// modificar rol de usuario
// ==========================================
const actualizarUsuarioRol = async(req, res = response) => {
    const id = req.params.id;

    const p_rol = req.body.rolID;

    const obtenerReg = await consultar_existe_usuario(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }

    const p_dos_actualizar_rol_usuario = await dos_actualizar_rol_usuario(p_rol, res, id);

    if ( p_dos_actualizar_rol_usuario.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se modificó el rol del usuario'
        });
    }

    return res.status(200).json({
        ok: true,
        mensaje: "Rol del usuario modificado"
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



function dos_actualizar_rol_usuario(p_rol, res, id) {
    const p_idu = id;
    const rol = p_rol;

    // modificar el estado de la autorizacion
    const query = `
    UPDATE usuario
    SET IDrol = "${rol}" 
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
    actualizarUsuarioRol
}