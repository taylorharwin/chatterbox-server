/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
/* global require */
var _ = require('underscore');
var md5 = require('MD5');
var url = require('url');

var chatLog = [
{createdAt: new Date(),
objectID: 5,
text:"I'm coming from another roooomm!",
roomname: "thetongaroom",
username: "Rasputin"}
];

var parsePost = function(request){
  var JSONstring = '';
  request.on('data', function(data){
    JSONstring += data;
  });
  request.on('end', function(){
    var message = JSON.parse(JSONstring);
    message.createdAt = new Date();
    message.objectID = md5(JSON.stringify(message)).substr(0,10);

    var roomName = url.parse(request.url).pathname.substr(9);
    if (roomName !== 'messages'){
      message.roomname = roomName;
    }
    chatLog.push(message);
  });
};

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */


  var responseFunc = function(statusCode, headers, data){
    headers = headers || {};
    data = data || '';

    /* Without this line, this server wouldn't work. See the note
     * below about CORS. */
    var headers = _.extend(headers, defaultCorsHeaders);

    /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);

    /* Make sure to always call response.end() - Node will not send
     * anything back to the client until you do. The string you pass to
     * response.end() will be the body of the response - i.e. what shows
     * up in the browser.*/
    response.end(JSON.stringify(data));
  };

  console.log("Serving request type " + request.method + " for url " + request.url);

  var success = function(data){
    responseFunc(200, {'Content-Type': 'application/json'}, data);
  };

  var options = function(data) {
    responseFunc(200, {'Allow': 'OPTIONS, GET, POST'}, data);
  };

  var failure = function() {
    responseFunc(404);
  };

  var parseGet = function(){
    var urlPath = url.parse(request.url).pathname;
    console.log(urlPath.substr(0,8) === '/classes');
    if (urlPath === '/classes/messages' || urlPath === '/log'){
      var logCopy = chatLog.slice();
      logCopy.sort(function(a,b){
        return b.createdAt - a.createdAt;
      });
      success({'results' : logCopy});
    }
    else if (urlPath === '/classes/rooms'){
      var allNames = {};
      var getRoomNames = function(){
        _.each(chatLog, function(message){
          allNames[message.roomname] = true;
        });
      };
      getRoomNames();
      success({'results' : Object.keys(allNames)});
    }
    else if (urlPath.substr(0,8) === '/classes'){
      var roomName = urlPath.substr(9);
      var roomMessages = _.filter(chatLog, function(message){
        return message.roomname === roomName;
      });
      roomMessages.sort(function(a,b){
        return b.createdAt - a.createdAt;
      });
      success({'results' : roomMessages});
    }
    else {
      failure();
    }
  };

  if (request.method === "OPTIONS"){
    options();
  } else if (request.method === "GET"){
    parseGet();
  } else if (request.method === "POST") {
    parsePost(request);
    responseFunc(201, {}, {'results': chatLog});
  } else {
    failure();
  }

};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.handleRequest = handleRequest;
exports.handler = handleRequest;
