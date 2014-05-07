/* jshint quotmark: false */
/* global require */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var md5 = require('MD5');


var chatLog = [
  {
    createdAt: new Date(),
    objectID: 1,
    text: "Welcome, to the real world",
    username: "Morpheus",
    roomname: "Lobby"
  }
];

var roomNames = ["Lobby"];

// Set up server
var app = express();
app.use(bodyParser());  // to parse message POST requests properly
app.listen(3000, 'localhost');


// Allow cross-origin resource sharing (CROSS)
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-type, accept');
  res.header("Access-Control-Max-Age", 10);
  next();
});

// ==========
// ROUTING
// ==========

app.get('/', function(request, response) {
  response.send('Hello World');
});

app.get('/classes/messages', function(request, response){
  var logCopy = chatLog.slice();
  logCopy.sort(function(a,b) {
    return b.createdAt - a.createdAt;
  });
  response.send({'results':logCopy});
});

app.get('/classes/rooms', function(request, response) {
  response.send({'results' : roomNames});
});

app.get('/classes/:room', function(request, response) {
  var roomname = request.params.room;
  var roomMessages = _.filter(chatLog, function(message) {
    return message.roomname === roomname;
  });
  roomMessages.sort(function(a, b) {
    return b.createdAt - a.createdAt;
  });
  response.send({'results' : roomMessages});
});

app.post('/classes/messages', function(request, response) {
  var newMessage = request.body;
  newMessage.createdAt = new Date();
  newMessage.objectID = md5(JSON.stringify(newMessage)).substr(0,10);
  chatLog.push(newMessage);
  if (!_.contains(roomNames, newMessage.roomname)) {
    roomNames.push(newMessage.roomname);
  }
  response.send({'results': newMessage});
});

app.post('/classes/rooms', function(request, response) {
  var newRoom = request.body.roomname;
  if (!_.contains(roomNames, newRoom)){
    roomNames.push(newRoom);
  }
  response.send('Hooray! :)');
});
