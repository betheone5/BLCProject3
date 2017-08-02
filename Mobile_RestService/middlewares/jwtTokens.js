const jwt = require('jsonwebtoken');
const tokenSecret = require("../config/environment").tokenSecret;
const print = require("../config/environment").print;

module.exports = function(req,res,next) {

    var token = req.headers['x-access-token'];
    console.log("token:"+token);

    if(token === null || token ===  void 0){
        res.json({"message": "Access token expected"});
        /*
            return res.status(403).send({
                "error": true
            });
	    */
    }
    else {
        console.log(tokenSecret);
        jwt.verify(token, tokenSecret, function(err, decoded) {
            if (err) { 
                console.log(err);
                return res.json({"message": "Invalid Token"});
            }            
            req.decoded = decoded;	    
            next();
        });
    }
};
