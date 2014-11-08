"use strict";

/**
 * Provides several methods that override native Element-methods to work with the vdom.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vnode
 * @submodule extend-element
 * @class Element
 * @since 0.0.1
*/


require('../css/element.css');
require('js-ext/lib/object.js');
require('js-ext/lib/string.js');
require('polyfill/polyfill-base.js');

var FILTER_ACCEPT = 1,
    FILTER_REJECT = 2,
    ElementArray = require('./element-array.js');

module.exports = function (window) {

    var NAME = '[extend-element]: ',
        domNodeToVNode = require('./node-parser.js')(window),
        htmlToVNodes = require('./html-parser.js')(window),
        NS = require('./vdom-ns.js')(window),
        DOCUMENT = window.document,
        nodeids = NS.nodeids,
        arrayIndexOf = Array.prototype.indexOf,
        POSITION = 'position',
        BLOCK = 'el-block',
        BORDERBOX = 'el-borderbox',
        NO_TRANS = 'el-notrans',
        INVISIBLE = 'el-invisible',
        REGEXP_NODE_ID = /^#\S+$/,
        LEFT = 'left',
        TOP = 'top',
        BORDER = 'border',
        WIDTH = 'width',
        STRING = 'string',
        BORDER_LEFT_WIDTH = BORDER+'-left-'+WIDTH,
        BORDER_RIGHT_WIDTH = BORDER+'-right-'+WIDTH,
        BORDER_TOP_WIDTH = BORDER+'-top-'+WIDTH,
        BORDER_BOTTOM_WIDTH = BORDER+'-bottom-'+WIDTH,
        NUMBER = 'number',
        PX = 'px',
        ElementDescriptor,
        htmlToVFragments = function(html) {
            return {
                isFragment: true,
                cVhildNodes: htmlToVNodes(html)
            };
        },
        toCamelCase = function(input) {
            return input.toLowerCase().replace(/-(.)/g, function(match, group) {
                return group.toUpperCase();
            });
        },
        fromCamelCase = function(input) {
            return input.replace(/[a-z]([A-Z])/g, function(match, group) {
                return match[0]+'-'+group.toLowerCase();
            });
        },
        classListProto = {
            add: function(className) {
                // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                // note: `this` is the returned object which is NOT the Elementinstance
                var thisobject = this,
                    element = thisobject.element,
                    doSet = function(cl) {
                        var clName = element.attrs[CLASS] || '';
                        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                        thisobject.contains(cl) || (element.setAttribute(CLASS, clName+((clName.length>0) ? ' ' : '') + cl));
                    };
                if (typeof className === STRING) {
                    doSet(className);
                }
                else if (Array.isArray(className)) {
                    className.forEach(doSet);
                }
            },
            remove: function(className) {
                var element = this.element,
                    doRemove = function(cl) {
                        var clName = element.attrs[CLASS] || '',
                            regexp = new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)', 'g');
                        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                        // note: `this` is the returned object which is NOT the Elementinstance
                        element.setAttribute(CLASS, clName.replace(regexp, ' ').trim());
                    };
                if (typeof className === STRING) {
                    doRemove(className);
                }
                else if (Array.isArray(className)) {
                    className.forEach(doRemove);
                }
                (element.attrs[CLASS]==='') && element.removeAttr(CLASS);
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
                return this.element.vnode.hasClass(className);
            },
            item: function(index) {
                var items = this.element.className.split(' ');
                return items[index];
            },
            _init: function(element) {
                this.element = element;
            }
        },
        treeWalkerProto = {
            _init: function(element, whatToShow, filter) {
                var instance = this;
                if (typeof filter !== 'function') {
                    // check if it is a NodeFilter-object
                    filter.acceptNode && (filter=filter.acceptNode);
                }
                (typeof filter==='function') || (filter=null);
                instance.vNodePointer = element.vnode.vFirstChild;
                instance._root = element;
                instance._whatToShow = whatToShow; // making it accessable for the getter `whatToShow`
                instance._filter = filter; // making it accessable for the getter `filter`
            },
            _match: function(vnode, forcedVisible) {
                var whatToShow = this._whatToShow,
                    filter = this._filter,
                    showElement = ((whatToShow & 1)!==0),
                    showComment = ((whatToShow & 128)!==0),
                    showText = ((whatToShow & 4)!==0),
                    typeMatch = (showElement && (vnode.nodeType===1)) || (showComment && (vnode.nodeType===8)) || (showText && (vnode.nodeType===3)),
                    visibleMatch = !forcedVisible || (window.getComputedStyle(vnode.domNode).display!=='none'),
                    funcMatch = filter ? filter(vnode.domNode) : true;
                return typeMatch && visibleMatch && funcMatch;
            },
            firstChild: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vFirstChild;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vNext;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            lastChild: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vLastChild;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vPrevious;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            nextNode: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vNext;
                while (foundVNode && !instance._match(foundVNode, true)) {
                    foundVNode = foundVNode.vNext();
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            nextSibling: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vNext;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vNext();
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            parentNode: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vParent;
                (foundVNode!==instance._root) && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            previousNode: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vPrevious;
                while (foundVNode && !instance._match(foundVNode, true)) {
                    foundVNode = foundVNode.vPrevious();
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            previousSibling: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vPrevious;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vPrevious();
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            }
        };

    require('window-ext')(window);

    Object.defineProperties(treeWalkerProto, {
        'currentNode': {
            get: function() {
                return this.vNodePointer.domNode;
            }
        },
        'filter': {
            get: function() {
                return this._filter;
            }
        },
        'root': {
            get: function() {
                return this._root;
            }
        },
        'whatToShow': {
            get: function() {
                return this._whatToShow;
            }
        }
    });

    ElementDescriptor = {
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
         * Returns a live collection of child Element's of the given element.
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
         * Do not use this, but use `firstElementChild` instead, which returns the first Element-child.
         *
         * @property firstChild
         * @readOnly
         * @deprecated
         */
        firstChild: {
            get: function() {
                return this.vnode.vFirstChild.domNode;
            }
        },

        /**
         * Reference to the first Element-child, where the related dom-node is an Element (nodeType===1).
         *
         * @property firstElementChild
         * @type Element
         * @readOnly
         */
        firstElementChild: {
            get: function() {
                return this.vnode.vFirstElementChild.domNode;
            }
        },

        /**
         * Reference to the last vChildNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * Do not use this, but use `lastElementChild` instead, which returns the last Element-child.
         *
         * @property vLastChild
         * @readOnly
         * @deprecated
         */
        lastChild: {
            get: function() {
                return this.vnode.vLastChild.domNode;
            }
        },

        /**
         * Reference to the last Element-child, where the related dom-node is an Element (nodeType===1).
         *
         * @property lastElementChild
         * @type Element
         * @readOnly
         */
        lastElementChild: {
            get: function() {
                return this.vnode.vLastElementChild.domNode;
            }
        },

        /**
         * Returns the Element immediately following the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is an Element (nodeType===1).
         *
         * @property nextElementSibling
         * @type Element
         * @readOnly
         */
        nextElementSibling: {
            get: function() {
                return this.vnode.vNextElement.domNode;
            }
        },

        /**
         * Returns the Element immediately following the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * Do not use this, but use `lastElementChild` instead, which returns the next Element-child.
         *
         * @property nextElementSibling
         * @deprecated
         * @readOnly
         */
        nextSibling: {
            get: function() {
                return this.vnode.next.domNode;
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
         * Returns the Element's parent Element.
         *
         * Same as `parentNode`
         *
         * @property parentElement
         * @type Element
         */
        parentElement: {
            get: function() {
                return this.vnode.vParent.domNode;
            }
        },

        /**
         * Returns the Element's parent Element.
         *
         * Same as `parentElement`
         *
         * @property parentNode
         * @type Element
         */
        parentNode: {
            get: function() {
                return this.parentElement;
            }
        },

        /**
         * Returns the Element immediately preceding the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is an Element (nodeType===1).
         *
         * @property previousElementSibling
         * @type Element
         * @readOnly
         */
        previousElementSibling: {
            get: function() {
                return this.vnode.vPreviousElement.domNode;
            }
        },

        /**
         * Returns the Element immediately preceding the specified one in its parent's vChildNodes list, or null if the specified node is the last node in that list.
         * Is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * Do not use this, but use `previousElementSibling` instead, which returns the previous Element-child.
         *
         * @property previousSibling
         * @deprecated
         * @readOnly
         */
        previousSibling: {
            get: function() {
                return this.vnode.previous.domNode;
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
         * Gets or sets the innerHTML of both the vnode as well as the representing dom-node.
         * Goes through the vdom, so it's superfast.
         *
         * Use this proeprty instead of `innerHTML`
         *
         * The setter syncs with the DOM.
         *
         * @property vInnerHTML
         * @type String
         * @since 0.0.1
         */
        vInnerHTML: {
            get: function() {
                return this.vnode.innerHTML;
            },
            set: function(val) {
                this.vnode.innerHTML = val;
            }
        },

        /**
         * Gets or sets the outerHTML of both the Element as well as the representing dom-node.
         * Goes through the vdom, so it's superfast.
         *
         * Use this proeprty instead of `outerHTML`
         *
         * @property vOuterHTML
         * @type String
         */
        vOuterHTML: {
            get: function() {
                return this.vnode.outerHTML;
            },
            set: function(val) {
                this.vnode.outerHTML = val;
            }
        },

        /**
         * Reference to the vnode-object that represents the Element
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
                        parentNode, parentVNode, index;
                    if (!vnode && (parentNode=instance.parentNode)) {
                        // parentNode.vnode will be an existing vnode, because it runs through the same getter
                        // it will only be `null` if `html` is not virtualised
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
        },

        /**
         * Gets or sets the innerContent of the Node as plain text.
         * Goes through the vdom, so it's superfast.
         *
         * Use this proeprty instead of `texContent`
         *
         * The setter syncs with the DOM.
         *
         * @property vTextContent
         * @type String
         * @since 0.0.1
         */
        vTextContent: {
            get: function() {
                return this.vnode.textContent;
            },
            set: function(val) {
                this.vnode.textContent = val;
            }
        }

    };

    (function(ElementPrototype) {

        Object.defineProperties(ElementPrototype, ElementDescriptor);

       /**
        * Appends an Element or an Element's string-representation at the end of Element's innerHTML, or before the `refElement`.
        *
        * @method append
        * @param content {Element|ElementArray|String} content to append
        * @param [refElement] {Element} reference Element where the content should be appended
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.append = function(content, refElement, escape) {
            var instance = this,
                i, len, item,
            doAppend = function(oneItem) {
                var vChildNodes, i, len, fragment;
                if (escape) {
                    if (oneItem.isFragment) {
                        vChildNodes = oneItem.vChildNodes;
                        len = vChildNodes.length;
                        for (i=1; i<len; i++) {
                            fragment = vChildNodes[i];
                            fragment.textContent = fragment.innerHTML;
                        }
                    }
                    else {
                        oneItem.vTextContent = oneItem.vInnerHTML;
                    }
                }
                if (refElement) {
                    instance.insertBefore(oneItem, refElement);
                }
                else {
                    instance.appendChild(oneItem);
                }
            };
            refElement && (instance.children.indexOf(refElement)!==-1) && (refElement=refElement.next());
            (typeof content===STRING) && (content=htmlToVFragments(content));
            if (Array.isArray(content)) {
                len = content.length;
                for (i=0; i<len; i++) {
                    item = content[i];
                    doAppend(item);
                }
            }
            else {
                doAppend(content);
            }
            return instance;
        };

       /**
        * Returns a duplicate of the node. Use cloneNode(true) for a `deep` clone.
        *
        * @method cloneNode
        * @param [deep] {Boolean} whether to perform a `deep` clone: with all descendants
        * @return {Element} a clone of this Element
        * @since 0.0.1
        */
        ElementPrototype.cloneNode = function(deep) {
            var instance = this,
                cloned = instance.cloneNode(deep);
            cloned.vnode = domNodeToVNode(cloned);
            if (instance.vnode._data) {
                Object.defineProperty(cloned.vnode, '_data', {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: {} // `writable` is false means we cannot chance the value-reference, but we can change {}'s properties itself
                });
                cloned.vnode._data.merge(instance.vnode._data);
            }
            return cloned;
        };

        /**
         * Compares the position of the current node against another node in any other document.
         *
         * Returnvalues are a composition of the following bitwise values:
         * <ul>
         *     <li>Node.DOCUMENT_POSITION_DISCONNECTED  (one of the Elements is not part of the dom)</li>
         *     <li>Node.DOCUMENT_POSITION_PRECEDING  (this Element comes before otherElement)</li>
         *     <li>Node.DOCUMENT_POSITION_FOLLOWING  (this Element comes after otherElement)</li>
         *     <li>Node.DOCUMENT_POSITION_CONTAINS  (otherElement trully contains -not equals- this Element)</li>
         *     <li>Node.DOCUMENT_POSITION_CONTAINED_BY  (Element trully contains -not equals- otherElement)</li>
         * </ul>
         *
         * @method compareDocumentPosition
         * @param otherElement {Element}
         * @return {Number} A bitmask, use it this way: if (thisNode.compareDocumentPosition(otherNode) & Node.DOCUMENT_POSITION_FOLLOWING) {// otherNode is following thisNode}
         */
        ElementPrototype.compareDocumentPosition = function(otherElement) {
            // see http://ejohn.org/blog/comparing-document-position/
            var instance = this,
                parent, index1, index2;
            if (instance===otherElement) {
                return 0;
            }
            if (!DOCUMENT.contains(instance) || !DOCUMENT.contains(otherElement)) {
                return 1;
            }
            else if (instance.contains(otherElement)) {
                return 20;
            }
            else if (otherElement.contains(instance)) {
                return 10;
            }
            parent = instance.parentNode;
            index1 = parent.vChildNodes.indexOf(instance.vnode);
            index2 = parent.vChildNodes.indexOf(otherElement.vnode);
            if (index1<index2) {
                return 4;
            }
            else {
                return 2;
            }
        };

        /**
         * Indicating whether this Element contains OR equals otherElement.
         *
         * @method contains
         * @param otherElement {Element}
         * @return {Boolean} whether this Element contains OR equals otherElement.
         */
        ElementPrototype.contains = function(otherElement) {
            if (otherElement===this) {
                return true;
            }
            return this.vnode.contains(otherElement.vnode);
        };

        /**
         * Returns a newly created TreeWalker object with this Element as root.
         *
         * The TreeWalker is life presentation of the dom. It gets updated when the dom changes.
         *
         * @method createTreeWalker
         * @param root {Element} The root node at which to begin the NodeIterator's traversal.
         * @param [whatToShow] {Number} Filter specification constants from the NodeFilter DOM interface, indicating which nodes to iterate over.
         * You can use or sum one of the next properties:
         * <ul>
         *   <li>window.NodeFilter.SHOW_ELEMENT</li>
         *   <li>window.NodeFilter.SHOW_COMMENT</li>
         *   <li>window.NodeFilter.SHOW_TEXT</li>
         * </ul>
         * @param [filter] {NodeFilter|function} An object implementing the NodeFilter interface or a function. See https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
         * @return {TreeWalker}
         * @since 0.0.1
         */
        ElementPrototype.createTreeWalker = function(whatToShow, filter) {
            var treeWalker = Object.create(treeWalkerProto);
            treeWalker._init(this, whatToShow, filter);
            return treeWalker;
        };

       /**
        * Sets the inline-style of the Element exactly to the specified `value`, overruling previous values.
        * Making the Element's inline-style look like: style="value".
        *
        * This is meant for a quick one-time setup. For individually inline style-properties to be set, you can use `setInlineStyle()`.
        *
        * @method defineInlineStyle
        * @param value {String} the style string to be set
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.defineInlineStyle = function(value) {
            this.style.cssText = value;
            return this;
        };

       /**
        * Empties the content of the Element.
        * Alias for thisNode.vTextContent = '';
        *
        * @method empty
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.empty = function() {
            this.vTextContent = '';
        };

        /**
         * Reference to the first of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @method first
         * @param [cssSelector] {String} to return the first Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.first = function(cssSelector) {
            return this.vnode.vParent.firstOfVChildren(cssSelector).domNode;
        };

        /**
         * Reference to the first child-Element, where the related dom-node an Element (nodeType===1).
         *
         * @method firstOfChildren
         * @param [cssSelector] {String} to return the first Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.firstOfChildren = function(cssSelector) {
            return this.vnode.firstOfVChildren(cssSelector).domNode;
        };

       /**
        * Forces the Element to be inside an ancestor-Element that has the `overfow="scroll" set.
        *
        * @method forceIntoNodeView
        * @param [ancestor] {Element} the Element where it should be forced into its view.
        *        Only use this when you know the ancestor and this ancestor has an `overflow="scroll"` property
        *        when not set, this method will seek through the doc-tree upwards for the first Element that does match this criteria.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.forceIntoNodeView = function(ancestor) {
            console.log(NAME, 'forceIntoNodeView');
            var instance = this,
                parentOverflowNode = this.parentNode,
                match, left, width, right, height, top, bottom, scrollLeft, scrollTop, parentOverflowNodeX, parentOverflowNodeY,
                parentOverflowNodeStartTop, parentOverflowNodeStartLeft, parentOverflowNodeStopRight, parentOverflowNodeStopBottom, newX, newY;
            if (ancestor) {
                parentOverflowNode = ancestor;
            }
            else {
                while ((parentOverflowNode!==DOCUMENT) && !(match=(parentOverflowNode.getStyle('overflow')==='scroll'))) {
                    parentOverflowNode = parentOverflowNode.parentNode;
                }
            }
            if (parentOverflowNode!==DOCUMENT) {
                left = instance.left;
                width = instance.offsetWidth;
                right = left + width;
                height = instance.offsetHeight;
                top = instance.top;
                bottom = top + height;
                scrollLeft = parentOverflowNode.scrollLeft;
                scrollTop = parentOverflowNode.scrollTop;
                parentOverflowNodeX = parentOverflowNode.left;
                parentOverflowNodeY = parentOverflowNode.top;
                parentOverflowNodeStartTop = parentOverflowNodeY+parseInt(parentOverflowNode.getStyle(BORDER_TOP_WIDTH), 10);
                parentOverflowNodeStartLeft = parentOverflowNodeX+parseInt(parentOverflowNode.getStyle(BORDER_LEFT_WIDTH), 10);
                parentOverflowNodeStopRight = parentOverflowNodeX+parentOverflowNode.offsetWidth-parseInt(parentOverflowNode.getStyle(BORDER_RIGHT_WIDTH), 10);
                parentOverflowNodeStopBottom = parentOverflowNodeY+parentOverflowNode.offsetHeight-parseInt(parentOverflowNode.getStyle(BORDER_BOTTOM_WIDTH), 10);

                if (left<parentOverflowNodeStartLeft) {
                    newX = Math.max(0, scrollLeft+left-parentOverflowNodeStartLeft);
                }
                else if (right>parentOverflowNodeStopRight) {
                    newX = scrollLeft + right - parentOverflowNodeStopRight;
                }

                if (top<parentOverflowNodeStartTop) {
                    newY = Math.max(0, scrollTop+top-parentOverflowNodeStartTop);
                }
                else if (bottom>parentOverflowNodeStopBottom) {
                    newY = scrollTop + bottom - parentOverflowNodeStopBottom;
                }

                if ((newX!==undefined) || (newY!==undefined)) {
                    parentOverflowNode.scrollTo((newX!==undefined) ? newX : scrollLeft,(newY!==undefined) ? newY : scrollTop);
                }
            }
            return instance;
        };

       /**
        * Forces the Element to be inside the window-view. Differs from `scrollIntoView()` in a way
        * that `forceIntoView()` doesn't change the position when it's inside the view, whereas
        * `scrollIntoView()` sets it on top of the view.
        *
        * @method forceIntoView
        * @param [notransition=false] {Boolean} set true if you are sure positioning is without transition.
        *        this isn't required, but it speeds up positioning. Only use when no transition is used:
        *        when there is a transition, setting this argument `true` would miscalculate the position.
        * @param [rectangle] {Object} Set this if you have already calculated the window-rectangle (used for preformance within drag-drop)
        * @param [rectangle.x] {Number} scrollLeft of window
        * @param [rectangle.y] {Number} scrollTop of window
        * @param [rectangle.w] {Number} width of window
        * @param [rectangle.h] {Number} height of window
        * @chainable
        * @since 0.0.2
        */
        ElementPrototype.forceIntoView = function(notransition, rectangle) {
            console.log(NAME, 'forceIntoView');
            var instance = this,
                left = instance.left,
                width = instance.offsetWidth,
                right = left + width,
                height = instance.offsetHeight,
                top = instance.top,
                bottom = top + height,
                windowLeft, windowTop, windowRight, windowBottom, newX, newY;
            if (rectangle) {
                windowLeft = rectangle.x;
                windowTop = rectangle.y;
                windowRight = rectangle.w;
                windowBottom = rectangle.h;
            }
            else {
                windowLeft = window.scrollLeft;
                windowTop = window.scrollTop;
                windowRight = windowLeft + window.getWidth();
                windowBottom = windowTop + window.getHeight();
            }

            if (left<windowLeft) {
                newX = Math.max(0, left);
            }
            else if (right>windowRight) {
                newX = windowLeft + right - windowRight;
            }
            if (top<windowTop) {
                newY = Math.max(0, top);
            }
            else if (bottom>windowBottom) {
                newY = windowTop + bottom - windowBottom;
            }

            if ((newX!==undefined) || (newY!==undefined)) {
                window.scrollTo((newX!==undefined) ? newX : windowLeft, (newY!==undefined) ? newY : windowTop);
            }
            return instance;
        };

        /**
         * Gets an ElementArray of vElements that lie within this Element and match the css-selector.
         *
         * @method getAll
         * @param cssSelector {String} css-selector to match
         * @return {ElementArray} ElementArray of vElements that match the css-selector
         * @since 0.0.1
         */
        ElementPrototype.getAll = function(cssSelector) {
            return this.querySelectorAll(cssSelector);
        };

       /**
        * Gets an attribute of the Element.
        *
        * Alias for getAttribute().
        *
        * @method getAttr
        * @param attributeName {String}
        * @return {String|null} value of the attribute
        * @since 0.0.1
        */
        ElementPrototype.getAttr = function(attributeName) {
            return this.vnode.attrs[attributeName] || null;
        };

       /**
        * Gets an attribute of the Element.
        *
        * Same as getAttr().
        *
        * @method getAttribute
        * @param attributeName {String}
        * @return {String|null} value of the attribute
        * @since 0.0.1
        */
        ElementPrototype.getAttribute = function(attributeName) {
            return this.vnode.attrs[attributeName] || null;
        };

       /**
        * Returns data set specified by `key`. If not set, `undefined` will be returned.
        * The data is efficiently stored on the vnode.
        *
        * @method getData
        * @param key {string} name of the key
        * @return {Any|undefined} data set specified by `key`
        * @since 0.0.1
        */
        ElementPrototype.getData = function(key) {
            var vnode = this.vnode;
            return vnode._data && vnode._data[key];
        };

       /**
        * Gets one Element, specified by the css-selector. To retrieve a single element by id,
        * you need to prepend the id-name with a `#`. When multiple Element's match, the first is returned.
        *
        * @method getElement
        * @param cssSelector {String} css-selector to match
        * @return {Element|null} the Element that was search for
        * @since 0.0.1
        */
        ElementPrototype.getElement = function(cssSelector) {
            return ((cssSelector[0]==='#') && (cssSelector.indexOf(' ')===-1)) ? this.getElementById(cssSelector.substr(1)) : this.querySelector(cssSelector);
        };

        /**
         * Returns the Element matching the specified id, which should should be a descendant of this Element.
         *
         * @method getElementById
         * @param id {String} id of the Element
         * @return {Element|null}
         *
         */
        ElementPrototype.getElementById = function(id) {
            var element = nodeids[id];
            if (element && !this.contains(element)) {
                // outside itself
                return null;
            }
            return element || null;
        };


       /**
        * Gets the height of the element in pixels. Included are padding and border, not any margins.
        * By setting the argument `overflow` you get the total height, included the invisible overflow.
        *
        * @method getHeight
        * @param [overflow=false] {Boolean} in case of elements that overflow: return total height, included the invisible overflow
        * @return {Number} width in pixels
        * @since 0.0.1
        */
        ElementPrototype.getHeight = function(overflow) {
            return overflow ? this.scrollHeight : this.offsetHeight;
        };

       /**
        * Returns inline style of the specified property. `Inline` means: what is set directly on the Element,
        * this doesn't mean necesairy how it is looked like: when no css is set inline, the Element might still have
        * an appearance because of other CSS-rules.
        *
        * In most cases, you would be interesting in using `getStyle()` instead.
        *
        * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
        *
        * @method getInlineStyle
        * @return {String} content as a string with HTML entities
        * @since 0.0.1
        */
        ElementPrototype.getInlineStyle = function(cssProperty) {
            var styles = this.vnode.styles;
            return styles[cssProperty] || styles[fromCamelCase(cssProperty)];
        };

       /**
        * Returns cascaded style of the specified property. `Cascaded` means: the actual present style,
        * the way it is visible (calculated through the DOM-tree).
        *
        * Note1: values are absolute: percentages and points are converted to absolute values, sizes are in pixels, colors in rgb/rgba-format.
        * Note2: you cannot query shotcut-properties: use `margin-left` instead of `margin`.
        * Note3: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine.
        *
        * @method getCascadeStyle
        * @param cssProperty {String} property that is queried
        * @param [pseudo] {String} to query pseudo-element, fe: `:before` or `:first-line`
        * @return {String} value for the css-property
        * @since 0.0.1
        */
        ElementPrototype.getStyle = function(cssProperty, pseudo) {
            return window.getComputedStyle(this, pseudo)[toCamelCase(cssProperty)];
        };

       /**
        * Gets the width of the element in pixels. Included are padding and border, not any margins.
        * By setting the argument `overflow` you get the total width, included the invisible overflow.
        *
        * @method getWidth
        * @param [overflow=false] {Boolean} in case of elements that overflow: return total width, included the invisible overflow
        * @return {Number} width in pixels
        * @since 0.0.1
        */
        ElementPrototype.getWidth = function(overflow) {
            return overflow ? this.scrollWidth : this.offsetWidth;
        };

       /**
        * Whether the Element has the attribute set.
        *
        * Alias for hasAttribute().
        *
        * @method hasAttr
        * @param attributeName {String}
        * @return {Boolean} Whether the Element has the attribute set.
        * @since 0.0.1
        */
        ElementPrototype.hasAttr = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

       /**
        * Whether the Element has the attribute set.
        *
        * Same as hasAttr().
        *
        * @method hasAttribute
        * @param attributeName {String}
        * @return {Boolean} Whether the Element has the attribute set.
        * @since 0.0.1
        */
        ElementPrototype.hasAttribute = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

        /**
         * Indicating if the current element has any attributes or not.
         *
         * @method hasAttributes
         * @return {Boolean} Whether the current element has any attributes or not.
         */
        ElementPrototype.hasAttributes = function() {
            return !!this.vnode.attrs && (this.vnode.attrs.length > 0);
        };

       /**
        * Indicating if the Element has any children (childNodes with nodeType of 1).
        *
        * @method hasChildren
        * @return {Boolean} whether the Element has children
        * @since 0.0.1
        */
        ElementPrototype.hasChildren = function() {
            return this.vnode.hasVChildren();
        };

       /**
        * Checks whether the className is present on the Element.
        *
        * @method hasClass
        * @param className {String|Array} the className to check for. May be an Array of classNames, which all needs to be present.
        * @return {Boolean} whether the className (or classNames) is present on the Element
        * @since 0.0.1
        */
        ElementPrototype.hasClass = function(className) {
            return this.classList.contains(className);
        };

       /**
        * If the Element has data set specified by `key`. The data could be set with `setData()`.
        *
        * @method hasData
        * @param key {string} name of the key
        * @return {Boolean}
        * @since 0.0.1
        */
        ElementPrototype.hasData = function(key) {
            return !!this._data && !!this._data[key];
        };

       /**
        * Indicates whether Element currently has the focus.
        *
        * @method hasFocus
        * @return {Boolean}
        * @since 0.0.1
        */
        ElementPrototype.hasFocus = function() {
            return (DOCUMENT.activeElement===this);
        };

       /**
         * Checks whether the Element lies within the specified selector (which can be a CSS-selector or a Element)
         *
         * @example
         * var divnode = childnode.inside('div.red');
         *
         * @example
         * var divnode = childnode.inside(containerNode);
         *
         * @method inside
         * @param selector {Element|String} the selector, specified by a Element or a css-selector
         * @return {Element|null} the nearest Element that matches the selector, or `null` when not found
         * @since 0.0.1
         */
        ElementPrototype.inside = function(selector) {
            var instance = this,
                vParent;
            if (typeof selector===STRING) {
                vParent = instance.vnode.vParent;
                while (vParent && !vParent.matchesSelector(selector)) {
                    vParent = vParent.vParent;
                }
                return vParent ? vParent.domNode : null;
            }
            else {
                // selector should be an Element
                return ((selector!==instance) && selector.contains(instance)) ? selector : null;
            }
        };

       /**
         * Checks whether a point specified with x,y is within the Element's region.
         *
         * @method insidePos
         * @param x {Number} x-value for new position (coordinates are page-based)
         * @param y {Number} y-value for new position (coordinates are page-based)
         * @return {Boolean} whether there is a match
         * @since 0.0.1
         */
        ElementPrototype.insidePos = function(x, y) {
            var instance = this,
                left = instance.left,
                top = instance.top,
                right = left + instance.offsetWidth,
                bottom = top + instance.offsetHeight;
            return (x>=left) && (x<=right) && (y>=top) && (y<=bottom);
        };

        /**
         * Reference to the last of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @method last
         * @param [cssSelector] {String} to return the last Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.last = function(cssSelector) {
            var vParent = this.vnode.vParent;
            return vParent && vParent.lastOfVChildren(cssSelector).domNode;
        };

        /**
         * Reference to the last child-Element, where the related dom-node an Element (nodeType===1).
         *
         * @method lastOfChildren
         * @param [cssSelector] {String} to return the last Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.lastOfChildren = function(cssSelector) {
            return this.vnode.lastOfVChildren(cssSelector).domNode;
        };

        /**
         * Indicates if the element would be selected by the specified selector string.
         * Alias for matchesSelector()
         *
         * @method matches
         * @param [cssSelector] {String} the css-selector to check for
         * @return {Boolean}
         * @since 0.0.1
         */
        ElementPrototype.matches = function(selectors) {
            return this.vnode.matchesSelector(selectors);
        };

        /**
         * Indicates if the element would be selected by the specified selector string.
         * Alias for matches()
         *
         * @method matchesSelector
         * @param [cssSelector] {String} the css-selector to check for
         * @return {Boolean}
         * @since 0.0.1
         */
        ElementPrototype.matchesSelector = function(selectors) {
            return this.vnode.matchesSelector(selectors);
        };

        /**
         * Reference to the next of sibbling Element, where the related dom-node is an Element(nodeType===1).
         *
         * @method next
         * @param [cssSelector] {String} css-selector to be used as a filter
         * @return {Element|null}
         * @type Element
         * @since 0.0.1
         */
        ElementPrototype.next = function(cssSelector) {
            var vnode = this.vnode,
                found, vNextElement;
            if (!cssSelector) {
                return vnode.vNextElement.domNode;
            }
            vNextElement = vnode;
            do {
                vNextElement = vNextElement.vNextElement;
                found = vNextElement && vNextElement.matchesSelector(cssSelector);
            } while(vNextElement && !found);
            return found ? vNextElement.domNode : null;
        };


       /**
        * Prepends a Element or text at the start of Element's innerHTML, or before the `refElement`.
        *
        * @method prepend
        * @param content {Element|Element|ElementArray|String} content to prepend
        * @param [refElement] {Element} reference Element where the content should be prepended
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.prepend = function(content, refElement, escape) {
            var instance = this,
                i, len, item,
            doPrepend = function(oneItem) {
                var vChildNodes, i, len, fragment;
                if (escape) {
                    if (oneItem.isFragment) {
                        vChildNodes = oneItem.vChildNodes;
                        len = vChildNodes.length;
                        for (i=1; i<len; i++) {
                            fragment = vChildNodes[i];
                            fragment.textContent = fragment.innerHTML;
                        }
                    }
                    else {
                        oneItem.vTextContent = oneItem.vInnerHTML;
                    }
                }
                if (refElement) {
                    instance.insertBefore(oneItem, refElement);
                }
                else {
                    instance.appendChild(oneItem);
                }
            };
            refElement || (instance.firstChild);
            (typeof content===STRING) && (content=htmlToVFragments(content));
            if (Array.isArray(content)) {
                len = content.length;
                for (i=0; i<len; i++) {
                    item = content[i];
                    doPrepend(item);
                }
            }
            else {
                doPrepend(content);
            }
            return instance;
        };

        /**
         * Reference to the previous of sibbling Element, where the related dom-node is an Element(nodeType===1).
         *
         * @method previous
         * @param [cssSelector] {String} css-selector to be used as a filter
         * @return {Element|null}
         * @type Element
         * @since 0.0.1
         */
        ElementPrototype.previous = function(cssSelector) {
            var vnode = this.vnode,
                found, vPreviousElement;
            if (!cssSelector) {
                return vnode.vPreviousElement.domNode;
            }
            vPreviousElement = vnode;
            do {
                vPreviousElement = vPreviousElement.vPreviousElement;
                found = vPreviousElement && vPreviousElement.matchesSelector(cssSelector);
            } while(vPreviousElement && !found);
            return found ? vPreviousElement.domNode : null;
        };

        /**
         * Returns the first Element within the Element, that matches the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
         * they need to be separated by a `comma`.
         *
         * @method querySelector
         * @param selectors {String} CSS-selector(s) that should match
         * @return {Element}
         */
        ElementPrototype.querySelector = function(selectors) {
            var found,
                inspectChildren = function(vnode) {
                    var vChildNodes = vnode.vChildNodes,
                        len = vChildNodes.length,
                        i, vChildNode;
                    for (i=0; (i<len) && !found; i++) {
                        vChildNode = vChildNodes[i];
                        vChildNode.matchesSelector(selectors) && (found=vChildNode.domNode);
                        found || inspectChildren(vChildNode);
                    }
                };
            inspectChildren(this.vnode);
            return found;
        };

        /**
         * Returns an ElementArray of all vElements within the Element, that match the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
         * they need to be separated by a `comma`.
         *
         * querySelectorAll is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
         *
         * @method querySelectorAll
         * @param selectors {String} CSS-selector(s) that should match
         * @return {ElementArray} non-life Array (snapshot) with vElements
         */
        ElementPrototype.querySelectorAll = function(selectors) {
            var found = ElementArray.createArray(),
                inspectChildren = function(vnode) {
                    var vChildNodes = vnode.vChildNodes,
                        len = vChildNodes.length,
                        i, vChildNode;
                    for (i=0; i<len; i++) {
                        vChildNode = vChildNodes[i];
                        vChildNode.matchesSelector(selectors) && (found[found.length]=vChildNode.domNode);
                        inspectChildren(vChildNode);
                    }
                };
            inspectChildren(this.vnode);
            return found;
        };

       /**
         * Checks whether the Element has its rectangle inside the outboud-Element.
         * This is no check of the DOM-tree, but purely based upon coordinates.
         *
         * @method rectangleInside
         * @param outboundElement {Element} the Element where this element should lie inside
         * @return {Boolean} whether the Element lies inside the outboundElement
         * @since 0.0.1
         */
        ElementPrototype.rectangleInside = function(outboundElement) {
            var instance = this,
                outerRect = outboundElement.getBoundingClientRect(),
                innerRect = instance.getBoundingClientRect();
            return (outerRect.left<=innerRect.left) &&
                   (outerRect.top<=innerRect.top) &&
                   ((outerRect.left+outboundElement.offsetWidth)>=(innerRect.left+instance.offsetWidth)) &&
                   ((outerRect.top+outboundElement.offsetHeight)>=(innerRect.top+instance.offsetHeight));
        };

       /**
        * Removes the Element from the DOM.
        * Alias for thisNode.parentNode.removeChild(thisNode);
        *
        * @method remove
        * @since 0.0.1
        */
        ElementPrototype.remove = function() {
            var parent = this.parentNode;
            parent && parent.removeChild(this);
        };

       /**
        * Removes the attribute from the Element.
        *
        * Alias for removeAttribute() BUT is chainable instead (removeAttribute is not).
        *
        * @method removeAttr
        * @param attributeName {String}
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeAttr = function(/* attributeName */) {
            this.removeAttribute.apply(this, arguments);
            return this;
        };

       /**
        * Removes the attribute from the Element.
        *
        * Use removeAttr() to be able to chain.
        *
        * @method removeAttr
        * @param attributeName {String}
        * @since 0.0.1
        */
        ElementPrototype._removeAttribute = ElementPrototype.removeAttribute;
        ElementPrototype.removeAttribute = function(attributeName) {
            var instance = this,
                vnode = this.vnode;
            vnode._noSync();
            instance._removeAttribute.apply(instance, arguments);
            delete vnode.attrs[attributeName];
        };

       /**
        * Removes a className from the Element.
        *
        * @method removeClass
        * @param className {String|Array} the className that should be removed. May be an Array of classNames.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeClass = function(className) {
            var instance = this;
            instance.classList.remove(className);
            return instance;
        };

       /**
        * Removes data specified by `key` that was set by using `setData()`.
        * When no arguments are passed, all node-data (key-value pairs) will be removed.
        *
        * @method removeData
        * @param key {string} name of the key
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeData = function(key) {
            var vnode = this.vnode;
            if (vnode._data) {
                if (key) {
                    delete vnode._data[key];
                }
                else {
                    // we cannot just redefine _data, for it is set as readonly
                    vnode._data.each(
                        function(value, key) {
                            delete vnode._data[key];
                        }
                    );
                }
            }
            return this;
        };

       /**
        * Removes a css-property (inline) out of the Element.
        * No need to use camelCase.
        *
        * @method removeInlineStyle
        * @param cssAttribute {String} the css-property to be removed
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeInlineStyle = function(cssAttribute) {
            var instance = this,
                styles = instance.vnode.styles;
            delete styles[fromCamelCase(cssAttribute)];
            instance.setAttr('style', vnode.serializeStyles());
            return instance;
        };

       /**
        * Replaces the Element with a new Element.
        *
        * @method replace
        * @param newVElement {Element|String} the new Element
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.replace = function(newElement, escape) {
            var instance = this;
            escape && (newElement.textContent=newElement.innerHTML);
            instance.parentNode.replaceChild(instance, newElement);
            return instance;
        };

       /**
        * Replaces the className of the Element with a new className.
        * If the previous className is not available, the new className is set nevertheless.
        *
        * @method replaceClass
        * @param prevClassName {String} the className to be replaced
        * @param newClassName {String} the className to be set
        * @param [force ] {Boolean} whether the new className should be set, even is the previous className isn't there
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.replaceClass = function(prevClassName, newClassName, force) {
            var instance = this;
            if (force || instance.hasClass(prevClassName)) {
                instance.removeClass(prevClassName).setClass(newClassName);
            }
            return instance;
        };

        /**
         * Scrolls the content of the Element into the specified scrollposition.
         * Only available when the Element has overflow.
         *
         * @method scrollTo
         * @param x {Number} left-offset in pixels
         * @param y {Number} top-offset in pixels
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.scrollTo = function(x, y) {
            var instance = this;
            instance.scrollLeft = x;
            instance.scrollTop = y;
            return instance;
        };

       /**
         * Sets the attribute on the Element with the specified value.
         *
         * Alias for setAttribute(), BUT differs in a way that setAttr is chainable, setAttribute is not.
         *
         * @method setAttr
         * @param attributeName {String}
         * @param value {Any} the value that belongs to `key`
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.setAttr = function(/* attributeName, value */) {
            var instance = this;
            instance.setAttribute.apply(instance, arguments);
            return instance;
        };

       /**
         * Sets the attribute on the Element with the specified value.
         *
         * Alias for setAttr(), BUT differs in a way that setAttr is chainable, setAttribute is not.
         *
         * @method setAttribute
         * @param attributeName {String}
         * @param value {Any} the value that belongs to `key`
        */
        ElementPrototype._setAttribute = ElementPrototype.setAttribute;
        ElementPrototype.setAttribute = function(attributeName, value) {
            var instance = this,
                vnode = instance.vnode;
            vnode._noSync();
            (value==='') && (value=null);
            if (value) {
                instance._setAttribute.apply(instance, arguments);
                vnode.attrs[attributeName] = value;
            }
            else {
                instance._removeAttribute(attributeName);
                delete vnode.attrs[attributeName];
            }
        };

       /**
        * Adds a class to the Element. If the class already exists it won't be duplicated.
        *
        * @method setClass
        * @param className {String|Array} className to be added, may be an array of classNames
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.setClass = function(className) {
            var instance = this;
            instance.classList.add(className);
            return instance;
        };

        /**
         * Stores arbitary `data` at the Element (actually at vnode). This has nothing to do with node-attributes whatsoever,
         * it is just a way to bind any data to the specific Element so it can be retrieved later on with `getData()`.
         *
         * @method setData
         * @param key {string} name of the key
         * @param value {Any} the value that belongs to `key`
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.setData = function(key, value) {
            var vnode = this.vnode;
            vnode._data ||  Object.defineProperty(vnode, '_data', {
                configurable: false,
                enumerable: false,
                writable: false,
                value: {} // `writable` is false means we cannot chance the value-reference, but we can change {}'s properties itself
            });
            vnode._data[key] = value;
            return this;
        };

       /**
        * Sets a css-property (inline) out of the Element. Use camelCase.
        *
        * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
        *
        * @method setStyle
        * @param cssAttribute {String} the css-property to be set
        * @param value {String} the css-value
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.setInlineStyle = function(cssAttribute, value) {
            var instance = this,
                vnode = instance.vnode,
                styles = vnode.styles;
            value || (value='');
            cssAttribute = fromCamelCase(cssAttribute);
            if (value==='') {
                delete styles[fromCamelCase(cssAttribute)];
            }
            else {
                styles[fromCamelCase(cssAttribute)] = value;
            }
            instance.setAttr('style', vnode.serializeStyles());
            return instance;
        };

       /**
         * Set the position of an html element in page coordinates.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         *
         * If the Element has the attribute `xy-constrian` set, then its position cannot exceed any matching container it lies within.
         *
         * @method setXY
         * @param x {Number} x-value for new position (coordinates are page-based)
         * @param y {Number} y-value for new position (coordinates are page-based)
         * @param [constrain] {'window', Element, Object, String}
         * <ul>
         *     <li><b>'window'</b> to constrain to the visible window</li>
         *     <li><b>Element</b> to constrain to a specified Element</li>
         *     <li><b>Object</b> to constrain to an object with the properties: {x, y, w, h} where x and y are absolute pixels of the document
         *            (like calculated with getX() and getY()).</li>
         *     <li><b>String</b> to constrain to a specified css-selector, which should be an ancestor</li>
         * </ul>
         * @param [notransition=false] {Boolean} set true if you are sure positioning is without transition.
         *        this isn't required, but it speeds up positioning. Only use when no transition is used:
         *        when there is a transition, setting this argument `true` would miscalculate the position.
         * @chainable
         * @since 0.0.1
         */
        ElementPrototype.setXY = function(x, y, constrain, notransition) {
            console.log(NAME, 'setXY '+x+','+y);
            var instance = this,
                position = instance.getStyle(POSITION),
                dif, match, constrainNode, byExactId, parent, clone,
                containerTop, containerRight, containerLeft, containerBottom, requestedX, requestedY;

            // default position to relative
            if (position==='static') {
                instance.setInlineStyle(POSITION, 'relative');
            }
            // make sure it has sizes and can be positioned
            instance.setClass(INVISIBLE).setClass(BORDERBOX);
            (instance.getInlineStyle('display')==='none') && instance.setClass(BLOCK);
            if (constrain) {
                if (constrain==='window') {
                    containerLeft = window.scrollLeft;
                    containerTop = window.scrollTop;
                    containerRight = containerLeft + window.getWidth();
                    containerBottom = containerTop + window.getHeight();
                }
                else {
                    if (typeof constrain === STRING) {
                        match = false;
                        constrainNode = instance.parentNode;
                        byExactId = REGEXP_NODE_ID.test(constrain);
                        while (constrainNode.matchesSelector && !match) {
                            match = byExactId ? (constrainNode.id===constrain.substr(1)) : constrainNode.matchesSelector(constrain);
                            // if there is a match, then make sure x and y fall within the region
                            match || (constrainNode=constrainNode.parentNode);
                        }
                        // if Element found, then bound it to `constrain` as if the argument `constrain` was an Element
                        match && (constrain=constrainNode);
                    }
                    if (constrain.matchesSelector) {
                        // Element --> we need to search the rectangle
                        containerLeft = constrain.left + parseInt(constrain.getStyle(BORDER_LEFT_WIDTH), 10);
                        containerTop = constrain.top + parseInt(constrain.getStyle(BORDER_TOP_WIDTH), 10);
                        containerRight = containerLeft + constrain.scrollWidth;
                        containerBottom = containerTop + constrain.scrollHeight;
                    }
                    else {
                        containerLeft = constrain.x;
                        containerTop = constrain.y;
                        containerRight = constrain.x + constrain.w;
                        containerBottom = constrain.y + constrain.h;
                    }
                }
                if (typeof containerLeft === NUMBER) {
                    // found constrain, always redefine x and y
                    x = requestedX = (typeof x===NUMBER) ? x : instance.left;
                    if (requestedX<containerLeft) {
                        x = containerLeft;
                    }
                    else {
                        if ((requestedX+instance.offsetWidth)>containerRight) {
                            x = requestedX = containerRight - instance.offsetWidth;
                        }
                        // now we might need to reset to the left again:
                        (requestedX<containerLeft) && (x=containerLeft);
                    }
                    y = requestedY = (typeof y===NUMBER) ? y : instance.top;
                    if (requestedY<containerTop) {
                        y = containerTop;
                    }
                    else {
                        if ((requestedY+instance.offsetHeight)>containerBottom) {
                            y = requestedY = containerBottom - instance.offsetHeight;
                        }
                        // now we might need to reset to the top again:
                        (requestedY<containerTop) && (y=containerTop);
                    }
                }
            }
            if (typeof x === NUMBER) {
                // check if there is a transition:
                if (notransition) {
                    instance.setClass(INVISIBLE);
                    instance.setInlineStyle(LEFT, x + PX);
                    dif = (instance.left-x);
                    (dif!==0) && (instance.setInlineStyle(LEFT, (x - dif) + PX));
                    instance.removeClass(INVISIBLE);
                }
                else {
                    // we will clone the node, make it invisible and without transitions and look what its correction should be
                    clone = instance.clone();
                    clone.setClass(NO_TRANS).setClass(INVISIBLE);
                    parent = instance.parentNode;
                    parent.append(clone);
                    clone.setInlineStyle(LEFT, x+PX);
                    dif = (clone.left-x);
                    parent.removeChild(clone);
                    instance.setInlineStyle(LEFT, (x - dif) + PX);
                }
            }
            if (typeof y === NUMBER) {
                if (notransition) {
                    instance.setClass(INVISIBLE);
                    instance.setInlineStyle(TOP, y + PX);
                    dif = (instance.top-y);
                    (dif!==0) && (instance.setInlineStyle(TOP, (y - dif) + PX));
                    instance.removeClass(INVISIBLE);
                }
                else {
                    // we will clone the node, make it invisible and without transitions and look what its correction should be
                    clone = instance.clone();
                    clone.setClass(NO_TRANS).setClass(INVISIBLE);
                    parent = instance.parentNode;
                    parent.append(clone);
                    clone.setInlineStyle(TOP, y+PX);
                    dif = (clone.top-y);
                    parent.removeChild(clone);
                    instance.setInlineStyle(TOP, (y - dif) + PX);
                }
            }
            return instance.removeClass(BLOCK).removeClass(BORDERBOX).removeClass(INVISIBLE);
        };

       /**
        * Toggles the className of the Element.
        *
        * @method toggleClass
        * @param className {String|Array} className that should be toggled, may be an array of classNames
        * @param forceState {Boolean} to force toggling into this specific state
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.toggleClass = function(className, forceState) {
            var instance = this;
            instance.classList.toggle(className, forceState);
            return instance;
        };

        Object.defineProperties(ElementPrototype, {

           /**
            * Gets the x-position (in the DOCUMENT) of the element in pixels.
            * DOCUMENT-related: regardless of the window's scroll-position.
            *
            * @property left
            * @since 0.0.1
            */
            left: {
                get: function() {
                    return this.getBoundingClientRect().left + window.scrollLeft;
                },
                set: function(pixelsLeft) {
                    return this.setXY(pixelsLeft);
                }
            },

           /**
            * Gets the y-position (in the DOCUMENT) of the element in pixels.
            * DOCUMENT-related: regardless of the window's scroll-position.
            *
            * @property top
            * @since 0.0.1
            */
            top: {
                get: function() {
                    return this.getBoundingClientRect().top + window.scrollTop;
                },
                set: function(pixelsTop) {
                    return this.setXY(null, pixelsTop);
                }
            }

        });

    }(window.Element.prototype));
};

