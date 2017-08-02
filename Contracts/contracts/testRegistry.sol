pragma solidity ^0.4.8;

contract testRegistry{
   
    function indexOf(address[] addArray, address findArray) constant returns(uint){
        uint count = 0;
        uint index = 0;
       
        for(uint i = 0; i < addArray.length; i++){
            if(addArray[i] == findArray && count == 0){
                index = i + 1;
                count++;
            }
        }
       
        if(count == 0){
            return 0;
        }
        else{
            return index;
        }
    }
   
    function remove(address[] storage addArray, address delAddress) internal constant returns(address[]){
        uint count = 0;
        uint index = 0;
       
        for(uint i = 0; i < addArray.length; i++){
            if(addArray[i] == delAddress && count == 0){
                index = i + 1;
                count++;
            }
        }
       
        if(count == 0){
            return addArray;
        }
        else{
           
            index--;
       
            if (index >= addArray.length) return;

            for (uint j = index; j < addArray.length-1; j++){
                addArray[j] = addArray[j + 1];
            }
            delete addArray[addArray.length-1];
            addArray.length--;
            return addArray;
   
        }
    }
    
    enum contractState { Inactive, Active, Delete }
   
    uint private PROXYCONTRACT = 0;
    uint private PROFILECONTRACT = 1;
    uint private ASSETMGMTCONTRACT = 2;
    address private DEFAULTACCOUNT = 0x0000000000000000000000000000000000000000;
    string public flag;
   
    struct userContract{ 
        string _label;
        address _address;  
        contractState _status; 
        uint _timestamp; 
    }
    
    struct User{ 
        address _currentAccount; 
        bool _registered;
    }
   
    mapping(string => mapping(uint => userContract[])) map_nemid_contracts;
    mapping(string => User) map_nemid_STRUCT_user;
    mapping(string => address) map_contractaddress_nemid; // profile 
   
    function doesUserExists(string _pnemid) constant returns(bool){
        User memory _currentUser = map_nemid_STRUCT_user[_pnemid];
        return _currentUser._registered;
    }
   
    function registerUser(string _pnemid, address _pethaccount) {
        if(doesUserExists(_pnemid)){
           throw;
        }        
        User memory _currentUser = User(_pethaccount, true);
        map_nemid_STRUCT_user[_pnemid] = _currentUser;
    }
    
    function registerProfileContract(string _pnemid, address contractAddress){
        //if(doesUserExists(_pnemid)){
            //if(map_contractaddress_nemid[_pnemid] == address(0)){
            	map_contractaddress_nemid[_pnemid] = contractAddress;
            //}
            //else{
                //throw;
            //}
        //}
    }
   
    function getUserDetail(string _pnemid) constant returns(address, address){
        if(doesUserExists(_pnemid)){
            User memory _currentUser = map_nemid_STRUCT_user[_pnemid];
            return (map_nemid_STRUCT_user[_pnemid]._currentAccount,map_contractaddress_nemid[_pnemid]);
            }
        
    }

   
    function getUserContract(string _pnemid, string _ptype, uint _pindex) constant returns(address){
        userContract[] user_contractCollection = map_nemid_contracts[_pnemid][PROXYCONTRACT];
              
        if(_pindex <= user_contractCollection.length){
            return user_contractCollection[_pindex]._address;
        }
        
        return DEFAULTACCOUNT;
    }
   
}
