"use strict";

require('polyfill/lib/weakmap.js');
require('js-ext/lib/object.js');

module.exports = function (window) {
    var NS, updateList;

    updateList = function(elementList, extendedElement, removed) {
        var index = elementList.indexOf(extendedElement);
        if (removed) {
            (index > -1) && elementList.splice(index, 1);
        }
        else {
            (index > -1) || (elementList[elementList.length]=extendedElement);
        }
    };

    if (!window._ITSAmodules) {
        Object.defineProperty(window, '_ITSAmodules', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {} // `writable` is false means we cannot chance the value-reference, but we can change {} its members
        });
    }

    NS = window._ITSAmodules.VDOM || (window._ITSAmodules.VDOM={});
    NS.voidElements || (NS.voidElements={});
    NS.nodeids || (NS.nodeids=[]);
    NS.nodesMap || (NS.nodesMap=new window.WeakMap());
    NS.VALID_NODE_TYPES = {
        1: true,
        3: true,
        8: true
    };
    NS.SCRIPT_OR_STYLE_TAG = {
        SCRIPT: true,
        STYLE: true
    };
    NS.LIFE_PROPERTIES = {
        'A': true,
        'APPLET': true,
        'EMBED': true,
        'FORM': true,
        'IMG': true,
        'SCRIPT': true,
        'STYLE': true,
        'AREA': true
    };
    NS.LIFE_PROPS = {};
    NS.updateLifeProps = function(extendedElement, removed) {
        // only if there was a request to the property before:
        var property = extendedElement.getVNode().tag,
            elementList;
        (elementList=NS.LIFE_PROPS[property]) && updateList(elementList, extendedElement, removed);
    };
    NS.updateLifeNamesList = function(extendedElement, removed) {
        // only if there was a request to the property before:
        var vnode = extendedElement.getVNode(),
            name = vnode.attrs && vnode.attrs.name,
            elementList;
        (elementList=NS.LIFE_NAMES[name]) && updateList(elementList, extendedElement, removed);
    };
    NS.updateLifeClassLists = function(extendedElement, removed) {
        var vnode = extendedElement.getVNode(),
            sourceVNode = vnode,
            LIFE_CLASSES, updateClass;
        updateClass = function(elementList, classesDefinition) {
            (sourceVNode.matchesSelector(classesDefinition)) && updateList(elementList, extendedElement, removed);
        };
/*jshint boss:true */
        while (vnode=vnode.parent) {
/*jshint boss:false */
            (LIFE_CLASSES=vnode.LIFE_CLASSES) && LIFE_CLASSES.each(updateClass);
        }
    };
    NS.updateLifeTagsLists = function(extendedElement, removed) {
        var vnode = extendedElement.getVNode(),
            tag = vnode.tag,
            LIFE_TAGS, elementList;
/*jshint boss:true */
        while (vnode=vnode.parent) {
/*jshint boss:false */
            (LIFE_TAGS=vnode.LIFE_TAGS) && (elementList=LIFE_TAGS[tag]) && updateList(elementList, extendedElement, removed);
        }
    };
    NS.updateLifeLists = function(extendedElement, removed) {
        NS.LIFE_PROPERTIES[extendedElement.tag] && NS.updateLifeProps(extendedElement, removed);
        NS.updateLifeClassLists(extendedElement, removed);
        NS.updateLifeTagsLists(extendedElement, removed);
        NS.updateLifeNamesList(extendedElement, removed);
    };

    return NS;
};