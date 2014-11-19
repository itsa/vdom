"use strict";

module.exports = function (window) {

    if (!window._ITSAmodules) {
        Object.defineProperty(window, '_ITSAmodules', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {} // `writable` is false means we cannot chance the value-reference, but we can change {} its members
        });
    }

    if (window._ITSAmodules.VDOM) {
        return window._ITSAmodules.VDOM; // VDOM was already created
    }

    var DOCUMENT = window.document, vdom;

    if (DOCUMENT.doctype.name==='html') {
        require('./partials/extend-element.js')(window);
        require('./partials/extend-document.js')(window);
        // now parsing and virtualize the complete DOM:
        require('./partials/node-parser.js')(window)(DOCUMENT.documentElement);
        vdom = {
            Plugins: require('./partials/element-plugin.js')(window)
        };
    }
    else {
        // if no HTML, then return an empty Plugin-object
        vdom = {Plugins: {}};
    }

    window._ITSAmodules.VDOM = vdom;

    return vdom;
};