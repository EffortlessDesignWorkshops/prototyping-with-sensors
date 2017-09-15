const { EventEmitter } = require('events')
const net = require('net')
const Readline = require('readline')
const Board = new EventEmitter()
let parser
let server
  

function handleResponse(resp) {
    // console.log(resp.toString());
    Board.emit('new-data', resp.toString());
}


function initialize(port){
    console.log()
    server = net.createServer((socket) => {
        function closeSocketHandler(){
            Board.emit('board-closed');
            socket.end();
        }
        // 'connection' listener
        console.log('TCP board connected');
        Board.emit('board-opened')
        socket
            .on('end', closeSocketHandler)
            .on('close', closeSocketHandler)
            .on('timeout', closeSocketHandler)
        parser = Readline.createInterface({input: socket});
        parser.on('line', handleResponse)
    });
    server.maxConnections = 1;
    server.listen(port, () => {
        Board.emit('tcp-ready', server.address())
        console.log('server bound', server.address());
    });
}

function setDataFlowState(resume){
    if(resume) {
        parser.resume()
    } else {
        parser.pause()
    }
}

function closeOut() {
    server.close(function() {
        Board.emit('board-closed');
    });
}


module.exports = {
    closeOut: closeOut,
    initialize: initialize,
    Board: Board,
    setDataFlowState: setDataFlowState
}