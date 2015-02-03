"use strict";

/**
 * Provides several methods that override native Element-methods to work with the vdom.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule extend-element
 * @class Element
 * @since 0.0.1
*/


require('../css/element.css');
require('js-ext/lib/object.js');
require('js-ext/lib/string.js');
require('js-ext/lib/promise.js');
require('polyfill');

var createHashMap = require('js-ext/extra/hashmap.js').createMap;

module.exports = function (window) {

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.ExtendElement) {
        return; // ExtendElement was already created
    }

    // prevent double definition:
    window._ITSAmodules.ExtendElement = true;

    var NAME = '[extend-element]: ',
        ElementArray = require('./element-array.js')(window),
        domNodeToVNode = require('./node-parser.js')(window),
        htmlToVNodes = require('./html-parser.js')(window),
        vNodeProto = require('./vnode.js')(window),
        NS = require('./vdom-ns.js')(window),
        RUNNING_ON_NODE = (typeof global !== 'undefined') && (global.window!==window),
        TRANSITION = 'transition',
        TRANSFORM = 'transform',
        BROWSERS_SUPPORT_PSEUDO_TRANS = false, // set true as soon as they do
        SUPPORTS_PSEUDO_TRANS = null, // is a life check --> is irrelevant as long BROWSERS_SUPPORT_PSEUDO_TRANS === false
        VENDOR_CSS = require('polyfill/extra/vendorCSS.js')(window),
        generateVendorCSSProp = VENDOR_CSS.generator,
        VENDOR_CSS_PROPERTIES = VENDOR_CSS.cssProps,
        VENDOR_TRANSFORM_PROPERTY = generateVendorCSSProp(TRANSFORM),
        VENDOR_TRANSITION_PROPERTY = require('polyfill/extra/transition.js')(window), // DO NOT use TRANSITION-variable here --> browserify cannot deal this
        EV_TRANSITION_END = require('polyfill/extra/transitionend.js')(window),
        _BEFORE = ':before',
        _AFTER = ':before',
        extractor = require('./attribute-extractor.js')(window),
        UTILS = require('utils'),
        later = UTILS.laterSilent,
        async = UTILS.asyncSilent,
        idGenerator = UTILS.idGenerator,
        DOCUMENT = window.document,
        nodeids = NS.nodeids,
        arrayIndexOf = Array.prototype.indexOf,
        POSITION = 'position',
        ITSA_ = 'itsa-',
        BLOCK = ITSA_+'block',
        BORDERBOX = ITSA_+'borderbox',
        NO_TRANS = ITSA_+'notrans',
        NO_TRANS2 = NO_TRANS+'2', // needed to prevent removal of NO_TRANS when still needed `notrans`
        INVISIBLE = ITSA_+'invisible',
        INVISIBLE_RELATIVE = INVISIBLE+'-relative',
        INVISIBLE_UNFOCUSABLE = INVISIBLE+'-unfocusable',
        HIDDEN = ITSA_+'hidden',
        REGEXP_NODE_ID = /^#\S+$/,
        LEFT = 'left',
        TOP = 'top',
        BORDER = 'border',
        WIDTH = 'width',
        HEIGHT = 'height',
        STRING = 'string',
        CLASS = 'class',
        STYLE = 'style',
        OVERFLOW = 'overflow',
        SCROLL = 'scroll',
        BORDER_LEFT_WIDTH = BORDER+'-left-'+WIDTH,
        BORDER_RIGHT_WIDTH = BORDER+'-right-'+WIDTH,
        BORDER_TOP_WIDTH = BORDER+'-top-'+WIDTH,
        BORDER_BOTTOM_WIDTH = BORDER+'-bottom-'+WIDTH,
        NUMBER = 'number',
        PX = 'px',
        SET = 'set',
        TOGGLE = 'toggle',
        REPLACE = 'replace',
        REMOVE = 'remove',
        _STARTSTYLE = '_startStyle',
        setupObserver,
        SIBLING_MATCH_CHARACTER = createHashMap({
            '+': true,
            '~': true
        }),
        NON_CLONABLE_STYLES = createHashMap({
            absolute: true,
            hidden: true,
            block: true
        }),
        // CSS_PROPS_TO_CALCULATE should not be a hashMap, but an object --> we need to iterate with .each
        CSS_PROPS_TO_CALCULATE = { // http://www.w3.org/TR/css3-transitions/#animatable-css
            backgroundColor: true,
            backgroundPositionX: true,
            backgroundPositionY: true,
            borderBottomColor: true,
            borderBottomWidth: true,
            borderLeftColor: true,
            borderLeftWidth: true,
            borderRightColor: true,
            borderRightWidth: true,
            borderTopColor: true,
            borderTopWidth: true,
            borderSpacing: true,
            bottom: true,
            clip: true,
            color: true,
            fontSize: true,
            fontWeight: true,
            height: true,
            left: true,
            letterSpacing: true,
            lineHeight: true,
            marginBottom: true,
            marginTop: true,
            marginLeft: true,
            marginRight: true,
            maxHeight: true,
            maxWidth: true,
            minHeight: true,
            minWidth: true,
            opacity: true,
            outlineColor: true,
            outlineWidth: true,
            paddingBottom: true,
            paddingTop: true,
            paddingLeft: true,
            paddingRight: true,
            right: true,
            textIndent: true,
            textShadow: true,
            verticalAlign: true,
            // visibility: true,  DO NOT use visibility!
            width: true,
            wordSpacing: true,
            zIndex: true
        },
        // CSS_PROPS_TO_CALCULATE.transform is set later on by the vendor specific transform-property
        htmlToVFragments = function(html, nameSpace) {
            var vnodes = htmlToVNodes(html, vNodeProto, nameSpace),
                len = vnodes.length,
                vnode, i, bkpAttrs, bkpVChildNodes;
            for (i=0; i<len; i++) {
                vnode = vnodes[i];
                if (vnode.nodeType===1) {
                    // same tag --> only update what is needed
                    bkpAttrs = vnode.attrs;
                    bkpVChildNodes = vnode.vChildNodes;

                    // reset, to force creation of inner domNodes:
                    vnode.attrs = {};
                    vnode.vChildNodes = [];

                    // next: sync the vnodes:
                    vnode._setAttrs(bkpAttrs);
                    vnode._setChildNodes(bkpVChildNodes);
                }
                else {
                    vnode.domNode.nodeValue = vnode.text;
                }
            }
            return {
                isFragment: true,
                vnodes: vnodes
            };
        },
        toCamelCase = function(input) {
            input || (input='');
            return input.replace(/-(.)/g, function(match, group) {
                return group.toUpperCase();
            });
        },
        fromCamelCase = function(input) {
            input || (input='');
            return input.replace(/[a-z]([A-Z])/g, function(match, group) {
                return match[0]+'-'+group.toLowerCase();
            });
        },
        getVendorCSS = function(cssProperties) {
            var uniqueProps = {},
                i, len, prop, safeProperty, uniqueSafeProperty;
            len = cssProperties.length;
            for (i=len-1; i>=0; i--) {
                // set the right property, but also dedupe when there are multiple same vendor-properties
                prop = cssProperties[i];
                safeProperty = prop.property;
                if (safeProperty) {
                    safeProperty = fromCamelCase(safeProperty);
                    uniqueSafeProperty = safeProperty+'#'+prop.pseudo;
                    VENDOR_CSS_PROPERTIES[safeProperty] || (safeProperty=generateVendorCSSProp(safeProperty));
                    if (uniqueProps[uniqueSafeProperty]) {
                        cssProperties.splice(i, 1);
                    }
                    else {
                        uniqueProps[uniqueSafeProperty] = true;
                        prop.property = safeProperty;
                    }
                }
            }
            return cssProperties;
        },
        vendorSupportsPseudoTrans = function() {
            // DO NOT CHANGE THIS FUNCTION!
            // it does exactly what it should do:
            // Sarari seems to support speudo transmisions, however it calculates css-properties wrong when they are 'undefined'
            // within a specific node, while the 'non-pseudo' is defined.
            // This would lead into a wrong calculation (too many) of the number of expected transitionend-events
            // Thus, this feature is disabled in some specific browsers
            if (SUPPORTS_PSEUDO_TRANS) {
                return SUPPORTS_PSEUDO_TRANS;
            }
            var cssnode, node, nodeParent;
            DOCUMENT.body.prepend('<style id="vendorSupportsPseudoTrans_css" type="text/css">#vendorSupportsPseudoTransParent {background-color:#F00;} #vendorSupportsPseudoTrans {background-color:#00F;}</style>');
            DOCUMENT.body.prepend('<div id="vendorSupportsPseudoTransParent"><div id="vendorSupportsPseudoTrans"></div></div>');
            node = DOCUMENT.getElement('#vendorSupportsPseudoTrans');
            nodeParent = DOCUMENT.getElement('#vendorSupportsPseudoTransParent');
            cssnode = DOCUMENT.getElement('#vendorSupportsPseudoTrans_css');
            SUPPORTS_PSEUDO_TRANS = node.getStyle('background-color')!==node.getStyle('background-color', ':before');
            cssnode.remove();
            nodeParent.remove();
            return SUPPORTS_PSEUDO_TRANS;
        },
        getTransPromise = function(node, hasTransitionedStyle, removalPromise, afterTransEventsNeeded, transitionProperties, maxtranstime) {
            var promise, fallback;
            afterTransEventsNeeded || (afterTransEventsNeeded=1);
            if (hasTransitionedStyle) {
                promise = new window.Promise(function(fulfill) {
                    var afterTrans = function(e) {
                        var finishedProperty = e.propertyName,
                            index;
                        if (finishedProperty) {
                            // some browsers support this feature: now we can exactly determine what promise to fulfill
                            delete transitionProperties[finishedProperty];
                            // in case of shorthand properties (such as padding) allmost all browsers
                            // fire multiple detailed events (http://www.smashingmagazine.com/2013/04/26/css3-transitions-thank-god-specification/).
                            // therefore, we also must delete the shortcut property when a detailed property gets fired:
                            index = finishedProperty.indexOf('-');
                            if (index!==-1) {
                                finishedProperty = finishedProperty.substr(0, index);
                                delete transitionProperties[finishedProperty];
                            }
                            // now fulfill when empty:
                            if (transitionProperties.isEmpty()) {
                                fallback.cancel();
                                console.log('Transition fulfilled');
                                node.removeEventListener(EV_TRANSITION_END, afterTrans, true);
                                fulfill();
                            }
                        }
                        else {
                            // in cae the browser doesn't support e.propertyName, we need to countdown:
                            if (--afterTransEventsNeeded<=0) {
                                fallback.cancel();
                                node.removeEventListener(EV_TRANSITION_END, afterTrans, true);
                                console.log('Transition fulfilled by counting nr. of endTransition events');
                                fulfill();
                            }
                        }
                    };
                    if (EV_TRANSITION_END===undefined) {
                        // no transition supported
                        console.log('No endTransition events supported: transition fulfilled');
                        fulfill();
                    }
                    else {
                        node.addEventListener(EV_TRANSITION_END, afterTrans, true);
                        fallback = later(function(){
                            console.log('Transition fulfilled by timer');
                            fulfill();
                        }, maxtranstime*1000+50); // extra 50 ms, after all, it is a fallback, we don't want it to take over the original end-transition-events
                    }
                });
                removalPromise && (promise=window.Promise.finishAll([promise, removalPromise]));
            }
            else {
                promise = removalPromise || window.Promise.resolve();
            }
            return promise;
        },
        getClassTransPromise = function(node, method, className, extraData1, extraData2) {
            // first. check if the final node has a transitioned property.
            // If not, then return as fulfilled. If so, then check for all the transitioned properties,
            // if there is any who changes its calculated value. If not, then return as fulfilled. If so, then setup
            // the evenlistener
            var resolvedPromise = window.Promise.resolve(),
                currentInlineCSS = [],
                finalInlineCSS = [],
                finalNode, getsTransitioned, originalCSS, finalCSS, transPropertiesElement, transPropertiesBefore, transPropertiesAfter, bkpFreezedData1, endIntermediate,
                promise, finalCSS_before, finalCSS_after, transpromise, manipulated, getCurrentProperties, currentProperties, bkpNodeData, bkpFreezed, cleanup,
                originalCSS_before, originalCSS_after, searchTrans, generateInlineCSS, finalStyle, unFreeze, freezedExtraData1, startStyle, unfreezePromise,
                transprops, transpropsBefore, transpropsAfter, time1, time2;

            time1 = Date.now();
            bkpNodeData = idGenerator('bkpNode');
            bkpFreezed = idGenerator('bkpFreezed');
            bkpFreezedData1 = idGenerator('bkpFreezedData1');
            if ((method===TOGGLE) && !extraData1) {
                // because -when toggling- the future current node-class might have been changed:
                freezedExtraData1 = !node.hasClass(className);
            }
            unFreeze = function(options) {
                var bkpFreezedStyle = node.getData(bkpFreezed),
                    finish = options && options.finish,
                    cancel = options && options.cancel,
                    transitioned = !finish;
                bkpFreezedData1 = node.getData(bkpFreezedData1);
                if (bkpFreezedStyle!==undefined) {
                    if (finish || cancel) {
                        node.setClass(NO_TRANS2);
                    }
                    else {
                        node.setData(_STARTSTYLE, bkpFreezedStyle);
                    }
                    if (!cancel) {
                        switch(method) {
                            case SET:
                                unfreezePromise = node.setClass(className, transitioned);
                            break;
                            case REPLACE:
                                unfreezePromise = node.replaceClass(extraData1, className, extraData2, transitioned);
                            break;
                            case REMOVE:
                                unfreezePromise = node.removeClass(className, transitioned);
                            break;
                            case TOGGLE:
                                unfreezePromise = node.toggleClass(className, (bkpFreezedData1===undefined) ? extraData1 : bkpFreezedData1, transitioned);
                            break;
                        }
                    }
                    else {
                        unfreezePromise = resolvedPromise;
                    }
                    async(function() {
                        node.removeData(bkpFreezed);
                        node.removeData(bkpFreezedData1);
                    });
                    if (finish || cancel) {
                        finalStyle = finalNode.getAttr(STYLE);
                        node.setAttr(STYLE, finalStyle);
                        later(function() { // not just async --> it seems we need more time
                            node.removeClass(NO_TRANS2);
                        }, 50);
                        unfreezePromise = resolvedPromise;
                    }
                    return unfreezePromise;
                }
                return promise;
            };

            resolvedPromise.cancel = function() { /* NOOP for compatibility */ };
            resolvedPromise.freeze = function() { return window.Promise.resolve(0); /* compatibility */ };
            resolvedPromise.unfreeze = unFreeze;
            resolvedPromise.finish = function() { /* NOOP for compatibility */ };
            if (EV_TRANSITION_END===undefined) {
                return resolvedPromise;
            }
            cleanup = function() {
                // we manipulate the classes as they should be, before returning the original inline style:
                // all without Promise-return!
                if (!promise.cancelled && !promise.frozen) {
                    switch(method) {
                        case SET:
                            node.setClass(className);
                        break;
                        case REPLACE:
                            node.replaceClass(extraData1, className, extraData2);
                        break;
                        case REMOVE:
                            node.removeClass(className);
                        break;
                        case TOGGLE:
                            node.toggleClass(className, extraData1);
                        break;
                    }
                }
                // last transitionrun: reset the inline css:
                finalStyle = finalNode.getAttr(STYLE);
                if (!promise.frozen) {
                    node.removeData(bkpFreezed);
                    node.removeData(bkpFreezedData1);
                    node.setClass(NO_TRANS2);
                    node.setAttr(STYLE, finalStyle);
                }
                else {
                    node.setData(bkpFreezed, finalStyle);
                }
                node.removeData(bkpNodeData);
                finalNode.remove();
                async(function() {
                    node.removeClass(NO_TRANS2);
                    promise.fulfill();
                });
            };
            endIntermediate = function(type) {
                if (!promise.isFulfilled) {
                    manipulated = true;
                    node.setData(bkpFreezedData1, freezedExtraData1);
                    currentProperties = getCurrentProperties(node, transprops);
                    node.setClass(NO_TRANS2);
                    node.setInlineStyles(currentProperties, false, true);
                    if (BROWSERS_SUPPORT_PSEUDO_TRANS) {
                        node.setInlineStyles(getCurrentProperties(node, transpropsBefore, ':before'), false, true);
                        node.setInlineStyles(getCurrentProperties(node, transpropsAfter, ':after'), false, true);
                    }
                    // also force to set the style on the node outside the vdom --> by forcing this
                    // we won't run into the situation where the vdom doesn't change the dom because the style didn';'t change:
                    node._setAttribute(STYLE, node.getAttr(STYLE));
                    Object.defineProperty(promise, 'isFulfilled', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: true
                    });
                    Object.defineProperty(promise, type, {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: true
                    });
                    if (transpromise) {
                        transpromise.reject(); // prevent transitionpromise to set its own final values after finishing
                    }
                    else {
                        // in case `transpromise` wasn't setup yet:
                        async(function() {
                            transpromise.reject(); // prevent transitionpromise to set its own final values after finishing
                        });
                    }
                }
                time2 || (time2=Date.now());
                return new window.Promise(function(resolve) {
                    async(function() {
                        resolve(time2-time1);
                    });
                });
            };
            searchTrans = function(CSS1, CSS2, transProperties) {
                var allTrans = !!transProperties.all,
                    searchObject = allTrans ? CSS_PROPS_TO_CALCULATE : transProperties,
                    transprops = {};

                searchObject.each(function(transProp, key) {
                    // transProp will always be a vendor-specific property already
                    key = toCamelCase(key);
                    if (CSS1[key]!==CSS2[key]) {
                        transprops[key] = true;
                    }
                });
                return (transprops.size()>0) ? transprops : null;
            };
            generateInlineCSS = function(group, transProperties, CSS1, CSS2) {
                transProperties.each(function(value, key) {
                    var prop1 = {property: key, value: CSS1[key]},
                        prop2 = {property: key, value: CSS2[key]};
                    if (group) {
                        prop1.pseudo = group;
                        prop2.pseudo = group;
                    }
                    currentInlineCSS[currentInlineCSS.length] = prop1;
                    finalInlineCSS[finalInlineCSS.length] = prop2;
                });
            };

            getCurrentProperties = function(node, transProperties, group) {
                var props = [],
                    styles = window.getComputedStyle(node, group);
                transProperties.each(function(value, property) {
                    // if property is vendor-specific transition, or transform, than we reset it to the current vendor
                    props.push({
                        property: property,
                        value: styles[toCamelCase(property)],
                        pseudo: group
                    });
                });
                return props;
            };

            finalNode = node.cloneNode(true);
            finalNode.setClass(NO_TRANS2);
            finalNode.setClass(INVISIBLE_UNFOCUSABLE);
            node.setData(bkpNodeData, finalNode);

            startStyle = node.getData(_STARTSTYLE);
            if (startStyle!==undefined) {
                finalNode.setAttr(STYLE, startStyle);
                node.removeData(_STARTSTYLE);
            }

            switch(method) {
                case SET:
                    finalNode.setClass(className);
                break;
                case REPLACE:
                    finalNode.replaceClass(extraData1, className, extraData2);
                break;
                case REMOVE:
                    finalNode.removeClass(className);
                break;
                case TOGGLE:
                    finalNode.toggleClass(className, extraData1);
                break;
            }
            // insert in the dom, to make its style calculatable:
            DOCUMENT.body.append(finalNode);

            // check the css-property `transition`
            finalNode.removeClass(NO_TRANS2);
            transPropertiesElement = finalNode.getStyle(TRANSITION);
            transPropertiesBefore = finalNode.getStyle(TRANSITION, _BEFORE);
            transPropertiesAfter = finalNode.getStyle(TRANSITION, _AFTER);
            finalNode.setClass(NO_TRANS2);
            getsTransitioned = false;
            if (!RUNNING_ON_NODE && ((transPropertiesElement.size()>0) || (transPropertiesBefore.size()>0) || (transPropertiesAfter.size()>0))) {
                // when code comes here, there are one or more properties that can be transitioned
                // check if their values differ from the original node
                originalCSS = window.getComputedStyle(node);
                originalCSS_before = window.getComputedStyle(node, _BEFORE);
                originalCSS_after = window.getComputedStyle(node, _AFTER);
                finalCSS = window.getComputedStyle(finalNode);
                finalCSS_before = window.getComputedStyle(finalNode, _BEFORE);
                finalCSS_after = window.getComputedStyle(finalNode, _AFTER);
/*jshint boss:true */
                if (transprops=searchTrans(originalCSS, finalCSS, transPropertiesElement)) {
/*jshint boss:false */
                    getsTransitioned = true;
                    generateInlineCSS(null, transprops, originalCSS, finalCSS);
                }
                if (BROWSERS_SUPPORT_PSEUDO_TRANS && vendorSupportsPseudoTrans()) {
/*jshint boss:true */
                    if (transpropsBefore=searchTrans(originalCSS_before, finalCSS_before, transPropertiesBefore)) {
/*jshint boss:false */
                        getsTransitioned = true;
                        generateInlineCSS(_BEFORE, transpropsBefore, originalCSS_before, finalCSS_before);
                    }
/*jshint boss:true */
                    if (transpropsAfter=searchTrans(originalCSS_after, finalCSS_after, transPropertiesAfter)) {
/*jshint boss:false */
                        getsTransitioned = true;
                        generateInlineCSS(_AFTER, transpropsAfter, originalCSS_after, finalCSS_after);
                    }
                }
            }
            if (getsTransitioned) {
                // to force the transitioned items to work, we will set their calculated inline values for both at the start as well
                // as on the end of the transition.
                // set the original css inline:
                promise = window.Promise.manage();
                promise.finally(function() {
                    time2 || (time2=Date.now());
                });
                node.setClass(NO_TRANS2);
                node.setInlineStyles(currentInlineCSS, false, true);
                async(function() {
                    if (!manipulated) {
                        node.removeClass(NO_TRANS2);
                        transpromise = node.setInlineStyles(finalInlineCSS, true, true);
                        transpromise.finally(function() {
                            // async `setAttr` --> only fulfill when the DOM has been updated
                            async(function() {
                                cleanup();
                            });
                        });
                    }
                });

                promise.cancel = function() {
                    return endIntermediate('cancelled');
                };

                promise.freeze = function() {
                    return endIntermediate('frozen');
                };

                promise.finish = function() {
                    return endIntermediate('finished');
                };

                promise.unfreeze = unFreeze;

                return promise;
            }
            else {
                switch(method) {
                    case SET:
                        node.setClass(className);
                    break;
                    case REPLACE:
                        node.replaceClass(extraData1, className, extraData2);
                    break;
                    case REMOVE:
                        node.removeClass(className);
                    break;
                    case TOGGLE:
                        node.toggleClass(className, extraData1);
                    break;
                }
                node.removeData(bkpNodeData);
                finalNode.remove();
            }

            return resolvedPromise;
        },
        classListProto = {
            add: function(className) {
                // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                // note: `this` is the returned object which is NOT the Elementinstance
                var thisobject = this,
                    element = thisobject.element,
                    doSet = function(cl) {
                        var clName = element.vnode.attrs[CLASS] || '';
                        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                        thisobject.contains(cl) || (element.setAttribute(CLASS, clName+((clName.length>0) ? ' ' : '') + cl));
                    };
                if (typeof className === STRING) {
                    doSet(className);
                }
                else if (Array.isArray(className)) {
                    className.forEach(doSet);
                }
            },
            remove: function(className) {
                var element = this.element,
                    doRemove = function(cl) {
                        var clName = element.vnode.attrs[CLASS] || '',
                            regexp = new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)', 'g');
                        // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                        // note: `this` is the returned object which is NOT the Elementinstance
                        element.setAttribute(CLASS, clName.replace(regexp, ' ').trim());
                    };
                if (typeof className === STRING) {
                    doRemove(className);
                }
                else if (Array.isArray(className)) {
                    className.forEach(doRemove);
                }
                (element.vnode.attrs[CLASS]==='') && element.removeAttr(CLASS);
            },
            toggle: function(className, forceState) {
                // we do not use the property className, but setAttribute, because setAttribute can be hacked by other modules like `vdom`
                // note: `this` is the returned object which is NOT the Elementinstance
                var thisobject = this,
                    doToggle = function(cl) {
                        if (typeof forceState === 'boolean') {
                            forceState ? thisobject.add(cl) : thisobject.remove(cl);
                        }
                        else {
                            thisobject.contains(cl) ? thisobject.remove(cl) : thisobject.add(cl);
                        }
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
                return this.element.vnode.hasClass(className);
            },
            item: function(index) {
                var items = this.element.vnode.attrs['class'].split(' ');
                return items[index];
            },
            _init: function(element) {
                this.element = element;
            }
        },
        treeWalkerProto = {
            _init: function(element, whatToShow, filter) {
                var instance = this;
                if (typeof filter !== 'function') {
                    // check if it is a NodeFilter-object
                    filter && filter.acceptNode && (filter=filter.acceptNode);
                }
                (typeof filter==='function') || (filter=null);
                instance.vNodePointer = element.vnode;
                instance._root = element;
                whatToShow || (whatToShow=-1); // -1 equals NodeFilter.SHOW_ALL
                (whatToShow===-1) && (whatToShow=133);
                instance._whatToShow = whatToShow; // making it accessable for the getter `whatToShow`
                instance._filter = filter; // making it accessable for the getter `filter`
            },
            _match: function(vnode, forcedVisible) {
                var whatToShow = this._whatToShow,
                    filter = this._filter,
                    showElement = ((whatToShow & 1)!==0),
                    showComment = ((whatToShow & 128)!==0),
                    showText = ((whatToShow & 4)!==0),
                    typeMatch = (showElement && (vnode.nodeType===1)) || (showComment && (vnode.nodeType===8)) || (showText && (vnode.nodeType===3)),
                    visibleMatch = !forcedVisible || (window.getComputedStyle(vnode.domNode).display!=='none'),
                    funcMatch = filter ? filter(vnode.domNode) : true;
                return typeMatch && visibleMatch && funcMatch;
            },
            firstChild: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vFirstChild;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vNext;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            lastChild: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vLastChild;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vPrevious;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            nextNode: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vNext;
                while (foundVNode && !instance._match(foundVNode, true)) {
                    foundVNode = foundVNode.vNext;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            nextSibling: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vNext;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vNext;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            parentNode: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vParent;
                (foundVNode!==instance._root) && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            previousNode: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vPrevious;
                while (foundVNode && !instance._match(foundVNode, true)) {
                    foundVNode = foundVNode.vPrevious;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            },
            previousSibling: function() {
                var instance = this,
                    foundVNode = instance.vNodePointer.vPrevious;
                while (foundVNode && !instance._match(foundVNode)) {
                    foundVNode = foundVNode.vPrevious;
                }
                foundVNode && (instance.vNodePointer=foundVNode);
                return foundVNode && foundVNode.domNode;
            }
        };

    require('window-ext')(window);

    Object.defineProperties(treeWalkerProto, {
        'currentNode': {
            get: function() {
                return this.vNodePointer.domNode;
            }
        },
        'filter': {
            get: function() {
                return this._filter;
            }
        },
        'root': {
            get: function() {
                return this._root;
            }
        },
        'whatToShow': {
            get: function() {
                return this._whatToShow;
            }
        }
    });

    // NOTE: `vnode` should be a property of Node, NOT Element
    /**
     * Reference to the vnode-object that represents the Node
     *
     * (will autogenerate a vnode, should it not exists)
     *
     * @for Node
     * @property vnode
     * @type vnode
     * @since 0.0.1
     */
    Object.defineProperty(window.Node.prototype, 'vnode', {
       get: function() {
            var instance = this,
                vnode = instance._vnode,
                parentNode, parentVNode, index;
            if (!vnode) {
                vnode = instance._vnode = domNodeToVNode(instance);
                parentNode = instance.parentNode;
                 // parentNode.vnode will be an existing vnode, because it runs through the same getter
                // it will only be `null` if `html` is not virtualised
                parentVNode = parentNode && parentNode.vnode;
                if (parentVNode) {
                    // set the vnode at the right position of its children:
                    index = arrayIndexOf.call(parentNode.childNodes, instance);
                    vnode._moveToParent(parentVNode, index);
                }
            }
            return vnode;
        },
        set: function() {} // NOOP but needs to be there, otherwise we could clone any domNodes
    });

    CSS_PROPS_TO_CALCULATE[VENDOR_TRANSFORM_PROPERTY] = true;
    CSS_PROPS_TO_CALCULATE[generateVendorCSSProp(TRANSFORM+'-origin')] = true;
    CSS_PROPS_TO_CALCULATE[generateVendorCSSProp('perspective')] = true;

    (function(ElementPrototype) {

        /**
        * Determines the number of transitionend-events there will occur
        * @method _getEvtTransEndCount
        * @private
        * @since 0.0.1
        */
        ElementPrototype._getEvtTransEndCount = function(cssProperties) {
            var transitions = this.getStyle(TRANSITION),
                timing = {},
                duration, delay, time;
            transitions.each(function(transition) {
                if (!cssProperties || (cssProperties[transition.property])) {
                    duration = transition.duration || 0;
                    delay = transition.delay || 0;
                    time = (duration+delay);
                    timing[time] = true;
                }
            });
            return timing.size();
        };

        /**
        * Returns cascaded "transition" style of all transition-properties. `Cascaded` means: the actual present style,
        * the way it is visible (calculated through the DOM-tree).
        *
        * Note1: When "transition" is set inline, ONLY inline transtition is active!
        * Thus, if parentNode has "transition: width 2s" and inline has "transition: height 3s", then the transition
        * will be "transition: height 3s" --> returning "undefined" for transitionProperty=width.
        * Note2: in case of "transition: all" --> these values will be returned for every "transitionProperty" (even when querying "width")
        *
        * @method _getTransitionAll
        * @param transitionProperty {String} transform property that is queried, f.e. "width", or "all"
        * @param [pseudo] {String} to query pseudo-element, fe: `:before` or `:first-line`
        * @return {Object} the transition-object, with the properties:
        * <ul>
        *     <li>duration {Number}</li>
        *     <li>timingFunction {String}</li>
        *     <li>delay {Number}</li>
        * </ul>
        * @private
        * @since 0.0.1
        */
        ElementPrototype._getTransitionAll = function(pseudo) {
            var instance = this,
                transProperty, transDuration, transTimingFunction, transDelay, transPropertySplitted, property,
                transitions, transDurationSplitted, transTimingFunctionSplitted, transDelaySplitted, i, len, duration;
            // first look at inline transition:
            transitions = instance.getInlineTransition(null, pseudo);
            if (transitions) {
                return transitions;
            }
            // no inline transitions over here --> calculate using getStyle
            transitions = {};
            transProperty = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'Property', pseudo);
            transDuration = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'Duration', pseudo);
            transTimingFunction = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'TimingFunction', pseudo);
            transDelay = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'Delay', pseudo);
            if (transProperty) {
                transPropertySplitted = transProperty && transProperty.split(',');
                transDurationSplitted = transDuration.split(',');
                transTimingFunctionSplitted = transTimingFunction.split(',');
                transDelaySplitted = transDelay.split(',');
                len = transPropertySplitted.length;
                for (i=0; i<len; i++) {
                    property = transPropertySplitted[i];
                    duration = transTimingFunctionSplitted[i];
                    if ((property!=='none') && (duration!=='0s')) {
                        if (property!=='all') {
                            property = VENDOR_CSS_PROPERTIES[property] || generateVendorCSSProp(property);
                        }
                        transitions[property] = {
                            duration: parseFloat(transDurationSplitted[i]),
                            timingFunction: duration,
                            delay: parseFloat(transDelaySplitted[i])
                        };
                    }
                }
            }
            return transitions;
        };

       /**
        * Appends an Element or an Element's string-representation at the end of Element's innerHTML, or before the `refElement`.
        *
        * @for Element
        * @method append
        * @param content {Element|ElementArray|String} content to append
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @param [refElement] {Element} reference Element where the content should be appended
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Element} the created Element (or the last when multiple)
        * @since 0.0.1
        */
        ElementPrototype.append = function(content, escape, refElement, silent) {
            var instance = this,
                vnode = instance.vnode,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                i, len, item, createdElement, vnodes, vRefElement,
            doAppend = function(oneItem) {
                escape && (oneItem.nodeType===1) && (oneItem=DOCUMENT.createTextNode(oneItem.getOuterHTML()));
                createdElement = refElement ? vnode._insertBefore(oneItem.vnode, refElement.vnode) : vnode._appendChild(oneItem.vnode);
            };
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            vnode._noSync()._normalizable(false);
            if (refElement && (vnode.vChildNodes.indexOf(refElement.vnode)!==-1)) {
                vRefElement = refElement.vnode.vNext;
                refElement = vRefElement && vRefElement.domNode;
            }
            (typeof content===STRING) && (content=htmlToVFragments(content, vnode.ns));
            if (content.isFragment) {
                vnodes = content.vnodes;
                len = vnodes.length;
                for (i=0; i<len; i++) {
                    doAppend(vnodes[i].domNode);
                }
            }
            else if (Array.isArray(content)) {
                len = content.length;
                for (i=0; i<len; i++) {
                    item = content[i];
                    doAppend(item);
                }
            }
            else {
                doAppend(content);
            }
            vnode._normalizable(true)._normalize();
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
            return createdElement;
        };

        /**
         * Adds a node to the end of the list of childNodes of a specified parent node.
         *
         * @method appendChild
         * @param content {Element|ElementArray|String} content to append
         * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
         * @return {Element} the Element that was appended
         */
        ElementPrototype._appendChild = ElementPrototype.appendChild;
        ElementPrototype.appendChild = function(domNode, escape) {
            return this.append(domNode, escape);
        };

       /**
        * Returns a duplicate of the node. Use cloneNode(true) for a `deep` clone.
        *
        * @method cloneNode
        * @param [deep] {Boolean} whether to perform a `deep` clone: with all descendants
        * @return {Element} a clone of this Element
        * @since 0.0.1
        */
        ElementPrototype._cloneNode = ElementPrototype.cloneNode;
        ElementPrototype.cloneNode = function(deep) {
            var instance = this,
                vnode = instance.vnode,
                cloned = instance._cloneNode(deep),
                cloneData = function(srcVNode, targetVNode) {
                    if (srcVNode._data) {
                        Object.protectedProp(targetVNode, '_data', {});
                        targetVNode._data.merge(srcVNode._data);
                    }
                },
                cloneDeepData = function(srcVNode, targetVNode) {
                    var srcVChildren = srcVNode.vChildren,
                        targetVChildren = targetVNode.vChildren,
                        len = srcVChildren.length,
                        i, childSrcVNode, childTargetVNode;
                    for (i=0; i<len; i++) {
                        childSrcVNode = srcVChildren[i];
                        childTargetVNode = targetVChildren[i];
                        cloneData(childSrcVNode, childTargetVNode);
                        childSrcVNode.hasVChildren() && cloneDeepData(childSrcVNode, childTargetVNode);
                    }
                };
            cloned.vnode = domNodeToVNode(cloned);
            cloneData(vnode, cloned.vnode);
            // if deep, then we need to merge _data of all deeper nodes
            deep && vnode.hasVChildren() && cloneDeepData(vnode, cloned.vnode);
            return cloned;
        };

        /**
         * Compares the position of the current node against another node in any other document.
         *
         * Returnvalues are a composition of the following bitwise values:
         * <ul>
         *     <li>Node.DOCUMENT_POSITION_DISCONNECTED === 1 (one of the Elements is not part of the dom)</li>
         *     <li>Node.DOCUMENT_POSITION_PRECEDING === 2 (this Element comes before otherElement)</li>
         *     <li>Node.DOCUMENT_POSITION_FOLLOWING === 4 (this Element comes after otherElement)</li>
         *     <li>Node.DOCUMENT_POSITION_CONTAINS === 8 (otherElement trully contains -not equals- this Element)</li>
         *     <li>Node.DOCUMENT_POSITION_CONTAINED_BY === 16 (Element trully contains -not equals- otherElement)</li>
         * </ul>
         *
         * @method compareDocumentPosition
         * @param otherElement {Element}
         * @return {Number} A bitmask, use it this way: if (thisNode.compareDocumentPosition(otherNode) & Node.DOCUMENT_POSITION_FOLLOWING) {// otherNode is following thisNode}
         */
        ElementPrototype.compareDocumentPosition = function(otherElement) {
            // see http://ejohn.org/blog/comparing-document-position/
            var instance = this,
                parent, index1, index2, vChildNodes;
            if (instance===otherElement) {
                return 0;
            }
            if (!DOCUMENT.contains(instance) || !DOCUMENT.contains(otherElement)) {
                return 1;
            }
            else if (instance.contains(otherElement)) {
                return 20;
            }
            else if (otherElement.contains(instance)) {
                return 10;
            }
            parent = instance.getParent();
            vChildNodes = parent.vnode.vChildNodes;
            index1 = vChildNodes.indexOf(instance.vnode);
            index2 = vChildNodes.indexOf(otherElement.vnode);
            if (index1<index2) {
                return 2;
            }
            else {
                return 4;
            }
        };

        /**
         * Indicating whether this Element contains OR equals otherElement.
         *
         * @method contains
         * @param otherElement {Element}
         * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
         * @return {Boolean} whether this Element contains OR equals otherElement.
         */
        ElementPrototype.contains = function(otherElement, insideItags) {
            if (otherElement===this) {
                return true;
            }
            return this.vnode.contains(otherElement.vnode, !insideItags);
        };

        /**
         * Returns a newly created TreeWalker object with this Element as root.
         *
         * The TreeWalker is life presentation of the dom. It gets updated when the dom changes.
         *
         * @method createTreeWalker
         * @param root {Element} The root node at which to begin the NodeIterator's traversal.
         * @param [whatToShow] {Number} Filter specification constants from the NodeFilter DOM interface, indicating which nodes to iterate over.
         * You can use or sum one of the next properties:
         * <ul>
         *   <li>window.NodeFilter.SHOW_ALL === -1</li>
         *   <li>window.NodeFilter.SHOW_ELEMENT === 1</li>
         *   <li>window.NodeFilter.SHOW_COMMENT === 128</li>
         *   <li>window.NodeFilter.SHOW_TEXT === 4</li>
         * </ul>
         *
         * A treewalker has the next methods:
         * <ul>
         *   <li>treewalker.firstChild()</li>
         *   <li>treewalker.lastChild()</li>
         *   <li>treewalker.nextNode()</li>
         *   <li>treewalker.nextSibling()</li>
         *   <li>treewalker.parentNode()</li>
         *   <li>treewalker.previousNode()</li>
         *   <li>treewalker.previousSibling()</li>
         * </ul>
         *
         * A treewalker has the next properties:
         * <ul>
         *   <li>treewalker.currentNode</li>
         *   <li>treewalker.filter</li>
         *   <li>treewalker.root</li>
         *   <li>treewalker.whatToShow</li>
         * </ul>
         *
         * @param [filter] {NodeFilter|function} An object implementing the NodeFilter interface or a function. See https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
         * @return {TreeWalker}
         * @since 0.0.1
         */
        ElementPrototype.createTreeWalker = function(whatToShow, filter) {
            var treeWalker = Object.create(treeWalkerProto);
            treeWalker._init(this, whatToShow, filter);
            return treeWalker;
        };

       /**
        * Sets the inline-style of the Element exactly to the specified `value`, overruling previous values.
        * Making the Element's inline-style look like: style="value".
        *
        * This is meant for a quick one-time setup. For individually inline style-properties to be set, you can use `setInlineStyle()`.
        *
        * @method defineInlineStyle
        * @param value {String} the style string to be set
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.defineInlineStyle = function(value) {
            return this.setAttr(STYLE, value);
        };

       /**
        * Empties the content of the Element.
        * Alias for thisNode.vTextContent = '';
        *
        * @method empty
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.empty = function(silent) {
            var prevSuppress = DOCUMENT._suppressMutationEvents || false;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            this.vnode.empty();
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
        };

        /**
         * Reference to the first of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @method first
         * @param [cssSelector] {String} to return the first Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.first = function(cssSelector) {
            return this.vnode.vParent.firstOfVChildren(cssSelector).domNode;
        };

        /**
         * Reference to the first child-Element, where the related dom-node an Element (nodeType===1).
         *
         * @method firstOfChildren
         * @param [cssSelector] {String} to return the first Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.firstOfChildren = function(cssSelector) {
            var foundVNode = this.vnode.firstOfVChildren(cssSelector);
            return foundVNode && foundVNode.domNode;
        };

       /**
        * Forces the Element to be inside an ancestor-Element that has the `overfow="scroll" set.
        *
        * @method forceIntoNodeView
        * @param [ancestor] {Element} the Element where it should be forced into its view.
        *        Only use this when you know the ancestor and this ancestor has an `overflow="scroll"` property
        *        when not set, this method will seek through the doc-tree upwards for the first Element that does match this criteria.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.forceIntoNodeView = function(ancestor) {
            // TODO: transitioned: http://wibblystuff.blogspot.nl/2014/04/in-page-smooth-scroll-using-css3.html
            console.log(NAME, 'forceIntoNodeView');
            var instance = this,
                parentOverflowNode = this.getParent(),
                match, left, width, right, height, top, bottom, scrollLeft, scrollTop, parentOverflowNodeX, parentOverflowNodeY,
                parentOverflowNodeStartTop, parentOverflowNodeStartLeft, parentOverflowNodeStopRight, parentOverflowNodeStopBottom, newX, newY;
            if (parentOverflowNode) {
                if (ancestor) {
                    parentOverflowNode = ancestor;
                }
                else {
                    while (parentOverflowNode && (parentOverflowNode!==DOCUMENT) && !(match=((parentOverflowNode.getStyle(OVERFLOW)===SCROLL) || (parentOverflowNode.getStyle(OVERFLOW+'-y')===SCROLL)))) {
                        parentOverflowNode = parentOverflowNode.getParent();
                    }
                }
                if (parentOverflowNode && (parentOverflowNode!==DOCUMENT)) {
                    left = instance.left;
                    width = instance.offsetWidth;
                    right = left + width;
                    height = instance.offsetHeight;
                    top = instance.top;
                    bottom = top + height;
                    scrollLeft = parentOverflowNode.scrollLeft;
                    scrollTop = parentOverflowNode.scrollTop;
                    parentOverflowNodeX = parentOverflowNode.left;
                    parentOverflowNodeY = parentOverflowNode.top;
                    parentOverflowNodeStartTop = parentOverflowNodeY+parseInt(parentOverflowNode.getStyle(BORDER_TOP_WIDTH), 10);
                    parentOverflowNodeStartLeft = parentOverflowNodeX+parseInt(parentOverflowNode.getStyle(BORDER_LEFT_WIDTH), 10);
                    parentOverflowNodeStopRight = parentOverflowNodeX+parentOverflowNode.offsetWidth-parseInt(parentOverflowNode.getStyle(BORDER_RIGHT_WIDTH), 10);
                    parentOverflowNodeStopBottom = parentOverflowNodeY+parentOverflowNode.offsetHeight-parseInt(parentOverflowNode.getStyle(BORDER_BOTTOM_WIDTH), 10);

                    if (left<parentOverflowNodeStartLeft) {
                        newX = Math.max(0, scrollLeft+left-parentOverflowNodeStartLeft);
                    }
                    else if (right>parentOverflowNodeStopRight) {
                        newX = scrollLeft + right - parentOverflowNodeStopRight;
                    }

                    if (top<parentOverflowNodeStartTop) {
                        newY = Math.max(0, scrollTop+top-parentOverflowNodeStartTop);
                    }
                    else if (bottom>parentOverflowNodeStopBottom) {
                        newY = scrollTop + bottom - parentOverflowNodeStopBottom;
                    }

                    if ((newX!==undefined) || (newY!==undefined)) {
                        parentOverflowNode.scrollTo((newX!==undefined) ? newX : scrollLeft,(newY!==undefined) ? newY : scrollTop);
                    }
                }
            }
            return instance;
        };

       /**
        * Forces the Element to be inside the window-view. Differs from `scrollIntoView()` in a way
        * that `forceIntoView()` doesn't change the position when it's inside the view, whereas
        * `scrollIntoView()` sets it on top of the view.
        *
        * @method forceIntoView
        * @param [notransition=false] {Boolean} set true if you are sure positioning is without transition.
        *        this isn't required, but it speeds up positioning. Only use when no transition is used:
        *        when there is a transition, setting this argument `true` would miscalculate the position.
        * @param [rectangle] {Object} Set this if you have already calculated the window-rectangle (used for preformance within drag-drop)
        * @param [rectangle.x] {Number} scrollLeft of window
        * @param [rectangle.y] {Number} scrollTop of window
        * @param [rectangle.w] {Number} width of window
        * @param [rectangle.h] {Number} height of window
        * @chainable
        * @since 0.0.2
        */
        ElementPrototype.forceIntoView = function(notransition, rectangle) {
            // TODO: 'notransition' can be calculated with this.getTransition(left) this.getTransition(left)
            // TODO: transitioned: http://wibblystuff.blogspot.nl/2014/04/in-page-smooth-scroll-using-css3.html
            console.log(NAME, 'forceIntoView');
            var instance = this,
                left = instance.left,
                width = instance.offsetWidth,
                right = left + width,
                height = instance.offsetHeight,
                top = instance.top,
                bottom = top + height,
                windowLeft, windowTop, windowRight, windowBottom, newX, newY;
            if (rectangle) {
                windowLeft = rectangle.x;
                windowTop = rectangle.y;
                windowRight = rectangle.w;
                windowBottom = rectangle.h;
            }
            else {
                windowLeft = window.getScrollLeft();
                windowTop = window.getScrollTop();
                windowRight = windowLeft + window.getWidth();
                windowBottom = windowTop + window.getHeight();
            }

            if (left<windowLeft) {
                newX = Math.max(0, left);
            }
            else if (right>windowRight) {
                newX = windowLeft + right - windowRight;
            }
            if (top<windowTop) {
                newY = Math.max(0, top);
            }
            else if (bottom>windowBottom) {
                newY = windowTop + bottom - windowBottom;
            }

            if ((newX!==undefined) || (newY!==undefined)) {
                window.scrollTo((newX!==undefined) ? newX : windowLeft, (newY!==undefined) ? newY : windowTop);
            }
            return instance;
        };

        /**
         * Gets an ElementArray of Elements that lie within this Element and match the css-selector.
         *
         * @method getAll
         * @param cssSelector {String} css-selector to match
         * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
         * @return {ElementArray} ElementArray of Elements that match the css-selector
         * @since 0.0.1
         */
        ElementPrototype.getAll = function(cssSelector, insideItags) {
            return this.querySelectorAll(cssSelector, insideItags);
        };

       /**
        * Gets an attribute of the Element.
        *
        * Alias for getAttribute().
        *
        * @method getAttr
        * @param attributeName {String}
        * @return {String|null} value of the attribute
        * @since 0.0.1
        */
        ElementPrototype.getAttr = function(attributeName) {
            return this.vnode.attrs[attributeName] || null;
        };

        /**
         * Returns all attributes as defined as an key/value object.
         *
         * @method getAttrs
         * @param attributeName {String}
         * @return {Object} all attributes as on Object
         * @since 0.0.1
         */
        ElementPrototype.getAttrs = function() {
            return this.vnode.attrs;
        };

       /**
        * Gets an attribute of the Element.
        *
        * Same as getAttr().
        *
        * @method getAttribute
        * @param attributeName {String}
        * @return {String|null} value of the attribute
        * @since 0.0.1
        */
        ElementPrototype._getAttribute = ElementPrototype.getAttribute;
        ElementPrototype.getAttribute = function(attributeName) {
            return this.vnode.attrs[attributeName] || null;
        };

        /**
         * Returns a live collection of the Element-childNodes.
         *
         * @method getChildren
         * @return {ElementArray}
         * @since 0.0.1
         */
        ElementPrototype.getChildren = function() {
            var vChildren = this.vnode.vChildren,
                len = vChildren.length,
                children = ElementArray.createArray(),
                i;
            for (i=0; i<len; i++) {
                children[children.length] = vChildren[i].domNode;
            }
            return children;
        };

        /**
         * Returns a token list of the class attribute of the element.
         * See: https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
         *
         * @method getClassList
         * @return DOMTokenList
         * @since 0.0.1
         */
        ElementPrototype.getClassList = function() {
            var instance = this,
                vnode = instance.vnode;
            if (!vnode._classList) {
                vnode._classList = Object.create(classListProto);
                vnode._classList._init(instance);
            }
            return vnode._classList;
        };

       /**
        * Returns data set specified by `key`. If not set, `undefined` will be returned.
        * The data is efficiently stored on the vnode.
        *
        * @method getData
        * @param key {string} name of the key
        * @return {Any|undefined} data set specified by `key`
        * @since 0.0.1
        */
        ElementPrototype.getData = function(key) {
            var vnode = this.vnode;
            return vnode._data && vnode._data[key];
        };

       /**
        * Gets one Element, specified by the css-selector. To retrieve a single element by id,
        * you need to prepend the id-name with a `#`. When multiple Element's match, the first is returned.
        *
        * @method getElement
        * @param cssSelector {String} css-selector to match
        * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
        * @return {Element|null} the Element that was search for
        * @since 0.0.1
        */
        ElementPrototype.getElement = function(cssSelector, insideItags) {
            return ((cssSelector[0]==='#') && (cssSelector.indexOf(' ')===-1)) ? this.getElementById(cssSelector.substr(1)) : this.querySelector(cssSelector, insideItags);
        };

        /**
         * Returns the Element matching the specified id, which should should be a descendant of this Element.
         *
         * @method getElementById
         * @param id {String} id of the Element
         * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
         * @return {Element|null}
         *
         */
        ElementPrototype.getElementById = function(id, insideItags) {
            var element = nodeids[id];
            if (element && !this.contains(element, insideItags)) {
                // outside itself
                return null;
            }
            return element || null;
        };

        /**
         * Gets innerHTML of the dom-node.
         * Goes through the vdom, so it's superfast.
         *
         * Use this method instead of `innerHTML`
         *
         * @method getHTML
         * @return {String}
         * @since 0.0.1
         */
        ElementPrototype.getHTML = function() {
            return this.vnode.innerHTML;
        };

       /**
        * Returns the Elments `id`
        *
        * @method getId
        * @return {String|undefined} Elements `id`
        * @since 0.0.1
        */
        ElementPrototype.getId = function() {
            return this.vnode.id;
        };

       /**
        * Returns inline style of the specified property. `Inline` means: what is set directly on the Element,
        * this doesn't mean necesairy how it is looked like: when no css is set inline, the Element might still have
        * an appearance because of other CSS-rules.
        *
        * In most cases, you would be interesting in using `getStyle()` instead.
        *
        * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
        *
        * @method getInlineStyle
        * @param cssProperty {String} the css-property to look for
        * @param [pseudo] {String} to look inside a pseudo-style
        * @return {String|undefined} css-style
        * @since 0.0.1
        */
        ElementPrototype.getInlineStyle = function(cssProperty, pseudo) {
            var styles = this.vnode.styles,
                groupStyle = styles && styles[pseudo || 'element'],
                value;
            if (groupStyle) {
                value = groupStyle[fromCamelCase(cssProperty)];
                value && (cssProperty===VENDOR_TRANSITION_PROPERTY) && (value=extractor.serializeTransition(value));
            }
            return value;
        };

       /**
        * Returns inline transition-css-property. `Inline` means: what is set directly on the Element,
        * When `transition` is set inline, no `parent` transition-rules apply.
        *
        *
        * @method getInlineTransition
        * @param [transitionProperty] {String} the css-property to look for
        * @param [pseudo] {String} to look inside a pseudo-style
        * @return {Object} the transition-object, with the properties:
        * <ul>
        *     <li>duration {Number}</li>
        *     <li>timingFunction {String}</li>
        *     <li>delay {Number}</li>
        * </ul>
        * @since 0.0.1
        */
        ElementPrototype.getInlineTransition = function(transitionProperty, pseudo) {
            var styles = this.vnode.styles,
                groupStyle = styles && styles[pseudo || 'element'],
                transitionStyles = groupStyle && groupStyle[VENDOR_TRANSITION_PROPERTY];
            if (transitionStyles) {
                return transitionProperty ? transitionStyles[fromCamelCase(transitionProperty)] : transitionStyles;
            }
        };

        /**
         * Gets the outerHTML of the dom-node.
         * Goes through the vdom, so it's superfast.
         *
         * Use this method instead of `outerHTML`
         *
         * @method getOuterHTML
         * @return {String}
         * @since 0.0.1
         */
        ElementPrototype.getOuterHTML = function() {
            return this.vnode.outerHTML;
        };

        /**
         * Returns the Element's parent Element.
         *
         * @method getParent
         * @return {Element}
         */
        ElementPrototype.getParent = function() {
            var vParent = this.vnode.vParent;
            return vParent && vParent.domNode;
        };

       /**
        * Returns cascaded style of the specified property. `Cascaded` means: the actual present style,
        * the way it is visible (calculated through the DOM-tree).
        *
        * <ul>
        *     <li>Note1: values are absolute: percentages and points are converted to absolute values, sizes are in pixels, colors in rgb/rgba-format.</li>
        *     <li>Note2: you cannot query shotcut-properties: use `margin-left` instead of `margin`.</li>
        *     <li>Note3: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine.</li>
        *     <li>Note4: you can query `transition`, `transform`, `perspective` and `transform-origin` instead of their vendor-specific properties.</li>
        *     <li>Note5: `transition` or `transform` return an Object instead of a String.</li>
        * </ul>
        *
        * @method getCascadeStyle
        * @param cssProperty {String} property that is queried
        * @param [pseudo] {String} to query pseudo-element, fe: `:before` or `:first-line`
        * @return {String|Object} value for the css-property: this is an Object for the properties `transition` or `transform`
        * @since 0.0.1
        */
        ElementPrototype.getStyle = function(cssProperty, pseudo) {
            // Cautious: when reading the property `transform`, getComputedStyle should
            // read the calculated value, but some browsers (webkit) only calculate the style on the current element
            // In those cases, we need a patch and look up the tree ourselves
            //  Also: we will return separate value, NOT matrices
            var instance = this;
            if (cssProperty===VENDOR_TRANSITION_PROPERTY) {
                return instance._getTransitionAll(pseudo);
            }
            VENDOR_CSS_PROPERTIES[cssProperty] || (cssProperty=generateVendorCSSProp(cssProperty));
            return window.getComputedStyle(instance, pseudo)[toCamelCase(cssProperty)];
        };

        /**
        * Returns cascaded "transition" style of the specified trandform-property. `Cascaded` means: the actual present style,
        * the way it is visible (calculated through the DOM-tree).
        *
        * Note1: When "transition" is set inline, ONLY inline transtition is active!
        * Thus, if parentNode has "transition: width 2s" and inline has "transition: height 3s", then the transition
        * will be "transition: height 3s" --> returning "undefined" for transitionProperty=width.
        * Note2: in case of "transition: all" --> these values will be returned for every "transitionProperty" (even when querying "width")
        *
        * @method getTransition
        * @param transitionProperty {String} transform property that is queried, f.e. "width", or "all"
        * @param [pseudo] {String} to query pseudo-element, fe: `:before` or `:first-line`
        * @return {Object} the transition-object, with the properties:
        * <ul>
        *     <li>duration {Number}</li>
        *     <li>timingFunction {String}</li>
        *     <li>delay {Number}</li>
        * </ul>
        * @since 0.0.1
        */
        ElementPrototype.getTransition = function(transitionProperty, pseudo) {
            var instance = this,
                transProperty, transDuration, transTimingFunction, transDelay, transPropertySplitted,
                transition, transDurationSplitted, transTimingFunctionSplitted, transDelaySplitted, index;
            if (instance.hasInlineStyle(VENDOR_TRANSITION_PROPERTY, pseudo)) {
                transition = instance.getInlineTransition(transitionProperty, pseudo);
                // if not found, then search for "all":
                transition || (transition=instance.getInlineTransition('all', pseudo));
                if (transition) {
                    // getTransition always returns all the properties:
                    transition.timingFunction || (transition.timingFunction='ease');
                    transition.delay || (transition.delay=0);
                }
                return transition;
            }
            transProperty = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'Property', pseudo);
            transDuration = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'Duration', pseudo);
            transTimingFunction = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'TimingFunction', pseudo);
            transDelay = instance.getStyle(VENDOR_TRANSITION_PROPERTY+'Delay', pseudo);
            transPropertySplitted = transProperty && transProperty.split(',');
            if (transProperty) {
                if (transPropertySplitted.length>1) {
                    // multiple definitions
                    index = transPropertySplitted.indexOf(transitionProperty);
                    // the array is in a form like this: 'width, height, opacity' --> therefore, we might need to look at a whitespace
                    if (index===-1) {
                        index = transPropertySplitted.indexOf(' '+transitionProperty);
                        // if not found, then search for "all":
                        if (index===-1) {
                            index = transPropertySplitted.indexOf('all');
                            (index===-1) && (index=transPropertySplitted.indexOf(' '+'all'));
                        }
                    }
                    if (index!==-1) {
                        transDurationSplitted = transDuration.split(',');
                        transTimingFunctionSplitted = transTimingFunction.split(',');
                        transDelaySplitted = transDelay.split(',');
                        transition = {
                            duration: parseFloat(transDurationSplitted[index]),
                            timingFunction: transTimingFunctionSplitted[index].trimLeft(),
                            delay: parseFloat(transDelaySplitted)
                        };
                    }
                }
                else {
                    // one definition
                    if ((transProperty===transitionProperty) || (transProperty==='all')) {
                        transition = {
                            duration: parseFloat(transDuration),
                            timingFunction: transTimingFunction,
                            delay: parseFloat(transDelay)
                        };
                    }
                }
                transition && (transition.duration===0) && (transition=undefined);
                return transition;
            }
        };

       /**
        * Elements tag-name in uppercase (same as nodeName).
        *
        * @method getTagName
        * @return {String}
        * @since 0.0.1
        */
        ElementPrototype.getTagName = function() {
            return this.vnode.tag;
        };

        /**
         * Gets the innerContent of the Element as plain text.
         * Goes through the vdom, so it's superfast.
         *
         * Use this method instead of `textContent`
         *
         * @method getText
         * @return String
         * @since 0.0.1
         */
        ElementPrototype.getText = function() {
            return this.vnode.textContent;
        };

       /**
        * Gets the value of the following Elements:
        *
        * <ul>
        *     <li>input</li>
        *     <li>textarea</li>
        *     <li>select</li>
        *     <li>any container that is `contenteditable`</li>
        * </ul>
        *
        * @method getValue
        * @return {String}
        * @since 0.0.1
        */
        ElementPrototype.getValue = function() {
            // cautious: input and textarea must be accessed by their propertyname:
            // input.getAttribute('value') would return the default-value instead of actual
            // and textarea.getAttribute('value') doesn't exist
            var instance = this,
                contenteditable = instance.vnode.attrs.contenteditable,
                editable = contenteditable && (contenteditable!=='false');
            return editable ? instance.getHTML() : instance.value;
        };

       /**
        * Whether the Element has the attribute set.
        *
        * Alias for hasAttribute().
        *
        * @method hasAttr
        * @param attributeName {String}
        * @return {Boolean} Whether the Element has the attribute set.
        * @since 0.0.1
        */
        ElementPrototype.hasAttr = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

       /**
        * Whether the Element has the attribute set.
        *
        * Same as hasAttr().
        *
        * @method hasAttribute
        * @param attributeName {String}
        * @return {Boolean} Whether the Element has the attribute set.
        * @since 0.0.1
        */
        ElementPrototype.hasAttribute = function(attributeName) {
            return !!this.vnode.attrs[attributeName];
        };

        /**
         * Indicating if the current element has any attributes or not.
         *
         * @method hasAttributes
         * @return {Boolean} Whether the current element has any attributes or not.
         */
        ElementPrototype.hasAttributes = function() {
            var attrs = this.vnode.attrs;
            return attrs ? (attrs.size() > 0) : false;
        };

       /**
        * Indicating if the Element has any children (childNodes with nodeType of 1).
        *
        * @method hasChildren
        * @return {Boolean} whether the Element has children
        * @since 0.0.1
        */
        ElementPrototype.hasChildren = function() {
            return this.vnode.hasVChildren();
        };

       /**
        * Checks whether the className is present on the Element.
        *
        * @method hasClass
        * @param className {String|Array} the className to check for. May be an Array of classNames, which all needs to be present.
        * @return {Boolean} whether the className (or classNames) is present on the Element
        * @since 0.0.1
        */
        ElementPrototype.hasClass = function(className) {
            return this.getClassList().contains(className);
        };

       /**
        * If the Element has data set specified by `key`. The data could be set with `setData()`.
        *
        * @method hasData
        * @param key {string} name of the key
        * @return {Boolean}
        * @since 0.0.1
        */
        ElementPrototype.hasData = function(key) {
            var vnode = this.vnode;
            return !!(vnode._data && (vnode._data[key]!==undefined));
        };

       /**
        * Indicates whether Element currently has the focus.
        *
        * @method hasFocus
        * @return {Boolean}
        * @since 0.0.1
        */
        ElementPrototype.hasFocus = function() {
            return (DOCUMENT.activeElement===this);
        };

       /**
        * Indicates whether the current focussed Element lies inside this Element (on a descendant Element).
        *
        * @method hasFocusInside
        * @return {Boolean}
        * @since 0.0.1
        */
        ElementPrototype.hasFocusInside = function() {
            var activeElement = DOCUMENT.activeElement;
            return ((DOCUMENT.activeElement!==this) && this.contains(activeElement));
        };

       /**
        * Returns whether the inline style of the specified property is present. `Inline` means: what is set directly on the Element.
        *
        * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
        *
        * @method hasInlineStyle
        * @param cssProperty {String} the css-property to look for
        * @param [pseudo] {String} to look inside a pseudo-style
        * @return {Boolean} whether the inlinestyle was present
        * @since 0.0.1
        */
        ElementPrototype.hasInlineStyle = function(cssProperty, pseudo) {
            return !!this.getInlineStyle(cssProperty, pseudo);
        };

       /**
        * Returns whether the specified inline transform-css-property is present. `Inline` means: what is set directly on the Element.
        *
        * See more about tranform-properties: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
        *
        * @method hasInlineTransition
        * @param transitionProperty {String} the css-property to look for
        * @param [pseudo] {String} to look inside a pseudo-style
        * @return {Boolean} whether the inline transform-css-property was present
        * @since 0.0.1
        */
        ElementPrototype.hasInlineTransition = function(transitionProperty, pseudo) {
            return !!this.getInlineTransition(transitionProperty, pseudo);
        };

        /**
        * Returns whether the specified transform-property is active.
        *
        * Note1: When "transition" is set inline, ONLY inline transtition is active!
        * Thus, if parentNode has "transition: width 2s" and inline has "transition: height 3s",
        * then hasTransition('width') will return false.
        * Note2: in case of "transition: all" --> hasTransition() will always `true` for every transitionProperty.
        *
        * @method hasTransition
        * @param transitionProperty {String} the css-property to look for
        * @param [pseudo] {String} to look inside a pseudo-style
        * @return {Boolean} whether the inlinestyle was present
        * @since 0.0.1
        */
        ElementPrototype.hasTransition = function(transitionProperty, pseudo) {
            return !!this.getTransition(transitionProperty, pseudo);
        };

       /**
        * Hides a node by making it floated and removing it out of the visible screen.
        * Hides immediately without `fade`, or will fade when fade is specified.
        *
        * @method hide
        * @param [fade] {Number} sec to fade (you may use `0.1`)
        * @return {this|Promise} fulfilled when the element is ready hiding, or rejected when showed up again (using node.show) before fully hided.
        * @since 0.0.1
        */
        ElementPrototype.hide = function(duration) {
            // when it doesn't have, it doesn;t harm to leave the transitionclass on: it would work anyway
            // nevertheless we will remove it with a timeout
            var instance = this,
                showPromise = instance.getData('_showNodeBusy'),
                hidePromise = instance.getData('_hideNodeBusy'),
                originalOpacity, hasOriginalOpacity, promise, freezedOpacity, fromOpacity;

            instance.setData('nodeShowed', false); // for any routine who wants to know
            originalOpacity = instance.getData('_showNodeOpacity');
            if (!originalOpacity && !showPromise && !hidePromise) {
                originalOpacity = parseFloat(instance.getInlineStyle('opacity'));
                instance.setData('_showNodeOpacity', originalOpacity);
            }
            hasOriginalOpacity = !!originalOpacity;

            showPromise && showPromise.freeze();
            if (showPromise) {
                showPromise.freeze();
                instance.removeData('_showNodeBusy');
            }
            hidePromise && hidePromise.freeze();

            if (duration) {
                if (showPromise || hidePromise) {
                    freezedOpacity = instance.getInlineStyle('opacity');
                    fromOpacity = originalOpacity || 1;
                    duration = (fromOpacity>0) ? Math.min(1, (freezedOpacity/fromOpacity))*duration : 0;
                }
                promise = instance.transition({property: 'opacity', value: 0, duration: duration});
                instance.setData('_hideNodeBusy', promise);
                promise.finally(
                    function() {
                        if (!promise.cancelled && !promise.frozen) {
                            instance.setClass(HIDDEN);
                            originalOpacity ? instance.setInlineStyle('opacity', originalOpacity) : instance.removeInlineStyle('opacity');
                        }
                        instance.removeData('_hideNodeBusy');
                    }
                );
                return promise;
            }
            else {
                async(function() {
                    instance.setClass(HIDDEN);
                    hasOriginalOpacity ? instance.setInlineStyle('opacity', originalOpacity) : instance.removeInlineStyle('opacity');
                });
                return instance;
            }
        };

       /**
        * Indicates whether the Element currently is part if the DOM.
        *
        * @method inDOM
        * @return {Boolean} whether the Element currently is part if the DOM.
        * @since 0.0.1
        */
        ElementPrototype.inDOM = function() {
            if (this.vnode.removedFromDOM) {
                return false;
            }
            return DOCUMENT.contains(this, true);
        };

       /**
         * Checks whether the Element lies within the specified selector (which can be a CSS-selector or a Element)
         *
         * @example
         * var divnode = childnode.inside('div.red');
         *
         * @example
         * var divnode = childnode.inside(containerNode);
         *
         * @method inside
         * @param selector {Element|String} the selector, specified by a Element or a css-selector
         * @return {Element|false} the nearest Element that matches the selector, or `false` when not found
         * @since 0.0.1
         */
        ElementPrototype.inside = function(selector) {
            var instance = this,
                vParent;
            if (typeof selector===STRING) {
                vParent = instance.vnode.vParent;
                while (vParent && !vParent.matchesSelector(selector)) {
                    vParent = vParent.vParent;
                }
                return vParent ? vParent.domNode : false;
            }
            else {
                // selector should be an Element
                return ((selector!==instance) && selector.contains(instance)) ? selector : false;
            }
        };

       /**
         * Checks whether a point specified with x,y is within the Element's region.
         *
         * @method insidePos
         * @param x {Number} x-value for new position (coordinates are page-based)
         * @param y {Number} y-value for new position (coordinates are page-based)
         * @return {Boolean} whether there is a match
         * @since 0.0.1
         */
        ElementPrototype.insidePos = function(x, y) {
            var instance = this,
                left = instance.left,
                top = instance.top,
                right = left + instance.offsetWidth,
                bottom = top + instance.offsetHeight;
            return (x>=left) && (x<=right) && (y>=top) && (y<=bottom);
        };

        /**
         * Inserts `domNode` before `refDomNode`.
         *
         * @method insertBefore
         * @param domNode {Node|Element|ElementArray|String} content to insert
         * @param refDomNode {Element} The Element before which newElement is inserted.
         * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
         * @return {Node} the Element being inserted (equals domNode)
         */
        ElementPrototype._insertBefore = ElementPrototype.insertBefore;
        ElementPrototype.insertBefore = function(domNode, refDomNode, escape) {
            return this.prepend(domNode, escape, refDomNode);
        };

        /**
         * Whether the element is an Itag-element
         *
         * @method isItag
         * @return {Boolean}
         * @since 0.0.1
         */
        ElementPrototype.isItag = function() {
            return this.vnode.isItag;
        };

        /**
         * Reference to the last of sibbling vNode's, where the related dom-node is an Element(nodeType===1).
         *
         * @method last
         * @param [cssSelector] {String} to return the last Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.last = function(cssSelector) {
            var vParent = this.vnode.vParent;
            return vParent && vParent.lastOfVChildren(cssSelector).domNode;
        };

        /**
         * Reference to the last child-Element, where the related dom-node an Element (nodeType===1).
         *
         * @method lastOfChildren
         * @param [cssSelector] {String} to return the last Element that matches the css-selector
         * @return {Element}
         * @since 0.0.1
         */
        ElementPrototype.lastOfChildren = function(cssSelector) {
            var foundVNode = this.vnode.lastOfVChildren(cssSelector);
            return foundVNode && foundVNode.domNode;
        };

        /**
         * Indicates if the element would be selected by the specified selector string.
         * Alias for matchesSelector()
         *
         * @method matches
         * @param [cssSelector] {String} the css-selector to check for
         * @return {Boolean}
         * @since 0.0.1
         */
        ElementPrototype.matches = function(selectors) {
            return this.vnode.matchesSelector(selectors);
        };

        /**
         * Indicates if the element would be selected by the specified selector string.
         * Alias for matches()
         *
         * @method matchesSelector
         * @param [cssSelector] {String} the css-selector to check for
         * @return {Boolean}
         * @since 0.0.1
         */
        ElementPrototype.matchesSelector = function(selectors) {
            return this.vnode.matchesSelector(selectors);
        };

        /**
         * Reference to the next of sibbling Element, where the related dom-node is an Element(nodeType===1).
         *
         * @method next
         * @param [cssSelector] {String} css-selector to be used as a filter
         * @return {Element|null}
         * @type Element
         * @since 0.0.1
         */
        ElementPrototype.next = function(cssSelector) {
            var vnode = this.vnode,
                found, vNextElement, firstCharacter, i, len;
            if (!cssSelector) {
                vNextElement = vnode.vNextElement;
                return vNextElement && vNextElement.domNode;
            }
            else {
                i = -1;
                len = cssSelector.length;
                while (!firstCharacter && (++i<len)) {
                    firstCharacter = cssSelector[i];
                    (firstCharacter===' ') && (firstCharacter=null);
                }
                if (firstCharacter==='>') {
                    return null;
                }
            }
            vNextElement = vnode;
            do {
                vNextElement = vNextElement.vNextElement;
                found = vNextElement && vNextElement.matchesSelector(cssSelector);
            } while(vNextElement && !found);
            return found ? vNextElement.domNode : null;
        };

       /**
        * Prepends a Element or text at the start of Element's innerHTML, or before the `refElement`.
        *
        * @method prepend
        * @param content {Element|Element|ElementArray|String} content to prepend
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @param [refElement] {Element} reference Element where the content should be prepended
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Element} the created Element (or the last when multiple)
        * @since 0.0.1
        */
        ElementPrototype.prepend = function(content, escape, refElement, silent) {
            var instance = this,
                vnode = instance.vnode,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                i, len, item, createdElement, vnodes, vChildNodes, vRefElement,
            doPrepend = function(oneItem) {
                escape && (oneItem.nodeType===1) && (oneItem=DOCUMENT.createTextNode(oneItem.getOuterHTML()));
                createdElement = refElement ? vnode._insertBefore(oneItem.vnode, refElement.vnode) : vnode._appendChild(oneItem.vnode);
                // CAUTIOUS: when using TextNodes, they might get merged (vnode._normalize does this), which leads into disappearance of refElement:
                refElement = createdElement;
            };
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            vnode._noSync()._normalizable(false);
            if (!refElement) {
                vChildNodes = vnode.vChildNodes;
                vRefElement = vChildNodes && vChildNodes[0];
                refElement = vRefElement && vRefElement.domNode;
            }
            (typeof content===STRING) && (content=htmlToVFragments(content, vnode.ns));
            if (content.isFragment) {
                vnodes = content.vnodes;
                len = vnodes.length;
                // to manage TextNodes which might get merged, we loop downwards:
                for (i=len-1; i>=0; i--) {
                    doPrepend(vnodes[i].domNode);
                }
            }
            else if (Array.isArray(content)) {
                len = content.length;
                // to manage TextNodes which might get merged, we loop downwards:
                for (i=len-1; i>=0; i--) {
                    item = content[i];
                    doPrepend(item);
                }
            }
            else {
                doPrepend(content);
            }
            vnode._normalizable(true)._normalize();
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
            return createdElement;
        };

        /**
         * Reference to the previous of sibbling Element, where the related dom-node is an Element(nodeType===1).
         *
         * @method previous
         * @param [cssSelector] {String} css-selector to be used as a filter
         * @return {Element|null}
         * @type Element
         * @since 0.0.1
         */
        ElementPrototype.previous = function(cssSelector) {
            var vnode = this.vnode,
                found, vPreviousElement, firstCharacter, i, len;
            if (!cssSelector) {
                vPreviousElement = vnode.vPreviousElement;
                return vPreviousElement && vPreviousElement.domNode;
            }
            else {
                i = -1;
                len = cssSelector.length;
                while (!firstCharacter && (++i<len)) {
                    firstCharacter = cssSelector[i];
                    (firstCharacter===' ') && (firstCharacter=null);
                }
                if (firstCharacter==='>') {
                    return null;
                }
            }
            vPreviousElement = vnode;
            do {
                vPreviousElement = vPreviousElement.vPreviousElement;
                found = vPreviousElement && vPreviousElement.matchesSelector(cssSelector);
            } while(vPreviousElement && !found);
            return found ? vPreviousElement.domNode : null;
        };

        /**
         * Returns the first Element within the Element, that matches the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
         * they need to be separated by a `comma`.
         *
         * @method querySelector
         * @param selectors {String} CSS-selector(s) that should match
         * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
         * @return {Element}
         */
        ElementPrototype.querySelector = function(selectors, insideItags) {
            var found,
                i = -1,
                len = selectors.length,
                firstCharacter, startvnode,
                thisvnode = this.vnode,
                inspectChildren = function(vnode) {
                    var vChildren = vnode.vChildren,
                        len2 = vChildren ? vChildren.length : 0,
                        j, vChildNode;
                    for (j=0; (j<len2) && !found; j++) {
                        vChildNode = vChildren[j];
                        vChildNode.matchesSelector(selectors, thisvnode) && (found=vChildNode.domNode);
                        found || (!insideItags && vChildNode.isItag && vChildNode.domNode.contentHidden) || inspectChildren(vChildNode); // not dive into itags (except from when content is not hidden)
                    }
                };
            while (!firstCharacter && (++i<len)) {
                firstCharacter = selectors[i];
                (firstCharacter===' ') && (firstCharacter=null);
            }
            startvnode = SIBLING_MATCH_CHARACTER[firstCharacter] ? thisvnode.vParent : thisvnode;
            startvnode && inspectChildren(startvnode);
            return found;
        };

        /**
         * Returns an ElementArray of all Elements within the Element, that match the CSS-selectors. You can pass one, or multiple CSS-selectors. When passed multiple,
         * they need to be separated by a `comma`.
         *
         * querySelectorAll is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
         *
         * @method querySelectorAll
         * @param selectors {String} CSS-selector(s) that should match
         * @param [insideItags=false] {Boolean} no deepsearch in iTags --> by default, these elements should be hidden
         * @return {ElementArray} non-life Array (snapshot) with Elements
         */
        ElementPrototype.querySelectorAll = function(selectors, insideItags) {
            var found = ElementArray.createArray(),
                i = -1,
                len = selectors.length,
                firstCharacter, startvnode,
                thisvnode = this.vnode,
                inspectChildren = function(vnode) {
                    var vChildren = vnode.vChildren,
                        len2 = vChildren ? vChildren.length : 0,
                        j, vChildNode;
                    for (j=0; j<len2; j++) {
                        vChildNode = vChildren[j];
                        vChildNode.matchesSelector(selectors, thisvnode) && (found[found.length]=vChildNode.domNode);
                        (!insideItags && vChildNode.isItag && vChildNode.domNode.contentHidden) || inspectChildren(vChildNode); // not dive into itags
                    }
                };
            while (!firstCharacter && (++i<len)) {
                firstCharacter = selectors[i];
                (firstCharacter===' ') && (firstCharacter=null);
            }
            startvnode = SIBLING_MATCH_CHARACTER[firstCharacter] ? thisvnode.vParent : thisvnode;
            startvnode && inspectChildren(startvnode);
            return found;
        };

       /**
         * Checks whether the Element has its rectangle inside the outbound-Element.
         * This is no check of the DOM-tree, but purely based upon coordinates.
         *
         * @method rectangleInside
         * @param outboundElement {Element} the Element where this element should lie inside
         * @return {Boolean} whether the Element lies inside the outboundElement
         * @since 0.0.1
         */
        ElementPrototype.rectangleInside = function(outboundElement) {
            var instance = this,
                outerRect = outboundElement.getBoundingClientRect(),
                innerRect = instance.getBoundingClientRect();
            return (outerRect.left<=innerRect.left) &&
                   (outerRect.top<=innerRect.top) &&
                   ((outerRect.left+outboundElement.offsetWidth)>=(innerRect.left+instance.offsetWidth)) &&
                   ((outerRect.top+outboundElement.offsetHeight)>=(innerRect.top+instance.offsetHeight));
        };

       /**
        * Removes the Element from the DOM.
        * Alias for thisNode.parentNode.removeChild(thisNode);
        *
        * @method remove
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Node} the DOM-node that was removed. You could re-insert it at a later time.
        * @since 0.0.1
        */
        ElementPrototype.remove = function(silent) {
            var instance = this,
                vnode = instance.vnode,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                vParent = vnode.vParent;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            vParent && vParent._removeChild(vnode);
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
            return instance;
        };

       /**
        * Removes the attribute from the Element.
        *
        * Alias for removeAttribute() BUT is chainable instead (removeAttribute is not).
        *
        * @method removeAttr
        * @param attributeName {String}
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeAttr = function(attributeName, silent) {
            this.removeAttribute(attributeName, silent);
            return this;
        };

       /**
         * Removes multiple attributes on the Element.
         * The argument should be one ore more AttributeNames.
         *
         * @example
         * instance.removeAttrs(['tabIndex', 'style']);
         *
         * @method removeAttrs
         * @param attributeData {Array|String}
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.removeAttrs = function(attributeData, silent) {
            var instance = this;
            Array.isArray(attributeData) || (attributeData=[attributeData]);
            attributeData.forEach(function(item) {
                instance.removeAttribute(item, silent);
            });
            return instance;
        };

       /**
        * Removes the attribute from the Element.
        *
        * Use removeAttr() to be able to chain.
        *
        * @method removeAttr
        * @param attributeName {String}
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @since 0.0.1
        */
        ElementPrototype._removeAttribute = ElementPrototype.removeAttribute;
        ElementPrototype.removeAttribute = function(attributeName, silent) {
            var prevSuppress = DOCUMENT._suppressMutationEvents || false;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            this.vnode._removeAttr(attributeName);
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
        };

       /**
         * Removes the attribute of the Elementinside a specified namespace
         *
         * @method removeAttributeNS
         * @param nameSpace {String} the namespace where to attribuyte should be set in
         * @param attributeName {String}
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        */
        ElementPrototype._removeAttributeNS = ElementPrototype.removeAttributeNS;
        ElementPrototype.removeAttributeNS = function(nameSpace, attributeName, silent) {
            this.removeAttribute((nameSpace ? nameSpace+':' : '')+attributeName, silent);
        };

        /**
        * Removes the Element's child-Node from the DOM.
        *
        * @method removeChild
        * @param domNode {Node} the child-Node to remove
        * @return {Node} the DOM-node that was removed. You could re-insert it at a later time.
        */
        ElementPrototype._removeChild = ElementPrototype.removeChild;
        ElementPrototype.removeChild = function(domNode) {
            var instance = this;
            instance.vnode._removeChild(domNode.vnode);
            return instance;
        };

       /**
        * Removes a className from the Element.
        *
        * @method removeClass
        * @param className {String|Array} the className that should be removed. May be an Array of classNames.
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @param [transitionFix] set this to `true` if you experience transition-problems due to wrong calculated css (mostly because of the `auto` value)
        *        Setting this parameter, will calculate the true css of the transitioned properties and set this temporarely inline, to fix the issue.
        *        Don't use it when not needed, it has a slightly performancehit.
        *        No need to set when `returnPromise` is set --> returnPromise always handles the transitionFix.
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Promise|this} In case `returnPromise` is set, a Promise returns with the next handles:
        *        <ul>
        *            <li>cancel() {Promise}</li>
        *            <li>freeze() {Promise}</li>
        *            <li>unfreeze()</li>
        *            <li>finish() {Promise}</li>
        *        </ul>
        *        These handles resolve with the `elapsed-time` as first argument of the callbackFn
        * @since 0.0.1
        */
        ElementPrototype.removeClass = function(className, returnPromise, transitionFix, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                transPromise, returnValue;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            transPromise = (returnPromise || transitionFix) && getClassTransPromise(instance, REMOVE, className);
            returnValue = returnPromise ? transPromise : instance;
            transPromise || instance.getClassList().remove(className);
            if (silent && DOCUMENT.suppressMutationEvents) {
                if (returnValue===instance) {
                    DOCUMENT.suppressMutationEvents(prevSuppress);
                }
                else {
                    returnValue.finally(function() {
                        DOCUMENT.suppressMutationEvents(prevSuppress);
                    });
                }
            }
            return returnValue;
        };

       /**
        * Removes data specified by `key` that was set by using `setData()`.
        * When no arguments are passed, all node-data (key-value pairs) will be removed.
        *
        * @method removeData
        * @param [key] {string} name of the key, when not set, all data is removed
        * @param [deep] {Boolean} whether to set the data to all descendants recursively
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeData = function(key, deep) {
            var instance = this,
                vnode = instance.vnode;
            if (vnode._data) {
                if (key) {
                    delete vnode._data[key];
                }
                else {
                    // we cannot just redefine _data, for it is set as readonly
                    vnode._cleanData();
                    if (deep) {
                        instance.getChildren().forEach(function(element) {
                            element.removeData(key, true);
                        });
                    }
                }
            }
            return instance;
        };

       /**
        * Removes the Elment's `id`.
        *
        * @method removeId
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeId = function() {
            return this.removeAttr('id');
        };

       /**
        * Removes a css-property (inline) out of the Element.
        * No need to use camelCase.
        *
        * @method removeInlineStyle
        * @param cssProperty {String} the css-property to remove
        * @param [pseudo] {String} to look inside a pseudo-style
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeInlineStyle = function(cssProperty, pseudo, returnPromise) {
            return this.removeInlineStyles({property: cssProperty, pseudo: pseudo}, returnPromise);
        };

       /**
        * Removes multiple css-properties (inline) out of the Element. You need to supply an Array of Objects, with the properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>pseudo  {String}</li>
        *        <ul>
        * No need to use camelCase.
        *
        * @method removeInlineStyles
        * @param cssProperties {Array|Object} Array of objects, Strings (or 1 Object/String).
        *       When String, then speduo is considered as undefined. When `Objects`, they need the properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>pseudo  {String}</li>
        *        <ul>
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeInlineStyles = function(cssProperties, returnPromise) {
            // There will be 3 sets of styles:
            // `fromStyles` --> the current styles, only exactly calculated -without `auto`- (that is, for the transitioned properties)
            // `toStylesExact` --> the new styles, exactly calculated -without `auto`- (that is, for the transitioned properties)
            // `vnodeStyles` --> the new styles as how they should be in the end (f.i. with `auto`)
            var instance = this,
                vnode = instance.vnode,
                removed = [],
                transCount = 0,
                transitionProperties = {},
                maxtranstime = 0,
                needSync, prop, styles, i, len, item, hasTransitionedStyle, promise, vnodeStyles,
                pseudo, group, clonedElement, fromStyles, toStylesExact, value, transproperty, transtime;

            Array.isArray(cssProperties) || (cssProperties=[cssProperties]);
            cssProperties = getVendorCSS(cssProperties);
            len = cssProperties.length;
            vnodeStyles = vnode.styles;
            for (i=0; i<len; i++) {
                item = cssProperties[i];
                if (typeof item==='string') {
                    item = cssProperties[i] = {
                        property: item
                    };
                }
                pseudo = item.pseudo;
                group = pseudo || 'element';
                styles = vnodeStyles[group];
                if (styles) {
                    prop = item.property;
                    // if property is vendor-specific transition, or transform, than we reset it to the current vendor
                    if (styles[prop]) {
                        fromStyles || (fromStyles=vnodeStyles.deepClone());
                        needSync = true;
                        if ((prop!==VENDOR_TRANSITION_PROPERTY) && instance.hasTransition(prop, pseudo)) {
                            // store the calculated value:
                            fromStyles[group] || (fromStyles[group]={});
                            (prop===VENDOR_TRANSFORM_PROPERTY) || (fromStyles[group][prop]=instance.getStyle(prop, group));
                            hasTransitionedStyle = true;
                            removed[removed.length] = {
                                group: group,
                                property: prop,
                                pseudo: pseudo
                            };
                        }
                        delete styles[prop];
                        (styles.size()===0) && (delete vnode.styles[pseudo || 'element']);
                    }
                }
            }

            RUNNING_ON_NODE && (hasTransitionedStyle=false);
            if (hasTransitionedStyle) {
                // fix the current style with what is actual calculated:
                vnode.styles = fromStyles; // exactly styles, so we can transition well
                instance.setClass(NO_TRANS);
                instance.setAttr(STYLE, vnode.serializeStyles());
                async(function() {
                    // needs to be done in the next eventcyle, otherwise webkit-browsers miscalculate the syle (with transition on)
                    instance.removeClass(NO_TRANS);
                });

                // now calculate the final value
                clonedElement = instance.cloneNode(true);
                toStylesExact = vnodeStyles.deepClone();
                clonedElement.vnode.styles = toStylesExact;
                clonedElement.setClass(INVISIBLE_UNFOCUSABLE);
                clonedElement.setAttr(STYLE, clonedElement.vnode.serializeStyles());
                DOCUMENT.body.append(clonedElement);
                // clonedElement has `vnodeStyles`, but we change them into `toStylesExact`

                len = removed.length;
                for (i=0; i<len; i++) {
                    item = removed[i];
                    prop = item.property;
                    group = item.pseudo || 'element';
                    if (!NON_CLONABLE_STYLES[prop]) {
                        value = (prop===VENDOR_TRANSFORM_PROPERTY) ? clonedElement.getInlineStyle(prop, item.pseudo) : clonedElement.getStyle(prop, item.pseudo);
                        if (value) {
                            toStylesExact[group] || (toStylesExact[group]={});
                            toStylesExact[group][prop] = value;
                        }
                    }
                    // look if we really have a change in the value:

                    if (toStylesExact[group] && (toStylesExact[group][prop]!==fromStyles[group][prop])) {
                        transproperty = instance.getTransition(prop, (group==='element') ? null : group);
                        transtime = transproperty.delay+transproperty.duration;
                        maxtranstime = Math.max(maxtranstime, transtime);
                        if (transtime>0) {
                            transCount++;
                            // TODO: transitionProperties supposes that we DO NOT have pseudo transitions!
                            // as soon we do, we need to split this object for each 'group'
                            transitionProperties[prop] = true;
                        }
                    }
                }
                hasTransitionedStyle = (transCount>0);
                clonedElement.remove();
            }
            if (needSync) {
                if (returnPromise || hasTransitionedStyle) {
                    promise = window.Promise.manage();
                    // need to call `setAttr` in a next event-cycle, otherwise the eventlistener made
                    // by `getTransPromise gets blocked.
                    async(function() {
                        if (hasTransitionedStyle) {
                            // reset
                            vnode.styles = toStylesExact;
                            promise.then(function() {
                                vnode.styles = vnodeStyles; // finally values, not exactly calculated, but as is passed through
                                instance.setClass(NO_TRANS);
                                instance.setAttr(STYLE, vnode.serializeStyles());
                            }).finally(function() {
                                async(function() {
                                    instance.removeClass(NO_TRANS);
                                    // webkit browsers seems to need to recalculate their set width:
                                    instance.getBoundingClientRect();
                                });
                            });
                        }
                        else {
                            vnode.styles = vnodeStyles; // finally values, not exactly calculated, but as is passed through
                        }
                        getTransPromise(instance, hasTransitionedStyle, null, transCount, transitionProperties, maxtranstime).then(
                            promise.fulfill
                        ).catch(promise.reject);
                        instance.setAttr(STYLE, vnode.serializeStyles());
                    });
                }
                else {
                    vnode.styles = vnodeStyles; // finally values, not exactly calculated, but as is passed through
                    instance.setAttr(STYLE, vnode.serializeStyles());
                    // webkit browsers seems to need to recalculate their set width:
                    instance.getBoundingClientRect();
                }
            }
            // else
            return returnPromise ? (promise || window.Promise.resolve()) : instance;
        };

       /**
        * Removes a subtype `transform`-css-property of (inline) out of the Element.
        * This way you can sefely remove partial `transform`-properties while remaining the
        * other inline `transform` css=properties.
        *
        * See more about tranform-properties: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
        *
        * @method removeInlineTransition
        * @param transitionProperty {String} the css-transform property to remove
        * @param [pseudo] {String} to look inside a pseudo-style
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeInlineTransition = function(transitionProperty, pseudo) {
            return this.removeInlineTransitions({property: transitionProperty, pseudo: pseudo});
        };

       /**
        * Removes multiple subtype `transform`-css-property of (inline) out of the Element.
        * This way you can sefely remove partial `transform`-properties while remaining the
        * other inline `transform` css=properties.
        * You need to supply an Array of Objects, with the properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>pseudo  {String}</li>
        *        <ul>
        *
        * See more about tranform-properties: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
        *
        * @method removeInlineTransitions
        * @param transitionProperties {Array|Object} the css-transform properties to remove
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.removeInlineTransitions = function(transitionProperties) {
            var instance = this,
                vnode = instance.vnode,
                styles = vnode.styles,
                groupStyle, transitionStyles, i, len, item, needSync, transitionProperty, pseudo;

            if (styles) {
                Array.isArray(transitionProperties) || (transitionProperties=[transitionProperties]);
                transitionProperties = getVendorCSS(transitionProperties);
                len = transitionProperties.length;
                for (i=0; i<len; i++) {
                    item = transitionProperties[i];
                    pseudo = item.pseudo;
                    groupStyle = styles && styles[pseudo || 'element'];
                    transitionStyles = groupStyle && groupStyle[VENDOR_TRANSITION_PROPERTY];
                    if (transitionStyles) {
                        transitionProperty = item.property;
                        if (transitionStyles[transitionProperty]) {
                            delete transitionStyles[transitionProperty];
                            (transitionStyles.size()===0) && (delete groupStyle[VENDOR_TRANSITION_PROPERTY]);
                            (styles.size()===0) && (delete vnode.styles[pseudo || 'element']);
                            needSync = true;
                        }
                    }
                }
            }
            needSync && instance.setAttr(STYLE, vnode.serializeStyles());
            return instance;
        };

       /**
        * Replaces the Element with a new Element.
        *
        * @method replace
        * @param content {Element|Element|ElementArray|String} content to replace
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @return {Element} the created Element (or the last when multiple)
        * @since 0.0.1
        */
        ElementPrototype.replace = function(newElement, escape) {
            var instance = this,
                vnode = instance.vnode,
                previousVNode = vnode.vPrevious,
                vParent = vnode.vParent,
                createdElement;
            createdElement = previousVNode ? vParent.domNode.append(newElement, escape, previousVNode.domNode) : vParent.domNode.prepend(newElement, escape);
            instance.setClass(HIDDEN);
            instance.remove();
            return createdElement;
        };

        /**
        * Replaces the Element's child-Element with a new Element.
        *
        * @method replaceChild
        * @param newElement {Element} the new Element
        * @param oldVChild {Element} the Element to be replaced
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @return {Element} the Element that was removed (equals oldVChild)
        * @since 0.0.1
        */
        ElementPrototype._replaceChild = ElementPrototype.replaceChild;
        ElementPrototype.replaceChild = function(newDomNode, oldDomNode, escape) {
            return oldDomNode.replace(newDomNode, escape);
        };

       /**
        * Replaces the className of the Element with a new className.
        * If the previous className is not available, the new className is set nevertheless.
        *
        * @method replaceClass
        * @param prevClassName {String} the className to be replaced
        * @param newClassName {String} the className to be set
        * @param [force ] {Boolean} whether the new className should be set, even is the previous className isn't there
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @param [transitionFix] set this to `true` if you experience transition-problems due to wrong calculated css (mostly because of the `auto` value)
        *        Setting this parameter, will calculate the true css of the transitioned properties and set this temporarely inline, to fix the issue.
        *        Don't use it when not needed, it has a slightly performancehit.
        *        No need to set when `returnPromise` is set --> returnPromise always handles the transitionFix.
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Promise|this} In case `returnPromise` is set, a Promise returns with the next handles:
        *        <ul>
        *            <li>cancel() {Promise}</li>
        *            <li>freeze() {Promise}</li>
        *            <li>unfreeze()</li>
        *            <li>finish() {Promise}</li>
        *        </ul>
        *        These handles resolve with the `elapsed-time` as first argument of the callbackFn
        * @since 0.0.1
        */
        ElementPrototype.replaceClass = function(prevClassName, newClassName, force, returnPromise, transitionFix, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                transPromise, returnValue;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            transPromise = (returnPromise || transitionFix) && getClassTransPromise(instance, REPLACE, newClassName, prevClassName, force);
            if (force || instance.hasClass(prevClassName)) {
                returnValue = returnPromise ? transPromise : instance;
                transPromise || instance.removeClass(prevClassName).setClass(newClassName);
                return returnValue;
            }
            if (silent && DOCUMENT.suppressMutationEvents) {
                if (returnValue===instance) {
                    DOCUMENT.suppressMutationEvents(prevSuppress);
                }
                else {
                    returnValue.finally(function() {
                        DOCUMENT.suppressMutationEvents(prevSuppress);
                    });
                }
            }
            return returnPromise ? window.Promise.resolve() : instance;
        };

        /**
         * Scrolls the content of the Element into the specified scrollposition.
         * Only available when the Element has overflow.
         *
         * @method scrollTo
         * @param x {Number} left-offset in pixels
         * @param y {Number} top-offset in pixels
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.scrollTo = function(x, y) {
            var instance = this;
            instance.scrollLeft = x;
            instance.scrollTop = y;
            return instance;
        };

       /**
         * Sets the attribute on the Element with the specified value.
         *
         * Alias for setAttribute(), BUT differs in a way that setAttr is chainable, setAttribute is not.
         *
         * @method setAttr
         * @param attributeName {String}
         * @param value {Any} the value that belongs to `key`
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.setAttr = function(attributeName, value, silent) {
            var instance = this;
            instance.setAttribute(attributeName, value, silent);
            return instance;
        };

       /**
         * Sets the attribute on the Element with the specified value.
         *
         * Alias for setAttr(), BUT differs in a way that setAttr is chainable, setAttribute is not.
         *
         * @method setAttribute
         * @param attributeName {String}
         * @param value {String} the value for the attributeName
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        */
        ElementPrototype._setAttribute = ElementPrototype.setAttribute;
        ElementPrototype.setAttribute = function(attributeName, value, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                vnode = instance.vnode;
            (value==='') && (value=null);
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            ((value!==null) && (value!==undefined)) ? vnode._setAttr(attributeName, value) : vnode._removeAttr(attributeName);
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
        };

       /**
         * Sets the attribute on the Element with the specified value inside a specified namespace
         *
         * @method setAttributeNS
         * @param nameSpace {String} the namespace where to attribuyte should be set in
         * @param attributeName {String}
         * @param value {String} the value for the attributeName
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        */
        ElementPrototype._setAttributeNS = ElementPrototype.setAttributeNS;
        ElementPrototype.setAttributeNS = function(nameSpace, attributeName, value, silent) {
            this.setAttribute((nameSpace ? nameSpace+':' : '')+attributeName, value, silent);
        };

       /**
         * Sets multiple attributes on the Element with the specified value.
         * The argument should be one ore more Objects with the properties: `name` and `value`
         *
         * @example
         * instance.setAttrs([
         *                      {name: 'tabIndex', value: '0'},
         *                      {name: 'style', value: 'color: #000;'}
         *                  ]);
         *
         * @method setAttrs
         * @param attributeData {Array|Object}
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.setAttrs = function(attributeData, silent) {
            var instance = this;
            Array.isArray(attributeData) || (attributeData=[attributeData]);
            attributeData.forEach(function(item) {
                instance.setAttribute(item.name, item.value, silent);
            });
            return instance;
        };

       /**
        * Adds a class to the Element. If the class already exists it won't be duplicated.
        *
        * @method setClass
        * @param className {String|Array} className to be added, may be an array of classNames
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @param [transitionFix] set this to `true` if you experience transition-problems due to wrong calculated css (mostly because of the `auto` value)
        *        Setting this parameter, will calculate the true css of the transitioned properties and set this temporarely inline, to fix the issue.
        *        Don't use it when not needed, it has a slightly performancehit.
        *        No need to set when `returnPromise` is set --> returnPromise always handles the transitionFix.
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Promise|this} In case `returnPromise` is set, a Promise returns with the next handles:
        *        <ul>
        *            <li>cancel() {Promise}</li>
        *            <li>freeze() {Promise}</li>
        *            <li>unfreeze()</li>
        *            <li>finish() {Promise}</li>
        *        </ul>
        *        These handles resolve with the `elapsed-time` as first argument of the callbackFn
        * @since 0.0.1
        */
        ElementPrototype.setClass = function(className, returnPromise, transitionFix, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                transPromise, returnValue;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            transPromise = (returnPromise || transitionFix) && getClassTransPromise(instance, SET, className);
            returnValue = returnPromise ? transPromise : instance;
            transPromise || instance.getClassList().add(className);
            if (silent && DOCUMENT.suppressMutationEvents) {
                if (returnValue===instance) {
                    DOCUMENT.suppressMutationEvents(prevSuppress);
                }
                else {
                    returnValue.finally(function() {
                        DOCUMENT.suppressMutationEvents(prevSuppress);
                    });
                }
            }
            return returnValue;
        };

        /**
         * Stores arbitary `data` at the Element (actually at vnode). This has nothing to do with node-attributes whatsoever,
         * it is just a way to bind any data to the specific Element so it can be retrieved later on with `getData()`.
         *
         * @method setData
         * @param key {string} name of the key
         * @param value {Any} the value that belongs to `key`
         * @param [deep] {Boolean} whether to set the data to all descendants recursively
         * @chainable
         * @since 0.0.1
        */
        ElementPrototype.setData = function(key, value, deep) {
            var instance = this,
                vnode = instance.vnode;
            if (value!==undefined) {
                vnode._data || Object.protectedProp(vnode, '_data', {});
                vnode._data[key] = value;
                if (deep) {
                    instance.getChildren().forEach(function(element) {
                        element.setData(key, value, true);
                    });
                }
            }
            return instance;
        };

        /**
         * Sets the innerHTML of both the vnode as well as the representing dom-node.
         * Goes through the vdom, so it's superfast.
         *
         * Use this method instead of `innerHTML`
         *
         * Syncs with the DOM.
         *
         * @method setHTML
         * @param val {String} the new value to be set
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
         * @chainable
         * @since 0.0.1
         */
        ElementPrototype.setHTML = function(val, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            instance.vnode.innerHTML = val;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
            return instance;
        };

       /**
        * Sets the Elments `id`
        *
        * @method setId
        * @param val {String} Elements new `id`
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.setId = function(val) {
            return this.setAttr('id', val);
        };

       /**
        * Sets a css-property (inline) for the Element.
        *
        * Note1: Do not use vendor-specific properties, but general (like `transform` instead of `-webkit-transform`)
        *        This method will use the appropriate css-property.
        * Note2: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
        *
        * @method setInlineStyle
        * @param cssProperty {String} the css-property to be set
        * @param value {String} the css-value
        * @param [pseudo] {String} to look inside a pseudo-style
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @return {Promise|this}
        * @since 0.0.1
        */
        ElementPrototype.setInlineStyle = function(cssProperty, value, pseudo, returnPromise) {
            if (typeof pseudo==='boolean') {
                returnPromise = pseudo;
                pseudo = null;
            }
            return this.setInlineStyles([{property: cssProperty, value: value, pseudo: pseudo}], returnPromise);
        };

       /**
        * Sets multiple css-properties (inline) for the Element at once.
        *
        * Note1: Do not use vendor-specific properties, but general (like `transform` instead of `-webkit-transform`)
        *        This method will use the appropriate css-property.
        * Note2: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
        *
        * @method setInlineStyles
        * @param cssProperties {Array|Object} the css-properties to be set, specified as an Array of Objects, or 1 Object.
        *        The objects should have the next properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>value  {String}</li>
        *            <li>pseudo  {String} (optional) --> not: not supported yet in browsers</li>
        *        </ul>
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @return {Promise|this}
        * @since 0.0.1
        */
        ElementPrototype.setInlineStyles = function(cssProperties, returnPromise) {
            // There will be 3 sets of styles:
            // `fromStyles` --> the current styles, only exactly calculated -without `auto`- (that is, for the transitioned properties)
            // `toStylesExact` --> the new styles, exactly calculated -without `auto`- (that is, for the transitioned properties)
            // `vnodeStyles` --> the new styles as how they should be in the end (f.i. with `auto`)
            var instance = this,
                vnode = instance.vnode,
                transitionedProps = [],
                transCount = 0,
                maxtranstime = 0,
                transitionProperties = {},
                // third argument is a hidden feature --> used by getClassTransPromise()
                avoidBackup = arguments[2],
                styles, group, i, len, item, promise, hasTransitionedStyle, property, hasChanged, transtime,
                pseudo, fromStyles, value, vnodeStyles, toStylesExact, clonedElement, transproperty;

            // if there is a class-transition going on (initiated by getClassTransPromise),
            // the we might need to update the internal bkpNode:
            if (!avoidBackup && vnode._data) {
                // there might be more bkpNodes, so we need to loop through the data:
                vnode._data.each(function(bkpNode, key) {
                    if (key.startsWith('bkpNode')) {
                        bkpNode.setInlineStyles(cssProperties, null, true);
                    }
                });
            }

            Array.isArray(cssProperties) || (cssProperties=[cssProperties]);
            cssProperties = getVendorCSS(cssProperties);
            len = cssProperties.length;
            vnode.styles || (vnode.styles={});
            vnodeStyles = vnode.styles;
            // Both `from` and `to` ALWAYS need to be set to their calculated value --> this makes transition
            // work with `auto`, or when the page isn't completely loaded
            // First: backup the actual style:
            fromStyles = vnodeStyles.deepClone();
            for (i=0; i<len; i++) {
                item = cssProperties[i];
                pseudo = item.pseudo;
                group = pseudo || 'element';
                vnodeStyles[group] || (vnodeStyles[group]={});
                styles = vnodeStyles[group];
                property = fromCamelCase(item.property);
                value = item.value;

                (property===VENDOR_TRANSITION_PROPERTY) && (value=extractor.toTransitionObject(value));
                if (value===undefined) {
                    delete styles[property];
                }
                else {
                    styles[property] = value;
                }
                if ((property!==VENDOR_TRANSITION_PROPERTY) && instance.hasTransition(property, pseudo)) {
                    fromStyles[group] || (fromStyles[group]={});
                    (property===VENDOR_TRANSFORM_PROPERTY) || (fromStyles[group][property]=instance.getStyle(property, pseudo));
                    if (fromStyles[group][property]!==value) {
                        transproperty = instance.getTransition(property, (group==='element') ? null : group);
                        transtime = transproperty.delay+transproperty.duration;
                        maxtranstime = Math.max(maxtranstime, transtime);
                        if (transtime>0) {
                            hasTransitionedStyle = true;
                            transCount++;
                            // TODO: transitionProperties supposes that we DO NOT have pseudo transitions!
                            // as soon we do, we need to split this object for each 'group'
                            transitionProperties[property] = true;
                            transitionedProps[transitionedProps.length] = {
                                group: group,
                                property: property,
                                value: value,
                                pseudo: pseudo
                            };
                        }
                    }
                }
            }
            RUNNING_ON_NODE && (hasTransitionedStyle=false);
            if (hasTransitionedStyle) {
                // we forced set the exact initial css inline --> this is the only way to make a right transition
                // under all circumstances
                toStylesExact = vnodeStyles.deepClone();
                clonedElement = instance.cloneNode(true); // cloned with `vnodeStyles`
                clonedElement.vnode.styles = toStylesExact;
                // fix the current style with what is actual calculated:
                vnode.styles = fromStyles; // exactly styles, so we can transition well
                instance.setClass(NO_TRANS);
                instance.setAttr(STYLE, vnode.serializeStyles());
                async(function() {
                    // needs to be done in the next eventcyle, otherwise webkit-browsers miscalculate the syle (with transition on)
                    instance.removeClass(NO_TRANS);
                });

                // clonedElement has `vnodeStyles`, but we change them into `toStylesExact`
                clonedElement.setClass(INVISIBLE_UNFOCUSABLE);
                clonedElement.setAttr(STYLE, clonedElement.vnode.serializeStyles());
                DOCUMENT.body.append(clonedElement);

                // now calculate the `transition` styles and store them in the css-property of `toStylesExact`:
                len = transitionedProps.length;
                hasChanged = false;
                for (i=0; i<len; i++) {
                    item = transitionedProps[i];
                    property = item.property;
                    group = item.pseudo || 'element';
                    if (!NON_CLONABLE_STYLES[property]) {
                        value = (property===VENDOR_TRANSFORM_PROPERTY) ? clonedElement.getInlineStyle(property, item.pseudo) : clonedElement.getStyle(property, item.pseudo);
                        if (value) {
                            toStylesExact[group] || (toStylesExact[group]={});
                            toStylesExact[group][property] = value;
                        }
                    }
                    // look if we really have a change in the value:
                    if (!hasChanged && toStylesExact[group]) {
                        hasChanged = (toStylesExact[group][property]!==fromStyles[group][property]);
                    }
                }
                clonedElement.remove();
                hasTransitionedStyle = hasChanged;
            }
            RUNNING_ON_NODE && (hasTransitionedStyle=false);
            if (returnPromise || hasTransitionedStyle) {
                promise = window.Promise.manage();
                // need to call `setAttr` in a next event-cycle, otherwise the eventlistener made
                // by `getTransPromise gets blocked.
                async(function() {
                    if (hasTransitionedStyle) {
                        // reset
                        vnode.styles = toStylesExact;
                        promise.then(function() {

                            vnode.styles = vnodeStyles; // finally values, not exactly calculated, but as is passed through
                            instance.setClass(NO_TRANS);
                            instance.setAttr(STYLE, vnode.serializeStyles());
                        }).finally(function() {
                            async(function() {
                                // needs to be done in the next eventcyle, otherwise webkit-browsers miscalculate the syle (with transition on)
                                instance.removeClass(NO_TRANS);
                                // webkit browsers seems to need to recalculate their set width:
                                instance.getBoundingClientRect();
                            });
                        });
                    }
                    else {
                        vnode.styles = vnodeStyles; // finally values, not exactly calculated, but as is passed through
                    }
                    getTransPromise(instance, hasTransitionedStyle, null, transCount, transitionProperties, maxtranstime).then(
                        function() {
                            promise.fulfill();
                        }
                    ).catch(promise.reject);
                    instance.setAttr(STYLE, vnode.serializeStyles());
                });
                return returnPromise ? promise : instance;
            }
            // else
            vnode.styles = vnodeStyles; // finally values, not exactly calculated, but as is passed through
            instance.setAttr(STYLE, vnode.serializeStyles());
            // webkit browsers seems to need to recalculate their set width:
            instance.getBoundingClientRect();
            return instance;
        };

       /**
        * Sets a transform-css-property (inline) for the Element.
        *
        * See more about transitions: https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions
        *
        * @method setStyle
        * @param setInlineTransition {String} the css-property to be set, f.e. `translateX`
        * @param duration {Number} the duration in seconds (may be a broken number, like `0.5`)
        * @param [timingFunction] {String} See https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function
        * @param delay {Number} the delay in seconds (may be a broken number, like `0.5`)
        * @param [pseudo] {String} to look inside a pseudo-style
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.setInlineTransition = function(transitionProperty, duration, timingFunction, delay, pseudo) {
            // transition-example: transition: width 2s, height 2s, transform 2s;
            return this.setInlineTransitions({property: transitionProperty, duration: duration, timingFunction: timingFunction, delay: delay, pseudo: pseudo});
        };

       /**
        * Sets a transform-css-property (inline) for the Element.
        *
        * See more about transitions: https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions
        *
        * @method setStyle
        * @param transitionProperties {Array} the css-transition-properties to be set, specified as an Array of Objects.
        *        The objects should have the next properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>duration  {Number}</li>
        *            <li>timingFunction  {String} (optional)</li>
        *            <li>delay  {Number} (optional)</li>
        *            <li>pseudo  {String} (optional)</li>
        *        </ul>
        * @param [pseudo] {String} to look inside a pseudo-style
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.setInlineTransitions = function(transitionProperties) {
            // transition-example: transition: width 2s, height 2s, transform 2s;
            var instance = this,
                vnode = instance.vnode,
                transitionStyles, transitionProperty, group, trans, i, len, item;
            Array.isArray(transitionProperties) || (transitionProperties=[transitionProperties]);
            transitionProperties = getVendorCSS(transitionProperties);
            len = transitionProperties.length;
            vnode.styles || (vnode.styles={});
            for (i=0; i<len; i++) {
                item = transitionProperties[i];
                if (item.property) {
                    group = item.pseudo || 'element';
                    vnode.styles[group] || (vnode.styles[group]={});
                    vnode.styles[group][VENDOR_TRANSITION_PROPERTY] || (vnode.styles[group][VENDOR_TRANSITION_PROPERTY]={});
                    transitionStyles = vnode.styles[group][VENDOR_TRANSITION_PROPERTY];
                    transitionProperty = fromCamelCase(item.property);
                    trans = transitionStyles[transitionProperty] = {
                        duration: item.duration
                    };
                    item.timingFunction && (trans.timingFunction=item.timingFunction);
                    item.delay && (trans.delay=item.delay);
                }
            }
            instance.setAttr(STYLE, vnode.serializeStyles());
            return instance;
        };

        /**
         * Gets or sets the outerHTML of both the Element as well as the representing dom-node.
         * Goes through the vdom, so it's superfast.
         *
         * Use this property instead of `outerHTML`
         *
         * Syncs with the DOM.
         *
         * @method setOuterHTML
         * @param val {String} the new value to be set
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
         * @chainable
         * @since 0.0.1
         */
        ElementPrototype.setOuterHTML = function(val, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            instance.vnode.outerHTML = val;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
            return instance;
        };

        /**
         * Sets the innerContent of the Element as plain text.
         * Goes through the vdom, so it's superfast.
         *
         * Use this method instead of `textContent`
         *
         * Syncs with the DOM.
         *
         * @method setText
         * @param val {String} the textContent to be set
         * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
         * @chainable
         * @since 0.0.1
         */
        ElementPrototype.setText = function(val, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            instance.vnode.textContent = val;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(prevSuppress);
            return instance;
        };

       /**
        * Sets the value of the following Elements:
        *
        * <ul>
        *     <li>input</li>
        *     <li>textarea</li>
        *     <li>select</li>
        *     <li>any container that is `contenteditable`</li>
        * </ul>
        *
        * Will emit a `valuechange`-event when a new value is set and ITSA's `event`-module is active.
        *
        * @method setValue
        * @param val {String} thenew value to be set
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.setValue = function(val) {
            var instance = this,
                prevVal = instance.value,
                contenteditable = instance.vnode.attrs.contenteditable,
            // cautious: input and textarea must be accessed by their propertyname:
            // input.getAttribute('value') would return the defualt-value instead of actusl
            // and textarea.getAttribute('value') doesn't exist
                editable = contenteditable && (contenteditable!=='false'),
                tag, i, option, len, vChildren;
            if (editable) {
                instance.setHTML(val);
            }
            else {
                tag = instance.getTagName();
                if ((tag==='INPUT') || (tag==='TEXTAREA')) {
                    instance.value = val;
                }
                else if (tag==='SELECT') {
                    vChildren = instance.vnode.vChildren;
                    len = vChildren.length;
                    for (i=0; i<len; i++) {
                        option = vChildren[i];
                        if (option.attrs.value === val) {
                            instance.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
            // if `document._emitVC` is available, then invoke it to emit the `valuechange`-event
            /**
            * @event valuechange
            * @param e.value {String} new value
            * @param e.sourceTarget {Element} Element whare the valuechange occured
            */
            DOCUMENT._emitVC && (prevVal!==val) && DOCUMENT._emitVC(instance, val);
            return instance;
        };

       /**
         * Set the position of an html element in page coordinates.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         *
         * If the Element has the attribute `xy-constrian` set, then its position cannot exceed any matching container it lies within.
         *
         * @method setXY
         * @param x {Number} x-value for new position (coordinates are page-based)
         * @param y {Number} y-value for new position (coordinates are page-based)
         * @param [constrain] {'window', Element, Object, String}
         * <ul>
         *     <li><b>'window'</b> to constrain to the visible window</li>
         *     <li><b>Element</b> to constrain to a specified Element</li>
         *     <li><b>Object</b> to constrain to an object with the properties: {x, y, w, h} where x and y are absolute pixels of the document
         *            (like calculated with getX() and getY()).</li>
         *     <li><b>String</b> to constrain to a specified css-selector, which should be an ancestor</li>
         * </ul>
         * @param [notransition=false] {Boolean} set true if you are sure positioning is without transition.
         *        this isn't required, but it speeds up positioning. Only use when no transition is used:
         *        when there is a transition, setting this argument `true` would miscalculate the position.
         *        The return-value will be `this` in case `notransition`===true, making setXY to be chainable.
         * @return {Promise|this}
         * @since 0.0.1
         */
        ElementPrototype.setXY = function(x, y, constrain, notransition) {
            console.log(NAME, 'setXY '+x+','+y);
            var instance = this,
                dif, match, constrainNode, byExactId, parent, clone, promise,
                containerTop, containerRight, containerLeft, containerBottom, requestedX, requestedY,
                transObject, xtrans, ytrans, inlinePosition, globalPosition, invisibleClass;

            // default position to relative: check first inlinestyle because this goes quicker
            inlinePosition = instance.getInlineStyle(POSITION);
            inlinePosition || (globalPosition=instance.getStyle(POSITION));
            if ((inlinePosition==='static') || (inlinePosition==='fixed') || (globalPosition==='static') || (globalPosition==='fixed')) {
                inlinePosition = 'relative';
                instance.setInlineStyle(POSITION, inlinePosition);
            }
            invisibleClass = (inlinePosition==='absolute') ? INVISIBLE : INVISIBLE_RELATIVE;
            // make sure it has sizes and can be positioned
            instance.setClass([invisibleClass, BORDERBOX]);
            (instance.getInlineStyle('display')==='none') && instance.setClass(BLOCK);
            constrain || (constrain=instance.getAttr('constrain-selector'));
            if (constrain) {
                if (constrain==='window') {
                    containerLeft = window.getScrollLeft();
                    containerTop = window.getScrollTop();
                    containerRight = containerLeft + window.getWidth();
                    containerBottom = containerTop + window.getHeight();
                }
                else {
                    if (typeof constrain === STRING) {
                        match = false;
                        constrainNode = instance.getParent();
                        byExactId = REGEXP_NODE_ID.test(constrain);
                        while (constrainNode.matchesSelector && !match) {
                            match = byExactId ? (constrainNode.id===constrain.substr(1)) : constrainNode.matchesSelector(constrain);
                            // if there is a match, then make sure x and y fall within the region
                            match || (constrainNode=constrainNode.getParent());
                        }
                        // if Element found, then bound it to `constrain` as if the argument `constrain` was an Element
                        match && (constrain=constrainNode);
                    }
                    if (constrain.matchesSelector) {
                        // Element --> we need to search the rectangle
                        containerLeft = constrain.left + parseInt(constrain.getStyle(BORDER_LEFT_WIDTH), 10);
                        containerTop = constrain.top + parseInt(constrain.getStyle(BORDER_TOP_WIDTH), 10);
                        containerRight = containerLeft + constrain.scrollWidth;
                        containerBottom = containerTop + constrain.scrollHeight;
                    }
                    else {
                        containerLeft = constrain.x;
                        containerTop = constrain.y;
                        containerRight = constrain.x + constrain.w;
                        containerBottom = constrain.y + constrain.h;
                    }
                }
                if (typeof containerLeft === NUMBER) {
                    // found constrain, always redefine x and y
                    x = requestedX = (typeof x===NUMBER) ? x : instance.left;
                    if (requestedX<containerLeft) {
                        x = containerLeft;
                    }
                    else {
                        if ((requestedX+instance.offsetWidth)>containerRight) {
                            x = requestedX = containerRight - instance.offsetWidth;
                        }
                        // now we might need to reset to the left again:
                        (requestedX<containerLeft) && (x=containerLeft);
                    }
                    y = requestedY = (typeof y===NUMBER) ? y : instance.top;
                    if (requestedY<containerTop) {
                        y = containerTop;
                    }
                    else {
                        if ((requestedY+instance.offsetHeight)>containerBottom) {
                            y = requestedY = containerBottom - instance.offsetHeight;
                        }
                        // now we might need to reset to the top again:
                        (requestedY<containerTop) && (y=containerTop);
                    }
                }
            }
            xtrans = (typeof x === NUMBER);
            ytrans = (typeof y === NUMBER);
            if (xtrans || ytrans) {
                // check if there is a transition:
                if (notransition) {
                    instance.setClass([NO_TRANS2, invisibleClass]);
                    transObject = [];
                    xtrans && (transObject[0]={property: LEFT, value: x + PX});
                    ytrans && (transObject[xtrans ? 1 : 0]={property: TOP, value: y + PX});
                    instance.setInlineStyles(transObject);
                    // reset transObject and maybe it will be filled when there is a difference
                    // between the set value and the true value (which could appear due to different `position` properties)
                    transObject = [];
                    if (xtrans) {
                        dif = (instance.left-x);
                        (dif!==0) && (transObject[0]={property: LEFT, value: (x - dif) + PX});
                    }
                    if (ytrans) {
                        dif = (instance.top-y);
                        (dif!==0) && (transObject[transObject.length]={property: TOP, value: (y - dif) + PX});
                    }
                    (transObject.length>0) && instance.setInlineStyles(transObject);
                    instance.removeClass([NO_TRANS2, invisibleClass]);
                }
                else {
                    // we will clone the node, make it invisible and without transitions and look what its correction should be
                    clone = instance.cloneNode();
                    clone.setClass([NO_TRANS2, invisibleClass]);
                    parent = instance.getParent() || DOCUMENT.body;
                    parent.prepend(clone, null, instance);

                    transObject = [];
                    xtrans && (transObject[0]={property: LEFT, value: x + PX});
                    ytrans && (transObject[xtrans ? 1 : 0]={property: TOP, value: y + PX});

                    clone.setInlineStyles(transObject);

                    // reset transObject and fill it with the final true values
                    transObject = [];
                    xtrans && (transObject[0]={property: LEFT, value: (2*x-clone.left) + PX});
                    ytrans && (transObject[xtrans ? 1 : 0]={property: TOP, value: (2*y-clone.top) + PX});
                    clone.remove();
                    promise = instance.setInlineStyles(transObject, true);
                }
            }
            else if (!notransition) {
                promise = window.Promise.resolve();
            }
            instance.removeClass([BLOCK, BORDERBOX, invisibleClass]);
            return promise || instance;
        };

       /**
        * Shows a previously hidden node.
        * Shows immediately without `fade`, or will fade-in when fade is specified.
        *
        * @method show
        * @param [fade] {Number} sec to fade-in (you may use `0.1`)
        * @return {this|Promise} fulfilled when the element is ready showing up, or rejected when hidden again (using node.hide) before fully showed.
        * @since 0.0.1
        */
        ElementPrototype.show = function(duration, forceFull) {
            var instance = this,
                showPromise = instance.getData('_showNodeBusy'),
                hidePromise = instance.getData('_hideNodeBusy'),
                originalOpacity, hasOriginalOpacity, promise, freezedOpacity, finalValue;

            instance.setData('nodeShowed', true); // for any routine who wants to know
            originalOpacity = instance.getData('_showNodeOpacity');
            if (!originalOpacity && !showPromise && !hidePromise) {
                originalOpacity = instance.getInlineStyle('opacity');
                instance.setData('_showNodeOpacity', originalOpacity);
            }
            hasOriginalOpacity = !!originalOpacity;

            showPromise && showPromise.freeze();
            if (hidePromise) {
                hidePromise.freeze();
                instance.removeData('_hideNodeBusy');
            }

            if (duration) {

                instance.setInlineStyle('opacity', (instance.hasClass(HIDDEN) ? 0 : instance.getStyle('opacity')));
                instance.removeClass(HIDDEN);

                finalValue = (forceFull || !hasOriginalOpacity) ? 1 : originalOpacity;
                if (showPromise || hidePromise) {
                    freezedOpacity = instance.getInlineStyle('opacity');
                    duration = (finalValue>0) ? Math.min(1, ((finalValue-freezedOpacity)/finalValue))*duration : 0;
                }
                promise = instance.transition({property: 'opacity', value: finalValue, duration: duration});
                instance.setData('_showNodeBusy', promise);

                promise.finally(function() {
                    if (!promise.cancelled && !promise.frozen) {
                        hasOriginalOpacity || instance.removeInlineStyle('opacity');
                        if (!forceFull || !hasOriginalOpacity) {
                            instance.removeData('_showNodeOpacity');
                        }
                    }
                    instance.removeData('_showNodeBusy');
                });
                return promise;
            }
            else {
                async(function() {
                    (hasOriginalOpacity && !forceFull) ? instance.setInlineStyle('opacity', originalOpacity) : instance.removeInlineStyle('opacity');
                    instance.removeClass(HIDDEN);
                });
                return instance;
            }
        };

       /**
        * Transitions one ore more properties of the Element.
        *
        * @method toggleClass
        * @param to {Array} the css-properties to be set, specified as an Array of Objects.
        *        The objects should have the next properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>value  {String}</li>
        *            <li>duration  {Number} (optional)</li>
        *            <li>timingFunction  {String} (optional)</li>
        *            <li>delay  {String} (optional)</li>
        *            <li>pseudo  {String} (optional) --> not: not supported yet in browsers</li>
        *        </ul>
        * @param [from] {Array} starting the css-properties to be set, specified as an Array of Objects.
        *        If disguarded, then the current style is used as startingpoint. You may specify a subset of the `to`-properties.
        *        The objects should have the next properties:
        *        <ul>
        *            <li>property  {String}</li>
        *            <li>value  {String}</li>
        *            <li>duration  {Number} (optional)</li>
        *            <li>timingFunction  {String} (optional)</li>
        *            <li>delay  {String} (optional)</li>
        *            <li>pseudo  {String} (optional) --> not: not supported yet in browsers</li>
        *        </ul>
        * @return {Promise} The promise has the handles:
        *        <ul>
        *            <li>cancel() {Promise}</li>
        *            <li>freeze() {Promise}</li>
        *            <li>unfreeze()</li>
        *            <li>finish() {Promise}</li>
        *        </ul>
        *        These handles resolve with the `elapsed-time` as first argument of the callbackFn
        * @since 0.0.1
        */
        ElementPrototype.transition = function(to, from) {
            var instance = this,
                currentInlineTransition, transitions, transitionRun, transitionError, promise, resolveHandle, initialStyle, time1, intermediateInvoked,
                initialProperties, cleanup, getCurrentProperties, manipulated, getNoTransProp, transpromise, endIntermediate, time2;

            to || (to={});
            Array.isArray(to) || (to=[to]);
            to = getVendorCSS(to);
            transitions = Array.isArray(to) ? to.deepClone() : [to.shallowClone()];
            time1 = Date.now();
            // transitions = Array.isArray(to) ? to.deepClone() : [to.shallowClone()];
            cleanup = function() {
                currentInlineTransition = instance.getData('_bkpTransition');
                currentInlineTransition ? instance.setInlineStyle(TRANSITION, currentInlineTransition) : instance.removeInlineStyle(TRANSITION);
                instance.removeData('_bkpTransition');
                instance.removeData('_readyOnRun');
                Object.defineProperty(promise, 'isFulfilled', {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: true
                });
            };
            getCurrentProperties = function() {
                var props = [],
                    currentStyle = window.getComputedStyle(instance),
                    currentStyleBefore = window.getComputedStyle(instance, ':before'),
                    currentStyleAfter = window.getComputedStyle(instance, ':after');
                to.each(function(value) {
                    var styles = (value.pseudo===':before') ? currentStyleBefore : ((value.pseudo===':after') ? currentStyleAfter : currentStyle),
                        property = value.property;
                    // if property is vendor-specific transition, or transform, than we reset it to the current vendor
                    props.push({
                        property: property,
                        value: styles[toCamelCase(property)]
                    });
                });
                return props;
            };
            getNoTransProp = function() {
                var props = [];
                transitions.forEach(function(item) {
                    props.push({
                        property: item.property,
                        duration: 0,
                        delay: 0
                    });
                });
                return props;
            };
            endIntermediate = function(type) {
                intermediateInvoked = true;
                if (!promise.isFulfilled) {
                    manipulated = true;
                    instance.setInlineTransitions(getNoTransProp());
                    instance.setInlineStyles((type==='cancelled') ? initialProperties : getCurrentProperties());
                    // also force to set the style on the node outside the vdom --> by forcing this
                    // we won't run into the situation where the vdom doesn't change the dom because the style didn';'t change:
                    instance._setAttribute(STYLE, instance.getAttr(STYLE));
                    switch (type) {
                        case 'cancelled':
                            // now cleanup inline style that wasn't there initially,
                            async(function() {
                                instance.setClass(NO_TRANS2);
                                instance.setAttr(STYLE, initialStyle);
                                instance.removeClass(NO_TRANS2);
                            });
                            cleanup();
                        break;
                        case 'frozen':
                            async(function() {
                                cleanup();
                            });
                        break;
                        case 'finished':
                            instance.setInlineStyles(to);
                            async(function() {
                                cleanup();
                            });
                        break;
                    }
                    Object.defineProperty(promise, type, {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: true
                    });
                    // prevent transitionpromise to set its own final values after finishing
                    // but only if it is already available:
                    transpromise && transpromise.reject();
                    resolveHandle && resolveHandle();
                }
                time2 || (time2=Date.now());
                return new window.Promise(function(resolve) {
                    async(function() {
                        resolve(time2-time1);
                    });
                });
            };
            promise = new window.Promise(function(resolve, reject) {
                async(function() {
                    if (intermediateInvoked) {
                        reject();
                        return;
                    }
                    resolveHandle = resolve;
                    transitionRun = idGenerator('nodeTransition');
                    // only make ready on the last run
                    instance.setData('_readyOnRun', transitionRun);

                    if (from) {
                        instance.setClass(NO_TRANS2);
                        instance.setInlineStyles(from);
                        instance.removeClass(NO_TRANS2);
                    }
                    initialProperties = getCurrentProperties();
                    initialStyle = instance.getAttr(STYLE);

                    currentInlineTransition = instance.getData('_bkpTransition');
                    if (currentInlineTransition===undefined) {
                        currentInlineTransition = instance.getInlineStyle(TRANSITION) || null;
                        // `null` can be set as node-data, `undefined` connot
                        instance.setData('_bkpTransition', currentInlineTransition);
                    }

                    // we could use the `to` object and pass into `setInlineTransitions` directly,
                    // however, in case `duration` is not specified, we will define them to 1 sec.

                    // CAUTIOUS: the sum of `duration`+`delay` determines when the transition will be ready.
                    // This leads into separate transitions, we must prevent the promise to fulfill on the
                    // first tranition to be ready.
                    // Thus: we need to split every (`duration`+`delay`) group and give them each a separate setInlineStyle()-promise!
                    transitions.forEach(function(item) {
                        item.duration || (item.duration=1);
                        item.delay || (item.delay=0);
                    });

                    instance.setInlineTransitions(transitions);
                    transpromise = instance.setInlineStyles(to, true);
                    transpromise.catch(
                        function(err) {
                            transitionError = err;
                            return true; // fulfill the chain
                        }
                    ).finally(
                        function() {
                            // to prevent `transitionend` events biting each other when chaining `transition`,
                            // and reset the inline transition in time,
                            // we need to resolve the Promise after the eventstack:
                            async(function() {
                                if (!manipulated && (instance.getData('_readyOnRun')===transitionRun)) {
                                    cleanup();
                                    // because cleanup does an async action (setInlineStyles), we will append the eventstack:
                                    async(function() {
                                        if (transitionError) {
                                            reject(transitionError);
                                        }
                                        else {
                                            time2 || (time2=Date.now());
                                            resolve(time2-time1);
                                        }
                                    });
                                }
                            });
                        }
                    );
                });
            });

            promise.cancel = function() {
                return endIntermediate('cancelled');
            };

            promise.freeze = function() {
                return endIntermediate('frozen');
            };

            promise.finish = function() {
                return endIntermediate('finished');
            };

            return promise;
        };

       /**
        * Toggles the className of the Element.
        *
        * @method toggleClass
        * @param className {String|Array} className that should be toggled, may be an array of classNames
        * @param forceState {Boolean} to force toggling into this specific state
        * @param [returnPromise] {Boolean} whether to return a Promise instead of `this`, which might be useful in case of
        *        transition-properties. The promise will fullfil when the transition is ready, or immediately when no transitioned.
        * @param [transitionFix] set this to `true` if you experience transition-problems due to wrong calculated css (mostly because of the `auto` value)
        *        Setting this parameter, will calculate the true css of the transitioned properties and set this temporarely inline, to fix the issue.
        *        Don't use it when not needed, it has a slightly performancehit.
        *        No need to set when `returnPromise` is set --> returnPromise always handles the transitionFix.
        * @param [silent=false] {Boolean} prevent node-mutation events by the Event-module to emit
        * @return {Promise|this} In case `returnPromise` is set, a Promise returns with the next handles:
        *        <ul>
        *            <li>cancel() {Promise}</li>
        *            <li>freeze() {Promise}</li>
        *            <li>unfreeze()</li>
        *            <li>finish() {Promise}</li>
        *        </ul>
        *        These handles resolve with the `elapsed-time` as first argument of the callbackFn
        * @since 0.0.1
        */
        ElementPrototype.toggleClass = function(className, forceState, returnPromise, transitionFix, silent) {
            var instance = this,
                prevSuppress = DOCUMENT._suppressMutationEvents || false,
                transPromise, returnValue;
            silent && DOCUMENT.suppressMutationEvents && DOCUMENT.suppressMutationEvents(true);
            transPromise = (returnPromise || transitionFix) && getClassTransPromise(instance, TOGGLE, className, forceState);
            returnValue = returnPromise ? transPromise : instance;
            transPromise || instance.getClassList().toggle(className, forceState);
            if (silent && DOCUMENT.suppressMutationEvents) {
                if (returnValue===instance) {
                    DOCUMENT.suppressMutationEvents(prevSuppress);
                }
                else {
                    returnValue.finally(function() {
                        DOCUMENT.suppressMutationEvents(prevSuppress);
                    });
                }
            }
            return returnValue;
        };

        Object.defineProperties(ElementPrototype, {

           /**
            * Gets or set the height of the element in pixels. Included are padding and border, not any margins.
            * By setting the argument `overflow` you get the total height, included the invisible overflow.
            *
            * The getter is calculating through `offsetHeight`, the setter will set inline css-style for the height.
            *
            * Values are numbers without unity.
            *
            * @property height
            * @type {Number}
            * @since 0.0.1
            */
            height: {
                get: function() {
                    return this.offsetHeight;
                },
                set: function(val) {
                    var instance = this,
                        dif;
                    instance.setClass(INVISIBLE);
                    instance.setInlineStyle(HEIGHT, val + PX);
                    dif = (instance.offsetHeight-val);
                    (dif!==0) && (instance.setInlineStyle(HEIGHT, (val - dif) + PX));
                    instance.removeClass(INVISIBLE);
                }
            },

           /**
            * Gets the x-position (in the DOCUMENT) of the element in pixels.
            * DOCUMENT-related: regardless of the window's scroll-position.
            *
            * @property left
            * @since 0.0.1
            */
            left: {
                get: function() {
                    return Math.round(this.getBoundingClientRect().left + window.getScrollLeft());
                },
                set: function(pixelsLeft) {
                    return this.setXY(pixelsLeft, null, null, true);
                }
            },

           /**
            * Gets the y-position (in the DOCUMENT) of the element in pixels.
            * DOCUMENT-related: regardless of the window's scroll-position.
            *
            * @property top
            * @since 0.0.1
            */
            top: {
                get: function() {
                    return Math.round(this.getBoundingClientRect().top + window.getScrollTop());
                },
                set: function(pixelsTop) {
                    return this.setXY(null, pixelsTop, null, true);
                }
            },

           /**
            * Gets or set the width of the element in pixels. Included are padding and border, not any margins.
            * By setting the argument `overflow` you get the total width, included the invisible overflow.
            *
            * The getter is calculating through `offsetHeight`, the setter will set inline css-style for the width.
            *
            * Values are numbers without unity.
            *
            * @property width
            * @type {Number}
            * @since 0.0.1
            */
            width: {
                get: function() {
                    return this.offsetWidth;
                },
                set: function(val) {
                    var instance = this,
                        dif;
                    instance.setClass(INVISIBLE);
                    instance.setInlineStyle(WIDTH, val + PX);
                    dif = (instance.offsetWidth-val);
                    (dif!==0) && (instance.setInlineStyle(WIDTH, (val - dif) + PX));
                    instance.removeClass(INVISIBLE);
                }
            }

        });

    }(window.Element.prototype));

    setupObserver = function() {
        // configuration of the observer:
        var observerConfig = {
                attributes: true,
                subtree: true,
                characterData: true,
                childList : true
            };
        (new window.MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {

                var node = mutation.target,
                    vnode = node.vnode,
                    type = mutation.type,
                    attribute = mutation.attributeName,
                    addedChildNodes = mutation.addedNodes,
                    removedChildNodes = mutation.removedNodes,
                    i, len, childDomNode, childVNode, index, vchildnode;
                if (vnode && !vnode._nosync) {
                    if (type==='attributes') {
                        vnode.reloadAttr(attribute);
                    }
                    else if (type==='characterData') {
                        vnode.text = node.nodeValue;
                    }
                    else {
                        // remove the childNodes that are no longer there:
                        len = removedChildNodes.length;
                        for (i=len-1; i>=0; i--) {
                            childVNode = removedChildNodes[i].vnode;
                            childVNode && childVNode._destroy();
                        }
                       // add the new childNodes:
                        len = addedChildNodes.length;
                        for (i=0; i<len; i++) {
                            childDomNode = addedChildNodes[i];
                            // find its index in the true DOM:
                            index = node.childNodes.indexOf(childDomNode);
                            // create the vnode:
                            vchildnode = domNodeToVNode(childDomNode);
//======================================================================================================
// TODO: remove this block of code: we shouldn;t be needing it
// that is: when the alert never rises (which I expect it doesn't)


// prevent double definitions (for whatever reason):
// check if there is a vChild with the same domNode and remove it:
var vChildNodes = vnode.vChildNodes;
var len2 = vChildNodes ? vChildNodes.length : 0;
var j;
for (j=0; j<len2; j++) {
    var checkChildVNode = vChildNodes[j];
    if (checkChildVNode.domNode===node) {
        checkChildVNode._destroy();
        alert('double deleted');
        break;
    }
}
// END OF removable block
//======================================================================================================
                            // add the vnode:
                            vchildnode._moveToParent(vnode, index);
                        }
                    }
                }
            });
        })).observe(DOCUMENT, observerConfig);
    };

    setupObserver();

};

