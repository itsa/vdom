/*global describe, it */
/*jshint unused:false */
(function (window) {

    "use strict";

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        domNodeToVNode = require("../lib/node-parser.js")(window),
        node1, node2, innernode, innernode2, innernode3, innernode4;

// node1 looks like this:
/*
<div id="divone" class="red blue" disabled data-x="somedata">the innercontent</div>
*/
    node1 = DOCUMENT.createElement('div');
    node1.id = 'divone';
    node1.className = 'red blue';
    node1.setAttribute('disabled', '');
    node1.setAttribute('data-x', 'somedata');
    node1.textContent = 'the innercontent';

// node2 looks like this:
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
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
    node2 = DOCUMENT.createElement('div');
    node2.id = 'divone';
    node2.className = 'red blue';
    node2.setAttribute('disabled', '');
    node2.setAttribute('data-x', 'somedata');

    innernode = DOCUMENT.createElement('img');
    innernode.id = 'imgone';
    innernode.setAttribute('alt', 'http://google.com/img1.jpg');
    node2.appendChild(innernode);

    innernode = DOCUMENT.createTextNode('just a textnode');
    node2.appendChild(innernode);

    innernode = DOCUMENT.createComment('just a commentnode');
    node2.appendChild(innernode);

    innernode = DOCUMENT.createTextNode('just a second textnode');
    node2.appendChild(innernode);

    innernode = DOCUMENT.createElement('div');
        innernode2 = DOCUMENT.createElement('ul');
            innernode3 = DOCUMENT.createElement('li');
            innernode3.id = 'li1';
                innernode4 = DOCUMENT.createTextNode('first');
                innernode3.appendChild(innernode4);
            innernode2.appendChild(innernode3);

            innernode3 = DOCUMENT.createElement('li');
            innernode3.id = 'li2';
                innernode4 = DOCUMENT.createTextNode('second');
                innernode3.appendChild(innernode4);
            innernode2.appendChild(innernode3);

            innernode3 = DOCUMENT.createElement('li');
            innernode3.id = 'li3';
            innernode2.appendChild(innernode3);
        innernode.appendChild(innernode2);
    node2.appendChild(innernode);

    innernode = DOCUMENT.createElement('div');
        innernode2 = DOCUMENT.createElement('div');
        innernode.appendChild(innernode2);
        innernode2 = DOCUMENT.createTextNode('some text');
        innernode.appendChild(innernode2);
    node2.appendChild(innernode);

    //===============================================================

    describe('DOM-node to vnode parser', function () {

        it('Single node', function () {
            var vnode = domNodeToVNode(node1),
                childvnode;

            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divone');
            expect(vnode.attrs['class']).to.be.eql('red blue');
            expect(vnode.classNames.red).to.be.true;
            expect(vnode.classNames.blue).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(1);
            expect(vnode.vParent===undefined).to.be.true;

            // now examine the vChildNode:
            childvnode = vnode.vChildNodes[0];
            expect(childvnode.nodeType).to.be.eql(3);
            expect(childvnode.tag===undefined).to.be.true;
            expect(childvnode.isVoid===undefined).to.be.true;
            expect(childvnode.id===undefined).to.be.true;
            expect(childvnode.attrs===undefined).to.be.true;
            expect(childvnode.text).to.be.eql('the innercontent');
            expect(childvnode.vChildNodes===undefined).to.be.true;
            expect(childvnode.vParent).to.be.eql(vnode);
        });

        it('Node with many childNodes', function () {
            var vnode = domNodeToVNode(node2),
                childvnode, child_childvnode, child_child_childvnode, child_child_child_childvnode;

            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divone');
            expect(vnode.attrs['class']).to.be.eql('red blue');
            expect(vnode.classNames.red).to.be.true;
            expect(vnode.classNames.blue).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(6);
            expect(vnode.vParent===undefined).to.be.true;

                // now examine the vChildNodes:
                childvnode = vnode.vChildNodes[0];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('IMG');
                expect(childvnode.isVoid).to.be.true;
                expect(childvnode.id).to.be.eql('imgone');
                expect(childvnode.attrs.alt).to.be.eql('http://google.com/img1.jpg');
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[1];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a textnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[2];
                expect(childvnode.nodeType).to.be.eql(8);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a commentnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[3];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a second textnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[4];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('DIV');
                expect(childvnode.isVoid).to.be.false;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes.length).to.be.eql(1);
                expect(childvnode.vParent).to.be.eql(vnode);

                    child_childvnode = childvnode.vChildNodes[0];
                    expect(child_childvnode.nodeType).to.be.eql(1);
                    expect(child_childvnode.tag).to.be.eql('UL');
                    expect(child_childvnode.isVoid).to.be.false;
                    expect(child_childvnode.id===undefined).to.be.true;
                    expect(child_childvnode.attrs['class']===undefined).to.be.true;
                    expect(child_childvnode.attrs.disabled===undefined).to.be.true;
                    expect(child_childvnode.attrs['data-x']===undefined).to.be.true;
                    expect(child_childvnode.text===undefined).to.be.true;
                    expect(child_childvnode.vChildNodes.length).to.be.eql(3);
                    expect(child_childvnode.vParent).to.be.eql(childvnode);

                        child_child_childvnode = child_childvnode.vChildNodes[0];
                        expect(child_child_childvnode.nodeType).to.be.eql(1);
                        expect(child_child_childvnode.tag).to.be.eql('LI');
                        expect(child_child_childvnode.isVoid).to.be.false;
                        expect(child_child_childvnode.id).to.be.eql('li1');
                        expect(child_child_childvnode.attrs['class']===undefined).to.be.true;
                        expect(child_child_childvnode.attrs.disabled===undefined).to.be.true;
                        expect(child_child_childvnode.attrs['data-x']===undefined).to.be.true;
                        expect(child_child_childvnode.text===undefined).to.be.true;
                        expect(child_child_childvnode.vChildNodes.length).to.be.eql(1);
                        expect(child_child_childvnode.vParent).to.be.eql(child_childvnode);

                            child_child_child_childvnode = child_child_childvnode.vChildNodes[0];
                            expect(child_child_child_childvnode.nodeType).to.be.eql(3);
                            expect(child_child_child_childvnode.tag===undefined).to.be.true;
                            expect(child_child_child_childvnode.isVoid===undefined).to.be.true;
                            expect(child_child_child_childvnode.id===undefined).to.be.true;
                            expect(child_child_child_childvnode.attrs===undefined).to.be.true;
                            expect(child_child_child_childvnode.text).to.be.eql('first');
                            expect(child_child_child_childvnode.vChildNodes===undefined).to.be.true;
                            expect(child_child_child_childvnode.vParent).to.be.eql(child_child_childvnode);

                        child_child_childvnode = child_childvnode.vChildNodes[1];
                        expect(child_child_childvnode.nodeType).to.be.eql(1);
                        expect(child_child_childvnode.tag).to.be.eql('LI');
                        expect(child_child_childvnode.isVoid).to.be.false;
                        expect(child_child_childvnode.id).to.be.eql('li2');
                        expect(child_child_childvnode.attrs['class']===undefined).to.be.true;
                        expect(child_child_childvnode.attrs.disabled===undefined).to.be.true;
                        expect(child_child_childvnode.attrs['data-x']===undefined).to.be.true;
                        expect(child_child_childvnode.text===undefined).to.be.true;
                        expect(child_child_childvnode.vChildNodes.length).to.be.eql(1);
                        expect(child_child_childvnode.vParent).to.be.eql(child_childvnode);

                            child_child_child_childvnode = child_child_childvnode.vChildNodes[0];
                            expect(child_child_child_childvnode.nodeType).to.be.eql(3);
                            expect(child_child_child_childvnode.tag===undefined).to.be.true;
                            expect(child_child_child_childvnode.isVoid===undefined).to.be.true;
                            expect(child_child_child_childvnode.id===undefined).to.be.true;
                            expect(child_child_child_childvnode.attrs===undefined).to.be.true;
                            expect(child_child_child_childvnode.text).to.be.eql('second');
                            expect(child_child_child_childvnode.vChildNodes===undefined).to.be.true;
                            expect(child_child_child_childvnode.vParent).to.be.eql(child_child_childvnode);

                        child_child_childvnode = child_childvnode.vChildNodes[2];
                        expect(child_child_childvnode.nodeType).to.be.eql(1);
                        expect(child_child_childvnode.tag).to.be.eql('LI');
                        expect(child_child_childvnode.isVoid).to.be.false;
                        expect(child_child_childvnode.id).to.be.eql('li3');
                        expect(child_child_childvnode.attrs['class']===undefined).to.be.true;
                        expect(child_child_childvnode.attrs.disabled===undefined).to.be.true;
                        expect(child_child_childvnode.attrs['data-x']===undefined).to.be.true;
                        expect(child_child_childvnode.text===undefined).to.be.true;
                        expect(child_child_childvnode.vChildNodes.length).to.be.eql(0);
                        expect(child_child_childvnode.vParent).to.be.eql(child_childvnode);

                childvnode = vnode.vChildNodes[5];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('DIV');
                expect(childvnode.isVoid).to.be.false;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes.length).to.be.eql(2);
                expect(childvnode.vParent).to.be.eql(vnode);

                    child_childvnode = childvnode.vChildNodes[0];
                    expect(child_childvnode.nodeType).to.be.eql(1);
                    expect(child_childvnode.tag).to.be.eql('DIV');
                    expect(child_childvnode.isVoid).to.be.false;
                    expect(child_childvnode.id===undefined).to.be.true;
                    expect(child_childvnode.attrs['class']===undefined).to.be.true;
                    expect(child_childvnode.attrs.disabled===undefined).to.be.true;
                    expect(child_childvnode.attrs['data-x']===undefined).to.be.true;
                    expect(child_childvnode.text===undefined).to.be.true;
                    expect(child_child_childvnode.vChildNodes.length).to.be.eql(0);
                    expect(child_childvnode.vParent).to.be.eql(childvnode);

                    child_childvnode = childvnode.vChildNodes[1];
                    expect(child_childvnode.nodeType).to.be.eql(3);
                    expect(child_childvnode.tag===undefined).to.be.true;
                    expect(child_childvnode.isVoid===undefined).to.be.true;
                    expect(child_childvnode.id===undefined).to.be.true;
                    expect(child_childvnode.attrs===undefined).to.be.true;
                    expect(child_childvnode.text).to.be.eql('some text');
                    expect(child_childvnode.vChildNodes===undefined).to.be.true;
                    expect(child_childvnode.vParent).to.be.eql(childvnode);

        });

    });

}(global.window || require('node-win')));