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

    var NAME = '[ElementPlugin]: ',
        Classes = require('js-ext/extra/classes.js'),
        DOCUMENT = window.document,
        Base, Constrain, ElementPlugin;

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
        ElementPrototype.isPlugged = function(pluginClass) {
            return pluginClass.validate(this);
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
        ElementPrototype.plug = function(pluginClass, config) {
            pluginClass(this, config);
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
        ElementPrototype.unplug = function(pluginClass) {
            pluginClass.destroy(this);
            return this;
        };
    }(window.Element.prototype));

    Base = Classes.createClass(
        function (hostElement, config) {
            var instance = this,
                ns = instance.constructor.ns,
                attrs = instance.defaults.shallowClone();
            config && attrs.merge(config, {force: true});
            attrs.each(
                function(value, key) {
                    value && hostElement.setAttr(ns+'-'+fromCamelCase(key), value, true);
                }
            );
        },
        {
            attrs: {},
            defaults: {},
            destroy: function (hostElement) {
                var instance = this,
                    attrs = hostElement.vnode.attrs,
                    ns = instance.constructor.ns+'-';
                attrs.each(
                    function(value, key) {
                         key.startsWith(ns) && hostElement.removeAttr(key);
                    }
                );
            }
        }
    );

    Base.validate = function (hostElement) {
        var instance = this,
            attrs = hostElement.vnode.attrs,
            ns = instance.ns+'-';
        return attrs.some(
            function(value, key) {
                return key.startsWith(ns);
            }
        );
    };

   /**
    * Creates a new Element-PluginClass.
    *
    * @method definePlugin
    * @param ns {String} the namespace of the plugin
    * @param [constructor] {Function} The function that will serve as constructor for the new class.
    *        If `undefined` defaults to `NOOP`
    * @param [prototypes] {Object} Hash map of properties to be added to the prototype of the new class.
    * @return {PluginClass}
    * @since 0.0.1
    */
    DOCUMENT.definePlugin = function(ns, constructor, prototypes) {
        var NewClass;
        if ((typeof ns==='string') && (ns=ns.replaceAll(' ', '')) && (ns.length>0) && !ns.contains('-')) {
            console.log(NAME+'definePlugin');
            NewClass = Base.subClass(constructor, prototypes);
            NewClass.validate = Base.validate.bind(NewClass);
            NewClass.$ns = ns;
        }
        else {
            console.warn(NAME+'definePlugin cannot create Plugin: invalid ns: '+ns);
        }
        return NewClass;
    };

    (function(FunctionPrototype) {
        var originalSubClass = FunctionPrototype.subClass;
        /**
         * Returns a newly created class inheriting from this class
         * using the given `constructor` with the
         * prototypes listed in `prototypes` merged in.
         *
         *
         * The newly created class has the `$$super` static property
         * available to access all of is ancestor's instance methods.
         *
         * Further methods can be added via the [mergePrototypes](#method_mergePrototypes).
         *
         * @example
         *
         *  var Circle = Shape.subClass(
         *      function (x, y, r) {
         *          // arguments will automaticly be passed through to Shape's constructor
         *          this.r = r;
         *      },
         *      {
         *          area: function () {
         *              return this.r * this.r * Math.PI;
         *          }
         *      }
         *  );
         *
         * @method subClass
         * @param ns {String} the namespace of the plugin
         * @param [constructor] {Function} The function that will serve as constructor for the new class.
         *        If `undefined` defaults to `NOOP`
         * @param [prototypes] {Object} Hash map of properties to be added to the prototype of the new class.
         * @param [chainConstruct=true] {Boolean} Whether -during instance creation- to automaticly construct in the complete hierarchy with the given constructor arguments.
         * @return the new class.
         */
        FunctionPrototype.subClass = function (ns, constructor, prototypes /*, chainConstruct */) {
            var instance = this,
                NewClass;
            if (instance.$ns) {
                NewClass = originalSubClass(constructor, prototypes);
                NewClass.$ns = ns;
                NewClass.validate = Base.validate.bind(NewClass);
                return NewClass;
            }
            else {
                // Original subclassing
                return originalSubClass.apply(instance, arguments);
            }
        };
    }(Function.prototype));

    Constrain = DOCUMENT.definePlugin('constrain', null, {
            attrs: {
                selector: 'string'
            },
            defaults: {
                selector: 'window'
            }
        }
    );

    ElementPlugin = window._ITSAmodules.ElementPlugin = {
        Base: Base,
        Constrain: Constrain
    };

    return ElementPlugin;
};