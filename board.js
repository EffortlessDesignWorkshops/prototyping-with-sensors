const { EventEmitter } = require('events')
const serialport = require('serialport')
const Readline = serialport.parsers.Readline
const parser = new Readline()
const Board = new EventEmitter()

const board_config = {
    baudRate: 9600
}

let port

let connected = false;
let polling = true;

function handleResponse(resp) {
    // console.log(resp.toString());
    Board.emit('new-data', resp.toString());
}

function initialize(){
    parser.on('data', handleResponse);
    findAndConnectXpress();
}

function setDataFlowState(resume){
    if(resume) {
        parser.resume()
    } else {
        parser.pause()
    }
}

function closeOut() {
    if (!port) {
        port = {
            close: function(c) { c(); }
        }
    }
    port.close(function() {
        connected = false;
        Board.emit('board-closed');
    });
}

function findAndConnectXpress(selectedPorts) {
    if(!polling || connected){
        return;
    }
    console.log('Checking for board...');
    serialport.list(function(e, ports) {
        ports = ports
            .map(function(port) {
                if (/0057/i.test(port.productId) && /04D8/i.test(port.vendorId)) {
                    return port;
                }
            })
            .filter(function(p) {
                return p;
            });
        if (ports.length == 0) {
            console.log('No board detected!');
            return;
        }
        if (ports.length > 1) {
            // do stuff for multiple boards...
            console.log('Multiple boards found, assuming ' + ports[0].comName);
            Board.emit('found-multiple-boards', ports);
        }
        chooseSerialPort(ports[0]);
    })
}

function isString(d) {
    return /String/i.test(Object.prototype.toString.call(d));
}

function chooseSerialPort(newPort) {
    if (!port) {
        port = {
            close: function(c) { c(); }
        }
    }
    port.close(function() {
        port = new serialport(newPort.comName, {
            baudRate: board_config.baudRate
        });
        port
            .on('open', () => {connected = true; Board.emit('board-opened')})
            .on('close', closeOut)
            .pipe(parser)
    });
}

function pollForBoard(shouldPoll){
    polling = shouldPoll;
}


setInterval(findAndConnectXpress, 5000);

module.exports = {
    pollForBoard: pollForBoard,
    chooseSerialPort: chooseSerialPort,
    closeOut: closeOut,
    initialize: initialize,
    Board: Board,
    setDataFlowState: setDataFlowState
}