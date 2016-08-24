
// Initialize library objects for use by node
// Also specify server dependencies
var express = require('express');
var server = express();
var path = require('path');

// Setup file routing
server.use('/src/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
server.use('/src/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
server.use('/src/css', express.static(__dirname + '/css'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular-route'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular-resource'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular-animate'));
server.use('/src/scripts', express.static(__dirname + '/controller'));
server.use('/src/scripts', express.static(__dirname + '/'));
server.use(express.static(__dirname + '/partials'))
server.use(express.static(__dirname + '/src/img'))

// Setup request functions
server.listen(3000, function() {
  console.log('Connection Successful!');
})

server.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
});
