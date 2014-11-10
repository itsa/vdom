"use strict";

module.exports = function (window) {
    var DOCUMENT = window.document;
    if (DOCUMENT.doctype.name==='html') {
        require('./lib/extend-element.js')(window);
        require('./lib/extend-document.js')(window);
        // now parsing and virtualize the complete DOM:
        require('./lib/node-parser.js')(window)(DOCUMENT.documentElement);
    }
};