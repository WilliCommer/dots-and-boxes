/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




function test_dab_board() {
  
//  var dab = require('../dab-board.js');
  var {CONST, Game, Pos, Board, Box, Line} = require('../dab-board.js');
  
  
//  console.log(new Board);
//  console.log(new Box(0, {x:0,y:0}));

  function test_Pos() {
    console.log('new Pos:',                 new Pos);
    console.log('new Pos(0,1):',            new Pos(0,1));
    console.log('new Pos(1,2):',            new Pos(1,2));
    console.log('new Pos( {x:3,y:4}):',     new Pos( {x:3,y:4}));
    console.log("new Pos( '5', '6'):",      new Pos( '5', '6'));
    console.log('new Pos(new Pos(7,8)):',   new Pos(new Pos(7,8)));
    let p = new Pos(9,10);
    p.x = 11;
    p.y = '12';
    console.log('p:',p);
    
  };
  
  
  function FillBoard( board, owner ) {
    for( let i=0; i < board.lines.length; i++ ) board.lines[i].owner = owner;
    for( let i=0; i < board.boxes.length; i++ ) board.boxes[i].owner = owner;
  }

  function logBoard( board ) {
    console.log('-----------------------------------------------');
    console.log(board.stringify());
    console.log('scores:', board.getScores());
  }
  
  function test_Boad_stringify() {
    var board = new Board;
    
    console.log(board.stringify());

    console.log('-----------------------------------------------');
    board.boxes[0].lines.left.owner = 1;
    console.log(board.stringify());

    console.log('-----------------------------------------------');
    for( let i=0; i < board.lines.length; i++ ) board.lines[i].owner = 1;
    for( let i=0; i < board.boxes.length; i++ ) board.boxes[i].owner = 1;
    console.log(board.stringify());

    console.log('-----------------------------------------------');
    for( let i=0; i < board.lines.length; i++ ) board.lines[i].owner = 2;
    for( let i=0; i < board.boxes.length; i++ ) board.boxes[i].owner = 2;
    console.log(board.stringify());
    
    console.log('-----------------------------------------------');
    for( let i=0; i < board.lines.length; i++ ) board.lines[i].owner = 0;
    for( let i=0; i < board.boxes.length; i++ ) board.boxes[i].owner = 0;
    console.log(board.stringify());
    
  }


  
  function test_Board() {
    var board = new Board;
    
    
//    console.log( board );
//    console.log( JSON.stringify( board, null, 2 ));
//    console.log( JSON.stringify( board.lines, null, 2 ));
//    console.log( board.boxes );
//    console.log( board.isValidPos( new Pos(0,0) ) );
//    console.log( board.isValidPos( new Pos(3,3) ) );
//    console.log( board.boxIdOfPos( new Pos(3,3) ) );
    
/*    
    console.log(board.stringify());
    board.boxes[0].lines.left.owner = 1;
    console.log(board.stringify());

    console.log(board.boxes[0].lines.left);
    console.log(board.boxes[4].lines.left);
    
    console.log(board.boxAtPos(new Pos(0,0)).lines.left);
    console.log(board.boxAtPos(new Pos(0,1)).lines.left);
    
*/
    test_Boad_stringify();
    
  };
  
  function  test_LineScore() {
    var board = new Board;
    var line, box;
    
//console.log(board.lines);
    // dump empty
/*
    for (var i = 0; i < board.lines.length; i++) {
      let line = board.lines[i];
      console.log(line.describe(), ' score:', line.score());
    }
*/

    box = board.boxes[0].lines;
    box.left.owner = 1;
    box.right.owner = 1;
    box.bottom.owner = 1;
    line = box.top;
    console.log(line.describe(), ' score:', line.score());

    let scores = board.mapLineScores();
//    console.log('scores', scores);
    console.log('getBestLine SIMPLE', board.getBestLine());
    console.log('getBestLine SIMPLE', board.getBestLine(CONST.LEVEL.SIMPLE));
    console.log('getBestLine DUMMY', board.getBestLine(CONST.LEVEL.DUMMY));
  
    FillBoard( board, CONST.PLAYER.COMPUTER );
    console.log('getBestLine', board.getBestLine());
    
  }

  function  test_SingleTurn() {
    var board = new Board;
    var line, box;
    
    logBoard(board);
    box = board.boxAtPos(new Pos(1,2) );
    board.executeSingleTurn( box.lines.left, CONST.PLAYER.USER );
    board.executeSingleTurn( box.lines.right, CONST.PLAYER.USER );
    board.executeSingleTurn( box.lines.bottom, CONST.PLAYER.USER );

    box = board.boxAtPos(new Pos(1,1) );
    board.executeSingleTurn( box.lines.left, CONST.PLAYER.USER );
    board.executeSingleTurn( box.lines.top, CONST.PLAYER.USER );
    board.executeSingleTurn( box.lines.right, CONST.PLAYER.USER );
    logBoard(board);
    board.executeSingleTurn( box.lines.bottom, CONST.PLAYER.USER );
    logBoard(board);
    
  }  
  
  
  function test_Game() {
//    var game = new Game({size: {x:10,y:8}});
//    var game = new Game();
    var game = new Game({size: {x:10,y:10}});
    var player = 1;
    var turn;

/* checkline
    let line = game.board.lines[6];
    console.log(game.checkLine(line));
    console.log(game.checkLine(3));
    console.log(game.checkLine('3'));
    console.log(game.checkLine(200));
    console.log(game.checkLine(3, true));
    console.log(game.checkLine('1 1 left'));
    console.log(game.checkLine('1 1 right'));
    console.log(game.checkLine('1 1 center'));
*/

/*
//    console.log(game);
//    console.log(game.scores);
//  console.log('userTurn("1 1 left"): ',  game.executeUserTurn('1 1 left'));
//  console.log('userTurn(x): ',  game.executeUserTurn('1 1'));
//  console.log('userTurn(6): ',  game.executeUserTurn(6));
//  console.log('userTurn(7): ',  game.executeUserTurn(7));
//  console.log('userTurn(8): ',  game.executeUserTurn(8));
    
  player = 1;
  console.log('userTurn("1 1 left", '+player+'): ',  game.executeUserTurn('1 1 left', player));
  player = 2;
  console.log('userTurn("1 1 top" , '+player+'): ',  game.executeUserTurn('1 1 left', player));

//  console.log(game.checkLine('1 1 left'));
//  console.log(game.checkLine('1 1 top'));

console.log('2d:', game.board.get2d()[1]);


  logTurn('1 1 l', 1);
  logTurn('1 1 t',  2);
  logTurn('1 1 r',  1);

  logTurn('1 1 left', 1);
  logTurn('1 1 top',  2);
  logTurn('1 1 right',  1);

*/

  
  logTurn('1 1 l', 1);
  logTurn('1 1 t',  2);
  logTurn('1 1 r',  1);

  game.player = 2;
  game.level = CONST.LEVEL.DUMMY;
  game.level = CONST.LEVEL.SIMPLE;
  game.level = CONST.LEVEL.GOOD;
  
  console.log('AutoRun', game.executeAutoTurn());
  console.log('AutoRun', game.executeAutoTurn(1));
  console.log('AutoRun', game.executeAutoTurn(2));
  console.log('AutoRun', game.executeAutoTurn(1));
  console.log('AutoRun', game.executeAutoTurn(2));
  logBoard(game.board);
  
  let a = game.board;
  game.saveGame();
  console.log('a === board', a === game.board);
//  logBoard(game.board);
//return;  

  playUntilEnd();
  logBoard(game.board);
  console.log('Restore game', game.restoreGame());
  game.restoreGame();
  console.log('a === board', a === game.board);
  logBoard(game.board);
  playUntilEnd();
  logBoard(game.board);



  function playUntilEnd() {
    turn = new Array;
    let t;
    player = 1;
    do {
      t = game.executeAutoTurn(player);
      if(t) turn.concat(t);
      player = game.swapPlayer(player);
    } while (t);
  }

  function logTurn( line, player ) {
    console.log('executeSingleTurn(',line,',',player,') => ',  game.executeSingleTurn(line, player));
  }

  }

 
  
  
/*  
  test_Pos();
  test_Board();
  
  test_LineScore();
  test_SingleTurn();
  test_Game();
*/
  test_Game();


}

