"use strict";

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
 * @submodule vnode
 * @class vnode
 * @since 0.0.1
*/

require('./element-array');

module.exports = function (window) {

    var NS = require('./vdom-ns.js')(window),
        nodeids = NS.nodeids,
        nodesMap = NS.nodesMap,
        htmlToVNodes = require('./html-parser.js')(window),
        STRING = 'string',
        /**
         * Object to gain quick access to attribute-name end-tokens.
         *
         * @property END_ATTRIBUTENAME
         * @default {
         *      '=': true,
         *      ']': true
         *  }
         * @type Object
         * @protected
         * @since 0.0.1
         */
        END_ATTRIBUTENAME = {
            '=': true,
            ']': true
        },
        /**
         * Object to gain quick access to different changes of Element nodeType changes.
         *
         * @property NODESWITCH
         * @default {
         *      1: {
         *          1: 1,
         *          3: 2,
         *          8: 3
         *      },
         *      3: {
         *          1: 4,
         *          3: 5,
         *          8: 6
         *      },
         *      8: {
         *          1: 7,
         *          3: 8,
         *          8: 9
         *      }
         *  }
         * @type Object
         * @protected
         * @since 0.0.1
         */
        NODESWITCH = {
            1: {
                1: 1, // oldNodeType==Element, newNodeType==Element
                3: 2, // oldNodeType==Element, newNodeType==TextNode
                8: 3  // oldNodeType==Element, newNodeType==Comment
            },
            3: {
                1: 4, // oldNodeType==TextNode, newNodeType==Element
                3: 5, // oldNodeType==TextNode, newNodeType==TextNode
                8: 6  // oldNodeType==TextNode, newNodeType==Comment
            },
            8: {
                1: 7, // oldNodeType==Comment, newNodeType==Element
                3: 8, // oldNodeType==Comment, newNodeType==TextNode
                8: 9  // oldNodeType==Comment, newNodeType==Comment
            }
        },
        /**
         * Object to gain quick access to selector start-tokens.
         *
         * @property SELECTOR_IDENTIFIERS
         * @default {
         *      '#': 1,
         *      '.': 2,
         *      '[': 3
         *  }
         * @type Object
         * @protected
         * @since 0.0.1
         */
        SELECTOR_IDENTIFIERS = {
            '#': 1,
            '.': 2,
            '[': 3
        },
        _matchesSelectorItem, _matchesOneSelector, _findElementSibling, vNodeProto, _findNodeSibling, _escape;

   /**
    * Searches for the next -or previous- node-sibling (nodeType of 1, 3 or 8).
    *
    * @method _findNodeSibling
    * @param vnode {Object} the vnode to inspect
    * @param [next] {Boolean} whether to search for the next, or previous match.
    * @return {Object|null} the vnode that matches the search
    * @protected
    * @private
    * @since 0.0.1
    */
    _findNodeSibling = function(vnode, next) {
        var vParent = vnode.vParent,
            index;
        if (!vParent) {
            return null;
        }
        index = vParent.vChildNodes.indexOf(vnode) + (next ? 1 : -1);
        return vParent.vChildNodes[index] || null;
    };

   /**
    * Searches for the next -or previous- Element-sibling (nodeType of 1).
    *
    * @method _findElementSibling
    * @param vnode {Object} the vnode to inspect
    * @param [next] {Boolean} whether to search for the next, or previous match.
    * @return {Object|null} the vnode that matches the search
    * @protected
    * @private
    * @since 0.0.1
    */
    _findElementSibling = function(vnode, next) {
        var vParent = vnode.vParent,
            index;
        if (!vParent) {
            return null;
        }
        index = vParent.vChildren.indexOf(vnode) + (next ? 1 : -1);
        return vParent.vChildren[index] || null;
    };

   /**
    * Check whether the vnode matches the css-selector. the css-selector should be a single selector,
    * not multiple, so it shouldn't contain a `comma`.
    *
    * @method _matchesOneSelector
    * @param vnode {Object} the vnode to inspect
    * @param selectorItem {String} the selector-item to check the match for
    * @return {Boolean} whether the vnode matches the css-selector
    * @protected
    * @private
    * @since 0.0.1
    */
    _matchesOneSelector = function(vnode, selector) {
        var size, selList, i, selectorItem, selMatch, len;

        selList = selector;
        (selList.indexOf('  ')===-1) || (selList=selector.replace(/( )+/g, ' '));
        (selList[0]===' ') && (selList=selList.substr(1));
        len = selList.length;
        (selList[len-1]===' ') && (selList=selList.substr(0, len-1));
        selList = selList.split(' ');
        size = selList.length;

        if (size===0) {
            return false;
        }

        selectorItem = selList[size-1];
        selMatch = _matchesSelectorItem(vnode, selectorItem);
        for (i=size-2; (selMatch && (i>=0)); i--) {
            selectorItem = selList[i];
            vnode = vnode.vParent;
            while (vnode && !(selMatch=_matchesSelectorItem(vnode, selectorItem))) {
                vnode = vnode.vParent;
            }
        }
        return selMatch;
    };

   /**
    * Check whether the vnode matches one specific selector-item. Suppose the css-selector: "#mynode li.red .blue"
    * then there are 3 selector-items: "#mynode",  "li.red" and ".blue"
    *
    * @method _matchesSelectorItem
    * @param vnode {Object} the vnode to inspect
    * @param selectorItem {String} the selector-item to check the match for
    * @return {Boolean} whether the vnode matches the selector-item
    * @protected
    * @private
    * @since 0.0.1
    */
    _matchesSelectorItem = function (vnode, selectorItem) {
        var i = 0,
            len = selectorItem.length,
            character = selectorItem[0],
            tagName, id, className, attributeName, attributeValue, stringMarker, attributeisString, isBoolean, checkBoolean;

        if (!!SELECTOR_IDENTIFIERS[character]) {
            // starts with tagName
            tagName = '';
            // reposition i to continue in the right way:
            i--;
            while ((++i<len) && (character=selectorItem[i]) && !SELECTOR_IDENTIFIERS[character]) {
                tagName += character;
            }
            if (tagName.toUpperCase()!==vnode.tag) {
                return false;
            }
        }
        while (i<len) {
            switch (character) {
                case '#':
                    id = '';
                    while ((++i<len) && (character=selectorItem[i]) && !SELECTOR_IDENTIFIERS[character]) {
                        id += character;
                    }
                    if (id!==vnode.id) {
                        return false;
                    }
                    break;
                case '.':
                    className = '';
                    while ((++i<len) && (character=selectorItem[i]) && !SELECTOR_IDENTIFIERS[character]) {
                        className += character;
                    }
                    if (!vnode.hasClass(className)) {
                        return false;
                    }
                    break;
                case '[':
                    attributeName = '';
                    while ((++i<len) && (character=selectorItem[i]) && !END_ATTRIBUTENAME[character]) {
                        attributeName += character;
                    }
                    // if character===']' then we have an attribute without a value-definition
                    if (!vnode.attrs[attributeName] || ((character===']') && (vnode.attrs[attributeName]!==''))) {
                        return false;
                    }
                    // now we read the value of the attribute:
                    attributeValue = '';
                    stringMarker = selectorItem[i+1];
                    attributeisString = (stringMarker==='"') || (stringMarker==="'");
                    attributeisString && (i++);

                    // end of attributaValue = (character===']') && (!attributeisString || (selectorItem[i]===stringMarker))
                    while ((++i<len) && (character=selectorItem[i]) && !((character===']') && (!attributeisString || (selectorItem[i]===stringMarker)))) {
                        attributeValue += character;
                    }

                    if (attributeisString) {
                        // if attribute is string, then we need to _remove to last stringmarker
                        attributeValue = attributeValue.substr(attributeValue.length-1);
                    }
                    else {
                        // if attribute is no string, then we need to typecast its value
                        isBoolean = ((attributeValue.length>3) && (attributeValue.length<6) &&
                                     (checkBoolean=attributeValue.toUpperCase()) &&
                                     ((checkBoolean==='FALSE') || (checkBoolean==='TRUE')));
                        // typecast the value to either Boolean or Number:
                        attributeValue = isBoolean ? (checkBoolean==='TRUE') : parseFloat(attributeValue);
                    }

                    if (vnode.attrs[attributeName]!==attributeValue) {
                        return false;
                    }

                    // we still need to increase one position:
                    (++i<len) && (character=selectorItem[i]);
            }
        }
        return true;
    };

    vNodeProto = {
       /**
        * Check whether the vnode's domNode is equal, or contains the specified VElement.
        *
        * @method contains
        * @return {Boolean} whether the vnode's domNode is equal, or contains the specified VElement.
        * @since 0.0.1
        */
        contains: function(VElement) {
            var otherVNode = this.getVNode(VElement);
            while (otherVNode && (otherVNode!==this)) {
                otherVNode = otherVNode.vParent;
            }
            return (otherVNode===this);
        },

       /**
        * Returns the first child-vnode (if any). The child represents an Element (nodeType===1).
        *
        * @method firstOfVChildren
        * @param cssSelector {String} one or more css-selectors
        * @return {Object|null} the first child-vnode or null when not present
        * @since 0.0.1
        */
        firstOfVChildren: function(cssSelector) {
            var instance = this,
                found, i, len, vChildren, element;
            if (!cssSelector) {
                return instance.vFirstElementChild;
            }
            vChildren = instance.vChildren;
            len = vChildren.length;
            for (i=0; !found && (i<len); i++) {
                element = vChildren[i];
                element.matchesSelector(cssSelector) && (found=element);
            }
            return found || null;
        },

       /**
        * Checks whether the vnode has any vChildNodes (nodeType of 1, 3 or 8).
        *
        * @method hasChildNodes
        * @return {Boolean} whether the vnode has any vChildNodes.
        * @since 0.0.1
        */
        hasChildNodes: function() {
            return this.vChildNodes && (this.vChildNodes.length>0);
        },

       /**
        * Checks whether the vnode has any vChildren (vChildNodes with nodeType of 1).
        *
        * @method hasChildren
        * @return {Boolean} whether the vnode has any vChildren.
        * @since 0.0.1
        */
        hasChildren: function() {
            return (this.vChildren.length>0);
        },

       /**
        * Checks whether the className is present on the vnode.
        *
        * @method hasClass
        * @param className {String|Array} the className to check for. May be an Array of classNames, which all needs to be present.
        * @return {Boolean} whether the className (or classNames) is present on the vnode
        * @since 0.0.1
        */
        hasClass: function(className) {
            var instance = this,
                check = function(cl) {
                    return !!instance.classNames[cl];
                };
            if (!instance.classNames) {
                return false;
            }
            if (typeof className === STRING) {
                return check(className);
            }
            else if (Array.isArray(className)) {
                return className.every(check);
            }
            return false;
        },

       /**
        * Returns the last child-vnode (if any). The child represents an Element (nodeType===1).
        *
        * @method firstOfVChildren
        * @param cssSelector {String} one or more css-selectors
        * @return {Object|null} the last child-vnode or null when not present
        * @since 0.0.1
        */
        lastOfVChildren: function(cssSelector) {
            var vChildren = this.vChildren,
                found, i, element;
            if (vChildren) {
                if (!cssSelector) {
                    return this.vLastElementChild;
                }
                for (i=vChildren.length-1; !found && (i>0); i--) {
                    element = vChildren[i];
                    element.matchesSelector(cssSelector) && (found=element);
                }
            }
            return found;
        },

       /**
        * Checks whether the vnode matches one of the specified selectors. `selectors` can be one, or multiple css-selectors,
        * separated by a `comma`. For example: "#myid li.red blue" is one selector, "div.red, div.blue, div.green" are three selectors.
        *
        * @method matchesSelector
        * @param selectors {String} one or more css-selectors
        * @return {Boolean} whether the vnode matches one of the selectors
        * @since 0.0.1
        */
        matchesSelector: function(selectors) {
            var instance = this;
            selectors = selectors.split(',');
            // we can use Array.some, because there won't be many separated selectoritems,
            // so the final invocation won't be delayed much compared to looping
            return selectors.some(function(selector) {
                return _matchesOneSelector(instance, selector);
            });
        },

       /**
        * Syncs the vnode's definition with `NS-vdom.nodesMap` and the nodeid (if available) inside `NS-vdom.nodeids`.
        *
        * Does NOT sync with the dom. Can be invoked multiple times without issues.
        *
        * @method store
        * @chainable
        * @since 0.0.1
        */
        store: function() {
            // store node/vnode inside WeakMap:
            var instance = this;
            nodesMap.set(instance.vElement.domNode, instance);
            // if valid id, then store the DOMnodeRef inside internal hash
            instance.id ? (nodeids[instance.id]=instance.vElement) : (delete nodeids[instance.id]);
            return instance;
        },

        //---- private ------------------------------------------------------------------

       /**
        * Checks the actual dom childNodes for any new childNode that isn't virtualized yet.
        * It creates new vnodes for all its new children.
        *
        * @method _moveToParent
        * @private
        * @chainable
        * @since 0.0.1
        */
        _checkNewChildren: function() {
            // getVNode() will create and insert new vNodes when they are not present yet
            var instance = this,
                childNodes = instance.vElement.childNodes,
                len = childNodes.length, i;
            for (i=0; i<len; i++) {
                childNodes[i].vnode;
            }
            instance._normalize();
        },

       /**
        * Removes the vnode from its parent vChildNodes- and vChildren-list.
        *
        * Does NOT sync with the dom.
        *
        * @method _deleteFromParent
        * @private
        * @chainable
        * @since 0.0.1
        */
        _deleteFromParent: function() {
            var instance = this;
            instance.vParent.vChildNodes._remove(instance);
            // force to recalculate the vChildren on a next call:
            (instance.nodeType===1) && (instance.vParent._children=null);
            return instance;
        },

       /**
        * Moves the vnode from its current parent.vChildNodes list towards a new parent vnode at the specified position.
        *
        * Does NOT sync with the dom.
        *
        * @method _moveToParent
        * @private
        * @chainable
        * @since 0.0.1
        */
        _moveToParent: function(parentVNode, index) {
            var instance = this,
                vParent = instance.vParent;
            instance._deleteFromParent();
            instance.vParent = parentVNode;
            parentVNode.vChildNodes.insertAt(instance, index);
            // force to recalculate the vChildren on a next call:
            if (instance.nodeType===1) {
                vParent._children = null;
                parentVNode._children = null;
            }
            return instance;
        },

       /**
        * Removes empty TextNodes and merges following TextNodes inside the vnode.
        *
        * Syncs with the dom.
        *
        * @method _normalize
        * @return {Boolean} whether the vnode's domNode is equal, or contains the specified VElement.
        * @private
        * @chainable
        * @since 0.0.1
        */
        _normalize: function() {
            var instance = this,
                domNode = instance.vElement.domNode,
                vChildNodes = instance.vChildNodes,
                i, preChildNode, vChildNode;
            if (vChildNodes) {
                for (i=vChildNodes.length-1; i>=0; i--) {
                    vChildNode = vChildNodes[i];
                    preChildNode = vChildNodes[i-1]; // i will get the value `-1` eventually, which leads into undefined preChildNode
                    if (vChildNode.nodetype===3) {
                        if (vChildNode.text==='') {
                            domNode._removeChild(vChildNode.vElement.domNode);
                            vChildNode._remove();
                        }
                        else if (preChildNode.nodetype===3) {
                            preChildNode.text += vChildNode.text;
                            preChildNode.vElement.domNode.nodeValue = preChildNode.text;
                            domNode._removeChild(vChildNode.vElement.domNode);
                            vChildNode._remove();
                        }
                    }
                }
            }
            return instance;
        },

       /**
        * Removes the vnode and all its vnode-vChildNodes from its definitions inside `NS-vdom.nodesMap`
        * and their nodeid (if available) inside `NS-vdom.nodeids`.
        *
        * Does NOT sync with the dom.
        *
        * @method _remove
        * @private
        * @chainable
        * @since 0.0.1
        */
        _remove: function() {
            var instance = this,
                vChildNodes = instance.vChildNodes,
                len, i, vChildNode;
            // first: _remove all its vChildNodes
            if (instance.nodeType===1) {
                len = vChildNodes.length;
                for (i=0; i < len; i++) {
                    vChildNode = vChildNodes[i];
                    vChildNode._remove();
                }
            }
            instance._children = null;
            // _remove node/vnode from WeakMap:
            nodesMap.delete(instance.vElement.domNode);
            // explicitely set instance.vElement to null in order to prevent problems with the GC
            instance.vElement = null;
            // if valid id, then _remove the DOMnodeRef from internal hash
            instance.id && delete nodeids[instance.id];
            instance._deleteFromParent();
            return instance;
        },

       /**
        * Replaces the current vnode by the one that is specified at the parent.vChildNode list.
        *
        * Does NOT sync with the dom.
        *
        * @method _replaceAtParent
        * @param newVNode {Object} the new vnode which should take over the place of the current vnode
        * @private
        * @chainable
        * @since 0.0.1
        */
        _replaceAtParent: function(newVNode) {
            var instance = this,
                vParent = instance.vParent,
                vChildNodes, index;
            if (vParent) {
                vChildNodes = vParent.vChildNodes;
                index = vChildNodes.indexOf(instance);
                // force to recalculate the vChildren on a next call:
                ((instance.nodeType===1) || (newVNode.nodeType===1)) && (instance.vParent._children=null);
                vChildNodes[index] = newVNode;
            }
            return instance._remove();
        },

       /**
        * Redefines the attributes of both the vnode as well as its related dom-node. The new
        * definition replaces any previous attributes (without touching unmodified attributes).
        *
        * Syncs the new vnode's attributes with the dom.
        *
        * @method _setAttrs
        * @param newAttrs {Object|Array} the new attributes to be set
        * @private
        * @chainable
        * @since 0.0.1
        */
        _setAttrs: function(newAttrs) {
            // does sync the DOM
            var instance = this,
                attrsObj, vElement, attr, attrs, id, i, key, keys, len, value, classNames, classes;
            if (instance.nodeType!==1) {
                return;
            }
            vElement = instance.vElement;
            attrs = instance.attrs;
            if (Object.isObject(newAttrs)) {
                attrsObj = newAttrs;
            }
            else {
                attrsObj = {};
                len = newAttrs.length;
                for (i=0; i<len; i++) {
                    attr = newAttrs[i];
                    attrsObj[attr.name] = attr.value;
                }
            }

            // first _remove the attributes that are no longer needed.
            // quickest way for object iteration: http://jsperf.com/object-keys-iteration/20
            keys = Object.keys(attrs);
            len = keys.length;
            for (i = 0; i < len; i++) {
                key = keys[i];
                if (!attrsObj[key]) {
                    // attribute not in the new definition
                    vElement.__removeAttribute(key);
                    delete attrs[key];
                }
            }

            // next: every attribute that differs: redefine
            keys = Object.keys(attrsObj);
            len = keys.length;
            for (i = 0; i < len; i++) {
                key = keys[i];
                value = attrsObj[key];
                if (attrs[key]!==value) {
                    // different: redefine
                    vElement._setAttribute(key, value);
                    attrs[key] = value;
                }
            }

            // reset node's id:
            id = instance.id = attrs.id;
            // if valid id, then store the DOMnodeRef inside internal hash
            (id && vElement) ? (nodeids[id]=vElement) : (delete nodeids[id]);

            classNames = vnode.classNames = {};
/*jshint boss:true */
            if (classes=vnode.attrs['class']) {
/*jshint boss:false */
                classes = classes.split(' ');
                len = classes.length;
                for (i=0; i<len; i++) {
                    classNames[classes[i]] = true;
                }
            }

            return instance;
        },

       /**
        * Redefines the childNodes of both the vnode as well as its related dom-node. The new
        * definition replaces any previous nodes. (without touching unmodified nodes).
        *
        * Syncs the new vnode's childNodes with the dom.
        *
        * @method _setChildNodes
        * @param newVChildNodes {Array} array with vnodes which represent the new childNodes
        * @private
        * @chainable
        * @since 0.0.1
        */
        _setChildNodes: function(newVChildNodes) {
            // does sync the DOM
            var instance = this,
                vChildNodes = instance.vChildNodes,
                vElement = instance.vElement,
                i, oldChild, newChild, newLength, len, newChildExtNode, childExtNode,
                j, attrs, attrsLen, attribute, newAttrs, nodeswitch;

            // first: reset _children --> by making it empty, its getter will refresh its list on a next call
            instance._children = null;
            // quickest way to loop through array is by using for loops: http://jsperf.com/array-foreach-vs-for-loop/5
            len = vChildNodes.length;
            newLength = newVChildNodes.length;
            for (i=0; i<len; i++) {
                oldChild = vChildNodes[i];
                childExtNode = oldChild.vElement;
                if (i < newLength) {
                    newChild = newVChildNodes[i];
/*jshint boss:true */
                    switch (nodeswitch=NODESWITCH[oldChild.nodeType][newChild.nodeType]) {
/*jshint boss:false */
                        case 1: // oldNodeType==Element, newNodeType==Element
                            if ((oldChild.tag!==newChild.tag) || ((oldChild.tag==='SCRIPT') && (oldChild.text!==newChild.text))) {
                                // new tag --> completely replace
                                newChildExtNode = window.document.createElement(newChild.tag);
                                attrs = newChild.attrs;
                                attrsLen = attrs.length;
                                for (j=0; j<attrsLen; j++) {
                                    attribute = attrs[j];
                                    newChildExtNode._setAttribute(attribute.name, attribute.value);
                                }
                                newChild._setChildNodes(newChild.vChildNodes);
                                vElement._replaceChild(newChildExtNode, childExtNode);
                                newChild.vParent = instance;
                                nodesMap.set(newChildExtNode.domNode, newChild);
                                newChild.id  && (nodeids[newChild.id]=newChildExtNode);
                                oldChild._replaceAtParent(newChild);
                                newChildExtNode._updateLifeLists();
                                oldChild.vElement._updateLifeLists(true);
                            }
                            else {
                                // same tag --> only update what is needed
                                attrs = oldChild.attrs;
                                newAttrs = newChild.attrs;
                                attrsLen = attrs.length;
                                // first _remove any attributes that are no longer there:
                                for (j=0; j<attrsLen; j++) {
                                    attribute = attrs[j];
                                    newAttrs[attribute.name] || childExtNode.__removeAttribute(attribute.name);
                                }
                                // next: add or replace different attributes:
                                attrsLen = newAttrs.length;
                                for (j=0; j<attrsLen; j++) {
                                    attribute = newAttrs[j];
                                    if (!attrs[attribute.name] && (attrs[attribute.name]!==attribute.value)) {
                                        childExtNode._setAttribute(attribute.name, attribute.value);
                                    }
                                }
                                oldChild.attrs = newChild.attrs;
                                // next: sync the vChildNodes:
                                newChild._setChildNodes(newChild.vChildNodes);
                                newChild.attrs['class'] && newChild.vElement._updateLifeClassLists();
                                oldChild.attrs['class'] && oldChild.vElement._updateLifeClassLists(true);
                                newChild.attrs.name && newChild.vElement._updateLifeNamesList();
                                oldChild.attrs.name && oldChild.vElement._updateLifeNamesList(true);
                            }
                            break;
                        case 2: // oldNodeType==Element, newNodeType==TextNode
                            newChildExtNode = window.document.createTextNode(newChild.text);
                            vElement._replaceChild(newChildExtNode, childExtNode);
                            newChild.vParent = instance;
                            nodesMap.set(newChildExtNode.domNode, newChild);
                            oldChild._replaceAtParent(newChild);
                            oldChild.vElement._updateLifeLists(true);
                            break;
                        case 3: // oldNodeType==Element, newNodeType==Comment
                            newChildExtNode = window.document.createComment(newChild.text);
                            vElement._replaceChild(newChildExtNode, childExtNode);
                            newChild.vParent = instance;
                            nodesMap.set(newChildExtNode.domNode, newChild);
                            oldChild._replaceAtParent(newChild);
                            oldChild.vElement._updateLifeLists(true);
                            break;
                        case 4: // oldNodeType==TextNode, newNodeType==Element
                                // case4 and case7 should be treated the same
                        case 7: // oldNodeType==Comment, newNodeType==Element
                                nodesMap.delete(childExtNode.domNode);
                                newChildExtNode = window.document.createElement(newChild.tag);

                                attrs = newChild.attrs;
                                attrsLen = attrs.length;

                                for (j=0; j<attrsLen; j++) {
                                    attribute = attrs[j];
                                    newChildExtNode._setAttribute(attribute.name, attribute.value);
                                }

                                newChild._setChildNodes(newChild.vChildNodes);
                                vElement._replaceChild(newChildExtNode, childExtNode);
                                nodesMap.set(newChildExtNode.domNode, newChild);

                                newChild.id && (nodeids[newChild.id]=newChildExtNode);

                                oldChild.isVoid = newChild.isVoid;
                                delete oldChild.text;
                                newChildExtNode._updateLifeLists();
                            break;

                        case 5: // oldNodeType==TextNode, newNodeType==TextNode
                                // case5 and case8 should be treated the same
                        case 8: // oldNodeType==Comment, newNodeType==TextNode
                            if (oldChild.text !== newChild.text) {
                                nodesMap.delete(childExtNode.domNode);
                                newChildExtNode = window.document.createTextNode(newChild.text);
                                vElement._replaceChild(newChildExtNode, childExtNode);
                                nodesMap.set(newChildExtNode.domNode, newChild);
                                oldChild.text = newChild.text;
                            }
                            break;
                        case 6: // oldNodeType==TextNode, newNodeType==Comment
                                // case6 and case9 should be treated the same
                        case 9: // oldNodeType==Comment, newNodeType==Comment
                            if (oldChild.text !== newChild.text) {
                                nodesMap.delete(childExtNode.domNode);
                                newChildExtNode = window.document.createComment(newChild.text);
                                vElement._replaceChild(newChildExtNode, childExtNode);
                                nodesMap.set(newChildExtNode.domNode, newChild);
                                oldChild.text = newChild.text;
                            }
                    }
                    if ((nodeswitch===2) || (nodeswitch===5) || (nodeswitch===8)) {
                        instance._normalize();
                    }
                }
                else {
                    // _remove previous definition
                    oldChild._remove();
                    vElement.__removeChild(oldChild.vElement);
                }
            }
            // now we add all new vChildNodes that go beyond `len`:
            for (i = len; i < newLength; i++) {
                newChild = newVChildNodes[i];
                newChild.vParent = instance;
                switch (newChild.nodeType) {
                    case 1: // Element
                        newChildExtNode = window.document.createElement(newChild.tag);
                        attrs = newChild.attrs;
                        attrsLen = attrs.length;
                        for (j=0; j<attrsLen; j++) {
                            attribute = attrs[j];
                            newChildExtNode._setAttribute(attribute.name, attribute.value);
                        }
                        newChild._setChildNodes(newChild.vChildNodes);
                        vElement._appendChild(newChildExtNode);
                        newChild.vElement = newChildExtNode;
                        newChildExtNode._updateLifeLists();
                        break;
                    case 3: // TextNode
                        newChildExtNode = window.document.createTextNode(newChild.text);
                        vElement._appendChild(newChildExtNode);
                        break;
                    case 8: // CommentNode
                        newChildExtNode = window.document.createComment(newChild.text);
                        vElement._appendChild(newChildExtNode);
                }
                newChild.store();
            }
            return instance;
        }

    };


    //---- properties ------------------------------------------------------------------

    /**
     * A hash of all the `attributes` of the vnode's representing dom-node.
     *
     * @property attrs
     * @type Object
     * @since 0.0.1
     */

    /**
     * Hash with all the classes of the vnode. Every class represents a key, all values are set `true`.
     *
     * @property classNames
     * @type Object
     * @since 0.0.1
     */

    /**
     * The `id` of the vnode's representing dom-node (if any).
     *
     * @property id
     * @type String
     * @since 0.0.1
     */

    /**
     * Tells whether tag is a void Element. Examples are: `br`, `img` and `input`. Non-void Elements are f.e. `div` and `table`.
     * For TextNodes and CommentNodes, this property is `undefined`.
     *
     * @property isVoid
     * @type Boolean
     * @since 0.0.1
     */

    /**
     * The `nodeType` of the vnode's representing dom-node (1===ElementNode, 3===TextNode, 8===CommentNode).
     *
     * @property nodeType
     * @type Number
     * @since 0.0.1
     */

    /**
     * The `tag` of the vnode's representing dom-node (allways uppercase).
     *
     * @property tag
     * @type String
     * @since 0.0.1
     */

    /**
     * The `content` of the vnode's representing dom-node, in case it is a TextNode or CommentNode.
     * Equals dom-node.nodeValue.
     *
     * Is `undefined` for ElementNodes.
     *
     * @property text
     * @type String
     * @since 0.0.1
     */

    /**
     * Hash with all the childNodes (vnodes). vChildNodes are any kind of vnodes (nodeType===1, 3 or 8)
     *
     * @property vChildNodes
     * @type Array
     * @since 0.0.1
     */

    /**
     * The underlying `dom-node` that the vnode represents.
     *
     * @property vElement
     * @type VElement
     * @since 0.0.1
     */

    /**
     * vnode's parentNode (defined as a vnode itself).
     *
     * @property vParent
     * @type vnode
     * @since 0.0.1
     */

    Object.defineProperties(vNodeProto, {

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
                var instance = this,
                    html = '',
                    vChildNodes = instance.vChildNodes,
                    len = vChildNodes.length,
                    i, vChildNode;
                for (i=0; i<len; i++) {
                    vChildNode = vChildNodes[i];
                    html += (vChildNode.nodeType===1) ? vChildNode.outerHTML : (vChildNode.text || '');
                }
                return html;
            },
            set: function(v) {
                this._setChildNodes(htmlToVNodes(v));
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
                var instance = this;
                return ((instance.nodeType===3) || (instance.nodeType===3)) ? instance.text : '';
            },
            set: function(v) {
                var instance = this;
                if ((instance.nodeType===3) || (instance.nodeType===8)) {
                    instance.vElement.domNode.textContent = v;
                    // set .text AFTER the dom-node is updated --> the content might be escaped!
                    instance.text = instance.vElement.domNode.textContent;
                }
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
                var instance = this,
                    html = '',
                    attrs = instance.attrs,
                    len = attrs.length,
                    attribute, i;
                if (instance.nodeType!==1) {
                    return instance.textContent;
                }
                html = '<' + instance.tag;
                for (i=0; i<len; i++) {
                    attribute = attrs[i];
                    html += ' '+attribute.name+'="'+attribute.value+'"';
                }
                html += '>';
                if (!instance.isVoid) {
                    html += instance.innerHTML + '</' + instance.tag + '>';
                }
                return html;
            },
            set: function(v) {
                var instance = this,
                    vnode, newElement;
                if (instance.nodeType!==1) {
                    return;
                }
                vnode = htmlToVNodes(v);
                if (vnode.nodeType===1) {
                    if (vnode.tag!==instance.tag) {
                        instance.tag = vnode.tag;
                        instance.isVoid = vnode.isVoid;
                        nodesMap.delete(instance.vElement.domNode);
                        instance.id && delete nodeids[instance.id];
                        newElement = window.document.createElement(vnode.tag);
                        instance.vParent.vElement.replaceChild(newElement);
                        instance.vElement = newElement;
                        nodesMap.set(newElement.domNode, vnode);
                    }
                    instance._setAttrs(vnode.attrs);
                    instance._setChildNodes(vnode.vChildNodes);
                }
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
                var instance = this,
                    text = '',
                    vChildNodes = instance.vChildNodes,
                    len = vChildNodes.length,
                    i, vChildNode;
                for (i=0; i<len; i++) {
                    vChildNode = vChildNodes[i];
                    text += (vChildNode.nodeType===3) ? vChildNode.text : ((vChildNode.nodeType===1) ? vChildNode.textContent : '');
                }
                return text;
            },
            set: function(v) {
                var instance = this,
                    vElement = instance.vElement,
                    vChildNodes, len, i, vChildNode;
                instance.vElement.domNode.textContent = v;
                // set .text AFTER the dom-node is updated --> the content might be escaped!
                instance.text = instance.vElement.domNode.textContent;
                if (vChildNodes) {
                    vChildNodes = instance.vChildNodes;
                    len = vChildNodes.length;
                    for (i=0; i<len; i++) {
                        vChildNode = vChildNodes[i];
                        vElement.__removeChild(vChildNode.vElement.domNode);
                        vChildNode._remove();
                    }
                }
            }
        },

        /**
         * Hash with all the children (vnodes). vChildren are vnodes that have a representing dom-node that is an HtmlElement (nodeType===1)
         *
         * @property vChildren
         * @type Array
         * @since 0.0.1
         */
        vChildren: {
            get: function() {
                var instance = this,
                    children = instance._children,
                    vChildNode, vChildNodes, i, len;
                if (!children) {
                    children = instance._children = new ElementArray();
                    vChildNodes = instance.vChildNodes;
                    len = vChildNodes.length;
                    for (i=0; i<len; i++) {
                        vChildNode = vChildNodes[i];
                        (vChildNode.nodeType===1) && (children[children.length]=vChildNode);
                    }
                }
                return children;
            }
        },

        /**
         * Reference to the first of sibbling vNode's, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vFirst
         * @type vnode
         * @since 0.0.1
         */
        vFirst: {
            get: function() {
                var vParent = this.vParent;
                if (!vParent) {
                    return null;
                }
                return vParent.vFirstChild;
            }
        },

        /**
         * Reference to the first vChildNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vFirstChild
         * @type vnode
         * @since 0.0.1
         */
        vFirstChild: {
            get: function() {
                return (this.vChildNodes && this.vChildNodes[0]) || null;
            }
        },

        /**
         * Reference to the first of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vFirstElement
         * @type vnode
         * @since 0.0.1
         */
        vFirstElement: {
            get: function() {
                var vParent = this.vParent;
                if (!vParent) {
                    return null;
                }
                return vParent.vFirstElementChild;
            }
        },

        /**
         * Reference to the first vChild, where the related dom-node an Element (nodeType===1).
         *
         * @property vFirstElementChild
         * @type vnode
         * @since 0.0.1
         */
        vFirstElementChild: {
            get: function() {
                return this.vChildren[0] || null;
            }
        },

        /**
         * Reference to the last of sibbling vNode's, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vLast
         * @type vnode
         * @since 0.0.1
         */
        vLast: {
            get: function() {
                var vParent = this.vParent;
                if (!vParent) {
                    return null;
                }
                return vParent.vLastChild;
            }
        },

        /**
         * Reference to the last vChildNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vLastChild
         * @type vnode
         * @since 0.0.1
         */
        vLastChild: {
            get: function() {
                var vChildNodes = this.vChildNodes;
                return (vChildNodes && vChildNodes[vChildNodes.length-1]) || null;
            }
        },

        /**
         * Reference to the last of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vLastElement
         * @type vnode
         * @since 0.0.1
         */
        vLastElement: {
            get: function() {
                var vParent = this.vParent;
                if (!vParent) {
                    return null;
                }
                return vParent.vLastElementChild;
            }
        },

        /**
         * Reference to the last vChild, where the related dom-node an Element (nodeType===1).
         *
         * @property vLastElementChild
         * @type vnode
         * @since 0.0.1
         */
        vLastElementChild: {
            get: function() {
                var vChildren = this.vChildren;
                return vChildren[vChildren.length-1] || null;
            }
        },

        /**
         * Reference to the next of sibbling vNode's, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vNext
         * @type vnode
         * @since 0.0.1
         */
        vNext: {
            get: function() {
                return _findNodeSibling(this, true);
            }
        },

        /**
         * Reference to the next of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vNextElement
         * @type vnode
         * @since 0.0.1
         */
        vNextElement: {
            get: function() {
                return _findElementSibling(this, true);
            }
        },

        /**
         * Reference to the previous of sibbling vNode's, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
         *
         * @property vPrevious
         * @type vnode
         * @since 0.0.1
         */
        vPrevious: {
            get: function() {
                return _findNodeSibling(this);
            }
        },

        /**
         * Reference to the previous of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @property vPreviousElement
         * @type vnode
         * @since 0.0.1
         */
        vPreviousElement: {
            get: function() {
                return _findElementSibling(this);
            }
        }
    });

    module.exports = vNodeProto;

};