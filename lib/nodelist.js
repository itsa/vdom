"use strict";

/**
 * Integrates DOM-events to event. more about DOM-events:
 * http://www.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @example
 * require('dom-ext/lib/nodelist.js')(window);
 *
 * @module dom-ext
 * @submodule lib/nodelist.js
 * @class NodeList
 * @since 0.0.1
*/

require('polyfill/polyfill-base.js');

module.exports = function (window) {
    window.NodeList && window.HTMLCollection && (function(NodeListPrototype, HTMLCollectionPrototype) {
        var arrayMethods = Object.getOwnPropertyNames(Array.prototype),
            forEach = function(instance, method, args) {
                instance.forEach(function(element) {
                    element[method].apply(element, args);
                });
                return instance;
            };

        // adding Array.prototype methods to NodeList.prototype
        // Note: this might be buggy in IE8 and below: https://developer.mozilla.org/en-US/docs/Web/API/NodeList#Workarounds
        arrayMethods.forEach(function(methodName) {
            try {
                NodeListPrototype && (NodeListPrototype[methodName] || (NodeListPrototype[methodName]=Array.prototype[methodName]));
                HTMLCollectionPrototype && (HTMLCollectionPrototype[methodName] || (HTMLCollectionPrototype[methodName]=Array.prototype[methodName]));
            }
            catch(err) {
                // some properties have only getters and cannot (and don't need) to be set
            }
        });

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Appends a HtmlElement or text at the end of HtmlElement's innerHTML.
        *
        * @method append
        * @param content {HtmlElement|HtmlElementList|String} content to append
        * @param escape {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.append = HTMLCollectionPrototype.append = function(/* content, escape */) {
            return forEach(this, 'append', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
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
        NodeListPrototype.defineInlineStyle = HTMLCollectionPrototype.defineInlineStyle = function(/* value */) {
            return forEach(this, 'defineInlineStyle', arguments);
        };

       /**
        * Returns the index of the searched Element.
        *
        * @method indexOf
        * @param searchElement {Element} Element to search for
        * @return {Number} the index of the Element in the list (-1 when nto available)
        * @since 0.0.1
        */
        NodeListPrototype.indexOf = HTMLCollectionPrototype.indexOf = function(searchElement) {
            var array = this,
                length = array.length,
                index = 0;
            for (index = 0; index < length; ++index) {
                if (array[index] === searchElement) {
                    return index;
                }
            }
            return -1;
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Prepends a HtmlElement or text at the start of HtmlElement's innerHTML.
        *
        * @method prepend
        * @param content {HtmlElement|HtmlElementList|String} content to prepend
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.prepend = HTMLCollectionPrototype.prepend = function(/* content, escape */) {
            return forEach(this, 'prepend', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Removes the HtmlElement from the DOM.
        *
        * @method remove
        * @since 0.0.1
        */
        NodeListPrototype.remove = HTMLCollectionPrototype.remove = function(/* HtmlElement */) {
            return forEach(this, 'remove', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Removes the attribute from the HtmlElement.
        *
        * Alias for removeAttribute().
        *
        * @method removeAttr
        * @param attributeName {String}
        * @return {Boolean} Whether the HtmlElement has the attribute set.
        * @since 0.0.1
        */
        NodeListPrototype.removeAttr = HTMLCollectionPrototype.removeAttr = function(/* attributeName */) {
            return forEach(this, 'removeAttr', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Removes a className from the HtmlElement.
        *
        * @method removeClass
        * @param className {String} the className that should be removed.
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.removeClass = HTMLCollectionPrototype.removeClass = function(/* className */) {
            return forEach(this, 'removeClass', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Removes data specified by `key`. When no arguments are passed, all node-data (key-value pairs) will be removed.
        *
        * @method removeData
        * @param key {string} name of the key
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.removeData = HTMLCollectionPrototype.removeData = function(/* key */) {
            return forEach(this, 'removeData', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Removes a css-property (inline) out of the HtmlElement. Use camelCase.
        *
        * @method removeInlineStyle
        * @param cssAttribute {String} the css-property to be removed
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.removeInlineStyle = HTMLCollectionPrototype.removeInlineStyle = function(/* cssAttribute */) {
            return forEach(this, 'removeInlineStyle', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Replaces the HtmlElement with a new HtmlElement.
        *
        * @method replace
        * @param newHtmlElement {HtmlElement|String} the new HtmlElement
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @since 0.0.1
        */
        NodeListPrototype.replace = HTMLCollectionPrototype.replace = function(/* newHtmlElement, escape */) {
            return forEach(this, 'replace', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
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
        NodeListPrototype.replaceClass = HTMLCollectionPrototype.replaceClass = function(/* prevClassName, newClassName, force */) {
            return forEach(this, 'replaceClass', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
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
        NodeListPrototype.setAttr = HTMLCollectionPrototype.setAttr = function(/* attributeName, value */) {
            return forEach(this, 'setAttr', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Adds a class to the HtmlElement. If the class already exists it won't be duplicated.
        *
        * @method setClass
        * @param className {String} className to be added
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.setClass = HTMLCollectionPrototype.setClass = function(/* className */) {
            return forEach(this, 'setClass', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Sets the class to the HtmlElement. Cleaning up any previous classes.
        *
        * @method setClassName
        * @param value {Any} the value that belongs to `key`
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.setClassName = HTMLCollectionPrototype.setClassName = function(/* className */) {
            return forEach(this, 'setClassName', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Stores arbitary `data` at the HtmlElement. This has nothing to do with node-attributes whatsoever,
        * it is just a way to bind any data to the specific Element so it can be retrieved later on with `getData()`.
        *
        * @method setData
        * @param key {string} name of the key
        * @param value {Any} the value that belongs to `key`
        * @chainable
        * @since 0.0.1
       */
        NodeListPrototype.setData = HTMLCollectionPrototype.setData = function(/* key, value */) {
            return forEach(this, 'setData', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Sets the content of the HtmlElement (innerHTML). Careful: only set content like this if you controll the data and
        * are sure what is going inside. Otherwise XSS might occur. If you let the user insert, or insert right from a db,
        * you might be better of using setContent().
        *
        * @method setHTML
        * @param content {HtmlElement|HtmlElementList|String} content to append
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.setHTML = HTMLCollectionPrototype.setHTML = function(/* content */) {
            return forEach(this, 'setHTML', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
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
        NodeListPrototype.setInlineStyle = HTMLCollectionPrototype.setInlineStyle = function(/* cssAttribute, value */) {
            return forEach(this, 'setInlineStyle', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Sets the content of the HtmlElement. This is a safe way to set the content, because HTML is not parsed.
        * If you do need to set HTML inside the node, use setHTML().
        *
        * @method setText
        * @param content {HtmlElement|HtmlElementList|String} content to append. In case of HTML, it will be escaped.
        * @param [escape] {Boolean} whether to insert `escaped` content, leading it into only text inserted
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.setText = HTMLCollectionPrototype.setText = function(/* content */) {
            return forEach(this, 'setText', arguments);
        };

       /**
        * For all HtmlElements of the NodeList/HTMLCollection:
        * Toggles the className of the Element.
        *
        * @method toggleClass
        * @param className {String} the className that should be toggled
        * @chainable
        * @since 0.0.1
        */
        NodeListPrototype.toggleClass = HTMLCollectionPrototype.toggleClass = function(/* className */) {
            return forEach(this, 'toggleClass', arguments);
        };

    }(window.NodeList.prototype, window.HTMLCollection.prototype));
};