//--- definition API of unmodified `Element`-methods ------

/**
 * Adds a node to the end of the list of children of a specified parent node.
 *
 * @method appendChild
 * @param element {Element} content to append
 * @return {Element} the Element that was appended
 */

/**
 * Returns the specified attribute of the specified element, as an Attr node.
 *
 * @method getAttributeNode
 * @return {attributeNode}
 */

/**
 * Returns a text rectangle object that encloses a group of text rectangles. The returned value is
 * a TextRectangle object which is the union of the rectangles returned by getClientRects() for the element,
 * i.e., the CSS border-boxes associated with the element.
 *
 * The returned value is a TextRectangle object, which contains read-only left, top, right and bottom properties
 * describing the border-box in pixels. top and left are relative to the top-left of the viewport.
 *
 * @method getBoundingClientRect
 * @return {attributeNode} Therectangle object that encloses a group of text rectangles.
 */

/**
 * Returns a collection of rectangles that indicate the bounding rectangles for each box in a client.
 *
 * The returned value is a collection of ClientRect objects, one for each CSS border box associated with the element.
 * Each ClientRect object contains read-only left, top, right and bottom properties describing the border box, in pixels,
 * with the top-left relative to the top-left of the viewport. For tables with captions,
 * the caption is included even though it's outside the border box of the table.
 *
 * @method getClientRects
 * @return {Collection}
 */

