/* 
 * i118n.js
 * wraper for i18n-light
 * plus 
 *   function i18n( key, ...args )
 *   function i18nF( key, ...args )
 * 
 */

const I18N = require('i18n-light');
const path = require('path');

module.exports = {
  i18nInit:   i18nInit,
  i18n:       i18n,
  i18nF:      i18nF,
  setLocale:  setLocale
};

const DEFAULT_OPTIONS = {
  defaultLocale:      'en',
  dir:                path.join(__dirname, 'lang'),
  extension:          '.json'
};

function i18nInit( options = DEFAULT_OPTIONS ) {
  
  I18N.configure(options);
  
}

function i18nF ( key, ...args ) {

  var f = function ( key, args) {
    var _key  = key;
    var _args = args;
    return function ( ...args ) {
      var a = new Array(_key);
      if (args.length === 0) 
        a = a.concat(_args);
      else
        a = a.concat(args);
      return I18N.__.apply(I18N, a);
    };  
  };
  
  return new f(key, args);
}


function i18n( ...args ) {
  return I18N.__.apply(I18N, args);
}

function setLocale (locale, refresh) {
  try {
    I18N.setLocale(locale, refresh);
    return true;
  } catch (e) {
    I18N.setLocale(DEFAULT_OPTIONS.defaultLocale, refresh);
    return false;
  }
}