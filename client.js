var ws = require('websocket-stream');
var through = require('through2');

/* WebSocket Client */

module.exports = function runClient() {
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