/**
 * Returns a new NodeIterator object with this Element as root.
 *
 * The NodeIterator is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
 *
 * @method createNodeIterator
 * @param [whatToShow] {Number} Filter specification constants from the NodeFilter DOM interface, indicating which nodes to iterate over.
 * You can use or sum one of the next properties:
 * <ul>
 *   <li>window.NodeFilter.SHOW_ELEMENT</li>
 *   <li>window.NodeFilter.SHOW_COMMENT</li>
 *   <li>window.NodeFilter.SHOW_TEXT</li>
 * </ul>
 * @param [filter] {NodeFilter|function} An object implementing the NodeFilter interface or a function. See https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
 * @return {NodeIterator}
 * @since 0.0.1
*/

/**
 * Returns an HTMLCollection of all vElements within this Element, that match their classes with the supplied `classNames` argument.
 * To match multiple different classes, separate them with a `comma`.
 *
 * getElementsByClassName is life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByClassName
 * @param classNames {String} the classes to search for
 * @return {HTMLCollection} life Array with vElements
 */

/**
 * Returns an HTMLCollection of all vElements within this Element, that match their `name`-attribute with the supplied `name` argument.
 *
 * getElementsByName is life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByName
 * @param name {String} the property of name-attribute to search for
 * @return {HTMLCollection} life Array with vElements
 */


