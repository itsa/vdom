/**
 * Creates a Namespace that can be used accros multiple vdom-modules to share information.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module vdom
 * @submodule vdom-ns
 * @class NS-vdom
 * @since 0.0.1
*/

"use strict";

require('js-ext/lib/object.js');
require('polyfill');

var createHashMap = require('js-ext/extra/hashmap.js').createMap;

module.exports = function (window) {
    var NS;

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.VDOM_NS) {
        return window._ITSAmodules.VDOM_NS; // VDOM_NS was already created
    }

    NS = window._ITSAmodules.VDOM_NS = createHashMap();

    /**
     * Reference to the VElement of document.body (gets its value as soon as it gets refered to)
     *
     * @property body
     * @default null
     * @type VElement
     * @since 0.0.1
     */
    NS.body = null;

    NS.xmlNS = createHashMap({
        SVG: 'http://www.w3.org/2000/svg',
        XBL: 'http://www.mozilla.org/xbl',
        XUL: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
        MATH: 'http://www.w3.org/1998/Math/MathML',
        XLINK: 'http://www.w3.org/1999/xlink'
    });

    /**
     * A hash with all node'ids (of all the domnodes that have an id). The value is a reference to an VElement.
     *
     * @property nodeids
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.nodeids || (NS.nodeids=createHashMap());

    /**
     * A hash with all encountered non-void Elements
     *
     * @property nonVoidElements
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.nonVoidElements || (NS.nonVoidElements=createHashMap());

    /**
     * A hash to identify what tagNames are equal to `SCRIPT` or `STYLE`.
     *
     * @property SCRIPT_OR_STYLE_TAG
     * @default {SCRIPT: true, STYLE: true}
     * @type Object
     * @since 0.0.1
     */
    NS.SCRIPT_OR_STYLE_TAG = createHashMap({
        SCRIPT: true,
        STYLE: true
    });

    /**
     * A hash with all nodeTypes that should be captured by the vDOM.
     *
     * @property VALID_NODE_TYPES
     * @default {1: true, 3: true, 8: true}
     * @type Object
     * @since 0.0.1
     */
    NS.VALID_NODE_TYPES = createHashMap({
        1: true,
        3: true,
        8: true
    });

    /**
     * A hash with all encountered void Elements
     *
     * @property voidElements
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.voidElements || (NS.voidElements=createHashMap());

    return NS;
};