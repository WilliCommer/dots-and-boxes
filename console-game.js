/* 
 * console-game.js
 * 
 * implements 'dots and boxes' game for console
 * 
 * (c) 2018 Willi Commer (wcs)
 * 
 */

/*
 * imports
 */
const {Game, Pos}     = require('./dab-board.js');
const util            = require('util');
const path            = require('path');
const {i18nInit, i18n, i18nF, setLocale} = require('./i18n.js');
const {InputLoop, StatusContext_Input, StatusContext_Menu, SelectItems} = require('inputloop');


  
/*
 * export
 */  
module.exports = function () {
  
  var size   = new Pos(2,2);
  var level  = 1;
  var game   = new Game({"size": size, "level": level});


  // initialisite translation
  let s = findProcessArgv( 'l' );
  i18nInit();
  setLocale(s || 'en');

  // crete menues
  // Main 
  var mainMenu = new StatusContext_Menu({
    message: i18n('main.title'),
    isMenu: true,
    isKeyPress: true,
    items: [
      {key: i18n('main.play_k'),  text: i18n('main.play'),  value: 'userplaystart', isDefault: true},
      {key: i18n('main.size_k'),  text: i18n('main.size'),  value: 'setsize'},
      {key: i18n('main.level_k'), text: i18n('main.level'), value: 'setlevel'},
      {key: i18n('main.exit_k'),  text: i18n('main.exit'),  value: 'exit'}
    ]
  });
  

  // Set Size
  var setSize = new StatusContext_Input({
    message: i18n('size.title'),
    checkInput: (loop) => {
      if (loop.line === '') return true;
      var s = parseInt(loop.firstChar);
      return Number.isInteger(s);
    },
    onDone: (loop) => {
      if (loop.line !== '') {
        var s = parseInt(loop.firstChar);
        if (Number.isInteger(s)) {
          size = new Pos(s,s);
        }
      }
      console.log(i18n('size.info', size.x, size.y));
      console.log();
      loop.setStatus('main');
    },
    onFail: (loop) => {
      console.log(i18n('size.fail'));
      console.log();
    }
  });  

  // Set Level
  var setLevel = new StatusContext_Menu({
    message: i18n('level.title'),
    isMenu: false,
    isKeyPress: true,
    items: [
      {key: '0', text: i18n('level.dummy')},
      {key: '1', text: i18n('level.normal')},
      {key: '2', text: i18n('level.good')}
    ],
    onStatusEnter: () => { setLevel.setDefault('' + level);  },
    onDone: (loop) => {
      var s = parseInt(loop.firstChar);
      if (Number.isInteger(s)) {
        if ((s >= 0) && (s <= 2)) level = s;
      }
      console.log(i18n('level.info', level));
      console.log();
      loop.setStatus('main');
    }
  });

  
  var playMenu  = new StatusContext_Menu({
    message: i18n('userplay.title'),
    isMenu: true,
    isShortPrompt: true,
    isKeyPress: false,
    items: [
      {key: i18n('userplay.show_k'), text: i18n('userplay.show'), value: 'userplay'},
      {key: i18n('userplay.undo_k'), text: i18n('userplay.undo'), value: 'undo'},
      {key: i18n('userplay.exit_k'), text: i18n('userplay.exit'), value: 'exitgame'}
    ],
    onStatusEnter: () => { showBoard(); },
    onFail: userPlay
  });

  // define apps
  var app = {
    'main':         mainMenu.context,
    'setsize':      setSize.context,
    'setlevel':     setLevel.context,
    'exit':         {
      onStatusEnter: (loop) => { 
        console.log(i18n('bye')); 
        process.exit(0); 
      }
    },
    'userplaystart': {
      isKeyPress: 'KO',
      onStatusEnter: (loop) => { 
        console.log();
        console.log('- - - - - - - -');
        console.log();
        game = new Game({"size": size, "level": level});
        loop.setStatus('userplay');
      }},
    'userplay': playMenu.context,
    'showboard': {
       onStatusEnter: (loop) => {
         showBoard();
         loop.setStatus('userplay');
       }
    },
    'undo': {
       onStatusEnter: (loop) => {
         game.restoreGame();
         loop.setStatus('userplay');
       }
    },
    'exitgame': {
      onStatusEnter: (loop) => {
        console.log();
        loop.setStatus('main');
      }
    }
  };

  // create app loop
  var loop = new InputLoop();
  loop.context = app;
   // start main loop 
  console.log(i18n('welcome'));
  loop.setStatus('main').start();
  
  // that's it
  return;
    

  // ===========================================
  
  
  
  function userPlay( loop ) {
//console.log('fail:"%s" isKeyPress:%s', loop.line, loop.isKeyPress);
    var s = loop.line.trim();
    if (!s) return;
    if (s && s.indexOf(' ') === -1) {  // no spaces
      s = s.substr(0,1) + ' ' + s.substr(1,1) + ' ' + s.substr(2,1);
    };
    
    var turn = game.executeUserTurn( s );
    
    if (turn) {                   // it was a valid turn
      console.log();
      // echo users turn
      if (turn.complete)
        console.log(i18n('completeturn', describeTurn(turn)));
      else
        console.log(i18n('goodturn', describeTurn(turn)));
      
      // echo computers turn
      if (turn.otherTurn) 
        console.log(i18n('computerturn', describeTurnList(turn.otherTurn)));
      
      // handle game over
      if (game.gameOver) {
        showBoard();
        console.log('* * * * * * * *');
        console.log(i18n('gameover'));
        
        // show winner
        let scores = game.scores;
        let s = '';
        if (scores[1] > scores[2]) s = i18n('userwins');
        else if (scores[1] < scores[2]) s = i18n('computerwins');
        else s = i18n('nobodywins');
        console.log();
        console.log(s + '  ' + scoresStr());
        console.log();
        
        loop.setStatus('main');
        return;
      }
      
      loop.setStatus('userplay');
      return;
    }
    
    console.log(i18n('badturn'));
    showHelp();
  }

  function describeTurn(turn) {
    if (!turn) return '';
    let line = game.board.lines[ turn.line ];
    return util.format('%s %s %s', line.boxes[0].pos.x, line.boxes[0].pos.y, line.side);
  }

  function describeTurnList(list) {
    if (!list) return '';
    var a = new Array();
    for (var i = 0; i < list.length; i++) a.push(describeTurn(list[i]));
    return a.join(', ');
  }

  function scoresStr() {
    return i18n('scores', game.scoreUser, game.scoreComputer );
  }

  function showBoard() {
    console.log(game.board.stringify());
    console.log(scoresStr());
  }
  
  
  function showHelp() {
    var s = '';
    s += i18n('userplay.help1');
    s += i18n('userplay.help2');
    s += i18n('userplay.help3');
    s += i18n('userplay.help4');
    s += playMenu.items.toMenuText();
    s += '\s';
    console.log(s);
  }
  
  
};



function retrieveLanguage () {

  var locale = findProcessArgv( 'l' );
  var loop = new InputLoop();
  var menu = new StatusContext_Menu(new SelectItems(
    {key: '1', text: 'english', value: 'en'},
    {key: '2', text: 'deutsch', value: 'de'}
  ));
  loop.addStatus('main', menu.context);
  menu.items.setDefaultValue(locale);
  menu.onDone = (loop) => {
    locale = loop.line;
    loop.stop();
  };
  menu.message = 'Select language';
  loop.start();
  
  
  // initialisite translation
  i18nInit();
  setLocale(locale || 'en');
  
}

  
function findProcessArgv( key ) {
  let a =  process.argv;
  let k = key.toLowerCase() + '=';
  for (let i=0; i < a.length; i++) {
    if (a[i].toLowerCase().startsWith(k))
      return a[i].substr(k.length);
  }
}
  