/**
 * Returns an HTMLCollection of all vElements within this Element, that match their `name`-attribute with the supplied `name` argument.
 *
 * getElementsByTagName is life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByTagName
 * @param tagNames {String} the tags to search for
 * @return {HTMLCollection} life Array with vElements
 */

/**
* Inserts the Element into the DOM tree at a specified position.
*
* @method insertAdjacentElement
* @param position {String}
* <ul>
*     <li>'beforebegin' Before the element itself</li>
*     <li>'afterbegin' Just inside the element, before its first child</li>
*     <li>'beforeend' Just inside the element, after its last child</li>
*     <li>'afterend' After the element itself</li>
* <ul>
* @param element {Element}
*/

/**
* Parses the specified text as HTML and inserts the resulting nodes into the DOM tree at a specified position.
*
* @method insertAdjacentHTML
* @param position {String}
* <ul>
*     <li>'beforebegin' Before the element itself</li>
*     <li>'afterbegin' Just inside the element, before its first child</li>
*     <li>'beforeend' Just inside the element, after its last child</li>
*     <li>'afterend' After the element itself</li>
* <ul>
* @param element {Element}
*/

/**
* Inserts the text into the DOM tree as a TextNode at a specified position.
*
* @method insertAdjacentText
* @param position {String}
* <ul>
*     <li>'beforebegin' Before the element itself</li>
*     <li>'afterbegin' Just inside the element, before its first child</li>
*     <li>'beforeend' Just inside the element, after its last child</li>
*     <li>'afterend' After the element itself</li>
* <ul>
* @param element {Element}
*/

