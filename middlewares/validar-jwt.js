const jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;



const validarJWT = (req, res, next) =>{
    // leer el token
    const token = req.header('x-token');

    if( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        });
    }

    try {
        const { uid } = jwt.verify( token, SEED );

        //console.log(uid);

        req.uid = uid;

        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token incorrecto'
        });
    }   
    
}

const validarJWT_params = (req, res, next) =>{
    // leer el token
    
    // let token = req.get('x-token');
    // let token2 = req.header('x-token');
    // let token3 = req.headers['x-token'];
    let token = req.query['tokenx'];

    //console.log("%o", token)
    //console.log(JSON.stringify(token))
    //console.log(JSON.stringify(token, null, 3))
    // //console.log(JSON.stringify(token4, null, 3));
    // console.log(token);
    // console.log(token2);
    // console.log(token3);
    // console.log(token4);
    //const token = req.header('x-token');

    if( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        });
    }

    try {
        const { uid } = jwt.verify( token, SEED );

        //console.log(uid);

        req.uid = uid;

        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token incorrecto'
        });
    }   
    
}

module.exports = {
    validarJWT,
    validarJWT_params
}