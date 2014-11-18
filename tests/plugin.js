/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("js-ext/lib/object.js");
    require("window-ext");
    // require('../partials/extend-element.js')(window);
    // require('../partials/extend-document.js')(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        plugins = require("../vdom.js")(window),
        NS = require('../partials/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        async = require('utils/lib/timers.js').async,
        node, nodeSub1, nodeSub2;


    describe('General', function () {

        // bodyNode looks like this:
        /*
        <div>
            <div></div>
            <div></div>
        </div>
        */

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
                nodeSub1 = window.document.createElement('div');
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                node.appendChild(nodeSub2);

            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('plug', function () {
            nodeSub1.plug(plugins.NodeConstrain);

            expect(nodeSub1.outerHTML).to.be.eql('<div xy-constrain="window"></div>');
            expect(nodeSub1.getOuterHTML()).to.be.eql('<div xy-constrain="window"></div>');
            expect(nodeSub2.outerHTML).to.be.eql('<div></div>');
            expect(nodeSub2.getOuterHTML()).to.be.eql('<div></div>');

            nodeSub1.plug(plugins.NodeConstrain, {selector: '#div1'});

            expect(nodeSub1.outerHTML).to.be.eql('<div xy-constrain="#div1"></div>');
            expect(nodeSub1.getOuterHTML()).to.be.eql('<div xy-constrain="#div1"></div>');
        });

        it('isPlugged', function () {
            expect(nodeSub1.isPlugged(plugins.NodeConstrain)).to.be.false;
            expect(nodeSub2.isPlugged(plugins.NodeConstrain)).to.be.false;

            expect(nodeSub1.outerHTML).to.be.eql('<div></div>');
            expect(nodeSub1.getOuterHTML()).to.be.eql('<div></div>');

            nodeSub1.plug(plugins.NodeConstrain);
            expect(nodeSub1.isPlugged(plugins.NodeConstrain)).to.be.true;
            expect(nodeSub2.isPlugged(plugins.NodeConstrain)).to.be.false;

            nodeSub1.plug(plugins.NodeConstrain, {selector: '#div1'});
            expect(nodeSub1.isPlugged(plugins.NodeConstrain)).to.be.true;
            expect(nodeSub2.isPlugged(plugins.NodeConstrain)).to.be.false;

            nodeSub1.removeAttr('xy-constrain');
            expect(nodeSub1.isPlugged(plugins.NodeConstrain)).to.be.false;
        });

        it('unplug', function () {
            nodeSub1.plug(plugins.NodeConstrain);
            expect(nodeSub1.isPlugged(plugins.NodeConstrain)).to.be.true;
            nodeSub1.unplug(plugins.NodeConstrain);
            expect(nodeSub1.isPlugged(plugins.NodeConstrain)).to.be.false;
        });

    });

    describe('NodeConstrain', function () {

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;">
            <div style="height: 50px; width: 100px;"></div>
            <div></div>
        </div>
        */

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.className = 'red blue';
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
                nodeSub1 = window.document.createElement('div');
               nodeSub1.setAttribute('style', 'height: 50px; width: 100px;');
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                node.appendChild(nodeSub2);
            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('setXY node without height', function () {
            nodeSub2.plug(plugins.NodeConstrain, {selector: '#ITSA'});
            nodeSub2.setXY(20, 5, '#ITSA');
console.info(node.top);
console.info(nodeSub2.top);
console.info(nodeSub2.outerHTML);
            expect(nodeSub2.left).to.be.eql(20);
            expect(nodeSub2.top).to.be.eql(10);

        });

        it('setXY node with height', function () {
            // nodeSub1.plug(plugins.NodeConstrain, {selector: '#ITSA'});
            // nodeSub1.setXY(20, 10);
// console.info(node.top);
// console.info(nodeSub1.top);
// console.info(nodeSub1.outerHTML);
            // expect(nodeSub1.left).to.be.eql(20);
            // expect(nodeSub1.top).to.be.eql(10);

        });

    });

}(global.window || require('node-win')));