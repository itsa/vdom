"use strict";

/**
 * Integrates DOM-events to event. more about DOM-events:
 * http://www.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @example
 * require('dom-ext/lib/element.js')(window);
 *
 * @module dom-ext
 * @submodule lib/element.js
 * @class Element
 * @since 0.0.1
*/

require('js-ext/lib/object.js');
require('js-ext/lib/string.js');
require('./element-array.js');

var FILTER_ACCEPT = 1,
    FILTER_REJECT = 2,
    iteratorProto = {
        _init: function(vElement, whatToShow, filter) {
            var instance = this,
                showElement = ((whatToShow & 1)!==0),
                showComment = ((whatToShow & 128)!==0),
                showText = ((whatToShow & 4)!==0),
                match, searchChildNodes;
            if (typeof filter !== 'function') {
                // check if it is a NodeFilter-object
                filter.acceptNode && (filter=filter.acceptNode);
            }
            (typeof filter==='function') || (filter=null);
            match = function(vnode) {
                var typeMatch = (showElement && (vnode.nodeType===1)) || (showComment && (vnode.nodeType===8)) || (showText && (vnode.nodeType===3)),
                    funcMatch = filter ? filter(vnode.vElement) : true;
                return typeMatch && funcMatch;
            },
            searchChildNodes = function(vnode) {
                var instance = this,
                    vChildNodes = vnode.vChildNodes,
                    len = vChildNodes.length,
                    vChildNode, i;
                for (i=0; i<len; i++) {
                    vChildNode = vChildNodes[i];
                    hasMatch = match(vChildNode);
                    ((hasMatch===true) || (hasMatch===FILTER_ACCEPT)) && (results[results.length]=vChildNode.vElement);
                    (hasMatch!==FILTER_REJECT) && vChildNode.hasChildNodes() && instance.searchChildNodes(vChildNode);
                }
            },
            instance.pointer = -1;
            instance.results = [];
            instance._filter = filter; // making it accessable for the getter `filter`
            searchChildNodes(vElement.vnode);
            instance.lastPos = instance.results.length-1;
        },
        nextNode: function() {
            var instance = this;
            if (instance.pointer===instance.lastPos) {
                return null;
            }
            return instance.results[++instance.pointer];
        },
        previousNode: function() {
            var instance = this;
            if (instance.pointer<=0) {
                return null;
            }
            return instance.results[--instance.pointer];
        }
    },
    treeWalkerProto = {
        _init: function(vElement, whatToShow, filter) {
            var instance = this;
            if (typeof filter !== 'function') {
                // check if it is a NodeFilter-object
                filter.acceptNode && (filter=filter.acceptNode);
            }
            (typeof filter==='function') || (filter=null);
            instance.vNodePointer = vElement.vnode.vFirstChild;
            instance._root = vElement;
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
                visibleMatch = !forcedVisible || (window.getComputedStyle(vnode.vElement.domNode).display!=='none'),
                funcMatch = filter ? filter(vnode.vElement) : true;
            return typeMatch && visibleMatch && funcMatch;
        };
        firstChild: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vFirstChild;
            while (foundVNode && !instance._match(foundVNode)) {
                foundVNode = foundVNode.vNext;
            }
            foundVNode && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        },
        lastChild: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vLastChild;
            while (foundVNode && !instance._match(foundVNode)) {
                foundVNode = foundVNode.vPrevious;
            }
            foundVNode && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        },
        nextNode: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vNext;
            while (foundVNode && !instance._match(foundVNode, true)) {
                foundVNode = foundVNode.vNext();
            }
            foundVNode && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        },
        nextSibling: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vNext;
            while (foundVNode && !instance._match(foundVNode)) {
                foundVNode = foundVNode.vNext();
            }
            foundVNode && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        },
        parentNode: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vParent;
            (foundVNode!==instance._root) && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        },
        previousNode: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vPrevious;
            while (foundVNode && !instance._match(foundVNode, true)) {
                foundVNode = foundVNode.vPrevious();
            }
            foundVNode && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        },
        previousSibling: function() {
            var instance = this,
                foundVNode = instance.vNodePointer.vPrevious;
            while (foundVNode && !instance._match(foundVNode)) {
                foundVNode = foundVNode.vPrevious();
            }
            foundVNode && (instance.vNodePointer=foundVNode);
            return foundVNode && foundVNode.vElement;
        }
    };

Object.defineProperty(iteratorProto, 'filter', {
    get: function() {
        return this._filter;
    }
});

