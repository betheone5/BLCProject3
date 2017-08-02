const app = require('http').createServer(function(req, res){
    res.write("Socket.IO Started");
    res.end();
});
const io = require('socket.io')(app);
const appRoot = require("app-root-path");
const nedb = require("nedb");
const helper = require(appRoot.path+"/Contracts/helper.js");
const _socket = helper._socket;
const notificationDB = new nedb({ filename: __dirname + '/db_notification.db', autoload: true });

app.listen(3233);

io.on("connection", function(socket){

    /*
    *  Display message when a client gets connected
    */
    socket.emit("message", "Connected to socket.io");

    /**
    *  Create a socket rooms for both the clients - Mobile and Bank
    */
    socket.on("join", function(data){

        console.log("create a room for " + data.user);
        socket.join(data.user);
    });


    /*
     * Get all unread notification for a given client and bank
    */
    socket.on(_socket.request.unread, function(data){
        notificationDB.find({status: "unread"}, function(err, unreadRecordsCollection){
            var allReceivers = unreadRecordsCollection.map(function(unreadRecord){
                return unreadRecord.receiver;
            });
            arrayUniq(allReceivers).forEach(function(bankName){
                var allRecords = unreadRecordsCollection.filter(function(notifyRecord){
                    return notifyRecord.receiver === bankName;
                });
                io.sockets.in(bankName).emit(_socket.response.unread, allRecords);
            });

        });
        //io.sockets.in(data.user).emit(_socket.response.unread, "You got your data");
    });


    /*
     * Enter a new record in db
    */
    socket.on("insert", function(data, fn){
        var sf = {
            error: "",
            status: false,
            id: ""
        };
        console.log(data);
        notificationDB.insert(JSON.parse(data), function (err, newDoc) {   // Callback is optional
            if(err){
                console.log("Error while inserting data");
                console.log(err);
                sf.error = err;
                sf.status = false;
            }
            else{
                console.log(newDoc);
                sf.status = true;
                sf.id = newDoc._id;

                io.sockets.in(newDoc.receiver).emit(_socket.response.unread, newDoc);

            }
            //fn(sf);
        });
    });

});

function getUnreadNotificationFromDB(){
    return new Promise(function(resolve, reject){
        notificationDB.find({status: "unread"}, function(err, docs){
            if(err){
                reject(err);
            }
            else{
                resolve(docs);
            }
        });
    });
}

function arrayUniq(_array){
    var seen = {};
    var out = [];
    var len = _array.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = _array[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
