"use strict";

/**
 * Integrates DOM-events to event. more about DOM-events:
 * http://www.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule extend-document
 * @class document
 * @since 0.0.1
*/

module.exports = function (window) {

    var NS = require('./vdom-ns.js')(window),
        vElement = require('./v-element.js')(window),
        nodeids = NS.nodeids,
        nodesMap = NS.nodesMap,
        LIFE_PROPS = NS.LIFE_PROPS,
        DOCUMENT = window.document;

    // Note: window.document has no prototype

    DOCUMENT._activeElement = DOCUMENT.activeElement;
    DOCUMENT._createDocumentFragment = DOCUMENT.createDocumentFragment;
    DOCUMENT._currentScript = DOCUMENT.currentScript;
    DOCUMENT._documentElement = DOCUMENT.documentElement;
    DOCUMENT._elementFromPoint = DOCUMENT.elementFromPoint;


    /**
     * Adds a HtmlElement, vElement or DocumentFragment to the end of the `html`-element
     *
     * @param element {vElement|HtmlElement|DocumentFragment} the item to be appended
     * @return {vElement} the appended child.
     */
    DOCUMENT.appendChild = function(element) {
        return DOCUMENT.documentElement.appendChild(element);
    };

    /**
     * Returns a new NodeIterator object.
     *
     * The NodeIterator is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
     *
     * @method createNodeIterator
     * @param root {vElement} The root node at which to begin the NodeIterator's traversal.
     * @param [whatToShow] {Number} Filter specification constants from the NodeFilter DOM interface, indicating which nodes to iterate over.
     * You can use or sum one of the next properties:
     * <ul>
     *   <li>window.NodeFilter.SHOW_ELEMENT</li>
     *   <li>window.NodeFilter.SHOW_COMMENT</li>
     *   <li>window.NodeFilter.SHOW_TEXT</li>
     * </ul>
     * @param [filter] {NodeFilter|function} An object implementing the NodeFilter interface or a function. See https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
     * @return {NodeIterator}
     */
    DOCUMENT.createNodeIterator = function(root, whatToShow, filter) {
        return DOCUMENT.documentElement.createNodeIterator(whatToShow, filter);
    };

    /**
     * Returns a newly created TreeWalker object.
     *
     * The TreeWalker is life presentation of the dom. It gets updated when the dom changes.
     *
     * @method createTreeWalker
     * @param root {vElement} The root node at which to begin the NodeIterator's traversal.
     * @param [whatToShow] {Number} Filter specification constants from the NodeFilter DOM interface, indicating which nodes to iterate over.
     * You can use or sum one of the next properties:
     * <ul>
     *   <li>window.NodeFilter.SHOW_ELEMENT</li>
     *   <li>window.NodeFilter.SHOW_COMMENT</li>
     *   <li>window.NodeFilter.SHOW_TEXT</li>
     * </ul>
     * @param [filter] {NodeFilter|function} An object implementing the NodeFilter interface or a function. See https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
     * @return {TreeWalker}
     */
    DOCUMENT.createTreeWalker = function(root, whatToShow, filter) {
        return DOCUMENT.documentElement.createTreeWalker(whatToShow, filter);
    };

    /**
     * Indicating whether an HtmlElement or vElement is inside the DOM.
     *
     * @method contains
     * @param otherElement {vElement|HtmlElement}
     * @return {Boolean} whether the Element or vElement is inside the dom.
     * @since 0.0.1
     */
    DOCUMENT.contains = function(otherElement) {
        return DOCUMENT.documentElement.contains(otherElement);
    };

    /**
     * Creates a new empty DocumentFragment.
     *
     * DocumentFragments are DOM Nodes. They are never part of the main DOM tree. The usual use case is to create the document fragment,
     * append elements to the document fragment and then append the document fragment to the DOM tree.
     * In the DOM tree, the document fragment is replaced by all its children.
     *
     * @method createDocumentFragment
     * @return {DocumentFragment} Empty DocumentFragment
     */
    DOCUMENT.createDocumentFragment = function() {
        var fragment = DOCUMENT._createDocumentFragment();
        fragment.isFragment = true;
        return fragment;
    };

    /**
     * Returns the vElement from the document whose `elementFromPoint`-method is being called which is the topmost
     * dom-Element which lies under the given point. To get a vElement, specify the point via coordinates, in CSS pixels,
     * relative to the upper-left-most point in the window or frame containing the document.
     *
     * @method elementFromPoint
     * @param x {Number} x-coordinate to check, in CSS pixels relative to the upper-left corner of the document
     * @param y {Number} y-coordinate to check, in CSS pixels relative to the upper-left corner of the document
     * @return {vElement} the matching vElement
     */
    DOCUMENT.elementFromPoint = function(x, y) {
        var domNode = DOCUMENT._elementFromPoint(x, y),
            vnode = nodesMap[domNode];
        return vnode && vnode.vElement;
    };

    /**
     * Gets an ElementArray of vElements, specified by the css-selector.
     *
     * @method getAll
     * @param cssSelector {String} css-selector to match
     * @return {ElementArray} ElementArray of vElements that match the css-selector
     * @since 0.0.1
     */
    DOCUMENT.getAll = function(cssSelector) {
        return this.querySelectorAll(cssSelector);
    };

    /**
     * Gets one vElement, specified by the css-selector. To retrieve a single element by id,
     * you need to prepend the id-name with a `#`. When multiple vElement's match, the first is returned.
     *
     * @method getElement
     * @param cssSelector {String} css-selector to match
     * @return {vElement|null} the vElement that was search for
     * @since 0.0.1
     */
    DOCUMENT.getElement = function(cssSelector) {
        return ((cssSelector[0]==='#') && (cssSelector.indexOf(' ')===-1)) ? this.getElementById(cssSelector.substr(1)) : this.getAll(cssSelector)[0];
    };

    /**
     * Returns an vElement matching the specified id.
     * vElements are vElements that have optimized properties and method to manipulate the Dom
     *
     * @method getElementById
     * @param id {String} id of the vElement
     * @return {vElement|null}
     *
     */
    DOCUMENT.getElementById = function(id) {
        return nodeids[id] || null; // force `null` instead of `undefined` to be compatible with native getElementById.
    };

    /**
     * Returns an ElementArray of all vElements that match their `name`-attribute with the supplied `name` argument.
     *
     * getElementsByName is life presentation of the dom. The returned ElementArray gets updated when the dom changes.
     *
     * @method getElementsByName
     * @param name {String} the property of name-attribute to search for
     * @return {ElementArray} life Array with vElements
     */
    DOCUMENT.getElementsByName = function(name) {
        return DOCUMENT.documentElement.getElementsByName(name);
    };

    /**
     * Returns an ElementArray of all vElements that match their classes with the supplied `classNames` argument.
     * To match multiple different classes, separate them with a `comma`. You may -or- may not put a `dot` before the classNames.
     * `.red.blue` will be treaded the same as `red blue` or as `red.blue`
     *
     * getElementsByClassName is life presentation of the dom. The returned ElementArray gets updated when the dom changes.
     *
     * @example
     * var list1 = document.getElementsByClassName('red');
     * var list1 = document.getElementsByClassName('.red');
     * var list2 = document.getElementsByClassName('red blue'); // elements with both red and blue class
     * var list2 = document.getElementsByClassName('.red.blue'); // elements with both red and blue class
     * var list3 = document.getElementsByClassName('red, blue'); // elements with either red or blue class
     * var list3 = document.getElementsByClassName('.red, .blue'); // elements with either red or blue class
     *
     * @method getElementsByClassName
     * @param classNames {String} the classes to search for
     * @return {ElementArray} life Array with vElements
     */
    DOCUMENT.getElementsByClassName = function(classNames) {
        return DOCUMENT.documentElement.getElementsByClassName(classNames);
    };

    /**
     * Returns an ElementArray of all vElements that match their `name`-attribute with the supplied `name` argument.
     *
     * getElementsByTagName is life presentation of the dom. The returned ElementArray gets updated when the dom changes.
     *
     * @method getElementsByTagName
     * @param tagNames {String} the tags to search for
     * @return {ElementArray} life Array with vElements
     */
    DOCUMENT.getElementsByTagName = function(tagNames) {
        return DOCUMENT.documentElement.getElementsByTagName(tagNames);
    };

    /**
     * creates the specified HTML element
     * @param newElement {Node} The node to insert
     * @param referenceElement {Node} The node before which newElement is inserted.
     * @return {Node} the node being inserted (equals newElement)
     */
    DOCUMENT.insertBefore = function(newElement, referenceElement) {
        return DOCUMENT.documentElement.insertBefore(newElement, referenceElement);
    };

    /**
     * Returns an ElementArray of all vElements that match the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
     * they need to be separated by a `comma`.
     *
     * querySelectorAll is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
     *
     * @method querySelectorAll
     * @param selectors {String} CSS-selector(s) that should match
     * @return {ElementArray} non-life Array (snapshot) with vElements
     */
    DOCUMENT.querySelectorAll = function(selectors) {
        var docElement = DOCUMENT.documentElement,
            elements = docElement.querySelectorAll(selectors);
        docElement.matchesSelector(selectors) && elements.shift(docElement);
        return elements;
    };

    /**
     * Returns the first vElements that matches the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
     * they need to be separated by a `comma`.
     *
     * @method querySelector
     * @param selectors {String} CSS-selector(s) that should match
     * @return {vElement}
     */
    DOCUMENT.querySelector = function(selectors) {
        var docElement = DOCUMENT.documentElement;
        if (docElement.matchesSelector(selectors)) {
            return docElement;
        }
        return docElement.querySelector(selectors);
    };

    /**
     * Replaces the vElement with a new vElement.
     *
     * @method replace
     * @param newHtmlElement {HtmlElement|vElement|String} the new element
     * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only the element having a TextNode as a child.
     * @chainable
     * @since 0.0.1
     */
    DOCUMENT.replace = function(oldHtmlElement, newHtmlElement, escape) {
        return oldHtmlElement.replace(newHtmlElement, escape);
    };

    /**
     * Removes a child node from the DOM.
     *
     * @method removeChild
     * @param child {vElement} the Element to be removed from the DOM
     * @return {vElement} a reference to the removed child node
     */
    DOCUMENT.removeChild = function(child) {
        return DOCUMENT.documentElement.removeChild(child);
    };

    /**
     * Replaces one child-element of its parent element with a new child-element.
     *
     * @method replaceChild
     * @param newChild {HtmlElement, vElement, String} the new element to replace oldChild. If it already exists in the DOM, it is first removed.
     * @param oldChild {vElement} The existing child to be replaced.
     * @return {vElement} is the replaced node. This is the same vElement as oldChild.
     */
    DOCUMENT.replaceChild = function(newChild, oldChild) {
        return DOCUMENT.documentElement.replaceChild(newChild, oldChild);
    };

   /**
    * Tests if the vElement would be selected by the specified cssSelector.
    * Alias for `matchesSelector()`
    *
    * @method test
    * @param cssSelector {String} the css-selector to test against
    * @return {Boolean} whether or not the node matches the selector
    * @since 0.0.1
    */
    DOCUMENT.test = function(cssSelector) {
        return this.matchesSelector(cssSelector);
    };

    Object.defineProperties(DOCUMENT, {
        'activeElement': {
            get: function() {
                return nodesMap(DOCUMENT._activeElement).vElement;
            }
        },
        'anchors': {
            get: function() {
                return LIFE_PROPS.ANCHORS || (LIFE_PROPS.ANCHORS=DOCUMENT.querySelectorAll('a[name]'));
            }
        },
        'applets': {
            get: function() {
                return LIFE_PROPS.APPLETS || (LIFE_PROPS.APPLETS=DOCUMENT.querySelectorAll('applet'));
            }
        },
        'body': {
            get: function() {
                return NS.body || (NS.body=DOCUMENT.querySelector('body'));
            }
        },
        'embeds': {
            get: function() {
                return LIFE_PROPS.EMBEDS || (LIFE_PROPS.EMBEDS=DOCUMENT.querySelectorAll('embed'));
            }
        },
        'forms': {
            get: function() {
                return LIFE_PROPS.FORMS || (LIFE_PROPS.FORMS=DOCUMENT.querySelectorAll('form'));
            }
        },
        'head': {
            get: function() {
                return NS.head || (NS.head=DOCUMENT.querySelector('head'));
            }
        },
        'images': {
            get: function() {
                return LIFE_PROPS.IMAGES || (LIFE_PROPS.IMAGES=DOCUMENT.querySelectorAll('img'));
            }
        },
        'scripts': {
            get: function() {
                return LIFE_PROPS.SCRIPTS || (LIFE_PROPS.SCRIPTS=DOCUMENT.querySelectorAll('script'));
            }
        },
        'styleSheets': {
            get: function() {
                return LIFE_PROPS.STYLESHEETS || (LIFE_PROPS.STYLESHEETS=DOCUMENT.querySelectorAll('style'));
            }
        },
        'currentScript': {
            get: function() {
                return nodesMap(DOCUMENT._currentScript).vElement;
            }
        },
        'documentElement': {
            get: function() {
                return nodesMap(DOCUMENT._documentElement).vElement;
            }
        },
        'links': {//-->The links property returns a collection of all <area> elements and <a> elements in a document with a value for the href attribute.
            get: function() {
                return LIFE_PROPS.LINKS || (LIFE_PROPS.LINKS=DOCUMENT.querySelectorAll('a[href], area[href]'));
            }
        }
    });

};

