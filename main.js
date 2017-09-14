const {app, BrowserWindow, ipcMain} = require('electron');
const board = require("./board");

let mainWindow;

board.initialize();

function setSerialBoardStatus(status) { if(mainWindow) { mainWindow.webContents.send('serial-board-status', status); mainWindow.__newSerialConnection = false;}}
function serialBoardOpenHandler() {
  console.log('Opening Up Board...');
  mainWindow.__newSerialConnection = true;
  console.log('visible?',mainWindow.isVisible());
  if(mainWindow.isVisible()){
    setSerialBoardStatus(true)
  }
  board.Board.on('new-data', serialBoardDataHandler);
}
function serialBoardDataHandler(d) {
  var matches = d.match(/EKG:([\-\d]+)/);
  if(matches){
    mainWindow.webContents.send('new-data', matches[1]);
  }
}
function serialBoardCloseHandler() {
  if(mainWindow){
    console.log('Bye bye board! We will see you when you get back!')
    setSerialBoardStatus(false);
    board.Board.removeAllListeners('new-data')
    board.pollForBoard();
  }
}
function setupSerialBoardEvents(){
  board.Board
    .on('board-opened', serialBoardOpenHandler)
    .on('board-closed', serialBoardCloseHandler)
}

function exitApp(){
  mainWindow = null;
  ipcMain.removeAllListeners('board-action');
  board.closeOut();
  app.exit()
}

var flow = true
function toggleBoardData(){
  flow = !flow;
  board.setDataFlowState(flow);
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
  setupSerialBoardEvents();
  ipcMain.on('board-action', (event, action) => {
    console.log('From main', action);
    (btn_action_map[action] || (() => {}))();
  })

  mainWindow
    .once('ready-to-show', () => {
      mainWindow.show()
    })
    .on('show', () => {
      if(mainWindow.__newSerialConnection){
        console.log('delayed board start');
        setSerialBoardStatus(true);
      }
    })
    .on('close', exitApp)
  
});