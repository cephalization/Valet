
var express = require('express');
var app = express();
var path = require("path");

// Setup file routing
app.use('/src/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
app.use('/src/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/src/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
app.use('/src/scripts', express.static(__dirname + '/node_modules/angular'))

// Setup request functions
app.listen(3000, function() {
  console.log('Connection Successful!');
})

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
});
