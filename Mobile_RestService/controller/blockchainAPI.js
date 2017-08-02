const ENV = require("../config/environment");
const web3 = ENV.web3;
const web3p = ENV.web3p;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const io = require('socket.io-client');
const router = express.Router();
const nedb = require('nedb');
const Busboy = require('busboy');
const fs = require("fs");
const ipfs = require("ipfs-api")("/ip4/127.0.0.1/tcp/5001");
const jwt = require("jsonwebtoken");

const waitTx = ENV.waitTx;
const ports = ENV.ports;
var DBSchema = ENV.schema.notification;
const contracts = ENV.contracts;

const REST = "r";
const SOCKET = "s";
const GET = "g";
const POST = "p";
const LOG = ENV.print.log;
const print = ENV.print.print;

let IDM_Registry = ENV.idmcontracts.Registry;
let IDM_Profile = ENV.idmcontracts.getProfile;

const contract_profile = contracts.testProfile;
const contract_registry = contracts.testRegistry;

const notificationDB = new nedb({ filename: ENV.nedb, autoload: true });
const serverPort = ports.mobileServer;
const socket = io("http://localhost:" + ports.socketServer);

var transactionType = { signed: "signed", unsigned: "unsigned" };
var thisTransaction = "unsigned";

/**
 *  Establish socket connection to create a room
 */
socket.on("message", function(data) {
   LOG({
     head: SOCKET,
     msg: "Response from socket : " + data
   });
});

/**
 * @SNO         1
 * @method      "/"
 * @type        GET
 * @description Test connectivity
 * @status      Active
 */
router.get("/", function(req,res){

  LOG({
    head: REST, headType: GET,
    headTitle: "Simple '/' route for testing"
  });
  print("Response sent : " + JSON.stringify({ message: "Connected to REST API" }));
  
  res.json({ message: "Connected to REST API" });
  
});

/**
 * @SNO         2
 * @method      "/grantAccess"
 * @type        POST
 * @description User grants access to a bank
 * @status      Active --  Change contracts
 */
router.post("/grantAccess", function(req,res){

  LOG({
    head: REST,
    headType: POST,
    headTitle: "Grant access to bank",
    data: req.body
  });

  thisTransaction = "unsigned";

  var postData = req.body;

  var profileContractAddress = _testregistry.getUserDetail(postData.userNEMID)[1];                

  if(thisTransaction === transactionType.unsigned){
      var profile = web3.eth.contract(contract_profile.abi).at(profileContractAddress);
      var tx = profile.registerBank(postData.bankID, {from: web3.eth.coinbase});

      waitTx(tx, function(err, result){
          if(err){
              res.json({"bankID": false});
          }
          else if(result){
              var dddddd = helper.DBSchema();
              dddddd.userNEMID = postData.userNEMID;

              socket.emit("insert", JSON.stringify(dddddd));

              res.json({"bankID": postData.bankID});
          }
      });
  }
  else{

  }
});

/**
 * @SNO         3
 * @method      "/doesUserExists"
 * @type        POST
 * @description Check whether a user exists in registry
 * @status      Active
 */
router.post("/doesUserExists", function(req, res){

  LOG({ head: REST, headType: POST, data: req.body,
    headTitle: "Check whether user exists in registry"    
  });      

  IDM_Registry.isRegistered(req.decoded.userAccount)
              .then(function(status){
                if(status){
                  res.json({status: true});
                }
                else{
                  res.json({status: false});
                }
              });

});

/**
 * @SNO         4
 * @method      "/getProfileByteCode"
 * @type        GET
 * @description ByteCode for the profile contract
 * @status      Active
 */
router.get("/getProfileByteCode", function(req, res){

  LOG({head: REST, headType: GET,
    headTitle: "Get the profile contract abi"
  });  

  print("Response sent : " + JSON.stringify({"byteCode": contract_profile.unlinked_binary}));

  res.json({"byteCode" : ENV.contracts.testProfile._json.unlinked_binary});
  
});

/**
 * @SNO         5
 * @method      "/registerUser"
 * @type        POST
 * @description Register user in the registry contract
 * @status      Active
 */