/**
 * Inserts `newElement` before `referenceElement`.
 *
 * @method insertBefore
 * @param newElement {Element} The newElement to insert
 * @param referenceElement {Element} The Element before which newElement is inserted.
 * @return {Element} the Element being inserted (equals newElement)
 */

/**
* Removes the attribute specified by an attributeNode from the Element.
*
* @method removeAttributeNode
* @param attributeNode {attributeNode}
* @since 0.0.1
*/

/**
* Removes the Element's child-Element from the DOM.
*
* @method removeChild
* @param childVElement {Element} the child-Element to remove
* @since 0.0.1
*/

/**
* Replaces the Element's child-Element with a new Element.
*
* @method replaceChild
* @param newElement {Element} the new Element
* @param oldVChild {Element} the Element to be replaced
* @return {Element} the Element that was removed (equals oldVChild)
* @since 0.0.1
*/

/**
 * Scrolls the element into view.
 *
 * @method scrollIntoView
 */

/**
 * Sets the attribute on the Element specified by `attributeNode`
 *
 * @method setAttributeNode
 * @param attributeNode {attributeNode}
*/

//------ events --------

/**
 * Fired when a static `script` element  finishes executing its script. Does not fire if the element is added dynamically, eg with appendChild().
 *
 * @event afterscriptexecute
 */


/**
 * Fired when the code in a `script` element declared in an HTML document is about to start executing. Does not fire if the element is added dynamically, eg with appendChild().
 *
 * @event beforescriptexecute
 */

//------- properties --------

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
 * Gets or sets the `name` property of a Element; it only applies to the following elements:
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

