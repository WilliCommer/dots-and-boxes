/* 
 * dab-board.js
 * 
 * implements a board for dots and boxes game
 * 
 * (c) 2018 Willi Commer (wcs)
 * 
 */


const color = require('./console-colors.js');

/** Constant definitons
 * 
 */

const CONST = {
  SIDE: {
    LEFT:       0,
    RIGHT:      1,
    TOP:        2,
    BOTTOM:     3,
    NAMES:      ['left','right','top','bottom']
  },
  LEVEL: {
    DUMMY:      0,
    SIMPLE:     1,
    GOOD:       2,
    NAMES:      ["DUMMY","SIMPLE","GOOD"]
  },
  PLAYER: {
    NONE:       0,
    USER:       1,
    COMPUTER:   2,
    NAMES:      ["NONE","USER","COMPUTER"]
  },
  LINESCORE: {
    NONE:       0,
    SIMPLE:     1,
    COMPLETE:   10
  }
};



var options = {
  
  default: {
    size:                                 {x: 3, y: 3},
    level:                                CONST.LEVEL.SIMPLE
  }
  
};

/**
 * Game
 * @class
 */

class Game {
  
  /**
   * @param {type} opt options
   */
  constructor( opt = options.default ) {
    
    this.board        = new Board(opt.size);
    this.player       = CONST.PLAYER.USER;
    this.level        = opt.level;
    this._stack       = new Array();
    this.options      = opt;
    
  }  

  /** @returns {integer[]} [0]=number of empty fields, [1]=number of user fields, [2]=number of computer fields */
  get scores() { return this.board.getScores(); }
  
  /** @returns {integer} number of user fields */
  get scoreUser() { return this.board.getScores()[CONST.PLAYER.USER]; }
  
  /** @returns {integer} number of computer fields */
  get scoreComputer() { return this.board.getScores()[CONST.PLAYER.COMPUTER]; }
  
  /** @returns {object} {x,y} board size */
  get size() { return this.board.size; }
  
  /** @returns {boolean}  */
  get gameOver() {return this.board.getScores()[CONST.PLAYER.NONE] === 0; }

  /**
   * 
   * @param {Line | number | integer} line, see <a href="#gamecheckline">checkLine</a>
   * @param {integer} player
   * @param {integer} level
   * @returns {integer} score for turn
   */
  executeUserTurn( line, player = this.player, level = this.level) {
    this.saveGame();
    var result = this.executeSingleTurn( line, player, level );
    
    if(!result) {
      this.restoreGame();
      return null;
    }
    
    if(!result.complete) {
      result.otherTurn = this.executeAutoTurn( this.swapPlayer(player), level );
    }
    
    return result;
  }

  /**
   * 
   * @param {integer} player
   * @param {integer} level
   * @returns {integer} score for turn
   */
  executeAutoTurn( player = this.player, level = this.level) {

    var result=null, line, turn;
    
    line = this.getBestLine( level, player );
    while (line) {
      turn = this.executeSingleTurn( line, player );
      if (turn) {
        if (!result) result = new Array();
        result.push(turn);
        if (turn.complete) 
          line = this.getBestLine( level );
        else
          line = null;
      } else {
        line = null;
      }
    }
    
    return result;
    
  }     

  /**
   * internal turn
   * @param {Line | number | integer} line, see <a href="#gamecheckline">checkLine</a>
   * @param {integer} player
   * @returns {integer} score for turn
   */  
  executeSingleTurn( line, player ) {
    
    // check line
    line = this.checkLine( line );
    if (! line) return null;
    var linescore = line.score();
    if (! linescore) return null;
    
    // check player
    if (!player) player = this.player;
    
    this.board.executeSingleTurn(line, player);
    
    return {
      player:   player,
      line:     line.id,
      value:    linescore,
      complete: linescore >= CONST.LINESCORE.COMPLETE
    };
  }
  
