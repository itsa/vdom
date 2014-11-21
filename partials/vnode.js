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
require('js-ext/lib/object.js');
require('js-ext/lib/string.js');

module.exports = function (window) {

    if (!window._ITSAmodules) {
        Object.defineProperty(window, '_ITSAmodules', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {} // `writable` is false means we cannot chance the value-reference, but we can change {} its members
        });
    }

    if (window._ITSAmodules.VNode) {
        return window._ITSAmodules.VNode; // VNODE was already created
    }

    var NS = require('./vdom-ns.js')(window),
        extractor = require('./attribute-extractor.js')(window),
        DOCUMENT = window.document,
        nodeids = NS.nodeids,
        htmlToVNodes = require('./html-parser.js')(window),
        async = require('utils/lib/timers.js').async,
        NTH_CHILD_REGEXP = /(?:(\d*)[n|N])?([+|-])?(\d*)/, // an+b
        STRING = 'string',
        CLASS = 'class',
        STYLE = 'style',
        ID = 'id',
        SPLIT_CHARACTER = {
            ' ': true,
            '>': true,
            '+': true, // only select the element when it is immediately preceded by the former element
            '~': true  // only the element when it has the former element as a sibling. (just like `+`, but less strict)
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
            '[': 3,
            ':': 4
        },
        PSEUDO_FIRST_CHILD = ':first-child',
        PSEUDO_FIRST_OF_TYPE = ':first-of-type',
        PSEUDO_LAST_CHILD = ':last-child',
        PSEUDO_LAST_OF_TYPE = ':last-of-type',
        PSEUDO_NTH_CHILD = ':nth-child',
        PSEUDO_NTH_LAST_CHILD = ':nth-last-child',
        PSEUDO_NTH_LAST_OF_TYPE = ':nth-last-of-type',
        PSEUDO_NTH_OF_TYPE = ':nth-of-type',
        PSEUDO_ONLY_OF_TYPE = ':only-of-type',
        PSEUDO_ONLY_CHILD = ':only-child',
        /**
         * Object to gain quick access to the selectors that required children
         *
         * @property PSEUDO_REQUIRED_CHILDREN
         * @default {
         *     ':first-child': true,
         *     ':first-of-type': true,
         *     ':last-child': true,
         *     ':last-of-type': true,
         *     ':nth-child': true,
         *     ':nth-last-child': true,
         *     ':nth-last-of-type': true,
         *     ':nth-of-type': true,
         *     ':only-of-type': true,
         *     ':only-child': true
         *  }
         * @type Object
         * @protected
         * @since 0.0.1
         */
        PSEUDO_REQUIRED_CHILDREN = {},
        _matchesSelectorItem, _matchesOneSelector, _findElementSibling, vNodeProto,
        _splitSelector, _findNodeSibling, _matchNthChild;

        PSEUDO_REQUIRED_CHILDREN[PSEUDO_FIRST_CHILD] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_FIRST_OF_TYPE] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_LAST_CHILD] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_LAST_OF_TYPE] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_NTH_CHILD] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_NTH_LAST_CHILD] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_NTH_LAST_OF_TYPE] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_NTH_OF_TYPE] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_ONLY_OF_TYPE] = true;
        PSEUDO_REQUIRED_CHILDREN[PSEUDO_ONLY_CHILD] = true;

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
            return;
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
            return;
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
    * Check whether the vnode matches a "nth-child" test, which is used for css pseudoselectors like `nth-child`, `nth-of-type` etc.
    *
    * @method _matchNthChild
    * @param pseudoArg {String} the argument for nth-child
    * @param index {Number} the index of the inspected vnode
    * @return {Boolean} whether the vnode matches the nthChild test
    * @protected
    * @private
    * @since 0.0.1
    */
    _matchNthChild = function(pseudoArg, index) {
        var match, k, a, b, nodeOk, nthIndex, sign;
        (pseudoArg==='even') && (pseudoArg='2n');
        (pseudoArg==='odd') && (pseudoArg='2n+1');

        match = pseudoArg.match(NTH_CHILD_REGEXP);
        if (!match) {
            return false;
        }
        // pseudoArg follows the pattern: `an+b`
        a = match[1];
        sign = match[2];
        b = match[3];
        (b==='') && (b=0);
        if (!a) {
            // only fixed index to match
            return (sign==='-') ? false : (parseInt(b, 10)===index);
        }
        else {
            // we need to iterate
            nodeOk = false;
            b = window.Number(b);
            for (k=0; !nodeOk; k++) {
                nthIndex = (sign==='-') ? (a*k) - b : (a*k) + b;
                if (nthIndex===index) {
                    nodeOk = true;
                }
                else if (nthIndex>index) {
                    // beyond index --> will never become a fix anymore
                    return false;
                }
            }
            return nodeOk;
        }
    };

   /**
    * Check whether the vnode matches the css-selector. the css-selector should be a single selector,
    * not multiple, so it shouldn't contain a `comma`.
    *
    * @method _matchesOneSelector
    * @param vnode {vnode} the vnode to inspect
    * @param selector {String} the selector-item to check the match for
    * @param [relatedVNode] {vnode} a related vnode where to selectors starting with `>`, `~` or `+` should be compared.
    *        If not specified, any of these three starting selector-characters will be ignored (leading to matching this first character).
    * @return {Boolean} whether the vnode matches the css-selector
    * @protected
    * @private
    * @since 0.0.1
    */
    _matchesOneSelector = function(vnode, selector, relatedVNode) {
        var selList = _splitSelector(selector),
            size = selList.length,
            originalVNode = vnode,
            firstSelectorChar = selector[0],
            i, selectorItem, selMatch, directMatch, vParentvChildren, indexRelated;

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
                if (!vnode || ((vnode===relatedVNode) && (selectorItem!=='>'))) {
                    return false;
                }
                if (selectorItem==='>') {
                    if (--i>=0) {
                        selectorItem = selList[i];
                       // should be immediate match
                        selMatch = _matchesSelectorItem(vnode, selectorItem);
                    }
                }
                else {
                    while (!(selMatch=_matchesSelectorItem(vnode, selectorItem))) {
                        vnode = vnode.vParent;
                        if (!vnode || (vnode===relatedVNode)) {
                            return false;
                        }
                    }
                }
            }
        }
        if (selMatch && relatedVNode && STORABLE_SPLIT_CHARACTER[firstSelectorChar]) {
            // when `selector` starts with `>`, `~` or `+`, then
            // there should also be a match comparing a related node!
            switch (firstSelectorChar) {
                case '>':
                    selMatch = (relatedVNode.vChildren.indexOf(originalVNode)!==-1);
                break;
                case '~':
                    vParentvChildren = originalVNode.vParent.vChildren;
                    indexRelated = vParentvChildren.indexOf(relatedVNode);
                    selMatch = (indexRelated!==-1) && (indexRelated<vParentvChildren.indexOf(originalVNode));
                break;
                case '+':
                    selMatch = (originalVNode.vPreviousElement === relatedVNode);
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
        var i = 0,
            len = selectorItem.length,
            character = selectorItem[0],
            tagName, id, className, attributeName, attributeValue, stringMarker, attributeisString, isBoolean, insideAttributeValue, insideAttribute,
            vParent, checkBoolean, treatment, k, min, max, value, len2, index, found, pseudo, pseudoArg, arglevel, count, vParentVChildren;
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
                        return !!vnode.attrs[attributeName];
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
                    attributeValue = '';
                    stringMarker = selectorItem[i+1];
                    attributeisString = (stringMarker==='"') || (stringMarker==="'");
                    attributeisString && (i++);

                    // end of attributaValue = (character===']') && (!attributeisString || (selectorItem[i-1]===stringMarker))
                    while ((++i<len) && (character=selectorItem[i]) && !((character===']') && (!attributeisString || (selectorItem[i-1]===stringMarker)))) {
                        attributeValue += character;
                    }

                    if (attributeisString) {
                        // if attribute is string, then we need to _remove to last stringmarker
                        attributeValue = attributeValue.substr(0, attributeValue.length-1);
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
                    break;
                case ':':
                    // we have a pseudo-selector
                    // first, find out which one
                    // because '::' is a valid start (though without any selection), we start to back the next character as well:
                    pseudo = ':'+selectorItem[++i];
                    pseudoArg = '';
                    vParent = vnode.vParent;
                    vParentVChildren = vParent && vParent.vChildren;
                    // pseudo-selectors might have an argument passed in, like `:nth-child(2n+1)` or `:not([type="checkbox"])` --> we
                    // store this argument inside `pseudoArg`
                    // also note that combinations are possible with `:not` --> `:not(:nth-child(2n+1))`
                    // also note that we cannot "just" look for a closing character when running into the usage of attributes:
                    // for example --> `:not([data-x="some data :)"])`
                    // that's why -once we are inside attribute-data- we need to continue until the attribute-data ends
                    while ((++i<len) && (character=selectorItem[i]) && !SELECTOR_IDENTIFIERS[character]) {
                        if (character==='(') {
                            // starting arguments
                            arglevel = 1;
                            insideAttribute = false;
                            insideAttributeValue = false;
                            while ((++i<len) && (character=selectorItem[i]) && (arglevel>0)) {
                                if (!insideAttribute) {
                                    if (character==='(') {
                                        arglevel++;
                                    }
                                    else if (character===')') {
                                        arglevel--;
                                    }
                                    else if (character==='[') {
                                        insideAttribute = true;
                                    }
                                }
                                else {
                                    // inside attribute
                                    if (!insideAttributeValue) {
                                        if ((character==='"') || (character==="'")) {
                                            insideAttributeValue = true;
                                            stringMarker = character;
                                        }
                                        else if (character===']') {
                                            insideAttribute = false;
                                        }
                                    }
                                    else if ((character===stringMarker) && (selectorItem[i+1]===']')) {
                                        insideAttributeValue = false;
                                    }
                                }
                                (arglevel>0) && (pseudoArg+=character);
                            }
                        }
                        else {
                            pseudo += character;
                        }
                    }
                    // now, `pseudo` is known as well as its possible pseudoArg
                    if (!vParentVChildren && PSEUDO_REQUIRED_CHILDREN[pseudo]) {
                        return false;
                    }
                    switch (pseudo) {
                        case ':checked': // input:checked   Selects every checked <input> element
                            if (!vnode.attrs.checked) {
                                return false;
                            }
                            break;
                        case ':disabled': // input:disabled  Selects every disabled <input> element
                            if (!vnode.attrs.disabled) {
                                return false;
                            }
                            break;
                        case ':empty': // p:empty Selects every <p> element that has no children (including text nodes)
                            if (vnode.vChildNodes && (vnode.vChildNodes.length>0)) {
                                return false;
                            }
                            break;
                        case ':enabled': // input:enabled   Selects every enabled <input> element
                            if (vnode.attrs.disabled) {
                                return false;
                            }
                            break;
                        case PSEUDO_FIRST_CHILD: // p:first-child   Selects every <p> element that is the first child of its parent
                            if (vParentVChildren[0]!==vnode) {
                                return false;
                            }
                            break;
                        case PSEUDO_FIRST_OF_TYPE: // p:first-of-type Selects every <p> element that is the first <p> element of its parent
                            for (k=vParentVChildren.indexOf(vnode)-1; k>=0; k--) {
                                if (vParentVChildren[k].tag===vnode.tag) {
                                    return false;
                                }
                            }
                            break;
                        case ':focus': // input:focus Selects the input element which has focus
                            if (vnode.domNode!==DOCUMENT.activeElement) {
                                return false;
                            }
                            break;
                        case ':in-range': // input:in-range  Selects input elements with a value within a specified range
                            if ((vnode.tag!=='INPUT') || ((vnode.attrs.type || '').toLowerCase()!=='number')) {
                                return false;
                            }
                            min = parseInt(vnode.attrs.min, 10);
                            max = parseInt(vnode.attrs.max, 10);
                            value = parseInt(vnode.domNode.value, 10);
                            if (!value || !min || !max || (value<min) || (value>max)) {
                                return false;
                            }
                            break;
                        case ':lang': // p:lang(it)  Selects every <p> element with a lang attribute equal to "it" (Italian)
                            if (vnode.attrs.lang!==pseudoArg) {
                                return false;
                            }
                            break;
                        case PSEUDO_LAST_CHILD: // p:last-child    Selects every <p> element that is the last child of its parent
                            if (vParentVChildren[vParentVChildren.length-1]!==vnode) {
                                return false;
                            }
                            break;
                        case PSEUDO_LAST_OF_TYPE: // p:last-of-type  Selects every <p> element that is the last <p> element of its parent
                            len2 = vParentVChildren.length;
                            for (k=vParentVChildren.indexOf(vnode)+1; k<len2; k++) {
                                if (vParentVChildren[k].tag===vnode.tag) {
                                    return false;
                                }
                            }
                            break;
                        case ':not': // :not(p) Selects every element that is not a <p> element
                            if (vnode.matchesSelector(pseudoArg)) {
                                return false;
                            }
                            break;
                        case PSEUDO_NTH_CHILD: // p:nth-child(2)  Selects every <p> element that is the second child of its parent
                            // NOTE: css `nth` starts with 1 instead of 0 !!!
                            index = vParentVChildren.indexOf(vnode)+1;
                            if (!_matchNthChild(pseudoArg, index)) {
                                return false;
                            }
                            break;
                        case PSEUDO_NTH_LAST_CHILD: // p:nth-last-child(2) Selects every <p> element that is the second child of its parent, counting from the last child
                            // NOTE: css `nth` starts with 1 instead of 0 !!!
                            // Also, nth-last-child counts from bottom up
                            index = vParentVChildren.length - vParentVChildren.indexOf(vnode);
                            if (!_matchNthChild(pseudoArg, index)) {
                                return false;
                            }
                            break;
                        case PSEUDO_NTH_LAST_OF_TYPE: // p:nth-last-of-type(2)   Selects every <p> element that is the second <p> element of its parent, counting from the last child
                            // NOTE: css `nth` starts with 1 instead of 0 !!!
                            // Also, nth-last-child counts from bottom up
                            index = vParentVChildren.length - vParentVChildren.indexOf(vnode);
                            // NOTE: css `nth` starts with 1 instead of 0 !!!
                            found = false;
                            index = 0;
                            for (k=vParentVChildren.length-1; (k>=0) && !found; k--) {
                                (vParentVChildren[k].tag===vnode.tag) && index++;
                                (vParentVChildren[k]===vnode) && (found=true);
                            }
                            if (!found || !_matchNthChild(pseudoArg, index)) {
                                return false;
                            }
                            break;
                        case PSEUDO_NTH_OF_TYPE: // p:nth-of-type(2)    Selects every <p> element that is the second <p> element of its parent
                            // NOTE: css `nth` starts with 1 instead of 0 !!!
                            found = false;
                            len2 = vParentVChildren.length;
                            index = 0;
                            for (k=0; (k<len2) && !found; k++) {
                                (vParentVChildren[k].tag===vnode.tag) && index++;
                                (vParentVChildren[k]===vnode) && (found=true);
                            }
                            if (!found || !_matchNthChild(pseudoArg, index)) {
                                return false;
                            }
                            break;
                        case PSEUDO_ONLY_OF_TYPE: // p:only-of-type  Selects every <p> element that is the only <p> element of its parent
                            len2 = vParentVChildren.length;
                            count = 0;
                            for (k=0; (k<len2) && (count<=1); k++) {
                                (vParentVChildren[k].tag===vnode.tag) && count++;
                            }
                            if (count!==1) {
                                return false;
                            }
                            break;
                        case PSEUDO_ONLY_CHILD: // p:only-child    Selects every <p> element that is the only child of its parent
                            if (vParentVChildren.length!==1) {
                                return false;
                            }
                            break;
                        case ':optional': // input:optional  Selects input elements with no "required" attribute
                            if (vnode.attrs.required) {
                                return false;
                            }
                            break;
                        case ':out-of-range': // input:out-of-range  Selects input elements with a value outside a specified range
                            if ((vnode.tag!=='INPUT') || ((vnode.attrs.type || '').toLowerCase()!=='number')) {
                                return false;
                            }
                            min = parseInt(vnode.attrs.min, 10);
                            max = parseInt(vnode.attrs.max, 10);
                            value = parseInt(vnode.domNode.value, 10);
                            if (!value || !min || !max || ((value>=min) && (value<=max))) {
                                return false;
                            }
                            break;
                        case ':read-only': // input:read-only Selects input elements with the "readonly" attribute specified
                            if (!vnode.attrs.readonly) {
                                return false;
                            }
                            break;
                        case ':read-write': // input:read-write    Selects input elements with the "readonly" attribute NOT specified
                            if (vnode.attrs.readonly) {
                                return false;
                            }
                            break;
                        case ':required': // input:required  Selects input elements with the "required" attribute specified
                            if (!vnode.attrs.required) {
                                return false;
                            }
                            break;
                        case ':root': // Selects the document's root element
                            if (vnode.domNode!==DOCUMENT.documentElement) {
                                return false;
                            }
                            break;
                    }
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
        return list;
    };

    vNodeProto = window._ITSAmodules.VNode = {
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
            return found;
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
            return found;
        },

       /**
        * Checks whether the vnode matches one of the specified selectors. `selectors` can be one, or multiple css-selectors,
        * separated by a `comma`. For example: "#myid li.red blue" is one selector, "div.red, div.blue, div.green" are three selectors.
        *
        * @method matchesSelector
        * @param selectors {String} one or more css-selectors
        * @param [relatedVNode] {vnode} a related vnode where to selectors starting with `>`, `~` or `+` should be compared.
        *        If not specified, any of these three starting selector-characters will be ignored (leading to matching this first character).
        * @return {Boolean} whether the vnode matches one of the selectors
        * @since 0.0.1
        */
        matchesSelector: function(selectors, relatedVNode) {
            var instance = this;
            if (instance.nodeType!==1) {
                return false;
            }
            selectors = selectors.split(',');
            // we can use Array.some, because there won't be many separated selectoritems,
            // so the final invocation won't be delayed much compared to looping
            return selectors.some(function(selector) {
                return _matchesOneSelector(instance, selector, relatedVNode);
            });
        },

       /**
        * Reloads the DOM-attribute into the vnode.
        *
        * @method matchesSelector
        * @param attributeName {String} the name of the attribute to be reloaded.
        * @return {Node} the domNode that was reloaded.
        * @since 0.0.1
        */
        reloadAttr: function(attributeName) {
            var instance = this,
                domNode = instance.domNode,
                attributeValue = domNode._getAttribute(attributeName),
                attrs = instance.attrs,
                extractStyle, extractClass;
            if (instance.nodeType==1) {
                attributeValue || (attributeValue='');
                if (attributeValue==='') {
                    delete attrs[attributeName];
                    // in case of STYLE attributeName --> special treatment
                    (attributeName===STYLE) && (instance.styles={});
                    // in case of CLASS attributeName --> special treatment
                    (attributeName===CLASS) && (instance.classNames={});
                    // in case of ID attributeName --> special treatment
                    if ((attributeName===ID) && (instance.id)) {
                        delete nodeids[instance.id];
                        delete instance.id;
                    }
                }
                else {
                    attrs[attributeName] = attributeValue;
                    // in case of STYLE attributeName --> special treatment
                    if (attributeName===STYLE) {
                        extractStyle = extractor.extractStyle(attributeValue);
                        attributeValue = extractStyle.attrStyle;
                        if (attributeValue) {
                            attrs.style = attributeValue;
                        }
                        else {
                            delete attrs.style;
                        }
                        instance.styles = extractStyle.styles;
                    }
                    else if (attributeName===CLASS) {
                        // in case of CLASS attributeName --> special treatment
                        extractClass = extractor.extractClass(attributeValue);
                        attributeValue = extractClass.attrClass;
                        if (attributeValue) {
                            attrs[CLASS] = attributeValue;
                        }
                        else {
                            delete attrs[CLASS];
                        }
                        instance.classNames = extractClass.classNames;
                    }
                    else if (attributeName===ID) {
                        instance.id && (instance.id!==attributeValue) && (delete nodeids[instance.id]);
                        instance.id = attributeValue;
                        nodeids[attributeValue] = domNode;
                    }
                }
            }
            return domNode;
        },

        serializeStyles: function() {
            return extractor.serializeStyles(this.styles);
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
         * Adds a vnode to the end of the list of vChildNodes.
         *
         * Syns with the DOM.
         *
         * @method _appendChild
         * @param VNode {vnode} vnode to append
         * @private
         * @return {Node} the Node that was appended
         * @since 0.0.1
         */
        _appendChild: function(VNode) {
            var instance = this,
                domNode = VNode.domNode,
                size;
            VNode._moveToParent(instance);
            instance.domNode._appendChild(domNode);
            if (VNode.nodeType===3) {
                size = instance.vChildNodes.length;
                instance._normalize();
                // if the size changed, then the domNode was merged
                (size===instance.vChildNodes.length) || (domNode=instance.vChildNodes[instance.vChildNodes.length-1].domNode);
            }
            return domNode;
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
        * Destroys the vnode and all its vnode-vChildNodes.
        * Removes it from its vParent.vChildNodes list,
        * also removes its definitions inside `NS-vdom.nodeids`.
        *
        * Does NOT sync with the dom.
        *
        * @method _destroy
        * @private
        * @chainable
        * @since 0.0.1
        */
        _destroy: function() {
            var instance = this,
                vChildNodes = instance.vChildNodes,
                len, i, vChildNode;
            if (!instance.destroyed) {
                Object.defineProperty(instance, 'destroyed', {
                    value: true,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
                // first: _remove all its vChildNodes
                if ((instance.nodeType===1) && vChildNodes) {
                    len = vChildNodes.length;
                    for (i=0; i < len; i++) {
                        vChildNode = vChildNodes[i];
                        vChildNode && vChildNode._destroy();
                    }
                }
                instance._vChildren = null;
                // explicitely set instance.domNode._vnode and instance.domNode to null in order to prevent problems with the GC (we break the circular reference)
                delete instance.domNode._vnode;
                // if valid id, then _remove the DOMnodeRef from internal hash
                instance.id && delete nodeids[instance.id];
                instance._deleteFromParent();
                async(function() {
                    instance.domNode = null;
                });
            }
            return instance;
        },

        /**
         * Inserts `newVNode` before `refVNode`.
         *
         * Syns with the DOM.
         *
         * @method _insertBefore
         * @param newVNode {vnode} vnode to insert
         * @param refVNode {vnode} The vnode before which newVNode should be inserted.
         * @private
         * @return {Node} the Node being inserted (equals domNode)
         * @since 0.0.1
         */
        _insertBefore: function(newVNode, refVNode) {
            var instance = this,
                domNode = newVNode.domNode,
                index = instance.vChildNodes.indexOf(refVNode),
                size;
            if (index!==-1) {
                newVNode._moveToParent(instance, index);
                instance.domNode._insertBefore(domNode, refVNode.domNode);
                if (newVNode.nodeType===3) {
                    size = instance.vChildNodes.length;
                    instance._normalize();
                }
            }
            return domNode;
        },

       /**
        * Moves the vnode from its current parent.vChildNodes list towards a new parent vnode at the specified position.
        *
        * Does NOT sync with the dom.
        *
        * @method _moveToParent
        * @param parentVNode {vnode} the parent-vnode
        * @param [index] {Number} the position of the child. When not specified, it will be appended.
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
            (typeof index==='number') ? parentVNode.vChildNodes.insertAt(instance, index) : (parentVNode.vChildNodes[parentVNode.vChildNodes.length]=instance);
            // force to recalculate the vChildren on a next call:
            vParent && (instance.nodeType===1) && (vParent._vChildren = null);
            // force to recalculate the vChildren on a next call:
            parentVNode && (instance.nodeType===1) && (parentVNode._vChildren=null);
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
            if (!instance._unNormalizable && vChildNodes) {
                for (i=vChildNodes.length-1; i>=0; i--) {
                    vChildNode = vChildNodes[i];
                    preChildNode = vChildNodes[i-1]; // i will get the value `-1` eventually, which leads into undefined preChildNode
                    if (vChildNode.nodeType===3) {
                        if (vChildNode.text==='') {
                            domNode._removeChild(vChildNode.domNode);
                            vChildNode._destroy();
                        }
                        else if (preChildNode && preChildNode.nodeType===3) {
                            preChildNode.text += vChildNode.text;
                            preChildNode.domNode.nodeValue = preChildNode.text;
                            domNode._removeChild(vChildNode.domNode);
                            vChildNode._destroy();
                        }
                    }
                }
            }
            return instance;
        },

       /**
        * Makes the vnode `normalizable`. Could be set to `false` when batch-inserting nodes, while `normalizaing` manually at the end.
        * Afterwards, you should always reset `normalizable` to true.
        *
        * @method _normalizable
        * @param value {Boolean} whether the vnode should be normalisable.
        * @private
        * @chainable
        * @since 0.0.1
        */
        _normalizable: function(value) {
            var instance = this;
            value ? (delete instance._unNormalizable) : (instance._unNormalizable=true);
            return instance;
        },

       /**
        * Prevents MutationObserver from making the dom sync with the vnode.
        * Should be used when manipulating the dom from within the vnode itself (to preventing looping)
        *
        * @method _noSync
        * @chainable
        * @private
        * @since 0.0.1
        */
        _noSync: function() {
            var instance = this;
            if (!instance._nosync) {
                instance._nosync = true;
                async(function() {
                    instance._nosync = false;
                });
            }
            return instance;
        },

       /**
        * Removes the attribute of both the vnode as well as its related dom-node.
        *
        * Syncs with the dom.
        *
        * @method _removeAttr
        * @param attributeName {String}
        * @private
        * @chainable
        * @since 0.0.1
        */
        _removeAttr: function(attributeName) {
            var instance = this;
            delete instance.attrs[attributeName];
            // in case of STYLE attribute --> special treatment
            (attributeName===STYLE) && (instance.styles={});
            // in case of CLASS attribute --> special treatment
            (attributeName===CLASS) && (instance.classNames={});
            if (attributeName===ID) {
                delete nodeids[instance.id];
                delete instance.id;
            }
            instance.domNode._removeAttribute(attributeName);
            return instance;
        },

        /**
        * Removes the vnode's child-vnode from its vChildren and the DOM.
        *
         * Syns with the DOM.
         *
        * @method removeChild
        * @param VNode {vnode} the child-vnode to remove
        * @private
        * @since 0.0.1
        */
        _removeChild: function(VNode) {
            var instance = this;
            VNode._destroy();
            instance.domNode._removeChild(VNode.domNode);
            instance._normalize();
        },

       /**
        * Replaces the current vnode at the parent.vChildNode list by `newVNode`
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
            return instance._destroy();
        },

       /**
        * Sets the attribute of both the vnode as well as its related dom-node.
        *
        * Syncs with the dom.
        *
        * @method _setAttr
        * @param attributeName {String}
        * @param value {String} the value for the attributeName
        * @private
        * @chainable
        * @since 0.0.1
        */
        _setAttr: function(attributeName, value) {
            var instance = this,
                extractStyle, extractClass,
                attrs = instance.attrs;
            if (attrs[attributeName]!==value) {
                if ((value===undefined) || (value===undefined)) {
                    instance._removeAttr(attributeName);
                    return instance;
                }
                attrs[attributeName] = value;
                // in case of STYLE attribute --> special treatment
                if (attributeName===STYLE) {
                    extractStyle = extractor.extractStyle(value);
                    value = extractStyle.attrStyle;
                    if (value) {
                        attrs.style = value;
                    }
                    else {
                        delete attrs.style;
                    }
                    instance.styles = extractStyle.styles;
                }
                else if (attributeName===CLASS) {
                    // in case of CLASS attribute --> special treatment
                    extractClass = extractor.extractClass(value);
                    value = extractClass.attrClass;
                    if (value) {
                        attrs[CLASS] = value;
                    }
                    else {
                        delete attrs[CLASS];
                    }
                    instance.classNames = extractClass.classNames;
                }
                else if (attributeName===ID) {
                    instance.id && (delete nodeids[instance.id]);
                    instance.id = value;
                    nodeids[value] = instance.domNode;
                }
                instance.domNode._setAttribute(attributeName, value);
            }
            return instance;
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
                attrsObj, domNode, attr, attrs, i, key, keys, len, value;
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
                attrsObj[key] || instance._removeAttr(key);
            }

            // next: every attribute that differs: redefine
            keys = Object.keys(attrsObj);
            len = keys.length;
            for (i = 0; i < len; i++) {
                key = keys[i];
                value = attrsObj[key];
                (attrs[key]===value) || instance._setAttr(key, value);
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
                vChildNodes = instance.vChildNodes || [],
                domNode = instance.domNode,
                forRemoval = [],
                i, oldChild, newChild, newLength, len, len2, childDomNode, nodeswitch, bkpAttrs, bkpChildNodes, needNormalize;

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
                                domNode._replaceChild(newChild.domNode, childDomNode);
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
                            domNode._replaceChild(newChild.domNode, childDomNode);
                            newChild.vParent = instance;
                            oldChild._replaceAtParent(newChild);
                            break;
                        case 4: // oldNodeType==TextNode, newNodeType==Element
                                // case4 and case7 should be treated the same
                        case 7: // oldNodeType==Comment, newNodeType==Element
                                newChild._setAttrs(newChild.attrs);

                                domNode._replaceChild(newChild.domNode, childDomNode);
                                newChild._setChildNodes(newChild.vChildNodes);

                                newChild.id && (nodeids[newChild.id]=newChild.domNode);

                                oldChild.isVoid = newChild.isVoid;
                                delete oldChild.text;
                            break;

                        case 5: // oldNodeType==TextNode, newNodeType==TextNode
                                // case5 and case9 should be treated the same
                        case 9: // oldNodeType==Comment, newNodeType==Comment
                            (oldChild.text===newChild.text) || (oldChild.domNode.nodeValue = oldChild.text = newChild.text);
                            newVChildNodes[i] = oldChild;
                            break;
                        case 6: // oldNodeType==TextNode, newNodeType==Comment
                                // case6 and case8 should be treated the same
                        case 8: // oldNodeType==Comment, newNodeType==TextNode
                            newChild.domNode.nodeValue = newChild.text;
                            domNode._replaceChild(newChild.domNode, childDomNode);
                            newChild.vParent = oldChild.vParent;
                    }
                    if ((nodeswitch===2) || (nodeswitch===5) || (nodeswitch===8)) {
                        needNormalize = true;
                    }
                }
                else {
                    // _remove previous definition
                    domNode._removeChild(oldChild.domNode);
                    // the oldChild needs to be removed, however, this canoot be done right now, for it would effect the loop
                    // so we store it inside a hash to remove it later
                    forRemoval[forRemoval.length] = oldChild;
                }
            }
            // now definitely remove marked childNodes:
            len2 = forRemoval.length;
            for (i=0; i<len2; i++) {
                forRemoval[i]._destroy();
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
                        domNode._appendChild(newChild.domNode);
                        newChild._setAttrs(bkpAttrs);
                        newChild._setChildNodes(bkpChildNodes);
                        break;
                    case 3: // Element
                        needNormalize = true;
                        // we need to break through --> no `break`
                        /* falls through */
                    default: // TextNode or CommentNode
                        newChild.domNode.nodeValue = newChild.text;
                        domNode._appendChild(newChild.domNode);
                }
                newChild.storeId();
            }
            instance.vChildNodes = newVChildNodes;
            needNormalize && instance._normalize();
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
                instance._noSync();
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
                            vParent.domNode._replaceChild(vnode.domNode, instance.domNode);
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
                        vParent.domNode._replaceChild(vnode.domNode, instance.domNode);
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
                            isLastChildNode ? vParent.domNode._appendChild(vnode.domNode) : vParent.domNode._insertBefore(vnode.domNode, refDomNode);
                            vnode._setAttrs(bkpAttrs);
                            vnode._setChildNodes(bkpChildNodes);
                            break;
                        default: // TextNode or CommentNode
                            vnode.domNode.nodeValue = vnode.text;
                            isLastChildNode ? vParent.domNode._appendChild(vnode.domNode) : vParent.domNode._appendChild(vnode.domNode, refDomNode);
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
                    children = instance._vChildren = [];
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