// ------------------------------------------------


function test_keyPress () {

  
      const readline = require('readline');
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.exit();
      } else {
        console.log(`You pressed the "${str}" key`);
        console.log();
        console.log(key);
        console.log();
      }
    });
    console.log('Press any key...');
return;    
  
  
  var keypress = require('keypress');
 
  // make `process.stdin` begin emitting "keypress" events
//  keypress(process.stdin);
 
  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key && key.ctrl && key.name === 'c') {
      process.stdin.pause();
    }
  });
 
// console.log('%s',  JSON.stringify(process.stdin,null,true) );
  process.stdin.setRawMode(true);
  process.stdin.resume();

}


// ------------------------------------------------

function test_console_game() {

//  const app = require('../console-game.js');
//  app();
  require('../console-game.js')();
}


// ------------------------------------------------

function test_i18n() {
  require('./test-i18n.js')();
};
 
// ------------------------------------------------


// test_PrivateFunction();

 // test_dab_board();
  test_console_game();
//  test_i18n();
// require('./testutils/test-inputloop.js')(); 
// test_keyPress();

//  InputLoop = require('inputloop');  var loop = new InputLoop();  console.log(typeof loop.onKeyPress);


/*
var {StatusContext_Menu} = require('./inputloop-util.js');
var menu = new StatusContext_Menu({
  items:['a','b'], 
  onStatusEnter: 'ee', 
  isShortPrompt: true,
onDone: undefined});
console.log(JSON.stringify(menu));
console.log(menu.getPrompt());

*/