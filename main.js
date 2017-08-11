const {app, BrowserWindow} = require('electron');
const board = require("./board");

let mainWindow;

board.initialize();

app.on('ready', function() {
  mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      show: false
  });

  mainWindow.loadURL('file://' + __dirname + '/public/index.html');
  var test = 0;

  board.Board.on('board-opened', () => {
    console.log('Yupp...');
  }).on('new-data', (d) => {
    // console.log(d);
    var matches = d.match(/EKG:([\-\d]+)/);
    if(matches){
      mainWindow.webContents.send('new-data', matches[1]);

    }
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  }).on('close', () => {
    mainWindow = null;
    board.closeOut();
  })
  
});