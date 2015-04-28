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
        plugins = require("../vdom.js")(window).Plugins,
        NS = require('../partials/vdom-ns.js')(window),
        async = require('utils/lib/timers.js').async,
        node, nodeSub1, nodeSub2;


    describe('SetXY with transition', function () {

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

        it('setXY node with height', function (done) {
            expect(node.left).to.be.eql(10);
            expect(node.top).to.be.eql(30);

            node.setXY(85, 55).then(
                function() {
                    expect(node.left).to.be.eql(85);
                    expect(node.top).to.be.eql(55);
                    expect(node.getStyle('left')).to.be.eql('85px');
                    expect(node.getStyle('top')).to.be.eql('55px');
                    done();
                },
                done
            );
        });

        it('setXY node without height', function (done) {
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px;');
            expect(node.left).to.be.eql(10);
            expect(node.top).to.be.eql(30);

            node.setXY(85, 55).then(
                function() {
                    expect(node.left).to.be.eql(85);
                    expect(node.top).to.be.eql(55);
                    expect(node.getStyle('left')).to.be.eql('85px');
                    expect(node.getStyle('top')).to.be.eql('55px');
                    done();
                },
                done
            );
        });

        it('setXY innner-node with height', function (done) {
            nodeSub1.setXY(2, 5).then(
                function() {
                    expect(nodeSub1.left).to.be.eql(2);
                    expect(nodeSub1.top).to.be.eql(5);
                    done();
                },
                done
            );
        });

        it('setXYinner-node without height', function (done) {
            nodeSub2.setXY(2, 5).then(
                function() {
                    expect(nodeSub2.left).to.be.eql(2);
                    expect(nodeSub2.top).to.be.eql(5);
                    done();
                },
                done
            );
        });

        it('setXY with constrained to inner-node with height', function (done) {
            nodeSub1.setXY(2, 5, '#ITSA').then(
                function() {
                    expect(nodeSub1.left).to.be.eql(10);
                    expect(nodeSub1.top).to.be.eql(30);
                    return nodeSub1.setXY(15, 35);
                }
            ).then(
                function() {
                    expect(nodeSub1.left).to.be.eql(15);
                    expect(nodeSub1.top).to.be.eql(35);
                    return nodeSub1.setXY(2, 5, node);
                }
            ).then(
                function() {
                    expect(nodeSub1.left).to.be.eql(10);
                    expect(nodeSub1.top).to.be.eql(30);
                    done();
                },
                done
            );
        });

        it('setXY with constrained to inner-node without height', function (done) {
            nodeSub2.setXY(2, 5, '#ITSA').then(
                function() {
                    expect(nodeSub2.left).to.be.eql(10);
                    expect(nodeSub2.top).to.be.eql(30);
                    return nodeSub2.setXY(15, 35);
                }
            ).then(
                function() {
                    expect(nodeSub2.left).to.be.eql(15);
                    expect(nodeSub2.top).to.be.eql(35);
                    return nodeSub2.setXY(2, 5, node);
                }
            ).then(
                function() {
                    expect(nodeSub2.left).to.be.eql(10);
                    expect(nodeSub2.top).to.be.eql(30);
                    done();
                },
                done
            );
        });

        it('setXY to inner-node with height and with constrained-plugin', function (done) {
            nodeSub1.plug(plugins.constrain, {selector: '#ITSA'});
            nodeSub1.setXY(2, 5).then(
                function() {
                    expect(nodeSub1.left).to.be.eql(10);
                    expect(nodeSub1.top).to.be.eql(30);
                    done();
                },
                done
            );
        });

        it('setXY to inner-node without height and with constrained-plugin', function (done) {
            nodeSub2.plug(plugins.constrain, {selector: '#ITSA'});
            nodeSub2.setXY(2, 5).then(
                function() {
                    expect(nodeSub2.left).to.be.eql(10);
                    expect(nodeSub2.top).to.be.eql(30);
                    done();
                },
                done
            );
        });

    });

    describe('SetXY without transition', function () {

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

        it('setXY node with height', function () {
            expect(node.left).to.be.eql(10);
            expect(node.top).to.be.eql(30);

            node.setXY(85, 55, null, true);
            expect(node.left).to.be.eql(85);
            expect(node.top).to.be.eql(55);

            expect(node.getStyle('left')).to.be.eql('85px');
            expect(node.getStyle('top')).to.be.eql('55px');
        });

        it('setXY node without height', function () {
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px;');
            expect(node.left).to.be.eql(10);
            expect(node.top).to.be.eql(30);

            node.setXY(85, 55, null, true);
            expect(node.left).to.be.eql(85);
            expect(node.top).to.be.eql(55);

            expect(node.getStyle('left')).to.be.eql('85px');
            expect(node.getStyle('top')).to.be.eql('55px');
        });

        it('setXY innner-node with height', function () {
            nodeSub1.setXY(2, 5, null, true);
            expect(nodeSub1.left).to.be.eql(2);
            expect(nodeSub1.top).to.be.eql(5);
        });

        it('setXYinner-node without height', function () {
            nodeSub2.setXY(2, 5, null, true);
            expect(nodeSub2.left).to.be.eql(2);
            expect(nodeSub2.top).to.be.eql(5);
        });

        it('setXY with constrained to inner-node with height', function () {
            nodeSub1.setXY(2, 5, '#ITSA', true);
            expect(nodeSub1.left).to.be.eql(10);
            expect(nodeSub1.top).to.be.eql(30);

            nodeSub1.setXY(15, 35, null, true);
            expect(nodeSub1.left).to.be.eql(15);
            expect(nodeSub1.top).to.be.eql(35);

            nodeSub1.setXY(2, 5, node, true);
            expect(nodeSub1.left).to.be.eql(10);
            expect(nodeSub1.top).to.be.eql(30);
        });

        it('setXY with constrained to inner-node without height', function () {
            nodeSub2.setXY(2, 5, '#ITSA', true);
            expect(nodeSub2.left).to.be.eql(10);
            expect(nodeSub2.top).to.be.eql(30);

            nodeSub2.setXY(15, 35, null, true);
            expect(nodeSub2.left).to.be.eql(15);
            expect(nodeSub2.top).to.be.eql(35);

            nodeSub2.setXY(2, 5, node, true);
            expect(nodeSub2.left).to.be.eql(10);
            expect(nodeSub2.top).to.be.eql(30);
        });

        it('setXY to inner-node with height and with constrained-plugin', function () {
            nodeSub1.plug(plugins.constrain, {selector: '#ITSA'});
            nodeSub1.setXY(2, 5, null, true);
            expect(nodeSub1.left).to.be.eql(10);
            expect(nodeSub1.top).to.be.eql(30);
        });

        it('setXY to inner-node without height and with constrained-plugin', function () {
            nodeSub2.plug(plugins.constrain, {selector: '#ITSA'});
            nodeSub2.setXY(2, 5, null, true);
            expect(nodeSub2.left).to.be.eql(10);
            expect(nodeSub2.top).to.be.eql(30);
        });

    });

}(global.window || require('node-win')));