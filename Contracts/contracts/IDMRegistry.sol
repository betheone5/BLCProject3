pragma solidity ^0.4.8;

contract IDMRegistry{
    
    address emptyAddress = 0x0000000000000000000000000000000000000000;
    address IDMOwner;
    
    mapping(address => mapping(string => address)) userAddress_cType_cAddress;
    mapping(address => bool) registered;
    
    modifier onlyIDM{
        require(msg.sender == IDMOwner);
        _;
    }
    
    function IDMRegistry(){
        IDMOwner = msg.sender;
    }
    
    function isRegistered(address userEthAccount) constant returns(bool){
        return registered[userEthAccount];
    }
    
    function registerUser(address userEthAccount){
        require(!isRegistered(userEthAccount));
        registered[userEthAccount] = true;
    }
    
    function registerContract(address userEthAccount, address userProfile){
        require(isRegistered(userEthAccount));
        userAddress_cType_cAddress[userEthAccount]["Profile"] = userProfile;
    }
    
    function getUserDetails(address userEthAccount) constant returns(address){
        require(isRegistered(userEthAccount));
        return userAddress_cType_cAddress[userEthAccount]["Profile"];
    }
    
    function deleteUserDetails(address userEthAccount){
        userAddress_cType_cAddress[userEthAccount]["Profile"] = emptyAddress;
    }
    
}
