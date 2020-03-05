const express = require('express');
const app = express();
var http = require('http').createServer(app);
app.set('view engine', 'pug');
var io = require("socket.io")(http);
const {GameStates} = require('./public/gameStateEnum')

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/host', function(req, res) {
    res.render('host');
})

//make go to the player name
app.get('/player/*', function(req, res){
    res.render('player', {player: "test"})   
})

players = {}
//TODO: why do I need host id's I thikn I can removeh
buzzed = []
status = GameStates.OPEN

io.of('/player').on('connect', (socket) => {
    socket.on('addPlayer', function (data, fn) {
        players[data['userId']] = data['name'];
        fn(status, GameStates)
        io.of('/host').emit('updatePlayers', Object.values(players));
        console.log(players)
    })

    socket.on('disconnect', (reason) => {
        if (socket.id in players) {
            delete players[socket.id];
            io.of('/host').emit('updatePlayers', Object.values(players));
        }
        console.log(players)
    })

    socket.on('buzzIn', (fn) => {
        buzzed.push(players[socket.id])
        fn()
        io.of('/host').emit('buzzedIn', buzzed);
    });
})

io.of('/host').on('connect', (socket) => {

    socket.on('clearBuzzing', (fn) => {
        buzzed = []
        fn(buzzed)
        io.of('/player').emit('clearBuzz', status);
    })

    socket.on('setUpHost', (fn) => {
        fn(status, Object.values(players), buzzed, GameStates);
    })

    socket.on('changeStatus', (oldStatus, fn) => {
        if (oldStatus == GameStates.OPEN) {
            status = GameStates.LOCKED
            fn(status)
        } else if (oldStatus == GameStates.LOCKED) {
            status = GameStates.OPEN
            fn(status)
        }
        if(oldStatus != status){
            io.of('/player').emit('statusChange', status);
        }
    })
})

http.listen(3000, function () {
    console.log('listening on *:3000');
});