//--- definition API of unmodified `document`-methods ------


/**
 * Adopts a node from an external document. The node and its subtree is removed from the document it's in (if any),
 * and its ownerDocument is changed to the current document. The node can then be inserted into the current document.
 *
 * @method adoptNode
 * @param externalNode {Node} The node from another document to be adopted.
 * @return {Node} is the adopted node that can be used in the current document.
 * The new node's parentNode is null, since it has not yet been inserted into the document tree.
 */

/**
 * Creates a new attribute-node, and returns it.
 *
 * @method createAttribute
 * @param name {String} The name of the attribute
 * @return {AttributeNode}
 */

/**
 * Creates a new Comment-node, and returns it.
 *
 * @method createComment
 * @param data {String} The data to be added to the Comment.
 * @return {CommentNode}
 */

/**
 * Creates a new HtmlElement, and returns it.
 *
 * Don't use qualified names (like "html:a") with this method.
 *
 * @method createElement
 * @param tagName {String}  is a string that specifies the type of element to be created.
 *        The nodeName of the created element is initialized with the value of tagName.
 * @return {HtmlElement}
 */

/**
 * Returns a new Range object. See https://developer.mozilla.org/en-US/docs/Web/API/Range
 *
 * @method createRange
 * @return {Range}
 */

/**
 * Creates a new Text-node, and returns it.
 *
 * @method createTextNode
 * @param data {String} The data to be added to the Text-node.
 * @return {TextNode}
 */

