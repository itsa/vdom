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

        it('getTransform', function () {
            node.prepend('<style type="text/css">#ITSA div {transform: skewX(30deg);} #ITSA div:before {transform: skewY(100deg);}</style>');

            expect(nodeSub1.getTransform('translateX')===undefined).to.be.true;
            expect(nodeSub1.getTransform('skewX')).to.be.eql('30deg');
            expect(nodeSub1.getTransform('skewY', ':before')).to.be.eql('100deg');
            expect(nodeSub1.getTransform('skewX', ':before')===undefined).to.be.true;
            expect(nodeSub1.getTransform('skewY')===undefined).to.be.true;

            nodeSub1.setAttr('style', 'transform: rotateX(50deg) translateX(10px); color: #AAA;');
            expect(nodeSub1.getTransform('rotateX')).to.be.eql('50deg');
            expect(nodeSub1.getTransform('translateX')).to.be.eql('10px');

            nodeSub1.setAttr('style', 'background-color: #DDD; transform: rotateX(50deg) translateX(10px); color: #AAA;');
            expect(nodeSub1.getTransform('rotateX')).to.be.eql('50deg');
            expect(nodeSub1.getTransform('translateX')).to.be.eql('10px');

            nodeSub1.setAttr('style', 'background-color: #DDD; transform: rotateX(50deg) translateX(10px);');
            expect(nodeSub1.getTransform('rotateX')).to.be.eql('50deg');
            expect(nodeSub1.getTransform('translateX')).to.be.eql('10px');

            nodeSub1.setAttr('style', '{transform: rotateX(50deg) translateX(10px); color: #AAA;} :before {background-color: #DDD; transform: rotateX(150deg) translateX(110px);}');
            expect(nodeSub1.getTransform('rotateX')).to.be.eql('50deg');
            expect(nodeSub1.getTransform('translateX')).to.be.eql('10px');
            expect(nodeSub1.getTransform('rotateX', ':before')).to.be.eql('150deg');
            expect(nodeSub1.getTransform('translateX', ':before')).to.be.eql('110px');

            nodeSub1.setAttr('style', '{background-color: #DDD; transform: skewX(50deg) translateX(10px); color: #AAA;} :before {transform: skewY(150deg);}');
            expect(nodeSub1.getTransform('skewX')).to.be.eql('50deg');
            expect(nodeSub1.getTransform('skewY', ':before')).to.be.eql('150deg');
        });


    });


}(global.window || require('node-win')));