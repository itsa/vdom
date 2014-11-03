/**
 * Deliveres the `vnode` prototype object, which is a virtualisation of an `VElement` inside the Dom.
 * `ExtElements` are HtmlElements but extended so they work smoothless with the vdom (see ...).
 *
 * vnodes are much quicker to access and walk through than native dom-nodes. However, this is a module you don't need
 * by itself: `VElement`-types use these features under the hood.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module vdom
 * @submodule v-element
 * @class VElement
 * @since 0.0.1
*/

"use strict";

require('js-ext/lib/object.js');
require('./extend-element.js');

var classListProto = {
    add: function(className) {
        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
        // note: `this` is the returned object which is NOT the Elementinstance
        var thisobject = this,
            vElement = thisobject.vElement,
            doSet = function(cl) {
                var clName = vElement.attrs[CLASS] || '',
                // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                thisobject.contains(cl) || (vElement.setAttribute(CLASS, clName+((clName.length>0) ? ' ' : '') + cl));
            };
        if (typeof className === STRING) {
            doSet(className);
        }
        else if (Array.isArray(className)) {
            className.forEach(doSet);
        }
    },
    remove: function(className) {
        var vElement = this.vElement,
            doRemove = function(cl) {
                var clName = vElement.attrs[CLASS] || '',
                    regexp = new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)', 'g');
                // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                // note: `this` is the returned object which is NOT the Elementinstance
                vElement.setAttribute(CLASS, clName.replace(regexp, ' ').trim());
            };
        if (typeof className === STRING) {
            doRemove(className);
        }
        else if (Array.isArray(className)) {
            className.forEach(doRemove);
        }
        (vElement.attrs[CLASS]==='') && vElement.removeAttr(CLASS);
    },
    toggle: function(className, forceState) {
        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
        // note: `this` is the returned object which is NOT the Elementinstance
        var thisobject = this,
            vElement = thisobject.vElement,
            doToggle = function(cl) {
                (((typeof forceState === 'boolean') && !forceState) || thisobject.contains(cl)) ? thisobject.remove(cl) : thisobject.add(cl);
            };
        if (typeof className === STRING) {
            doToggle(className);
        }
        else if (Array.isArray(className)) {
            className.forEach(doToggle);
        }
    },
    contains: function(className) {
        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
        // note: `this` is the returned object which is NOT the Elementinstance.
        // May be an Array of classNames, which all needs to be present.
        return this.vElement.vnode.hasClass(className);
    },
    _init: function(vElement) {
        this.vElement = vElement;
    }
};


