var server = require('./server.js');
var runClient = require('./client.js');

server.listen(3020, runClient);
