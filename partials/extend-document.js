"use strict";

/**
 * Provides several methods that override native document-methods to work with the vdom.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule extend-document
 * @class document
 * @since 0.0.1
*/

require('polyfill');
require('js-ext/lib/object.js');
require('js-ext/lib/string.js');

var createHashMap = require('js-ext/extra/hashmap.js').createMap;

module.exports = function (window) {

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.ExtendDocument) {
        return; // ExtendDocument was already created
    }

    // prevent double definition:
    window._ITSAmodules.ExtendDocument = true;

    var NS = require('./vdom-ns.js')(window),
        nodeids = NS.nodeids,
        DOCUMENT = window.document;

    // Note: window.document has no prototype

    /**
     * Returns a newly created TreeWalker object.
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
     */
    DOCUMENT.createTreeWalker = function(root, whatToShow, filter) {
        return root.createTreeWalker(whatToShow, filter);
    };

    /**
     * Indicating whether an Element is inside the DOM.
     *
     * @method contains
     * @param otherElement {Element}
     * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
     * @return {Boolean} whether the Element is inside the dom.
     * @since 0.0.1
     */
    DOCUMENT.contains = function(otherElement, insideItags) {
        return DOCUMENT.documentElement.contains(otherElement, insideItags);
    };

    /**
     * Gets an ElementArray of Elements, specified by the css-selector.
     *
     * @method getAll
     * @param cssSelector {String} css-selector to match
     * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
     * @return {ElementArray} ElementArray of Elements that match the css-selector
     * @since 0.0.1
     */
    DOCUMENT.getAll = function(cssSelector, insideItags) {
        return this.querySelectorAll(cssSelector, insideItags);
    };

    /**
     * Gets one Element, specified by the css-selector. To retrieve a single element by id,
     * you need to prepend the id-name with a `#`. When multiple Element's match, the first is returned.
     *
     * @method getElement
     * @param cssSelector {String} css-selector to match
     * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
     * @return {Element|null} the Element that was search for
     * @since 0.0.1
     */
    DOCUMENT.getElement = function(cssSelector, insideItags) {
        return ((cssSelector[0]==='#') && (cssSelector.indexOf(' ')===-1)) ? this.getElementById(cssSelector.substr(1)) : this.querySelector(cssSelector, insideItags);
    };

    /**
     * Returns the Element matching the specified id.
     *
     * @method getElementById
     * @param id {String} id of the Element
     * @return {Element|null}
     *
     */
    DOCUMENT.getElementById = function(id, insideItags) {
        return DOCUMENT.documentElement.getElementById(id, insideItags);
    };

    /**
     * Returns the an Array with all itag-Elements
     *
     * @method getItags
     * @return {Array}
     *
     */
    DOCUMENT.getItags = function() {
        var instance = this,
            findChildren;
        // i-tag elements can only exists when the window.ITAGS are defined (by itags.core)
        if (!window.ITAGS) {
            return [];
        }
        if (instance._itagList) {
            return instance._itagList;
        }
        // when not returned: it would be the first time --> we setup the current list
        // the quickest way is by going through the vdom and inspect the tagNames ourselves:
        findChildren = function(vnode) {
            var vChildren = vnode.vChildren,
                len = vChildren.length,
                i, vChild;
            for (i=0; i<len; i++) {
                vChild = vChildren[i];
                vChild.isItag && (DOCUMENT._itagList[DOCUMENT._itagList.length]=vChild.domNode);
                findChildren(vChild);
            }
        };
        Object.protectedProp(instance, '_itagList', []);
        findChildren(instance.getElement('body').vnode);
        return instance._itagList;
    };

    /**
     * Returns the first Element that matches the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
     * they need to be separated by a `comma`.
     *
     * @method querySelector
     * @param selectors {String} CSS-selector(s) that should match
     * @return {Element}
     */
    DOCUMENT.querySelector = function(selectors) {
        var docElement = DOCUMENT.documentElement;
        if (docElement.matchesSelector(selectors)) {
            return docElement;
        }
        return docElement.querySelector(selectors);
    };

    /**
     * Returns an ElementArray of all Elements that match the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
     * they need to be separated by a `comma`.
     *
     * querySelectorAll is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
     *
     * @method querySelectorAll
     * @param selectors {String} CSS-selector(s) that should match
     * @return {ElementArray} non-life Array (snapshot) with Elements
     */
    DOCUMENT.querySelectorAll = function(selectors) {
        var docElement = DOCUMENT.documentElement,
            elements = docElement.querySelectorAll(selectors);
        docElement.matchesSelector(selectors) && elements.shift(docElement);
        return elements;
    };

    /**
     * Replaces the Element with a new Element.
     *
     * @method replace
     * @param newHtmlElement {Element|String} the new element
     * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only the element having a TextNode as a child.
     * @chainable
     * @since 0.0.1
     */
    DOCUMENT.replace = function(oldHtmlElement, newHtmlElement, escape) {
        return oldHtmlElement.replace(newHtmlElement, escape);
    };

   /**
    * Tests if an Element would be selected by the specified cssSelector.
    * Alias for `matchesSelector()`
    *
    * @method test
    * @param element {Element} The Element to test
    * @param cssSelector {String} the css-selector to test against
    * @return {Boolean} whether or not the node matches the selector
    * @since 0.0.1
    */
    DOCUMENT.test = function(element, cssSelector) {
        return element.matches(cssSelector);
    };

};

