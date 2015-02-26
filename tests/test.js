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
        TRANSFORM = 'transform',
        VENDOR_CSS = require('polyfill/extra/vendorCSS.js')(window),
        generateVendorCSSProp = VENDOR_CSS.generator,
        VENDOR_CSS_PROPERTIES = VENDOR_CSS.cssProps,
        VENDOR_TRANSFORM_PROPERTY = generateVendorCSSProp(TRANSFORM),
        VENDOR_TRANSITION_PROPERTY = require('polyfill/extra/transition.js')(window),
        async = require('utils/lib/timers.js').async,
        SUPPORT_INLINE_PSEUDO_STYLES = window.document._supportInlinePseudoStyles,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3, cssnode;

    chai.use(require('chai-as-promised'));

    describe('Mutation Observer', function () {
        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
            node.appendChild(window.document.createElement('div'));
            node.appendChild(window.document.createTextNode('some content'));
            node.appendChild(window.document.createComment('some comment'));
            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('processing removed Element', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._removeChild(node.childNodes[0]);
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(2);
                expect(node.vnode.vChildNodes.length).to.be.eql(2);
                done();
            }, 500);
        });

    });


}(global.window || require('node-win')));