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

require('js-ext/lib/function.js');

module.exports = function (window) {
    var NodePlugin, NodeConstrain;

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
        ElementPrototype.isPlugged = function(NodePluginClass) {
            var plugin = new NodePluginClass();
            return plugin.validate(this);
        };

       /**
        * Plugs in the plugin on the HtmlElement, and gives is special behaviour by setting the appropriate attributes.
        *
        * @method plug
        * @param pluginClass {NodePlugin} The plugin that should be plugged. Needs to be the Class, not an instance!
        * @param options {Object} any options that should be passed through when the class is instantiated.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.plug = function(NodePluginClass, options) {
            var plugin = new NodePluginClass(options);
            plugin.setup(this);
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
        ElementPrototype.unplug = function(NodePluginClass) {
            var plugin = new NodePluginClass();
            plugin.teardown(this);
            return this;
        };
    }(window.Element.prototype));

    NodePlugin = Object.createClass(null, {
        setup: function (hostElement) {
            this.each(
                function(value, key) {
                    value && hostElement.setAttr(key, value);
                }
            );
        },
        teardown: function (hostElement) {
            this.each(
                function(value, key) {
                    hostElement.removeAttr(key);
                }
            );
        },
        validate: function(hostElement) {
            return this.some(
                function(value, key) {
                    return hostElement.hasAttr(key);
                }
            );
        }
    });

    NodeConstrain = NodePlugin.subClass(
        function (config) {
            this['xy-constrain'] = (config && config.selector) || 'window';
        }
    );

    return {
        NodePlugin: NodePlugin,
        NodeConstrain: NodeConstrain
    };

};