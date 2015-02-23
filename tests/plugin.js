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
            nodeSub1.unplug(plugins.Constrain);
        });

        it('plug', function () {
            nodeSub1.plug(plugins.Constrain);

            expect(nodeSub1.outerHTML.replace(' plugin-constrain="true"', '').replace(' constrain-ready="true"', '')).to.be.eql('<div constrain-selector="window"></div>');
            expect(nodeSub1.getOuterHTML().replace(' plugin-constrain="true"', '').replace(' constrain-ready="true"', '')).to.be.eql('<div constrain-selector="window"></div>');
            expect(nodeSub2.outerHTML).to.be.eql('<div></div>');
            expect(nodeSub2.getOuterHTML()).to.be.eql('<div></div>');

            nodeSub1.unplug(plugins.Constrain);
            nodeSub1.plug(plugins.Constrain, {selector: '#div1'});

            expect(nodeSub1.outerHTML.replace(' plugin-constrain="true"', '').replace(' constrain-ready="true"', '')).to.be.eql('<div constrain-selector="#div1"></div>');
            expect(nodeSub1.getOuterHTML().replace(' plugin-constrain="true"', '').replace(' constrain-ready="true"', '')).to.be.eql('<div constrain-selector="#div1"></div>');
            expect(nodeSub1.getAttr('constrain-ready')).to.be.equal('true');
            expect(nodeSub1.getAttr('plugin-constrain')).to.be.equal('true');
        });

        it('isPlugged', function () {
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.false;
            expect(nodeSub2.isPlugged(plugins.Constrain)).to.be.false;

            expect(nodeSub1.outerHTML).to.be.eql('<div></div>');
            expect(nodeSub1.getOuterHTML()).to.be.eql('<div></div>');

            nodeSub1.plug(plugins.Constrain);
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.true;
            expect(nodeSub2.isPlugged(plugins.Constrain)).to.be.false;

            nodeSub1.unplug(plugins.Constrain);
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.false;
            expect(nodeSub2.isPlugged(plugins.Constrain)).to.be.false;

            nodeSub1.plug(plugins.Constrain, {selector: '#div1'});
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.true;
            expect(nodeSub2.isPlugged(plugins.Constrain)).to.be.false;

            nodeSub1.removeAttr('constrain-selector');
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.true;
        });

        it('unplug', function () {
            nodeSub1.plug(plugins.Constrain);
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.true;
            nodeSub1.unplug(plugins.Constrain);
            expect(nodeSub1.isPlugged(plugins.Constrain)).to.be.false;
        });

    });


}(global.window || require('node-win')));