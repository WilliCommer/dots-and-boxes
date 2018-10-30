const {Game, Pos}     = require('dots-and-boxes');

var game = new Game({size: {x:3,y:3}, level: 2});

console.log( game.executeUserTurn( '0 0 l' ) );
console.log( game.board.stringify() );
console.log( game.scores );
