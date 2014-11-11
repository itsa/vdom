"use strict";

/**
 * Delivers the `vnode` prototype object, which is a virtualisation of an `Element` inside the Dom.
 * These Elements work smoothless with the vdom (see ...).
 *
 * vnodes are much quicker to access and walk through than native dom-nodes. However, this is a module you don't need
 * by itself: `Element`-types use these features under the hood.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module vdom
 * @submodule vnode
 * @class vnode
 * @since 0.0.1
*/

require('js-ext/lib/array.js');
require('js-ext/lib/string.js');
require('./element-array');

module.exports = function (window) {

    var NS = require('./vdom-ns.js')(window),
        DOCUMENT = window.document,
        nodeids = NS.nodeids,
        htmlToVNodes = require('./html-parser.js')(window),
        ElementArray = require('./element-array.js'),
        async = require('utils/lib/timers.js').async,
        STRING = 'string',
        SPLIT_CHARACTER = {
            ' ': true,
            '>': true,
            '+': true,
            '~': true
        },
        STORABLE_SPLIT_CHARACTER = {
            '>': true,
            '+': true,
            '~': true
        },
        SIBLING_MATCH_CHARACTER = {
            '+': true,
            '~': true
        },
        ATTR_DETAIL_SPECIFIERS = {
            '^': true, // “begins with” selector
            '$': true, // “ends with” selector
            '*': true, // “contains” selector (might be a substring)
            '~': true, // “contains” selector as a separate word, separated by spaces
            '|': true // “contains” selector as a separate word, separated by `|`
        },
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
            ']': true,
            '^': true, // “begins with” selector
            '$': true, // “ends with” selector
            '*': true, // “contains” selector (might be a substring)
            '~': true, // “contains” selector as a separate word, separated by spaces
            '|': true // “contains” selector as a separate word, separated by `|`
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
        _matchesSelectorItem, _matchesOneSelector, _findElementSibling, vNodeProto,
        _splitSelector, _findNodeSibling;

   /**
    * Searches for the next -or previous- node-sibling (nodeType of 1, 3 or 8).
    *
    * @method _findNodeSibling
    * @param vnode {Object} the vnode to inspect
    * @param [next] {Boolean} whether to search for the next, or previous match.
    * @return {Object|undefined} the vnode that matches the search
    * @protected
    * @private
    * @since 0.0.1
    */
    _findNodeSibling = function(vnode, next) {
        var vParent = vnode.vParent,
            index;
        if (!vParent || !vParent.vChildNodes) {
            return null;
        }
        index = vParent.vChildNodes.indexOf(vnode) + (next ? 1 : -1);
        return vParent.vChildNodes[index];
    };

   /**
    * Searches for the next -or previous- Element-sibling (nodeType of 1).
    *
    * @method _findElementSibling
    * @param vnode {Object} the vnode to inspect
    * @param [next] {Boolean} whether to search for the next, or previous match.
    * @return {Object|undefined} the vnode that matches the search
    * @protected
    * @private
    * @since 0.0.1
    */
    _findElementSibling = function(vnode, next) {
        var vParent = vnode.vParent,
            index;
        if (!vParent || !vParent.vChildNodes) {
            return null;
        }
        if (vnode.nodeType===1) {
            index = vParent.vChildren.indexOf(vnode) + (next ? 1 : -1);
            return vParent.vChildren[index];
        }
        else {
/*jshint noempty:true */
            while ((vnode=_findNodeSibling(vnode, next)) && (vnode.nodeType!==1)) {}
/*jshint noempty:false */
            return vnode;
        }
    };

   /**
    * Check whether the vnode matches the css-selector. the css-selector should be a single selector,
    * not multiple, so it shouldn't contain a `comma`.
    *
    * @method _matchesOneSelector
    * @param vnode {Object} the vnode to inspect
    * @param selector {String} the selector-item to check the match for
    * @return {Boolean} whether the vnode matches the css-selector
    * @protected
    * @private
    * @since 0.0.1
    */
    _matchesOneSelector = function(vnode, selector) {
        var selList = _splitSelector(selector),
            size = selList.length,
            i, selectorItem, selMatch, len, directMatch;

        if (size===0) {
            return false;
        }

        selectorItem = selList[size-1];
        selMatch = _matchesSelectorItem(vnode, selectorItem);
        for (i=size-2; (selMatch && (i>=0)); i--) {
            selectorItem = selList[i];
            if (SIBLING_MATCH_CHARACTER[selectorItem]) {
                // need to search through the same level
                if (--i>=0) {
                    directMatch = (selectorItem==='+');
                    selectorItem = selList[i];
                    // need to search the previous siblings
                    vnode = vnode.vPreviousElement;
                    if (!vnode) {
                        return false;
                    }
                    if (directMatch) {
                        // should be immediate match
                        selMatch = _matchesSelectorItem(vnode, selectorItem);
                    }
                    else {
                        while (vnode && !(selMatch=_matchesSelectorItem(vnode, selectorItem))) {
                            vnode = vnode.vPreviousElement;
                        }
                    }
                }
            }
            else {
                // need to search up the tree
                vnode = vnode.vParent;
                if (!vnode) {
                    return false;
                }
                if ((selectorItem==='>') && (--i>=0)) {
                    selectorItem = selList[i];
                    // should be immediate match
                    selMatch = _matchesSelectorItem(vnode, selectorItem);
                }
                else {
                    while (vnode && !(selMatch=_matchesSelectorItem(vnode, selectorItem))) {
                        vnode = vnode.vParent;
                    }
                }
            }
        }
        return selMatch;
    };

   /**
    * Check whether the vnode matches one specific selector-item. Suppose the css-selector: "#mynode li.red .blue"
    * then there are 3 selector-items: "#mynode",  "li.red" and ".blue"
    *
    * This method also can handle the new selectors:
    * <ul>
    *     <li>[att^=val] –-> the “begins with” selector</li>
    *     <li>[att$=val] –-> the “ends with” selector</li>
    *     <li>[att*=val] –-> the “contains” selector (might be a substring)</li>
    *     <li>[att~=val] –-> the “contains” selector as a separate word, separated by spaces</li>
    *     <li>[att|=val] –-> the “contains” selector as a separate word, separated by `|`</li>
    *     <li>+ --> (same level)</li>
    *     <li>~ --> (same level)</li>
    * </ul>
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
console.info(vnode);
console.info('checking selector '+selectorItem);
        var i = 0,
            len = selectorItem.length,
            character = selectorItem[0],
            tagName, id, className, attributeName, attributeValue, stringMarker, attributeisString, isBoolean, checkBoolean, treatment;
        if (selectorItem==='*') {
            return true;
        }
        if (!SELECTOR_IDENTIFIERS[character]) {
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
console.info('goiing into id-match');
                    id = '';
                    while ((++i<len) && (character=selectorItem[i]) && !SELECTOR_IDENTIFIERS[character]) {
                        id += character;
                    }
console.info('next id should match: '+id);
                    if (id!==vnode.id) {
                        return false;
                    }
                    break;
                case '.':
console.info('goiing into class-match');
                    className = '';
                    while ((++i<len) && (character=selectorItem[i]) && !SELECTOR_IDENTIFIERS[character]) {
                        className += character;
                    }
console.info('need to match the class: '+className);
console.info(vnode);
console.info('matches the class: '+vnode.hasClass(className));

                    if (!vnode.hasClass(className)) {
                        return false;
                    }
                    break;
                case '[':
console.info('goiing into attribute-match');
                    attributeName = '';
                    while ((++i<len) && (character=selectorItem[i]) && !END_ATTRIBUTENAME[character]) {
                        attributeName += character;
                    }
                    // if character===']' then we have an attribute without a value-definition
                    if (!vnode.attrs[attributeName] || ((character===']') && (vnode.attrs[attributeName]!==''))) {
console.info('RETURNING FALSE');
                        return false;
                    }
                    // now we read the value of the attribute
                    // however, it could be that the selector has a special `detailed` identifier set (defined by: ATTR_DETAIL_SPECIFIERS)
                    if (ATTR_DETAIL_SPECIFIERS[character]) {
                        treatment = character; // store the character to know how the attributedata should be treaded
                        i++; // character should be a "=" by now
                    }
                    else {
                        treatment = null;
                    }
console.info('attribute-name: '+attributeName);
                    attributeValue = '';
                    stringMarker = selectorItem[i+1];
                    attributeisString = (stringMarker==='"') || (stringMarker==="'");
                    attributeisString && (i++);

                    // end of attributaValue = (character===']') && (!attributeisString || (selectorItem[i-1]===stringMarker))
                    while ((++i<len) && (character=selectorItem[i]) && !((character===']') && (!attributeisString || (selectorItem[i-1]===stringMarker)))) {
                        attributeValue += character;
console.info('attributeValue: #'+attributeValue+'#');
                    }

                    if (attributeisString) {
                        // if attribute is string, then we need to _remove to last stringmarker
                        attributeValue = attributeValue.substr(0, attributeValue.length-1);
console.info(' removing last --> attributeValue: #'+attributeValue+'#');
                    }
                    else {
                        // if attribute is no string, then we need to typecast its value
                        isBoolean = ((attributeValue.length>3) && (attributeValue.length<6) &&
                                     (checkBoolean=attributeValue.toUpperCase()) &&
                                     ((checkBoolean==='FALSE') || (checkBoolean==='TRUE')));
                        // typecast the value to either Boolean or Number:
                        attributeValue = isBoolean ? (checkBoolean==='TRUE') : parseFloat(attributeValue);
                    }

                    // depending upon how the attributedata should be treated:
                    if (treatment) {
                        switch (treatment) {
                            case '^': // “begins with” selector
                                if (!vnode.attrs[attributeName].startsWith(attributeValue)) {
                                    return false;
                                }
                                break;
                            case '$': // “ends with” selector
                                if (!vnode.attrs[attributeName].endsWith(attributeValue)) {
                                    return false;
                                }
                                break;
                            case '*': // “contains” selector (might be a substring)
                                if (!vnode.attrs[attributeName].contains(attributeValue)) {
                                    return false;
                                }
                                break;
                            case '~': // “contains” selector as a separate word, separated by spaces
                                if (!(' '+vnode.attrs[attributeName]+' ').contains(' '+attributeValue+' ')) {
                                    return false;
                                }
                                break;
                            case '|': // “contains” selector as a separate word, separated by `|`
                                if (!('|'+vnode.attrs[attributeName]+'|').contains('|'+attributeValue+'|')) {
                                    return false;
                                }
                                break;
                        }
                    }
                    else if (vnode.attrs[attributeName]!==attributeValue) {
                        return false;
                    }

                    // we still need to increase one position:
                    (++i<len) && (character=selectorItem[i]);
            }
        }
        return true;
    };

    /**
     * Splits the selector into separate subselector-items that should match different elements through the tree.
     * Special characters '>' and '+' are added as separate items in the hash.
     *
     * @method _splitSelector
     * @param selector {String} the selector-item to check the match for
     * @return {Array} splitted selectors
     * @protected
     * @private
     * @since 0.0.1
     */
    _splitSelector = function(selector) {
        var list = [],
            len = selector.length,
            sel = '',
            i, character, insideDataAttr;

        for (i=0; i<len; i++) {
            character = selector[i];
            if (character==='[') {
                sel += character;
                insideDataAttr = true;
            }
            else if (character===']') {
                sel += character;
                insideDataAttr = false;
            }
            else if (insideDataAttr || !SPLIT_CHARACTER[character]) {
                sel += character;
            }
            else {
                // unique selectoritem is found, add it to the list
                if (sel.length>0) {
                    list[list.length] = sel;
                    sel = '';
                }
                // in case the last character was '>', '+' or '~', we need to add it as a separate item
                STORABLE_SPLIT_CHARACTER[character] && (list[list.length]=character);
            }
        }
        // add the last item
        if (sel.length>0) {
            list[list.length] = sel;
            sel = '';
        }
    console.warn(list);
        return list;
    };

    vNodeProto = {
       /**
        * Check whether the vnode's domNode is equal, or contains the specified Element.
        *
        * @method contains
        * @return {Boolean} whether the vnode's domNode is equal, or contains the specified Element.
        * @since 0.0.1
        */
        contains: function(otherVNode) {
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
        * @method hasVChildNodes
        * @return {Boolean} whether the vnode has any vChildNodes.
        * @since 0.0.1
        */
        hasVChildNodes: function() {
            return this.vChildNodes ? (this.vChildNodes.length>0) : false;
        },

       /**
        * Checks whether the vnode has any vChildren (vChildNodes with nodeType of 1).
        *
        * @method hasVChildren
        * @return {Boolean} whether the vnode has any vChildren.
        * @since 0.0.1
        */
        hasVChildren: function() {
            return this.vChildNodes ? (this.vChildren.length>0) : false;
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
        * @method lastOfVChildren
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
                for (i=vChildren.length-1; !found && (i>=0); i--) {
                    element = vChildren[i];
                    element.matchesSelector(cssSelector) && (found=element);
                }
            }
            return found || null;
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
        * Syncs the vnode's nodeid (if available) inside `NS-vdom.nodeids`.
        *
        * Does NOT sync with the dom. Can be invoked multiple times without issues.
        *
        * @method storeId
        * @chainable
        * @since 0.0.1
        */
        storeId: function() {
            // store node/vnode inside WeakMap:
            var instance = this;
            instance.id ? (nodeids[instance.id]=instance.domNode) : (delete nodeids[instance.id]);
            return instance;
        },

        //---- private ------------------------------------------------------------------

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
            var instance = this,
                vParent = instance.vParent;
            if (vParent && vParent.vChildNodes) {
                vParent.vChildNodes.remove(instance);
                // force to recalculate the vChildren on a next call:
                (instance.nodeType===1) && (vParent._vChildren=null);
            }
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
            parentVNode.vChildNodes || (parentVNode.vChildNodes=[]);
            parentVNode.vChildNodes.insertAt(instance, index);
            // force to recalculate the vChildren on a next call:
            if (vParent && (instance.nodeType===1)) {
                vParent._vChildren = null;
                parentVNode._vChildren = null;
            }
            return instance;
        },

       /**
        * Removes empty TextNodes and merges following TextNodes inside the vnode.
        *
        * Syncs with the dom.
        *
        * @method _normalize
        * @private
        * @chainable
        * @since 0.0.1
        */
        _normalize: function() {
            var instance = this,
                domNode = instance.domNode,
                vChildNodes = instance.vChildNodes,
                i, preChildNode, vChildNode;
            if (vChildNodes) {
                for (i=vChildNodes.length-1; i>=0; i--) {
                    vChildNode = vChildNodes[i];
                    preChildNode = vChildNodes[i-1]; // i will get the value `-1` eventually, which leads into undefined preChildNode
                    if (vChildNode.nodetype===3) {
                        if (vChildNode.text==='') {
                            domNode.removeChild(vChildNode.domNode);
                            vChildNode._remove();
                        }
                        else if (preChildNode.nodetype===3) {
                            preChildNode.text += vChildNode.text;
                            preChildNode.domNode.nodeValue = preChildNode.text;
                            domNode.removeChild(vChildNode.domNode);
                            vChildNode._remove();
                        }
                    }
                }
            }
            return instance;
        },

       /**
        * Prevents MutationObserver from making the dom sync with the vnode.
        * Should be used when manipulating the dom from within the vnode itself (to preventing looping)
        *
        * @method _noSync
        * @private
        * @since 0.0.1
        */
        _noSync: function() {
            var instance = this;
            if (!instance._nosync) {
                instance._nosync = true;
                async(function() {
                    // instance._nosync = false;
                });
            }
        },

       /**
        * Removes the vnode and all its vnode-vChildNodes from its definitions inside `NS-vdom.nodeids`.
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
            if ((instance.nodeType===1) && vChildNodes) {
                len = vChildNodes.length;
                for (i=0; i < len; i++) {
                    vChildNode = vChildNodes[i];
                    vChildNode._remove();
                }
            }
            instance._vChildren = null;
            // explicitely set instance.domNode._vnode and instance.domNode to null in order to prevent problems with the GC (we break the circular reference)
            instance.domNode._vnode = null;
            instance.domNode = null;
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
            if (vParent && (vChildNodes=vParent.vChildNodes)) {
                index = vChildNodes.indexOf(instance);
                // force to recalculate the vChildren on a next call:
                ((instance.nodeType===1) || (newVNode.nodeType===1)) && (instance.vParent._vChildren=null);
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
                attrsObj, domNode, attr, attrs, id, i, key, keys, len, value, classNames, classes;
            if (instance.nodeType!==1) {
                return;
            }
            instance._noSync();
            domNode = instance.domNode;
            attrs = instance.attrs;
            attrs.id && (delete nodeids[attrs.id]);

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
                    domNode.removeAttribute(key);
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
                    domNode.setAttribute(key, value);
                    attrs[key] = value;
                }
            }

            // set node's id:
            id = instance.id = attrs.id;
            // if valid id, then store the DOMnodeRef inside internal hash
            id && (nodeids[id]=instance.domNode);

            classNames = instance.classNames = {};
/*jshint boss:true */
            if (classes=instance.attrs['class']) {
/*jshint boss:false */
                classes = classes.split(' ');
                len = classes.length;
                for (i=0; i<len; i++) {
                    classNames[classes[i]] = true;
                }
            }
            instance.attrs = newAttrs;
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
                vChildNodes = instance.vChildNodes || [],
                domNode = instance.domNode,
                forRemoval = [],
                i, oldChild, newChild, newLength, len, len2, childDomNode, nodeswitch, bkpAttrs, bkpChildNodes;

            instance._noSync();
            // first: reset ._vChildren --> by making it empty, its getter will refresh its list on a next call
            instance._vChildren = null;
            // if newVChildNodes is undefined, then we assume it to be empty --> an empty array
            newVChildNodes || (newVChildNodes=[]);
            // quickest way to loop through array is by using for loops: http://jsperf.com/array-foreach-vs-for-loop/5
            len = vChildNodes.length;
            newLength = newVChildNodes.length;
            for (i=0; i<len; i++) {
                oldChild = vChildNodes[i];
                childDomNode = oldChild.domNode;
                if (i < newLength) {
                    newChild = newVChildNodes[i];
/*jshint boss:true */
                    switch (nodeswitch=NODESWITCH[oldChild.nodeType][newChild.nodeType]) {
/*jshint boss:false */
                        case 1: // oldNodeType==Element, newNodeType==Element
                            if ((oldChild.tag!==newChild.tag) || ((oldChild.tag==='SCRIPT') && (oldChild.text!==newChild.text))) {
                                // new tag --> completely replace
                                bkpAttrs = newChild.attrs;
                                bkpChildNodes = newChild.vChildNodes;
                                oldChild.attrs.id && (delete nodeids[oldChild.attrs.id]);
                                newChild.attrs = {}; // reset to force defined by `_setAttrs`
                                newChild.vChildNodes = []; // reset , to force defined by `_setAttrs`
                                domNode.replaceChild(newChild.domNode, childDomNode);
                                newChild.vParent = instance;
                                newChild._setAttrs(bkpAttrs);
                                newChild._setChildNodes(bkpChildNodes);
                                newChild.id && (nodeids[newChild.id]=newChild.domNode);
                                oldChild._replaceAtParent(newChild);
                            }
                            else {
                                // same tag --> only update what is needed
                                oldChild.attrs = newChild.attrs;
                                oldChild._setAttrs(newChild.attrs);
                                // next: sync the vChildNodes:
                                oldChild._setChildNodes(newChild.vChildNodes);
                            }
                            break;
                        case 2: // oldNodeType==Element, newNodeType==TextNode
                                // case2 and case3 should be treated the same
                        case 3: // oldNodeType==Element, newNodeType==Comment
                            oldChild.attrs.id && (delete nodeids[oldChild.attrs.id]);
                            newChild.domNode.nodeValue = newChild.text;
                            domNode.replaceChild(newChild.domNode, childDomNode);
                            newChild.vParent = instance;
                            oldChild._replaceAtParent(newChild);
                            break;
                        case 4: // oldNodeType==TextNode, newNodeType==Element
                                // case4 and case7 should be treated the same
                        case 7: // oldNodeType==Comment, newNodeType==Element
                                newChild._setAttrs(newChild.attrs);

                                domNode.replaceChild(newChild.domNode, childDomNode);
                                newChild._setChildNodes(newChild.vChildNodes);

                                newChild.id && (nodeids[newChild.id]=newChild.domNode);

                                oldChild.isVoid = newChild.isVoid;
                                delete oldChild.text;
                            break;

                        case 5: // oldNodeType==TextNode, newNodeType==TextNode
                                // case5 and case8 should be treated the same
                        case 8: // oldNodeType==Comment, newNodeType==TextNode
                            if (oldChild.text !== newChild.text) {
                                newChild.domNode.nodeValue = newChild.text;
                                domNode.replaceChild(newChild.domNode, childDomNode);
                                oldChild.text = newChild.text;
                            }
                            break;
                        case 6: // oldNodeType==TextNode, newNodeType==Comment
                                // case6 and case9 should be treated the same
                        case 9: // oldNodeType==Comment, newNodeType==Comment
                            if (oldChild.text !== newChild.text) {
                                newChild.domNode.nodeValue = newChild.text;
                                domNode.replaceChild(newChild.domNode, childDomNode);
                                oldChild.text = newChild.text;
                            }
                    }
                    if ((nodeswitch===2) || (nodeswitch===5) || (nodeswitch===8)) {
                        instance._normalize();
                    }
                }
                else {
                    // _remove previous definition
                    domNode.removeChild(oldChild.domNode);
                    // the oldChild needs to be removed, however, this canoot be done right now, for it would effect the loop
                    // so we store it inside a hash to remove it later
                    forRemoval[forRemoval.length] = oldChild;
                }
            }
            // now definitely remove marked childNodes:
            len2 = forRemoval.length;
            for (i=0; i<len2; i++) {
                forRemoval[i]._remove();
            }
            // now we add all new vChildNodes that go beyond `len`:
            for (i = len; i < newLength; i++) {
                newChild = newVChildNodes[i];
                newChild.vParent = instance;
                switch (newChild.nodeType) {
                    case 1: // Element
                        bkpAttrs = newChild.attrs;
                        bkpChildNodes = newChild.vChildNodes;
                        newChild.attrs = {}; // reset, to force defined by `_setAttrs`
                        newChild.vChildNodes = []; // reset to current state, to force defined by `_setAttrs`
                        domNode.appendChild(newChild.domNode);
                        newChild._setAttrs(bkpAttrs);
                        newChild._setChildNodes(bkpChildNodes);
                        break;
                    default: // TextNode or CommentNode
                        newChild.domNode.nodeValue = newChild.text;
                        domNode.appendChild(newChild.domNode);
                }
                newChild.storeId();
            }
            instance.vChildNodes = newVChildNodes;
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
     * @property domNode
     * @type domNode
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
                    html, vChildNodes, len, i, vChildNode;
                if (instance.nodeType===1) {
                    html = '';
                    vChildNodes = instance.vChildNodes;
                    len = vChildNodes ? vChildNodes.length : 0;
                    for (i=0; i<len; i++) {
                        vChildNode = vChildNodes[i];
                        switch (vChildNode.nodeType) {
                            case 1:
                                html += vChildNode.outerHTML;
                                break;
                            case 3:
                                html += vChildNode.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                break;
                            case 8:
                                html += '<!--' + vChildNode.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '-->';
                        }
                    }
                }
                return html;
            },
            set: function(v) {
                this._setChildNodes(htmlToVNodes(v, vNodeProto));
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
                return ((instance.nodeType===3) || (instance.nodeType===8)) ? instance.text : null;
            },
            set: function(v) {
                var instance = this;
                if ((instance.nodeType===3) || (instance.nodeType===8)) {
                    instance.domNode.textContent = v;
                    // set .text AFTER the dom-node is updated --> the content might be escaped!
                    instance.text = instance.domNode.textContent;
                }
            }
        },

        /**
         * Gets or sets the outerHTML of both the vnode as well as the representing dom-node.
         *
         * The setter syncs with the DOM.
         *
         * @property outerHTML
         * @type String
         * @since 0.0.1
         */
        outerHTML: {
            get: function() {
                var instance = this,
                    html,
                    attrs = instance.attrs;
                if (instance.nodeType===1) {
                    if (instance.nodeType!==1) {
                        return instance.textContent;
                    }
                    html = '<' + instance.tag.toLowerCase();
                    attrs.each(function(value, key) {
                        html += ' '+key+'="'+value+'"';
                    });
                    html += '>';
                    if (!instance.isVoid) {
                        html += instance.innerHTML + '</' + instance.tag.toLowerCase() + '>';
                    }
                }
                return html;
            },
            set: function(v) {
                var instance = this,
                    vParent = instance.vParent,
                    id = instance.attrs.id,
                    vnode, vnodes, bkpAttrs, bkpChildNodes, i, len, vChildNodes, isLastChildNode, index, refDomNode;
                if ((instance.nodeType!==1) || !vParent) {
                    return;
                }
                vChildNodes = vParent.vChildNodes;
                index = vChildNodes.indexOf(instance);
                isLastChildNode = (index===(vChildNodes.length-1));
                isLastChildNode || (refDomNode=vChildNodes[index+1].domNode);
                vnodes = htmlToVNodes(v, vNodeProto, vParent);
                len = vnodes.length;
                if (len>0) {
                    // the first vnode will replace the current instance:
                    vnode = vnodes[0];
                    if (vnode.nodeType===1) {
                        if (vnode.tag!==instance.tag) {
                            // new tag --> completely replace
                            bkpAttrs = vnode.attrs;
                            bkpChildNodes = vnode.vChildNodes;
                            id && (delete nodeids[id]);
                            vnode.attrs = {}; // reset to force defined by `_setAttrs`
                            vnode.vChildNodes = []; // reset , to force defined by `_setAttrs`
                            vParent.domNode.replaceChild(vnode.domNode, instance.domNode);
                            vnode._setAttrs(bkpAttrs);
                            vnode._setChildNodes(bkpChildNodes);
                            // vnode.attrs = bkpAttrs;
                            // vnode.vChildNodes = bkpChildNodes;
                            vnode.id && (nodeids[vnode.id]=vnode.domNode);
                            instance._replaceAtParent(vnode);
                        }
                        else {
                            instance._setAttrs(vnode.attrs);
                            instance._setChildNodes(vnode.vChildNodes);
                        }
                    }
                    else {
                        id && (delete nodeids[id]);
                        vnode.domNode.nodeValue = vnode.text;
                        vParent.domNode.replaceChild(vnode.domNode, instance.domNode);
                        instance._replaceAtParent(vnode);
                    }
                }
                for (i=1; i<len; i++) {
                    vnode = vnodes[i];
                    switch (vnode.nodeType) {
                        case 1: // Element
                            bkpAttrs = vnode.attrs;
                            bkpChildNodes = vnode.vChildNodes;
                            vnode.attrs = {}; // reset, to force defined by `_setAttrs`
                            vnode.vChildNodes = []; // reset to current state, to force defined by `_setAttrs`
                            isLastChildNode ? vParent.domNode.appendChild(vnode.domNode) : vParent.domNode.insertBefore(vnode.domNode, refDomNode);
                            vnode._setAttrs(bkpAttrs);
                            vnode._setChildNodes(bkpChildNodes);
                            break;
                        default: // TextNode or CommentNode
                            vnode.domNode.nodeValue = vnode.text;
                            isLastChildNode ? vParent.domNode.appendChild(vnode.domNode) : vParent.domNode.appendChild(vnode.domNode, refDomNode);
                    }
                    vnode.storeId();
                    vnode._moveToParent(vParent, index+i);
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
                    len, i, vChildNode;
                if (instance.nodeType===1) {
                    vChildNodes = instance.vChildNodes;
                    len = vChildNodes ? vChildNodes.length : 0;
                    for (i=0; i<len; i++) {
                        vChildNode = vChildNodes[i];
                        text += (vChildNode.nodeType===3) ? vChildNode.text : ((vChildNode.nodeType===1) ? vChildNode.textContent : '');
                    }
                }
                else {
                    text = instance.text;
                }
                return text;
            },
            set: function(v) {
                var vnode = Object.create(vNodeProto);
                vnode.domNode = DOCUMENT.createTextNode(v);
                // create circular reference:
                vnode.domNode._vnode = vnode;
                vnode.nodeType = 3;
                vnode.text = vnode.domNode.textContent;
                this._setChildNodes([vnode]);
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
                    children = instance._vChildren,
                    vChildNode, vChildNodes, i, len;
                vChildNodes = instance.vChildNodes;
                if (vChildNodes && !children) {
                    children = instance._vChildren = ElementArray.createArray();
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
         * the Parent vnode
         *
         * @property vParent
         * @type vnode
         * @since 0.0.1
         */

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

    return vNodeProto;

};