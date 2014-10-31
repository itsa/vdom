"use strict";

module.exports = function (window) {

    var NS = require('./vdom-ns.js')(window),
        extendElement = require('./extend-element.js')(window),
        nodeids = NS.nodeids,
        nodesMap = NS.nodesMap,
        LIFE_PROPS = NS.LIFE_PROPS,
        DOCUMENT = window.document;

    // Note: window.document has no prototype

    /**
     * Returns an Extended-Element matching the specified id.
     * Extended-Elements are HtmlElements that have optimized properties and method to manipulate the Dom
     *
     * @method getElementById
     * @param id {String} id of the HtmlElement
     * @return {HtmlElement|null}
     *
     */
    DOCUMENT.getElementById = function(id) {
        return nodeids[id] || null; // force `null` instead of `undefined` to be compatible with native getElementById.
    };

    /**
     * Returns the first element within the document (using depth-first pre-order traversal of the document's nodes) that matches the specified group of selectors.
     * @params selectors {String} One or more CSS selectors separated by commas
     */
    DOCUMENT.querySelectorAll = function(selectors) {
        var docElement = DOCUMENT.documentElement,
            elements = docElement.querySelectorAll(selectors);
        docElement.matchesSelector(selectors) && elements.shift(docElement);
        return elements;
    };

    DOCUMENT.querySelector = function(selectors) {
        var docElement = DOCUMENT.documentElement;
        if (docElement.matchesSelector(selectors)) {
            return docElement;
        }
        return docElement.querySelector(selectors);
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
     * replaces one child node of the specified element with another.
     * @param newChild {Node} the new node to replace oldChild. If it already exists in the DOM, it is first removed.
     * @param oldChild {Node} he existing child to be replaced.
     * @return {Node} is the replaced node. This is the same node as oldChild.
     */
    DOCUMENT.replaceChild = function(newChild, oldChild) {
        return DOCUMENT.documentElement.replaceChild(newChild, oldChild);
    };

    /**
     * method removes a child node from the DOM.
     * @param child {Node} the node to be removed from the DOM
     * @return {Node} a reference to the removed child node
     */
    DOCUMENT.removeChild = function(child) {
        return DOCUMENT.documentElement.removeChild(child);
    };

    /**
     * adds a node to the end of the list of children of a specified parent node. If the given child is a reference to an existing node in the document, appendChild() moves it from its current position to the new position (i.e. there is no requirement to remove the node from its parent node before appending it to some other node).
     * @param aChild {Node} the Node to be appended
     * @return {Node} the appended child.
     */
    DOCUMENT.appendChild = function(aChild) {
        return DOCUMENT.documentElement.appendChild(aChild);
    };

    /**
     * indicating whether a node is a descendant of a given node. or not.
     * @return {Boolean} whether a node is a descendant of a given node. or not.
     */
    DOCUMENT.contains = function(otherNode) {
        return DOCUMENT.documentElement.contains(otherNode);
    };

    DOCUMENT.createNodeIterator = function(root, whatToShow, filter) {
        return DOCUMENT.documentElement.createNodeIterator(root, whatToShow, filter);
    };

    DOCUMENT.createTreeWalker = function(root, whatToShow, filter, entityReferenceExpansion) {
        return DOCUMENT.documentElement.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion);
    };

    DOCUMENT.elementFromPoint = function(x, y) {
        return DOCUMENT.documentElement.elementFromPoint(x, y);
    };

    DOCUMENT.getElementsByName = function(name) {
        return DOCUMENT.documentElement.getElementsByName(name);
    };

    /**
     * elements is a live HTMLCollection of found elements.
     * @param classNames {String} string representing the list of class names to match; class names are separated by whitespace
     */
    DOCUMENT.getElementsByClassName = function(classNames) {
        return DOCUMENT.documentElement.getElementsByClassName(classNames);
    };

    /**
     * tagName is the qualified name to look for. The special string "*" represents all elements. For compatibility with XHTML, lower-case should be used.
     * @param tagNames {String} string representing the list of tag-names to match; tag-names are separated by whitespace
     */
    DOCUMENT.getElementsByTagName = function(tagNames) {
        return DOCUMENT.documentElement.getElementsByTagName(tagNames);
    };


    // https://developer.mozilla.org/en-US/docs/Web/API/Document.createNodeIterator
    DOCUMENT.createNodeIterator = function(root, whatToShow, filter) {
        root._domNode || (root=extendElement(root));
        return root.createNodeIterator(whatToShow, filter);
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/document.createTreeWalker
    DOCUMENT.createTreeWalker = function(root, whatToShow, filter) {
        root._domNode || (root=extendElement(root));
        return root.createTreeWalker(whatToShow, filter);
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/document.elementFromPoint
    DOCUMENT._elementFromPoint = DOCUMENT._elementFromPoint;
    DOCUMENT.elementFromPoint = function(x, y) {
        var domNode = DOCUMENT._elementFromPoint(x, y),
            vnode = nodesMap[domNode];
        return vnode && vnode.extNode;
    };

    DOCUMENT._documentElement = DOCUMENT.documentElement;
    DOCUMENT._activeElement = DOCUMENT.activeElement;
    DOCUMENT._currentScript = DOCUMENT.currentScript;

    Object.defineProperties(DOCUMENT, {
        'activeElement': {
            get: function() {
                return nodesMap(DOCUMENT._activeElement).extNode;
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
                return nodesMap(DOCUMENT._currentScript).extNode;
            }
        },
        'documentElement': {
            get: function() {
                return nodesMap(DOCUMENT._documentElement).extNode;
            }
        },
        'links': {//-->The links property returns a collection of all <area> elements and <a> elements in a document with a value for the href attribute.
            get: function() {
                return LIFE_PROPS.LINKS || (LIFE_PROPS.LINKS=DOCUMENT.querySelectorAll('a[href], area[href]'));
            }
        }
    });

};
//----------------------------