/**
 * Enables the style sheets matching the specified name in the current style sheet set,
 * and disables all other style sheets (except those without a title, which are always enabled).
 *
 * @method enableStyleSheetsForSet
 * @param name {String} The name of the style sheets to enable. All style sheets with a title that match this name will be enabled,
 *        while all others that have a title will be disabled. Specify an empty string for the name parameter
 *        to disable all alternate and preferred style sheets (but not the persistent style sheets; that is, those with no title attribute).
 */

/**
 * Returns a selection object representing the range of text selected by the user.
 *
 * Is also available on the `window`-object.
 *
 * @method getSelection
 * @return {Selection} A Selection object. When cast to string, either by adding empty quotes "" or using .toString, this object is the text selected.
 */

/**
 * Returns a Boolean value indicating whether the document or any element inside the document has focus.
 *
 * @method hasFocus
 * @return {Boolean} whether the document or any element inside the document has focus.
 */

/**
 * Creates a copy of a node from an external document that can be inserted into the current document.
 *
 * @method importNode
 * @param externalNode {Node} The node from another document to be adopted.
 * @param deep {Boolean} Whether the descendants of the imported node need to be imported.
 * @return {Node} The new node that is imported into the document.
 * The new node's parentNode is null, since it has not yet been inserted into the document tree.
 */