  getBestLine( level = CONST.LEVEL.SIMPLE, player = this.player ) {
    
    let scores = this.board.mapLineScores();
    if (!scores || scores.list.length === 0) return null;

    // scores.list is array of {line: Line, score: number}
    
    // console.log('getBestLine(level=%s, player=%s)', level, player);
    
    // DUMMY: return any possible strike
    if(level === CONST.LEVEL.DUMMY) {
      let i = Math.floor(Math.random() * (scores.list.length-1));
      return scores.list[i].line;
    };

    // SIMPLE: return any of the best possible strikes
    if(level === CONST.LEVEL.SIMPLE) {
      let bests = scores.list.filter(function(a){ return a.score === scores.bestscore; });
      let i = Math.floor(Math.random() * (bests.length-1));
      return bests[i].line;
    };

    // GOOD: return a strike with the best result
    // play each possible turns and make a automatcaly enemy turn
    if(level === CONST.LEVEL.GOOD) {
      let player2     = this.swapPlayer(player);
      let bestscore   = -10000;
      let bests       = scores.list; // all possible turns
      for (let i=0; i < bests.length; i++) {
        this.saveGame();
        // make user move
        let b = bests[i];
        this.executeSingleTurn( b.line.id, player ); // use line.id, because reference is lost after restoreGame
        // make user2 move
        this.executeAutoTurn( player2, CONST.LEVEL.SIMPLE );
        // calculate score
        let sco = this.scores;
        if(player === CONST.PLAYER.COMPUTER)
          b.score = sco[CONST.PLAYER.COMPUTER] - sco[CONST.PLAYER.USER];
        else
          b.score = sco[CONST.PLAYER.USER] - sco[CONST.PLAYER.COMPUTER];
        if(b.score > bestscore) bestscore = b.score;
        this.restoreGame();
      };
      // filter best scored lines
      bests = bests.filter(function(a){ return a.score === bestscore; });
      // return random of best strikes
      if(bests.length > 0) {
        let i = Math.floor(Math.random() * (bests.length-1));
        return this.board.lines[bests[i].line.id];
      };
    };
      
    return null;  
  }


  /**
   * store actual game on stack
   */  
  saveGame()  {
    var game = new Game(this.options);
    game.board = this.board.clone();
    this._stack.push(game);
  }
  
  /**
   * restore last game from stack
   */  
  restoreGame() {
    if (this._stack.length === 0) return false;
    var game = this._stack.pop();
    this.board = game.board.clone();
    return true;
  }
    
  /**
   * check if restoreGame() is possible
   * returns {boolean}
   */
  isSaved() {
    return this._stack.length > 0;
  }
  
    
  swapPlayer( player ) {
    if (player === CONST.PLAYER.COMPUTER) return CONST.PLAYER.USER;
    return CONST.PLAYER.COMPUTER;
  }
  
  /**
   * @param {Line | number | integer} value
   * @returns Line
   * @example
   * checkLine( 2 );                // return line with id=2
   * checkLine( "2" );              // return line with id=2
   * var line = board.boxAtPos(1,1).lines.left;
   * checkline( line );             // returns left line of box[1,1]
   * checkLine( "1 1 left" );       // returns left line of box[1,1]
   */
  
  checkLine( value ) {
    
    if (!value) return null;
    
    if (typeof value === 'object') {
      if (value instanceof Line) return value;
    }
    
    if (isNumber(value)) {
      value = forceInt(value);
      if ((value < 0) || (value >= this.board.lines.length)) return null;
      return this.board.lines[value];
    }
    
    if (typeof value === 'string' || value instanceof String) {
      var s = value.split(' ');
      var side = '';
      if (!s) return null;
      if(s.length < 3) return null;
      side = s[2].substr(0,1).toLowerCase();
      switch (side) {
        case 'r': side = 'right'; break;
        case 'l': side = 'left'; break;
        case 't': side = 'top'; break;
        case 'b': side = 'bottom'; break;
        default: return null;  
      }
      let pos = new Pos(s[0],s[1]);
      if (!this.board.isValidPos(pos)) return null;
      return this.board.boxAtPos(pos).lines[side];
    }

    return null;
  }
  
  
} // Game




/**
 * Board
 * @class
 */

class Board {
 
  /**
   * @param {object} size {x,y}
   */  
  constructor( size = options.default.size ) {
    
//    this.size  = options.default.size;
    this.size  = size;
    this.boxes = null;
    this.lines = null;
    this.init();
  };
  
  
  init() {
    
    // create boxes
    this.boxes = new Array();
    let boxId  = 0;
    for ( let y=0; y < this.size.y; y++ ) {
      for ( let x=0; x < this.size.x; x++ ) {
        let pos = new Pos(x,y);
        let box = new Box( boxId++, pos );
        this.boxes.push(box);
        
      }
    }  
    
    // create lines
    this.lines = new Array();
    let line;
    
    for (let i = 0; i < this.boxes.length; i++) {
      let box = this.boxes[i];
      let neighbor;

      // left  
      neighbor = this.boxAtPos(box.pos.left());
      if (neighbor && neighbor.lines.right) line = neighbor.lines.right; else line = newLine(this.lines);
      box.lines.left = line;
      line.boxes.push(box);

      // right  
      neighbor = this.boxAtPos(box.pos.right());
      if (neighbor && neighbor.lines.left) line = neighbor.lines.left; else line = newLine(this.lines);
      box.lines.right = line;
      line.boxes.push(box);

      // top  
      neighbor = this.boxAtPos(box.pos.top());
      if (neighbor && neighbor.lines.bottom) line = neighbor.lines.bottom; else line = newLine(this.lines);
      box.lines.top = line;
      line.boxes.push(box);
      
      // bottom  
      neighbor = this.boxAtPos(box.pos.bottom());
      if (neighbor && neighbor.lines.top) line = neighbor.lines.top; else line = newLine(this.lines);
      box.lines.bottom = line;
      line.boxes.push(box);
      
    } // for
    
    
    function newLine(lines) {
      let line = new Line(lines.length);
      lines.push(line);
      return line;
    }
    
  } // init()
  
  