//--- definition API of unmodified `Element`-methods ------

/**
 * Returns the specified attribute of the specified element, as an Attr node.
 *
 * @method getAttributeNode
 * @return {attributeNode}
 */

/**
 * Returns a text rectangle object that encloses a group of text rectangles. The returned value is
 * a TextRectangle object which is the union of the rectangles returned by getClientRects() for the element,
 * i.e., the CSS border-boxes associated with the element.
 *
 * The returned value is a TextRectangle object, which contains read-only left, top, right and bottom properties
 * describing the border-box in pixels. top and left are relative to the top-left of the viewport.
 *
 * @method getBoundingClientRect
 * @return {attributeNode} Therectangle object that encloses a group of text rectangles.
 */

/**
 * Returns a collection of rectangles that indicate the bounding rectangles for each box in a client.
 *
 * The returned value is a collection of ClientRect objects, one for each CSS border box associated with the element.
 * Each ClientRect object contains read-only left, top, right and bottom properties describing the border box, in pixels,
 * with the top-left relative to the top-left of the viewport. For tables with captions,
 * the caption is included even though it's outside the border box of the table.
 *
 * @method getClientRects
 * @return {Collection}
 */

/**
 * Returns a new NodeIterator object with this Element as root.
 *
 * The NodeIterator is a snapshot of the dom at the time this method was called. It is not updated when changes of the dom are made afterwards.
 *
 * @method createNodeIterator
 * @param [whatToShow] {Number} Filter specification constants from the NodeFilter DOM interface, indicating which nodes to iterate over.
 * You can use or sum one of the next properties:
 * <ul>
 *   <li>window.NodeFilter.SHOW_ELEMENT</li>
 *   <li>window.NodeFilter.SHOW_COMMENT</li>
 *   <li>window.NodeFilter.SHOW_TEXT</li>
 * </ul>
 * @param [filter] {NodeFilter|function} An object implementing the NodeFilter interface or a function. See https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
 * @return {NodeIterator}
 * @since 0.0.1
*/

