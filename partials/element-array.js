"use strict";

/**
 * Extends Array into an array with special utility-methods that can be applied upon its members.
 * The membres should be vElement's
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule element-array
 * @class ElementArray
 * @since 0.0.1
*/

require('polyfill/polyfill-base.js');
require('js-ext/lib/object.js');

module.exports = function (window) {

    var forEach = function(list, method, args) {
            var len = list.length,
                i, element;
            for (i=0; i<len; i++) {
                element = list[i];
                element[method].apply(element, args);
            }
            return list;
        },
        NodeListPrototype = window.NodeList.prototype,
        HTMLCollectionPrototype = window.HTMLCollection.prototype,
        arrayMethods = Object.getOwnPropertyNames(Array.prototype),
        ElementArrayMethods = {
           /**
            * For all vElements of the ElementArray:
            * Appends a HtmlElement or text at the end of HtmlElement's innerHTML.
            *
            * @method append
            * @param content {HtmlElement|HtmlElementList|String} content to append
            * @param escape {Boolean} whether to insert `escaped` content, leading it into only text inserted
            * @chainable
            * @since 0.0.1
            */
            append: function(/* content, escape */) {
                return forEach(this, 'append', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Sets the inline-style of the HtmlElement exactly to the specified `value`, overruling previous values.
            * Making the HtmlElement's inline-style look like: style="value".
            *
            * This is meant for a quick one-time setup. For individually inline style-properties to be set, you can use `setInlineStyle()`.
            *
            * @method defineInlineStyle
            * @param value {String} the style string to be set
            * @chainable
            * @since 0.0.1
            */
            defineInlineStyle: function(/* value */) {
                return forEach(this, 'defineInlineStyle', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Prepends a HtmlElement or text at the start of HtmlElement's innerHTML.
            *
            * @method prepend
            * @param content {HtmlElement|HtmlElementList|String} content to prepend
            * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
            * @chainable
            * @since 0.0.1
            */
            prepend: function(/* content, escape */) {
                return forEach(this, 'prepend', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Removes the attribute from the HtmlElement.
            *
            * Alias for removeAttribute().
            *
            * @method removeAttr
            * @param attributeName {String}
            * @return {Boolean} Whether the HtmlElement has the attribute set.
            * @since 0.0.1
            */
            removeAttr: function(/* attributeName */) {
                return forEach(this, 'removeAttr', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Removes a className from the HtmlElement.
            *
            * @method removeClass
            * @param className {String} the className that should be removed.
            * @chainable
            * @since 0.0.1
            */
            removeClass: function(/* className */) {
                return forEach(this, 'removeClass', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Removes data specified by `key`. When no arguments are passed, all node-data (key-value pairs) will be removed.
            *
            * @method removeData
            * @param key {string} name of the key
            * @chainable
            * @since 0.0.1
            */
            removeData: function(/* key */) {
                return forEach(this, 'removeData', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Removes a css-property (inline) out of the HtmlElement. Use camelCase.
            *
            * @method removeInlineStyle
            * @param cssAttribute {String} the css-property to be removed
            * @chainable
            * @since 0.0.1
            */
            removeInlineStyle: function(/* cssAttribute */) {
                return forEach(this, 'removeInlineStyle', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Removes the HtmlElement from the DOM.
            *
            * @method removeNode
            * @since 0.0.1
            */
            removeNode: function() {
                var instance = this;
                forEach(this, 'remove');
                instance.length = 0;
                return instance;
            },

           /**
            * For all vElements of the ElementArray:
            * Replaces the className of the HtmlElement with a new className.
            * If the previous className is not available, the new className is set nevertheless.
            *
            * @method replaceClass
            * @param prevClassName {String} the className to be replaced
            * @param newClassName {String} the className to be set
            * @param [force ] {Boolean} whether the new className should be set, even is the previous className isn't there
            * @chainable
            * @since 0.0.1
            */
            replaceClass: function(/* prevClassName, newClassName, force */) {
                return forEach(this, 'replaceClass', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Replaces the HtmlElement with a new HtmlElement.
            *
            * @method replaceNode
            * @param newHtmlElement {HtmlElement|String} the new HtmlElement
            * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
            * @since 0.0.1
            */
            replaceNode: function(newHtmlElement, escape) {
                var instance = this,
                    len = instance.length,
                    i;
                for (i=len-1; i>=0; i--) {
                    instance[i] = instance[i].replace(newHtmlElement, escape);
                    // instance[i].replace(newHtmlElement, escape);
                }
                return instance;
            },

           /**
            * For all vElements of the ElementArray:
            * Sets the attribute on the HtmlElement with the specified value.
            *
            * Alias for setAttribute().
            *
            * @method setAttr
            * @param attributeName {String}
            * @param value {Any} the value that belongs to `key`
            * @chainable
            * @since 0.0.1
           */
            setAttr: function(/* attributeName, value */) {
                return forEach(this, 'setAttr', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Adds a class to the HtmlElement. If the class already exists it won't be duplicated.
            *
            * @method setClass
            * @param className {String} className to be added
            * @chainable
            * @since 0.0.1
            */
            setClass: function(/* className */) {
                return forEach(this, 'setClass', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Stores arbitary `data` at the HtmlElement. This has nothing to do with node-attributes whatsoever,
            * it is just a way to bind any data to the specific Element so it can be retrieved later on with `getData()`.
            *
            * @method setData
            * @param key {string} name of the key
            * @param value {Any} the value that belongs to `key`
            * @chainable
            * @since 0.0.1
           */
            setData: function(/* key, value */) {
                return forEach(this, 'setData', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Sets the content of the HtmlElement (innerHTML). Careful: only set content like this if you controll the data and
            * are sure what is going inside. Otherwise XSS might occur. If you let the user insert, or insert right from a db,
            * you might be better of using setContent().
            *
            * @method setHTML
            * @param content {HtmlElement|HtmlElementList|String} content to append
            * @chainable
            * @since 0.0.1
            */
            setHTML: function(/* content */) {
                return forEach(this, 'setHTML', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Sets a css-property (inline) out of the HtmlElement. Use camelCase.
            *
            * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
            *
            * @method setStyle
            * @param cssAttribute {String} the css-property to be set
            * @param value {String} the css-value
            * @chainable
            * @since 0.0.1
            */
            setInlineStyle: function(/* cssAttribute, value */) {
                return forEach(this, 'setInlineStyle', arguments);
            },

            /**
            * For all vElements of the ElementArray:
             * Gets or sets the outerHTML of both the Element as well as the representing dom-node.
             * Goes through the vdom, so it's superfast.
             *
             * Use this property instead of `outerHTML`
             *
             * Syncs with the DOM.
             *
             * @method setOuterHTML
             * @param val {String} the new value to be set
             * @chainable
             * @since 0.0.1
             */
            setOuterHTML: function(/* content */) {
                return forEach(this, 'setOuterHTML', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Sets the content of the HtmlElement. This is a safe way to set the content, because HTML is not parsed.
            * If you do need to set HTML inside the node, use setHTML().
            *
            * @method setText
            * @param content {HtmlElement|HtmlElementList|String} content to append. In case of HTML, it will be escaped.
            * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
            * @chainable
            * @since 0.0.1
            */
            setText: function(/* content */) {
                return forEach(this, 'setText', arguments);
            },

           /**
            * For all vElements of the ElementArray:
            * Toggles the className of the Element.
            *
            * @method toggleClass
            * @param className {String} the className that should be toggled
            * @chainable
            * @since 0.0.1
            */
            toggleClass: function(/* className */) {
                return forEach(this, 'toggleClass', arguments);
            },



       /**
        * For all vElements of the ElementArray:
        * Checks whether the plugin is plugged in at ALL the HtmlElements of the NodeList/HTMLCollection.
        * Checks whether all its attributes are set.
        *
        * @method isPlugged
        * @param pluginClass {NodePlugin} The plugin that should be plugged. Needs to be the Class, not an instance!
        * @return {Boolean} whether the plugin is plugged in
        * @since 0.0.1
        */
        isPlugged: function(NodePluginClass) {
            return this.every(function(element) {
                return element.isPlugged(NodePluginClass);
            });
        },

       /**
        * For all vElements of the ElementArray:
        * Plugs in the plugin on the HtmlElement, and gives is special behaviour by setting the appropriate attributes.
        *
        * @method plug
        * @param pluginClass {NodePlugin} The plugin that should be plugged. Needs to be the Class, not an instance!
        * @param options {Object} any options that should be passed through when the class is instantiated.
        * @chainable
        * @since 0.0.1
        */
        plug: function(/* NodePluginClass, options */) {
            return forEach(this, 'plug', arguments);
        },

       /**
        * For all vElements of the ElementArray:
        * Unplugs a NodePlugin from the HtmlElement.
        *
        * @method unplug
        * @param pluginClass {NodePlugin} The plugin that should be unplugged. Needs to be the Class, not an instance!
        * @chainable
        * @since 0.0.1
        */
        unplug: function(/* NodePluginClass */) {
            return forEach(this, 'unplug', arguments);
        }




        };


    // adding Array.prototype methods to NodeList.prototype
    // Note: this might be buggy in IE8 and below: https://developer.mozilla.org/en-US/docs/Web/API/NodeList#Workarounds
    arrayMethods.forEach(function(methodName) {
        try {
            NodeListPrototype[methodName] || (NodeListPrototype[methodName]=Array.prototype[methodName]);
            HTMLCollectionPrototype[methodName] || (HTMLCollectionPrototype[methodName]=Array.prototype[methodName]);
        }
        catch(err) {
            // some properties have only getters and cannot (and don't need) to be set
        }
    });

    NodeListPrototype.merge(ElementArrayMethods);
    HTMLCollectionPrototype.merge(ElementArrayMethods);

    return {
        // unfortunatly, Object.create(Array.prototype) or Object.create([]) don't work as expected -->
        // the bracket-notation isn't fucntional anymore:
        // see http://www.bennadel.com/blog/2292-extending-javascript-arrays-while-keeping-native-bracket-notation-functionality.htm
        createArray: function() {
            var newArray = [];
            newArray.merge(ElementArrayMethods);
            return newArray;
        }
    };
};