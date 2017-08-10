// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var sendData = function(d) {}

var socket;

io.on('connection', function(sock) {
    // setInterval(function() {
    //     var data = Math.random();
    //     console.log(data);
    //     socket.broadcast.emit('new data', data)
    // }, 1000);

    // var sendIt = function(d) {
    //     var data = Math.random();
    //     console.log(data);
    //     socket.broadcast.emit('new data', data)
    // };
    // sendData = sendIt;
    socket = sock;
})

const SerialPort = require('serialport');

SerialPort.list(function(err, ports) {
    ports = ports
        .map(function(port) {
            if (/0057/i.test(port.productId) && /04D8/i.test(port.vendorId)) {
                return port;
            }
        })
        .filter(function(p) {
            return p;
        });
    if (ports.length == 0) { return; }

    var myPort = ports[0];
    var myBaud = 9600;
    console.log('Connecting to Xpress board on ' + myPort.comName);
    console.log('Assuming Baud of ' + myBaud);
    var board = new SerialPort(myPort.comName, {
        baudRate: myBaud
    });
    board
        .on('open', function() {
            console.log('Xpress Opened!');
        })
        .on('data', function(data) {
            board.data = board.data + data.toString();
            while ((new_line_index = board.data.indexOf("\n")) > -1) {
                if (new_line_index > -1) {
                    // var data_to_send = board.data.substr(0, new_line_index);
                    var matches = board.data.match(/EKG:([\-\d]+)/);
                    if (matches) {
                        io.sockets.emit('new data', matches[1]);
                        // socket.broadcast.emit('new data', data_to_send);
                        // sendData(data_to_send)
                    }
                    board.data = board.data.substr(new_line_index + 1);
                }
            }
        });
})