//--- declaration of properties ---------------------------

/**
 * Returns the currently focused element, that is, the element that will get keystroke events if the user types any.
 *
 * @property activeElement
 * @type Element
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the `anchors` in the document that have a `name` specified (a[name]).
 * For reasons of backwards compatibility, the returned set of anchors only contains those anchors created with the `name` attribute.
 *
 * `anchors` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property anchors
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the `applets` in the document.
 *
 * `applets` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property applets
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns the `body` or `frameset` Element of the current document, or null if no such element exists.
 *
 * @property body
 * @type Element
 * @readOnly
 */

/**
 * Returns the `script`-Element whose script is currently being processed.
 *
 *
 * @property currentScript
 * @type Element
 * @readOnly
 */

/**
 * Returns the root-element (===`html`-Element) of the current document
 *
 * @property documentElement
 * @type Element
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the `embed`-elements in the document.
 *
 * `embeds` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property embeds
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns the firstChild element (===`html`-Element) of the current document
 *
 * @property firstChild
 * @type Element
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the `form`-elements in the document.
 *
 * `forms` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property forms
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the images in the document.
 *
 * `images` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property images
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns the lastChild element (===`html`-Element) of the current document
 *
 * @property lastChild
 * @type Element
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the  of all `area`-Elements and `a`-Elements in a document with a value for the href attribute.
 *
 * `links` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property links
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the plugins (`object`- or `embed`-elements) in the document.
 *
 * `plugins` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property plugins
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the script-elements in the document.
 *
 * `scripts` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property scripts
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Returns an HTMLCollection with Elements of all of the style-elements in the document.
 *
 * `styleSheets` is a life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * @property styleSheets
 * @type HTMLCollection
 * @readOnly
 */

/**
 * Gets or sets the `title` of the document. That is, the `title`-Element within the `head`-Element
 *
 * @property title
 * @type String
 */


//--- definition API of unmodified `document`-events ------

/**
* "online" event is fired on the <body> of each page when the browser switches between online and offline mode.
* The event is non-cancellable (you can't prevent the user from coming online, or going offline).
*
* @event online
*/

/**
* "offline" event is fired on the <body> of each page when the browser switches between online and offline mode.
* The event is non-cancellable (you can't prevent the user from coming online, or going offline).
*
* @event offline
*/

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
 * Adds a HtmlElement or DocumentFragment to the end of the `html`-element
 *
 * @method appendChild
 * @param element {Element|DocumentFragment} the item to be appended
 * @return {Element} the appended child.
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
 * Returns a new NodeIterator object.
 *
 * The NodeIterator is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
 *
 * @method createNodeIterator
 * @param root {Element} The root node at which to begin the NodeIterator's traversal.
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
 * Returns the Element from the document whose `elementFromPoint`-method is being called which is the topmost
 * dom-Element which lies under the given point. To get a Element, specify the point via coordinates, in CSS pixels,
 * relative to the upper-left-most point in the window or frame containing the document.
 *
 * @method elementFromPoint
 * @param x {Number} x-coordinate to check, in CSS pixels relative to the upper-left corner of the document
 * @param y {Number} y-coordinate to check, in CSS pixels relative to the upper-left corner of the document
 * @return {Element} the matching Element
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
 * Returns an ElementArray of all Elements that match their classes with the supplied `classNames` argument.
 * To match multiple different classes, separate them with a `comma`.
 *
 * getElementsByClassName is life presentation of the dom. The returned ElementArray gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 *
 * @method getElementsByClassName
 * @param classNames {String} the classes to search for
 * @return {ElementArray} life Array with Elements
 */

/**
 * Returns an ElementArray of all Elements that match their `name`-attribute with the supplied `name` argument.
 *
 * getElementsByName is life presentation of the dom. The returned ElementArray gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByName
 * @param name {String} the property of name-attribute to search for
 * @return {ElementArray} life Array with Elements
 */

/**
 * Returns an ElementArray of all Elements that match their `name`-attribute with the supplied `name` argument.
 *
 * getElementsByTagName is life presentation of the dom. The returned ElementArray gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByTagName
 * @param tagNames {String} the tags to search for
 * @return {ElementArray} life Array with Elements
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

/**
 * Inserts `newElement` before `referenceElement`.
 *
 * @method insertBefore
 * @param newElement {Element} The newElement to insert
 * @param referenceElement {Element} The Element before which newElement is inserted.
 * @return {Element} the Element being inserted (equals newElement)
 */

