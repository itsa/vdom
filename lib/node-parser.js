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

module.exports = function (window) {

    var NS = require('./vdom-ns.js')(window),
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
        domNodeToVNode = function(domNode, parentVNode) {
            var nodeType = domNode.nodeType,
                vnode, attributes, attr, i, len, childNodes, domChildNode, classNames, classes, vChildNodes, tag, childVNode;
            if (!NS.VALID_NODE_TYPES[nodeType]) {
                // only process ElementNodes, TextNodes and CommentNodes
                return;
            }
            vnode = Object.create(vNodeProto);

            // set properties:
            vnode.domNode = domNode;
            // create circular reference:
            vnode.domNode._vnode = vnode;

            vnode.nodeType = nodeType;

            if (nodeType===1) {
                // ElementNode
                tag = vnode.tag = domNode.nodeName; // is always uppercase

                vnode.attrs = {};
                vnode.vParent = parentVNode;

                attributes = domNode.attributes;
                len = attributes.length;
                for (i=0; i<len; i++) {
                    attr = attributes[i];
                    vnode.attrs[attr.name] = attr.value;
                }

                vnode.id = vnode.attrs.id;
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
                vnode.vParent = parentVNode;
                vnode.text = domNode.nodeValue;
            }
            // store vnode:
            vnode.store();
            return vnode;
        };

    return domNodeToVNode;

};