router.post("/registerUser", function(req, res){

  LOG({head: REST, headType: POST, data: JSON.stringify(req.body),
    headTitle: "Register user in blockchain"    
  });

  thisTransaction = "unsigned";

  let postData = req.body;
  web3.eth.defaultAccount = web3.eth.coinbase;
  let userAccount = req.decoded.userAccount;

  IDM_Registry.registerUser(userAccount, {from: web3.eth.coinbase})
              .then(function(txID){
                print("User registered in registry");
                
                web3p.eth.sendTransaction({from: web3.eth.coinbase, to: userAccount, value: web3.toWei(10,"ether")})
                  .then(function(){
                    print("User account credited with 10 ethers");
                    res.json({"status": "registered"});
                  })
                  .catch(function(er){
                    print("Error when crediting user account : " + er);
                  });
              })
              .catch(function(error){
                console.log(error);
                res.json({"status": "error when registering"});
              });

});
/**
 * @SNO         6
 * @method      "/getNonce"
 * @type        GET
 * @description Get nonce for the user
 * @status      Active
 */
router.get("/getNonce", function(req, res){

  LOG({head: REST, headType: GET, data: req.params,
    headTitle: "Get the nonce for the given user"    
  });

  var userEthAdr = req.params.userAddress;
  var userNonce = web3.eth.getTransactionCount(req.decoded.userAccount, "latest")
  print("Response sent : " + JSON.stringify({"nonce": userNonce}));
  res.json({"nonce": userNonce});

});
/**
 * @SNO         7
 * @method      "/createProfile"
 * @type        POST
 * @description Deploys a profile contract for the user
 * @status      Active
 */
router.post("/createProfile", function(req, res){

  LOG({ head: REST, headType: POST, data: req.body,
        headTitle: "Deploy profile contract for the user"    
  });

  thisTransaction = "signed";

  var postData = req.body;

  if(thisTransaction === transactionType.unsigned){
    var _pname = postData.name;
    var _pdob = postData.dob;
    var _pnationality = postData.nationality;
    var _pcontact = +postData.mobile;
    var _pemail = postData.email;
    var _paddress = postData.userAddress;          

    var defn = web3.eth.contract(contract_profile.abi)
    
    defn.new(
        _pname, _pdob, _pnationality, _pcontact, _pemail, _paddress,
                    {from: web3.eth.accounts[0], data: contract_profile.unlinked_binary, gas: "4700000"},
                    function(e, contract){

      if(typeof contract.address !== 'undefined'){ 
        console.log("Contract deployed: " + contract.address); 
        
        var txProfile = _testregistry.registerProfileContract(postData.nemid, contract.address, {from: web3.eth.coinbase});
        console.log(txProfile)
                    waitTx(txProfile, function(err, status){
                      res.json({"profileID": contract.address});		
                    });				
      }
    });
  }
  else{
    thisTransaction = "unsigned";
    web3p.eth.sendRawTransaction(postData.signedData)
        .then(function(data){
          
          let contractAddress = web3.eth.getTransactionReceipt(data.hash).contractAddress;        

          IDM_Registry.registerContract(req.decoded.userAccount, contractAddress, {from:web3.eth.coinbase})
              .then(function(){
                  res.json({
                    "profileID": contractAddress
                  });
              });          
        });    
  }
});
/**
 * @SNO         8
 * @method      "/getProfile"
 * @type        GET
 * @description Get profile details for the given user
 * @status      Active
 */
router.get("/getProfile", function(req, res){

  LOG({head: REST, headType: GET, data: req.params,
    headTitle: "Get profile details for the user"    
  });  

  IDM_Profile(req.decoded.userAccount)
    .then(function(instance){
      instance.getDetails({from: req.decoded.userAccount})
          .then(function(data1){
            res.json({ "name": data1[0],
              "dob": data1[1], "nationality": data1[2], "address1": data1[5],
              "address2": "street", "address3": "district", "address4": "State",
              "mobile": data1[3].toNumber(), "email": data1[0]
            });
          });      
    });  
});

/**
 * @SNO         9
 * @method      "/uploadFile"
 * @type        POST
 * @description Save a file in IPFS
 * @status      Active
 */      
