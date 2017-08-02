module.exports = {
	log: logConsole,
	print: printMessages
};

function logConsole(data){
    /**
     * head -> heading(@RestService, @Socket), R/S
     * headType -> description,                G/P       
     * headTitle -> header description
     * data -> post data
     * response -> response sent to client
    */

     var msg;

     if(data.response) {  
	    msg = typeof data.response === "object" ? JSON.stringify(data.response) : data.response;
	    console.log("  Data sent to Client : " + msg);
     }
     else{
	    var msg = " " + (data.head.toLowerCase() === "r" ? "@RestService" : data.head.toLowerCase() === "s" ? "@Socket" : "@Empty");
	    console.log("\n---------------------------------------------------------------------------");
	    if(data.headType){
	        msg += " - " + (data.headType.toLowerCase() === "g" ? "Get" : data.headType.toLowerCase() === "p" ? "Post" : "Unknown");
	    }
	    if(data.headTitle){
	        msg += " : " + data.headTitle
	    }
	    console.log(msg);
	    console.log("---------------------------------------------------------------------------\n");
	    if(data.data){
	        msg = typeof data.data === "object" ? JSON.stringify(data.data) : data.data;
	        console.log("  Data from client : " + msg + "\n");
	    }
        if(data.msg){
	        msg = typeof data.msg === "object" ? JSON.stringify(data.msg) : data.msg;
	        console.log("  Message from Express: " + msg);
	    }
     }
}

function printMessages(msg){
	console.log(" [*]- " + msg + "\n");
}