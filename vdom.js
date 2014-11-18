"use strict";

module.exports = function (window) {
    var DOCUMENT = window.document;
    if (DOCUMENT.doctype.name==='html') {
        require('./partials/extend-element.js')(window);
        require('./partials/extend-document.js')(window);
        // now parsing and virtualize the complete DOM:
        require('./partials/node-parser.js')(window)(DOCUMENT.documentElement);
        return require('./partials/element-plugin.js')(window);
    }
    // if no HTML, then return an empty object
    return {};
};