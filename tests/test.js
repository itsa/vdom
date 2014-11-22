/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("js-ext/lib/object.js");
    require("window-ext");
    require("../vdom.js")(window);
    // require('../partials/extend-element.js')(window);
    // require('../partials/extend-document.js')(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        NS = require('../partials/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        async = require('utils/lib/timers.js').async,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3;

    describe('Methods', function () {

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

        it('removeInlineTransition', function () {
            nodeSub1.setAttr('style', 'transition: width 2s ease-in 4s, height 6s;');
            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')).to.be.eql('transition: height 6s;');
            nodeSub1.setAttr('style', 'transition: width 2s ease-in 4s, height 6s;');
            nodeSub1.removeInlineTransition('height');
            expect(nodeSub1.getAttr('style')).to.be.eql('transition: width 2s ease-in 4s;');
            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')===null).to.be.true;
            nodeSub1.setAttr('style', 'color:#AAA; transition: width 2s ease-in 4s;');
            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')).to.be.eql('color: #AAA;');

            nodeSub1.setAttr('style', 'color:#AAA; transition: width 2s ease-in 4s;');
            nodeSub1.removeInlineStyle('color');
            expect(nodeSub1.getAttr('style')).to.be.eql('transition: width 2s ease-in 4s;');

            nodeSub1.setAttr('style', '{color:#AAA; transition: width 2s ease-in 4s;} :before {color: #BBB; transition: width 12s ease-in 14s, opacity 25s;}');

            nodeSub1.removeInlineTransition('opacity', ':before');
            expect(nodeSub1.getAttr('style').replace('color: #AAA; ', '').replace(' color: #AAA;', '').replace('color: #BBB; ', '').replace(' color: #BBB;', '')).to.be.eql('{transition: width 2s ease-in 4s; } :before {transition: width 12s ease-in 14s; }');
            expect(nodeSub1.getAttr('style').replace('transition: width 2s ease-in 4s; ', '').replace(' transition: width 2s ease-in 4s;', '').replace('transition: width 12s ease-in 14s; ', '').replace(' transition: width 12s ease-in 14s;', '')).to.be.eql('{color: #AAA; } :before {color: #BBB; }');
            nodeSub1.removeInlineStyle('color');
            expect(nodeSub1.getAttr('style').replace('color: #BBB; ', '').replace(' color: #BBB;', '')).to.be.eql('{transition: width 2s ease-in 4s; } :before {transition: width 12s ease-in 14s; }');
            expect(nodeSub1.getAttr('style').replace('transition: width 2s ease-in 4s; ', '').replace(' transition: width 2s ease-in 4s;', '').replace('transition: width 12s ease-in 14s; ', '').replace(' transition: width 12s ease-in 14s;', '')).to.be.eql('{} :before {color: #BBB; }');
            nodeSub1.removeInlineStyle('color', ':before');
            expect(nodeSub1.getAttr('style')).to.be.eql('{transition: width 2s ease-in 4s; } :before {transition: width 12s ease-in 14s; }');

            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')).to.be.eql('{} :before {transition: width 12s ease-in 14s; }');

            nodeSub1.removeInlineTransition('width', ':before');
            expect(nodeSub1.getAttr('style')===null).to.be.true;
        });


    });


}(global.window || require('node-win')));