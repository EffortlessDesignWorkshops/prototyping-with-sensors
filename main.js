const {app, BrowserWindow, ipcMain} = require('electron');
const serialBoard = require("./board");
const tcpBoard = require("./tcp");

let mainWindow;

serialBoard.initialize();
tcpBoard.initialize(1337);

function boardOpenHandler() {
  console.log('Opening Up Board...');
  mainWindow.__newConnection = true;
  console.log('visible?',mainWindow.isVisible());
  if(mainWindow.isVisible()){
    setBoardStatus(true)
  }
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
function setBoardStatus(status) { if(mainWindow) { mainWindow.webContents.send('board-status', status); mainWindow.__newConnection = false;}}
function setupBoardEvents(){
  serialBoard.Board
    .on('board-opened', boardOpenHandler)
    .on('board-closed', boardCloseHandler)
  tcpBoard.Board
    .on('board-opened', boardOpenHandler)
    .on('board-closed', boardCloseHandler)
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
  if(matches){
    mainWindow.webContents.send('new-data', matches[1]);
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
    .once('ready-to-show', () => {
      mainWindow.show()
    })
    .on('show', () => {
      if(mainWindow.__newConnection){
        console.log('delayed board start');
        setBoardStatus(true);
      }
    })
    .on('close', exitApp)
  
});