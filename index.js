
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const Game = require("./game");
app.use(express.static(__dirname+"/public"));

router.get('/aluno',function(req,res){
  res.sendFile(path.join(__dirname+'/public/aluno.html'));
});
router.get('/professor',function(req,res){
    res.sendFile(path.join(__dirname+'/public/professor.html'));
});
 
app.use('/', router);

var server = require('http').createServer(app).listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);
io.set('log level',1);
io.sockets.on('connection', function (socket) {
    console.log(socket.id);
    Game.initGame(io, socket);
});


