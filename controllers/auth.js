
//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { response } = require('express');
const bcrypt = require('bcrypt');

const { generarJWT } = require('../helpers/jwt');

// ==========================================
// login de usuario
// ==========================================
const login = async(req, res = response) => {
    const body = req.body;

    const obtenerReg = await consultar_usuario(req, res, body);


    if (obtenerReg.length == 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Usuario incorrecto'
        })
    }

    if (!bcrypt.compareSync(body.password, obtenerReg[0].password)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - password'
        })
    }
    let arreglo = {
        uid: obtenerReg[0].usuarioID,
        rol_nombre: obtenerReg[0].nombre,
        usuario: obtenerReg[0].usuario,
        nombre_completo: obtenerReg[0].nombrecompleto
    }

    // crear token
    const token =  await generarJWT( obtenerReg[0].usuarioID );

    res.status(200).json({
        ok: true,
        data: arreglo,
        token: token,
        mensaje : 'Login correcto'
    });
}


function consultar_usuario(req, res, body) {
    const p_usuario = body.usuario;
    const query = `
    SELECT 
    *
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join rol
    on rol.IDrol = usuario.IDrol
    where usuario.usuario = "${p_usuario}"
    `;
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

const renewToken = async(req, res = response) =>{

    const uid = req.uid;
    
    // crear token
    const token =  await generarJWT( uid );

    res.json({
        ok: true,
        token
    });
}


module.exports = {
    login,
    renewToken
}