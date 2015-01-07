/*global describe, it, before, beforeEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        domNodeToVNode = require("../partials/node-parser.js")(window),
        NS = require('../partials/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        nodesMap = NS.nodesMap,
        node1, node2, node3, node4, node5, node6, node7, node6_1, node7_1, node7_2, node6_1_1, node6_1_2, node6_1_3, node6_1_1_1, node6_1_2_1,
        vnode, vnodeB, nodeB, nodeB2, nodeB3, nodeB4, nodeB5, nodeB6,
        bodyNode, divnode1, divnode2, divnode3, buttonnode, buttonnode2, buttonnode3, buttonnode4, buttonnode5, buttonnode6, buttonnode7, buttonnode8,
        nodeRoot, nodeS1, nodeS2, nodeS3, nodeSub, vnodeS, inputnode1, inputnode2, inputnode3;

// node1 looks like this:
/*
<div id="divone" class="red blue" data-x="somedata">
    <img id="imgone" alt="http://google.com/img1.jpg" class="yellow">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

    node1 = DOCUMENT.createElement('div');
    node1.id = 'divone';
    node1.className = 'red blue';
    node1.setAttribute('data-x', 'somedata');

    node2 = DOCUMENT.createElement('img');
    node2.id = 'imgone';
    node2.setAttribute('alt', 'http://google.com/img1.jpg');
    node2.className = 'yellow';
    node1.appendChild(node2);

    node3 = DOCUMENT.createTextNode('just a textnode');
    node1.appendChild(node3);

    node4 = DOCUMENT.createComment('just a commentnode');
    node1.appendChild(node4);

    node5 = DOCUMENT.createTextNode('just a second textnode');
    node1.appendChild(node5);

    node6 = DOCUMENT.createElement('div');
        node6_1 = DOCUMENT.createElement('ul');
            node6_1_1 = DOCUMENT.createElement('li');
            node6_1_1.id = 'li1';
                node6_1_1_1 = DOCUMENT.createTextNode('first');
                node6_1_1.appendChild(node6_1_1_1);
            node6_1.appendChild(node6_1_1);

            node6_1_2 = DOCUMENT.createElement('li');
            node6_1_2.id = 'li2';
                node6_1_2_1 = DOCUMENT.createTextNode('second');
                node6_1_2.appendChild(node6_1_2_1);
            node6_1.appendChild(node6_1_2);

            node6_1_3 = DOCUMENT.createElement('li');
            node6_1_3.id = 'li3';
            node6_1.appendChild(node6_1_3);
        node6.appendChild(node6_1);
    node1.appendChild(node6);

    node7 = DOCUMENT.createElement('div');
        node7_1 = DOCUMENT.createElement('div');
        node7.appendChild(node7_1);
        node7_2 = DOCUMENT.createTextNode('some text');
        node7.appendChild(node7_2);
    node1.appendChild(node7);

    vnode = domNodeToVNode(node1);


    nodeB = DOCUMENT.createElement('div');
    nodeB2 = DOCUMENT.createTextNode('just a textnode');
    nodeB.appendChild(nodeB2);
    nodeB3 = DOCUMENT.createElement('img');
    nodeB.appendChild(nodeB3);
    nodeB4 = DOCUMENT.createTextNode('just a second textnode');
    nodeB.appendChild(nodeB4);
    nodeB5 = DOCUMENT.createElement('img');
    nodeB.appendChild(nodeB5);
    nodeB6 = DOCUMENT.createTextNode('just a third textnode');
    nodeB.appendChild(nodeB6);

    vnodeB = domNodeToVNode(nodeB);

    //======================================================================================

    describe('simple selectors', function () {

        // bodyNode looks like this:
        /*
        <div id="fakebody">
            <div id="div1" class="class1a class1b"></div>
            <div id="div2" class="class2a class2b">
                <button id="button3" class="class3-a class3b"></button>
            </div>
        </div>
        */


        before(function() {
            bodyNode = DOCUMENT.createElement('div');
            bodyNode.id = 'fakebody';

            divnode1 = DOCUMENT.createElement('div');
            divnode1.id = 'div1';
            divnode1.className = 'class1a class1b';

            divnode2 = DOCUMENT.createElement('div');
            divnode2.id = 'div2';
            divnode2.className = 'class2a class2b';

            buttonnode = DOCUMENT.createElement('button');
            buttonnode.id = 'button3';
            buttonnode.className = 'class3-a class3b';

            divnode2.appendChild(buttonnode);
            divnode1.appendChild(divnode2);
            bodyNode.appendChild(divnode1);

            domNodeToVNode(bodyNode);
        });

        it('check tagname case-insensitivity', function () {
            bodyNode.vnode.matchesSelector('div').should.be.true;
            bodyNode.vnode.matchesSelector('DIV').should.be.true;
        });

        it('divnode1 --> "#fakebody *"', function () {
            bodyNode.vnode.matchesSelector('#fakebody *').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody *').should.be.true;
            divnode2.vnode.matchesSelector('#fakebody *').should.be.true;
            buttonnode.vnode.matchesSelector('#fakebody *').should.be.true;
        });

        it('divnode1 --> "#div2 *"', function () {
            bodyNode.vnode.matchesSelector('#div2 *').should.be.false;
            divnode1.vnode.matchesSelector('#div2 *').should.be.false;
            divnode2.vnode.matchesSelector('#div2 *').should.be.false;
            buttonnode.vnode.matchesSelector('#div2 *').should.be.true;
        });

        it('divnode1 --> "#fakebody div"', function () {
            bodyNode.vnode.matchesSelector('#fakebody div').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody div').should.be.true;
            divnode2.vnode.matchesSelector('#fakebody div').should.be.true;
            buttonnode.vnode.matchesSelector('#fakebody div').should.be.false;
        });

        it('divnode1 --> "#fakebody .class1a"', function () {
            divnode1.vnode.matchesSelector('#fakebody .class1a').should.be.true;
        });

        it('divnode1 --> "div"', function () {
            divnode1.vnode.matchesSelector('div').should.be.true;
        });

        it('bodyNode --> "#fakebody"', function () {
            bodyNode.vnode.matchesSelector('#fakebody').should.be.true;
        });

        it('bodyNode --> "#div1"', function () {
            bodyNode.vnode.matchesSelector('#div1').should.be.false;
        });

        it('divnode1 --> "#div1"', function () {
            divnode1.vnode.matchesSelector('#div1').should.be.true;
        });

        it('divnode1 --> "#div1.class1a"', function () {
            divnode1.vnode.matchesSelector('#div1.class1a').should.be.true;
        });

        it('divnode1 --> "#div1.noclass"', function () {
            divnode1.vnode.matchesSelector('#div1.noclass').should.be.false;
        });

        it('divnode1 --> "#div1.class1a.class1b"', function () {
            divnode1.vnode.matchesSelector('#div1.class1a.class1b').should.be.true;
        });

        it('divnode1 --> "#div1 .class1a"', function () {
            divnode1.vnode.matchesSelector('#div1 .class1a').should.be.false;
        });

        it('divnode1 --> "#div1 .class2a"', function () {
            divnode1.vnode.matchesSelector('#div1 .class2a').should.be.false;
        });

        it('divnode1 --> "#div1 #div2"', function () {
            divnode1.vnode.matchesSelector('#div1 #div2').should.be.false;
        });

        it('divnode2 --> "#div1 div"', function () {
            divnode2.vnode.matchesSelector('#div1 div').should.be.true;
        });

        it('divnode2 --> "#div1 #div2"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2').should.be.true;
        });

        it('divnode2 --> "#div1 #div2.class2a"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2.class2a').should.be.true;
        });

        it('divnode2 --> "#div1 div.class2a"', function () {
            divnode2.vnode.matchesSelector('#div1 div.class2a').should.be.true;
        });

        it('divnode2 --> "#div1 #div2.noclass"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2.noclass').should.be.false;
        });

        it('divnode2 --> "#div1 #div2.class2a.class2b"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2.class2a.class2b').should.be.true;
        });

        it('divnode2 --> "#div1 div.class2a.class2b"', function () {
            divnode2.vnode.matchesSelector('#div1 div.class2a.class2b').should.be.true;
        });

        it('divnode2 --> "#div1 #div2.class2a.noclass"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2.class2a.noclass').should.be.false;
        });

        it('divnode2 --> "#div1 #div2 .class2a"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2 .class2a').should.be.false;
        });

        it('divnode2 --> "#div1 #div2 .class3-a"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2 .class3-a').should.be.false;
        });

        it('divnode2 --> "#div1 #div2 #button3"', function () {
            divnode2.vnode.matchesSelector('#div1 #div2 #button3').should.be.false;
        });

        it('divnode2 --> "#div1#div2"', function () {
            divnode2.vnode.matchesSelector('#div1#div2').should.be.false;
        });

        it('divnode2 --> "#div1#div2.class2a"', function () {
            divnode2.vnode.matchesSelector('#div1#div2.class2a').should.be.false;
        });

        it('divnode2 --> "#div1#div2.class2aclass2b"', function () {
            divnode2.vnode.matchesSelector('#div1#div2.class2aclass2b').should.be.false;
        });

        it('divnode2 --> "#div1#div2 .class2a"', function () {
            divnode2.vnode.matchesSelector('#div1#div2 .class2a').should.be.false;
        });

        it('divnode2 --> "#div1#div2 .class3-a"', function () {
            divnode2.vnode.matchesSelector('#div1#div2 .class3-a').should.be.false;
        });

        it('divnode2 --> "#div1#div2 #button3"', function () {
            divnode2.vnode.matchesSelector('#div1#div2 #button3').should.be.false;
        });

        it('buttonnode --> "#div1 #button3"', function () {
            buttonnode.vnode.matchesSelector('#div1 #button3').should.be.true;
        });

        it('buttonnode --> ".class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class3-a').should.be.true;
        });

        it('buttonnode --> "#div1 #button3.class3-a"', function () {
            buttonnode.vnode.matchesSelector('#div1 #button3.class3-a').should.be.true;
        });

        it('buttonnode --> "#div1 #button3.class3-a.class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #button3.class3-a.class3b').should.be.true;
        });

        it('buttonnode --> "#div1 #button3.class3-a .class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #button3.class3-a .class3b').should.be.false;
        });

        it('buttonnode --> "div1 button.class3-a"', function () {
            buttonnode.vnode.matchesSelector('div button.class3-a').should.be.true;
        });

        it('buttonnode --> "div1 button.class3-a.class3b"', function () {
            buttonnode.vnode.matchesSelector('div button.class3-a.class3b').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 #button3"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 #button3').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 button"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 button').should.be.true;
        });

        it('buttonnode --> ".class1a button"', function () {
            buttonnode.vnode.matchesSelector('.class1a button').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 #button3.class3-a"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 #button3.class3-a').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 #button3.class3-a.class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 #button3.class3-a.class3b').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 button#button3.class3-a.class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 button#button3.class3-a.class3b').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 button.class3-a.class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 button.class3-a.class3b').should.be.true;
        });

        it('buttonnode --> "#div1 #div2 #button3.class3-a .class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 #button3.class3-a .class3b').should.be.false;
        });

        it('buttonnode --> "#div1 #div2 #button3.class3-a .class3b"', function () {
            buttonnode.vnode.matchesSelector('#div1 #div2 #button3.class3-a .class3b').should.be.false;
        });

        it('divnode1 --> ".class1a"', function () {
            divnode1.vnode.matchesSelector('.class1a').should.be.true;
        });

        it('divnode1 --> ".class1a.class1b"', function () {
            divnode1.vnode.matchesSelector('.class1a.class1b').should.be.true;
        });

        it('divnode1 --> ".class2a"', function () {
            divnode1.vnode.matchesSelector('.class2a').should.be.false;
        });

        it('divnode2 --> ".class1a .class2a"', function () {
            divnode2.vnode.matchesSelector('.class1a .class2a').should.be.true;
        });

        it('divnode2 --> ".class1a .class2a.class2b"', function () {
            divnode2.vnode.matchesSelector('.class1a .class2a.class2b').should.be.true;
        });

        it('divnode2 --> ".class1a .class2a.noclass"', function () {
            divnode2.vnode.matchesSelector('.class1a .class2a.noclass').should.be.false;
        });

        it('divnode2 --> ".class1a.class1b .class2a.class2b"', function () {
            divnode2.vnode.matchesSelector('.class1a.class1b .class2a.class2b').should.be.true;
        });

        it('divnode2 --> ".noclass.class1b .class2a.class2b"', function () {
            divnode2.vnode.matchesSelector('.noclass.class1b .class2a.class2b').should.be.false;
        });

        it('divnode2 --> ".class1a .class2a .class3-a"', function () {
            divnode2.vnode.matchesSelector('.class1a .class2a .class3-a').should.be.false;
        });

        it('divnode2 --> ".class1a .class2a.class2b .class3-a"', function () {
            divnode2.vnode.matchesSelector('.class1a .class2a.class2b .class3-a').should.be.false;
        });

        it('divnode2 --> ".class1a.class1b .class2a.class2b .class3-a"', function () {
            divnode2.vnode.matchesSelector('.class1a.class1b .class2a.class2b .class3-a').should.be.false;
        });

        it('buttonnode --> ".class1a #div2 .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class1a #div2 .class3-a').should.be.true;
        });

        it('buttonnode --> ".class1a #div2.class2b .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class1a #div2.class2b .class3-a').should.be.true;
        });

        it('buttonnode --> ".class1a #div2.class2a.class2b .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class1a #div2.class2a.class2b .class3-a').should.be.true;
        });

        it('buttonnode --> ".noclass #div2.class2a.class2b .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.noclass #div2.class2a.class2b .class3-a').should.be.false;
        });

        it('buttonnode --> ".class1a #div2.noclass.class2b .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class1a #div2.noclass.class2b .class3-a').should.be.false;
        });

        it('buttonnode --> ".class1a #div2.class2a.class2b .noclass"', function () {
            buttonnode.vnode.matchesSelector('.class1a #div2.class2a.class2b .noclass').should.be.false;
        });

        it('buttonnode --> ".class1a.class1b #div2.class2a .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class1a.class1b #div2.class2a .class3-a').should.be.true;
        });

        it('buttonnode --> ".class1a.class1b #div2.class2a.class2b .class3-a"', function () {
            buttonnode.vnode.matchesSelector('.class1a.class1b #div2.class2a.class2b .class3-a').should.be.true;
        });

    });

    //======================================================================================

    describe('Complex attributes', function () {

        // bodyNode looks like this:
        /*
        <div id="fakebody">
            <div id="div1" data-x="some data" class="red yellow green"></div>
            <div id="div2" data-x="also some data">
                <button id="button1" data-x="data extended"></button>
                <button id="button2" data-x="data|extended"></button>
            </div>
        </div>
        */

        before(function() {
            bodyNode = DOCUMENT.createElement('div');
            bodyNode.id = 'fakebody';

            divnode1 = DOCUMENT.createElement('div');
            divnode1.id = 'div1';
            divnode1.setAttribute('data-x', 'some   data');
            divnode1.className = 'red yellow green';

            divnode2 = DOCUMENT.createElement('div');
            divnode2.id = 'div2';
            divnode2.setAttribute('data-x', 'also some   data');

            buttonnode = DOCUMENT.createElement('button');
            buttonnode.id = 'button3';
            buttonnode.setAttribute('data-x', 'data extended');

            buttonnode2 = DOCUMENT.createElement('button');
            buttonnode2.id = 'button3';
            buttonnode2.setAttribute('data-x', 'data|extended');

            divnode2.appendChild(buttonnode);
            divnode2.appendChild(buttonnode2);
            bodyNode.appendChild(divnode1);
            bodyNode.appendChild(divnode2);

            domNodeToVNode(bodyNode);
        });

        it('[data-x]"', function () {
            bodyNode.vnode.matchesSelector('#div1[data-x]').should.be.false;
            divnode1.vnode.matchesSelector('#div1[data-x]').should.be.true;
            divnode1.vnode.matchesSelector('#div1[data-x].red').should.be.true;
            divnode2.vnode.matchesSelector('#div1[data-x]').should.be.false;
            buttonnode.vnode.matchesSelector('#div1[data-x]').should.be.false;
            buttonnode2.vnode.matchesSelector('#div1[data-x]').should.be.false;
        });

        it('[data-x="some   data"]"', function () {
            bodyNode.vnode.matchesSelector('#div1[data-x="some   data"]').should.be.false;
            divnode1.vnode.matchesSelector('#div1[data-x="some   data"]').should.be.true;
            divnode1.vnode.matchesSelector('#div1[data-x="some   data"].red').should.be.true;
            divnode2.vnode.matchesSelector('#div1[data-x="some   data"]').should.be.false;
            buttonnode.vnode.matchesSelector('#div1[data-x="some   data"]').should.be.false;
            buttonnode2.vnode.matchesSelector('#div1[data-x="some   data"]').should.be.false;
        });

        it('[data-x^=]"', function () {
            bodyNode.vnode.matchesSelector('[data-x^="some"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x^="some"]').should.be.true;
            divnode1.vnode.matchesSelector('[data-x^="som"]').should.be.true;
            divnode1.vnode.matchesSelector('[data-x^="ome"]').should.be.false;
            divnode2.vnode.matchesSelector('[data-x^="some"]').should.be.false;
            buttonnode.vnode.matchesSelector('[data-x^="some"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x^="some"]').should.be.false;
            divnode1.vnode.matchesSelector('div[data-x^="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[data-x^="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[data-x^="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x^="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x^="some"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[data-x^="some"]').should.be.false;
            divnode1.vnode.matchesSelector('input [data-x^="some"]').should.be.false;

            bodyNode.vnode.matchesSelector('[class^="re"]').should.be.false;
            divnode1.vnode.matchesSelector('[class^="re"]').should.be.true;
            divnode1.vnode.matchesSelector('[class^="ed"]').should.be.false;
            divnode1.vnode.matchesSelector('[class^="e"]').should.be.false;
            divnode2.vnode.matchesSelector('[class^="re"]').should.be.false;
            buttonnode.vnode.matchesSelector('[class^="re"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class^="re"]').should.be.false;
            divnode1.vnode.matchesSelector('div[class^="re"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[class^="re"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[class^="re"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class^="re"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class^="re"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[class^="re"]').should.be.false;
            divnode1.vnode.matchesSelector('input [class^="re"]').should.be.false;
        });

        it('[data-x$=]"', function () {
            bodyNode.vnode.matchesSelector('[data-x$="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x$="data"]').should.be.true;
            divnode1.vnode.matchesSelector('[data-x$="ata"]').should.be.true;
            divnode1.vnode.matchesSelector('[data-x$="dat"]').should.be.false;
            divnode2.vnode.matchesSelector('[data-x$="data"]').should.be.true;
            buttonnode.vnode.matchesSelector('[data-x$="data"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x$="data"]').should.be.false;
            divnode1.vnode.matchesSelector('div[data-x$="data"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[data-x$="data"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[data-x$="data"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x$="data"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x$="data"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[data-x$="data"]').should.be.false;
            divnode1.vnode.matchesSelector('input [data-x$="data"]').should.be.false;

            bodyNode.vnode.matchesSelector('[class$="een"]').should.be.false;
            divnode1.vnode.matchesSelector('[class$="een"]').should.be.true;
            divnode1.vnode.matchesSelector('[class$="green"]').should.be.true;
            divnode1.vnode.matchesSelector('[class$="gree"]').should.be.false;
            divnode2.vnode.matchesSelector('[class$="een"]').should.be.false;
            buttonnode.vnode.matchesSelector('[class$="een"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class$="een"]').should.be.false;
            divnode1.vnode.matchesSelector('div[class$="een"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[class$="een"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[class$="een"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class$="een"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class$="een"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[class$="een"]').should.be.false;
            divnode1.vnode.matchesSelector('input [class$="een"]').should.be.false;
        });

        it('[data-x*=]"', function () {
            bodyNode.vnode.matchesSelector('[data-x*="om"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x*="om"]').should.be.true;
            divnode2.vnode.matchesSelector('[data-x*="om"]').should.be.true;
            buttonnode.vnode.matchesSelector('[data-x*="om"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x*="om"]').should.be.false;
            divnode1.vnode.matchesSelector('div[data-x*="om"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[data-x*="om"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[data-x*="om"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x*="om"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x*="om"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[data-x*="om"]').should.be.false;
            divnode1.vnode.matchesSelector('input [data-x*="om"]').should.be.false;

            bodyNode.vnode.matchesSelector('[class*="ello"]').should.be.false;
            divnode1.vnode.matchesSelector('[class*="red"]').should.be.true;
            divnode1.vnode.matchesSelector('[class*="yellow"]').should.be.true;
            divnode1.vnode.matchesSelector('[class*="green"]').should.be.true;
            divnode2.vnode.matchesSelector('[class*="ello"]').should.be.false;
            buttonnode.vnode.matchesSelector('[class*="ello"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class*="ello"]').should.be.false;
            divnode1.vnode.matchesSelector('div[class*="ello"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[class*="ello"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[class*="ello"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class*="ello"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class*="ello"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[class*="ello"]').should.be.false;
            divnode1.vnode.matchesSelector('input [class*="ello"]').should.be.false;
        });

        it('[data-x~=]"', function () {
            bodyNode.vnode.matchesSelector('[data-x~="some"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x~="some"]').should.be.true;
            divnode1.vnode.matchesSelector('[data-x~="data"]').should.be.true;
            divnode1.vnode.matchesSelector('[data-x~="som"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x~="ome"]').should.be.false;
            divnode2.vnode.matchesSelector('[data-x~="some"]').should.be.true;
            buttonnode.vnode.matchesSelector('[data-x~="some"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x~="some"]').should.be.false;
            divnode1.vnode.matchesSelector('div[data-x~="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[data-x~="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[data-x~="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x~="some"].red').should.be.true;
            divnode1.vnode.matchesSelector('[data-x~="some"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[data-x~="some"]').should.be.false;
            divnode1.vnode.matchesSelector('input [data-x~="some"]').should.be.false;

            bodyNode.vnode.matchesSelector('[class~="yellow"]').should.be.false;
            divnode1.vnode.matchesSelector('[class~="yellow"]').should.be.true;
            divnode1.vnode.matchesSelector('[class~="ellow"]').should.be.false;
            divnode1.vnode.matchesSelector('[class~="ello"]').should.be.false;
            divnode1.vnode.matchesSelector('[class~="yello"]').should.be.false;
            divnode2.vnode.matchesSelector('[class~="yellow"]').should.be.false;
            buttonnode.vnode.matchesSelector('[class~="yellow"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class~="yellow"]').should.be.false;
            divnode1.vnode.matchesSelector('div[class~="yellow"].red').should.be.true;
            divnode1.vnode.matchesSelector('div#div1[class~="yellow"].red').should.be.true;
            divnode1.vnode.matchesSelector('#div1[class~="yellow"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class~="yellow"].red').should.be.true;
            divnode1.vnode.matchesSelector('[class~="yellow"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[class~="yellow"]').should.be.false;
            divnode1.vnode.matchesSelector('input [class~="yellow"]').should.be.false;
        });

        it('[data-x|=]"', function () {
            bodyNode.vnode.matchesSelector('[data-x|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[data-x|="data"]').should.be.false;
            divnode2.vnode.matchesSelector('[data-x|="data"]').should.be.false;
            buttonnode.vnode.matchesSelector('[data-x|="data"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x|="data"]').should.be.true;
            buttonnode2.vnode.matchesSelector('[data-x|="extended"]').should.be.true;
            buttonnode2.vnode.matchesSelector('[data-x|="dat"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x|="ata"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x|="extende"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[data-x|="xtended"]').should.be.false;
            divnode1.vnode.matchesSelector('div[data-x|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('div#div1[data-x|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('#div1[data-x|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('[data-x|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('[data-x|="data"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[data-x|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('input [data-x|="data"]').should.be.false;

            bodyNode.vnode.matchesSelector('[class|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[class|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[class|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('[class|="data"]').should.be.false;
            divnode2.vnode.matchesSelector('[class|="data"]').should.be.false;
            buttonnode.vnode.matchesSelector('[class|="data"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class|="data"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class|="extended"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class|="dat"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class|="ata"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class|="extende"]').should.be.false;
            buttonnode2.vnode.matchesSelector('[class|="xtended"]').should.be.false;
            divnode1.vnode.matchesSelector('div[class|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('div#div1[class|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('#div1[class|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('[class|="data"].red').should.be.false;
            divnode1.vnode.matchesSelector('[class|="data"].blue').should.be.false;
            divnode1.vnode.matchesSelector('input[class|="data"]').should.be.false;
            divnode1.vnode.matchesSelector('input [class|="data"]').should.be.false;
        });

    });

    //======================================================================================

    describe('Complex relationships', function () {

        // bodyNode looks like this:
        /*
        <div id="fakebody">
            <div id="div1" class="class1"></div>
            <div id="div2" class="class2">
                <button id="button1" class="class1"></button>
                <button id="button2" class="class2"></button>
                <button id="button3" class="class3"></button>
            </div>
            <button id="button4" class="class4"></button>
        </div>
        */

        before(function() {
            bodyNode = DOCUMENT.createElement('div');
            bodyNode.id = 'fakebody';

            divnode1 = DOCUMENT.createElement('div');
            divnode1.id = 'div1';
            divnode1.className = 'class1';

            divnode2 = DOCUMENT.createElement('div');
            divnode2.id = 'div2';
            divnode2.className = 'class2';

            buttonnode = DOCUMENT.createElement('button');
            buttonnode.id = 'button1';
            buttonnode.className = 'class1';

            buttonnode2 = DOCUMENT.createElement('button');
            buttonnode2.id = 'button2';
            buttonnode2.className = 'class2';

            buttonnode3 = DOCUMENT.createElement('button');
            buttonnode3.id = 'button3';
            buttonnode3.className = 'class3';

            buttonnode4 = DOCUMENT.createElement('button');
            buttonnode4.id = 'button4';
            buttonnode4.className = 'class4';

            divnode2.appendChild(buttonnode);
            divnode2.appendChild(buttonnode2);
            divnode2.appendChild(buttonnode3);
            bodyNode.appendChild(divnode1);
            bodyNode.appendChild(divnode2);
            bodyNode.appendChild(buttonnode4);

            domNodeToVNode(bodyNode);
        });

        it('> element"', function () {
            divnode1.vnode.matchesSelector('> button', bodyNode.vnode).should.be.false;
            divnode1.vnode.matchesSelector('> button', divnode1.vnode).should.be.false;
            divnode2.vnode.matchesSelector('> button', bodyNode.vnode).should.be.false;
            divnode2.vnode.matchesSelector('> button', divnode2.vnode).should.be.false;

            buttonnode.vnode.matchesSelector('> button', divnode2.vnode).should.be.true;
            buttonnode2.vnode.matchesSelector('> button', divnode2.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('> button', divnode2.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('> button', bodyNode.vnode).should.be.true;

            buttonnode.vnode.matchesSelector('> button', bodyNode.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('> button', bodyNode.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('> button', bodyNode.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('> button', divnode2.vnode).should.be.false;

            divnode1.vnode.matchesSelector('>button', bodyNode.vnode).should.be.false;
            divnode1.vnode.matchesSelector('>button', divnode1.vnode).should.be.false;
            divnode2.vnode.matchesSelector('>button', bodyNode.vnode).should.be.false;
            divnode2.vnode.matchesSelector('>button', divnode2.vnode).should.be.false;

            buttonnode.vnode.matchesSelector('>button', divnode2.vnode).should.be.true;
            buttonnode2.vnode.matchesSelector('>button', divnode2.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('>button', divnode2.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('>button', bodyNode.vnode).should.be.true;

            buttonnode.vnode.matchesSelector('>button', bodyNode.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('>button', bodyNode.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('>button', bodyNode.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('>button', divnode2.vnode).should.be.false;
        });

        it('element > element"', function () {
            bodyNode.vnode.matchesSelector('> button').should.be.false;
            divnode1.vnode.matchesSelector('> button').should.be.false;
            divnode2.vnode.matchesSelector('> button').should.be.false;
            buttonnode.vnode.matchesSelector('> button').should.be.true;
            buttonnode2.vnode.matchesSelector('> button').should.be.true;
            buttonnode3.vnode.matchesSelector('> button').should.be.true;
            buttonnode4.vnode.matchesSelector('> button').should.be.true;

            bodyNode.vnode.matchesSelector('>button').should.be.false;
            divnode1.vnode.matchesSelector('>button').should.be.false;
            divnode2.vnode.matchesSelector('>button').should.be.false;
            buttonnode.vnode.matchesSelector('>button').should.be.true;
            buttonnode2.vnode.matchesSelector('>button').should.be.true;
            buttonnode3.vnode.matchesSelector('>button').should.be.true;
            buttonnode4.vnode.matchesSelector('>button').should.be.true;

            bodyNode.vnode.matchesSelector('#fakebody > button').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody > button').should.be.false;
            divnode2.vnode.matchesSelector('#fakebody > button').should.be.false;
            buttonnode.vnode.matchesSelector('#fakebody > button').should.be.false;
            buttonnode2.vnode.matchesSelector('#fakebody > button').should.be.false;
            buttonnode3.vnode.matchesSelector('#fakebody > button').should.be.false;
            buttonnode4.vnode.matchesSelector('#fakebody > button').should.be.true;

            bodyNode.vnode.matchesSelector('#fakebody> button').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody> button').should.be.false;
            divnode2.vnode.matchesSelector('#fakebody> button').should.be.false;
            buttonnode.vnode.matchesSelector('#fakebody> button').should.be.false;
            buttonnode2.vnode.matchesSelector('#fakebody> button').should.be.false;
            buttonnode3.vnode.matchesSelector('#fakebody> button').should.be.false;
            buttonnode4.vnode.matchesSelector('#fakebody> button').should.be.true;

            bodyNode.vnode.matchesSelector('#fakebody >button').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody >button').should.be.false;
            divnode2.vnode.matchesSelector('#fakebody >button').should.be.false;
            buttonnode.vnode.matchesSelector('#fakebody >button').should.be.false;
            buttonnode2.vnode.matchesSelector('#fakebody >button').should.be.false;
            buttonnode3.vnode.matchesSelector('#fakebody >button').should.be.false;
            buttonnode4.vnode.matchesSelector('#fakebody >button').should.be.true;

            bodyNode.vnode.matchesSelector('#fakebody>button').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody>button').should.be.false;
            divnode2.vnode.matchesSelector('#fakebody>button').should.be.false;
            buttonnode.vnode.matchesSelector('#fakebody>button').should.be.false;
            buttonnode2.vnode.matchesSelector('#fakebody>button').should.be.false;
            buttonnode3.vnode.matchesSelector('#fakebody>button').should.be.false;
            buttonnode4.vnode.matchesSelector('#fakebody>button').should.be.true;

            bodyNode.vnode.matchesSelector('#div2 > button').should.be.false;
            divnode1.vnode.matchesSelector('#div2 > button').should.be.false;
            divnode2.vnode.matchesSelector('#div2 > button').should.be.false;
            buttonnode.vnode.matchesSelector('#div2 > button').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 > button').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 > button').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 > button').should.be.false;
        });

        it('+ element"', function () {
            divnode1.vnode.matchesSelector('+ button', bodyNode.vnode).should.be.false;
            divnode1.vnode.matchesSelector('+ button', divnode1.vnode).should.be.false;
            divnode1.vnode.matchesSelector('+ button', divnode2.vnode).should.be.false;
            divnode2.vnode.matchesSelector('+ button', bodyNode.vnode).should.be.false;
            divnode2.vnode.matchesSelector('+ button', divnode1.vnode).should.be.false;
            divnode2.vnode.matchesSelector('+ button', divnode2.vnode).should.be.false;

            buttonnode.vnode.matchesSelector('+ button', divnode1.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+ button', divnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+ button', buttonnode.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+ button', buttonnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+ button', buttonnode3.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+ button', buttonnode4.vnode).should.be.false;

            buttonnode2.vnode.matchesSelector('+ button', divnode1.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+ button', divnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+ button', buttonnode.vnode).should.be.true;
            buttonnode2.vnode.matchesSelector('+ button', buttonnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+ button', buttonnode3.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+ button', buttonnode4.vnode).should.be.false;

            buttonnode3.vnode.matchesSelector('+ button', divnode1.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+ button', divnode2.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+ button', buttonnode.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+ button', buttonnode2.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('+ button', buttonnode3.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+ button', buttonnode4.vnode).should.be.false;

            buttonnode4.vnode.matchesSelector('+ button', divnode1.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+ button', divnode2.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('+ button', buttonnode.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+ button', buttonnode2.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+ button', buttonnode3.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+ button', buttonnode4.vnode).should.be.false;

            divnode1.vnode.matchesSelector('+button', bodyNode.vnode).should.be.false;
            divnode1.vnode.matchesSelector('+button', divnode1.vnode).should.be.false;
            divnode1.vnode.matchesSelector('+button', divnode2.vnode).should.be.false;
            divnode2.vnode.matchesSelector('+button', bodyNode.vnode).should.be.false;
            divnode2.vnode.matchesSelector('+button', divnode1.vnode).should.be.false;
            divnode2.vnode.matchesSelector('+button', divnode2.vnode).should.be.false;

            buttonnode.vnode.matchesSelector('+button', divnode1.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+button', divnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+button', buttonnode.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+button', buttonnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+button', buttonnode3.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('+button', buttonnode4.vnode).should.be.false;

            buttonnode2.vnode.matchesSelector('+button', divnode1.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+button', divnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+button', buttonnode.vnode).should.be.true;
            buttonnode2.vnode.matchesSelector('+button', buttonnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+button', buttonnode3.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('+button', buttonnode4.vnode).should.be.false;

            buttonnode3.vnode.matchesSelector('+button', divnode1.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+button', divnode2.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+button', buttonnode.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+button', buttonnode2.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('+button', buttonnode3.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('+button', buttonnode4.vnode).should.be.false;

            buttonnode4.vnode.matchesSelector('+button', divnode1.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+button', divnode2.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('+button', buttonnode.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+button', buttonnode2.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+button', buttonnode3.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('+button', buttonnode4.vnode).should.be.false;
        });

        it('element + element"', function () {
            buttonnode2.vnode.matchesSelector('#button1 + #button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1 + #button3').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 + #button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2 + #button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1 + #button2').should.be.false;

            buttonnode2.vnode.matchesSelector('#button1+ #button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1+ #button3').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2+ #button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2+ #button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1+ #button2').should.be.false;

            buttonnode2.vnode.matchesSelector('#button1 +#button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1 +#button3').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 +#button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2 +#button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1 +#button2').should.be.false;

            buttonnode2.vnode.matchesSelector('#button1+#button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1+#button3').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2+#button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2+#button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1+#button2').should.be.false;
        });

        it('~ element"', function () {
            divnode1.vnode.matchesSelector('~ button', bodyNode.vnode).should.be.false;
            divnode1.vnode.matchesSelector('~ button', divnode1.vnode).should.be.false;
            divnode1.vnode.matchesSelector('~ button', divnode2.vnode).should.be.false;
            divnode2.vnode.matchesSelector('~ button', bodyNode.vnode).should.be.false;
            divnode2.vnode.matchesSelector('~ button', divnode1.vnode).should.be.false;
            divnode2.vnode.matchesSelector('~ button', divnode2.vnode).should.be.false;

            buttonnode.vnode.matchesSelector('~ button', divnode1.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~ button', divnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~ button', buttonnode.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~ button', buttonnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~ button', buttonnode3.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~ button', buttonnode4.vnode).should.be.false;

            buttonnode2.vnode.matchesSelector('~ button', divnode1.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~ button', divnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~ button', buttonnode.vnode).should.be.true;
            buttonnode2.vnode.matchesSelector('~ button', buttonnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~ button', buttonnode3.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~ button', buttonnode4.vnode).should.be.false;

            buttonnode3.vnode.matchesSelector('~ button', divnode1.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('~ button', divnode2.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('~ button', buttonnode.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('~ button', buttonnode2.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('~ button', buttonnode3.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('~ button', buttonnode4.vnode).should.be.false;

            buttonnode4.vnode.matchesSelector('~ button', divnode1.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('~ button', divnode2.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('~ button', buttonnode.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('~ button', buttonnode2.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('~ button', buttonnode3.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('~ button', buttonnode4.vnode).should.be.false;

            divnode1.vnode.matchesSelector('~button', bodyNode.vnode).should.be.false;
            divnode1.vnode.matchesSelector('~button', divnode1.vnode).should.be.false;
            divnode1.vnode.matchesSelector('~button', divnode2.vnode).should.be.false;
            divnode2.vnode.matchesSelector('~button', bodyNode.vnode).should.be.false;
            divnode2.vnode.matchesSelector('~button', divnode1.vnode).should.be.false;
            divnode2.vnode.matchesSelector('~button', divnode2.vnode).should.be.false;

            buttonnode.vnode.matchesSelector('~button', divnode1.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~button', divnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~button', buttonnode.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~button', buttonnode2.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~button', buttonnode3.vnode).should.be.false;
            buttonnode.vnode.matchesSelector('~button', buttonnode4.vnode).should.be.false;

            buttonnode2.vnode.matchesSelector('~button', divnode1.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~button', divnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~button', buttonnode.vnode).should.be.true;
            buttonnode2.vnode.matchesSelector('~button', buttonnode2.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~button', buttonnode3.vnode).should.be.false;
            buttonnode2.vnode.matchesSelector('~button', buttonnode4.vnode).should.be.false;

            buttonnode3.vnode.matchesSelector('~button', divnode1.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('~button', divnode2.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('~button', buttonnode.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('~button', buttonnode2.vnode).should.be.true;
            buttonnode3.vnode.matchesSelector('~button', buttonnode3.vnode).should.be.false;
            buttonnode3.vnode.matchesSelector('~button', buttonnode4.vnode).should.be.false;

            buttonnode4.vnode.matchesSelector('~button', divnode1.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('~button', divnode2.vnode).should.be.true;
            buttonnode4.vnode.matchesSelector('~button', buttonnode.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('~button', buttonnode2.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('~button', buttonnode3.vnode).should.be.false;
            buttonnode4.vnode.matchesSelector('~button', buttonnode4.vnode).should.be.false;
        });

        it('element ~ element"', function () {
            buttonnode2.vnode.matchesSelector('#button1 ~ #button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1 ~ #button3').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 ~ #button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2 ~ #button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1 ~ #button2').should.be.false;

            buttonnode2.vnode.matchesSelector('#button1~ #button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1~ #button3').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2~ #button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2~ #button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1~ #button2').should.be.false;

            buttonnode2.vnode.matchesSelector('#button1 ~#button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1 ~#button3').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 ~#button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2 ~#button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1 ~#button2').should.be.false;

            buttonnode2.vnode.matchesSelector('#button1~#button2').should.be.true;
            buttonnode3.vnode.matchesSelector('#button1~#button3').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2~#button4').should.be.true;
            buttonnode.vnode.matchesSelector('#div2~#button1').should.be.false;
            bodyNode.vnode.matchesSelector('#button1~#button2').should.be.false;
        });

    });


    //======================================================================================

    describe('Pseudo-selectors', function () {

        // bodyNode looks like this:
        /*
        <div id="fakebody">
            <div id="div1" class="class1"></div>
            <div id="div2" class="class2">
                <button id="button1" class="class1"></button>
                <div id="div3">some content</div>
                <button id="button2" class="class2" data-x="some   data"></button>
                <button id="button3" class="class3" data-x="some   extra data"></button>
                <button id="button4" class="class4" lang="nl"></button>
                <button id="button5" class="class5"></button>
                <button id="button6" class="class6"></button>
                <button id="button7" class="class7"></button>
            </div>
            <button id="button8" class="class8"></button>
            <input id="input1" type="number" checked min="5" max="10" value="8">
            <input id="input2" type="number" required readonly min="5" max="10" value="25">
            <input id="input3" disabled min="5" max="10" value="8">
        </div>
        */

        before(function() {
            bodyNode = DOCUMENT.createElement('div');
            bodyNode.id = 'fakebody';

            divnode1 = DOCUMENT.createElement('div');
            divnode1.id = 'div1';
            divnode1.className = 'class1';

            divnode2 = DOCUMENT.createElement('div');
            divnode2.id = 'div2';
            divnode2.className = 'class2';

            buttonnode = DOCUMENT.createElement('button');
            buttonnode.id = 'button1';
            buttonnode.className = 'class1';

            divnode3 = DOCUMENT.createElement('div');
            divnode3.id = 'div3';
            divnode3.className = 'class3';
            divnode3.appendChild(DOCUMENT.createTextNode('some content'));

            buttonnode2 = DOCUMENT.createElement('button');
            buttonnode2.id = 'button2';
            buttonnode2.className = 'class2';
            buttonnode2.setAttribute('data-x', 'some   data');

            buttonnode3 = DOCUMENT.createElement('button');
            buttonnode3.id = 'button3';
            buttonnode3.className = 'class3';
            buttonnode3.setAttribute('data-x', 'some   extra data');

            buttonnode4 = DOCUMENT.createElement('button');
            buttonnode4.id = 'button4';
            buttonnode4.className = 'class4';
            buttonnode4.setAttribute('lang', 'nl');

            buttonnode5 = DOCUMENT.createElement('button');
            buttonnode5.id = 'button5';
            buttonnode5.className = 'class5';

            buttonnode6 = DOCUMENT.createElement('button');
            buttonnode6.id = 'button6';
            buttonnode6.className = 'class6';

            buttonnode7 = DOCUMENT.createElement('button');
            buttonnode7.id = 'button7';
            buttonnode7.className = 'class7';

            buttonnode8 = DOCUMENT.createElement('button');
            buttonnode8.id = 'button8';
            buttonnode8.className = 'class8';

            inputnode1 = DOCUMENT.createElement('input');
            inputnode1.id = 'input1';
            inputnode1.setAttribute('checked', true);
            inputnode1.setAttribute('min', '5');
            inputnode1.setAttribute('max', '10');
            inputnode1.setAttribute('value', '8');
            inputnode1.setAttribute('type', 'number');
            inputnode1.value = 8;

            inputnode2 = DOCUMENT.createElement('input');
            inputnode2.id = 'input2';
            inputnode2.setAttribute('required', true);
            inputnode2.setAttribute('readonly', true);
            inputnode2.setAttribute('min', '5');
            inputnode2.setAttribute('max', '10');
            inputnode2.setAttribute('value', '25');
            inputnode2.setAttribute('type', 'number');
            inputnode2.value = 25;

            inputnode3 = DOCUMENT.createElement('input');
            inputnode3.id = 'input3';
            inputnode3.setAttribute('disabled', true);
            inputnode3.setAttribute('min', '5');
            inputnode3.setAttribute('max', '10');
            inputnode3.setAttribute('value', '8');

            divnode2.appendChild(buttonnode);
            divnode2.appendChild(divnode3);
            divnode2.appendChild(buttonnode2);
            divnode2.appendChild(buttonnode3);
            divnode2.appendChild(buttonnode4);
            divnode2.appendChild(buttonnode5);
            divnode2.appendChild(buttonnode6);
            divnode2.appendChild(buttonnode7);
            bodyNode.appendChild(divnode1);
            bodyNode.appendChild(divnode2);
            bodyNode.appendChild(buttonnode8);
            bodyNode.appendChild(inputnode1);
            bodyNode.appendChild(inputnode2);
            bodyNode.appendChild(inputnode3);

            domNodeToVNode(bodyNode);
        });

        it(':checked', function () {
            bodyNode.vnode.matchesSelector(':checked').should.be.false;
            divnode1.vnode.matchesSelector(':checked').should.be.false;
            divnode2.vnode.matchesSelector(':checked').should.be.false;
            divnode3.vnode.matchesSelector(':checked').should.be.false;
            buttonnode.vnode.matchesSelector(':checked').should.be.false;
            buttonnode2.vnode.matchesSelector(':checked').should.be.false;
            buttonnode3.vnode.matchesSelector(':checked').should.be.false;
            buttonnode4.vnode.matchesSelector(':checked').should.be.false;
            buttonnode5.vnode.matchesSelector(':checked').should.be.false;
            buttonnode6.vnode.matchesSelector(':checked').should.be.false;
            buttonnode7.vnode.matchesSelector(':checked').should.be.false;
            buttonnode8.vnode.matchesSelector(':checked').should.be.false;
            inputnode1.vnode.matchesSelector(':checked').should.be.true;
            inputnode2.vnode.matchesSelector(':checked').should.be.false;
            inputnode3.vnode.matchesSelector(':checked').should.be.false;

            inputnode1.vnode.matchesSelector('input:checked').should.be.true;
            inputnode1.vnode.matchesSelector('#input1:checked').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody #input1:checked').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input:checked').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody :checked').should.be.true;
        });

        it(':disabled', function () {
            bodyNode.vnode.matchesSelector(':disabled').should.be.false;
            divnode1.vnode.matchesSelector(':disabled').should.be.false;
            divnode2.vnode.matchesSelector(':disabled').should.be.false;
            divnode3.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode2.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode3.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode4.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode5.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode6.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode7.vnode.matchesSelector(':disabled').should.be.false;
            buttonnode8.vnode.matchesSelector(':disabled').should.be.false;
            inputnode1.vnode.matchesSelector(':disabled').should.be.false;
            inputnode2.vnode.matchesSelector(':disabled').should.be.false;
            inputnode3.vnode.matchesSelector(':disabled').should.be.true;

            inputnode3.vnode.matchesSelector('input:disabled').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:disabled').should.be.true;
            inputnode3.vnode.matchesSelector('input#input3:disabled').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody #input3:disabled').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:disabled').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody :disabled').should.be.true;

            inputnode2.vnode.matchesSelector('input:disabled').should.be.false;
            inputnode2.vnode.matchesSelector('#input2:disabled').should.be.false;
            inputnode2.vnode.matchesSelector('input#input2:disabled').should.be.false;
            inputnode2.vnode.matchesSelector('#fakebody #input2:disabled').should.be.false;
            inputnode2.vnode.matchesSelector('#fakebody input:disabled').should.be.false;
            inputnode2.vnode.matchesSelector('#fakebody :disabled').should.be.false;
        });

        it(':empty', function () {
            bodyNode.vnode.matchesSelector(':empty').should.be.false;
            divnode1.vnode.matchesSelector(':empty').should.be.true;
            divnode2.vnode.matchesSelector(':empty').should.be.false;
            divnode3.vnode.matchesSelector(':empty').should.be.false;
            buttonnode.vnode.matchesSelector(':empty').should.be.true;
            buttonnode2.vnode.matchesSelector(':empty').should.be.true;
            buttonnode3.vnode.matchesSelector(':empty').should.be.true;
            buttonnode4.vnode.matchesSelector(':empty').should.be.true;
            buttonnode5.vnode.matchesSelector(':empty').should.be.true;
            buttonnode6.vnode.matchesSelector(':empty').should.be.true;
            buttonnode7.vnode.matchesSelector(':empty').should.be.true;
            buttonnode8.vnode.matchesSelector(':empty').should.be.true;
            inputnode1.vnode.matchesSelector(':empty').should.be.true;
            inputnode2.vnode.matchesSelector(':empty').should.be.true;
            inputnode3.vnode.matchesSelector(':empty').should.be.true;

            divnode1.vnode.matchesSelector('#fakebody :empty').should.be.true;
            divnode1.vnode.matchesSelector('#fakebody #div1:empty').should.be.true;
            divnode1.vnode.matchesSelector('#fakebody div:empty').should.be.true;
            divnode1.vnode.matchesSelector('#fakebody div#div1:empty').should.be.true;
            divnode3.vnode.matchesSelector('#fakebody :empty').should.be.false;
            divnode3.vnode.matchesSelector('#fakebody #div3:empty').should.be.false;
            divnode3.vnode.matchesSelector('#fakebody div:empty').should.be.false;
            divnode3.vnode.matchesSelector('#fakebody div#div3:empty').should.be.false;
        });

        it(':enabled', function () {
            bodyNode.vnode.matchesSelector(':enabled').should.be.true;
            divnode1.vnode.matchesSelector(':enabled').should.be.true;
            divnode2.vnode.matchesSelector(':enabled').should.be.true;
            divnode3.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode2.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode3.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode4.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode5.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode6.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode7.vnode.matchesSelector(':enabled').should.be.true;
            buttonnode8.vnode.matchesSelector(':enabled').should.be.true;
            inputnode1.vnode.matchesSelector(':enabled').should.be.true;
            inputnode2.vnode.matchesSelector(':enabled').should.be.true;
            inputnode3.vnode.matchesSelector(':enabled').should.be.false;

            inputnode3.vnode.matchesSelector('input:enabled').should.be.false;
            inputnode3.vnode.matchesSelector('#input1:enabled').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody #input1:enabled').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input:enabled').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody :enabled').should.be.false;
        });

        it(':first-child', function () {
            bodyNode.vnode.matchesSelector(':first-child').should.be.false;
            divnode1.vnode.matchesSelector(':first-child').should.be.true;
            divnode2.vnode.matchesSelector(':first-child').should.be.false;
            divnode3.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode.vnode.matchesSelector(':first-child').should.be.true;
            buttonnode2.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode3.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode4.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode5.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode6.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode7.vnode.matchesSelector(':first-child').should.be.false;
            buttonnode8.vnode.matchesSelector(':first-child').should.be.false;
            inputnode1.vnode.matchesSelector(':first-child').should.be.false;
            inputnode2.vnode.matchesSelector(':first-child').should.be.false;
            inputnode3.vnode.matchesSelector(':first-child').should.be.false;

            divnode1.vnode.matchesSelector('div:first-child').should.be.true;
            divnode1.vnode.matchesSelector('#div1:first-child').should.be.true;
            divnode1.vnode.matchesSelector('div#div1:first-child').should.be.true;
            divnode1.vnode.matchesSelector('#fakebody :first-child').should.be.true;
            divnode1.vnode.matchesSelector('#fakebody div:first-child').should.be.true;
            divnode1.vnode.matchesSelector('#fakebody div#div1:first-child').should.be.true;

            divnode3.vnode.matchesSelector('div:first-child').should.be.false;
            divnode3.vnode.matchesSelector('#div3:first-child').should.be.false;
            divnode3.vnode.matchesSelector('div#div3:first-child').should.be.false;
            divnode3.vnode.matchesSelector('#fakebody :first-child').should.be.false;
            divnode3.vnode.matchesSelector('#fakebody div:first-child').should.be.false;
            divnode3.vnode.matchesSelector('#fakebody div#div3:first-child').should.be.false;
        });

        it(':first-of-type', function () {
            bodyNode.vnode.matchesSelector(':first-of-type').should.be.false;
            divnode1.vnode.matchesSelector(':first-of-type').should.be.true;
            divnode2.vnode.matchesSelector(':first-of-type').should.be.false;
            divnode3.vnode.matchesSelector(':first-of-type').should.be.true;
            buttonnode.vnode.matchesSelector(':first-of-type').should.be.true;
            buttonnode2.vnode.matchesSelector(':first-of-type').should.be.false;
            buttonnode3.vnode.matchesSelector(':first-of-type').should.be.false;
            buttonnode4.vnode.matchesSelector(':first-of-type').should.be.false;
            buttonnode5.vnode.matchesSelector(':first-of-type').should.be.false;
            buttonnode6.vnode.matchesSelector(':first-of-type').should.be.false;
            buttonnode7.vnode.matchesSelector(':first-of-type').should.be.false;
            buttonnode8.vnode.matchesSelector(':first-of-type').should.be.true;
            inputnode1.vnode.matchesSelector(':first-of-type').should.be.true;
            inputnode2.vnode.matchesSelector(':first-of-type').should.be.false;
            inputnode3.vnode.matchesSelector(':first-of-type').should.be.false;

            inputnode1.vnode.matchesSelector('input:first-of-type').should.be.true;
            inputnode1.vnode.matchesSelector('#input1:first-of-type').should.be.true;
            inputnode1.vnode.matchesSelector('input#input1:first-of-type').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input:first-of-type').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody #input1:first-of-type').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:first-of-type').should.be.true;

            inputnode3.vnode.matchesSelector('input:first-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#input3:first-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('input#input3:first-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input:first-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody #input3:first-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:first-of-type').should.be.false;
        });

        it(':in-range', function () {
            bodyNode.vnode.matchesSelector(':in-range').should.be.false;
            divnode1.vnode.matchesSelector(':in-range').should.be.false;
            divnode2.vnode.matchesSelector(':in-range').should.be.false;
            divnode3.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode2.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode3.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode4.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode5.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode6.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode7.vnode.matchesSelector(':in-range').should.be.false;
            buttonnode8.vnode.matchesSelector(':in-range').should.be.false;
            inputnode1.vnode.matchesSelector(':in-range').should.be.true;
            inputnode2.vnode.matchesSelector(':in-range').should.be.false;
            inputnode3.vnode.matchesSelector(':in-range').should.be.false;

            inputnode1.vnode.matchesSelector('input:in-range').should.be.true;
            inputnode1.vnode.matchesSelector('#input1:in-range').should.be.true;
            inputnode1.vnode.matchesSelector('input#input1:in-range').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input:in-range').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody #input1:in-range').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:in-range').should.be.true;

            inputnode3.vnode.matchesSelector('input:in-range').should.be.false;
            inputnode3.vnode.matchesSelector('#input3:in-range').should.be.false;
            inputnode3.vnode.matchesSelector('input#input3:in-range').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input:in-range').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody #input3:in-range').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:in-range').should.be.false;
        });

        it(':lang(nl)', function () {
            bodyNode.vnode.matchesSelector(':lang(nl)').should.be.false;
            divnode1.vnode.matchesSelector(':lang(nl)').should.be.false;
            divnode2.vnode.matchesSelector(':lang(nl)').should.be.false;
            divnode3.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode2.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode3.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode4.vnode.matchesSelector(':lang(nl)').should.be.true;
            buttonnode5.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode6.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode7.vnode.matchesSelector(':lang(nl)').should.be.false;
            buttonnode8.vnode.matchesSelector(':lang(nl)').should.be.false;
            inputnode1.vnode.matchesSelector(':lang(nl)').should.be.false;
            inputnode2.vnode.matchesSelector(':lang(nl)').should.be.false;
            inputnode3.vnode.matchesSelector(':lang(nl)').should.be.false;

            buttonnode4.vnode.matchesSelector(':lang(n)').should.be.false;
            buttonnode4.vnode.matchesSelector(':lang(l)').should.be.false;

            buttonnode4.vnode.matchesSelector('button:lang(nl)').should.be.true;
            buttonnode4.vnode.matchesSelector('#button4:lang(nl)').should.be.true;
            buttonnode4.vnode.matchesSelector('button#button4:lang(nl)').should.be.true;
            buttonnode4.vnode.matchesSelector('#fakebody button:lang(nl)').should.be.true;
            buttonnode4.vnode.matchesSelector('#fakebody #button4:lang(nl)').should.be.true;
            buttonnode4.vnode.matchesSelector('#fakebody button#button4:lang(nl)').should.be.true;

            buttonnode5.vnode.matchesSelector('button:lang(nl)').should.be.false;
            buttonnode5.vnode.matchesSelector('#button5:lang(nl)').should.be.false;
            buttonnode5.vnode.matchesSelector('button#button5:lang(nl)').should.be.false;
            buttonnode5.vnode.matchesSelector('#fakebody button:lang(nl)').should.be.false;
            buttonnode5.vnode.matchesSelector('#fakebody #button5:lang(nl)').should.be.false;
            buttonnode5.vnode.matchesSelector('#fakebody button#button5:lang(nl)').should.be.false;
        });

        it(':last-child', function () {
            bodyNode.vnode.matchesSelector(':last-child').should.be.false;
            divnode1.vnode.matchesSelector(':last-child').should.be.false;
            divnode2.vnode.matchesSelector(':last-child').should.be.false;
            divnode3.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode2.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode3.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode4.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode5.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode6.vnode.matchesSelector(':last-child').should.be.false;
            buttonnode7.vnode.matchesSelector(':last-child').should.be.true;
            buttonnode8.vnode.matchesSelector(':last-child').should.be.false;
            inputnode1.vnode.matchesSelector(':last-child').should.be.false;
            inputnode2.vnode.matchesSelector(':last-child').should.be.false;
            inputnode3.vnode.matchesSelector(':last-child').should.be.true;

            inputnode3.vnode.matchesSelector('input:last-child').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:last-child').should.be.true;
            inputnode3.vnode.matchesSelector('input#input3:last-child').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody :last-child').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:last-child').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:last-child').should.be.true;

            inputnode2.vnode.matchesSelector('input:last-child').should.be.false;
            inputnode2.vnode.matchesSelector('#input2:last-child').should.be.false;
            inputnode2.vnode.matchesSelector('input#input2:last-child').should.be.false;
            inputnode2.vnode.matchesSelector('#fakebody :last-child').should.be.false;
            inputnode2.vnode.matchesSelector('#fakebody input:last-child').should.be.false;
            inputnode2.vnode.matchesSelector('#fakebody input#input2:last-child').should.be.false;

        });

        it(':last-of-type', function () {
            bodyNode.vnode.matchesSelector(':last-of-type').should.be.false;
            divnode1.vnode.matchesSelector(':last-of-type').should.be.false;
            divnode2.vnode.matchesSelector(':last-of-type').should.be.true;
            divnode3.vnode.matchesSelector(':last-of-type').should.be.true;
            buttonnode.vnode.matchesSelector(':last-of-type').should.be.false;
            buttonnode2.vnode.matchesSelector(':last-of-type').should.be.false;
            buttonnode3.vnode.matchesSelector(':last-of-type').should.be.false;
            buttonnode4.vnode.matchesSelector(':last-of-type').should.be.false;
            buttonnode5.vnode.matchesSelector(':last-of-type').should.be.false;
            buttonnode6.vnode.matchesSelector(':last-of-type').should.be.false;
            buttonnode7.vnode.matchesSelector(':last-of-type').should.be.true;
            buttonnode8.vnode.matchesSelector(':last-of-type').should.be.true;
            inputnode1.vnode.matchesSelector(':last-of-type').should.be.false;
            inputnode2.vnode.matchesSelector(':last-of-type').should.be.false;
            inputnode3.vnode.matchesSelector(':last-of-type').should.be.true;

            inputnode1.vnode.matchesSelector('input:last-of-type').should.be.false;
            inputnode1.vnode.matchesSelector('#input1:last-of-type').should.be.false;
            inputnode1.vnode.matchesSelector('input#input1:last-of-type').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input:last-of-type').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody #input1:last-of-type').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:last-of-type').should.be.false;

            inputnode3.vnode.matchesSelector('input:last-of-type').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:last-of-type').should.be.true;
            inputnode3.vnode.matchesSelector('input#input3:last-of-type').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:last-of-type').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody #input3:last-of-type').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:last-of-type').should.be.true;
        });

        it(':not()', function () {
            divnode1.vnode.matchesSelector(':not(div)').should.be.false;
            buttonnode.vnode.matchesSelector(':not(div)').should.be.true;

            divnode1.vnode.matchesSelector(':not(.class1)').should.be.false;
            divnode1.vnode.matchesSelector(':not(.class2)').should.be.true;
            buttonnode2.vnode.matchesSelector(':not([data-x="some   data"])').should.be.false;
            buttonnode3.vnode.matchesSelector(':not([data-x="some   data"])').should.be.true;
            buttonnode2.vnode.matchesSelector(':not([data-x="some   data"].class2)').should.be.false;
            buttonnode3.vnode.matchesSelector(':not([data-x="some   data"].class2)').should.be.true;
            buttonnode2.vnode.matchesSelector(':not([data-x="some   data"].class3)').should.be.true;
            buttonnode3.vnode.matchesSelector(':not([data-x="some   data"].class3)').should.be.true;

            divnode1.vnode.matchesSelector('div:not(.class1)').should.be.false;
            divnode1.vnode.matchesSelector('div:not(.class2)').should.be.true;
            buttonnode2.vnode.matchesSelector('button:not([data-x="some   data"])').should.be.false;
            buttonnode3.vnode.matchesSelector('button:not([data-x="some   data"])').should.be.true;
            buttonnode2.vnode.matchesSelector('button:not([data-x="some   data"].class2)').should.be.false;
            buttonnode3.vnode.matchesSelector('button:not([data-x="some   data"].class2)').should.be.true;
            buttonnode2.vnode.matchesSelector('button:not([data-x="some   data"].class3)').should.be.true;
            buttonnode3.vnode.matchesSelector('button:not([data-x="some   data"].class3)').should.be.true;

            divnode1.vnode.matchesSelector('#fakebody div:not(.class1)').should.be.false;
            divnode1.vnode.matchesSelector('#fakebody div:not(.class2)').should.be.true;
            buttonnode2.vnode.matchesSelector('#fakebody button:not([data-x="some   data"])').should.be.false;
            buttonnode3.vnode.matchesSelector('#fakebody button:not([data-x="some   data"])').should.be.true;
            buttonnode2.vnode.matchesSelector('#fakebody button:not([data-x="some   data"].class2)').should.be.false;
            buttonnode3.vnode.matchesSelector('#fakebody button:not([data-x="some   data"].class2)').should.be.true;
            buttonnode2.vnode.matchesSelector('#fakebody button:not([data-x="some   data"].class3)').should.be.true;
            buttonnode3.vnode.matchesSelector('#fakebody button:not([data-x="some   data"].class3)').should.be.true;

            buttonnode.vnode.matchesSelector('#fakebody div:not(.class1) button').should.be.true;
            buttonnode.vnode.matchesSelector('#fakebody div:not(.class2) button').should.be.false;

            buttonnode.vnode.matchesSelector('#fakebody div:not(.class1, class2) button').should.be.false;
        });

        it(':nth-child', function () {

            buttonnode.vnode.matchesSelector('#div2 :nth-child(even)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-child(even)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(even)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(even)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(even)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(even)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(even)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(even)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-child(even)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-child(even)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.true;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(odd)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 div:nth-child(odd)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 div:nth-child(odd)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.true;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-child(odd)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(3)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(3)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-child(3)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 div:nth-child(3)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-child(3)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(3n)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-child(3n)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 div:nth-child(3n)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-child(3n)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(3n-1)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-child(3n-1)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 div:nth-child(3n-1)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-child(3n-1)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(4n)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.true;
            buttonnode7.vnode.matchesSelector('#div2 :nth-child(4n-1)').should.be.false;
        });

        it(':nth-last-child', function () {

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.true;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(even)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 div:nth-last-child(even)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 div:nth-last-child(even)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.true;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-last-child(even)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(odd)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-last-child(odd)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 div:nth-last-child(odd)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-last-child(odd)').should.be.true;

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(3)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-last-child(3)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 div:nth-last-child(3)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-last-child(3)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(3n)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 div:nth-last-child(3n)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.true;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 div:nth-last-child(3n)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-last-child(3n)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.true;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(3n-1)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 div:nth-last-child(3n-1)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.true;
            buttonnode4.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 div:nth-last-child(3n-1)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 button:nth-last-child(3n-1)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.true;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.false;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.true;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.false;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(4n)').should.be.false;

            buttonnode.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.false;
            divnode3.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.true;
            buttonnode2.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.false;
            buttonnode3.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.false;
            buttonnode4.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.false;
            buttonnode5.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.true;
            buttonnode6.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.false;
            buttonnode7.vnode.matchesSelector('#div2 :nth-last-child(4n-1)').should.be.false;

        });

        it(':nth-last-of-type', function () {
            bodyNode.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            divnode1.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            divnode2.vnode.matchesSelector(':nth-last-of-type(1)').should.be.true;
            divnode3.vnode.matchesSelector(':nth-last-of-type(1)').should.be.true;
            buttonnode.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            buttonnode2.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            buttonnode3.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            buttonnode4.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            buttonnode5.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            buttonnode6.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            buttonnode7.vnode.matchesSelector(':nth-last-of-type(1)').should.be.true;
            buttonnode8.vnode.matchesSelector(':nth-last-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            inputnode2.vnode.matchesSelector(':nth-last-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector(':nth-last-of-type(1)').should.be.true;

            inputnode1.vnode.matchesSelector('input:nth-last-of-type(1)').should.be.false;
            inputnode1.vnode.matchesSelector('#input1:nth-last-of-type(1)').should.be.false;
            inputnode1.vnode.matchesSelector('input#input1:nth-last-of-type(1)').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input:nth-last-of-type(1)').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody #input1:nth-last-of-type(1)').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:nth-last-of-type(1)').should.be.false;

            inputnode3.vnode.matchesSelector('input:nth-last-of-type(1)').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:nth-last-of-type(1)').should.be.true;
            inputnode3.vnode.matchesSelector('input#input3:nth-last-of-type(1)').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:nth-last-of-type(1)').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody #input3:nth-last-of-type(1)').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:nth-last-of-type(1)').should.be.true;

            bodyNode.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            divnode1.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            divnode2.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            divnode3.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode2.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode3.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode4.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode5.vnode.matchesSelector(':nth-last-of-type(3)').should.be.true;
            buttonnode6.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode7.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            buttonnode8.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector(':nth-last-of-type(3)').should.be.true;
            inputnode2.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector(':nth-last-of-type(3)').should.be.false;

            inputnode1.vnode.matchesSelector('input:nth-last-of-type(3)').should.be.true;
            inputnode1.vnode.matchesSelector('#input1:nth-last-of-type(3)').should.be.true;
            inputnode1.vnode.matchesSelector('input#input1:nth-last-of-type(3)').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input:nth-last-of-type(3)').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody #input1:nth-last-of-type(3)').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:nth-last-of-type(3)').should.be.true;

            inputnode3.vnode.matchesSelector('input:nth-last-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector('#input3:nth-last-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector('input#input3:nth-last-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input:nth-last-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody #input3:nth-last-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:nth-last-of-type(3)').should.be.false;
        });

        it(':nth-of-type', function () {
            bodyNode.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            divnode1.vnode.matchesSelector(':nth-of-type(1)').should.be.true;
            divnode2.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            divnode3.vnode.matchesSelector(':nth-of-type(1)').should.be.true;
            buttonnode.vnode.matchesSelector(':nth-of-type(1)').should.be.true;
            buttonnode2.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            buttonnode3.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            buttonnode4.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            buttonnode5.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            buttonnode6.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            buttonnode7.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            buttonnode8.vnode.matchesSelector(':nth-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector(':nth-of-type(1)').should.be.true;
            inputnode2.vnode.matchesSelector(':nth-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector(':nth-of-type(1)').should.be.false;

            inputnode1.vnode.matchesSelector('input:nth-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector('#input1:nth-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector('input#input1:nth-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input:nth-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody #input1:nth-of-type(1)').should.be.true;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:nth-of-type(1)').should.be.true;

            inputnode3.vnode.matchesSelector('input:nth-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector('#input3:nth-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector('input#input3:nth-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input:nth-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody #input3:nth-of-type(1)').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:nth-of-type(1)').should.be.false;

            bodyNode.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            divnode1.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            divnode2.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            divnode3.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode2.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode3.vnode.matchesSelector(':nth-of-type(3)').should.be.true;
            buttonnode4.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode5.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode6.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode7.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            buttonnode8.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            inputnode2.vnode.matchesSelector(':nth-of-type(3)').should.be.false;
            inputnode3.vnode.matchesSelector(':nth-of-type(3)').should.be.true;

            inputnode1.vnode.matchesSelector('input:nth-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector('#input1:nth-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector('input#input1:nth-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input:nth-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody #input1:nth-of-type(3)').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:nth-of-type(3)').should.be.false;

            inputnode3.vnode.matchesSelector('input:nth-of-type(3)').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:nth-of-type(3)').should.be.true;
            inputnode3.vnode.matchesSelector('input#input3:nth-of-type(3)').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:nth-of-type(3)').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody #input3:nth-of-type(3)').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:nth-of-type(3)').should.be.true;
        });

        it(':only-of-type', function () {
            bodyNode.vnode.matchesSelector(':only-of-type').should.be.false;
            divnode1.vnode.matchesSelector(':only-of-type').should.be.false;
            divnode2.vnode.matchesSelector(':only-of-type').should.be.false;
            divnode3.vnode.matchesSelector(':only-of-type').should.be.true;
            buttonnode.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode2.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode3.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode4.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode5.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode6.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode7.vnode.matchesSelector(':only-of-type').should.be.false;
            buttonnode8.vnode.matchesSelector(':only-of-type').should.be.true;
            inputnode1.vnode.matchesSelector(':only-of-type').should.be.false;
            inputnode2.vnode.matchesSelector(':only-of-type').should.be.false;
            inputnode3.vnode.matchesSelector(':only-of-type').should.be.false;

            buttonnode8.vnode.matchesSelector('button:only-of-type').should.be.true;
            buttonnode8.vnode.matchesSelector('#button8:only-of-type').should.be.true;
            buttonnode8.vnode.matchesSelector('button#button8:only-of-type').should.be.true;
            buttonnode8.vnode.matchesSelector('#fakebody button:only-of-type').should.be.true;
            buttonnode8.vnode.matchesSelector('#fakebody #button8:only-of-type').should.be.true;
            buttonnode8.vnode.matchesSelector('#fakebody button#button8:only-of-type').should.be.true;

            inputnode3.vnode.matchesSelector('input:only-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#input3:only-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('input#input3:only-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input:only-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody #input3:only-of-type').should.be.false;
            inputnode3.vnode.matchesSelector('#fakebody input#input3:only-of-type').should.be.false;
        });

        it(':only-child', function () {
            var bodyNodeTMP = DOCUMENT.createElement('div'),
                divnodeTMP = DOCUMENT.createElement('div');
            bodyNodeTMP.appendChild(divnodeTMP);
            domNodeToVNode(bodyNodeTMP);
            divnodeTMP.vnode.matchesSelector(':only-child').should.be.true;

            bodyNode.vnode.matchesSelector(':only-child').should.be.false;
            divnode1.vnode.matchesSelector(':only-child').should.be.false;
            divnode2.vnode.matchesSelector(':only-child').should.be.false;
            divnode3.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode2.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode3.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode4.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode5.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode6.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode7.vnode.matchesSelector(':only-child').should.be.false;
            buttonnode8.vnode.matchesSelector(':only-child').should.be.false;
            inputnode1.vnode.matchesSelector(':only-child').should.be.false;
            inputnode2.vnode.matchesSelector(':only-child').should.be.false;
            inputnode3.vnode.matchesSelector(':only-child').should.be.false;

        });

        it(':optional', function () {
            bodyNode.vnode.matchesSelector(':optional').should.be.true;
            divnode1.vnode.matchesSelector(':optional').should.be.true;
            divnode2.vnode.matchesSelector(':optional').should.be.true;
            divnode3.vnode.matchesSelector(':optional').should.be.true;
            buttonnode.vnode.matchesSelector(':optional').should.be.true;
            buttonnode2.vnode.matchesSelector(':optional').should.be.true;
            buttonnode3.vnode.matchesSelector(':optional').should.be.true;
            buttonnode4.vnode.matchesSelector(':optional').should.be.true;
            buttonnode5.vnode.matchesSelector(':optional').should.be.true;
            buttonnode6.vnode.matchesSelector(':optional').should.be.true;
            buttonnode7.vnode.matchesSelector(':optional').should.be.true;
            buttonnode8.vnode.matchesSelector(':optional').should.be.true;
            inputnode1.vnode.matchesSelector(':optional').should.be.true;
            inputnode2.vnode.matchesSelector(':optional').should.be.false;
            inputnode3.vnode.matchesSelector(':optional').should.be.true;

            inputnode3.vnode.matchesSelector('input:optional').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:optional').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody #input3:optional').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:optional').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody :optional').should.be.true;
        });

        it(':read-only', function () {
            bodyNode.vnode.matchesSelector(':read-only').should.be.false;
            divnode1.vnode.matchesSelector(':read-only').should.be.false;
            divnode2.vnode.matchesSelector(':read-only').should.be.false;
            divnode3.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode2.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode3.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode4.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode5.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode6.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode7.vnode.matchesSelector(':read-only').should.be.false;
            buttonnode8.vnode.matchesSelector(':read-only').should.be.false;
            inputnode1.vnode.matchesSelector(':read-only').should.be.false;
            inputnode2.vnode.matchesSelector(':read-only').should.be.true;
            inputnode3.vnode.matchesSelector(':read-only').should.be.false;

            inputnode2.vnode.matchesSelector('input:read-only').should.be.true;
            inputnode2.vnode.matchesSelector('#input2:read-only').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody #input2:read-only').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody input:read-only').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody :read-only').should.be.true;
        });

        it(':out-of-range', function () {
            bodyNode.vnode.matchesSelector(':out-of-range').should.be.false;
            divnode1.vnode.matchesSelector(':out-of-range').should.be.false;
            divnode2.vnode.matchesSelector(':out-of-range').should.be.false;
            divnode3.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode2.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode3.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode4.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode5.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode6.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode7.vnode.matchesSelector(':out-of-range').should.be.false;
            buttonnode8.vnode.matchesSelector(':out-of-range').should.be.false;
            inputnode1.vnode.matchesSelector(':out-of-range').should.be.false;
            inputnode2.vnode.matchesSelector(':out-of-range').should.be.true;
            inputnode3.vnode.matchesSelector(':out-of-range').should.be.false;

            inputnode1.vnode.matchesSelector('input:out-of-range').should.be.false;
            inputnode1.vnode.matchesSelector('#input1:out-of-range').should.be.false;
            inputnode1.vnode.matchesSelector('input#input1:out-of-range').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input:out-of-range').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody #input1:out-of-range').should.be.false;
            inputnode1.vnode.matchesSelector('#fakebody input#input1:out-of-range').should.be.false;

            inputnode2.vnode.matchesSelector('input:out-of-range').should.be.true;
            inputnode2.vnode.matchesSelector('#input2:out-of-range').should.be.true;
            inputnode2.vnode.matchesSelector('input#input2:out-of-range').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody input:out-of-range').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody #input2:out-of-range').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody input#input2:out-of-range').should.be.true;
        });

        it(':read-write', function () {
            bodyNode.vnode.matchesSelector(':read-write').should.be.true;
            divnode1.vnode.matchesSelector(':read-write').should.be.true;
            divnode2.vnode.matchesSelector(':read-write').should.be.true;
            divnode3.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode2.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode3.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode4.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode5.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode6.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode7.vnode.matchesSelector(':read-write').should.be.true;
            buttonnode8.vnode.matchesSelector(':read-write').should.be.true;
            inputnode1.vnode.matchesSelector(':read-write').should.be.true;
            inputnode2.vnode.matchesSelector(':read-write').should.be.false;
            inputnode3.vnode.matchesSelector(':read-write').should.be.true;

            inputnode3.vnode.matchesSelector('input:read-write').should.be.true;
            inputnode3.vnode.matchesSelector('#input3:read-write').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody #input3:read-write').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody input:read-write').should.be.true;
            inputnode3.vnode.matchesSelector('#fakebody :read-write').should.be.true;
        });

        it(':required', function () {
            bodyNode.vnode.matchesSelector(':required').should.be.false;
            divnode1.vnode.matchesSelector(':required').should.be.false;
            divnode2.vnode.matchesSelector(':required').should.be.false;
            divnode3.vnode.matchesSelector(':required').should.be.false;
            buttonnode.vnode.matchesSelector(':required').should.be.false;
            buttonnode2.vnode.matchesSelector(':required').should.be.false;
            buttonnode3.vnode.matchesSelector(':required').should.be.false;
            buttonnode4.vnode.matchesSelector(':required').should.be.false;
            buttonnode5.vnode.matchesSelector(':required').should.be.false;
            buttonnode6.vnode.matchesSelector(':required').should.be.false;
            buttonnode7.vnode.matchesSelector(':required').should.be.false;
            buttonnode8.vnode.matchesSelector(':required').should.be.false;
            inputnode1.vnode.matchesSelector(':required').should.be.false;
            inputnode2.vnode.matchesSelector(':required').should.be.true;
            inputnode3.vnode.matchesSelector(':required').should.be.false;

            inputnode2.vnode.matchesSelector('input:required').should.be.true;
            inputnode2.vnode.matchesSelector('#input2:required').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody #input2:required').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody input:required').should.be.true;
            inputnode2.vnode.matchesSelector('#fakebody :required').should.be.true;
        });

    });

}(global.window || require('node-win')));