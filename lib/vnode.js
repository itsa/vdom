"use strict";

module.exports = function (window) {

    var NS = require('./vdom-ns.js')(window),
        updateLifeClassLists = NS.updateLifeClassLists,
        updateLifeNamesList = NS.updateLifeNamesList,
        updateLifeLists = NS.updateLifeLists,
        nodeids = NS.nodeids,
        nodesMap = NS.nodesMap,
        htmlToVNodes = require('./html-parser.js')(window),
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
        SELECTOR_IDENTIFIERS = {
            '#': 1,
            '.': 2,
            '[': 3
        },
        END_ATTRIBUTENAME = {
            '=': true,
            ']': true
        },
        matchesSelectorItem, matchesOneSelector, findSibling, findElementSibling, vNodeProto;

    matchesSelectorItem = function (vnode, selectorItem) {
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
                    if (!vnode.classNames[className]) {
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
                        // if attribute is string, then we need to remove to last stringmarker
                        attributeValue = attributeValue.substr(attributeValue.length-1);
                    }
                    else {
                        // if attribute is no string, then we need to typecast its value
                        isBoolean = ((attributeValue.length>3) && (attributeValue.length<6) && (checkBoolean=attributeValue.toUpperCase()) && ((checkBoolean==='FALSE') || (checkBoolean==='TRUE')));
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

    matchesOneSelector = function(vnode, selector) {
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
        selMatch = matchesSelectorItem(vnode, selectorItem);
        for (i=size-2; (selMatch && (i>=0)); i--) {
            selectorItem = selList[i];
            vnode = vnode.parent;
            while (vnode && !(selMatch=matchesSelectorItem(vnode, selectorItem))) {
                vnode = vnode.parent;
            }
        }
        return selMatch;
    };

    findNodeSibling = function(vnode, next) {
        var parent = vnode.parent,
            index;
        if (!parent) {
            return null;
        }
        index = parent.childNodes.indexOf(vnode) + (next ? 1 : -1);
        return parent.childNodes[index] || null;
    };

    findElementSibling = function(vnode, next) {
        var parent = vnode.parent,
            index;
        if (!parent) {
            return null;
        }
        index = parent.children.indexOf(vnode) + (next ? 1 : -1);
        return parent.children[index] || null;
    };

    vNodeProto = {
        setAttrs: function(newAttrs) {
            // does sync the DOM
            var instance = this,
                attrsObj, extNode, attr, attrs, id, i, key, keys, len, value;
            if (instance.nodeType!==1) {
                return;
            }
            extNode = instance.extNode;
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

            // first remove the attributes that are no longer needed.
            // quickest way for object iteration: http://jsperf.com/object-keys-iteration/20
            keys = Object.keys(attrs);
            len = keys.length;
            for (i = 0; i < len; i++) {
                key = keys[i];
                if (!attrsObj[key]) {
                    // attribute not in the new definition
                    extNode._removeAttribute(key);
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
                    extNode._setAttribute(key, value);
                    attrs[key] = value;
                }
            }

            // reset node's id:
            id = instance.id = attrs.id;
            // if valid id, then store the DOMnodeRef inside internal hash
            (id && extNode) ? (nodeids[id]=extNode) : (delete nodeids[id]);
        },

        setChildNodes: function(newVChildNodes) {
            // does sync the DOM
            var instance = this,
                childNodes = instance.childNodes,
                extNode = instance.extNode,
                i, oldChild, newChild, newLength, len, newChildExtNode, childExtNode,
                j, attrs, attrsLen, attribute, newAttrs;

            // quickest way to loop through array is by using for loops: http://jsperf.com/array-foreach-vs-for-loop/5
            len = childNodes.length;
            newLength = newVChildNodes.length;
            for (i=0; i<len; i++) {
                oldChild = childNodes[i];
                childExtNode = oldChild.extNode;
                if (i < newLength) {
                    newChild = newVChildNodes[i];
                    switch (NODESWITCH[oldChild.nodeType][newChild.nodeType]) {
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
                                newChild.setChildNodes(newChild.childNodes);
                                extNode._replaceChild(newChildExtNode, childExtNode);
                                newChild.parent = instance;
                                nodesMap.set(newChildExtNode._domNode, newChild);
                                newChild.id  && (nodeids[newChild.id]=newChildExtNode);
                                oldChild.replaceAtParent(newChild);
                                updateLifeLists(newChildExtNode);
                                updateLifeLists(oldChild.extNode, true);
                            }
                            else {
                                // same tag --> only update what is needed
                                attrs = oldChild.attrs;
                                newAttrs = newChild.attrs;
                                attrsLen = attrs.length;
                                // first remove any attributes that are no longer there:
                                for (j=0; j<attrsLen; j++) {
                                    attribute = attrs[j];
                                    newAttrs[attribute.name] || childExtNode._removeAttribute(attribute.name);
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
                                // next: sync the childnodes:
                                newChild.setChildNodes(newChild.childNodes);
                                newChild.attrs['class'] && updateLifeClassLists(newChild.extNode, true);
                                oldChild.attrs['class'] && updateLifeClassLists(oldChild.extNode, true, true);
                                newChild.attrs['name'] && updateLifeNamesList(newChild.extNode, true);
                                oldChild.attrs['name'] && updateLifeNamesList(oldChild.extNode, true, true);
                            }
                            break;
                        case 2: // oldNodeType==Element, newNodeType==TextNode
                            newChildExtNode = window.document.createTextNode(newChild.text);
                            extNode._replaceChild(newChildExtNode, childExtNode);
                            newChild.parent = instance;
                            nodesMap.set(newChildExtNode._domNode, newChild);
                            newChild.id  && (nodeids[newChild.id]=newChildExtNode);
                            oldChild.replaceAtParent(newChild);
                            updateLifeLists(oldChild.extNode, true);
                            break;
                        case 3: // oldNodeType==Element, newNodeType==Comment
                            newChildExtNode = window.document.createComment(newChild.text);
                            extNode._replaceChild(newChildExtNode, childExtNode);
                            newChild.parent = instance;
                            nodesMap.set(newChildExtNode._domNode, newChild);
                            newChild.id  && (nodeids[newChild.id]=newChildExtNode);
                            oldChild.replaceAtParent(newChild);
                            updateLifeLists(oldChild.extNode, true);
                            break;
                        case 4: // oldNodeType==TextNode, newNodeType==Element
                                // case4 and case7 should be treated the same
                        case 7: // oldNodeType==Comment, newNodeType==Element
                                nodesMap.delete(childExtNode._domNode);
                                newChildExtNode = window.document.createElement(newChild.tag);

                                attrs = newChild.attrs;
                                attrsLen = attrs.length;

                                for (j=0; j<attrsLen; j++) {
                                    attribute = attrs[j];
                                    newChildExtNode._setAttribute(attribute.name, attribute.value);
                                }

                                newChild.setChildNodes(newChild.childNodes);
                                extNode._replaceChild(newChildExtNode, childExtNode);
                                nodesMap.set(newChildExtNode._domNode, newChild);

                                newChild.id && (nodeids[newChild.id]=newChildExtNode);

                                oldChild.isVoid = newChild.isVoid;
                                delete oldChild.text;
                                updateLifeLists(newChildExtNode);
                            break;

                        case 5: // oldNodeType==TextNode, newNodeType==TextNode
                                // case5 and case8 should be treated the same
                        case 8: // oldNodeType==Comment, newNodeType==TextNode
                            if (oldChild.text !== newChild.text) {
                                nodesMap.delete(childExtNode._domNode);
                                newChildExtNode = window.document.createTextNode(newChild.text);
                                extNode._replaceChild(newChildExtNode, childExtNode);
                                nodesMap.set(newChildExtNode._domNode, newChild);
                                oldChild.text = newChild.text;
                            }
                            break;
                        case 6: // oldNodeType==TextNode, newNodeType==Comment
                                // case6 and case9 should be treated the same
                        case 9: // oldNodeType==Comment, newNodeType==Comment
                            if (oldChild.text !== newChild.text) {
                                nodesMap.delete(childExtNode._domNode);
                                newChildExtNode = window.document.createComment(newChild.text);
                                extNode._replaceChild(newChildExtNode, childExtNode);
                                nodesMap.set(newChildExtNode._domNode, newChild);
                                oldChild.text = newChild.text;
                            }
                    }
                }
                else {
                    // remove previous definition
                    oldChild.remove();
                    extNode._removeChild(oldChild.extNode);
                }
            }
            // now we add all new childNodes that go beyond `len`:
            for (i = len; i < newLength; i++) {
                newChild = newVChildNodes[i];
                newChild.parent = instance;
                switch (newChild.nodeType) {
                    case 1: // Element
                        newChildExtNode = window.document.createElement(newChild.tag);
                        attrs = newChild.attrs;
                        attrsLen = attrs.length;
                        for (j=0; j<attrsLen; j++) {
                            attribute = attrs[j];
                            newChildExtNode._setAttribute(attribute.name, attribute.value);
                        }
                        newChild.setChildNodes(newChild.childNodes);
                        extNode._appendChild(newChildExtNode);
                        newChild.extNode = newChildExtNode;
                        updateLifeLists(newChildExtNode);
                        break;
                    case 3: // TextNode
                        newChildExtNode = window.document.createTextNode(newChild.text);
                        extNode._appendChild(newChildExtNode);
                        break;
                    case 8: // CommentNode
                        newChildExtNode = window.document.createComment(newChild.text);
                        extNode._appendChild(newChildExtNode);
                }
                newChild.store();
            }
        },
        deleteFromParent: function() {
            var instance = this;
            instance.parent.childNodes.remove(instance);
        },
        hasChildNodes: function() {
            return this.childNodes && (this.childNodes.length>0);
        },
        hasChildElements: function() {
            return this.children && (this.children.length>0);
        },
        firstChild: function() {
            return (this.childNodes && this.childNodes[0]) || null;
        },
        firstChildElement: function() {
            return (this.children && this.children[0]) || null;
        },
        lastChild: function() {
            var childNodes = this.childNodes;
            return (childNodes && childNodes[childNodes.length-1]) || null;
        },
        lastChildElement: function() {
            var children = this.children;
            return (children && children[children.length-1]) || null;
        },
        first: function() {
            var parentNode = this.parent;
            if (!parentNode) {
                return null;
            }
            return parentNode.firstChild();
        },
        firstElement: function() {
            var parentNode = this.parent;
            if (!parentNode) {
                return null;
            }
            return parentNode.firstChildElement();
        },
        last: function() {
            var parentNode = this.parent;
            if (!parentNode) {
                return null;
            }
            return parentNode.lastChild();
        },
        lastElement: function() {
            var parentNode = this.parent;
            if (!parentNode) {
                return null;
            }
            return parentNode.lastChildElement();
        },
        next: function() {
            return findNodeSibling(this, true);
        },
        nextElement: function() {
            return findElementSibling(this, true);
        },
        previous: function() {
            return findNodeSibling(this);
        },
        previousElement: function() {
            return findElementSibling(this);
        },
        replaceAtParent: function(newVNode) {
            var instance = this,
                childNodes = instance.parent.childNodes,
                index = instance.parent.childNodes.indexOf(instance);
            childNodes[index] = newVNode;
            instance.remove();
        },
        store: function() {
            // store node/vnode inside WeakMap:
            var instance = this;
            nodesMap.set(instance.extNode._domNode, instance);
            // if valid id, then store the DOMnodeRef inside internal hash
            instance.id ? (nodeids[instance.id]=instance.extNode) : (delete nodeids[instance.id]);
        },
        remove: function() {
            var instance = this,
                childNodes = instance.childNodes,
                len, i, childNode;
            // first: remove all its children
            if (instance.nodeType===1) {
                len = childNodes.length;
                for (i=0; i < len; i++) {
                    childNode = childNodes[i];
                    childNode.remove();
                }
            }
            // remove node/vnode from WeakMap:
            nodesMap.delete(instance.extNode._domNode);
            // explicitely set instance.extNode to null in order to prevent problems with the GC
            instance.extNode = null;
            // if valid id, then remove the DOMnodeRef from internal hash
            instance.id && delete nodeids[instance.id];
            instance.deleteFromParent();
        },
        moveToParent: function(parentVNode, index) {
            var instance = this;
            instance.deleteFromParent();
            instance.parent = parentVNode;
            parentVNode.childNodes.insertAt(instance, index);
        },
        checkNewChildren: function() {
            // getVNode() will create and insert new vNodes when they are not present yet
            var childNodes = this.extNode.childNodes,
                len = childNodes.length, i;
            for (i=0; i<len; i++) {
                childNodes[i].getVNode();
            }
        },
        contains: function(extNode) {
            var otherVNode = this.getVNode(extNode);
            while (otherVNode && (otherVNode!==this)) {
                otherVNode = otherVNode.parent;
            }
            return (otherVNode===this);
        },
        matchesSelector: function(selectors) {
            var instance = this;
            selectors = selectors.split(',');
            // we can use Array.some, because there won't be many separated selectoritems,
            // so the final invocation won't be delayed much compared to looping
            return selectors.some(function(selector) {
                return matchesOneSelector(instance, selector);
            });
        }

    };

    Object.defineProperties(vNodeProto, {
        innerHTML: {
            get: function() {
                var instance = this,
                    html = '',
                    childNodes = instance.childNodes,
                    len = childNodes.length,
                    i, childnode;
                for (i=0; i<len; i++) {
                    childnode = childNodes[i];
                    html += (childnode.nodeType===1) ? childnode.outerHTML : (childnode.text || '');
                }
                return html;
            },
            set: function(v) {
                this.setChildNodes(htmlToVNodes(v));
            }
        },
        textContent: {
            get: function() {
                var instance = this,
                    text = '',
                    childNodes = instance.childNodes,
                    len = childNodes.length,
                    i, childnode;
                for (i=0; i<len; i++) {
                    childnode = childNodes[i];
                    text += (childnode.nodeType===3) ? childnode.text : ((childnode.nodeType===1) ? childnode.textContent : '');
                }
                return text;
            },
            set: function(v) {
                var instance = this,
                    childNodes = instance.childNodes,
                    len = childNodes.length,
                    domNode = instance.extNode,
                    i, childnode;
                instance.text = v;
                for (i=0; i<len; i++) {
                    childnode = childNodes[i];
                    domNode._removeChild(childnode.extNode._domNode);
                    childnode.remove();
                }
            }
        },
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
                if (vnode.tag!==instance.tag) {
                    nodesMap.delete(instance.extNode._domNode);
                    instance.id && delete nodeids[instance.id];
                    newElement = window.document.createElement(vnode.tag);
                    instance.parent.extNode.replaceChild(newElement);
                    instance.extNode = newElement;
                    nodesMap.set(newElement._domNode, vnode);
                }
                instance.setAttrs(vnode.attrs);
                instance.setChildNodes(vnode.childNodes);
            }
        }
    });

    module.exports = vNodeProto;

};