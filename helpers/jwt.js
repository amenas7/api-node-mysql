
const jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

const generarJWT = (uid) => {

    return new Promise( ( resolve, reject ) =>{
        const payload = {
            uid,
        };
    
        jwt.sign( payload, SEED , {
            expiresIn: '12h'
        }, ( err, token ) => {
            if ( err ){
                console.log(err);
                reject( 'No se pudo generar el JWT' );
            }else {
                resolve ( token );
            }
        });
    });    
}


module.exports = {
    generarJWT
}