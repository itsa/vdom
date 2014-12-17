/*global describe, it, before, after, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("js-ext/lib/object.js");
    require("window-ext");
    require("../vdom.js")(window);
    // require('../partials/extend-element.js')(window);
    // require('../partials/extend-document.js')(window);

    var chai = require('chai'),
        expect = chai.expect,
        should = chai.should(),
        NS = require('../partials/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        TRANSFORM_PROPERTY = require('polyfill/extra/transform.js')(window),
        VENDOR_TRANSFORM_PROPERTY = TRANSFORM_PROPERTY || 'transform',
        TRANSITION_PROPERTY = require('polyfill/extra/transition.js')(window),
        VENDOR_TRANSITION_PROPERTY = TRANSITION_PROPERTY || 'transition',
        async = require('utils/lib/timers.js').async,
        SUPPORT_INLINE_PSEUDO_STYLES = window.document._supportInlinePseudoStyles,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3, cssnode;

    chai.use(require('chai-as-promised'));



    describe('Node-transitions', function () {

        this.timeout(5000);

        before(function() {
            var inlineClass = '.red {background-color: #F00;} .blue {background-color: #00F;} .small {width: 50px;} .wide {width: 750px;}';
            cssnode = window.document.createElement('style');
            cssnode.setAttribute('type', 'text/css');
            cssnode.appendChild(window.document.createTextNode(inlineClass));
            window.document.body.appendChild(cssnode);
        });

        after(function() {
            window.document.body.removeChild(cssnode);
        });

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.setAttribute('style', 'position: absolute; z-index: -1; left: -9999px; top: -9999px;');
            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('check to return a Promise', function () {
            expect(node.setClass('blue', true) instanceof window.Promise).to.be.true;
            expect(node.setClass('blue') instanceof window.Promise).to.be.false;

            expect(node.removeClass('blue', true) instanceof window.Promise).to.be.true;
            expect(node.removeClass('blue') instanceof window.Promise).to.be.false;
            expect(node.toggleClass('blue', true, true) instanceof window.Promise).to.be.true;
            expect(node.toggleClass('blue', true) instanceof window.Promise).to.be.false;
            expect(node.toggleClass('blue', null, true) instanceof window.Promise).to.be.true;
            expect(node.toggleClass('blue') instanceof window.Promise).to.be.false;


            expect(node.replaceClass('blue', 'red', true, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', true) instanceof window.Promise).to.be.false;
            expect(node.replaceClass('blue', 'red', true, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', true) instanceof window.Promise).to.be.false;

            expect(node.replaceClass('blue', 'red', false, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', false) instanceof window.Promise).to.be.false;
            expect(node.replaceClass('blue', 'red', false, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', false) instanceof window.Promise).to.be.false;

        });

    });


}(global.window || require('node-win')));