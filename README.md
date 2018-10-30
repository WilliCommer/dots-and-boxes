# dots-and-boxes

[![npm version](https://badge.fury.io/js/dots-and-boxes.svg)](https://badge.fury.io/js/dots-and-boxes)
[![GitHub version](https://badge.fury.io/gh/willicommer%2Fdots-and-boxes.svg)](https://badge.fury.io/gh/willicommer%2Fdots-and-boxes)
[![wcs badge](http://familiecommer.de/files/img/author-wcs-blue.svg)](http://WilliCommer.de)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

> 
> Play the Dots And Boxes game against computer. Play in console or use api for own user interface.
> 

## Console Game

```
npm start 
```

or german version

```
npm start l=de
```

## API
+ [See api documentation (html)][apidochtml]
+ [See api documentation (markdown)][apidocmd]

### Example

```javascript
const {Game} = require('dots-and-boxes');
var game = new Game({size: {x:3,y:3}, level: 2});

console.log( game.executeUserTurn( '0 0 l' ) );
```

> { player: 1,<br/>
>   line: 0,<br/>
>   value: 1,<br/>
>   complete: false,<br/>
>   otherTurn: [ { player: 2, line: 12, value: 1, complete: false } ] }<br/>

```javascript
console.log( game.board.stringify() );
```
> ![example1][example1]

```javascript
console.log( game.scores );
```

> [ 9, 0, 0 ]


[apidochtml]: docs/index.html
[apidocmd]: docs/dab-board-api.md
[example1]: docs/example1.png
