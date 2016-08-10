var http = require('http');
var server = http.createServer();

var ipaddress = '0.0.0.0';
var portSocket = 1082;
var portFront = 8080;
var portBack = 8090;

/*** Server for socket ***/

var io = require('socket.io')(server);
io.on('connection', function(socket) {
  socket.on('join', function(data) {
    console.log("join", data);
    socket.join(data);
  });
  socket.on('leave', function(data) {
    console.log("leave", data);
    socket.leave(data);
  });
  socket.on('updateAll', function(data) {
    console.log("update", data);
    io.sockets.in(data).emit('update', data);
  });
});

server.listen(portSocket, ipaddress, function() {
  console.log((new Date()) + ' Server socket running on port ' + portSocket);
});

/*** Server for front ***/

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).use(serveStatic(__dirname + '/..')).listen(portFront, function() {
  console.log((new Date()) + ' Server front running on port ' + portFront);
});

/*** Server for back ***/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var router = express.Router();

router.get('/messages', function(req, res) {
  res.json(["ok"]);
});

app.use('/', router);

app.listen(portBack, function() {
  console.log((new Date()) + ' Server back running on port ' + portBack);
});