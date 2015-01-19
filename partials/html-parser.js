"use strict";

/**
 * Exports `htmlToVNodes` which transforms html-text into vnodes.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule html-parser
 * @since 0.0.1
*/

require('polyfill');
require('js-ext/lib/object.js');

var createHashMap = require('js-ext/extra/hashmap.js').createMap;

module.exports = function (window) {

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.HtmlParser) {
        return window._ITSAmodules.HtmlParser; // HtmlParser was already created
    }

    var NS = require('./vdom-ns.js')(window),
        extractor = require('./attribute-extractor.js')(window),
        DOCUMENT = window.document,
        xmlNS = NS.xmlNS,
        voidElements = NS.voidElements,
        nonVoidElements = NS.nonVoidElements,

        TAG_OR_ATTR_START_CHARACTERS = createHashMap({
            a: true,
            b: true,
            c: true,
            d: true,
            e: true,
            f: true,
            g: true,
            h: true,
            i: true,
            j: true,
            k: true,
            l: true,
            m: true,
            n: true,
            o: true,
            p: true,
            q: true,
            r: true,
            s: true,
            t: true,
            u: true,
            v: true,
            w: true,
            x: true,
            y: true,
            z: true,
            A: true,
            B: true,
            C: true,
            D: true,
            E: true,
            F: true,
            G: true,
            H: true,
            I: true,
            J: true,
            K: true,
            L: true,
            M: true,
            N: true,
            O: true,
            P: true,
            Q: true,
            R: true,
            S: true,
            T: true,
            U: true,
            V: true,
            W: true,
            X: true,
            Y: true,
            Z: true
        }),
        STARTTAG_OR_ATTR_VALUE_ENDS_CHARACTERS = createHashMap({
            ' ': true,
            '>': true
        }),
        ATTRUBUTE_NAME_ENDS_CHARACTER = createHashMap({
            ' ': true,
            '=': true,
            '>': true
        }),

        /**
         * Transforms html-text into a vnodes-Array.
         *
         * @method htmlToVNodes
         * @param htmlString {String} plain html as string
         * @return {Array} array with `vnodes`
         * @since 0.0.1
         */
        htmlToVNodes = window._ITSAmodules.HtmlParser = function(htmlString, vNodeProto, nameSpace) {
            var i = 0,
                len = htmlString.length,
                vnodes = [],
                parentVNode = arguments[3], // private pass through-argument, only available when internal looped
                insideTagDefinition, insideComment, innerText, endTagCount, stringMarker, attributeisString, attribute, attributeValue,
                j, character, character2, vnode, tag, isBeginTag, isEndTag, scriptVNode, extractClass, extractStyle;
            while (i<len) {
                character = htmlString[i];
                character2 = htmlString[i+1];
                if (insideTagDefinition) {

                    vnode.attrs = {};
                    if (character!=='>') {
                        // fill attributes until tagdefinition is over:
                        // NOTE: we need to DOUBLE check for "(character!=='>')" because the loop might set the position to '>' where an i++ would miss it!
                        while ((character!=='>') && (++i<len) && (character=htmlString[i]) && (character!=='>')) {
                            // when starting to read an attribute, finish reading until it is completely ready.
                            // this is, because attributes can have a '>' which shouldn't be noticed as an end-of-tag definition
                            if (TAG_OR_ATTR_START_CHARACTERS[character]) {
                                attribute = character;
                                while ((++i<len) && (character=htmlString[i]) && !ATTRUBUTE_NAME_ENDS_CHARACTER[character]) {
                                    attribute += character;
                                }
                                if (character==='=') {
                                    stringMarker = htmlString[i+1];
                                    attributeisString = (stringMarker==='"') || (stringMarker==="'");

                                    attributeValue = '';
                                    if (attributeisString) {
                                        i++;
                                        while ((++i<len) && (character=htmlString[i]) && ((character!==stringMarker) || (htmlString[i-1]==='\\'))) {
                                            ((htmlString[i+1]!==stringMarker) || (character!=='\\')) && (attributeValue+=character);
                                        }
                                    }
                                    else {
                                        while ((++i<len) && (character=htmlString[i]) && !STARTTAG_OR_ATTR_VALUE_ENDS_CHARACTERS[character]) {
                                            attributeValue += character;
                                        }
                                        // need to set the position one step behind --> the attributeloop will increase it and would otherwise miss a character
                                        i--;
                                    }
                                }
                                else {
                                    attributeValue = "";
                                }
                                vnode.attrs[attribute] = attributeValue;
                            }
                        }
                        vnode.id = vnode.attrs.id;

                        extractClass = extractor.extractClass(vnode.attrs['class']);
                        extractClass.attrClass && (vnode.attrs['class']=extractClass.attrClass);
                        vnode.classNames = extractClass.classNames;

                        extractStyle = extractor.extractStyle(vnode.attrs.style);
                        extractStyle.attrStyle && (vnode.attrs.style=extractStyle.attrStyle);
                        vnode.styles = extractStyle.styles;

                    }

                    if (!vnode.isVoid) {
                        innerText = '';
                        endTagCount = 1;
                        // fill innerText until end-tagdefinition:
                        while ((endTagCount>0) && (++i<len) && (character=htmlString[i])) {
                            if (character==='<') {
                                if ((character2=htmlString[i+1]) && (character2==='/')) {
                                    // possible end-tag
                                    j = i+1;
                                    isEndTag = true;
                                    while (isEndTag && (++j<len) && (htmlString[j]!=='>')) {
                                        if (htmlString[j].toUpperCase()!==tag[j-i-2]) {
                                            isEndTag = false;
                                        }
                                    }
                                    isEndTag && (endTagCount--);
                                }
                                else {
                                    // possible begin-tag of the same tag (an innertag with the same tagname)
                                    j = i;
                                    isBeginTag = true;
                                    while (isBeginTag && (++j<len) && (character2=htmlString[j]) && (character2!=='>') && (character2!==' ')) {
                                        if (htmlString[j].toUpperCase()!==tag[j-i-1]) {
                                            isBeginTag = false;
                                        }
                                    }
                                    isBeginTag && (endTagCount++);
                                }
                            }
                            if (endTagCount>0) {
                                innerText += character;
                            }
                        }
                        (endTagCount===0) && (i=i+tag.length+3);
                        // in case of 'SCRIPT' or 'STYLE' tags --> just use the innertext, all other tags need to be extracted

                        if (NS.SCRIPT_OR_STYLE_TAG[vnode.tag]) {
                            // CREATE INNER TEXTNODE
                            scriptVNode = Object.create(vNodeProto);
                            scriptVNode.ns = nameSpace;
                            scriptVNode.nodeType = 3;
                            scriptVNode.domNode = DOCUMENT.createTextNode(innerText);
                            // create circular reference:
                            scriptVNode.domNode._vnode = scriptVNode;
                            scriptVNode.text = innerText;
                            scriptVNode.vParent = vnode;
                            vnode.vChildNodes = [scriptVNode];
                        }
                        else {
                            vnode.vChildNodes = (innerText!=='') ? htmlToVNodes(innerText, vNodeProto, vnode.ns, vnode) : [];
                        }
                    }
                    else {
                        i++; // compensate for the '>'
                    }
                    vnodes[vnodes.length] = vnode;
                    // reset vnode to force create a new one
                    vnode = null;
                    insideTagDefinition = false;
                }

                else if (insideComment) {
                    if (character+character2+htmlString[i+2]==='-->') {
                        // close vnode
                        // move index to last character of comment
                        i = i+2;
                        vnode.domNode = DOCUMENT.createComment('');
                        // create circular reference:
                        vnode.domNode._vnode = vnode;
                        vnodes[vnodes.length] = vnode;
                        // reset vnode to force create a new one
                        vnode = null;
                        insideComment = false;
                    }
                    else {
                        vnode.text += character;
                    }
                    i++;
                }

                else {
                    // inside TextNode which could go over into an Element or CommentNode
                    if ((character==='<') && TAG_OR_ATTR_START_CHARACTERS[character2] && (htmlString.lastIndexOf('>')>i)) {
                        // begin of opening Element
                        // first: store current vnode:
                        if (vnode) {
                            vnode.domNode = DOCUMENT.createTextNode('');
                            // create circular reference:
                            vnode.domNode._vnode = vnode;
                            vnodes[vnodes.length] = vnode;
                        }
                        vnode = Object.create(vNodeProto);
                        vnode.ns = nameSpace;
                        vnode.nodeType = 1;
                        vnode.vParent = parentVNode;
                        vnode.tag = '';
                        vnode.classNames ={};

                        // find tagname:
                        while ((++i<len) && (character=htmlString[i]) && (!STARTTAG_OR_ATTR_VALUE_ENDS_CHARACTERS[character])) {
                            vnode.tag += character.toUpperCase();
                        }

                        tag = vnode.tag;
                        vnode.ns = xmlNS[tag] || nameSpace;
                        vnode.domNode = vnode.ns ? DOCUMENT.createElementNS(vnode.ns, tag.toLowerCase()) : DOCUMENT.createElement(tag);

                        // create circular reference:
                        vnode.domNode._vnode = vnode;
                        // check if it is a void-tag, but only need to do the regexp once per tag-element:
                        if (voidElements[tag]) {
                            vnode.isVoid = true;
                        }
                        else if (nonVoidElements[tag]) {
                            vnode.isVoid = false;
                        }
                        else {
                            vnode.isVoid = ((tag[0]==='I') && (tag[1]==='-')) ? false : !(new RegExp('</'+tag+'>', 'i')).test(htmlString);
                            vnode.isVoid ? (voidElements[tag]=true) : (nonVoidElements[tag]=true);
                        }
                        insideTagDefinition = true;
                    }
                    else if (character+character2+htmlString[i+2]+htmlString[i+3]==='<!--') {
                        // begin of CommentNode
                        if (vnode) {
                            vnode.domNode = DOCUMENT.createTextNode('');
                            // create circular reference:
                            vnode.domNode._vnode = vnode;
                            vnodes[vnodes.length] = vnode;
                        }
                        vnode = Object.create(vNodeProto);
                        vnode.ns = nameSpace;
                        vnode.nodeType = 8;
                        vnode.text = '';
                        vnode.vParent = parentVNode;
                        // move index to first character of comment
                        i = i+4;
                        insideComment = true;
                    }
                    else {
                        if (!vnode) {
                            // no current vnode --> create a TextNode:
                            vnode = Object.create(vNodeProto);
                            vnode.ns = nameSpace;
                            vnode.nodeType = 3;
                            vnode.text = '';
                            vnode.vParent = parentVNode;
                        }
                        vnode.text += character;
                        i++;
                    }
                }
            }

            if (vnode) {
                vnode.domNode = DOCUMENT.createTextNode('');
                // create circular reference:
                vnode.domNode._vnode = vnode;
                vnodes[vnodes.length] = vnode;
            }
            return vnodes;
        };

    return htmlToVNodes;

};