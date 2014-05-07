// YOUR CODE HERE:
//
//
/* jshint quotmark:false */
/* global $, _ */
$(document).ready(function(){
  $("span.timeago").timeago();
  app.username = app.getQueryVariable('username');
  app.init();
});

var app = {
  friendList: {},
  currentRoom: 'Lobby',
  activeRooms: [],
  url: 'http://127.0.0.1:3000/classes/'
};

app.init = function(){
  $('#wrapper div.sidebar h1').text(app.username);
  $('#chats').on('click','h2',app.addFriend);
  $('#send').on('submit',app.handleSubmit);
  $('#roomSelect').on('click','li', function(event){
    app.currentRoom = $(event.target).data('roomname');
    $('.activeRoom').removeClass('.activeRoom');
    $(event.target).addClass('activeRoom');
    app.fetch();
  });
  $('.createRoom').on('click', function(event) {
    event.preventDefault();
    app.createRoom($('.room').val());
    $('.room').val('');
  });
  app.fetch();
};

app.createRoom = function(roomname) {
  $.ajax({
    url: app.url + 'rooms',
    type: 'POST',
    data: JSON.stringify({roomname: roomname}),
    contentType: 'application/json',
    success: function() {
      // hooray! :)
      app.renderRoomNames();
    },
    error: function() {
      // boo :(
    }
  });
};

app.send = function(message){
  $.ajax({
    url: app.url + 'messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function () {
      // console.log('chatterbox: Message sent');
      // console.dir(data);
      app.fetch();
    },
    error: function () {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
  $('#main').find('.message').val('');
};

app.fetch = function(){
  $.ajax({
    url: app.url + app.currentRoom,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      app.extractRooms(data.results);
      app.renderRoomNames();
      app.renderAllMessages(data.results);
    },
    error: function () {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive messages from server');
    }
  });
  //setTimeout(app.fetch, 750);
};

app.clearMessages = function(selector){
  selector = selector || '#chats';
  $(selector).html('');
};

app.addMessage = function(message){
  message.username = message.username || app.username;
  if (message.username === "username") {
    message.username = "Username";
  }
  console.log(message.createdAt);
  $('#chats').append('<div class="chat">' +
    '<h2 class="username ' + app.stripNonWordChars(message.username) + '">'+ message.username +'<h2>' +
    '<p>' + app.stripNonWordChars(message.text) + '</p>' +
    '<span class="timeago" title='+message.createdAt+'>' + message.createdAt + '</span>' +
    '<div class="roomname">' + message.roomname + '</div>' +
    '</div>');
};

app.displayMessages = function(){
  //Will call fetch, possibly with some parameters
  //Can call fetch filtered by room or by friend
      //Filter by:
          //Active Room
          //Active Rooms, highlighting # of new updates on each tab
          //Updates from friends

};

app.renderAllMessages = function(data){
  $('#chats').html('');
  _.each(data, function(chat){
      // var safeChat = {};
      // _.each(chat, function(val, key){
      //   safeChat[app.stripNonWordChars(key)]= app.stripNonWordChars(val);
      // });
      app.addMessage(chat);
    }
  );
  $("span.timeago").timeago();
};


app.renderExtraMessages = function(){

};
app.extractRooms = function(){
  $.ajax({
    url: app.url + 'rooms',
    type: 'GET',
    contentType: 'application/json',
    success: function(data){
      app.activeRooms = data.results;
      app.renderRoomNames();
    },
    error: function(){
      'chatterbox: Failed to receive room names from server';
    }
  });
};

app.renderRoomNames = function(){
  var roomListHTML = '';
  _.each(app.activeRooms, function(value){
    roomListHTML += '<li class="'+ app.stripNonWordChars(value) +'" data-roomname="'+value+'">'+ value + '</li>\n';
  });
  console.log(roomListHTML);
  $('#roomSelect').html($(roomListHTML));
  $('#roomSelect .' + app.currentRoom).attr('class', 'activeRoom');
};

app.addRoom = function(roomname){
  $('#roomSelect').append('<li id="' + roomname + '">' + roomname + '</li>');
};

app.addFriend = function(event) {
  var friendName = app.stripNonWordChars(event.target.innerHTML);
  app.friendList[friendName] = friendName;
  $('#chats .username.activeFriend').removeClass('activeFriend');
  $('#chats .username.' + app.stripNonWordChars(event.target.innerHTML)).addClass('activeFriend');
  app.listFriends();
};

app.listFriends = function(){
  var allNames = '';
  _.each(Object.keys(app.friendList), function(name){
    allNames += '<li>' + name + '</li>';
  });
  $('#friendList').html(allNames);
};

app.handleSubmit = function(event) {
  event.preventDefault();
  var roomname = app.currentRoom || 'lobby';

  var message = {
    username: app.username,
    text: $('.message').val(),
    roomname: roomname
  };
  $('.message').val(''); // clear message input
  app.send(message);

};

// Helpers
app.getQueryVariable = function(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
};

app.escapeXSS = function(string, strip){
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };
  return strip ?  String(string).replace(/[\s&<>"\/]/g, '') :
    String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
};

app.stripNonWordChars = function(string) {
  //return String(string).replace(/[^\w\s]/g,'');
  return string;
};

