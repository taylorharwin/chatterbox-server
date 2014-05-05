/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var _ = require('underscore');

var chatLog = [];

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */


  var responseFunc = function(statusCode, headers, data){
      headers = headers || {};
      data = data || '';

      /* .writeHead() tells our server what HTTP status code to send back */
      response.writeHead(statusCode, headers);

      /* Without this line, this server wouldn't work. See the note
       * below about CORS. */
      var headers = _.extend(headers, defaultCorsHeaders);

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

  var failure = function(data) {
    responseFunc(404);
  };

  if (request.method === "OPTIONS"){
    success('GET, POST');
  } else if (request.method === "GET"){
    success({'results' : chatLog});
  } else if (request.method === "POST") {
    success({'results': chatLog});
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
