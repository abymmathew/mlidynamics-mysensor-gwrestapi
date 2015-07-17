// SETTINGS
var KEY = 'PUT YOU KEY HERE';
var SECRET = 'PUT YOUR SECRET HERE';
var HOST = 'PUT YOUR SERVER HERE';

// LIBS
var com = require("serialport");
var https = require('https');
var crypto = require('crypto');

var sha256 = crypto.createHash('sha256').update(KEY+':'+SECRET).digest("hex");
console.log('Authorization:'+sha256);

var serialPort = new com.SerialPort('COM3', {
    baudrate: 115200,
	parser: com.parsers.readline('\n')
  });
 
var postheaders = {
    'Content-Type' : 'text/xml',
    'ControllerKey' : KEY,
	'Authorization' : sha256
};
  
var optionspost = {
    host : HOST,
    port : 443,
    path : '/api/rest/mlidynamics/receive',
    method : 'POST',
    headers : postheaders
};

serialPort.on('open',function() {
  console.log('Port open');	
});

serialPort.on('data', function(data) {
	
	if (data.indexOf('0;0;3;0;9;') == 0) {
		console.log('	'+data);
		//Comment next line to Ignore I_MESSAGE_LOG
		execREST(data);
	}
	else {
		console.log(data);
		execREST(data);
	}

});

function execREST(post_content){
	var reqPost = https.request(optionspost, function(res) {

    	res.on('data', function (chunk) {
          console.log('OUTGOING: '+chunk);

	  serialPort.write(''+chunk+'\n');
   
	});
});

	// write the json data
	reqPost.write(post_content);
	reqPost.end();
	reqPost.on('error', function(e) {
    		console.error(e);
	});
}

