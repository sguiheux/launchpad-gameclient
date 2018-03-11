const Launchpad = require('launchpad-mini'),
    pad = new Launchpad();
const connect4 = require('./connect4');
const common = require('./common');
var sq = require('simplequeue');
var uuid = '';
var gameUUID = '';
var game;
var socket;
var queue = sq.createQueue();
pad.connect().then(() => {
    // connec socket io
    socket = require('socket.io-client')(process.argv[2]);
    socket.open();
    init(pad);
    // User heartbeat
    heartbeat(socket);

    // Connection
    socket.on('connect', function (resp) {
        connect(resp);
    });

    // Receive play event from server
    socket.on('play', function (resp) {
        var msg = getMessage(resp);
        if (msg.status >= 300) {
            console.log(msg.error);
            return;
        }
        gameUUID = msg.game_uuid;
        game = msg.game;

        switch (msg.game) {
            case connect4.gameName():
                connect4.play(socket, msg, pad, Launchpad, gameUUID, uuid, queue);
                break;
            default:
                console.log('Unknown game: ' + msg.game);
        }
    });

    connect4.socketEvent(socket, pad);

    // Make Launchpad glow yellow
    pad.on('key', k => {
        if (gameUUID === '' && k.pressed && k.x === 8) {
            socket.emit("join", JSON.stringify({"game": getGameJoinEvent(k.y), "uuid": uuid}), (resp) => {
                var msg = getMessage(resp);
                if (msg && msg.status === 202) {
                    common.displayLoadingRight(pad, Launchpad.Buttons.Scene);
                }
            });
            return
        }
        if (!game) {
            return;
        }
        switch (game) {
            case connect4.gameName():
                connect4.padEvent(socket, k, game, gameUUID, uuid);
        }
    });

    queue.getMessage((e, msg) => {
        if (msg && msg === 'reinit') {
            resetGame(pad);
        }
    });
});

function getGameJoinEvent(line) {
    switch (line) {
        case 0:
            return connect4.gameName();
    }
    return "";
}

function getMessage(resp) {
    if (resp) {
        return JSON.parse(resp);
    }
    return null;
}

function init(pad) {
    pad.reset(0);
    pad.col(pad.amber.full, [8, 0]);
}

function connect(resp) {
    var msg = getMessage(resp);
    if (msg && msg.data) {
        uuid = msg.data;
    }
}

function heartbeat(socket) {
    setInterval(() => {
        if (socket.connected) {
            socket.emit("heartbeat", uuid, () => {
            });
        }
    }, 60000);
}

function resetGame(pad) {
    gameUUID = '';
    game = '';

    common.clearLoading();
    setTimeout(() => {
        init(pad);
    }, 3000);

}