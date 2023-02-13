var io;
var gameSocket;
var hosters = {};
var dados = require('./alternativas');
var perguntas = dados['perguntas_e_alternativas']; 
var interatorRoom = {};
var contador = {};
var clientroom = {};

exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });
    gameSocket.on('joinRoom', joinRoom);
    gameSocket.on('criaRoom', createRoom);
    gameSocket.on('startGame', startGame);
    gameSocket.on('novaPergunta', newQuest);
    gameSocket.on('contaAcertos', contadorAcertos);
}
 
function joinRoom(param,socket) {
    var sock = this;
    this.join(param.codigoSala);
    console.log(param.codigoSala);
    this.emit("onRoom");
    clientroom[sock.id] = param.codigoSala;
    io.sockets.in(param.codigoSala).emit('newclient', {nome: param.nomeAluno,id:sock.id});
};

function createRoom() {
    var thisGameId = ( Math.random() * 100000 ) | 0;
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    var id = firstPart + secondPart;
    hosters[this.id] = id;
    this.emit('salaCriada', {gameId: id});
    this.join(id);
    console.log(thisGameId.toString());
    interatorRoom[hosters[this.id]] =  makeIterator();
};

function startGame() { 
    io.sockets.in(hosters[this.id]).emit('started',interatorRoom[hosters[this.id]].next()); 
}

function newQuest() { 
    let current = interatorRoom[hosters[this.id]].next();
    if( current['value'] !== undefined ) {
        io.sockets.in(hosters[this.id]).emit('newQuest',current);
    }else{
        io.sockets.in(hosters[this.id]).emit('final')
    }
}

function contadorAcertos(data) {
    var sock = this; 
    if(!contador[sock.id]) {
        contador[sock.id] = 0;
    }
    contador[sock.id] = contador[sock.id] + parseInt(data.valor);
    io.sockets.in(hosters[this.id]).emit('contadorAlunos',{id:sock.id,contador:contador[sock.id]});
}

function* makeIterator() {
    let index = 0;
    if(index >= perguntas.length-1){
        index = 0;
    }
    while (index <= perguntas.length-1){
        yield perguntas[index++];
    }  
}


