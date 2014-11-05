"use strict";

module.exports = function (window) {
    var DOCUMENT = window.document,
        VElementClass;
    if (DOCUMENT.doctype.name==='html') {
        require('./lib/extend-window.js')(window);
        require('./lib/extend-document.js')(window);
        VElementClass = require('./lib/v-element.js')(window);
        // now parsing and virtualize the complete DOM:
        require('./lib/node-parser.js')(window)(DOCUMENT._documentElement, VElementClass);
    }
};