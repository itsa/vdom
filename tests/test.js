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

    describe('vnode setters', function () {

        // nodeRoot looks like this:
        /*
        <div class="blueroot">
            <div class="blues1"></div>
            <div class="blues2">
                <div class="bluesub"></div>
            </div>
            <div></div>
        </div>
        */

        beforeEach(function() {
            nodeRoot = DOCUMENT.createElement('div');
            nodeRoot.className = 'blueroot';

            nodeS1 = DOCUMENT.createElement('div');
            nodeS1.className = 'blues1';
            nodeRoot.appendChild(nodeS1);

            nodeS2 = DOCUMENT.createElement('div');
            nodeS2.className = 'blues2';
            nodeRoot.appendChild(nodeS2);

            nodeS3 = DOCUMENT.createElement('div');
            nodeS3.className = 'blues3';
            nodeRoot.appendChild(nodeS3);

            nodeSub = DOCUMENT.createElement('div');
            nodeSub.className = 'bluesub';
            nodeS2.appendChild(nodeSub);

            vnodeS = domNodeToVNode(nodeRoot);
        });

        it('innerHTML test 1', function () {
            nodeRoot.vnode.innerHTML = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            expect(nodeRoot.vnode.vChildren[0].vChildren.length).to.be.eql(3);
            expect(nodeRoot.innerHTML).to.be.eql(nodeRoot.vnode.innerHTML);
            // expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><ul class="purple cyan"><li>first</li><li class="grey">second</li><li>third</li></ul></div>');
        });

    });

}(global.window || require('node-win')));