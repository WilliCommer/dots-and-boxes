/* 
 * 
 */


const InputLoop       = require('inputloop');
const {sprintf, vsprintf} = require('sprintf-js');
const {StatusItemInput, StatusItemMenu, SelectItems} = require('../inputloop-util.js');

module.exports = testcase1;



function testcase1() {
  

var loop = new InputLoop();

var menuItems = new SelectItems(
  {key: 's', text: 'Spielen', value: 'play', isDefault: true},
  {key: 't', text: 'Tanzen',  value: 'dance' },
  {key: 'e', text: 'Beenden',  value: 'exit' }
);

var mainMenu  = new StatusItemMenu(menuItems);
mainMenu.message = 'Main menu';

loop.addStatus( 'main', mainMenu.context );
loop.addStatus( 'dance', {message: 'DANCE', onStatusEnter: (loop) => {loop.showPrompt(); loop.setStatus('main');}});
loop.addStatus( 'play', {message: 'PLAY', onStatusEnter: (loop) => {loop.showPrompt(); loop.setStatus('main');}});
loop.addStatus( 'exit', {onStatusEnter: (loop) => { console.log('good by ..'); process.exit(0); }});
loop.setStatus('main');
loop.start();


}; // testcase1

