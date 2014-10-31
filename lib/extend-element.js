// Important note: some Documentproperties are life: they need to be updated whenever there is a dom-change.
// these are: 'anchors', 'applets', 'embeds', 'forms', 'images', 'scripts', 'styleSheets' and 'links'.

"use strict";

module.exports = function (window) {

    require('js-ext/lib/object.js');
    require('js-ext/lib/string.js');

    var domNodeToVNode = require('./node-parser.js')(window),
        NS = require('./vdom-ns.js')(window),
        nodesMap = NS.nodesMap,
        nodeids = NS.nodeids,
        arrayIndexOf = Array.Prototype.indexOf,
        updateLifeLists = NS.updateLifeLists,
        CLASS = 'class',
        STRING = 'string',
        extendElement;

    window.Element && (function(ElementPrototype) {

        ElementPrototype.getVNode = function() {
            var instance = this,
                vnode = instance._domNode && nodesMap.get(instance._domNode),
                parentNode, parentVNode, index;
            if (!vnode && (parentNode=instance.parentNode)) {
                parentVNode = parentNode.getVNode();
                vnode = domNodeToVNode(instance, parentVNode);
                // set the vnode at the right position of its children:
                index = arrayIndexOf.call(parentNode.childNodes, instance);
                vnode.moveToParent(parentVNode, index);
            }
            return vnode;
        };

        ElementPrototype.repositionVNode = function() {
            var instance = this,
                isNew = !instance._domNode || !nodesMap.has(instance._domNode),
                // by calling getVNode() on a domNode that is not part of `nodesMap`, the vNode gets created and positioned at the right place:
                vnode = instance.getVNode(),
                index;
            if (isNew) {
                // set the vnode at the right position of its children:
                index = arrayIndexOf.call(instance.parentNode.childNodes, instance);
                vnode.moveToParent(vnode.parent, index);
            }
        };

        ElementPrototype.contains = function(otherNode) {
            if (otherNode===this) {
                return true;
            }
            return this.getVNode().contains(otherNode);
        };

        ElementPrototype.querySelectorAll = function(selectors) {
            var found = [],
                inspectChildren = function(vnode) {
                    var childNodes = vnode.childNodes,
                        len = childNodes.length,
                        i, childVNode;
                    for (i=0; i<len; i++) {
                        childVNode = childNodes[i];
                        childVNode.matchesSelector(selectors) && (found[found.length]=childVNode.extNode);
                        inspectChildren(childVNode);
                    }
                };
            inspectChildren(this.getVNode());
            return found;
        };

        ElementPrototype.querySelector = function(selectors) {
            var found,
                inspectChildren = function(vnode) {
                    var childNodes = vnode.childNodes,
                        len = childNodes.length,
                        i, childVNode;
                    for (i=0; (i<len) && !found; i++) {
                        childVNode = childNodes[i];
                        childVNode.matchesSelector(selectors) && (found=childVNode.extNode);
                        found || inspectChildren(childVNode);
                    }
                };
            inspectChildren(this.getVNode());
            return found;
        };

        ElementPrototype._insertBefore = ElementPrototype.insertBefore;
        ElementPrototype.insertBefore = function(newElement, refElement) {
            newElement._domNode || (newElement=extendElement(newElement));
            refElement._domNode || (refElement=extendElement(refElement));
            this._insertBefore(newElement._domNode, refElement._domNode);
            newElement.repositionVNode();
            updateLifeLists(newElement);
            return newElement;
        };

        /**
         * replaces one child node of the specified element with another.
         * @param newChild {Node} the new node to replace oldChild. If it already exists in the DOM, it is first removed.
         * @param oldChild {Node} he existing child to be replaced.
         * @return {Node} is the replaced node. This is the same node as oldChild.
         */
        ElementPrototype._replaceChild = ElementPrototype.replaceChild;
        ElementPrototype.replaceChild = function(newChild, oldChild) {
            newChild._domNode || (newChild=extendElement(newChild));
            oldChild._domNode || (oldChild=extendElement(oldChild));
            nodesMap.has(oldChild._domNode) && oldChild.getVNode().remove();
            this._replaceChild(newChild._domNode, oldChild._domNode);
            newChild.repositionVNode();
            updateLifeLists(newChild);
            updateLifeLists(oldChild, true);
            oldChild._domNode._extendedNode = null;
            return oldChild;
        };

        ElementPrototype._removeChild = ElementPrototype.removeChild;
        ElementPrototype.removeChild = function(childNode) {
            childNode._domNode || (childNode=extendElement(childNode));
            nodesMap.has(childNode._domNode) && childNode.getVNode().remove();
            this._removeChild(childNode._domNode);
            updateLifeLists(childNode, true);
            // break the circular reference to prevent problems with GC:
            childNode._domNode._extendedNode = null;
            return childNode;
        };

        ElementPrototype._appendChild = ElementPrototype.appendChild;
        ElementPrototype.appendChild = function(newChild) {
            newChild._domNode || (newChild=extendElement(newChild));
            this._appendChild(newChild._domNode);
            newChild.repositionVNode();
            updateLifeLists(newChild);
            return newChild;
        };

        ElementPrototype.hasChildNodes = function() {
            return !!this.getVNode().childNodes && (this.getVNode().childNodes.length > 0);
        };

        ElementPrototype.matchesSelector = function(selectors) {
            return this.getVNode().matchesSelector(selectors);
        };

        /**
        * parses the specified text as HTML or XML and inserts the resulting nodes into the DOM tree at a specified position. It does not reparse the element it is being used on and thus it does not corrupt the existing elements inside the element. This, and avoiding the extra step of serialization make it much faster than direct innerHTML manipulation.
        * Note: The beforebegin and afterend positions work only if the node is in a tree and has an element parent.
        *
        * @param position {String} position is the position relative to the element, and must be one of the following strings:
        * <ul>
        *     <li>'beforebegin' Before the element itself.</li>
        *     <li>'afterbegin' Just inside the element, before its first child.</li>
        *     <li>'beforeend' Just inside the element, after its last child.</li>
        *     <li>'afterend' After the element itself.</li>
        * <ul>
        */
        ElementPrototype._insertAdjacentElement = ElementPrototype.insertAdjacentElement;
        ElementPrototype.insertAdjacentElement = function(position /* , element */) {
            var instance = this,
                vnode = instance.getVNode(),
                recheckNode = vnode.parent;
            instance._insertAdjacentElement.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.parent);
            recheckNode.checkNewChildren();
        };

        /**
        * parses the specified text as HTML or XML and inserts the resulting nodes into the DOM tree at a specified position. It does not reparse the element it is being used on and thus it does not corrupt the existing elements inside the element. This, and avoiding the extra step of serialization make it much faster than direct innerHTML manipulation.
        * Note: The beforebegin and afterend positions work only if the node is in a tree and has an element parent.
        *
        * @param position {String} position is the position relative to the element, and must be one of the following strings:
        * <ul>
        *     <li>'beforebegin' Before the element itself.</li>
        *     <li>'afterbegin' Just inside the element, before its first child.</li>
        *     <li>'beforeend' Just inside the element, after its last child.</li>
        *     <li>'afterend' After the element itself.</li>
        * <ul>
        */
        ElementPrototype._insertAdjacentHTML = ElementPrototype.insertAdjacentHTML;
        ElementPrototype.insertAdjacentHTML = function(position /*, html */) {
            var instance = this,
                vnode = instance.getVNode(),
                recheckNode = vnode.parent;
            instance._insertAdjacentHTML.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.parent);
            recheckNode.checkNewChildren();
        };

        /**
        * parses the specified text as HTML or XML and inserts the resulting nodes into the DOM tree at a specified position. It does not reparse the element it is being used on and thus it does not corrupt the existing elements inside the element. This, and avoiding the extra step of serialization make it much faster than direct innerHTML manipulation.
        * Note: The beforebegin and afterend positions work only if the node is in a tree and has an element parent.
        *
        * @param position {String} position is the position relative to the element, and must be one of the following strings:
        * <ul>
        *     <li>'beforebegin' Before the element itself.</li>
        *     <li>'afterbegin' Just inside the element, before its first child.</li>
        *     <li>'beforeend' Just inside the element, after its last child.</li>
        *     <li>'afterend' After the element itself.</li>
        * <ul>
        */
        ElementPrototype._insertAdjacentText = ElementPrototype.insertAdjacentText;
        ElementPrototype.insertAdjacentText = function(position /*, text */) {
            var instance = this,
                vnode = instance.getVNode(),
                recheckNode = vnode.parent;
            instance._insertAdjacentText.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.parent);
            recheckNode.checkNewChildren();
        };

        /**
         * returns the value of a specified attribute on the element. If the given attribute does not exist, the value returned will be null.
         * @param attributeName {String} the name of the attribute whose value you want to get.
         * @return {String|null} the value of attributeName.
         */
        ElementPrototype.getAttribute = function(attributeName) {
            return this.getVNode().attrs[attributeName] || null;
        };

        /**
         * returns the value of a specified attribute on the element. If the given attribute does not exist, the value returned will be null.
         * setAttribute lower-cases its attribute name argument. If the specified attribute already exists, then the value of that attribute is changed to the value passed to this function. If it does not exist, then the attribute is created.
         * @param attributeName {String} the name of the attribute
         * @param value {String}  is the desired new value of the attribute.
         * @return {String|null} the value of attributeName.
         */
        ElementPrototype._setAttribute = ElementPrototype.setAttribute;
        ElementPrototype.setAttribute = function(attributeName, value) {
            var instance = this;
            instance._setAttribute.apply(instance, arguments);
            this.getVNode().attrs[attributeName] = value;
            (attributeName==='className') && NS.updateLifeClassLists(instance);
            (attributeName==='name') && NS.updateLifeNamesList(instance);
            return value;
        };

        /**
         * removes an attribute from the specified element.
         * @param attributeName {String}  the attribute to be removed from element.
         */
        ElementPrototype._removeAttribute = ElementPrototype.removeAttribute;
        ElementPrototype.removeAttribute = function(attributeName) {
            var instance = this,
                vnode = this.getVNode();
            instance._removeAttribute.apply(instance, arguments);
            delete vnode.attrs[attributeName];
            (attributeName==='className') && NS.updateLifeClassLists(instance, true);
            (attributeName==='name') && NS.updateLifeNamesList(instance, true);
        };

        /**
         * indicating whether the specified element has the specified attribute or not.
         * @param attributeName {String} the name of the attribute.
         * @return {Boolean} whether the specified element has the specified attribute or not.
         */
        ElementPrototype.hasAttribute = function(attributeName) {
            return !!this.getVNode().attrs[attributeName];
        };

        /**
         * indicating if the current element has any attributes or not.
         * @return {Boolean} if the current element has any attributes or not.
         */
        ElementPrototype.hasAttributes = function() {
            return !!this.getVNode().attrs && (this.getVNode().attrs.length > 0);
        };

        //The Element.getElementsByClassName() method returns a live HTMLCollection containing all child elements which have all of the given class names. When called on the document object, the complete document is searched, including the root node.
        ElementPrototype.getElementsByClassName = function(classNames) {
            var instance = this,
                vnode = instance.getVNode();
            // modify classNames so it can be passed trhough to querySelectorAll:
            classNames = '.'+classNames.replace(/( )+/g, ' ').replace(/( )+/g, '.');
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_CLASSES || (vnode.LIFE_CLASSES={});
            return vnode.LIFE_CLASSES[classNames] || (vnode.LIFE_CLASSES[classNames]=instance.querySelectorAll(classNames));
        };

        //The Element.getElementsByTagName() method returns a live HTMLCollection of elements with the given tag name. The subtree underneath the specified element is searched, excluding the element itself. The returned list is live, meaning that it updates itself with the DOM tree automatically. Consequently, there is no need to call several times Element.getElementsByTagName() with the same element and arguments.
        ElementPrototype.getElementsByTagName = function(tagName) {
            var instance = this,
                vnode = instance.getVNode();
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_TAGS || (vnode.LIFE_TAGS={});
            return vnode.LIFE_TAGS[tagName] || (vnode.LIFE_TAGS[tagName]=instance.querySelectorAll(tagName));
        };

        ElementPrototype.getElementsByName = function(name) {
            var instance = this,
                vnode = instance.getVNode();
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_NAMES || (vnode.LIFE_NAMES={});
            return vnode.LIFE_NAMES[name] || (vnode.LIFE_NAMES[name]=instance.querySelectorAll('[name="'+name+'"]'));
        };

        // https://developer.mozilla.org/en-US/docs/Web/API/Element.removeAttributeNode
        ElementPrototype.removeAttributeNode = function(attributeNode) {
            this.removeAttribute(attributeNode.value);
        };

        // https://developer.mozilla.org/en-US/docs/Web/API/Element.setAttributeNode
        ElementPrototype.setAttributeNode = function(attributeNode) {
            this.setAttribute(attributeNode.name, attributeNode.value);
        };

        // https://developer.mozilla.org/en-US/docs/Web/API/Document.createNodeIterator
        ElementPrototype.createNodeIterator = function(whatToShow, filter) {
            var instance = this,
                vnode = instance.getVNode(),
                pointer = -1,
                results = [],
                showElement = ((whatToShow & 1)!==0),
                showComment = ((whatToShow & 128)!==0),
                showText = ((whatToShow & 4)!==0),
                iterator, searchChildNodes, match, lastPos;
            if (typeof filter !== 'function') {
                // check if it is a NodeFilter-object
                filter.acceptNode && (filter=filter.acceptNode);
            }
            (typeof filter==='function') || (filter=null);
            match = function(vNode) {
                var typeMatch = (showElement && (vNode.nodeType===1)) || (showComment && (vNode.nodeType===8)) || (showText && (vNode.nodeType===3)),
                    funcMatch = !filter || filter(vNode.extNode);
                return typeMatch && funcMatch;
            };
            searchChildNodes = function(vNode) {
                var childNodes = vNode.childNodes,
                    len = childNodes.length,
                    childNode, i;
                for (i=0; i<len; i++) {
                    childNode = childNodes[i];
                    match(childNode) && (results[results.length]=childNode.extNode);
                    childNode.hasChildNodes() && searchChildNodes(childNode);
                }
            };
            searchChildNodes(vnode);
            lastPos = results.length-1;
            iterator = {
                nextNode: function() {
                    if (pointer===lastPos) {
                        return null;
                    }
                    return results[++pointer];
                },
                previousNode: function() {
                    if (pointer<=0) {
                        return null;
                    }
                    return results[--pointer];
                }
            };
            Object.defineProperty(iterator, 'filter', {
                value: filter,
                writable: false,
                enummerable: true,
                configurable: false
            });
            return iterator;
        };

        // https://developer.mozilla.org/en-US/docs/Web/API/document.createTreeWalker
        ElementPrototype.createTreeWalker = function(whatToShow, filter) {
            var vnode = this.getVNode(),
                pointer = vnode,
                showElement = ((whatToShow & 1)!==0),
                showComment = ((whatToShow & 128)!==0),
                showText = ((whatToShow & 4)!==0),
                treewalker, match;
            if (typeof filter !== 'function') {
                // check if it is a NodeFilter-object
                filter.acceptNode && (filter=filter.acceptNode);
            }
            (typeof filter==='function') || (filter=null);
            match = function(vNode, forcedVisible) {
                var typeMatch = (showElement && (vNode.nodeType===1)) || (showComment && (vNode.nodeType===8)) || (showText && (vNode.nodeType===3)),
                    funcMatch = !filter || filter(vNode.extNode),
                    visibleMatch = !forcedVisible || (window.getComputedStyle(vNode.extNode._domNode).display!=='none');
                return typeMatch && funcMatch && visibleMatch;
            };
            treewalker = {
                firstChild: function() {
                    var foundNode = pointer.firstChild;
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.next();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                },
                lastChild: function() {
                    var foundNode = pointer.lastChild;
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.previous();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                },
                nextNode: function() {
                    var foundNode = pointer.next();
                    while (foundNode && !match(foundNode, true)) {
                        foundNode = foundNode.next();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                },
                nextSibling: function() {
                    var foundNode = pointer.next();
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.next();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                },
                parentNode: function() {
                    var foundNode = pointer.parent;
                    (foundNode!==vnode) && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                },
                previousNode: function() {
                    var foundNode = pointer.previous();
                    while (foundNode && !match(foundNode, true)) {
                        foundNode = foundNode.previous();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                },
                previousSibling: function() {
                    var foundNode = pointer.previous();
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.previous();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.extNode;
                }
            };
            Object.defineProperties(treewalker, {
                'currentNode': {
                    get: function() {
                        return pointer.extNode;
                    },
                    enummerable: true,
                    configurable: false
                },
                'filter': {
                    value: filter,
                    writable: false,
                    enummerable: true,
                    configurable: false
                },
                'root': {
                    value: vnode.extNode,
                    writable: false,
                    enummerable: true,
                    configurable: false
                },
                'whatToShow': {
                    value: whatToShow,
                    writable: false,
                    enummerable: true,
                    configurable: false
                }
            });
            return treewalker;
        };

        ElementPrototype.getElementById = function(id) {
            var element = nodeids[id];
            if (element && !this.contains(element)) {
                // outside itself
                return null;
            }
            return element || null;
        };

        //The Node.normalize() method puts the specified node and all of its sub-tree into a "normalized" form. In a normalized sub-tree, no text nodes in the sub-tree are empty and there are no adjacent text nodes.
        ElementPrototype.normalize = function() {
            // make it a void function --> vnode.js already mades every additional TextNode to be inserted normalized
        };



       /**
        * Returns the first of the HtmlElement's siblings, or the first that matches `cssSelector`.
        *
        * @method first
        * @param [cssSelector] {String} css-selector to be used as a filter
        * @return {HtmlElement|null}
        * @since 0.0.1
        */
        ElementPrototype.first = function(cssSelector) {
            var parent = this.getVNode().parent;
            return parent && parent.firstOfChildren(cssSelector).extNode;
        };

       /**
        * Returns the first HtmlElement child that matches the cssSelector.
        *
        * @method firstOfChildren
        * @param [cssSelector] {String} css-selector to be used as a filter
        * @return {HtmlElement || null} the last child-Element that matches the selector
        * @since 0.0.2
        */
        ElementPrototype.firstOfChildren = function(cssSelector) {
            var vnode = this.getVNode();
            return vnode && vnode.firstOfChildren(cssSelector).extNode;
        };


       /**
        * Returns the last of the HtmlElement's siblings, or the last that matches `cssSelector`.
        *
        * @method last
        * @param [cssSelector] {String} css-selector to be used as a filter
        * @return {HtmlElement|null}
        * @since 0.0.1
        */
        ElementPrototype.last = function(cssSelector) {
            var parent = this.getVNode().parent;
            return parent && parent.lastOfChildren(cssSelector).extNode;
        };

       /**
        * Returns the last HtmlElement child that matches the cssSelector.
        *
        * @method lastOfChildren
        * @param [cssSelector] {String} css-selector to be used as a filter
        * @return {HtmlElement || null} the last child-Element that matches the selector
        * @since 0.0.2
        */
        ElementPrototype.lastOfChildren = function(cssSelector) {
            var vnode = this.getVNode();
            return vnode && vnode.lastOfChildren(cssSelector).extNode;
        };

       /**
        * Returns the next of the HtmlElement's siblings, or the next that matches `cssSelector`.
        *
        * @method next
        * @param [cssSelector] {String} css-selector to be used as a filter
        * @return {HtmlElement|null}
        * @since 0.0.1
        */
        ElementPrototype.next = function(cssSelector) {
            var vnode = this.getVNode(),
                found, nextElement;
            if (!cssSelector) {
                return vnode.nextElement;
            }
            nextElement = vnode;
            do {
                nextElement = nextElement.nextElement;
                found = nextElement && nextElement.matchesSelector(cssSelector);
            } while(nextElement && !found);
            return found && nextElement.extNode;
        };

       /**
        * Returns the previous of the HtmlElement's siblings, or the previous that matches `cssSelector`.
        *
        * @method previous
        * @param [cssSelector] {String} css-selector to be used as a filter
        * @return {HtmlElement|null}
        * @since 0.0.1
        */
        ElementPrototype.previous = function(cssSelector) {
            var vnode = this.getVNode(),
                found, previousElement;
            if (!cssSelector) {
                return vnode.previousElement;
            }
            previousElement = vnode;
            do {
                previousElement = previousElement.previousElement;
                found = previousElement && previousElement.matchesSelector(cssSelector);
            } while(previousElement && !found);
            return found && previousElement.extNode;
        };

       /**
        * Adds a class to the HtmlElement. If the class already exists it won't be duplicated.
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

       /**
        * Removes a className from the HtmlElement.
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
        * Checks whether the className is present on the Element.
        *
        * @method hasClass
        * @param className {String|Array} the className to check for. May be an Array of classNames.
        * @return {Boolean} whether the className (or classNames) is present on the Element
        * @since 0.0.1
        */
        ElementPrototype.hasClass = function(className) {
            return this.classList.contains(className);
        };

    }(window.Element.prototype));

    // see https://developer.mozilla.org/en-US/docs/Web/API/Document
    // see https://developer.mozilla.org/en-US/docs/Web/API/Node
    // and https://developer.mozilla.org/en-US/docs/Web/API/Element

    extendElement = function(element) {
        var Element = Object.create(element);
        Object.defineProperties(Element, {
            innerHTML: {
                get: function() {
                    return this.getVNode().innerHTML;
                },
                set: function(val) {
                    this.getVNode().innerHTML = val;
                }
            },
            outerHTML: {
                get: function() {
                    return this.getVNode().outerHTML;
                },
                set: function(val) {
                    this.getVNode().outerHTML = val;
                }
            },
            _domNode: {
                value: element,
                enumerable: false,
                writable: false,
                configurable: false
            },
            childNodes: {
                get: function() {
                    var childNodes = this.getVNode().childNodes,
                        nodes = [],
                        i, len;
                    len = childNodes.length;
                    for (i=0; i<len; i++) {
                        nodes[i] = childNodes[i].extNode;
                    }
                    return nodes;
                }
            },
            children: {
                get: function() {
                    var children = this.getVNode().children,
                        nodes = [],
                        i, len;
                    len = children.length;
                    for (i=0; i<len; i++) {
                        nodes[i] = children[i].extNode;
                    }
                    return nodes;
                }
            },
            //The Node.firstChild read-only property returns the node's first child in the tree, or null if the node is childless. If the node is a Document, it returns the first node in the list of its direct children.            firstChild: {
            firstChild: {
                get: function() {
                    return this.getVNode().firstChild.extNode;
                }
            },
            //The Node.lastChild read-only property returns the last child of the node. If its parent is an element, then the child is generally an element node, a text node, or a comment node. It returns null if there are no child elements.
            lastChild: {
                get: function() {
                    return this.getVNode().lastChild.extNode;
                }
            },
            // The Element.attributes property returns a live collection of all attribute nodes registered to the specified node.
            attributes: {
                get: function() {
                    var attrsObj = this.getVNode().attrs;
                    return attrsObj.toArray({key: 'name'});
                }
            },
            // https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
            classList: {
                get: function() {
                    var instance = this,
                        vnode = instance.getVNode();
                    return {
                        add: function(className) {
                            // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                            // note: `this` is the returned object which is NOT the Elementinstance
                            var thisobject = this,
                                doSet = function(cl) {
                                    // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                                    thisobject.contains(cl) || (instance.setAttribute(CLASS, instance.className+((instance.className.length>0) ? ' ' : '') + cl));
                                };
                            if (typeof className === STRING) {
                                doSet(className);
                            }
                            else if (Array.isArray(className)) {
                                className.forEach(doSet);
                            }
                        },
                        remove: function(className) {
                            var doRemove = function(cl) {
                                    var regexp = new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)', 'g');
                                    // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                                    // note: `this` is the returned object which is NOT the Elementinstance
                                    instance.setAttribute(CLASS, instance.className.replace(regexp, ' ').trim());
                                };
                            if (typeof className === STRING) {
                                doRemove(className);
                            }
                            else if (Array.isArray(className)) {
                                className.forEach(doRemove);
                            }
                            (instance.className==='') && instance.removeAttr(CLASS);
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
                            // note: `this` is the returned object which is NOT the Elementinstance
                            return vnode.hasClass(className);
                        }
                    };
                }
            },
            // className gets and sets the value of the class attribute of the specified element.
            className: {
                get: function() {
                    return this.getAttribute('class');
                },
                set: function(val) {
                    this.setAttribute('class', val);
                }
            },
            tagName: {
                get: function() {
                    return this.getVNode().tag;
                }
            },
            previousElementSibling: {
                get: function() {
                    return this.getVNode().previousElement.extNode;
                }
            },
            nextElementSibling: {
                get: function() {
                    return this.getVNode().nextElement.extNode;
                }
            },
            //The ParentNode.childElementCount read-only property returns an unsigned long representing the number of child elements of the given element.
            childElementCount: {
                get: function() {
                    return this.getVNode().children.length;
                }
            },
            //The ParentNode.firstElementChild read-only property returns the object's first child Element, or null if there are no child elements.
            firstElementChild: {
                get: function() {
                    return this.getVNode().firstElementChild.extNode;
                }
            },
            // The ParentNode.lastElementChild read-only method returns the object's last child Element or null if there are no child elements.
            lastElementChild: {
                get: function() {
                    return this.getVNode().lastElementChild.extNode;
                }
            },
            // The Node.nextSibling read-only property returns the node immediately following the specified one in its parent's childNodes list, or null if the specified node is the last node in that list.
            nextSibling: {
                get: function() {
                    return this.getVNode().next.extNode;
                }
            },
            //The Node.nodeValue property returns or sets the value of the current node.
            nodeValue: {
                get: function() {
                    return this.getVNode().nodeValue;
                },
                set: function(val) {
                    this.getVNode().nodeValue = val;
                }
            },
            //The Node.parentElement read-only property returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element.
            parentElement: {
                get: function() {
                    return this.getVNode().parent.extNode;
                }
            },
            //The Node.parentNode read-only property returns the parent of the specified node in the DOM tree.
            parentNode: {
                get: function() {
                    return this.parentElement;
                }
            },
            //The Node.previousSibling read-only property returns the node immediately preceding the specified one in its parent's childNodes list, null if the specified node is the first in that list.
            previousSibling: {
                get: function() {
                    return this.getVNode().previous.extNode;
                }
            },
            //The Node.textContent property represents the text content of a node and its descendants.
            textContent: {
                get: function() {
                    return this.getVNode().textContent;
                },
                set: function(val) {
                    this.getVNode().textContent = val;
                }
            }

        });

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

        // give the original domnode a reference to the extended element:
        Object.defineProperty(element, {
            _extendedNode: {
                value: Element,
                enumerable: false,
                writable: false,
                configurable: false
            }
        });
        return Element;
    };

    module.exports = extendElement;

};