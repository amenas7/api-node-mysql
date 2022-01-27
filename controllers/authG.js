
//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { response } = require('express');
const bcrypt = require('bcrypt');

const { generarJWT } = require('../helpers/jwt');

// ==========================================
// login de usuario con Google
// ==========================================
const loginGoogle = async(req, res = response) => {
    const body = req.body;
    const obtenerReg = await consultar_usuario(req, res, body);

    if ( obtenerReg.length < 1 ) {
        // usuario no existe en la bd
        const query = ` CALL USP_REG_USUARIO_GOOGLE( "${body.email}", "${body.nombre}", "${body.foto}" )  `;
        const reg = await registrar_usuario_google(req, res, query);
        if ( reg < 1 ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al registrar al usuario'
            })
        }

        const obtenerRegNuevo = await consultar_usuario(req, res, body);

        let arreglo = {
            uid: obtenerRegNuevo[0].usuarioID,
            rol_nombre: obtenerRegNuevo[0].nombre,
            usuario: obtenerRegNuevo[0].usuario,
            nombre_completo: obtenerRegNuevo[0].nombrecompleto
        }
    
        // crear token
        const token =  await generarJWT( obtenerRegNuevo[0].usuarioID );
    
        res.status(200).json({
            ok: true,
            data: arreglo,
            token: token,
            mensaje : 'Login correcto'
        });

    }else{
        // si existe en la bd
        const obtenerRegNuevoOtro = await consultar_usuario(req, res, body);

        let arreglo = {
            uid: obtenerRegNuevoOtro[0].usuarioID,
            rol_nombre: obtenerRegNuevoOtro[0].nombre,
            usuario: obtenerRegNuevoOtro[0].usuario,
            nombre_completo: obtenerRegNuevoOtro[0].nombrecompleto
        }
    
        // crear token
        const token =  await generarJWT( obtenerRegNuevoOtro[0].usuarioID );
    
        res.status(200).json({
            ok: true,
            data: arreglo,
            token: token,
            mensaje : 'Login correcto'
        });

    }    
}


function consultar_usuario(req, res, body) {
    const p_email = body.email;
    const query = `
    SELECT 
    *
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join rol
    on rol.IDrol = usuario.IDrol
    where persona.email = "${p_email}"
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

function registrar_usuario_google(req, res, query) {
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                consql.rollback(()=>{
                    return reject(err);
                });
            }
            resolve(rows[0][0]['idu']);
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
    loginGoogle,
    renewToken
}