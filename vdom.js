"use strict";

require('js-ext/lib/object.js');

var createHashMap = require('js-ext/extra/hashmap.js').createMap,
    later = require('utils/lib/timers.js').later;

module.exports = function (window) {
    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.VDOM) {
        return window._ITSAmodules.VDOM; // VDOM was already created
    }

    var DOCUMENT = window.document;

    if (DOCUMENT.doctype.name.toLowerCase()==='html') {
        require('./partials/extend-element.js')(window);
        require('./partials/extend-document.js')(window);
        // now parsing and virtualize the complete DOM:
        require('./partials/node-parser.js')(window)(DOCUMENT.documentElement);
        // if there is any Element with inline `transform` that is not compatible with the current browser:
        // we can revert it into the right `transform`, because the vdom knows the right transform-name:
        DOCUMENT.getAll('[style*="transform:"]').forEach(function(node) {
            var vnode = node.vnode,
                rightStyle = vnode.attrs.style;
            // delete current definition, so that reset will do an update:
            delete vnode.attrs.style;
            // now reset:
            vnode._setAttr('style', rightStyle);
        });
        // cleanup duplicated `style` elements - if any
        // this can be done async with a small delay: no one will notice
        later(function() {
            var head = DOCUMENT.getElement('head');
            head.vnode._cleanupStyle();
        }, 500);
    }

    window._ITSAmodules.VDOM = true;
};