/**
 * Returns an HTMLCollection of all Elements within this Element, that match their classes with the supplied `classNames` argument.
 * To match multiple different classes, separate them with a `comma`.
 *
 * getElementsByClassName is life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByClassName
 * @param classNames {String} the classes to search for
 * @return {HTMLCollection} life Array with Elements
 */

/**
 * Returns an HTMLCollection of all Elements within this Element, that match their `name`-attribute with the supplied `name` argument.
 *
 * getElementsByName is life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByName
 * @param name {String} the property of name-attribute to search for
 * @return {HTMLCollection} life Array with Elements
 */


/**
 * Returns an HTMLCollection of all Elements within this Element, that match their `name`-attribute with the supplied `name` argument.
 *
 * getElementsByTagName is life presentation of the dom. The returned HTMLCollection gets updated when the dom changes.
 *
 * NOTE: it is highly recomended to use `document.getAll` because that method takes advantage of the vdom.
 *
 * @method getElementsByTagName
 * @param tagNames {String} the tags to search for
 * @return {HTMLCollection} life Array with Elements
 */

/**
* Parses the specified text as HTML and inserts the resulting nodes into the DOM tree at a specified position.
*
* @method insertAdjacentHTML
* @param position {String}
* <ul>
*     <li>'beforebegin' Before the element itself</li>
*     <li>'afterbegin' Just inside the element, before its first child</li>
*     <li>'beforeend' Just inside the element, after its last child</li>
*     <li>'afterend' After the element itself</li>
* <ul>
* @param element {Element}
*/

