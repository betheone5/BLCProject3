####BLC Project 3

### Installing and running the services

**Prequisite**

1. NodeJS
2. Truffle - The app does not utilize the full potential of truffle yet. Truffle integration is currently under development. But at this stage  the app uses truffle artifacts for contract abstractions.
3. IPFS - A distributed storage system. You can find the installation instructions [here][1]

```
git clone https://netsblockchain.visualstudio.com/VirtualID/_git/MobileVirtualID
cd MobileVirtualID
npm install

node index.js
```

### Folder Structure

#### Mobile_RestService
This is the repo of the rest service api. This repo is inturn sub-divided into
	- config
	- controller 	
	- middlewares

----
The config folder has all the configuration and helper functions for the app

**contracts**: *This module wraps all the contracts using truffle-contracts and gives us a truffle-contract collection.*

**environment**: *This module exports all the helper functions and configuration to the app.*

**filePath**: *This defined file paths for truffle contract and notification database.*

**nedbSchema**: *This module defines a record that stores user activity. This enables the app to pickup unread notification and push them to the repective banks.*

**nemidValidation**: *Validating users connecting to blockchain using Nets protocol.*

**prettyPrint**: *A small function of printing out logs in the rest service terminal. There are many logging packages available in the market for e.g **Morgan**.*

**socketTags**: *This is a small object that maintains socket tags. Instead of writing the socket names each and every time,it is convinient to import this object and use it. This maintains uniform naming for sockets throughout the app.*

**web3**: *The web3 object which is used to interact with blockchain.*

**web3p**: *Promisified web3js functions.*

**NOTE: SOME OF THE MODULES CAN BE REPLACED OR MERGED WITH OTHER MODULES**

----
The controller folder defined two different routes for the restservice:

**blockchainAPI.js**: *This defines all the api routes for interacting with blockchain.*

**userRegister.js**: *This defined routes which issues tokens to users.*

----
The middleware folder contains all functions which are executed during all route calls:

**jwtTokens.js**:  *This will analyze each and every request, for jwt tokens.If it is a valid token, request is processed else rejected.*

#### Messaging_Server

The messaging server has one NeDB database file and a notification.js file.

- This will store all the user request in the database.

-  It creates room for each and every client connecting to the api.

- Currently it has only one function, which acts as a push notification server for banks.

#### Contracts

This is a  truffle contracts folder.It contains all contracts needed for this app to run. 
**Currenlty the  app uses plain contract function call. All the function calls will be converted to truffle.**


  [1]: https://ipfs.io/docs/install/
