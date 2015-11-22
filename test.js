var fork = require('child_process').fork;
var child = fork('./index.js', [], {silent: true});

var tries = 0;
child.stdout.on('data', function(data){
    if (data.length === 4) {
        console.log('SENDING COMMAND');
        child.stdin.write("exit\n");
    }
    if (data.toString().indexOf('leaving') > -1) {
        console.log('COMMAND RECEIVED');
        process.exit();
    }
});

setTimeout(function(){
    throw new Error('Timeout on waiting process to leave');
}, 10000);
