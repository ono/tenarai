var http = require('http');
var ecstatic = require('ecstatic')(__dirname);
var fs = require('fs');

var server = http.createServer(function (req, res) {
    if (req.method === 'GET' && req.url === '/data.json') {
        var s = createStream();
        s.pipe(res);
        
        req.socket.on('end', s.end);
        req.socket.on('close', s.end);
    }
    else ecstatic(req, res);
});
var port = process.env.PORT || 9005;
server.listen(port, function() {
  console.log("Listening on " + port);
});

var data = require('./data.json');
var Stream = require('stream');

function createStream () {
    var s = new Stream;
    s.readable = true;
    
    process.nextTick(function () {
        s.emit('data', '{"meta":[],"data":[');
    });
    
    var times = 0;
    var iv = setInterval(function () {
        var ix = Math.floor(Math.random() * data.data.length);
        var row = data.data[ix];
        s.emit('data',
            (times > 0 ? ',' : '')
            + JSON.stringify(row)
        );
        times ++
    }, 10);
    
    s.end = function () {
        clearInterval(iv);
        s.emit(']}');
        s.emit('end');
    };
    
    return s;
}