router.post("/uploadFile", function(req,res){

  LOG({ head: REST, headType: POST,
    headTitle: "Uploading a file to IPFS"
  });

  var busboy = new Busboy({ headers: req.headers });

  var newObj = {};

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    print('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    var fileToBeSaved = __dirname + "/" + filename;
    var ipfsStream = file.pipe(fs.createWriteStream(fileToBeSaved));
    
    ipfsStream.on("finish",function(){
        ipfs.util.addFromFs(fileToBeSaved, { recursive: true , ignore: ['subfolder/to/ignore/**']}, (err, result) => {
          if (err) {
            throw err;
          }
          newObj.IPFSHash = result[0].hash;
          res.json({
            fileHash: newObj.IPFSHash
          });
          try{
            /*
            IDM_Profile(req.decoded.userAccount)
              .then(function(instance){
                  instance.uploadDocument(newObj.type.toLowerCase(), filename, newObj.IPFSHash,{from: web3.eth.coinbase, gas: "4700000"})
                    .then(function(txHash){
                      print("Response sent to client: " + JSON.stringify(newObj));
                      res.json(newObj);
                    });
              });
            */
            /*
            var profileContractAddress = _testregistry.getUserDetail(newObj.userNEMID)[1];
            var profile = web3.eth.contract(contract_profile.abi).at(profileContractAddress);		
            var status =  profile.uploadDocument(newObj.type.toLowerCase(), filename, newObj.IPFSHash,{from: web3.eth.coinbase, gas: "4700000"});                 
            */
          }
          catch(ex){
            print(ex.message);
          }
          
        });
    });           
  });

  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    newObj[fieldname] = val;
  });
  
  req.pipe(busboy);
});

/**
 * @SNO         10
 * @method      "/getFiles"
 * @type        GET
 * @description Get all the file type requested by user
 * @status      Active
 */
 router.get("/getFiles/:docType", function(req, res){

  LOG({
    head: REST,
    headType: GET,
    headTitle: "Get all files for the user",
    data: req.params
  });

  var ALLDOCS = ["passport", "utility", "license"];
  var reqDocument = ALLDOCS.indexOf(req.params.docType.trim().toLowerCase());
  var newArray = [];
  if(reqDocument > -1){

    let COUNT;

    IDM_Profile(req.decoded.userAccount)
        .then(function(instance){
            var profileInstance = instance;
            profileInstance.countDocument({from: req.decoded.userAccount})
                .then(function(data){                  
                  COUNT = data[reqDocument].toNumber();

                  if(COUNT === 0){
                    res.json({"files": newArray});
                  }
                  else{
                    for(i = 0; i < COUNT; i++){
                      profileInstance.getDocument(req.params.docType.trim().toLowerCase(), i, {from: req.decoded.userAccount})
                          .then(function(data){                    
                            newArray.push(data);                            
                            if(COUNT === newArray.length){                            
                              res.json({"files": newArray});
                            }
                          });
                    }
                  }                                    
                });
        });
  }
      else{
          res.json({"files":"No files exists for the user"});
      }
});

/**
 * @SNO         11
 * @method      "/getFileFromHash"
 * @type        GET
 * @description Get the file from IPFS using file hash
 * @status      Inactive
 */
 router.get("/getFileFromHash/:fileHash", function(req, res){

  LOG({ head: REST, headType: GET, data: req.params,
    headTitle: "Get file for the given hash"    
  });

  ipfs.files.cat(req.params.fileHash).then(function(d){
    var t;
    d.on("data", function(d1){ t += d1; });
    d.on("end", function(){ res.send(t); });
  });

});

/**
 * @SNO         13
 * @method      "/signTransaction"
 * @type        POST
 * @description Execute the signed transaction coming from user
 * @status      Active
 */
router.post("/signTransaction", function(req, res){

  LOG({ head: REST, headType: POST, data: req.body,
        headTitle: "Execute the signed transaction coming from user"
  });

  web3p.eth.sendRawTransaction(req.body.signedData)
       .then(function(data){
            res.json(data);
       });
});

/**
 * @SNO         14     
 * @method      "/getContract"
 * @type        GET
 * @description Get the profile contract address for the user
 * @status      Active
 */
router.get("/getContract", function(req, res){

  LOG({ head: REST, headType: GET, data: req.body,
        headTitle: "Retrieve the profile contract address for the given ethereum account"
  });

  IDM_Registry.getUserDetails(req.decoded.userAccount)
      .then(function(data){
        console.log(data);
        res.json({"result": data});
      });

});

module.exports = router;