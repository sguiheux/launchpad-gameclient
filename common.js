require('launchpad-mini');

module.exports = {
    displayLoadingRight: function (pad, buttons) {
        var color = pad.green;
        var frontLine = 1;
        var dir = 'bottom';
        loading = setInterval(() => {
            pad.col(0, buttons);
            if (dir === 'bottom') {
                frontLine++
            } else {
                frontLine--;
            }
            pad.col(color.full, [8, frontLine]);
            if (frontLine > 0 && dir === 'bottom') {
                pad.col(color.medium, [8, frontLine - 1]);
            }
            if (frontLine > 1 && dir === 'bottom') {
                pad.col(color.low, [8, frontLine - 2]);
            }
            if (frontLine < 7 && dir === 'top') {
                pad.col(color.medium, [8, frontLine + 1]);
            }
            if (frontLine < 6 && dir === 'top') {
                pad.col(color.low, [8, frontLine + 2])
            }


            if (frontLine === 7 && dir === 'bottom') {
                dir = 'top';
            }
            if (frontLine === 0 && dir === 'top') {
                dir = 'bottom';
            }
        }, 100);
    },
    downLight: function(pad, color,col, fromLine, toLine) {
        var currentLine = fromLine -1;
        var int = setInterval(() => {
            if (toLine > currentLine) {
                currentLine++;
            }
            // erase previous light
            if (currentLine > 0) {
                pad.col(0, [col, currentLine -1]);
            }
            pad.col(color, [col, currentLine]);

            if (toLine == currentLine) {
                clearInterval(int);
            }
        }, 100);
    },
    clearLoading: function() {
        if (loading) {
            clearInterval(loading);
        }
    },
    isLoading: function() {
        return loading;
    },

    displayFromPattern: function(pad, color, data) {
        pad.reset(0);
        pad.col(color, pad.fromPattern(data));
    },

    checkPattern: function() {
        return [
            'c1        x',
            'c2       x',
            'c3      x',
            'c4 x   x',
            'c5  x x',
            'c6   x'
        ];
    },

    crossPattern: function() {
        return [
            'c0 x      x',
            'c1  x    x',
            'c2   x  x',
            'c3    xx',
            'c4    xx',
            'c5   x  x',
            'c6  x    x',
            'c7 x      x'
        ];
    }
};

var loading;