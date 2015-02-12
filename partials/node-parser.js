"use strict";

/**
 * Exports `domNodeToVNode` which transforms dom-nodes into vnodes.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i><br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule node-parser
 * @since 0.0.1
*/

require('polyfill');
require('js-ext/lib/object.js');

var createHashMap = require('js-ext/extra/hashmap.js').createMap;

module.exports = function (window) {

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.NodeParser) {
        return window._ITSAmodules.NodeParser; // NodeParser was already created
    }

    var NS = require('./vdom-ns.js')(window),
        escapeEntities = NS.EscapeEntities,
        extractor = require('./attribute-extractor.js')(window),
        xmlNS = NS.xmlNS,
        voidElements = NS.voidElements,
        nonVoidElements = NS.nonVoidElements,
        vNodeProto = require('./vnode.js')(window),
        /**
         * Transforms a dom-node into a vnode.
         *
         * @method domNodeToVNode
         * @param domNode {Node} The dom-node to be transformed
         * @param [parentVNode] {vnode} the parent-vnode that belongs to the dom-node
         * @return {vnode} the vnode-representation of the dom-node
         * @since 0.0.1
         */
        domNodeToVNode = window._ITSAmodules.NodeParser = function(domNode, parentVNode) {
            var nodeType = domNode.nodeType,
                vnode, attributes, attr, i, len, childNodes, domChildNode, vChildNodes, tag,
                childVNode, extractClass, extractStyle, attributeName;
            if (!NS.VALID_NODE_TYPES[nodeType]) {
                // only process ElementNodes, TextNodes and CommentNodes
                return;
            }
            vnode = Object.create(vNodeProto);

            // set properties:
            vnode.domNode = domNode;
            // create circular reference:
            vnode.domNode._vnode = vnode;

            parentVNode && (vnode.ns=parentVNode.ns);
            vnode.nodeType = nodeType;
            vnode.vParent = parentVNode;

            if (nodeType===1) {
                // ElementNode
                tag = vnode.tag = domNode.nodeName; // is always uppercase
                vnode.isItag = ((tag[0]==='I') && (tag[1]==='-'));
                vnode.ns = xmlNS[tag] || vnode.ns;

                vnode.attrs = {};

                attributes = domNode.attributes;
                len = attributes.length;
                for (i=0; i<len; i++) {
                    attr = attributes[i];
                    // always store the `is` attribute in lowercase:
                    attributeName = ((attr.name.length===2) && (attr.name.toLowerCase()==='is')) ? 'is' : attr.name;
                    vnode.attrs[attributeName] = String(attr.value);
                }

                vnode.id = vnode.attrs.id;

                extractClass = extractor.extractClass(vnode.attrs['class']);
                extractClass.attrClass && (vnode.attrs['class']=extractClass.attrClass);
                vnode.classNames = extractClass.classNames;

                extractStyle = extractor.extractStyle(vnode.attrs.style);
                extractStyle.attrStyle && (vnode.attrs.style=extractStyle.attrStyle);
                vnode.styles = extractStyle.styles;

                if (voidElements[tag]) {
                    vnode.isVoid = true;
                }
                else if (nonVoidElements[tag]) {
                    vnode.isVoid = false;
                }
                else {
                    (vnode.isVoid=!(new RegExp('</'+tag+'>$', 'i')).test(domNode.outerHTML)) ? (voidElements[tag]=true) : (nonVoidElements[tag]=true);
                }

                if (!vnode.isVoid) {
                    // in case of 'SCRIPT' or 'STYLE' tags --> just use the innertext, all other tags need to be extracted
                    if (NS.SCRIPT_OR_STYLE_TAG[tag]) {
                        vnode.text = domNode.textContent;
                    }
                    else {
                        vChildNodes = vnode.vChildNodes = [];
                        childNodes = domNode.childNodes;
                        len = childNodes.length;
                        for (i=0; i<len; i++) {
                            domChildNode = childNodes[i];
                            childVNode = domNodeToVNode(domChildNode, vnode);
                            vChildNodes[vChildNodes.length] = childVNode;
                        }
                    }
                }
            }
            else {
                // TextNode or CommentNode
                vnode.text = escapeEntities(domNode.nodeValue);
                // vnode.text = (nodeType===3) ? escapeEntities(domNode.nodeValue) : domNode.nodeValue;
            }
            // store vnode's id:
            vnode.storeId();
            return vnode;
        };

    return domNodeToVNode;

};