/**
* Removes the attribute specified by an attributeNode from the Element.
*
* @method removeAttributeNode
* @param attributeNode {attributeNode}
* @since 0.0.1
*/

/**
 * Scrolls the element into view.
 *
 * @method scrollIntoView
 */

/**
 * Sets the attribute on the Element specified by `attributeNode`
 *
 * @method setAttributeNode
 * @param attributeNode {attributeNode}
*/

//------ events --------

/**
 * Fired when a static `script` element  finishes executing its script. Does not fire if the element is added dynamically, eg with appendChild().
 *
 * @event afterscriptexecute
 */


/**
 * Fired when the code in a `script` element declared in an HTML document is about to start executing. Does not fire if the element is added dynamically, eg with appendChild().
 *
 * @event beforescriptexecute
 */

//------- properties --------

/**
 * sets or returns an accesskey for an element. An accesskey specifies a shortcut key to activate/focus an element.
 * Note: The way of accessing the shortcut key is varying in different browsers: http://www.w3schools.com/jsref/prop_html_accesskey.asp
 *
 * @property accessKey
 * @type String
 */


/**
 * Returns a live collection of all attribute nodes registered to the specified node.
 * It is a NamedNodeMap, not an Array, so it has no Array methods and the Attr nodes' indexes may differ among browsers.
 * To be more specific, attributes is a key/value pair of strings that represents any information regarding that attribute.
 *
 * Prefer to use `getAttrs()` which is much quicker, but doesn't return a life-list.
 *
 * @property attributes
 * @type NamedNodeMap
 */

