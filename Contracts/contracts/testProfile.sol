pragma solidity ^0.4.8;

library stringCompare{
    struct slice {
        uint _len;
        uint _ptr;
    }

    function memcpy(uint dest, uint src, uint len) private {
        // Copy word-length chunks while possible
        for(; len >= 32; len -= 32) {
            assembly {
                mstore(dest, mload(src))
            }
            dest += 32;
            src += 32;
        }

        // Copy remaining bytes
        uint mask = 256 ** (32 - len) - 1;
        assembly {
            let srcpart := and(mload(src), not(mask))
            let destpart := and(mload(dest), mask)
            mstore(dest, or(destpart, srcpart))
        }
    }

    function toSlice(string self) internal returns (slice) {
        uint ptr;
        assembly {
            ptr := add(self, 0x20)
        }
        return slice(bytes(self).length, ptr);
    }

    function compare(slice self, slice other) internal returns (int) {
        uint shortest = self._len;
        if (other._len < self._len)
            shortest = other._len;

        var selfptr = self._ptr;
        var otherptr = other._ptr;
        for (uint idx = 0; idx < shortest; idx += 32) {
            uint a;
            uint b;
            assembly {
                a := mload(selfptr)
                b := mload(otherptr)
            }
            if (a != b) {
                // Mask out irrelevant bytes and check again
                uint mask = ~(2 ** (8 * (32 - shortest + idx)) - 1);
                var diff = (a & mask) - (b & mask);
                if (diff != 0)
                    return int(diff);
            }
            selfptr += 32;
            otherptr += 32;
        }
        return int(self._len) - int(other._len);
    }

    function equals(string self, string other) internal returns (bool) {
        var s1 = toSlice(self);
        var s2 = toSlice(other);
        return compare(s1, s2) == 0;
    }

     function toString(string _self) internal returns (string) {
         var self = toSlice(_self);
        var ret = new string(self._len);
        uint retptr;
        assembly { retptr := add(ret, 32) }

        memcpy(retptr, self._ptr, self._len);
        return ret;
    }
}

