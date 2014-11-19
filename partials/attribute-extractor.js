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

var END_OF_VALUE = {
        ';': true,
        '}': true
    };

module.exports = {

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
    */
        var newStyles = {},
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
                    if (END_OF_VALUE[character]) {
                        group[key] = value.trim();
                        key = '';
                        insideValue = false;
                        insideKey = (character===';');
                        insideKey || (groupKey='');
                        hasValue = true;
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
            insideValue && (group[key]=value.trim());
        }
        return {
            attrStyle: hasValue && this.serializeStyles(newStyles),
            styles: newStyles
        };
    },

    serializeStyles: function(styles) {
        var serialized = '',
            onlyElementStyle = ((styles.size()===1) && styles.element);
        if (onlyElementStyle) {
            styles.element.each(function(value, key) {
                serialized += ' '+ key + ': ' + value + ';';
            });
        }
        else {
            styles.each(function(groupValue, groupKey) {
                (groupKey==='element') || (serialized += ' '+groupKey+' ');
                serialized += '{';
                groupValue.each(function(value, key) {
                    serialized += key + ': ' + value + '; ';
                });
                serialized += '}';
            });
        }
        return (serialized[0]===' ') ? serialized.substr(1) : serialized;
    }

};