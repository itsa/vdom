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
 * @submodule attribute-extractor
 * @since 0.0.1
*/

require('js-ext/lib/string.js');
require('js-ext/lib/object.js');
require('polyfill');

module.exports = function (window) {

    window._ITSAmodules || window.protectedProp('_ITSAmodules', {});

    if (window._ITSAmodules.AttributeExtractor) {
        return window._ITSAmodules.AttributeExtractor; // AttributeExtractor was already created
    }

    var SUPPORT_INLINE_PSEUDO_STYLES = false, // current browsers don't support this. When tey do, set this value `true`
        END_OF_VALUE = {
            ';': true,
            '}': true
        },
        VENDOR_CSS = require('polyfill/extra/vendorCSS.js')(window),
        generateVendorCSSProp = VENDOR_CSS.generator,
        VENDOR_CSS_PROPERTIES = VENDOR_CSS.cssProps,
        VENDOR_TRANSITION_PROPERTY = require('polyfill/extra/transition.js')(window), // DO NOT use TRANSITION-variable here --> browserify cannot deal this
        _serializeTransition, _parseTransition, extractor;

    window.document._supportInlinePseudoStyles = SUPPORT_INLINE_PSEUDO_STYLES;

    _serializeTransition = function(transitionValue) {
        // transitionValue should an Object !!
        var serialized = '',
            timingFunction, delay;
        transitionValue.each(function(value, key) {
            timingFunction = value.timingFunction;
            delay = value.delay;
            serialized += ', ' + key;
            if (key!=='none') {
                serialized += ' ' + value.duration+'s';
                timingFunction && (serialized+=' ' + timingFunction);
                delay && (serialized+=' ' + delay+'s');
            }
        });
        return (serialized[0]===',') ? serialized.substr(2) : serialized;
    };

    _parseTransition = function(transitionValueSerialised) {
        var parsed = {},
            i, len, transitionItem, item, items, value, properties, item0, item1, item2, item3;
        if (transitionValueSerialised) {
            properties = transitionValueSerialised.split(',');
            len = properties.length;
            for (i=0; i<len; i++) {
                items = properties[i].trim();
                (items.indexOf('  ')!==-1) && items.replace(/'  '/g, ' ');
                item = items.split(' ');
                item0 = item[0];
                item1 = item[1];
                item2 = item[2];
                item3 = item[3];

                if (item0.parsable()) {
                    // no key, but starting with a duration
                    item3 = item2;
                    item2 = item1;
                    item1 = item0;
                    item0 = 'all';
                }

                transitionItem = {};
                (item0.toLowerCase()==='none') && (item0='none');
                if (item0!=='none') {
                    transitionItem.duration = parseFloat(item1) || 0;
/*jshint boss:true */
                    if (value=item2) {
/*jshint boss:false */
                        // check if it is a Function, or a delayvalue
                        if (value.parsable()) {
                            transitionItem.delay = parseFloat(value);
                        }
                        else {
                            transitionItem.timingFunction = value;
                            (value=item3) && (transitionItem.delay = parseFloat(value));
                        }
                    }
                }
                // allways transform the css-property into a vendor-safe property:
                VENDOR_CSS_PROPERTIES[item0] || (item0=generateVendorCSSProp(item0));
                parsed[item0] = transitionItem;
            }
        }
        return parsed;
    };

    extractor = window._ITSAmodules.AttributeExtractor = {
        extractClass: function(classes) {
            var attrClass = '',
                classNames = {},
                oneclass, len, i, character;
            if (classes) {
                oneclass = '';
                len = classes.length;
                for (i=0; i<len; i++) {
                    character = classes[i];
                    if (character===' ') {
                        if (oneclass!=='') {
                            classNames[oneclass] = true;
                            attrClass += ' '+oneclass;
                            oneclass = '';
                        }
                    }
                    else {
                        oneclass += character;
                    }
                }
                if (oneclass!=='') {
                    classNames[oneclass] = true;
                    attrClass += ' '+oneclass;
                }
            }
            return {
                attrClass: (attrClass==='') ? undefined : attrClass.substr(1),
                classNames: classNames
            };
        },

        extractStyle: function(styles) {
        /*  be aware you can encounter inline style like this:

            style="{color: blue; background: white}
            :visited {color: green}
            :hover {background: yellow}
            :visited:hover {color: purple}

            OR

            style="color: blue; background: white"


            Also, you might encounter inline transform, which should be separated itself:

            style="{color: blue; background: white; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px);}
            :visited {color: green}
            :hover {background: yellow; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px);}
            :visited:hover {color: purple}

            OR

            style="color: blue; background: white; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px);"

        */
            var newStyles = {},
                instance = this,
                i, onlyElement, len, character, groupKey, key, value, insideValue, insideKey, hasValue, group;
            if (styles) {
                i = -1;
                len = styles.length;

                // first eliminate leading spaces
    /*jshint noempty:true */
                while ((++i<len) && (character=styles[i]) && (character===' ')) {}
    /*jshint noempty:false */

                // preview next character
                character = styles[i];
                onlyElement = (character && (character!=='{') && (character!==':'));
                if (onlyElement) {
                    newStyles.element = {};
                    group = newStyles.element;
                    groupKey = 'element';
                    insideKey = true;
                }
                else {
                    groupKey = '';
                }

                // now process
                key = '';
                insideValue = false;
                i--;
                while ((++i<len) && (character=styles[i])) {
                    if (insideValue) {
                        hasValue = true;
                        if (END_OF_VALUE[character]) {
                            value = value.trim();
                            // in case `key` equals a variant of `transform`, but non-compatible with the current browser -->
                            // redefine it into a browser-compatible version:
                            VENDOR_CSS_PROPERTIES[key] || (key=generateVendorCSSProp(key));
                            // store the property:
                            if ((SUPPORT_INLINE_PSEUDO_STYLES || (groupKey==='element')) && (value.length>0)) {
                                group[key] = ((key===VENDOR_TRANSITION_PROPERTY) ? _parseTransition(value) : value);
                            }
                            key = '';
                            insideValue = false;
                            insideKey = (character===';');
                            insideKey || (groupKey='');
                        }
                        else {
                            value += character;
                        }
                    }
                    else if (insideKey) {
                        if (character===':'){
                            insideKey = false;
                            insideValue = true;
                            key = key.trim();
                            value = '';
                        }
                        else if (character==='}') {
                            insideKey = false;
                            groupKey = '';
                        }
                        else {
                            key += character;
                        }
                    }
                    else {
                        if (character==='{') {
                            groupKey = groupKey.trim();
                            (groupKey==='') && (groupKey='element');
                            group = newStyles[groupKey] = {};
                            insideKey = true;
                            key = '';
                        }
                        else {
                            groupKey += character;
                        }
                    }
                }
                if (insideValue) {
                    value = value.trim();
                    // in case `key` equals a variant of `transition`, but non-compatible with the current browser -->
                    // redefine it into a browser-compatible version:
                    VENDOR_CSS_PROPERTIES[key] || (key=generateVendorCSSProp(key));
                    // store the property:
                    if ((SUPPORT_INLINE_PSEUDO_STYLES || (groupKey==='element')) && (value.length>0)) {
                        group[key] = ((key===VENDOR_TRANSITION_PROPERTY) ? _parseTransition(value) : value);
                    }
                }
            }
            if (!SUPPORT_INLINE_PSEUDO_STYLES) {
                delete newStyles[':before'];
                delete newStyles[':after'];
            }
            return {
                attrStyle: hasValue && instance.serializeStyles(newStyles),
                styles: newStyles
            };
        },

        toTransitionObject: function(value) {
            return _parseTransition(value);
        },

        serializeTransition: function(value) {
            return _serializeTransition(value);
        },

        serializeStyles: function(styles) {
            var serialized = '',
                onlyElementStyle = ((styles.size()===1) && styles.element);
            if (onlyElementStyle || !SUPPORT_INLINE_PSEUDO_STYLES) {
                styles.element && styles.element.each(function(value, key) {
                    serialized += ' '+ key + ': ' + ((key===VENDOR_TRANSITION_PROPERTY) ? _serializeTransition(value) : value) + ';';
                });
            }
            else {
                styles.each(function(groupValue, groupKey) {
                    (groupKey==='element') || (serialized += ' '+groupKey+' ');
                    serialized += '{';
                    groupValue.each(function(value, key) {
                        serialized += key + ': ' + ((key===VENDOR_TRANSITION_PROPERTY) ? _serializeTransition(value) : value) + '; ';
                    });
                    serialized += '}';
                });
                (serialized==='{}') && (serialized='');
            }
            return (serialized[0]===' ') ? serialized.substr(1) : serialized;
        }
    };

    return extractor;

};