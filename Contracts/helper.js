const Web3 = require("web3");
const appRoot = require("app-root-path");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fs = require("fs");
const contractsPath = appRoot.path+"/Contracts/build/contracts";
const truffleContract = require('truffle-contract');

//Truffle Contracts
var smartContracts = {};

var allFiles = fs.readdirSync(contractsPath);

allFiles.forEach(function(indContract){
  var name = indContract.substring(0, indContract.indexOf(".json"));
  smartContracts[name] = JSON.parse(fs.readFileSync(contractsPath + "/" + indContract, "utf-8"));
});

const _socket = {
    request : {
        unread: "requnreadmsgs"
    },
    response : {
        unread: "resunreadmsgs"
    }
};

var DBSchema = function(){
    return {
        sender: "Empty",
        receiver: "Bank1",
        message: "Empty",
        approved: false,
        status: "unread",
        userNEMID: ""
    };
};

var description = {
  head: {
    REST: "@RestService",
    SOCKET: "@Socket"
  },
  headType: {
    POST: "POST",
    GET: "GET"
  },
  REQUEST: function(_heading){
    /**
     * head -> heading(@RestService, @Socket),
     * headType -> description,
     * headTitle -> header description
     * data -> post data
    */
    var msg = " " + _heading.head;
    console.log("\n---------------------------------------------------------------------------");
    if(_heading.headType){
      msg += " - " + _heading.headType;
    }
    if(_heading.headTitle){
      msg += " : " + _heading.headTitle
    }
    console.log(msg);
    console.log("---------------------------------------------------------------------------\n");
    if(_heading.data){
      msg = typeof _heading.data === "object" ? JSON.stringify(_heading.data) : _heading.data;
      console.log("  Data from client : " + msg + "\n");
    }
    if(_heading.msg){
      console.log("  " + _heading.msg);
    }
  },
  RESPONSE: function(_data){
    var msg = _data;
    if(typeof _data === "object"){
      msg = JSON.stringify(_data);
    }
    console.log(" Response sent : " + msg);
  }
};

module.exports = {
    ports: {
        mobileServer: 3133,
        bankServer: 3333,
        socketServer: 3233
    },
    DBSchema: DBSchema,
    _socket: _socket,
    contracts: smartContracts,
    waitTx: waitForTransaction,
    checkUserBalance: checkUserBalance,
    createContract: createContract,
    description: description
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

function checkUserBalance(userAddress){

    console.log("\n Check user balance, if it is zero fund the account: " + userAddress);

    var initialBalance = web3.eth.getBalance(userAddress);

    if(typeof initialBalance === "object"){
        initialBalance = initialBalance.toNumber();
    }
    console.log(initialBalance);
    if(initialBalance == 0){
        return new Promise(function(resolve, reject){
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: userAddress, value: web3.toWei(5, "ether")}, function(err, txHash){
                if(err){
                    console.log("Error funding account : " + err);
                }
                else{
                    var ci = setInterval(function(){
                    web3.eth.getTransaction(txHash, function(err1, txObj){
                            if(err1){
                                clearInterval(ci);
                                console.log(err1);
                                reject(err1);
                            }
                            if(txObj.blockNumber !== null){
                                clearInterval(ci);
                                resolve(true);
                            }
                        });
                    }, 1000);
                }
            });
        });
    }
    else{
        return new Promise(function(resolve, reject){
            if(true){
                resolve(true);
            }
            else{
                reject(false);
            }
        });
    }
}

function privateDeployContract(contractObj){
  return new Promise(function(resolve, reject){

    var _abi = typeof contractObj.abi === "object" ? contractObj.abi : JSON.parse(contractObj.abi);

    var mycobj = web3.eth.contract(_abi);

    var deploy = mycobj.new({
      from: web3.eth.coinbase,
      data: contractObj.unlinked_binary,
      gas: "4700000"
    }, function(e, c){
      if(e){
        reject(e);
      }
      if(!!c.address){
        console.log(contractObj.contract_name + "is deployed : " + c.address);
        var emptyObj = {};
        emptyObj.cName = contractObj.contract_name;
        emptyObj.cAddress = c.address;
        resolve(emptyObj);
      }
    });

    /*
    mycobj.new({ from: web3.eth.accounts[0], data: contractObj.unlinked_binary, gas: '4700000'},
      function (e, contract){
         if(e){
           reject(e);
         }
         else if (typeof contract.address !== 'undefined') {
           var emptyObj = {};
           emptyObj.cName = contractObj.contract_name;
           emptyObj.cAddress = contract.address;
           resolve(emptyObj);
         }
      });
      */
  });
}

function createContract(contractObj, dependencies){
  var depencyArray = [];
  var promises = [];
  var mainContractCode = contractObj.unlinked_binary;

  if(!!dependencies){
     if(Object.prototype.toString.call(dependencies) === "[object Object]"){
       depencyArray.push(dependencies);
     }
     else if(Object.prototype.toString.call(dependencies) === "[object Array]"){
       depencyArray = dependencies;
     }
  }

  depencyArray.forEach(function(lib){
    console.log("Deploying Library : " + lib.contract_name);
    promises.push(privateDeployContract(lib));
  });

  return Promise.all(promises).then(function(allAddress){
    allAddress.forEach(function(eachLib){
        if(mainContractCode.indexOf(eachLib.cName) > -1){
          console.log("Linking library : " + eachLib.cName);
          var constructName = new RegExp("_+" + eachLib.cName + "_+");
          mainContractCode = mainContractCode.replace(constructName, eachLib.cAddress.substring(2, eachLib.cAddress.length));
        }
    });
    contractObj.unlinked_binary = mainContractCode;
    //return privateDeployContract(contractObj);
    return mainContractCode;
  });
}
