var common = require('./common');

module.exports = {
    padEvent: function (socket, k, game, gameUUID, uuid) {
        if (k.x < 8) {
            var event = {"game_uuid": gameUUID, "user_uuid": uuid, "col": k.x};
            socket.emit("play.connect4", JSON.stringify(event));
        }
    },
    gameName: function () {
        return "connect4";
    },
    socketEvent: function (socket, pad) {
        socket.on('eventConnect4Waiting', function () {
            pad.col(pad.red.full, [8, 0]);
            pad.flash = true;
        });
    },
    play: function (socket, msg, pad, launchpad, gameUUID, uuid, queue) {
        pad.flash = false;
        // color last played col

        if (msg.data.last_play_col !== -1) {
            var color = msg.data.turn === uuid ? pad.red.full : pad.green.full;
            common.downLight(pad, color, msg.data.last_play_col, 0, Math.abs(msg.data.last_play_line - 7));
        }

        // game ended?
        if (msg.data.winner !== '') {
            if (msg.data.winner === uuid) {
                common.displayFromPatter(pad, pad.green.full, common.checkPattern());
            } else {
                common.displayFromPatter(pad, pad.red.full, common.crossPattern());
            }
            common.clearLoading();
            queue.putMessage('reinit');
            return;
        }

        // which turn
        switch (msg.data.turn) {
            case uuid:
                if (common.isLoading()) {
                    common.clearLoading();
                    pad.col(0, launchpad.Buttons.Scene);
                }
                // enable col
                for (var i = 0; i < 8; i++) {
                    if (msg.data.grid[i][7] === "") {
                        pad.col(pad.green.full, [i, 8]);
                    } else {
                        pad.col(pad.red.full, [i, 8]);
                    }
                }
                break;
            default:
                common.clearLoading();
                pad.col(0, launchpad.Buttons.Scene);
                pad.col(0, launchpad.Buttons.Automap);
                common.displayLoadingRight(pad, launchpad.Buttons.Scene);
        }
    }
};