/**
 * Removes a child node from the DOM.
 *
 * @method removeChild
 * @param child {Element} the Element to be removed from the DOM
 * @return {Element} a reference to the removed child node
 */

/**
 * Replaces one child-element of its parent element with a new child-element.
 *
 * @method replaceChild
 * @param newChild {Element} the new element to replace oldChild. If it already exists in the DOM, it is first removed.
 * @param oldChild {Element} The existing child to be replaced.
 * @return {Element} is the replaced node. This is the same Element as oldChild.
 */

//--- definition API of unmodified `document`-properties ------

/**
 * Returns the character encoding of the current document.
 *
 * @property characterSet
 * @readOnly
 */

/**
 * Indicates whether the document is rendered in Quirks mode or Standards mode. Its value is either:
 * <ul>
 *     <li>`BackCompat` if the document is in quirks mode</li>
 *     <li>`CSS1Compat` if the document is in no-quirks (also known as `standards`) mode or limited-quirks (also known as `almost standards`) mode.</li>
 * </ul>
 *
 * @property compatMode
 * @readOnly
 */

/**
 * Returns the MIME type that the document is being rendered as.  This may come from HTTP headers or other sources of MIME information,
 * and might be affected by automatic type conversions performed by either the browser or extensions.
 *
 * @property contentType
 * @readOnly
 */

/**
 * Returns the Document Type Declaration (DTD) associated with current document. The returned object implements the DocumentType interface.
 * Use DOMImplementation.createDocumentType() to create a DocumentType.
 *
 * @property doctype
 * @readOnly
 */

/**
 * Returns string URI of the HTML document. Same as `document.URL`.
 *
 * Note: HTML documents have a document.URL property which returns the same value. Unlike URL, documentURI is available on all types of documents.
 *
 * @property documentURI
 * @type String
 * @readOnly
 */

/**
 * Controls whether the entire document is editable. Its value should be either "off" or "on".
 *
 * @property designMode
 * @type String
 * @default "off"
 */

/**
 * Gets the domain portion of the origin of the current document.
 *
 * Setter will fail, because the same origin policy needs to persist.
 *
 * @property domain
 * @type String
 * @readOnly
 */

/**
 * Returns a DOMImplementation object associated with the current document.
 *
 * @property implementation
 * @type DOMImplementation
 * @readOnly
 */

/**
 * Returns a string containing the date and time on which the current document was last modified.
 * If you want a Date-object, you need to transform lastModified into a Date object: `modifyDate = new Date(document.lastModified);`
 *
 * @property lastModified
 * @type String
 * @readOnly
 */

/**
 * Returns the last enabled style sheet set; this property's value changes whenever the document.selectedStyleSheetSet property is changed.
 *
 * @property lastStyleSheetSet
 * @type String
 * @readOnly
 */

/**
 * returns a Location object, which contains information about the URL of the document and provides methods for changing that URL and loading another URL.
 *
 * Though Document.location is a read-only Location object, you can also assign a DOMString to it. This means that you can work with document.location
 * as if it were a string in most cases: document.location = 'http://www.example.com' is a synonym of document.location.href = 'http://www.example.com'.
 *
 * To retrieve just the URL as a string, the read-only document.URL property can also be used.
 *
 * See more about the `Location` object: https://developer.mozilla.org/en-US/docs/Web/API/Location
 *
 * @property location
 * @type Location
 * @readOnly
 */

/**
 * Returns the preferred style sheet set as set by the page author. This is determined from the order of style sheet declarations and the Default-Style HTTP header.
 *
 * @property preferredStyleSheetSet
 * @type String
 */

/**
 * Returns "loading" while the document is loading, "interactive" once it is finished parsing but still loading sub-resources,
 * and "complete" once it has loaded.
 *
 * @property readyState
 * @type String
 * @readOnly
 */

/**
 * Returns the URI of the page that linked to this page.
 *
 * @property referrer
 * @type String
 * @readOnly
 */

/**
 * Indicates the name of the style sheet set that's currently in use. See more about Stylesheets: https://developer.mozilla.org/en-US/docs/Web/API/Stylesheet
 * Setting the value of this property is equivalent to calling document.enableStyleSheetsForSet() with the value of currentStyleSheetSet,
 * then setting the value of lastStyleSheetSet to that value as well.
 *
 * @property selectedStyleSheetSet
 * @type String
 */

/**
 * Returns string URL of the HTML document. Same as `document.documentURI`
 *
 * Note: HTML documents have a document.URL property which returns the same value. Unlike URL, documentURI is available on all types of documents.
 *
 * @property URL
 * @type String
 * @readOnly
 */


