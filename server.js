var ws = require('websocket-stream');
var http = require('http');
var through = require('through2');

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

module.exports = httpServer;