Object.defineProperties(treeWalkerProto, {
    'currentNode': {
        get: function() {
            return this.vNodePointer.vElement;
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


module.exports = function (window) {

    var NAME = '[extend-element]: ',
        domNodeToVNode = require('./node-parser.js')(window),
        NS = require('./vdom-ns.js')(window),
        DOCUMENT = window.document,
        nodesMap = NS.nodesMap,
        nodeids = NS.nodeids,
        arrayIndexOf = Array.Prototype.indexOf,
        POSITION = 'position',
        BLOCK = 'el-block',
        BORDERBOX = 'el-borderbox',
        NO_TRANS = 'el-notrans',
        INVISIBLE = 'el-invisible',
        REGEXP_NODE_ID = /^#\S+$/,
        RESERVED_WORDS = require('js-ext/extra/reserved-words.js'),
        APPEND_CHILD = 'appendChild',
        INSERT_BEFORE = 'insertBefore',
        LEFT = 'left',
        TOP = 'top',
        BORDER = 'border',
        WIDTH = 'width',
        STRING = 'string',
        CLASS = 'class',
        BORDER_LEFT_WIDTH = BORDER+'-left-'+WIDTH,
        BORDER_RIGHT_WIDTH = BORDER+'-right-'+WIDTH,
        BORDER_TOP_WIDTH = BORDER+'-top-'+WIDTH,
        BORDER_BOTTOM_WIDTH = BORDER+'-bottom-'+WIDTH,
        NUMBER = 'number',
        PX = 'px',
        toCamelCase = function(input) {
            return input.toLowerCase().replace(/-(.)/g, function(match, group) {
                return group.toUpperCase();
            });
        },
        /**
         * Updates an internal hash of ExtElements, after addition or removal of an Extended-Element
         *
         * @method _updateList
         * @param elementList {Array} the list to update
         * @param extendedElement {VElement} the VElement that has bbeen added or removed
         * @param [removed] {Boolean} whether the element needs to be removed from the list
         * @private
         * @protected
         * @since 0.0.1
         */
        _updateList = function(elementList, vElement, removed) {
            var index = elementList.indexOf(vElement);
            if (removed) {
                (index > -1) && elementList.splice(index, 1);
            }
            else {
                (index > -1) || (elementList[elementList.length]=vElement);
            }
        };

    window.Element && (function(ElementPrototype) {

        require('../css/element.css');
        require('js-ext/lib/string.js');
        require('js-ext/lib/object.js');
        require('./document.js')(window);
        require('polyfill/polyfill-base.js');
        require('window-ext')(window);

       /**
        * Appends a HtmlElement or text at the end of HtmlElement's innerHTML, or before the `refElement`.
        *
        * @method append
        * @param content {HtmlElement|HtmlElementList|String} content to append
        * @param [refElement] {HtmlElement|HtmlElementList|String} reference Element where the content should be appended
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.append = function(content, refElement, escape) {
            refElement && (this.children.indexOf(refElement)!==-1) && (refElement=refElement.next());
            return DOCUMENT._insert(this, refElement ? INSERT_BEFORE : APPEND_CHILD, content, refElement, escape);
        };

        // cones from v-element
        ElementPrototype._appendChild = ElementPrototype.appendChild;
        ElementPrototype.appendChild = function(element) {
            var i, childNodes, fragment, len;
            if (element.isFragment) {
                childNodes = element.childNodes;
                len = childNodes.length;
                for (i=1; i<len; i++) {
                    fragment = childNodes[i];
                    this.append(fragment);
                }
            }
            else {
                newChild.domNode || (newChild=vElement(newChild));
                this._appendChild(newChild.domNode);
                newChild.repositionVNode();
                newChild._updateLifeLists();
            }
            return newChild;
        };

       /**
        * Returns a duplicate of the node. Use cloneNode(true) for a `deep` clone.
        * Almost the same as native cloneNode(), but you should use clone(), because it also clones any data set with setData().
        *
        * @method clone
        * @param content {HtmlElement|HtmlElementList|String} content to append. In case of HTML, it will be escaped.
        * @param [deep] {Boolean} whether to perform a `deep` clone: with all descendants
        * @return {HtmlElement} a clone of this HtmlElement
        * @since 0.0.1
        */
        ElementPrototype.clone = function(deep) {
            var instance = this,
                cloned = instance.cloneNode(deep);
            if (instance._data) {
                Object.defineProperty(cloned, '_data', {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: {} // `writable` is false means we cannot chance the value-reference, but we can change {}'s properties itself
                });
                cloned._data.merge(instance._data);
            }
            return cloned;
        };

        // cones from v-element
        /**
         * Indicating whether an HtmlElement or vElement is inside the DOM.
         *
         * @method contains
         * @param otherElement {vElement|HtmlElement}
         * @return {Boolean} whether the Element or vElement is inside the dom.
         */
        ElementPrototype.contains = function(otherVElement) {
            if (!otherVElement.vnode) {
                // not virtualised so it must be a Node that is not in the dom
                return false;
            }
            if (otherVElement===this) {
                return true;
            }
            return this.vnode.contains(otherVElement);
        };

        // cones from v-element
        ElementPrototype.createNodeIterator = function(whatToShow, filter) {
            var iterator = Object.create(iteratorProto);
            iterator._init(this, whatToShow, filter);
            return iterator;
        };

        // cones from v-element
        ElementPrototype.createTreeWalker = function(whatToShow, filter) {
            var treeWalker = Object.create(treeWalkerProto);
            treeWalker._init(this, whatToShow, filter);
            return treeWalker;
        };

       /**
        * Sets the inline-style of the HtmlElement exactly to the specified `value`, overruling previous values.
        * Making the HtmlElement's inline-style look like: style="value".
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
        * Empties the content of the HtmlElement.
        * Alias for setText('');
        *
        * @method empty
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.empty = function(/* cssSelector */) {
            // first empty node. By far, the fastest way is this: (http://jsperf.com/cached-firstchild-check)
            // even quicker than textContent='' (which is about 40%slower)
            var firstChild;
/*jshint boss:true */
            while (firstChild=this.firstChild) {
/*jshint boss:false */
                this.removeChild(firstChild);
            }
        };

        /**
         * Reference to the first of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vFirstElement
         * @type vnode
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype.first = function(cssSelector) {
            var vParent = this.vnode.vParent;
            return vParent && vParent.firstOfVChildren(cssSelector).vElement;
        };

        /**
         * Reference to the first vChild, where the related dom-node an Element (nodeType===1).
         *
         * @property vFirstElementChild
         * @type vnode
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype.firstOfChildren = function(cssSelector) {
            var vnode = this.vnode;
            return vnode && vnode.firstOfChildren(cssSelector).vElement;
        };

       /**
        * Forces the HtmlElement to be inside an ancestor-HtmlElement that has the `overfow="scroll" set.
        *
        * @method forceIntoNodeView
        * @param [ancestor] {HtmlElement} the HtmlElement where it should be forced into its view.
        *        Only use this when you know the ancestor and this ancestor has an `overflow="scroll"` property
        *        when not set, this method will seek through the doc-tree upwards for the first HtmlElement that does match this criteria.
        * @chainable
        * @since 0.0.2
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
        * Forces the HtmlElement to be inside the window-view. Differs from `scrollIntoView()` in a way
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
        * Gets a NodeList of HtmlElements, specified by the css-selector.
        *
        * @method getAll
        * @param cssSelector {String} css-selector to match
        * @return {NodeList} NodeList of HtmlElements that match the css-selector
        * @since 0.0.1
        */
        ElementPrototype.getAll = function(/* cssSelector */) {
            return DOCUMENT.getAll.apply(this, arguments);
        };

       /**
        * Gets an attribute of the HtmlElement.
        * Cautious: do not use `value` to retrieve the value. Use `getValue()` instead.
        *
        * Alias for getAttribute().
        *
        * @method getAttr
        * @param attributeName {String}
        * @return {String|null} value of the attribute
        * @since 0.0.1
        */
        ElementPrototype.getAttr = function(/* attributeName */) {
            return this.getAttribute.apply(this, arguments);
        };

        // cones from v-element
        ElementPrototype.getAttribute = function(attributeName) {
            return this.vnode.attrs[attributeName] || null;
        };

       /**
        * Returns data set specified by `key`. If not set, `undefined` will be returned.
        *
        * @method getData
        * @param key {string} name of the key
        * @return {Any|undefined} data set specified by `key`
        * @since 0.0.1
        */
        // cones from v-element
        ElementPrototype.getData = function(key) {
            var vnode = this.vnode;
            return vnode._data && vnode._data[key];
        };

       /**
        * Gets one HtmlElement, specified by the css-selector. To retrieve a single element by id,
        * you need to prepend the id-name with a `#`. When multiple HtmlElement's match, the first is returned.
        *
        * @method getElement
        * @param cssSelector {String} css-selector to match
        * @return {HtmlElement|null} the HtmlElement that was search for
        * @since 0.0.1
        */
        ElementPrototype.getElement = function(/* cssSelector */) {
            return DOCUMENT.getElement.apply(this, arguments);
        };

        // cones from v-element
        ElementPrototype.getElementsByClassName = function(classNames) {
            var instance = this,
                vnode = instance.vnode;
            // modify classNames so it can be passed through to querySelectorAll:
            classNames = '.'+classNames.replace(/,/g, ',.').replace(/( )+/g, '.').replace(/\.+/g, '.');
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_CLASSES || (vnode.LIFE_CLASSES={});
            return vnode.LIFE_CLASSES[classNames] || (vnode.LIFE_CLASSES[classNames]=instance.querySelectorAll(classNames));
        };

        // cones from v-element
        ElementPrototype.getElementById = function(id) {
            var element = nodeids[id];
            if (element && !this.contains(element)) {
                // outside itself
                return null;
            }
            return element || null;
        };

        // cones from v-element
        ElementPrototype.getElementsByName = function(name) {
            var instance = this,
                vnode = instance.vnode;
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_NAMES || (vnode.LIFE_NAMES={});
            return vnode.LIFE_NAMES[name] || (vnode.LIFE_NAMES[name]=instance.querySelectorAll('[name="'+name+'"]'));
        };

        // cones from v-element
        ElementPrototype.getElementsByTagName = function(tagName) {
            var instance = this,
                vnode = instance.vnode;
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_TAGS || (vnode.LIFE_TAGS={});
            return vnode.LIFE_TAGS[tagName] || (vnode.LIFE_TAGS[tagName]=instance.querySelectorAll(tagName));
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
        * Returns inline style of the specified property. `Inline` means: what is set directly on the HtmlElement,
        * this doesn't mean necesairy how it is looked like: when no css is set inline, the HtmlElement might still have
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
            return this.style[toCamelCase(cssProperty)];
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
        * Whether the HtmlElement has the attribute set.
        *
        * Alias for hasAttribute().
        *
        * @method hasAttr
        * @param attributeName {String}
        * @return {Boolean} Whether the HtmlElement has the attribute set.
        * @since 0.0.1
        */
        ElementPrototype.hasAttr = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

        // cones from v-element
        ElementPrototype.hasAttribute = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

        // cones from v-element
        ElementPrototype.hasAttributes = function() {
            return !!this.vnode.attrs && (this.vnode.attrs.length > 0);
        };

       /**
        * Checks if the HtmlElement has any children (childNodes with nodeType of 1).
        *
        * @method hasChildren
        * @return {Boolean} whether the HtmlElement has childNodes
        * @since 0.0.2
        */
        // cones from v-element
        ElementPrototype.hasChildren = function() {
            return this.vnode.hasChildren();
        };

       /**
        * Checks whether the className is present on the Element.
        *
        * @method hasClass
        * @param className {String|Array} the className to check for. May be an Array of classNames, which all needs to be present.
        * @return {Boolean} whether the className (or classNames) is present on the Element
        * @since 0.0.1
        */
        // cones from v-element
        ElementPrototype.hasClass = function(className) {
            return this.classList.contains(className);
        };

       /**
        * If the Element has data set specified by `key`.
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
        * Checks whether HtmlElement currently has the focus.
        *
        * @method hasFocus
        * @param newHtmlElement {HtmlElement} the new HtmlElement
        * @return {Boolean} whether the className is present on the Element
        * @since 0.0.1
        */
        ElementPrototype.hasFocus = function() {
            return (DOCUMENT.activeElement===this);
        };

        // cones from v-element
        ElementPrototype._insertAdjacentElement = ElementPrototype.insertAdjacentElement;
        ElementPrototype.insertAdjacentElement = function(position /* , element */) {
            var instance = this,
                vnode = instance.vnode,
                recheckNode = vnode.vParent;
            instance._insertAdjacentElement.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.vParent);
            recheckNode.checkNewChildren();
        };

        // cones from v-element
        ElementPrototype._insertAdjacentHTML = ElementPrototype.insertAdjacentHTML;
        ElementPrototype.insertAdjacentHTML = function(position /*, html */) {
            var instance = this,
                vnode = instance.vnode,
                recheckNode = vnode.vParent;
            instance._insertAdjacentHTML.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.vParent);
            recheckNode.checkNewChildren();
        };

        // cones from v-element
        ElementPrototype._insertAdjacentText = ElementPrototype.insertAdjacentText;
        ElementPrototype.insertAdjacentText = function(position /*, text */) {
            var instance = this,
                vnode = instance.vnode,
                recheckNode = vnode.vParent;
            instance._insertAdjacentText.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.vParent);
            recheckNode.checkNewChildren();
        };

        // cones from v-element
        ElementPrototype._insertBefore = ElementPrototype.insertBefore;
        ElementPrototype.insertBefore = function(newElement, refElement) {
            var i, childNodes, fragment, len;
            if (newElement.isFragment) {
                childNodes = newElement.childNodes;
                len = childNodes.length;
                for (i=1; i<len; i++) {
                    fragment = childNodes[i];
                    this.insertBefore(fragment);
                }
            }
            else {
                newElement.domNode || (newElement=vElement(newElement));
                refElement.domNode || (refElement=vElement(refElement));
                this._insertBefore(newElement.domNode, refElement.domNode);
                newElement.repositionVNode();
                newElement._updateLifeLists();
            }
            return newElement;
        };

       /**
         * Checks whether the HtmlElement lies within the specified selector (which can be a CSS-selector or a HtmlElement)
         *
         * @example
         * var divnode = childnode.inside('div.red');
         *
         * @method inside
         * @param selector {HtmlElement|String} the selector, specified by a Node or a css-selector
         * @return {HtmlElement|null} the nearest HtmlElement that matches the selector, or `null` when not found
         * @since 0.0.2
         */
        ElementPrototype.inside = function(selector) {
            var instance = this,
                parentNode;
            if (typeof selector===STRING) {
                parentNode = instance.parentNode;
                while ((parentNode!==DOCUMENT) && !parentNode.matchesSelector(selector)) {
                    parentNode = parentNode.parentNode;
                }
                return (parentNode!==DOCUMENT) ? parentNode : null;
            }
            else {
                // selector should be an HtmlElement
                return ((selector!==instance) && selector.contains(instance)) ? selector : null;
            }
        };

       /**
         * Checks whether a point specified with x,y is within the HtmlElement's region.
         *
         * @method insidePos
         * @param x {Number} x-value for new position (coordinates are page-based)
         * @param y {Number} y-value for new position (coordinates are page-based)
         * @since 0.0.2
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
         * @property vLastElement
         * @type vnode
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype.last = function(cssSelector) {
            var vParent = this.vnode.vParent;
            return vParent && vParent.lastOfVChildren(cssSelector).vElement;
        };

        /**
         * Reference to the last vElement, where the related dom-node is an Element (nodeType===1).
         *
         * @property lastOfChildren
         * @type vnode
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype.lastOfChildren = function(cssSelector) {
            var vnode = this.vnode;
            return vnode && vnode.lastOfChildren(cssSelector).vElement;
        };

        ElementPrototype.matchesSelector = function(selectors) {
            return this.vnode.matchesSelector(selectors);
        };

        /**
         * Reference to the next of sibbling vElement, where the related dom-node is an Element(nodeType===1).
         *
         * @method next
         * @param [cssSelector] {String} css-selector to be used as a filter
         * @return {vElement|null}
         * @type vElement
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype.next = function(cssSelector) {
            var vnode = this.vnode,
                found, vNextElement;
            if (!cssSelector) {
                return vnode.vNextElement;
            }
            vNextElement = vnode;
            do {
                vNextElement = vNextElement.vNextElement;
                found = vNextElement && vNextElement.matchesSelector(cssSelector);
            } while(vNextElement && !found);
            return found && vNextElement.vElement;
        };

        // cones from v-element
        ElementPrototype.normalize = function() {
            // make it a void function --> vnode.js already mades every additional TextNode to be inserted normalized
        };

       /**
        * Prepends a HtmlElement or text at the start of HtmlElement's innerHTML, or before the `refElement`.
        *
        * @method prepend
        * @param content {HtmlElement|HtmlElementList|String} content to prepend
        * @param [refElement] {HtmlElement|HtmlElementList|String} reference Element where the content should be prepended
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.prepend = function(content, refElement, escape) {
            var instance = this,
                children = instance.children;
            if (children.length===0) {
                return instance.DOCUMENT._insert(instance, APPEND_CHILD, content, null, escape);
            }
            return instance.DOCUMENT._insert(instance, INSERT_BEFORE, content, (refElement && (children.indexOf(refElement)!==-1)) ? refElement : children[0], escape);
        };

        /**
         * Reference to the previous of sibbling vElement, where the related dom-node is an Element(nodeType===1).
         *
         * @method previous
         * @param [cssSelector] {String} css-selector to be used as a filter
         * @return {vElement|null}
         * @type vElement
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype.previous = function(cssSelector) {
            var vnode = this.vnode,
                found, vPreviousElement;
            if (!cssSelector) {
                return vnode.vPreviousElement;
            }
            vPreviousElement = vnode;
            do {
                vPreviousElement = vPreviousElement.vPreviousElement;
                found = vPreviousElement && vPreviousElement.matchesSelector(cssSelector);
            } while(vPreviousElement && !found);
            return found && vPreviousElement.vElement;
        };

        // cones from v-element
        ElementPrototype.querySelector = function(selectors) {
            var found,
                inspectChildren = function(vnode) {
                    var vChildNodes = vnode.vChildNodes,
                        len = vChildNodes.length,
                        i, vChildNode;
                    for (i=0; (i<len) && !found; i++) {
                        vChildNode = vChildNodes[i];
                        vChildNode.matchesSelector(selectors) && (found=vChildNode.vElement);
                        found || inspectChildren(vChildNode);
                    }
                };
            inspectChildren(this.vnode);
            return found;
        };

        // cones from v-element
        ElementPrototype.querySelectorAll = function(selectors) {
            var found = new ElementArray(),
                inspectChildren = function(vnode) {
                    var vChildNodes = vnode.vChildNodes,
                        len = vChildNodes.length,
                        i, vChildNode;
                    for (i=0; i<len; i++) {
                        vChildNode = vChildNodes[i];
                        vChildNode.matchesSelector(selectors) && (found[found.length]=vChildNode.vElement);
                        inspectChildren(vChildNode);
                    }
                };
            inspectChildren(this.vnode);
            return found;
        };

       /**
         * Checks whether the HtmlElement has its rectangle inside the outboud-Element.
         * This is no check of the DOM-tree, but purely based upon coordinates.
         *
         * @method rectangleInside
         * @param outboundElement {HtmlElement} the Element where this element should lie inside
         * @return {Boolean} whether the Element lies inside the outboundElement
         * @since 0.0.2
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
        * Removes the HtmlElement from the DOM.
        *
        * @method remove
        * @since 0.0.1
        */
        ElementPrototype.remove = function() {
            var parent = this.parentNode;
            parent && parent.removeChild(this);
        };

       /**
        * Removes the attribute from the HtmlElement.
        *
        * Alias for removeAttribute().
        *
        * @method removeAttr
        * @param attributeName {String}
        * @return {Boolean} Whether the HtmlElement has the attribute set.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeAttr = function(/* attributeName */) {
            this.removeAttribute.apply(this, arguments);
            return this;
        };

        // cones from v-element
        ElementPrototype._removeAttribute = ElementPrototype.removeAttribute;
        ElementPrototype.removeAttribute = function(attributeName) {
            var instance = this,
                vnode = this.vnode;
            instance._removeAttribute.apply(instance, arguments);
            delete vnode.attrs[attributeName];
            (attributeName==='className') && instance._updateLifeClassLists(instance, true);
            (attributeName==='name') && instance._updateLifeNamesList(instance, true);
        };

        // cones from v-element
        ElementPrototype.removeAttributeNode = function(attributeNode) {
            this.removeAttribute(attributeNode.value);
        };

        // cones from v-element
        ElementPrototype._removeChild = ElementPrototype.removeChild;
        ElementPrototype.removeChild = function(childNode) {
            childNode.domNode || (childNode=vElement(childNode));
            nodesMap.has(childNode.domNode) && childNode.vnode.remove();
            this._removeChild(childNode.domNode);
            childNode._updateLifeLists();
            // break the circular reference to prevent problems with GC:
            childNode.domNode.vElement = null;
            return childNode;
        };

       /**
        * Removes a className from the HtmlElement.
        *
        * @method removeClass
        * @param className {String|Array} the className that should be removed. May be an Array of classNames.
        * @chainable
        * @since 0.0.1
        */
        // cones from v-element
        ElementPrototype.removeClass = function(className) {
            var instance = this;
            instance.classList.remove(className);
            return instance;
        };

       /**
        * Removes data specified by `key`. When no arguments are passed, all node-data (key-value pairs) will be removed.
        *
        * @method removeData
        * @param key {string} name of the key
        * @chainable
        * @since 0.0.1
        */
        // cones from v-element
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
        * Removes a css-property (inline) out of the HtmlElement. Use camelCase.
        *
        * @method removeInlineStyle
        * @param cssAttribute {String} the css-property to be removed
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeInlineStyle = function(cssAttribute) {
            this.setInlineStyle(cssAttribute, '');
            return this;
        };

       /**
        * Replaces the HtmlElement with a new HtmlElement.
        *
        * @method replace
        * @param newHtmlElement {HtmlElement|String} the new HtmlElement
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.replace = function(newHtmlElement, escape) {
            var instance = this;
            escape && (newHtmlElement.textContent=newHtmlElement.innerHTML);
            instance.parentNode.replaceChild(instance, newHtmlElement);
            return instance;
        };

       /**
        * Replaces the className of the HtmlElement with a new className.
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

        // cones from v-element
        ElementPrototype._replaceChild = ElementPrototype.replaceChild;
        ElementPrototype.replaceChild = function(newChild, oldChild) {
            newChild.domNode || (newChild=vElement(newChild));
            oldChild.domNode || (oldChild=vElement(oldChild));
            nodesMap.has(oldChild.domNode) && oldChild.vnode.remove();
            this._replaceChild(newChild.domNode, oldChild.domNode);
            newChild.repositionVNode();
            newChild._updateLifeLists();
            oldChild._updateLifeLists(true);
            oldChild.domNode.vElement = null;
            return oldChild;
        };

        // cones from v-element
        ElementPrototype.repositionVNode = function() {
            var instance = this,
                isNew = !instance.domNode || !nodesMap.has(instance.domNode),
                // by calling getVNode() on a domNode that is not part of `nodesMap`, the vNode gets created and positioned at the right place:
                vnode = instance.vnode,
                index;
            if (isNew) {
                // set the vnode at the right position of its children:
                index = arrayIndexOf.call(instance.parentNode.childNodes, instance);
                vnode.moveToParent(vnode.vParent, index);
            }
        };

        /**
         * Scrolls the content of the HtmlElement into the specified scrollposition.
         * Only available when the HtmlElement has overflow.
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
         * Sets the attribute on the HtmlElement with the specified value.
         *
         * Alias for setAttribute().
         *
         * @method setAttr
         * @param attributeName {String}
         * @param value {Any} the value that belongs to `key`
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.setAttr = function(attributeName, value) {
            this.setAttribute.call(this, attributeName, value || '');
            return this;
        };

        // cones from v-element
        ElementPrototype._setAttribute = ElementPrototype.setAttribute;
        ElementPrototype.setAttribute = function(attributeName, value) {
            var instance = this;
            instance._setAttribute.apply(instance, arguments);
            this.vnode.attrs[attributeName] = value;
            (attributeName==='className') && instance._updateLifeClassLists(instance);
            (attributeName==='name') && instance._updateLifeNamesList(instance);
            return value;
        };

        // cones from v-element
        ElementPrototype.setAttributeNode = function(attributeNode) {
            this.setAttribute(attributeNode.name, attributeNode.value);
        };

       /**
        * Adds a class to the HtmlElement. If the class already exists it won't be duplicated.
        *
        * @method setClass
        * @param className {String|Array} className to be added, may be an array of classNames
        * @chainable
        * @since 0.0.1
        */
        // cones from v-element
        ElementPrototype.setClass = function(className) {
            var instance = this;
            instance.classList.add(className);
            return instance;
        };

        /**
         * Stores arbitary `data` at the HtmlElement. This has nothing to do with node-attributes whatsoever,
         * it is just a way to bind any data to the specific Element so it can be retrieved later on with `getData()`.
         *
         * @method setData
         * @param key {string} name of the key
         * @param value {Any} the value that belongs to `key`
         * @chainable
         * @since 0.0.1
        */
        // cones from v-element
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
        * Sets a css-property (inline) out of the HtmlElement. Use camelCase.
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
            var instance = this;
            // cautious: in case of preserved words (fe `float`), we need to modify the attributename
            // in order to get it processed. It should be translated into `cssFloat` or alike.
            RESERVED_WORDS[cssAttribute] && (cssAttribute='css-'+cssAttribute); // will be camelCased in the next step
            instance.style[toCamelCase(cssAttribute)] = String(value).replace(/;$/, '');
            (instance.style.length===0) && instance.removeAttr('style');
            return instance;
        };

       /**
         * Set the position of an html element in page coordinates.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         *
         * If the HtmlElement has the attribute `xy-constrian` set, then its position cannot exceed any matching container it lies within.
         *
         * @method setXY
         * @param x {Number} x-value for new position (coordinates are page-based)
         * @param y {Number} y-value for new position (coordinates are page-based)
         * @param [constrain] {'window', HtmlElement, Object, String}
         * <ul>
         *     <li><b>'window'</b> to constrain to the visible window</li>
         *     <li><b>HtmlElement</b> to constrain to a specified HtmlElement</li>
         *     <li><b>Object</b> to constrain to an object with the properties: {x, y, w, h} where x and y are absolute pixels of the document
         *            (like calculated with getX() and getY()).</li>
         *     <li><b>String</b> to constrain to a specified css-selector, which should be an ancestor</li>
         * </ul>
         * @param [notransition=false] {Boolean} set true if you are sure positioning is without transition.
         *        this isn't required, but it speeds up positioning. Only use when no transition is used:
         *        when there is a transition, setting this argument `true` would miscalculate the position.
         * @chainable
         * @since 0.0.2
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
                        // if HtmlElement found, then bound it to `constrain` as if the argument `constrain` was an HtmlElement
                        match && (constrain=constrainNode);
                    }
                    if (constrain.matchesSelector) {
                        // HtmlElement --> we need to search the rectangle
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
        * Tests if the HtmlElement would be selected by the specified cssSelector.
        * Alias for `matchesSelector()`
        *
        * @method test
        * @param cssSelector {String} the css-selector to test against
        * @return {Boolean} whether or not the node matches the selector
        * @since 0.0.1
        */
        ElementPrototype.test = function(/* cssSelector */) {
            return DOCUMENT.test.apply(this, arguments);
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
        // cones from v-element
        ElementPrototype.toggleClass = function(className, forceState) {
            var instance = this;
            instance.classList.toggle(className, forceState);
            return instance;
        };
        /**
         * Updates `LIFE_PROPERTIES` --> hash to identify what tagNames have a `life` list at `document` (like `document.forms`).
         * The update takes place for the tagName of the provided VElement and only if there are any listeners to this tagName.
         *
         * @method updateLifeProps
         * @param [removed] {Boolean} whether the VElement was removed from the dom.
         * @private
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype._updateLifeProps = function(removed) {
            // only if there was a request to the property before:
            var property = this.vnode.tag,
                elementList;
            (elementList=NS.LIFE_PROPS[property]) && _updateList(elementList, this, removed);
        };

        /**
         * Updates `LIFE_NAMES` --> hash to identify what Element-Names have a `life` list at the VElement (like `VElement.getElementsByName`).
         * The update takes place for the `name` of the provided VElement and only if there are any listeners to this name set by `getElementsByName`.
         *
         * @method updateLifeNamesList
         * @param [removed] {Boolean} whether the VElement was removed from the dom.
         * @private
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype._updateLifeNamesList = function(removed) {
            var instance = this,
                vnode = instance.vnode,
                name = vnode.attrs && vnode.attrs.name,
                LIFE_NAMES, updateNames;
            if (name) {
                updateNames = function(elementList, nameRef) {
                    (nameRef===name) && _updateList(elementList, instance, removed);
                };
/*jshint boss:true */
                while (vnode=vnode.vParent) {
/*jshint boss:false */
                    vnode.LIFE_NAMES && (LIFE_NAMES=vnode.LIFE_NAMES[name]) && LIFE_NAMES.each(updateNames);
                }
            }
        };

        /**
         * Updates `LIFE_NAMES` --> hash to identify what Element-Names have a `life` list at the VElement (like `VElement.getElementsByClassName`).
         * The update takes place for the `name` of the provided VElement and only if there are any listeners to this name set by `getElementsByClassName`.
         *
         * @method updateLifeClassLists
         * @param [removed] {Boolean} whether the VElement was removed from the dom.
         * @private
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype._updateLifeClassLists = function(removed) {
            var instance = this,
                vnode = instance.vnode,
                sourceVNode = vnode,
                LIFE_CLASSES, updateClass;
            updateClass = function(elementList, classesDefinition) {
                (sourceVNode.matchesSelector(classesDefinition)) && _updateList(elementList, instance, removed);
            };
/*jshint boss:true */
            while (vnode=vnode.vParent) {
/*jshint boss:false */
                (LIFE_CLASSES=vnode.LIFE_CLASSES) && LIFE_CLASSES.each(updateClass);
            }
        };

        /**
         * Updates `LIFE_TAGS` --> hash to identify what Element-Names have a `life` list at the VElement (like `VElement.getElementsByTagName`).
         * The update takes place for the `name` of the provided VElement and only if there are any listeners to this name set by `getElementsByTagName`.
         *
         * @method updateLifeTagsLists
         * @param [removed] {Boolean} whether the VElement was removed from the dom.
         * @private
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype._updateLifeTagsLists = function(removed) {
            var instance = this,
                vnode = instance.vnode,
                tag = vnode.tag,
                LIFE_TAGS, updateTags;
            updateTags = function(elementList, tagRef) {
                (tagRef===tag) && _updateList(elementList, instance, removed);
            };
/*jshint boss:true */
            while (vnode=vnode.vParent) {
/*jshint boss:false */
                vnode.LIFE_TAGS && (LIFE_TAGS=vnode.LIFE_TAGS[tag]) && LIFE_TAGS.each(updateTags);
            }
        };

        /**
         * Updates all lifelists of the VElement. It calls the next methods:
         * <ul>
         *     <li>_updateLifeProps</li>
         *     <li>_updateLifeClassLists</li>
         *     <li>_updateLifeTagsLists</li>
         *     <li>_updateLifeNamesList</li>
         * </ul>
         *
         * @method _updateLifeLists
         * @param [removed] {Boolean} whether the VElement was removed from the dom.
         * @private
         * @since 0.0.1
         */
        // cones from v-element
        ElementPrototype._updateLifeLists = function(removed) {
            var instance = this;
            NS.LIFE_PROPERTIES[instance.tag] && instance._updateLifeProps(removed);
            instance._updateLifeClassLists(removed);
            instance._updateLifeTagsLists(removed);
            instance._updateLifeNamesList(removed);
        };

        Object.defineProperties(ElementPrototype, {

           /**
            * Gets the x-position (in the DOCUMENT) of the element in pixels.
            * DOCUMENT-related: regardless of the window's scroll-position.
            *
            * @property left
            * @since 0.0.1
            */
            left {
                get: function() {
                    return this.getBoundingClientRect().left + window.scrollLeft;
                },
                set: function(pixelsLeft) {
                    return this.setXY(pixelsLeft);
                }
            },


            tag: {
                get: function() {
                    return this.nodeName;
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