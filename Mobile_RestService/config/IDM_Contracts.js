const truffleContract = require("truffle-contract");
const web3 =  require("./web3.js");
const contracts = require("./contracts.js");

const registryContractAddress = "0xac3a06fa5e798c45790c48057760619f623bf0d3";
const registry = contracts.IDMRegistry.at(registryContractAddress);

module.exports ={
  getProfile: function(userNEMID){
    if(userNEMID === null || userNEMID === void 0){
      throw "NemID is required for retrieving user contract";
    }

    return registry.getUserDetails(userNEMID)            
            .then(function(cAdr){              
              return contracts.testProfile.at(cAdr);
            });
  },
  Registry: registry
}