module.exports = function (window) {

    var domNodeToVNode = require('./node-parser.js')(window),
        NS = require('./vdom-ns.js')(window),
        nodesMap = NS.nodesMap,
        arrayIndexOf = Array.Prototype.indexOf,
        CLASS = 'class',
        STRING = 'string',
        vElement, VElementDescriptor;

    // Overwrite Element methods so that they always return vElement instead of Element:
    if (window.Element) {
        /**
         * Reference to the vnode-object that represents the vElement
         *
         * (will autogenerate a vnode, should it not exists)
         *
         * @property vnode
         * @type vnode
         * @since 0.0.1
         */
        Object.defineProperty(window.Element.prototype, 'vnode', {
           get: function() {
                    var instance = this,
                        vnode = instance.domNode && nodesMap.get(instance.domNode),
                        parentNode, parentVNode, index;
                    if (!vnode && (parentNode=instance.parentNode)) {
                        // parentNode.vnode will be an existing vnode, because it runs through the same getter
                        // it will only be `nul` if `html` is not virtualised
                        parentVNode = parentNode.vnode;
                        if (parentVNode) {
                            vnode = domNodeToVNode(instance, parentVNode);
                            // set the vnode at the right position of its children:
                            index = arrayIndexOf.call(parentNode.childNodes, instance);
                            vnode.moveToParent(parentVNode, index);
                        }
                    }
                    return vnode;
                }
        });
    }

    //---- properties ------------------------------------------------------------------

    /**
     * The classes of the vElement separated by whitespace.
     *
     * @property className
     * @type String
     * @since 0.0.1
     */

    /**
     * The `id` of the vElement (if any).
     *
     * @property id
     * @type String
     * @since 0.0.1
     */

    /**
     * The `tag` of the vElement (allways uppercased).
     *
     * @property nodeName
     * @type String
     * @since 0.0.1
     */



    VElementDescriptor = {
        attributes: {
            get: function() {
                var attrsObj = this.vnode.attrs;
                return attrsObj.toArray({key: 'name'});
            }
        },
        childElementCount: {
            get: function() {
                return this.vnode.vChildren.length;
            }
        },
        childNodes: {
            get: function() {
                var vChildNodes = this.vnode.vChildNodes,
                    nodes = new ElementArray(),
                    i, len;
                len = vChildNodes.length;
                for (i=0; i<len; i++) {
                    nodes[i] = vChildNodes[i].vElement;
                }
                return nodes;
            }
        },

        /**
         * Hash with all the children (vnodes). vChildren are vnodes that have a representing dom-node that is an HtmlElement (nodeType===1)
         *
         * @property vChildren
         * @type Array
         * @since 0.0.1
         */
        children: {
            get: function() {
                var vChildren = this.vnode.vChildren,
                    nodes = new ElementArray(),
                    i, len;
                len = vChildren.length;
                for (i=0; i<len; i++) {
                    nodes[i] = vChildren[i].vElement;
                }
                return nodes;
            }
        },

        classList: {
            get: function() {
                var instance = this,
                    vnode = instance.vnode;
                if (!vnode._classList) {
                    vnode._classList = Object.create(classListProto);
                    vnode._classList._init(instance);
                }
                return vnode._classList;
            }
        },
        className: {
            get: function() {
                return this.getAttribute('class');
            },
            set: function(val) {
                this.setAttribute('class', val);
            }
        },
        /**
         * Reference to the first vChildNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property firstChild
         * @type vnode
         * @deprecated
         * @since 0.0.1
         */
        firstChild: {
            get: function() {
                return this.vnode.vFirstChild.vElement;
            }
        },
        firstElementChild: {
            get: function() {
                return this.vnode.vFirstElementChild.vElement;
            }
        },

        /**
         * Gets or sets the innerHTML of both the vnode as well as the representing dom-node.
         *
         * The setter syncs with the DOM.
         *
         * @property innerHTML
         * @type String
         * @since 0.0.1
         */
        innerHTML: {
            get: function() {
                return this.vnode.innerHTML;
            },
            set: function(val) {
                this.vnode.innerHTML = val;
            }
        },
        /**
         * Reference to the last vChildNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vLastChild
         * @type vnode
         * @deprecated
         * @since 0.0.1
         */
        lastChild: {
            get: function() {
                return this.vnode.vLastChild.vElement;
            }
        },
        lastElementChild: {
            get: function() {
                return this.vnode.vLastElementChild.vElement;
            }
        },
        nextElementSibling: {
            get: function() {
                return this.vnode.vNextElement.vElement;
            }
        },

        nextSibling: {
            get: function() {
                return this.vnode.next.vElement;
            }
        },

        /**
         * Gets or sets the innerHTML of both the vnode as well as the representing dom-node.
         *
         * The setter syncs with the DOM.
         *
         * @property nodeValue
         * @type String
         * @since 0.0.1
         */
        nodeValue: {
            get: function() {
                return this.vnode.nodeValue;
            },
            set: function(val) {
                this.vnode.nodeValue = val;
            }
        },

        /**
         * Gets or sets the outerHTML of both the vnode as well as the representing dom-node.
         *
         * The setter syncs with the DOM.
         *
         * @property innerHTML
         * @type String
         * @since 0.0.1
         */
        outerHTML: {
            get: function() {
                return this.vnode.outerHTML;
            },
            set: function(val) {
                this.vnode.outerHTML = val;
            }
        },

        parentElement: {
            get: function() {
                return this.vnode.vParent.vElement;
            }
        },
        parentNode: {
            get: function() {
                return this.parentElement;
            }
        },
        previousElementSibling: {
            get: function() {
                return this.vnode.vPreviousElement.vElement;
            }
        },
        previousSibling: {
            get: function() {
                return this.vnode.previous.vElement;
            }
        },
        tagName: {
            get: function() {
                return this.vnode.tag;
            }
        },
       /**
        * Gets or sets the value of the following vElements:
        *
        * <ul>
        *     <li>input</li>
        *     <li>textarea</li>
        *     <li>select</li>
        *     <li>any container that is `contenteditable`</li>
        * </ul>
        *
        * Will emit a `valuechange`-event when a new value is set and ITSA's `event`-module is active.
        *
        * @property getValue
        * @type String
        * @since 0.0.1
        */
        value {
            get: function() {
                // cautious: input and textarea must be accessed by their propertyname:
                // input.getAttribute('value') would return the default-value instead of actual
                // and textarea.getAttribute('value') doesn't exist
                var instance = this,
                    editable = ((editable=instance.vnode.attrs.contenteditable) && (editable!=='false'));
                return editable ? instance.innerHTML : instance.domnode.value;
            },
            set: function(val) {
                var instance = this,
                    prevVal = instance.value,
                // cautious: input and textarea must be accessed by their propertyname:
                // input.getAttribute('value') would return the defualt-value instead of actusl
                // and textarea.getAttribute('value') doesn't exist
                    editable = ((editable=instance.vnode.attrs.contenteditable) && (editable!=='false'));
                if (editable) {
                    instance.innerHTML = val;
                }
                else {
                    instance.domnode.value = value;
                }
                // if `document._emitVC` is available, then invoke it to emit the `valuechange`-event
                DOCUMENT._emitVC && (prevVal!==val) && DOCUMENT._emitVC(instance, val);
            }
        },
        /**
         * Gets or sets the innerContent of the Node as plain text.
         *
         * The setter syncs with the DOM.
         *
         * @property textContent
         * @type String
         * @since 0.0.1
         */
        textContent: {
            get: function() {
                return this.vnode.textContent;
            },
            set: function(val) {
                this.vnode.textContent = val;
            }
        }

    };

    vElement = function(element) {
        var Element = Object.create(element, VElementDescriptor);

        ['id', 'style', 'name', 'href', 'src', 'type'].forEach(function(prop) {
            Object.defineProperty(Element, prop, {
                get: function() {
                    return this.getAttribute(prop);
                },
                set: function(val) {
                    this.setAttribute(prop, val);
                }
            });
        });

        /**
         * Reference to the dom-node that belongs to the vElement
         *
         * @property domNode
         * @type HtmlElement
         * @since 0.0.1
         */
        Object.defineProperty(Element, {
            domNode: {
                value: element,
                enumerable: false,
                writable: false,
                configurable: false
            }
        });

/*
        // give the original domnode a reference to the vElement:
        Object.defineProperty(element, {
            _vElement: {
                value: Element,
                enumerable: false,
                writable: false,
                configurable: false
            }
        });
*/
        return Element;
    };

    module.exports = vElement;

};