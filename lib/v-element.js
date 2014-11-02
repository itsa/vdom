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

module.exports = function (window) {

    require('js-ext/lib/object.js');
    require('js-ext/lib/string.js');

    var domNodeToVNode = require('./node-parser.js')(window),
        NS = require('./vdom-ns.js')(window),
        nodesMap = NS.nodesMap,
        nodeids = NS.nodeids,
        arrayIndexOf = Array.Prototype.indexOf,
        CLASS = 'class',
        STRING = 'string',
        vElement, VElementDescriptor,

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

    // Overwrite Element methods so that they always return vElement instead of Element:
    window.Element && (function(ElementPrototype) {

        ElementPrototype._appendChild = ElementPrototype.appendChild;
        ElementPrototype.appendChild = function(newChild) {
            newChild.domNode || (newChild=vElement(newChild));
            this._appendChild(newChild.domNode);
            newChild.repositionVNode();
            newChild._updateLifeLists();
            return newChild;
        };

        ElementPrototype.contains = function(otherNode) {
            if (otherNode===this) {
                return true;
            }
            return this.vnode.contains(otherNode);
        };

        ElementPrototype.createNodeIterator = function(whatToShow, filter) {
            var instance = this,
                vnode = instance.vnode,
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
                    funcMatch = !filter || filter(vNode.vElement);
                return typeMatch && funcMatch;
            };
            searchChildNodes = function(vNode) {
                var vChildNodes = vNode.vChildNodes,
                    len = vChildNodes.length,
                    childNode, i;
                for (i=0; i<len; i++) {
                    childNode = vChildNodes[i];
                    match(childNode) && (results[results.length]=childNode.vElement);
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
            var vnode = this.vnode,
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
                    funcMatch = !filter || filter(vNode.vElement),
                    visibleMatch = !forcedVisible || (window.getComputedStyle(vNode.vElement.domNode).display!=='none');
                return typeMatch && funcMatch && visibleMatch;
            };
            treewalker = {
                firstChild: function() {
                    var foundNode = pointer.vFirstChild;
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.vNext();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                },
                lastChild: function() {
                    var foundNode = pointer.vLastChild;
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.vPrevious();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                },
                nextNode: function() {
                    var foundNode = pointer.vNext();
                    while (foundNode && !match(foundNode, true)) {
                        foundNode = foundNode.vNext();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                },
                nextSibling: function() {
                    var foundNode = pointer.vNext();
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.vNext();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                },
                parentNode: function() {
                    var foundNode = pointer.vParent;
                    (foundNode!==vnode) && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                },
                previousNode: function() {
                    var foundNode = pointer.vPrevious();
                    while (foundNode && !match(foundNode, true)) {
                        foundNode = foundNode.vPrevious();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                },
                previousSibling: function() {
                    var foundNode = pointer.vPrevious();
                    while (foundNode && !match(foundNode)) {
                        foundNode = foundNode.vPrevious();
                    }
                    foundNode && (pointer=foundNode);
                    return foundNode && foundNode.vElement;
                }
            };
            Object.defineProperties(treewalker, {
                'currentNode': {
                    get: function() {
                        return pointer.vElement;
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
                    value: vnode.vElement,
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

        /**
         * Reference to the first of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vFirstElement
         * @type vnode
         * @since 0.0.1
         */
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
        ElementPrototype.firstOfChildren = function(cssSelector) {
            var vnode = this.vnode;
            return vnode && vnode.firstOfChildren(cssSelector).vElement;
        };

        ElementPrototype.getAttribute = function(attributeName) {
            return this.vnode.attrs[attributeName] || null;
        };

        ElementPrototype.getData = function(key) {
            var vnode = this.vnode;
            return vnode._data && vnode._data[key];
        };

        ElementPrototype.getElementsByClassName = function(classNames) {
            var instance = this,
                vnode = instance.vnode;
            // modify classNames so it can be passed trhough to querySelectorAll:
            classNames = '.'+classNames.replace(/( )+/g, ' ').replace(/( )+/g, '.');
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_CLASSES || (vnode.LIFE_CLASSES={});
            return vnode.LIFE_CLASSES[classNames] || (vnode.LIFE_CLASSES[classNames]=instance.querySelectorAll(classNames));
        };

        ElementPrototype.getElementById = function(id) {
            var element = nodeids[id];
            if (element && !this.contains(element)) {
                // outside itself
                return null;
            }
            return element || null;
        };

        ElementPrototype.getElementsByName = function(name) {
            var instance = this,
                vnode = instance.vnode;
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_NAMES || (vnode.LIFE_NAMES={});
            return vnode.LIFE_NAMES[name] || (vnode.LIFE_NAMES[name]=instance.querySelectorAll('[name="'+name+'"]'));
        };

        ElementPrototype.getElementsByTagName = function(tagName) {
            var instance = this,
                vnode = instance.vnode;
            // reference is not stored on the domNode, but on the vnode:
            vnode.LIFE_TAGS || (vnode.LIFE_TAGS={});
            return vnode.LIFE_TAGS[tagName] || (vnode.LIFE_TAGS[tagName]=instance.querySelectorAll(tagName));
        };

        ElementPrototype.hasAttribute = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

        ElementPrototype.hasAttributes = function() {
            return !!this.vnode.attrs && (this.vnode.attrs.length > 0);
        };

        ElementPrototype.hasChildren = function() {
            return this.vnode.hasChildren();
        };

        ElementPrototype.hasClass = function(className) {
            return this.classList.contains(className);
        };

        ElementPrototype._insertAdjacentElement = ElementPrototype.insertAdjacentElement;
        ElementPrototype.insertAdjacentElement = function(position /* , element */) {
            var instance = this,
                vnode = instance.vnode,
                recheckNode = vnode.vParent;
            instance._insertAdjacentElement.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.vParent);
            recheckNode.checkNewChildren();
        };

        ElementPrototype._insertAdjacentHTML = ElementPrototype.insertAdjacentHTML;
        ElementPrototype.insertAdjacentHTML = function(position /*, html */) {
            var instance = this,
                vnode = instance.vnode,
                recheckNode = vnode.vParent;
            instance._insertAdjacentHTML.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.vParent);
            recheckNode.checkNewChildren();
        };

        ElementPrototype._insertAdjacentText = ElementPrototype.insertAdjacentText;
        ElementPrototype.insertAdjacentText = function(position /*, text */) {
            var instance = this,
                vnode = instance.vnode,
                recheckNode = vnode.vParent;
            instance._insertAdjacentText.apply(instance, arguments);
            ((position==='beforebegin') || (position==='afterend')) && recheckNode && (recheckNode=recheckNode.vParent);
            recheckNode.checkNewChildren();
        };

        ElementPrototype._insertBefore = ElementPrototype.insertBefore;
        ElementPrototype.insertBefore = function(newElement, refElement) {
            newElement.domNode || (newElement=vElement(newElement));
            refElement.domNode || (refElement=vElement(refElement));
            this._insertBefore(newElement.domNode, refElement.domNode);
            newElement.repositionVNode();
            newElement._updateLifeLists();
            return newElement;
        };

        /**
         * Reference to the last of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vLastElement
         * @type vnode
         * @since 0.0.1
         */
        ElementPrototype.last = function(cssSelector) {
            var vParent = this.vnode.vParent;
            return vParent && vParent.lastOfVChildren(cssSelector).vElement;
        };

        /**
         * Reference to the last vChild, where the related dom-node an Element (nodeType===1).
         *
         * @property vLastElementChild
         * @type vnode
         * @since 0.0.1
         */
        ElementPrototype.lastOfChildren = function(cssSelector) {
            var vnode = this.vnode;
            return vnode && vnode.lastOfChildren(cssSelector).vElement;
        };

        ElementPrototype.matchesSelector = function(selectors) {
            return this.vnode.matchesSelector(selectors);
        };

        /**
         * Reference to the next of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vNextElement
         * @type vnode
         * @since 0.0.1
         */
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

        ElementPrototype.normalize = function() {
            // make it a void function --> vnode.js already mades every additional TextNode to be inserted normalized
        };

        /**
         * Reference to the previous of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vPreviousElement
         * @type vnode
         * @since 0.0.1
         */
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

        ElementPrototype.querySelectorAll = function(selectors) {
            var found = [],
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

        ElementPrototype._removeAttribute = ElementPrototype.removeAttribute;
        ElementPrototype.removeAttribute = function(attributeName) {
            var instance = this,
                vnode = this.vnode;
            instance._removeAttribute.apply(instance, arguments);
            delete vnode.attrs[attributeName];
            (attributeName==='className') && instance._updateLifeClassLists(instance, true);
            (attributeName==='name') && instance._updateLifeNamesList(instance, true);
        };

        ElementPrototype.removeAttributeNode = function(attributeNode) {
            this.removeAttribute(attributeNode.value);
        };

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

        ElementPrototype.removeClass = function(className) {
            var instance = this;
            instance.classList.remove(className);
            return instance;
        };

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

        ElementPrototype._setAttribute = ElementPrototype.setAttribute;
        ElementPrototype.setAttribute = function(attributeName, value) {
            var instance = this;
            instance._setAttribute.apply(instance, arguments);
            this.vnode.attrs[attributeName] = value;
            (attributeName==='className') && instance._updateLifeClassLists(instance);
            (attributeName==='name') && instance._updateLifeNamesList(instance);
            return value;
        };

        ElementPrototype.setAttributeNode = function(attributeNode) {
            this.setAttribute(attributeNode.name, attributeNode.value);
        };

        ElementPrototype.setClass = function(className) {
            var instance = this;
            instance.classList.add(className);
            return instance;
        };

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
        ElementPrototype._updateLifeLists = function(removed) {
            var instance = this;
            NS.LIFE_PROPERTIES[instance.tag] && instance._updateLifeProps(removed);
            instance._updateLifeClassLists(removed);
            instance._updateLifeTagsLists(removed);
            instance._updateLifeNamesList(removed);
        };

        /**
         * Reference to the vnode-object that represents the vElement
         *
         * @property vnode
         * @type vnode
         * @since 0.0.1
         */
        Object.defineProperty(ElementPrototype, 'vnode', {
           get: function() {
                    var instance = this,
                        vnode = instance.domNode && nodesMap.get(instance.domNode),
                        parentNode, parentVNode, index;
                    if (!vnode && (parentNode=instance.parentNode)) {
                        parentVNode = parentNode.vnode;
                        vnode = domNodeToVNode(instance, parentVNode);
                        // set the vnode at the right position of its children:
                        index = arrayIndexOf.call(parentNode.childNodes, instance);
                        vnode.moveToParent(parentVNode, index);
                    }
                    return vnode;
                }
        });

    }(window.Element.prototype));

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
                    nodes = [],
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
                    nodes = [],
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
                        // note: `this` is the returned object which is NOT the Elementinstance.
                        // May be an Array of classNames, which all needs to be present.
                        return vnode.hasClass(className);
                    }
                };
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