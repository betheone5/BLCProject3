const web3 = require("./web3.js");
const prettyPrint = require("./prettyPrint.js");
const web3p = require("./web3Promise.js");
const schema = require("./nedbSchema.js");
const contracts = require("./contracts.js");
const idmcontracts= require("./IDM_Contracts.js");
const filePath = require("./filePath");

module.exports = {    
    contracts: contracts,
    idmcontracts: idmcontracts,
    ports: {
        mobileServer: 3133,
        socketServer: 3233
    },
    path: filePath,
    schema: schema,
    print: prettyPrint,
    tokenSecret : "IDMblockchainMobileApp",
    transactionType: { signed: "signed", unsigned: "unsigned" },
    web3: web3,
    web3p: web3p,
    waitTx:waitForTransaction
};


//After truffle integration below 
function waitForTransaction(txHash, cb){
  var checkInterval = setInterval(function(){
    var ethTransaction = web3.eth.getTransaction(txHash);
    if(ethTransaction.blockNumber !== null){
        clearInterval(checkInterval);
        cb(null, true);
    }
  }, 2000);
}