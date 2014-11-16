/*global describe, it, before, beforeEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        domNodeToVNode = require("../lib/node-parser.js")(window),
        NS = require('../lib/vdom-ns.js')(window),
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

    //===============================================================

    describe('Properties vnode', function () {

        it('attrs', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', 'data-x': 'somedata'});
        });

        it('classNames', function () {
            var vchild = vnode.vChildNodes[0],
                vchildtext = vnode.vChildNodes[1];
            expect(vnode.attrs['class']).to.be.eql('red blue');
            expect(vnode.classNames.red).to.be.true;
            expect(vnode.classNames.blue).to.be.true;
            expect(vnode.classNames.green===undefined).to.be.true;
                expect(vchild.attrs['class']).to.be.eql('yellow');
                expect(vchild.classNames.red===undefined).to.be.true;
                expect(vchild.classNames.blue===undefined).to.be.true;
                expect(vchild.classNames.green===undefined).to.be.true;

                expect(vchildtext.attrs===undefined).to.be.eql(true);
                expect(vchildtext.classNames===undefined).to.be.true;
        });

        it('id', function () {
            expect(vnode.id).to.be.eql('divone');
                expect(vnode.vChildNodes[0].id).to.be.eql('imgone');
                expect(vnode.vChildNodes[1].id===undefined).to.be.true;
                expect(vnode.vChildNodes[2].id===undefined).to.be.true;
                expect(vnode.vChildNodes[3].id===undefined).to.be.true;
                expect(vnode.vChildNodes[4].id===undefined).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].id).to.be.eql('li1');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].id).to.be.eql('li2');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].id).to.be.eql('li3');
                expect(vnode.vChildNodes[5].id===undefined).to.be.true;
        });

        it('innerHTML', function () {
            expect(vnode.innerHTML).to.be.eql('<img id="imgone" alt="http://google.com/img1.jpg" class="yellow">'+
                                              'just a textnode'+
                                              '<!--just a commentnode-->'+
                                              'just a second textnode'+
                                              '<div>'+
                                              '<ul>'+
                                              '<li id="li1">first</li>'+
                                              '<li id="li2">second</li>'+
                                              '<li id="li3"></li>'+
                                              '</ul>'+
                                              '</div>'+
                                              '<div>'+
                                                  '<div></div>'+
                                                  'some text'+
                                              '</div>');
            expect(vnode.vChildNodes[0].innerHTML).to.be.eql('');
            expect(vnode.vChildNodes[1].innerHTML===undefined).to.be.true;
            expect(vnode.vChildNodes[2].innerHTML===undefined).to.be.true;
            expect(vnode.vChildNodes[3].innerHTML===undefined).to.be.true;
            expect(vnode.vChildNodes[4].innerHTML).to.be.eql('<ul>'+
                                                              '<li id="li1">first</li>'+
                                                              '<li id="li2">second</li>'+
                                                              '<li id="li3"></li>'+
                                                              '</ul>');
                expect(vnode.vChildNodes[4].vChildNodes[0].innerHTML).to.be.eql('<li id="li1">first</li>'+
                                                                                  '<li id="li2">second</li>'+
                                                                                  '<li id="li3"></li>');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].innerHTML).to.be.eql('first');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].innerHTML).to.be.eql('second');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].innerHTML).to.be.eql('');
            expect(vnode.vChildNodes[5].innerHTML).to.be.eql('<div></div>some text');
        });

        it('isVoid', function () {
            expect(vnode.isVoid).to.be.false;
                expect(vnode.vChildNodes[0].isVoid).to.be.true;
                expect(vnode.vChildNodes[1].isVoid===undefined).to.be.true;
                expect(vnode.vChildNodes[2].isVoid===undefined).to.be.true;
                expect(vnode.vChildNodes[3].isVoid===undefined).to.be.true;
                expect(vnode.vChildNodes[4].isVoid).to.be.false;
                    expect(vnode.vChildNodes[4].vChildNodes[0].isVoid).to.be.false;
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].isVoid).to.be.false;
                expect(vnode.vChildNodes[5].isVoid).to.be.false;
        });

        it('nodeType', function () {
            expect(vnode.nodeType).to.be.eql(1);
                expect(vnode.vChildNodes[0].nodeType).to.be.eql(1);
                expect(vnode.vChildNodes[1].nodeType).to.be.eql(3);
                expect(vnode.vChildNodes[2].nodeType).to.be.eql(8);
                expect(vnode.vChildNodes[3].nodeType).to.be.eql(3);
                expect(vnode.vChildNodes[4].nodeType).to.be.eql(1);
                    expect(vnode.vChildNodes[4].vChildNodes[0].nodeType).to.be.eql(1);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].nodeType).to.be.eql(1);
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vChildNodes[0].nodeType).to.be.eql(3);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].nodeType).to.be.eql(1);
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vChildNodes[0].nodeType).to.be.eql(3);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].nodeType).to.be.eql(1);
                expect(vnode.vChildNodes[5].nodeType).to.be.eql(1);
                    expect(vnode.vChildNodes[5].vChildNodes[0].nodeType).to.be.eql(1);
                    expect(vnode.vChildNodes[5].vChildNodes[1].nodeType).to.be.eql(3);
        });

        it('nodeValue', function () {
            expect(vnode.nodeValue===null).to.be.true;
                expect(vnode.vChildNodes[0].nodeValue===null).to.be.true;
                expect(vnode.vChildNodes[1].nodeValue).to.be.eql('just a textnode');
                expect(vnode.vChildNodes[2].nodeValue).to.be.eql('just a commentnode');
                expect(vnode.vChildNodes[3].nodeValue).to.be.eql('just a second textnode');
                expect(vnode.vChildNodes[4].nodeValue===null).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].nodeValue===null).to.be.true;
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].nodeValue===null).to.be.true;
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vChildNodes[0].nodeValue).to.be.eql('first');
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].nodeValue===null).to.be.true;
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vChildNodes[0].nodeValue).to.be.eql('second');
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].nodeValue===null).to.be.true;
                expect(vnode.vChildNodes[5].nodeValue===null).to.be.true;
                    expect(vnode.vChildNodes[5].vChildNodes[0].nodeValue===null).to.be.true;
                    expect(vnode.vChildNodes[5].vChildNodes[1].nodeValue).to.be.eql('some text');
        });

        it('outerHTML', function () {
            expect(vnode.outerHTML).to.be.eql('<div id="divone" class="red blue" data-x="somedata">'+
                                              '<img id="imgone" alt="http://google.com/img1.jpg" class="yellow">'+
                                              'just a textnode'+
                                              '<!--just a commentnode-->'+
                                              'just a second textnode'+
                                              '<div>'+
                                              '<ul>'+
                                              '<li id="li1">first</li>'+
                                              '<li id="li2">second</li>'+
                                              '<li id="li3"></li>'+
                                              '</ul>'+
                                              '</div>'+
                                              '<div>'+
                                                  '<div></div>'+
                                                  'some text'+
                                              '</div>'+
                                              '</div>');
            expect(vnode.vChildNodes[0].outerHTML).to.be.eql('<img id="imgone" alt="http://google.com/img1.jpg" class="yellow">');
            expect(vnode.vChildNodes[1].outerHTML===undefined).to.be.true;
            expect(vnode.vChildNodes[2].outerHTML===undefined).to.be.true;
            expect(vnode.vChildNodes[3].outerHTML===undefined).to.be.true;
            expect(vnode.vChildNodes[4].outerHTML).to.be.eql('<div>'+
                                                              '<ul>'+
                                                              '<li id="li1">first</li>'+
                                                              '<li id="li2">second</li>'+
                                                              '<li id="li3"></li>'+
                                                              '</ul>'+
                                                              '</div>');
                expect(vnode.vChildNodes[4].vChildNodes[0].outerHTML).to.be.eql('<ul>'+
                                                                                  '<li id="li1">first</li>'+
                                                                                  '<li id="li2">second</li>'+
                                                                                  '<li id="li3"></li>'+
                                                                                  '</ul>');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].outerHTML).to.be.eql('<li id="li1">first</li>');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].outerHTML).to.be.eql('<li id="li2">second</li>');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].outerHTML).to.be.eql('<li id="li3"></li>');
            expect(vnode.vChildNodes[5].outerHTML).to.be.eql('<div><div></div>some text</div>');
        });

        it('tag', function () {
            expect(vnode.tag).to.be.eql('DIV');
                expect(vnode.vChildNodes[0].tag).to.be.eql('IMG');
                expect(vnode.vChildNodes[1].tag===undefined).to.be.true;
                expect(vnode.vChildNodes[2].tag===undefined).to.be.true;
                expect(vnode.vChildNodes[3].tag===undefined).to.be.true;
                expect(vnode.vChildNodes[4].tag).to.be.eql('DIV');
                    expect(vnode.vChildNodes[4].vChildNodes[0].tag).to.be.eql('UL');
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].tag).to.be.eql('LI');
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vChildNodes[0].tag===undefined).to.be.true;
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].tag).to.be.eql('LI');
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vChildNodes[0].tag===undefined).to.be.true;
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].tag).to.be.eql('LI');
                expect(vnode.vChildNodes[5].tag).to.be.eql('DIV');
                    expect(vnode.vChildNodes[5].vChildNodes[0].tag).to.be.eql('DIV');
                    expect(vnode.vChildNodes[5].vChildNodes[1].tag===undefined).to.be.true;
        });

        it('text', function () {
            expect(vnode.text===undefined).to.be.true;
                expect(vnode.vChildNodes[0].text===undefined).to.be.true;
                expect(vnode.vChildNodes[1].text).to.be.eql('just a textnode');
                expect(vnode.vChildNodes[2].text).to.be.eql('just a commentnode');
                expect(vnode.vChildNodes[3].text).to.be.eql('just a second textnode');
                expect(vnode.vChildNodes[4].text===undefined).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].text===undefined).to.be.true;
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].text===undefined).to.be.true;
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vChildNodes[0].text).to.be.eql('first');
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].text===undefined).to.be.true;
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vChildNodes[0].text).to.be.eql('second');
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].text===undefined).to.be.true;
                expect(vnode.vChildNodes[5].text===undefined).to.be.true;
                    expect(vnode.vChildNodes[5].vChildNodes[0].text===undefined).to.be.true;
                    expect(vnode.vChildNodes[5].vChildNodes[1].text).to.be.eql('some text');
        });

        it('textContent', function () {
            expect(vnode.textContent).to.be.eql('just a textnodejust a second textnodefirstsecondsome text');
            expect(vnode.vChildNodes[0].textContent).to.be.eql('');
            expect(vnode.vChildNodes[1].textContent).to.be.eql('just a textnode');
            expect(vnode.vChildNodes[2].textContent).to.be.eql('just a commentnode');
            expect(vnode.vChildNodes[3].textContent).to.be.eql('just a second textnode');
            expect(vnode.vChildNodes[4].textContent).to.be.eql('firstsecond');
                expect(vnode.vChildNodes[4].vChildNodes[0].textContent).to.be.eql('firstsecond');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].textContent).to.be.eql('first');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].textContent).to.be.eql('second');
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].textContent).to.be.eql('');
            expect(vnode.vChildNodes[5].textContent).to.be.eql('some text');
        });

        it('vChildNodes', function () {
            expect(vnode.vChildNodes.length).to.be.eql(6);
                expect(vnode.vChildNodes[0].nodeType).to.be.eql(1);
                expect(vnode.vChildNodes[0].id).to.be.eql('imgone');
                expect(vnode.vChildNodes[1].nodeType).to.be.eql(3);
                expect(vnode.vChildNodes[1].nodeValue).to.be.eql('just a textnode');
                expect(vnode.vChildNodes[2].nodeType).to.be.eql(8);
                expect(vnode.vChildNodes[2].nodeValue).to.be.eql('just a commentnode');
                expect(vnode.vChildNodes[3].nodeType).to.be.eql(3);
                expect(vnode.vChildNodes[3].nodeValue).to.be.eql('just a second textnode');
                expect(vnode.vChildNodes[4].nodeType).to.be.eql(1);
                expect(vnode.vChildNodes[4].tag).to.be.eql('DIV');
                expect(vnode.vChildNodes[5].nodeType).to.be.eql(1);
                expect(vnode.vChildNodes[5].tag).to.be.eql('DIV');
                    expect(vnode.vChildNodes[5].vChildNodes[0].vChildNodes.length).to.be.eql(0);
        });

        it('vChildren', function () {
            expect(vnode.vChildren.length).to.be.eql(3);
                expect(vnode.vChildren[0].nodeType).to.be.eql(1);
                expect(vnode.vChildren[0].id).to.be.eql('imgone');
                expect(vnode.vChildren[1].nodeType).to.be.eql(1);
                expect(vnode.vChildren[1].tag).to.be.eql('DIV');
                expect(vnode.vChildren[2].nodeType).to.be.eql(1);
                expect(vnode.vChildren[2].tag).to.be.eql('DIV');
        });

        it('domNode', function () {
            expect(vnode.domNode).to.be.eql(node1);
                expect(vnode.vChildNodes[0].domNode).to.be.eql(node2);
                expect(vnode.vChildNodes[1].domNode).to.be.eql(node3);
                expect(vnode.vChildNodes[2].domNode).to.be.eql(node4);
                expect(vnode.vChildNodes[3].domNode).to.be.eql(node5);
                expect(vnode.vChildNodes[4].domNode).to.be.eql(node6);
                    expect(vnode.vChildNodes[4].vChildNodes[0].domNode).to.be.eql(node6_1);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].domNode).to.be.eql(node6_1_1);
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vChildNodes[0].domNode).to.be.eql(node6_1_1_1);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].domNode).to.be.eql(node6_1_2);
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vChildNodes[0].domNode).to.be.eql(node6_1_2_1);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].domNode).to.be.eql(node6_1_3);
                expect(vnode.vChildNodes[5].domNode).to.be.eql(node7);
                    expect(vnode.vChildNodes[5].vChildNodes[0].domNode).to.be.eql(node7_1);
                    expect(vnode.vChildNodes[5].vChildNodes[1].domNode).to.be.eql(node7_2);
        });

        it('vFirst', function () {
            expect(vnode.vChildNodes[3].vFirst).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vFirst).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnodeB.vChildNodes[3].vFirst).to.be.eql(vnodeB.vChildNodes[0]);
        });

        it('vFirstChild', function () {
            expect(vnode.vFirstChild).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vFirstChild).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnodeB.vFirstChild).to.be.eql(vnodeB.vChildNodes[0]);
        });

        it('vFirstElement', function () {
            expect(vnode.vChildNodes[3].vFirstElement).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vFirstElement).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnodeB.vChildNodes[3].vFirstElement).to.be.eql(vnodeB.vChildNodes[1]);
        });

        it('vFirstElementChild', function () {
            expect(vnode.vFirstElementChild).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vFirstElementChild).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnodeB.vFirstElementChild).to.be.eql(vnodeB.vChildNodes[1]);
        });

        it('vLast', function () {
            expect(vnode.vChildNodes[3].vLast).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vLast).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnodeB.vChildNodes[3].vLast).to.be.eql(vnodeB.vChildNodes[4]);
        });

        it('vLastChild', function () {
            expect(vnode.vLastChild).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vLastChild).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnodeB.vLastChild).to.be.eql(vnodeB.vChildNodes[4]);
        });

        it('vLastElement', function () {
            expect(vnode.vChildNodes[3].vLastElement).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vLastElement).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnodeB.vChildNodes[3].vLastElement).to.be.eql(vnodeB.vChildNodes[3]);
        });

        it('vLastElementChild', function () {
            expect(vnode.vLastElementChild).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vLastElementChild).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnodeB.vLastElementChild).to.be.eql(vnodeB.vChildNodes[3]);
        });

        it('vNext', function () {
            expect(vnode.vChildNodes[0].vNext).to.be.eql(vnode.vChildNodes[1]);
            expect(vnode.vChildNodes[1].vNext).to.be.eql(vnode.vChildNodes[2]);
            expect(vnode.vChildNodes[2].vNext).to.be.eql(vnode.vChildNodes[3]);
            expect(vnode.vChildNodes[3].vNext).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[4].vNext).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.vChildNodes[5].vNext===undefined).to.be.true;

            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vNext).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vNext).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].vNext===undefined).to.be.true;

            expect(vnodeB.vChildNodes[0].vNext).to.be.eql(vnodeB.vChildNodes[1]);
            expect(vnodeB.vChildNodes[1].vNext).to.be.eql(vnodeB.vChildNodes[2]);
            expect(vnodeB.vChildNodes[2].vNext).to.be.eql(vnodeB.vChildNodes[3]);
            expect(vnodeB.vChildNodes[3].vNext).to.be.eql(vnodeB.vChildNodes[4]);
            expect(vnodeB.vChildNodes[4].vNext===undefined).to.be.true;
        });

        it('vNextElement', function () {
            expect(vnode.vChildNodes[0].vNextElement).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[1].vNextElement).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[2].vNextElement).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[3].vNextElement).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[4].vNextElement).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.vChildNodes[5].vNextElement===undefined).to.be.true;

            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vNextElement).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vNextElement).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].vNextElement===undefined).to.be.true;

            expect(vnodeB.vChildNodes[0].vNextElement).to.be.eql(vnodeB.vChildNodes[1]);
            expect(vnodeB.vChildNodes[1].vNextElement).to.be.eql(vnodeB.vChildNodes[3]);
            expect(vnodeB.vChildNodes[2].vNextElement).to.be.eql(vnodeB.vChildNodes[3]);
            expect(vnodeB.vChildNodes[3].vNextElement===undefined).to.be.true;
            expect(vnodeB.vChildNodes[4].vNextElement===undefined).to.be.true;

        });

        it('vParent', function () {
            expect(vnode.vParent===undefined).to.be.true;
                expect(vnode.vChildNodes[0].vParent).to.be.eql(vnode);
                expect(vnode.vChildNodes[1].vParent).to.be.eql(vnode);
                expect(vnode.vChildNodes[2].vParent).to.be.eql(vnode);
                expect(vnode.vChildNodes[3].vParent).to.be.eql(vnode);
                expect(vnode.vChildNodes[4].vParent).to.be.eql(vnode);
                    expect(vnode.vChildNodes[4].vChildNodes[0].vParent).to.be.eql(vnode.vChildNodes[4]);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vParent).to.be.eql(vnode.vChildNodes[4].vChildNodes[0]);
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vChildNodes[0].vParent).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vParent).to.be.eql(vnode.vChildNodes[4].vChildNodes[0]);
                            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vChildNodes[0].vParent).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1]);
                        expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].vParent).to.be.eql(vnode.vChildNodes[4].vChildNodes[0]);
                expect(vnode.vChildNodes[5].vParent).to.be.eql(vnode);
                    expect(vnode.vChildNodes[5].vChildNodes[0].vParent).to.be.eql(vnode.vChildNodes[5]);
                    expect(vnode.vChildNodes[5].vChildNodes[1].vParent).to.be.eql(vnode.vChildNodes[5]);
        });

        it('vPrevious', function () {
            expect(vnode.vChildNodes[5].vPrevious).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[4].vPrevious).to.be.eql(vnode.vChildNodes[3]);
            expect(vnode.vChildNodes[3].vPrevious).to.be.eql(vnode.vChildNodes[2]);
            expect(vnode.vChildNodes[2].vPrevious).to.be.eql(vnode.vChildNodes[1]);
            expect(vnode.vChildNodes[1].vPrevious).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[0].vPrevious===undefined).to.be.true;

            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].vPrevious).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vPrevious).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vPrevious===undefined).to.be.true;

            expect(vnodeB.vChildNodes[4].vPrevious).to.be.eql(vnodeB.vChildNodes[3]);
            expect(vnodeB.vChildNodes[3].vPrevious).to.be.eql(vnodeB.vChildNodes[2]);
            expect(vnodeB.vChildNodes[2].vPrevious).to.be.eql(vnodeB.vChildNodes[1]);
            expect(vnodeB.vChildNodes[1].vPrevious).to.be.eql(vnodeB.vChildNodes[0]);
            expect(vnodeB.vChildNodes[0].vPrevious===undefined).to.be.true;
        });

        it('vPreviousElement', function () {
            expect(vnode.vChildNodes[5].vPreviousElement).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.vChildNodes[4].vPreviousElement).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[3].vPreviousElement).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[2].vPreviousElement).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[1].vPreviousElement).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.vChildNodes[0].vPreviousElement===undefined).to.be.true;

            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].vPreviousElement).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].vPreviousElement).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].vPreviousElement===undefined).to.be.true;

            expect(vnodeB.vChildNodes[4].vPreviousElement).to.be.eql(vnodeB.vChildNodes[3]);
            expect(vnodeB.vChildNodes[3].vPreviousElement).to.be.eql(vnodeB.vChildNodes[1]);
            expect(vnodeB.vChildNodes[2].vPreviousElement).to.be.eql(vnodeB.vChildNodes[1]);
            expect(vnodeB.vChildNodes[1].vPreviousElement===undefined).to.be.true;
            expect(vnodeB.vChildNodes[0].vPreviousElement===undefined).to.be.true;
        });

    });


    describe('Methods vnode', function () {

        it('contains', function () {
            expect(vnode.contains(vnode)).to.be.true;
            expect(vnode.contains(vnode.vChildNodes[0])).to.be.true;
            expect(vnode.contains(vnode.vChildNodes[1])).to.be.true;
            expect(vnode.contains(vnode.vChildNodes[2])).to.be.true;
            expect(vnode.contains(vnode.vChildNodes[4].vChildNodes[0])).to.be.true;
            expect(vnode.contains(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2])).to.be.true;

            expect(vnode.vChildNodes[0].contains(vnode)).to.be.false;
            expect(vnode.vChildNodes[1].contains(vnode)).to.be.false;
            expect(vnode.vChildNodes[2].contains(vnode)).to.be.false;
            expect(vnode.vChildNodes[4].vChildNodes[0].contains(vnode)).to.be.false;
            expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].contains(vnode)).to.be.false;

            expect(vnode.vChildNodes[1].contains(vnode.vChildNodes[1])).to.be.true;
            expect(vnode.vChildNodes[1].contains(vnode.vChildNodes[2])).to.be.false;
        });

        it('firstOfVChildren', function () {
            expect(vnode.firstOfVChildren()).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.firstOfVChildren('img')).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.firstOfVChildren('div')).to.be.eql(vnode.vChildNodes[4]);
            expect(vnode.firstOfVChildren('ul')===undefined).to.be.eql(true);
            expect(vnode.vChildNodes[4].vChildNodes[0].firstOfVChildren()).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
            expect(vnode.vChildNodes[4].vChildNodes[0].firstOfVChildren('li')).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0]);
        });

        it('hasClass', function () {
            expect(vnode.hasClass('red')).to.be.true;
            expect(vnode.hasClass('blue')).to.be.true;
            expect(vnode.hasClass('yellow')).to.be.false;

            expect(vnode.vChildNodes[0].hasClass('red')).to.be.false;
            expect(vnode.vChildNodes[0].hasClass('blue')).to.be.false;
            expect(vnode.vChildNodes[0].hasClass('yellow')).to.be.true;

            expect(vnode.vChildNodes[1].hasClass('red')).to.be.false;
            expect(vnode.vChildNodes[1].hasClass('blue')).to.be.false;
            expect(vnode.vChildNodes[1].hasClass('yellow')).to.be.false;

            expect(vnode.vChildNodes[4].hasClass('red')).to.be.false;
            expect(vnode.vChildNodes[4].hasClass('blue')).to.be.false;
            expect(vnode.vChildNodes[5].hasClass('yellow')).to.be.false;
        });

        it('hasVChildNodes', function () {
            expect(vnode.hasVChildNodes()).to.be.true;
            expect(vnode.vChildNodes[0].hasVChildNodes()).to.be.false;
            expect(vnode.vChildNodes[1].hasVChildNodes()).to.be.false;
            expect(vnode.vChildNodes[2].hasVChildNodes()).to.be.false;
            expect(vnode.vChildNodes[3].hasVChildNodes()).to.be.false;
            expect(vnode.vChildNodes[4].hasVChildNodes()).to.be.true;
                expect(vnode.vChildNodes[4].vChildNodes[0].hasVChildNodes()).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].hasVChildNodes()).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].hasVChildNodes()).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].hasVChildNodes()).to.be.false;
            expect(vnode.vChildNodes[5].hasVChildNodes()).to.be.true;
                expect(vnode.vChildNodes[5].vChildNodes[0].hasVChildNodes()).to.be.false;
                expect(vnode.vChildNodes[5].vChildNodes[0].hasVChildNodes()).to.be.false;
        });

        it('hasVChildren', function () {
            expect(vnode.hasVChildren()).to.be.true;
            expect(vnode.vChildNodes[0].hasVChildren()).to.be.false;
            expect(vnode.vChildNodes[1].hasVChildren()).to.be.false;
            expect(vnode.vChildNodes[2].hasVChildren()).to.be.false;
            expect(vnode.vChildNodes[3].hasVChildren()).to.be.false;
            expect(vnode.vChildNodes[4].hasVChildren()).to.be.true;
                expect(vnode.vChildNodes[4].vChildNodes[0].hasVChildren()).to.be.true;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[0].hasVChildren()).to.be.false;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[1].hasVChildren()).to.be.false;
                    expect(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2].hasVChildren()).to.be.false;
            expect(vnode.vChildNodes[5].hasVChildren()).to.be.true;
                expect(vnode.vChildNodes[5].vChildNodes[0].hasVChildren()).to.be.false;
                expect(vnode.vChildNodes[5].vChildNodes[0].hasVChildren()).to.be.false;
        });

        it('lastOfVChildren', function () {
            expect(vnode.lastOfVChildren()).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.lastOfVChildren('img')).to.be.eql(vnode.vChildNodes[0]);
            expect(vnode.lastOfVChildren('div')).to.be.eql(vnode.vChildNodes[5]);
            expect(vnode.lastOfVChildren('ul')===undefined).to.be.eql(true);
            expect(vnode.vChildNodes[4].vChildNodes[0].lastOfVChildren()).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
            expect(vnode.vChildNodes[4].vChildNodes[0].lastOfVChildren('li')).to.be.eql(vnode.vChildNodes[4].vChildNodes[0].vChildNodes[2]);
        });

        it('storeId', function () {
            var domNode = vnode.domNode;
            expect(nodeids[vnode.id]).to.be.eql(vnode.domNode);

            delete nodeids[vnode.id];
            expect(nodeids[vnode.id]===undefined).to.be.true;

            vnode.storeId();
            expect(nodeids[vnode.id]).to.be.eql(vnode.domNode);
        });

    });

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
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><ul class="purple cyan"><li>first</li><li class="grey">second</li><li>third</li></ul></div>');
        });

        it('innerHTML test 2', function () {
            nodeS2.vnode.innerHTML = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            expect(nodeS2.vnode.vChildren[0].vChildren.length).to.be.eql(3);
            expect(nodeS2.innerHTML).to.be.eql(nodeS2.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><ul class="purple cyan"><li>first</li><li class="grey">second</li><li>third</li></ul></div><div class="blues3"></div></div>');
        });

        it('innerHTML test 3', function () {
            nodeSub.vnode.innerHTML = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            expect(nodeSub.vnode.vChildren[0].vChildren.length).to.be.eql(3);
            expect(nodeSub.innerHTML).to.be.eql(nodeSub.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><div class="bluesub"><ul class="purple cyan"><li>first</li><li class="grey">second</li><li>third</li></ul></div></div><div class="blues3"></div></div>');
        });

        it('innerHTML test 4', function () {
            nodeSub.vnode.innerHTML = 'first';
            expect(nodeSub.vnode.vChildren.length).to.be.eql(0);
            expect(nodeSub.innerHTML).to.be.eql(nodeSub.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><div class="bluesub">first</div></div><div class="blues3"></div></div>');
        });

        it('innerHTML test 5', function () {
            nodeSub.vnode.innerHTML = 'before <input type="text" disabled> after';
            expect(nodeSub.vnode.vChildNodes.length).to.be.eql(3);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><div class="bluesub">before <input type="text" disabled=""> after</div></div><div class="blues3"></div></div>');
        });

        it('nodeValue', function () {
            expect(nodeS1.vnode.nodeValue===null).to.be.true;
            nodeS1.vnode.innerHTML = 'ITSA';
            expect(nodeS1.vnode.nodeValue===null).to.be.true;
            expect(nodeS1.childNodes[0].vnode.nodeValue).to.be.eql('ITSA');
            nodeS1.childNodes[0].vnode.nodeValue = 'Modules';
            expect(nodeS1.childNodes[0].vnode.nodeValue).to.be.eql('Modules');
            expect(nodeS1.innerHTML).to.be.eql('Modules');
        });

        it('outerHTML test 1', function () {
            nodeS2.vnode.outerHTML = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            var newNodeS2 = nodeRoot.children[1];
            expect(newNodeS2.vnode.vChildren.length).to.be.eql(3);
            expect(newNodeS2.outerHTML).to.be.eql(newNodeS2.vnode.outerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><ul class="purple cyan"><li>first</li><li class="grey">second</li><li>third</li></ul><div class="blues3"></div></div>');
        });

        it('outerHTML test 2', function () {
            nodeSub.vnode.outerHTML = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            var newNodeSub = nodeS2.children[0];
            expect(newNodeSub.vnode.vChildren.length).to.be.eql(3);
            expect(newNodeSub.outerHTML).to.be.eql(newNodeSub.vnode.outerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><ul class="purple cyan"><li>first</li><li class="grey">second</li><li>third</li></ul></div><div class="blues3"></div></div>');
        });

        it('outerHTML test 3', function () {
            nodeSub.vnode.outerHTML = 'first';
            var newNodeSub = nodeS2.childNodes[0];
            expect(newNodeSub.vnode.vChildren===undefined).to.betrue;
            expect(newNodeSub.outerHTML).to.be.eql(newNodeSub.vnode.outerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2">first</div><div class="blues3"></div></div>');
        });

        it('outerHTML test 4', function () {
            nodeSub.vnode.outerHTML = 'before <input type="text" disabled> after';
            // expect(nodeSub.vnode.vChildNodes.length).to.be.eql(3);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2">before <input type="text" disabled=""> after</div><div class="blues3"></div></div>');
        });

        it('textContent test 1', function () {
            nodeRoot.vnode.textContent = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            expect(nodeRoot.vnode.vChildNodes.length).to.be.eql(1);
            expect(nodeRoot.textContent).to.be.eql(nodeRoot.vnode.textContent);
            expect(nodeRoot.innerHTML).to.be.eql(nodeRoot.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot">&lt;ul class="purple cyan"&gt;&lt;li&gt;first&lt;/li&gt;&lt;li class="grey"&gt;second&lt;/li&gt;&lt;li&gt;third&lt;/li&gt;&lt;/ul&gt;</div>');
        });

        it('textContent test 2', function () {
            nodeS2.vnode.textContent = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            expect(nodeS2.vnode.vChildNodes.length).to.be.eql(1);
            expect(nodeS2.textContent).to.be.eql(nodeS2.vnode.textContent);
            expect(nodeS2.innerHTML).to.be.eql(nodeS2.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2">&lt;ul class="purple cyan"&gt;&lt;li&gt;first&lt;/li&gt;&lt;li class="grey"&gt;second&lt;/li&gt;&lt;li&gt;third&lt;/li&gt;&lt;/ul&gt;</div><div class="blues3"></div></div>');
        });

        it('textContent test 3', function () {
            nodeSub.vnode.textContent = '<ul class="purple cyan">'+
                                    '<li>first</li>'+
                                    '<li class="grey">second</li>'+
                                    '<li>third</li>'+
                                 '</ul>';
            expect(nodeSub.vnode.vChildNodes.length).to.be.eql(1);
            expect(nodeSub.textContent).to.be.eql(nodeSub.vnode.textContent);
            expect(nodeSub.innerHTML).to.be.eql(nodeSub.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><div class="bluesub">&lt;ul class="purple cyan"&gt;&lt;li&gt;first&lt;/li&gt;&lt;li class="grey"&gt;second&lt;/li&gt;&lt;li&gt;third&lt;/li&gt;&lt;/ul&gt;</div></div><div class="blues3"></div></div>');
        });

        it('textContent test 4', function () {
            nodeSub.vnode.textContent = 'first';
            expect(nodeSub.vnode.vChildNodes.length).to.be.eql(1);
            expect(nodeSub.textContent).to.be.eql(nodeSub.vnode.textContent);
            expect(nodeSub.innerHTML).to.be.eql(nodeSub.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><div class="bluesub">first</div></div><div class="blues3"></div></div>');
        });

        it('textContent test 4', function () {
            nodeSub.vnode.textContent = 'before <input type="text" disabled> after';
            expect(nodeSub.vnode.vChildNodes.length).to.be.eql(1);
            expect(nodeSub.textContent).to.be.eql(nodeSub.vnode.textContent);
            expect(nodeSub.innerHTML).to.be.eql(nodeSub.vnode.innerHTML);
            expect(vnodeS.outerHTML).to.be.eql('<div class="blueroot"><div class="blues1"></div><div class="blues2"><div class="bluesub">before &lt;input type="text" disabled&gt; after</div></div><div class="blues3"></div></div>');
        });

    });

}(global.window || require('node-win')));