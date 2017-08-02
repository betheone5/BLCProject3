const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const tokenSecret = require("../config/environment").tokenSecret;
const print = require("../config/environment").print;
const web3 = require("../config/environment").web3;
const contracts = require("../config/environment").contracts;

router.post("/",function(req,res){	
	res.json({"message":"connected"});
});

router.post('/authenticate', function(req, res){

	console.log(req.body);

	let token = jwt.sign(req.body, tokenSecret, {
	    expiresIn: 1200
	});   
	res.json({"token": token});     
});

module.exports = router;
