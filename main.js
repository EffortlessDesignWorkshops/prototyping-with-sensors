const {app, BrowserWindow, ipcMain} = require('electron');
const serialBoard = require("./board");
const tcpBoard = require("./tcp");

let mainWindow;
let pastEvents = [];
serialBoard.initialize();
tcpBoard.initialize(1337);

function sendRendererEvent(){
  var args = arguments
  if(mainWindow && mainWindow.isVisible()) {
    mainWindow.webContents.send.apply(mainWindow.webContents, args);
  } else {
    pastEvents.push(args);
  }
}

function boardOpenHandler() {
  console.log('Opening Up Board...');
  setBoardStatus(true)
  serialBoard.Board.on('new-data', boardDataHandler);
  serialBoard.pollForBoard(false);
  tcpBoard.Board.on('new-data', boardDataHandler);
}
function boardCloseHandler() {
  if(mainWindow){
    console.log('Bye bye board! We will see you when you get back!')
    setBoardStatus(false);
    serialBoard.Board.removeAllListeners('new-data')
    tcpBoard.Board.removeAllListeners('new-data')
    serialBoard.pollForBoard(true);
  }
}
function setBoardStatus(status) { 
    sendRendererEvent('board-status', status);
}
function setupBoardEvents(){
  serialBoard.Board
    .on('board-opened', boardOpenHandler)
    .on('board-closed', boardCloseHandler)
  tcpBoard.Board
    .on('board-opened', boardOpenHandler)
    .on('board-closed', boardCloseHandler)
    .on('tcp-ready', (serverInfo) => {
      sendRendererEvent('tcp-ready', serverInfo.address, serverInfo.port);
    })
}

function exitApp(){
  mainWindow = null;
  ipcMain.removeAllListeners('board-action');
  serialBoard.closeOut();
  tcpBoard.closeOut();
  app.exit()
}

var flow = true
function toggleBoardData(){
  flow = !flow;
  serialBoard.setDataFlowState(flow);
  tcpBoard.setDataFlowState(flow);
}
function boardDataHandler(d) {
  var matches = d.match(/EKG:([\-\d]+)/);
  if(matches && matches[1]){
    num = +(matches[1]);
    sendRendererEvent('new-data', (new Date()).getTime(), num)
  }
}

function sendAllPastEvents(){
  while(pastEvents.length){
    var event = pastEvents.shift();
    sendRendererEvent.apply(null, event);
  }
}

const btn_action_map = {
  'exit': exitApp,
  'start-stop': toggleBoardData
}

app.on('ready', function() {
  mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      show: false
  });
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');
  setupBoardEvents();
  ipcMain.on('board-action', (event, action) => {
    console.log('From main', action);
    (btn_action_map[action] || (() => {}))();
  })

  mainWindow
    .once('ready-to-show',mainWindow.show)
    .on('show', sendAllPastEvents)
    .on('close', exitApp)
});