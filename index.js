var ws = require('websocket-stream');
var http = require('http');
var through = require('through2');

/* WebSocket Client */

function runClient() {
    console.log('[INFO] Type exit or quit to leave');
    console.log('[LOG] Server listening at ws://localhost:3020');
    var clientStream = ws('ws://localhost:3020');
    var processResponse = through(function (chunk, _, next) {
        console.log('[LOG] Client received:', chunk);
        this.push(chunk);
        next();
    });
    var shell = through(function (chunk, _, next) {
        if (chunk.toString() === 'EXIT\n' || chunk.toString() === 'QUIT\n') process.exit(0);
        this.push(chunk + '\n>> ');
        next();
    });
    shell.pipe(process.stdout);

    process.stdin
        .pipe(clientStream)
        .pipe(processResponse)
        .pipe(shell);

    shell.write('');

}

/* WebSocket Server*/
var httpServer = http.createServer();
var socketHandle = function (serverStream) {
    var toUpperCase = through(function (chunk, _, next) {
        this.push(chunk.toString().toUpperCase());
        next();
    });

    var delayStream = through(function (chunk, _, next) {
        var delay = Math.floor(Math.random() * 1000);
        var stream = this;
        console.log('[LOG] New msg delayed for: ', delay + 'ms');
        setTimeout(function () {
            console.log('[LOG] Delay finished, data received:', chunk, 'sending (uppercase) response...');
            stream.push(chunk);
            next();
        }, delay);
    });

    serverStream
        .pipe(delayStream)
        .pipe(toUpperCase)
        .pipe(serverStream);
};
var socketServer = ws.createServer({
    server: httpServer
}, socketHandle);

httpServer.listen(3020, runClient);
