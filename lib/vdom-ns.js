/**
 * Creates a Namespace that can be used accros multiple vdom-modules to share information.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module vdom
 * @submodule vdom-ns
 * @class NS-vdom
 * @since 0.0.1
*/

"use strict";

require('polyfill/lib/weakmap.js');
require('js-ext/lib/object.js');

module.exports = function (window) {
    var NS;

    if (!window._ITSAmodules) {
        Object.defineProperty(window, '_ITSAmodules', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {} // `writable` is false means we cannot chance the value-reference, but we can change {} its members
        });
    }

    NS = window._ITSAmodules.VDOM || (window._ITSAmodules.VDOM={});

    /**
     * Reference to the VElement of document.body (gets its value as soon as it gets refered to)
     *
     * @property body
     * @default null
     * @type VElement
     * @since 0.0.1
     */
     NS.body = null;

    /**
     * Reference to the VElement of document.head (gets its value as soon as it gets refered to)
     *
     * @property head
     * @default null
     * @type VElement
     * @since 0.0.1
     */
     NS.head = null;

    /**
     * A hash to identify what tagNames could have a `life` list at `document` (like `document.forms`).
     *
     * @property LIFE_PROPERTIES
     * @default {
     *  'A': true,
     *  'APPLET': true,
     *  'EMBED': true,
     *  'FORM': true,
     *  'IMG': true,
     *  'SCRIPT': true,
     *  'STYLE': true,
     *  'AREA': true
     * }
     * @type Object
     * @since 0.0.1
     */
    NS.LIFE_PROPERTIES = {
        'A': true,
        'APPLET': true,
        'EMBED': true,
        'FORM': true,
        'IMG': true,
        'SCRIPT': true,
        'STYLE': true,
        'AREA': true
    };

    /**
     * A hash of tagNames have their life-list examined (like `document.forms`).
     * This will be activated for each property, as soon as it is asked for.
     *
     * @property LIFE_PROPS
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.LIFE_PROPS = {};

    /**
     * A hash with all node'ids (of all the domnodes that have an id). The value is a reference to an VElement.
     *
     * @property nodeids
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.nodeids || (NS.nodeids={});

    /**
     * A hash with all domnodes (original HtmlElements). The value is a reference to its related `vnode`.
     *
     * @property nodesMap
     * @default {}
     * @type WeakMap
     * @since 0.0.1
     */
    NS.nodesMap || (NS.nodesMap=new window.WeakMap());

    /**
     * A hash with all encountered non-void Elements
     *
     * @property nonVoidElements
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.nonVoidElements || (NS.nonVoidElements={});

    /**
     * A hash to identify what tagNames are equal to `SCRIPT` or `STYLE`.
     *
     * @property SCRIPT_OR_STYLE_TAG
     * @default {SCRIPT: true, STYLE: true}
     * @type Object
     * @since 0.0.1
     */
    NS.SCRIPT_OR_STYLE_TAG = {
        SCRIPT: true,
        STYLE: true
    };

    /**
     * A hash with all nodeTypes that should be captured by the vDOM.
     *
     * @property VALID_NODE_TYPES
     * @default {1: true, 3: true, 8: true}
     * @type Object
     * @since 0.0.1
     */
    NS.VALID_NODE_TYPES = {
        1: true,
        3: true,
        8: true
    };

    /**
     * A hash with all encountered void Elements
     *
     * @property voidElements
     * @default {}
     * @type Object
     * @since 0.0.1
     */
    NS.voidElements || (NS.voidElements={});

    return NS;
};