/**
 * The absolute base URL of a node.
 *
 * @property baseURI
 * @type String
 * @readOnly
 */

/**
 * Returns the number of children (child Elements)
 *
 * @property childElementCount
 * @type Number
 * @readOnly
 */

/**
 * Returns a live collection of childNodes of the given element, either Element, TextNode or CommentNode
 *
 * @property childNodes
 * @type NodeList
 * @readOnly
 */

/**
 * Returns a live collection of child Element's of the given element.
 *
 * @property children
 * @type NodeList
 * @readOnly
 */

/**
 * Gets and sets the value of the class attribute of the specified element.
 *
 * @property className
 * @type String
 */

/**
 * Returns the inner height of an element in pixels, including padding but not the horizontal scrollbar height, border, or margin.
 *
 * @property clientHeight
 * @type Number
 * @readOnly
 */

/**
 * The width of the left border of an element in pixels. It includes the width of the vertical scrollbar if the text direction of the element is right–to–left
 * and if there is an overflow causing a left vertical scrollbar to be rendered. clientLeft does not include the left margin or the left padding.
 *
 * @property clientLeft
 * @type Number
 * @readOnly
 */

/**
 * The width of the top border of an element in pixels. It does not include the top margin or padding.
 *
 * @property clientTop
 * @type Number
 * @readOnly
 */

