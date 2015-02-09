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
        DOCUMENT = window.document,
        SUPPORT_INLINE_PSEUDO_STYLES = window.document._supportInlinePseudoStyles,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3, cssnode, bodyNode,
        divnode1, divnode2, buttonnode, buttonnode2, buttonnode3, buttonnode4;

    chai.use(require('chai-as-promised'));

    describe('Methods', function () {
        this.timeout(5000);

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;">
            <div id="sub1" class="green yellow"></div>
            <div id="sub2" class="green yellow"></div>
            <div id="sub3">
                <div id="sub3sub" class="green yellow"></div>
                extra text
            </div>
        </div>
        */

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.className = 'red blue';
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
                nodeSub1 = window.document.createElement('div');
                nodeSub1.id = 'sub1';
                nodeSub1.className = 'green yellow';
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                nodeSub2.className = 'green yellow';
                nodeSub2.id = 'sub2';
                node.appendChild(nodeSub2);

                nodeSub3 = window.document.createElement('div');
                nodeSub3.id = 'sub3';
                node.appendChild(nodeSub3);

                    nodeSub3Sub = window.document.createElement('div');
                    nodeSub3Sub.className = 'green yellow';
                    nodeSub3Sub.id = 'sub3sub';
                    nodeSub3.appendChild(nodeSub3Sub);

                    nodeSub3SubText = window.document.createTextNode('extra text');
                    nodeSub3.appendChild(nodeSub3SubText);

            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;">
            <div id="sub1" class="green yellow"></div>
            <div id="sub2" class="green yellow"></div>
            <div id="sub3">
                <div id="sub3sub" class="green yellow"></div>
                extra text
            </div>
        </div>
        */

        it('inside', function () {
            expect(node.inside(node)).to.be.false;
            expect(nodeSub1.inside(node)).to.be.eql(node);
            expect(nodeSub2.inside(node)).to.be.eql(node);
            expect(nodeSub3.inside(node)).to.be.eql(node);
            expect(nodeSub3Sub.inside(node)).to.be.eql(node);

            expect(nodeSub3Sub.inside(nodeSub1)).to.be.false;

            expect(nodeSub3Sub.inside('div')).to.be.eql(nodeSub3);
            expect(nodeSub3Sub.inside('.green')).to.be.false;
            expect(nodeSub3Sub.inside('.red')).to.be.eql(node);
            expect(nodeSub3Sub.inside('#ITSA')).to.be.eql(node);

            var extranode = window.document.body.append('<ul id="extra0" style="opacity: 0;"><li><ul id="extra1"><li id="extra2"></li></ul></li></ul>');
            var extra0 = window.document.getElement('#extra0');
            var extra1 = window.document.getElement('#extra1');
            expect(extra1.inside('>li >ul')).to.be.false;
            expect(window.document.getElement('#extra2').inside('>li >ul')).to.be.equal(extra1);
            extranode.remove();
        });

    });



}(global.window || require('node-win')));