/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const {i18nInit, i18n, i18nF, setLocale} = require('./i18n.js');

i18nInit();


module.exports = () => {

  const testcase = 2;
 
  if (testcase === 1) {
    setLocale('en');
    console.log(i18n('welcome'));
    setLocale('de');
    console.log(i18n('welcome'));
  
    setLocale('en');
    console.log(i18n('computerturn', 'is good'));
    setLocale('de');
    console.log(i18n('computerturn', 'ist gut'));
  }  
  
  
  if (testcase === 2) {
   
    var s,t;
  s = i18nF('welcome');
    t = i18nF('computerturn');
    let ty = i18nF('computerturn','yyy');
    let sc = i18nF('scores', 'GUT', 'SCHLECT');


    console.log('--------');
    console.log('s()=%s', s());
    console.log('t()=%s', t());
    console.log('t(xxx)=%s', t('xxx'));
    console.log('ty()=%s', ty());
    console.log('ty(xxx)=%s', ty('xxx'));
    console.log('sc()=%s', sc());
    console.log('sc(aaa)=%s', sc('aaa'));
    console.log('sc(aaa,bbb)=%s', sc('aaa','bbb'));

    console.log('--------');

    setLocale('de');
    console.log('s()=%s', s());
    console.log('t(xxx)=%s', t('xxx'));
    console.log('ty()=%s', ty());
    console.log('ty(xxx)=%s', ty('xxx'));
    console.log('sc()=%s', sc());
  
  }  

  
};



