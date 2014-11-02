"use strict";

module.exports = function (window) {

    var vElement = require('./v-element.js')(window),
        NS = require('./vdom-ns.js')(window),
        voidElements = NS.voidElements,
        nonVoidElements = NS.nonVoidElements,
        vNodeProto = require('./vnode.js')(window),
        domNodeToVNode = function(domNode, parentVNode) {
            var nodeType = domNode.nodeType,
                vnode, attributes, attr, i, len, childNodes, domChildNode, classNames, classes, vChildNodes, tag, childVNode;
            if (!NS.VALID_NODE_TYPES[nodeType]) {
                // only process ElementNodes, TextNodes and CommentNodes
                return;
            }
            vnode = Object.create(vNodeProto);

            // set properties:
            vnode.vElement = vElement(domNode);
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
                // TextNode
                vnode.text = domNode.nodeValue;
            }
            // store vnode:
            vnode.store();
            return vnode;
        };

    module.exports = domNodeToVNode;

};