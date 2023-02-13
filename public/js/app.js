;
jQuery(function($){    
    'use strict';
    
    $(document).ready(function(){ 
      $('#modal1').modal({dismissible:false});  
      //$('#modal1').modal('open');
      document.addEventListener(
        "build",
        (e) => {
          IO.socket.emit('novaPergunta');
        },
        false
      );
    });

    var App = {
          alternativaCorreta: "",
          timer: "",
          clickAlternativa: false,
          init: function () {
              App.cacheElements();
              App.bindEvents();
              clearInterval(App.timer);
          },

          cacheElements: function () { 
            App.$doc = $(document); 
          },
          getCodigo: function () { IO.socket.emit('criaRoom');},
          startGame: function () {  IO.socket.emit("startGame");},
          bindEvents: function () {
              App.$doc.on('click', '#entrar', App.showWait );
              App.$doc.on('click', '#getcode', App.getCodigo );
              App.$doc.on('click', '#start', App.startGame );
              App.$doc.on('click', '#alternativasPerguntas .alternativasCss', App.onSelectAlternativas );
          },

          showWait: function () {
            IO.socket.emit('joinRoom',{
               codigoSala: $("#codigo").val(),
               nomeAluno: $("#nomeAluno").val(),
            });
          },

          onRoom: function () {
            $('#inputDados').hide();
            $('#agurdandoStart').show();
            $("#entrar").css('display','none');
          },

          newCode: function (data) {
            $("#code").html(" <a href='#' id='codigo' style='margin: 0 auto; '>"+data.gameId+"</a>");
            $("#code").css('display','block');           
          },
          
          newClient: function (data) {
            $("#listaAlunos").html("<li>"+data.nome+"</li>");
            $("#listaAlunosQuiz").append("<a class='collection-item' id='"+data.id+"' ><span class='badge'>0</span>"+data.nome+"</a>");
          },
            
          started: function (pergunta) {
              let alternativas = pergunta['value']['alternativas'];
              App.alternativaCorreta = pergunta['value']['resposta_correta'];
              for(let x in alternativas) {
                $("#alternativasPerguntas").append('<li><div data-id="'+x+'" class="alternativasCss">'+alternativas[x]+'</div></li>');
              }
              var timer = document.getElementById("timer");
              $("#pergunta").text(pergunta['value']['pergunta']);
              App.novaPergunta(pergunta);
              $('#modal1').modal('open');
          },

          newQeust: function (data) {
              console.log(data);
          },

          onSelectAlternativas: function () {
              let selected = $(this).text();
              if(!App.clickAlternativa){
                  $(this).css('color','#fff');
                  if( selected.toString().trim() === App.alternativaCorreta.toString().trim()){
                      $(this).css('background-color','#66ff00');
                      IO.socket.emit('contaAcertos',{valor: 1});
                  }else{
                      $(this).css('background-color','#FF0000');
                      IO.socket.emit('contaAcertos',{valor: 0});
                  } 
                  App.clickAlternativa = true;
              }
          },

          final: function () {
              alert('acabou');
          },

          novaPergunta: function ( pergunta ) {
             const perguntaa = pergunta;
             App.clickAlternativa = false;
                if(window.location.pathname == '/professor'){
                    $("#pergunta").text(perguntaa['value']['pergunta']);
                    $("#timer").countdowntimer({
                      seconds : 10,
                      displayFormat : "S"
                    });
                 }else{
                    $("#alternativasPerguntas").empty();
                    let alternativas = pergunta['value']['alternativas'];
                    App.alternativaCorreta = pergunta['value']['resposta_correta'];
                    for(let x in alternativas) {
                        $("#alternativasPerguntas").append('<li><div data-id="'+x+'" class="alternativasCss">'+alternativas[x]+'</div></li>');
                    }
                }
          },

          contaodrAlunos: function (data) { 
              $("#"+data.id).find('span').text(data.contador); 
              if(window.location.pathname == '/aluno') {
                 $("#Contadordeacertos").html('<h2>Acertos:'+data.contador+'</h2>');
              }
          }
    }

    var IO = {
      init: function() {
          IO.socket = io.connect();
          IO.bindEvents();
      },

      bindEvents : function() {
          IO.socket.on('connected', IO.onConnected );  
          IO.socket.on('onRoom',  App.onRoom ); 
          IO.socket.on('salaCriada',  App.newCode );
          IO.socket.on('newclient',  App.newClient );
          IO.socket.on('started',  App.started );
          IO.socket.on('newQuest',  App.novaPergunta );
          IO.socket.on('final',  App.final );
          IO.socket.on('contadorAlunos',  App.contaodrAlunos );
      },
 
      onConnected : function() {
          console.log(IO.socket.socket.sessionid);
      },
    }

    IO.init();
    App.init();
    
}($));