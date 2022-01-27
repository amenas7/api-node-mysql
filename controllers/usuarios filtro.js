const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los usuarios
// ==========================================
const getUsuariosFiltro = (req, res) => {

    //const id = req.params.id;
    //{{url}}/api/usuarios_filtro/1?estado=2&activatekey=3
    //{{url}}/api/usuarios_filtro?estado=1&rol=1

    const p_estado = req.query.estado;
    const p_rol = req.query.rol;

    if ( p_estado == '' && p_rol == '' ) {
        consql.query(` SELECT persona.IDpersona, 
        usuario.usuarioID as uid, persona.numdoc , persona.nombrecompleto as nombre_completo,
        usuario.usuario, usuario.IDarea, area.nombre_area as area_nombre, usuario.IDrol, rol.descripcion as rol_nombre ,usuario.estado,
            persona.email as correo
        from usuario
        inner join persona
        on persona.IDpersona = usuario.IDpersona
        inner join area
        on usuario.IDarea = area.IDarea
        inner join rol
        on usuario.IDrol = rol.IDrol
        ORDER BY usuario.usuarioID DESC`, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
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
    else {
        consql.query(` SELECT persona.IDpersona, 
        usuario.usuarioID as uid, persona.numdoc , persona.nombrecompleto as nombre_completo,
        usuario.usuario, usuario.IDarea, area.nombre_area as area_nombre, usuario.IDrol, rol.descripcion as rol_nombre ,usuario.estado,
            persona.email as correo
        from usuario
        inner join persona
        on persona.IDpersona = usuario.IDpersona
        inner join area
        on usuario.IDarea = area.IDarea
        inner join rol
        on usuario.IDrol = rol.IDrol
        WHERE usuario.estado = "${p_estado}" AND rol.IDrol = "${p_rol}" ORDER BY usuario.usuarioID DESC`, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
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
}



module.exports = {
    getUsuariosFiltro
}