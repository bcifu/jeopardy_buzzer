const express = require('express');
const app = express();
var http = require('http').createServer(app);
app.set('view engine', 'pug');
var io = require("socket.io")(http);
const {GameStates} = require('./public/gameStateEnum')

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

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
hostIds = []
buzzed = []
status = GameStates.OPEN

io.on('connection', function (socket) {
    socket.on('addPlayer', function(data, fn){
        players[data['userId']] = data['name'];
        fn(status, GameStates)
        io.of('/host').emit('updatePlayers', Object.values(players));
        console.log(players)
    })

    socket.on('disconnect', (reason) => {
        if(socket.id in players){
            delete players[socket.id];
            io.of('/host').emit('updatePlayers', Object.values(players));
        }       
    })
});

io.of('/host').on('connect', (socket) => {
    hostIds.push(socket.id);

    socket.on('setUpHost', (fn) => {
        fn(status, Object.values(players), buzzed, GameStates);
    })

    socket.on('disconnect', () => {
        hostIds.remove(socket.id)
    })

    socket.on('changeStatus', (oldStatus, fn) => {
        if(oldStatus == GameStates.OPEN){
            status = GameStates.LOCKED
            fn(status)
        } else if (oldStatus == GameStates.LOCKED){
            status = GameStates.OPEN
            fn(status)
        }
        console.log(status)
    })
})

http.listen(3000, function () {
    console.log('listening on *:3000');
});