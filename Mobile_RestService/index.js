const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const ENV = require("./config/environment.js");
const LOG = ENV.print.log;
const port = ENV.ports.mobileServer;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
  next();
});

app.use(require("./controller"));
LOG({ head: "R", msg: "started at port " + port});
app.listen(port);