/**
 * Returns the inner width of an element in pixels, including padding but not the vertical scrollbar height, border, or margin.
 *
 * @property clientWidth
 * @type Number
 * @readOnly
 */

/**
 * Reference to the first childNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
 *
 * Better work with Elements only:  use `firstElementChild` instead, which returns the first Element-child.
 *
 * @property firstChild
 * @type Node
 * @readOnly
 * @deprecated
 */

/**
 * Reference to the first Element-child, which is an Element (nodeType===1).
 *
 * @property firstElementChild
 * @type Element
 * @readOnly
 */

/**
 * Gets or sets the element's attribute `href`. Only applies for the `a`-element.
 *
 * @property href
 * @type String
 */

/**
 * Gets or sets the element's identifier (attribute id).
 *
 * @property id
 * @type String
 */

/**
 * Reference to the last childNode, where the related dom-node is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
 *
 * Better use `lastElementChild` instead, which returns the last Element-child.
 *
 * @property lastChild
 * @type Node
 * @readOnly
 * @deprecated
 */

/**
 * Reference to the last Element-child, where the related dom-node is an Element (nodeType===1).
 *
 * @property lastElementChild
 * @type Element
 * @readOnly
 */

/**
 * Gets or sets the `name` property of a Element; it only applies to the following elements:
 * `a`, `applet`, `button`, `form`, `frame`, `iframe`, `img`, `input`, `map`, `meta`, `object`, `param`, `select`, and `textarea`.
 *
 * @property name
 * @type String
 */