  /**
   * @returns {object} copy of game
   */  
  clone() {
    var board = new Board(this.size);
    for (var i = 0; i < board.boxes.length; i++) {
      board.boxes[i].owner = this.boxes[i].owner;
    }
    for (var i = 0; i < board.lines.length; i++) {
      board.lines[i].owner = this.lines[i].owner;
    }
    return board;
  }
  
  /**
   * @returns {Box[][]} 2 dimension array of game boxes
   */
  get2d() {
    var result = new Array();
    for ( let y=0; y < this.size.y; y++ ) {
      var row = new Array();
      for ( let x=0; x < this.size.x; x++ ) {
        row.push(this.boxAtPos(new Pos(x,y)));
      }
      result.push(row);
    }
    return result;
  }
  
  
  /*
   * Get board as string.
   * <a href="https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script">For colors see</a>
   * @param {object} options
   */
  
  stringify( options ) {
    
    var opt = {
      linefeed: '\n',
      usecolor: true,
      owner: [
        {
          hline: '+   ',
          vline: ' ',
          id: '',
          colorLine: '',
          colorBody: ''
        },
        {
          hline: '+---',
          vline: '|',
          id: ' x',
          colorLine: color.bgRed + color.fgWhite,
          colorBody: ''
        },
        {
          hline: '+---',
          vline: '|',
          id: ' o',
          colorLine: color.bgBlue + color.fgWhite,
          colorBody: ''
        }
      ],
      hline0: '   ',
      vline0: ' ',
      hline: '---',
      vline: '|',
      corner: '+'
    };
    
    var result = '';
    var s,row,owner;  

    // top
    for ( let x=0; x < this.size.x; x++ ) {
      let box = this.boxAtPos( new Pos(x,0) );
      owner = box.lines.top.owner;
      s = hline(owner);
      s = setColor(s, owner);
      s = opt.corner + s;
      result = result + s;
    }
    result = result + opt.corner + opt.linefeed;   
      
    for ( let y=0; y < this.size.y; y++ ) {
      row = ['',''];

      for ( let x=0; x < this.size.x; x++ ) {
        let box = this.boxAtPos( new Pos(x,y) );

        // left
        owner = box.lines.left.owner;
        s = vline(owner);
        s = setColor(s, owner);
        row[0] = row[0] + s;

        // center
        s = opt.owner[box.owner].id;
        while(s.length < 3) s = s + ' ';
        row[0] = row[0] + s;

        // bottom
        owner = box.lines.bottom.owner;
        s = hline(owner);
        s = setColor(s, owner);
        s = opt.corner + s;
        row[1] = row[1] + s;

        // right
        if(x === this.size.x-1) {
          owner = box.lines.right.owner;
          s = vline(owner);
          s = setColor(s, owner);
          row[0] = row[0] + s;
          row[1] = row[1] + opt.corner;
        }
      } // for x

      result = result + row[0] + opt.linefeed;
      result = result + row[1] + opt.linefeed;
    } // for y
    return result;
    
    
    function hline( owner ) {
      if (owner === 0) return opt.hline0;
      return opt.hline;
    }
    
    function vline( owner ) {
      if (owner === 0) return opt.vline0;
      return opt.vline;
    }
    
    function setColor( s, owner ) {
      if (!opt.usecolor) return s;
      let c = opt.owner[owner].colorLine;
      if(!c || c === '') return s;
      return c + s + color.reset;
    }
    
  } // stringify
  
  
  
  isValidPos( pos ) {
    if (!pos) return false;
    if ( (pos.x < 0) || (pos.x >= this.size.x) ) return false;
    if ( (pos.y < 0) || (pos.y >= this.size.y) ) return false;
    return true;
  }

  boxIdAtPos( pos ) {
    if (!this.isValidPos(pos)) return null;
    return pos.y * this.size.x + pos.x;
  }
  
  boxAtId( id )  { return this.boxes[id]; }

  boxAtPos( pos ) { return this.boxes[this.boxIdAtPos(pos)]; }
  
  mapLineScores() {
    var list = new Array;
    var bestscore = 0;
    var bestline  = null;
    for (let i = 0; i < this.lines.length; i++) {
      let line = this.lines[i];
      let score = line.score();
      if (score > 0) {
        list.push({
          line:  line,
          score: score
        });
        if (score > bestscore) {
          bestscore = score;
          bestline = line;
        }
      }
    }
    return {
      list: list,
      bestscore: bestscore,
      bestline: bestline
    };
  }

  
  /** @returns {integer[]} [0]=number of empty fields, [1]=number of user fields, [2]=number of computer fields */
  getScores() {
    let result = [0,0,0];
    for (var i = 0; i < this.boxes.length; i++) {
      let k = this.boxes[i].owner;
      result[k] = result[k] + 1;
    }
    return result;
  }
  
  