contract testProfile{

    string private userName = "";
    string private userDOB = "";
    string private userNationality = "";
    uint private userContact = 0;
    string private userEmail = "";
    string private userAddress = "";
    string private hashPassport = "";
    string private hashLicense = "";
    string private hashBill = "";

    address private user_activeAccount;
    address[] private user_allAccounts;
    address[] private bankMembers;
    address private owner;

    address[] private permissionProfile;
    address[] private permissionPassport;
    address[] private permissionUtility;
    address[] private permissionLicense;
    address[] private initializeAddressArray;

    struct file{
        string hash;
        string name;
    }

    string FILE_Passport = "passport";
    string FILE_Utiltiy = "utility";
    string FILE_License = "license";
    mapping(string => file[]) userDocuments;

    modifier passportGroup{

	    uint memberCount = permissionPassport.length;

	    for(uint i = 0; i < memberCount; i++){
            if(permissionPassport[i] == msg.sender){
                _;
                break;
            }

            else{
                continue;
            }
        }
    }

    modifier utilityGroup{

	   uint memberCount = permissionUtility.length;

	    for(uint i = 0; i < memberCount; i++){
            if(permissionUtility[i] == msg.sender){
                _;
                break;
            }

            else{
                continue;
            }
      }
    }

    modifier licenseGroup{

	    uint memberCount = permissionLicense.length;

	    for(uint i = 0; i < memberCount; i++){
            if(permissionLicense[i] == msg.sender){
                _;
                break;
            }

            else{
                continue;
            }
        }
    }

    modifier profileGroup{

      uint memberCount = permissionProfile.length;

	    for(uint i = 0; i < memberCount; i++){
            if(permissionProfile[i] == msg.sender){
                _;
                break;
            }

            else{
                continue;
            }
      }
    }

    modifier onlyUser{
        if(msg.sender != owner){
            throw;
        }
        _;
    }

    modifier bankAccess{
        var _asd = bankMembers;
        for(uint i = 0; i < _asd.length; i++){
            if(_asd[i] == msg.sender){
                _;
                break;
            }

            else{
                continue;
            }
        }
    }

    mapping(string => string[]) documents;

    function indexOf(address[] addArray, address findArray) constant returns(int){
        uint count = 0;
        uint index = 0;

        int result;

        for(uint i = 0; i < addArray.length; i++){
            if(addArray[i] == findArray && count == 0){
                index = i + 1;
                count++;
            }
        }

        if(count == 0){
            result = -1;
        }
        else{
            result = int(index) - 1;
        }

        return result;
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


    function removePermissions(address adrtoremove){
	    remove(bankMembers, adrtoremove);
    }

    function registerBank(address admintoadd){
        uint flag;
        for(uint i = 0; i < bankMembers.length; i++){
             if(bankMembers[i] == admintoadd){
                flag = 1;
            }
            else{
                flag = 0;
            }
        }
        if(flag == 0){
            bankMembers.push(admintoadd);
        }
    }

    /*
     *  Define permissions for access
     */

    function changeOwner(address newOwner){
        permissionPassport.push(newOwner);
        permissionProfile.push(newOwner);
        permissionUtility.push(newOwner);
        permissionLicense.push(newOwner);
        bankMembers.push(newOwner);
     }

    function getPermission(string _type) constant returns(address[]){
        address[] memory h;
        if(stringCompare.equals(_type, "passport")){
            h = permissionPassport;
        }
        else if(stringCompare.equals(_type, "utility")){
            h = permissionUtility;
        }
        else if(stringCompare.equals(_type, "license")){
            h = permissionLicense;
        }
        else{
            h = initializeAddressArray;
        }
        return h;
    }

    function setPermission(string permissionType, address member){
        if(stringCompare.equals(permissionType, "profile")){
            permissionProfile.push(member);
        }
        else if(stringCompare.equals(permissionType, "passport")){
            permissionPassport.push(member);
        }
        else if(stringCompare.equals(permissionType, "utility")){
            permissionUtility.push(member);
        }
        else if(stringCompare.equals(permissionType, "license")){
            permissionLicense.push(member);
        }
    }

    function removePermission(string permissionType, address member){
        if(stringCompare.equals(permissionType, "profile")){
            remove(permissionProfile,member);
        }
        else if(stringCompare.equals(permissionType, "passport")){
            remove(permissionPassport,member);
        }
        else if(stringCompare.equals(permissionType, "utility")){
            remove(permissionUtility,member);
        }
        else if(stringCompare.equals(permissionType, "license")){
            remove(permissionLicense,member);
        }
    }

    /*
     *  Profile Handling
     */
    function testProfile(string _pname, string _pdob, string _pnationality, uint _pcontact, string _pemail, string _paddress){
        userName = _pname;
        userDOB = _pdob;
        userNationality = _pnationality;
        userContact = _pcontact;
        userEmail = _pemail;
        userAddress = _paddress;
        changeOwner(msg.sender);
    }

    function getDetails() profileGroup constant returns(string, string, string, uint, string, string){
        return (
            userName,
            userDOB,
            userNationality,
            userContact,
            userEmail,
            userAddress
        );
    }

    /*
     *  Document Handling
     */

    function uploadDocument(string _docType, string _fileName, string fileHash){

        bool fileTypeExists = false;

        if(stringCompare.equals(_docType, FILE_Passport)){
            fileTypeExists = true;
        }
        else if(stringCompare.equals(_docType, FILE_Utiltiy)){
            fileTypeExists = true;
        }
        else if(stringCompare.equals(_docType, FILE_License)){
            fileTypeExists = true;            
        }

        if(fileTypeExists){
            userDocuments[_docType].push(file(fileHash, _fileName));
        }        
    }

    function getDocument(string _docType, uint _index) constant returns(string, string){
        if(stringCompare.equals(_docType, FILE_Passport)){
            if(indexOf(permissionPassport,msg.sender) == -1){
                return ("Unauthorised", "Unauthorised");
            }
            else if(userDocuments[FILE_Passport].length == 0 || _index >= userDocuments[FILE_Passport].length){
                return ("Empty", "Empty");
            }
            else{
                return (userDocuments[FILE_Passport][_index].hash,userDocuments[FILE_Passport][_index].name);
            }
        }
        else if(stringCompare.equals(_docType, FILE_Utiltiy)){
            if(indexOf(permissionUtility,msg.sender) == -1){
                return ("Unauthorised", "Unauthorised");
            }
            else if(userDocuments[FILE_Utiltiy].length == 0 || _index >= userDocuments[FILE_Utiltiy].length){
                return ("Empty", "Empty");
            }
            else{
                return (userDocuments[FILE_Utiltiy][_index].hash,userDocuments[FILE_Utiltiy][_index].name);
            }
        }
        else if(stringCompare.equals(_docType, FILE_License)){
            if(indexOf(permissionPassport,msg.sender) == -1){
                return ("Unauthorised", "Unauthorised");
            }
            else if(userDocuments[FILE_License].length == 0 || _index >= userDocuments[FILE_License].length){
                return ("Empty", "Empty");
            }
            else{
                return (userDocuments[FILE_License][_index].hash,userDocuments[FILE_License][_index].name);
            }
        }
    }    

    function countDocument() constant returns(uint, uint, uint){
        return (userDocuments[FILE_Passport].length, userDocuments[FILE_Utiltiy].length, userDocuments[FILE_License].length);
    }
}

