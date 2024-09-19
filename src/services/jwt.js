'use strict';

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'JWTT0k3n2024D3M0t0rs4pp';

exports.createToken = async (user) => 
{
    try 
    {
        const payload = {
            sub : user.ID,
            name : user.USUARIO,
            iat: moment().unix(),
            exp: moment().add(3, 'hours').unix()
        };
        return jwt.encode(payload, secretKey);
    } catch (err) 
    {
        console.log(err);
        return err;
    }
}