  /**
   * set line for player and possible complete the box, no checks done
   * @param {Line | number | integer} line @link {#checkline}
   * @param {integer} player
   */  
  executeSingleTurn( line, player ) {
    line.owner = player;
    for (var i = 0; i < line.boxes.length; i++) {
      let box = line.boxes[i];
      if ((box.owner === CONST.PLAYER.NONE) && (box.isComplete())) 
        box.owner = player;
    }
  }
  

};



/**
 * Object to describing one board cell 
 * @class
 */
class Box {
  
  /**
   * @param {integer} id of box
   * @param {object} pos {x,y}
   */
  constructor( id, pos) {
    /** @property {integer} id of box */
    this.id   = id;
    /** @property {object} pos {x,y} */
    this.pos  = pos;
    /** @property {object} line {left,top,right,bottom} */
    this.lines = {
      left:   null,
      top:    null,
      right:  null,
      bottom: null
    };
    /** @property {integer} owner of box */
    this.owner = 0;
  };
  
  /**
   * @returns {Boolean} true if all lines set
   */
  isComplete() {
    let n = 0;
    for (let key in this.lines) {
      if (this.lines[key].owner !== CONST.PLAYER.NONE) n++;
    }
    return n === 4;
  };
  
  /**
   * @returns {Boolean} true if all lines set except this one in parameter
   * @param {integer} line
   */
  isCompleteIfLine( line ) {
    let n = 0;
    for (let key in this.lines) {
      if ( (this.lines[key].id === line.id) || this.lines[key].isSet()) n++;
    }
    return n === 4;
  };
  
};


/*
 * Line
 * @class
 */

class Line {
  
  /** @param {type} id  */
  constructor( id ) {
    this.id    = id;
    this.owner = 0;
    this.boxes = new Array;
  }
  
  /** @returns {boolean} has it a owner */
  isSet() { return this.owner !== 0; }
  
  /** @returns {integer} */
  score() {
    if (this.isSet()) return CONST.LINESCORE.NONE;
    let n = CONST.LINESCORE.SIMPLE;
    for (var i = 0; i < this.boxes.length; i++) {
      if (this.boxes[0] && this.boxes[i].isCompleteIfLine(this)) n += CONST.LINESCORE.COMPLETE;
    }
    return n;
  }
  
  /** @returns {string} */
  describe() {
    let result = 'id: ' + this.id + ', owner: ' + this.owner;
    result = result + ', boxes( ';
    for (var i = 0; i < this.boxes.length; i++) {
      let box = this.boxes[i];
      if (box) {
        result = result + 'box' + i + ': ' + box.pos.describe() + ' ';
      }
    }
    result = result + ')';
    return result;
  }  
  
  /** returns {Line} the neighbour line */
  get side() {
    if (!this.boxes || this.boxes.length === 0) return '';
    var box = this.boxes[0];
    for (let key in box.lines) {
      if (box.lines[key] === this) return key;
    }
    return '';
  }
  
  
};


/**
 * Pos
 * @class
 * @example
 * new Pos(1,2);
 * new Pos('1','2')
 * new Pos({x:1,y:2})
 * 
 */

class Pos {

  /**
   * @param {type} x
   * @param {type} y
   */
  constructor( x,y ) {
    
    //console.log('Pos(', typeof x, typeof y, ')' );

    // handle no params
    if (!x) x = 0;
    if (!y) y = 0;

    // handle string params
    x =  forceInt(x);
    y =  forceInt(y);
    
    // check if called like new Pos({x:1,y:1})
    if (typeof x !== 'number') {
      y = x.y;  // assign in this order only
      x = x.x;
    }
    
    this.x = x;
    this.y = y;
  };
  
  left()      { return new Pos(this.x-1, this.y); }
  right()     { return new Pos(this.x+1, this.y); }
  top()       { return new Pos(this.x,   this.y-1); }
  bottom()    { return new Pos(this.x,   this.y+1); }
    

  /** @returns {string}  */  
  describe() {
    return this.x + ',' + this.y;
  }
}




/*
 * tools
 */


function forceInt( value ) {
  if (typeof value === 'string') return parseInt(value);
  return value;
};

function isNumber(n){
    return typeof(n) !== "boolean" && !isNaN(n);
};










 /*
  * node.js export
  */
 
 if(module) {
  module.exports = {
    CONST:    CONST,
    Pos:      Pos,
    Line:     Line,
    Box:      Box,
    Board:    Board,
    Game:     Game
    
  };  
};
