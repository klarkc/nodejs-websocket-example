var ws = require('websocket-stream');
var http = require('http');
var through = require('through2');

/* WebSocket Client */

function runClient() {
    console.log('[LOG] Server listening at ws://localhost:3020');
    var clientStream = ws('ws://localhost:3020');
    console.log('[LOG] Type "exit" to leave');
    var processResponse = through(function (chunk, _, next) {
        console.log('[LOG] Client received:', chunk);

        if(chunk.toString()==='EXIT\n') {
            console.log('[LOG] Exit command detected, leaving...');
            process.exit();
        }

        this.push(chunk);
        next();
    });
    var shell = through(function (chunk, _, next) {
        this.push(chunk + '\n>> ');
        next();
    });

    process.stdin
        .pipe(clientStream)
        .pipe(processResponse)
        .pipe(shell)
        .pipe(process.stdout)
    ;

    shell.write('');
}

/* WebSocket Server*/
var httpServer = http.createServer();
var socketHandle = function (serverStream) {
    var toUpperCase = function (stream, chunk, next) {
        var delay = Math.floor(Math.random() * 1000 * 5);
        console.log('[LOG]<toUpperCase> Simulating processing delay of: ', delay + 'ms');
        setTimeout(function () {
            console.log('[LOG]<toUpperCase> Processing finished, sending response...');
            stream.push(chunk.toString().toUpperCase());
            next();
        }, delay);
    };

    var processStream = through(function (chunk, _, next) {
        console.log('[LOG] Server received:', chunk);

        console.log('[LOG] Processing toUpperCase');
        this.push(toUpperCase(this, chunk, next));
    });

    serverStream.pipe(processStream).pipe(serverStream);
};
var socketServer = ws.createServer({
    server: httpServer
}, socketHandle);

httpServer.listen(3020, runClient);
