/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("js-ext/lib/object.js");
    require("window-ext");
    require("../vdom.js")(window);
    // require('../lib/extend-element.js')(window);
    // require('../lib/extend-document.js')(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        NS = require('../lib/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3;

    describe('TEST', function () {
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
                nodeSub1 = window.document.createElement('div');
                nodeSub1.id = 'sub1';
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                nodeSub2.id = 'sub2';
                node.appendChild(nodeSub2);

                nodeSub3 = window.document.createElement('div');
                nodeSub3.id = 'sub3';
                node.appendChild(nodeSub3);
                    nodeSub3Sub = window.document.createElement('div');
                    nodeSub3Sub.id = 'sub3sub';
                    nodeSub3.appendChild(nodeSub3Sub);

                    nodeSub3SubText = window.document.createTextNode('extra text');
                    nodeSub3.appendChild(nodeSub3SubText);

            container = window.document.createElement('div');
            container.id = 'ITSA-cont';
                container.appendChild(window.document.createTextNode('first'));
                containerSub1 = window.document.createElement('div');
                containerSub1.id = 'ITSA-cont-sub1';
                container.appendChild(containerSub1);

                container.appendChild(window.document.createTextNode('second'));
                containerSub2 = window.document.createElement('div');
                containerSub2.id = 'ITSA-cont-sub2';
                container.appendChild(containerSub2);

                container.appendChild(window.document.createTextNode('third'));
                containerSub3 = window.document.createElement('div');
                containerSub3.id = 'ITSA-cont-sub3';
                container.appendChild(containerSub3);
                container.appendChild(window.document.createTextNode('fourth'));

            window.document.body.appendChild(container);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(container);
        });

        // Existing node:
        /*
        <div id="ITSA-cont">
            first
            <div id="ITSA-cont-sub1"></div>
            second
            <div id="ITSA-cont-sub2"></div>
            third
            <div id="ITSA-cont-sub3"></div>
            fourth
        </div>
        */

        // Node to prepend:
        /*
        <div id="ITSA">
            <div id="sub1"></div>
            <div id="sub2"></div>
            <div id="sub3">
                <div id="sub3sub"></div>
                extra text
            </div>
        </div>
        */
        it('prepend ElementArray escaped', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.prepend([node, node2], true);
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[0].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[0].vChildNodes===undefined).to.be.true;
        });


});


}(global.window || require('node-win')));