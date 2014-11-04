"use strict";

/**
 * Extends the window-object, so that events listeners will recieve vElements instead of dom-nodes.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * <br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @module vdom
 * @submodule extend-document
 * @class document
 * @since 0.0.1
*/

module.exports = function (window) {

    window.EventTarget && (function(EventTargetPrototype) {

        var extendElement = require('./v-element.js')(window);

        EventTargetPrototype._addEventListener = EventTargetPrototype.addEventListener;
        EventTargetPrototype.addEventListener = function() {
            // wrap the callback and modify e.target, e.currentTarget and e.relatedTarget into Extended-Elements
            var instance = this,
                callbackFn = arguments[1];
            arguments[1] = function(e) {
                e.target && (e.target=extendElement(e.target));
                e.currentTarget && (e.currentTarget=extendElement(e.currentTarget));
                e.relatedTarget && (e.relatedTarget=extendElement(e.relatedTarget));
                callbackFn(e);
            };
            instance._addEventListener.apply(instance. arguments);
        };

    }(window.EventTarget.prototype));

};