/**
 * Returns the Element immediately following the specified one in its parent's childNodes list, or null if the specified node is the last node in that list.
 * Is an Element (nodeType===1).
 *
 * @property nextElementSibling
 * @type Element
 * @readOnly
 */

/**
 * Returns the Element immediately following the specified one in its parent's childNodes list, or null if the specified node is the last node in that list.
 * Is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
 *
 * Do not use this, but use `lastElementChild` instead, which returns the next Element-child.
 *
 * @property nextElementSibling
 * @type Node
 * @deprecated
 * @readOnly
 */

/**
 * Elements tag-name
 *
 * @property nodeName
 * @type String
 * @readOnly
 */

/**
 * Elements nodetype: 1==Element, 3==TextNode, 8===CommentNode
 *
 * @property nodeType
 * @type String
 * @readOnly
 */

/**
 * Value/text for non-Element Nodes
 *
 * @property nodeValue
 * @type String
 * @since 0.0.1
 */

/**
 * The exact width of the Element on the screen.
 * Included borders and padding (no margin).
 *
 * Returns a number without unity.
 *
 * Better use `width` --> it's an alias, but has a setter as well
 *
 * @property offsetWidth
 * @type Number
 * @readOnly
 * @since 0.0.1
 */

/**
 * The exact height of the Element on the screen.
 * Included borders and padding (no margin).
 *
 * Returns a number without unity.
 *
 * Better use `height` --> it's an alias, but has a setter as well
 *
 * @property offsetHeight
 * @type Number
 * @since 0.0.1
 */

