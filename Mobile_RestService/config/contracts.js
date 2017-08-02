const truffleContract = require("truffle-contract");
const fs = require("fs");
const web3 =  require("./web3.js");
const trufflePath = require("./filePath").contracts;
let contracts = {};

let requiredContracts  = ["IDMRegistry.json", "testProfile.json"];

fs.readdirSync(trufflePath  + "/build/contracts").forEach(function(contractFileName){  
    if(requiredContracts.indexOf(contractFileName) > -1)  {
        var contractName = contractFileName.substring(0,contractFileName.indexOf(".json"));
        console.log("Reading " + contractFileName + " ...");
        contracts[contractName] = truffleContract(JSON.parse(fs.readFileSync(trufflePath + "/build/contracts/" + contractFileName, "utf-8"))); 
        contracts[contractName].setProvider(web3.currentProvider);
        console.log("Added to project");
    }
});

module.exports = contracts;