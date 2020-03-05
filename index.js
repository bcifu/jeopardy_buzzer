const express = require('express');
const app = express();
var http = require('http').createServer(app);
app.set('view engine', 'pug');
var io = require("socket.io")(http);
const GameStates = require('./public/gameStateEnum')

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/host', function(req, res) {
    res.render('host');
})

//make go to the player name
app.get('/player/*', function(req, res){
    console.log('here')
    console.log(req.url)
    res.render('player', {player: "test"})   
})

players = {}
buzzed = []
status = GameStates.LOADING

io.on('connection', function (socket) {
    socket.on('button_press', function(msg){
        console.log('message: ' + msg);
    });

    socket.on('addPlayer', function(data){
        players[data['userId']] = data['name'];
        console.log(players)
    })

    socket.on('setUpHost', (fn) => {
        fn(status, players, buzzed);
    })

    socket.on('disconnect', (reason) => {
        console.log('disconnect ' + socket.id)
        if(socket.id in players){
            delete players[socket.id];
            console.log(players)
        }       
    })
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});