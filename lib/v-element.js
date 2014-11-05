/**
 * Defines a vElement-function that extends dom-nodes into vElements.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module vdom
 * @submodule v-element
 * @class VElement
 * @since 0.0.1
*/

"use strict";

var CLASS = 'class',
    STRING = 'string',
    classListProto = {
        add: function(className) {
            // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
            // note: `this` is the returned object which is NOT the Elementinstance
            var thisobject = this,
                vElement = thisobject.vElement,
                doSet = function(cl) {
                    var clName = vElement.attrs[CLASS] || '';
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
        item: function(index) {
            var items = this.vElement.className.split(' ');
            return items[index];
        },
        _init: function(vElement) {
            this.vElement = vElement;
        }
    };


module.exports = function (window) {

    var domNodeToVNode = require('./node-parser.js')(window),
        NS = require('./vdom-ns.js')(window),
        nodesMap = NS.nodesMap,
        arrayIndexOf = Array.prototype.indexOf,
        DOCUMENT = window.document,
        createVElement, VElementDescriptor;

    //---- properties ------------------------------------------------------------------

    VElementDescriptor = {
        /**
         * Returns or sets all attributes as defined as an key/value object.
         *
         * @property attrs
         * @type Object
         */
        attrs: {
            get: function() {
                return this.vnode.attrs;
            },
            set: function(val) {
                this.vnode._setAttrs(val);
            }
        },

        /**
         * Returns the number of children (child vElements)
         *
         * @property childElementCount
         * @type Number
         * @readOnly
         */
        childElementCount: {
            get: function() {
                return this.vnode.vChildren.length;
            }
        },

        /**
         * Returns a live collection of childNodes of the given element, either Element, TextNode or CommentNode
         *
         * @property childNodes
         * @type ElementArray
         * @readOnly
         */
        childNodes: {
            get: function() {
                return this.vnode.childNodes;
            }
        },

        /**
         * Returns a live collection of child vElement's of the given element.
         *
         * @property children
         * @type ElementArray
         * @readOnly
         */
        children: {
            get: function() {
                return this.vnode.children;
            }
        },

        /**
         * Returns a token list of the class attribute of the element.
         * See: https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
         *
         * @property classList
         * @type DOMTokenList
         * @readOnly
         */
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

        /**
         * Gets and sets the value of the class attribute of the specified element.
         *
         * @property className
         * @type String
         */
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
         * Do not use this, but use `firstElementChild` instead, which returns the first vElement-child.
         *
         * @property firstChild
         * @readOnly
         * @deprecated
         */
        firstChild: {
            get: function() {
                return this.vnode.vFirstChild.vElement;
            }
        },

        /**
         * Reference to the first vElement-child, where the related dom-node is an Element (nodeType===1).
         *
         * @property firstElementChild
         * @type vElement
         * @readOnly
         */
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
         * Do not use this, but use `lastElementChild` instead, which returns the last vElement-child.
         *
         * @property vLastChild
         * @readOnly
         * @deprecated
         */
        lastChild: {
            get: function() {
                return this.vnode.vLastChild.vElement;
            }
        },

        /**
         * Reference to the last vElement-child, where the related dom-node is an Element (nodeType===1).
         *
         * @property lastElementChild
         * @type vElement
         * @readOnly
         */
        lastElementChild: {
            get: function() {
                return this.vnode.vLastElementChild.vElement;
            }
        },

        /**
         * Returns the vElement immediately following the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is an vElement (nodeType===1).
         *
         * @property nextElementSibling
         * @type vElement
         * @readOnly
         */
        nextElementSibling: {
            get: function() {
                return this.vnode.vNextElement.vElement;
            }
        },

        /**
         * Returns the vElement immediately following the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * Do not use this, but use `lastElementChild` instead, which returns the next vElement-child.
         *
         * @property nextElementSibling
         * @deprecated
         * @readOnly
         */
        nextSibling: {
            get: function() {
                return this.vnode.next.vElement;
            }
        },

        /**
         * vElements tag-name
         *
         * @property nodeName
         * @readOnly
         */
        nodeName: {
            get: function() {
                return this.vnode.tag;
            }
        },

        /**
         * vElements nodetype: 1==Element, 3==TextNode, 8===CommentNode
         *
         * @property nodeType
         * @readOnly
         */
        nodeType: {
            get: function() {
                return this.vnode.nodeType;
            }
        },

        /**
         * vElements tag-name
         *
         * @property nodeValue
         * @type String
         * @since 0.0.1
         */
        nodeValue: {
            get: function() {
                return this.vnode.text;
            },
            set: function(val) {
                this.vnode.text = val;
            }
        },

        /**
         * Gets or sets the outerHTML of both the vElement as well as the representing dom-node.
         *
         * @property outerHTML
         * @type String
         */
        outerHTML: {
            get: function() {
                return this.vnode.outerHTML;
            },
            set: function(val) {
                this.vnode.outerHTML = val;
            }
        },

        /**
         * Returns the vElement's parent vElement.
         *
         * Same as `parentNode`
         *
         * @property parentElement
         * @type vElement
         */
        parentElement: {
            get: function() {
                return this.vnode.vParent.vElement;
            }
        },

        /**
         * Returns the vElement's parent vElement.
         *
         * Same as `parentElement`
         *
         * @property parentNode
         * @type vElement
         */
        parentNode: {
            get: function() {
                return this.parentElement;
            }
        },

        /**
         * Returns the vElement immediately preceding the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is an vElement (nodeType===1).
         *
         * @property previousElementSibling
         * @type vElement
         * @readOnly
         */
        previousElementSibling: {
            get: function() {
                return this.vnode.vPreviousElement.vElement;
            }
        },

        /**
         * Returns the vElement immediately preceding the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * Do not use this, but use `previousElementSibling` instead, which returns the previous vElement-child.
         *
         * @property previousSibling
         * @deprecated
         * @readOnly
         */
        previousSibling: {
            get: function() {
                return this.vnode.previous.vElement;
            }
        },

       /**
        * vElements tag-name (same as nodeName)
        *
        * @property tagName
        * @readOnly
        * @since 0.0.1
        */
        tagName: {
            get: function() {
                return this.nodeName;
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
        value: {
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
                    instance.domnode.value = val;
                }
                // if `document._emitVC` is available, then invoke it to emit the `valuechange`-event
                DOCUMENT._emitVC && (prevVal!==val) && DOCUMENT._emitVC(instance, val);
            }
        },

        /**
         * Reference to the vnode-object that represents the vElement
         *
         * (will autogenerate a vnode, should it not exists)
         *
         * @property vnode
         * @type vnode
         * @since 0.0.1
         */
        vnode: {
           get: function() {
                    var instance = this,
                        vnode = instance.domNode && nodesMap.get(instance.domNode),
                        parentNode, parentVNode, index;
                    if (!vnode && (parentNode=instance.parentNode)) {
                        // parentNode.vnode will be an existing vnode, because it runs through the same getter
                        // it will only be `nul` if `html` is not virtualised
                        parentVNode = parentNode.vnode;
                        if (parentVNode) {
                            vnode = domNodeToVNode(instance, createVElement, parentVNode);
                            // set the vnode at the right position of its children:
                            index = arrayIndexOf.call(parentNode.childNodes, instance);
                            vnode.moveToParent(parentVNode, index);
                        }
                    }
                    return vnode;
                }
        }

    };

    createVElement = function(element) {
        var Element = Object.create(element, VElementDescriptor);

        ['id', 'style', 'name', 'href', 'src', 'type'].forEach(function(prop) {
            Object.defineProperty(Element, prop, {
                get: function() {
                    return this.vnode.attrs[prop] || null;
                },
                set: function(val) {
                    Element.setAttribute(prop, val);
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
        Object.defineProperty(Element, 'domNode', {
            value: element,
            enumerable: false,
            writable: false,
            configurable: false
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

    return createVElement;

};

/**
 * sets or returns an accesskey for an element. An accesskey specifies a shortcut key to activate/focus an element.
 * Note: The way of accessing the shortcut key is varying in different browsers: http://www.w3schools.com/jsref/prop_html_accesskey.asp
 *
 * @property accessKey
 * @type String
 */

/**
 * Returns a live collection of all attribute nodes registered to the specified node.
 * It is a NamedNodeMap, not an Array, so it has no Array methods and the Attr nodes' indexes may differ among browsers.
 * To be more specific, attributes is a key/value pair of strings that represents any information regarding that attribute.
 *
 * Prefer to use the property `attrs` which is much quicker, but doesn't return a life-list.
 *
 * @property attributes
 * @type NamedNodeMap
 */

/**
 * The absolute base URL of a node.
 *
 * @property baseURI
 * @type String
 * @readOnly
 */

/**
 * Returns the inner height of an element in pixels, including padding but not the horizontal scrollbar height, border, or margin.
 *
 * @property clientHeight
 * @type Number
 * @readOnly
 */

/**
 * The width of the left border of an element in pixels. It includes the width of the vertical scrollbar if the text direction of the element is right–to–left
 * and if there is an overflow causing a left vertical scrollbar to be rendered. clientLeft does not include the left margin or the left padding.
 *
 * @property clientLeft
 * @type Number
 * @readOnly
 */

/**
 * The width of the top border of an element in pixels. It does not include the top margin or padding.
 *
 * @property clientTop
 * @type Number
 * @readOnly
 */

/**
 * Returns the inner width of an element in pixels, including padding but not the vertical scrollbar height, border, or margin.
 *
 * @property clientWidth
 * @type Number
 * @readOnly
 */

/**
 * Gets or sets the element's attribute `href`. Only applies for the `a`-element.
 *
 * @property href
 * @type String
 */

/**
 * Gets or sets the element's identifier (attribute id).
 *
 * @property id
 * @type String
 */

/**
 * Gets or sets the `name` property of a vElement; it only applies to the following elements:
 * `a`, `applet`, `button`, `form`, `frame`, `iframe`, `img`, `input`, `map`, `meta`, `object`, `param`, `select`, and `textarea`.
 *
 * @property name
 * @type String
 */

/**
 * A measurement of the height of an element's content, including content not visible on the screen due to overflow.
 * The scrollHeight value is equal to the minimum clientHeight the element would require in order to fit all the content in the viewpoint
 * without using a vertical scrollbar. It includes the element padding but not its margin.
 *
 * @property scrollHeight
 * @type Number
 * @readOnly
 */

/**
 * Gets or sets the number of pixels that an element's content is scrolled to the left.
 *
 * @property scrollLeft
 * @type Number
 */

/**
 * Gets or sets the number of pixels that the content of an element is scrolled upward. An element's scrollTop is a measurement
 * of the distance of an element's top to its topmost visible content. When an element content does not generate a vertical scrollbar,
 * then its scrollTop value defaults to 0.
 *
 * @property scrollTop
 * @type Number
 */

/**
 * Returns either the width in pixels of the content of an element or the width of the element itself, whichever is greater.
 * If the element is wider than its content area (for example, if there are scroll bars for scrolling through the content),
 * the scrollWidth is larger than the clientWidth.
 *
 * @property scrollWidth
 * @type Number
 * @readOnly
 */

/**
 * Gets or sets the element's attribute `type`. Only applies for the `script`, `img` and `style`-elements.
 *
 * @property src
 * @type String
 */

/**
 * Gets or sets the element's attribute `style`.
 *
 * @property style
 * @type String
 */

/**
 * Gets or sets the element's attribute `type`. Only applies for the `input`-element.
 *
 * @property type
 * @type String
 */
