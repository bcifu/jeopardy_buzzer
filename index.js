var app = require('express')();
var http = require('http').createServer(app);
app.set('view engine', 'pug');
var io = require("socket.io")(http);

app.get('/', function (req, res) {
    res.render('home');
});

//make go to the player name
app.get('/player/*', function(req, res){
    console.log('here')
    console.log(req.url)
    res.render('player', {player: "test"})   
})

players = {}

io.on('connection', function (socket) {
    myUserId = undefined;

    socket.on('button_press', function(msg){
        console.log('message: ' + msg);
    });

    socket.on('addPlayer', function(data){
        players[data['userId']] = data['name'];
        myUserId = data['userId']
        console.log(players)
    })

    socket.on('disconnect', (reason) => {
        delete players[myUserId];
        console.log(players)
    })
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});