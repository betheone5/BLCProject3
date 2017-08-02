const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/jwtTokens');

router.use('/app', require('./userRegister'));
router.use('/api', verifyToken, require('./blockchainAPI'));

module.exports = router;