/**
 * Returns the Element's parent Element.
 *
 * Same as `parentNode`
 *
 * @property parentElement
 * @type Element
 */

/**
 * Returns the Element's parent Element.
 *
 * Same as `parentElement`
 *
 * @property parentNode
 * @type Element
 */

/**
 * Returns the Element immediately preceding the specified one in its parent's childNodes list, or null if the specified node is the last node in that list.
 * Is an Element (nodeType===1).
 *
 * @property previousElementSibling
 * @type Element
 * @readOnly
 */

/**
 * Returns the Element immediately preceding the specified one in its parent's childNodes list, or null if the specified node is the last node in that list.
 * Is either an Element, TextNode or CommentNode (nodeType===1, 3 or 8).
 *
 * Do not use this, but use `previousElementSibling` instead, which returns the previous Element-child.
 *
 * @property previousSibling
 * @deprecated
 * @type Node
 * @readOnly
 */


/**
 * A measurement of the height of an element's content, including content not visible on the screen due to overflow.
 * The scrollHeight value is equal to the minimum clientHeight the element would require in order to fit all the content in the viewpoint
 * without using a vertical scrollbar. It includes the element padding but not its margin.
 *
 * Returns a number without unity.
 *
 * @property scrollHeight
 * @type Number
 * @readOnly
 */

/**
 * Gets or sets the number of pixels that an element's content is scrolled to the left.
 *
 * @property scrollLeft
 * @type Number
 */

/**
 * Gets or sets the number of pixels that the content of an element is scrolled upward. An element's scrollTop is a measurement
 * of the distance of an element's top to its topmost visible content. When an element content does not generate a vertical scrollbar,
 * then its scrollTop value defaults to 0.
 *
 * @property scrollTop
 * @type Number
 */

/**
 * Returns either the width in pixels of the content of an element or the width of the element itself, whichever is greater.
 * If the element is wider than its content area (for example, if there are scroll bars for scrolling through the content),
 * the scrollWidth is larger than the clientWidth.
 *
 * Returns a number without unity.
 *
 * @property scrollWidth
 * @type Number
 * @readOnly
 */

/**
 * Gets or sets the element's attribute `type`. Only applies for the `script`, `img` and `style`-elements.
 *
 * @property src
 * @type String
 */

/**
 * Gets or sets the element's attribute `style`.
 *
 * @property style
 * @type String
 */

/**
 * Gets or sets the element's attribute `type`. Only applies for the `input`-element.
 *
 * @property type
 * @type String
 */

/**
* Gets or sets the value of an input or select Element.
*
* Note it is highly preferable to use getValue() and setValue().
*
* @property value
* @type String
* @since 0.0.1
*/