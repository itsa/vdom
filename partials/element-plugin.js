"use strict";

/**
 * Integrates DOM-events to event. more about DOM-events:
 * http://www.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module vdom
 * @submodule element-plugin
 * @class Plugins
 * @since 0.0.1
*/

require('js-ext/lib/object.js');
require('js-ext/lib/string.js');
require('polyfill');

var createHashMap = require('js-ext/extra/hashmap.js').createMap,
    fromCamelCase = function(input) {
        return input.replace(/[a-z]([A-Z])/g, function(match, group) {
            return match[0]+'-'+group.toLowerCase();
        });
    };

module.exports = function (window) {

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.ElementPlugin) {
        return window._ITSAmodules.ElementPlugin; // ElementPlugin was already created
    }

    var nodePlugin, nodeConstrain, ElementPlugin;

    // also extend window.Element:
    window.Element && (function(ElementPrototype) {
       /**
        * Checks whether the plugin is plugged in at the HtmlElement. Checks whether all its attributes are set.
        *
        * @method isPlugged
        * @param pluginClass {NodePlugin} The plugin that should be plugged. Needs to be the Class, not an instance!
        * @return {Boolean} whether the plugin is plugged in
        * @since 0.0.1
        */
        ElementPrototype.isPlugged = function(nodePlugin) {
            return nodePlugin.validate(this);
        };

       /**
        * Plugs in the plugin on the HtmlElement, and gives is special behaviour by setting the appropriate attributes.
        *
        * @method plug
        * @param pluginClass {NodePlugin} The plugin that should be plugged. Needs to be the Class, not an instance!
        * @param config {Object} any config that should be passed through when the class is instantiated.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.plug = function(nodePlugin, config) {
            nodePlugin.setup(this, config);
            return this;
        };

       /**
        * Unplugs a NodePlugin from the HtmlElement.
        *
        * @method unplug
        * @param pluginClass {NodePlugin} The plugin that should be unplugged. Needs to be the Class, not an instance!
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.unplug = function(nodePlugin) {
            nodePlugin.teardown(this);
            return this;
        };
    }(window.Element.prototype));

    nodePlugin = {
        setup: function (hostElement, config) {
            var instance = this,
                attrs = instance.defaults.shallowClone();
            attrs.merge(config, {force: true});
            attrs.each(
                function(value, key) {
                    key = fromCamelCase(key);
                    value && hostElement.setAttr(instance.ns+'-'+key, value);
                }
            );
        } ,
        teardown: function (hostElement) {
            var instance = this,
                attrs = hostElement.vnode.attrs,
                ns = instance.ns+'-';
            attrs.each(
                function(value, key) {
                     key.startsWith(ns) && hostElement.removeAttr(key);
                }
            );
        },
        validate: function (hostElement) {
            var instance = this,
                attrs = hostElement.vnode.attrs,
                ns = instance.ns+'-';
            return attrs.some(
                function(value, key) {
                    return key.startsWith(ns);
                }
            );
        },
        definePlugin: function (ns, defaults) {
            var newPlugin = Object.create(nodePlugin);
            Object.isObject(defaults) || (defaults = {});
            (typeof ns==='string') || (ns = 'invalid_ns');
            ns = ns.replace(/ /g, '').replace(/-/g, '');
            Object.protectedProp(newPlugin, 'ns', ns);
            newPlugin.defaults = defaults;
            return newPlugin;
        }
    };

    nodeConstrain = nodePlugin.definePlugin('constrain', {selector: 'window'});

    ElementPlugin = window._ITSAmodules.ElementPlugin = {
        nodePlugin: nodePlugin,
        nodeConstrain: nodeConstrain
    };

    return ElementPlugin;
};