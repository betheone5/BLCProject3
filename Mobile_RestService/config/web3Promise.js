const web3 = require("./web3.js");

var web3p = {};
var eth = {};

eth.sendTransaction = function(obj){
    
    if(Object.prototype.toString.call(obj) !== "[object Object]" || Object.keys(obj).length === 0 || obj === null || obj === void 0 || !obj.from || !obj.to || !obj.value){
        throw "Argument should be a object with keys- from, to, value";
    }

    var txObj = {
        from: obj.from,
        to: obj.to,
        value: obj.value
    };

    var txHash = web3.eth.sendTransaction(obj);

    return this.onTransactionComplete(txHash).then(function(){
        return true;
    });

};

eth.onTransactionComplete = function(ptxHash){

    if(ptxHash === null || ptxHash === void 0){
        return false;
    }

    return new Promise(function(resolve, reject){
        var intervalTransaction = setInterval(function(){
            web3.eth.getTransaction(ptxHash, function(err, blockData){
                if(err){
                    reject(err);
                }
                else{
                    if(blockData.blockNumber !== null){
                        clearInterval(intervalTransaction);
                        resolve({
                            "status": "error",
                            "hash": ptxHash
                        });
                    }
                }
            });
        }, 2000);
    });
        
};

eth.sendRawTransaction = function(data){
    var txHash = web3.eth.sendRawTransaction(data);
    return this.onTransactionComplete(txHash);
};

eth.contract = function(abiArray){
    
    var ETHContract = function(){
        this.abi = abiArray;
    };

};

web3p.eth = eth;

module.exports = web3p;