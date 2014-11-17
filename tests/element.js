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

    describe('Properties', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
            window.document.body.appendChild(node);
            var a  = node.vnode;
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('height', function () {
            expect(node.height).to.be.eql(75);
            node.height = 225;
            expect(node.height).to.be.eql(225);
            expect(node.getStyle('height')).to.be.eql('225px');
        });

        it('left', function() {
            expect(node.left).to.be.eql(10);
            node.left = 85;
            expect(node.left).to.be.eql(85);
            expect(node.getStyle('left')).to.be.eql('85px');
        });

        it('top', function () {
            expect(node.top).to.be.eql(30);
            node.top = 55;
            expect(node.top).to.be.eql(55);
            expect(node.getStyle('top')).to.be.eql('55px');
        });

        it('width', function() {
            expect(node.width).to.be.eql(150);
            node.width = 325;
            expect(node.width).to.be.eql(325);
            expect(node.getStyle('width')).to.be.eql('325px');
        });

    });

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

        it('appendChild', function () {
            var n1 = window.document.createElement('img'),
                n2 = window.document.createElement('table'),
                n;
            n = node.appendChild(n1);
            expect(n).to.be.eql(n1);
            nodeSub3.appendChild(n2);
            expect(node.childNodes.length).to.be.eql(4);
            expect(node.childNodes[3]).to.be.eql(n1);
            expect(nodeSub3.childNodes.length).to.be.eql(3);
            expect(nodeSub3.childNodes[2]).to.be.eql(n2);
        });

        it('cloneNode', function () {
            var cloned, cloned2;
            node.setData('dummy', 10);
            nodeSub1.setData('dummySub', 20);
            nodeSub3Sub.setData('dummySubSub', 30);
            cloned = node.cloneNode(true);
            // because the order of attributes might be randomly generated (behaviour of JS-properties), we check differently:
            // one time without classes, one time without id's
            expect(cloned.innerHTML.replace(/ class="green yellow"/g, '')).to.eql('<div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div>');
            expect(cloned.innerHTML.replace(/ id="\w+"/g, '')).to.eql('<div class="green yellow"></div><div class="green yellow"></div><div><div class="green yellow"></div>extra text</div>');
            expect(cloned.nodeName).to.eql('DIV');
            expect(cloned.id).to.eql('ITSA');
            expect(cloned._getAttribute('style')).to.eql('position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
            expect(cloned.className).to.eql('red blue');

            expect(cloned.getData('dummy')).to.eql(10);
            expect(cloned.childNodes[0].getData('dummySub')).to.eql(20);
            expect(cloned.childNodes[2].childNodes[0].getData('dummySubSub')).to.eql(30);

            // now clone non deep
            cloned2 = node.cloneNode();
            expect(cloned2.innerHTML).to.eql('');
            expect(cloned2.nodeName).to.eql('DIV');
            expect(cloned2.id).to.eql('ITSA');
            expect(cloned2._getAttribute('style')).to.eql('position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
            expect(cloned2.className).to.eql('red blue');

            expect(cloned2.getData('dummy')).to.eql(10);
            expect(cloned2.childNodes.length).to.eql(0);
        });

        it('compareDocumentPosition', function () {
            var dummyNode = window.document.createElement('div');
            // one of elements in not part of the dom:
            expect(node.compareDocumentPosition(dummyNode)).to.be.eql(1);
            expect(dummyNode.compareDocumentPosition(node)).to.be.eql(1);
            // equal element:
            expect(node.compareDocumentPosition(node)).to.be.eql(0);
            // element comes before and is sibling
            expect(nodeSub1.compareDocumentPosition(nodeSub2)).to.be.eql(2);
            // element comes after and is sibling
            expect(nodeSub2.compareDocumentPosition(nodeSub1)).to.be.eql(4);
            // element contains
            expect(node.compareDocumentPosition(nodeSub1)).to.be.eql(20);
            // element is ancestor
            expect(nodeSub1.compareDocumentPosition(node)).to.be.eql(10);

        });

        it('contains', function () {
            var dummyNode = window.document.createElement('div');
            expect(node.contains(nodeSub1)).to.be.true;
            expect(node.contains(nodeSub2)).to.be.true;
            expect(node.contains(nodeSub3)).to.be.true;
            expect(node.contains(nodeSub3Sub)).to.be.true;
            expect(nodeSub3.contains(nodeSub3Sub)).to.be.true;
            expect(nodeSub1.contains(nodeSub3Sub)).to.be.false;
            expect(nodeSub2.contains(nodeSub3Sub)).to.be.false;
            expect(node.contains(dummyNode)).to.be.false;
            expect(dummyNode.contains(node)).to.be.false;
            expect(node.contains(node)).to.be.true;
            expect(dummyNode.contains(dummyNode)).to.be.true;
            expect(nodeSub3Sub.contains(nodeSub3Sub)).to.be.true;
        });
/*
         * A treewalker has the next methods:
         * <ul>
         *   <li>treewalker.firstChild()</li>
         *   <li>treewalker.lastChild()</li>
         *   <li>treewalker.nextNode()</li>
         *   <li>treewalker.nextSibling()</li>
         *   <li>treewalker.parentNode()</li>
         *   <li>treewalker.previousNode()</li>
         *   <li>treewalker.previousSibling()</li>
         * </ul>
         *
         * A treewalker has the next properties:
         * <ul>
         *   <li>treewalker.currentNode</li>
         *   <li>treewalker.filter</li>
         *   <li>treewalker.root</li>
         *   <li>treewalker.whatToShow</li>
         * </ul>
*/
        it('createTreeWalker', function () {
            var walker = node.createTreeWalker();

            expect(walker.firstChild()).to.be.eql(nodeSub1);
            expect(walker.nextNode()).to.be.eql(nodeSub2);
            expect(walker.nextNode()).to.be.eql(nodeSub3);
            expect(walker.nextNode()===undefined).to.be.true;

            expect(walker.previousNode()).to.be.eql(nodeSub2);
            expect(walker.previousNode()).to.be.eql(nodeSub1);
            expect(walker.previousNode()===undefined).to.be.true;

            expect(walker.nextSibling()).to.be.eql(nodeSub2);
            expect(walker.nextSibling()).to.be.eql(nodeSub3);
            expect(walker.nextSibling()===undefined).to.be.true;

            expect(walker.previousSibling()).to.be.eql(nodeSub2);
            expect(walker.previousSibling()).to.be.eql(nodeSub1);
            expect(walker.previousSibling()===undefined).to.be.true;

            walker.nextSibling(); // pointer is set to nodeSub2
            walker.nextSibling(); // pointer is set to nodeSub3

            expect(walker.firstChild()).to.be.eql(nodeSub3Sub);
            expect(walker.parentNode()).to.be.eql(nodeSub3);

            expect(walker.lastChild()).to.be.eql(nodeSub3SubText);
            expect(walker.previousNode()).to.be.eql(nodeSub3Sub);

            walker.parentNode(); // pointer is set to nodeSub3

            expect(walker.parentNode()).to.be.eql(node);
            expect(walker.lastChild()).to.be.eql(nodeSub3);
            expect(walker.previousSibling()).to.be.eql(nodeSub2);

            // now the same with a node with display: none
            walker.parentNode(); // pointer is set to nodeSub3
            nodeSub2.setInlineStyle('display', 'none');

            expect(walker.firstChild()).to.be.eql(nodeSub1);
            expect(walker.nextNode()).to.be.eql(nodeSub3);

            expect(walker.nextNode()===undefined).to.be.true;

            expect(walker.previousNode()).to.be.eql(nodeSub1);
            expect(walker.previousNode()===undefined).to.be.true;

            expect(walker.nextSibling()).to.be.eql(nodeSub2);
            expect(walker.nextSibling()).to.be.eql(nodeSub3);
            expect(walker.nextSibling()===undefined).to.be.true;

            expect(walker.previousSibling()).to.be.eql(nodeSub2);
            expect(walker.previousSibling()).to.be.eql(nodeSub1);
            expect(walker.previousSibling()===undefined).to.be.true;

            walker.nextSibling(); // pointer is set to nodeSub2
            walker.nextSibling(); // pointer is set to nodeSub3

            expect(walker.firstChild()).to.be.eql(nodeSub3Sub);
            expect(walker.parentNode()).to.be.eql(nodeSub3);

            expect(walker.lastChild()).to.be.eql(nodeSub3SubText);
            expect(walker.previousNode()).to.be.eql(nodeSub3Sub);

            walker.parentNode(); // pointer is set to nodeSub3

            expect(walker.parentNode()).to.be.eql(node);
            expect(walker.lastChild()).to.be.eql(nodeSub3);
            expect(walker.previousSibling()).to.be.eql(nodeSub2);

            // now with a nodefiler
            walker = node.createTreeWalker(null, function(node) {
                return (node.id==='sub2') || (node.id==='sub3');
            });
            nodeSub2.removeInlineStyle('display');

            expect(walker.firstChild()).to.be.eql(nodeSub2);
            expect(walker.nextNode()).to.be.eql(nodeSub3);
            expect(walker.nextNode()===undefined).to.be.true;

            expect(walker.previousNode()).to.be.eql(nodeSub2);
            expect(walker.previousNode()===undefined).to.be.true;

            expect(walker.nextSibling()).to.be.eql(nodeSub3);
            expect(walker.nextSibling()===undefined).to.be.true;

            expect(walker.previousSibling()).to.be.eql(nodeSub2);
            expect(walker.previousSibling()===undefined).to.be.true;

            walker.nextSibling(); // pointer is set to nodeSub3

            expect(walker.firstChild()===undefined).to.be.true;
            expect(walker.previousSibling()).to.be.eql(nodeSub2);
            expect(walker.parentNode()).to.be.eql(node);
            expect(walker.lastChild()).to.be.eql(nodeSub3);
            expect(walker.previousSibling()).to.be.eql(nodeSub2);
        });

        it('defineInlineStyle', function () {
            node.defineInlineStyle('z-index: 5; left: 80px;');
            nodeSub2.defineInlineStyle('z-index: 15; left: 180px;');

            expect(node.getInlineStyle('z-index')).to.be.eql('5');
            expect(node.getInlineStyle('position')===undefined).to.be.true;
            expect(node._getAttribute('style')).to.eql('z-index: 5; left: 80px;');

            expect(nodeSub2.getInlineStyle('z-index')).to.be.eql('15');
            expect(nodeSub2.getInlineStyle('position')===undefined).to.be.true;
            expect(nodeSub2._getAttribute('style')).to.eql('z-index: 15; left: 180px;');
        });

        it('empty single', function () {
            var nodeidSize = nodeids.size();
            nodeSub3.empty();
            // expect(nodeSub3.innerHTML).to.be.eql('');
            // expect(nodeids.size()).to.be.eql(nodeidSize-1);
        });

        it('empty deep', function () {
            var nodeidSize = nodeids.size();
            node.empty();
            expect(node.innerHTML).to.be.eql('');
            expect(nodeids.size()).to.be.eql(nodeidSize-4);
        });

        it('first', function () {
            expect(nodeSub1.first()).to.be.eql(nodeSub1);
            expect(nodeSub2.first()).to.be.eql(nodeSub1);
            expect(nodeSub3.first()).to.be.eql(nodeSub1);
        });

        it('firstOfChildren', function () {
            expect(node.firstOfChildren()).to.be.eql(nodeSub1);
            expect(nodeSub1.firstOfChildren()===null).to.be.true;
            expect(nodeSub3.firstOfChildren()).to.be.eql(nodeSub3Sub);
        });

        it('forceIntoNodeView with overflow', function () {
            var scrollTop;
            nodeSub3Sub.setInlineStyle('top', '0px').setInlineStyle('position', 'relative').setInlineStyle('height', '50px');
            nodeSub3.setInlineStyle('height', '100px').setInlineStyle('overflow', 'scroll');
            scrollTop = nodeSub3.scrollTop;
            nodeSub3Sub.setInlineStyle('top', '9999px');
            expect(nodeSub3.scrollTop===scrollTop).to.be.true;
            nodeSub3Sub.forceIntoNodeView();
            expect(nodeSub3.scrollTop>scrollTop).to.be.true;
        });

        it('forceIntoNodeView with overflow-y', function () {
            var scrollTop;
            nodeSub3Sub.setInlineStyle('top', '0px').setInlineStyle('position', 'relative').setInlineStyle('height', '50px');
            nodeSub3.setInlineStyle('height', '100px').setInlineStyle('overflow-y', 'scroll');
            scrollTop = nodeSub3.scrollTop;
            nodeSub3Sub.setInlineStyle('top', '9999px');
            expect(nodeSub3.scrollTop===scrollTop).to.be.true;
            nodeSub3Sub.forceIntoNodeView();
            expect(nodeSub3.scrollTop>scrollTop).to.be.true;
        });

        it('forceIntoView', function () {
            var scrollTop;
            node.setInlineStyle('top', '9999px');
            scrollTop = window.getScrollTop();
            expect(window.getScrollTop()===scrollTop).to.be.true;
            node.forceIntoView();
            expect(window.getScrollTop()>scrollTop).to.be.true;
        });

        it('getAll', function () {
            var nodelist1 = node.getAll('div'),
                nodelist2 = node.getAll('> div'),
                nodelist3 = node.getAll('.green'),
                nodelist4 = node.getAll('div.green.yellow'),
                nodelist5 = node.getAll('.red'), // node itself has class `red`, but it shouldn't be part of the selection
                nodelist6 = node.getAll('#sub3'),
                nodelist7 = node.getAll('#sub3 div'),
                nodelist8 = node.getAll('#dummy'),
                nodelist9 = node.getAll('div div.green'),
                nodelist10 = node.getAll(':not(.green)');

            expect(nodelist1.length).to.be.eql(4);
            expect(nodelist1[0]).to.be.eql(nodeSub1);
            expect(nodelist1[1]).to.be.eql(nodeSub2);
            expect(nodelist1[2]).to.be.eql(nodeSub3);
            expect(nodelist1[3]).to.be.eql(nodeSub3Sub);

            expect(nodelist2.length).to.be.eql(3);
            expect(nodelist2[0]).to.be.eql(nodeSub1);
            expect(nodelist2[1]).to.be.eql(nodeSub2);
            expect(nodelist2[2]).to.be.eql(nodeSub3);

            expect(nodelist3.length).to.be.eql(3);
            expect(nodelist3[0]).to.be.eql(nodeSub1);
            expect(nodelist3[1]).to.be.eql(nodeSub2);
            expect(nodelist3[2]).to.be.eql(nodeSub3Sub);

            expect(nodelist4.length).to.be.eql(3);
            expect(nodelist4[0]).to.be.eql(nodeSub1);
            expect(nodelist4[1]).to.be.eql(nodeSub2);
            expect(nodelist4[2]).to.be.eql(nodeSub3Sub);

            expect(nodelist5.length).to.be.eql(0);

            expect(nodelist6.length).to.be.eql(1);
            expect(nodelist6[0]).to.be.eql(nodeSub3);

            expect(nodelist7.length).to.be.eql(1);
            expect(nodelist7[0]).to.be.eql(nodeSub3Sub);

            expect(nodelist8.length).to.be.eql(0);

            expect(nodelist9.length).to.be.eql(1);
            expect(nodelist9[0]).to.be.eql(nodeSub3Sub);


            expect(nodeSub1.getAll('~ div').length).to.be.eql(2);
            expect(nodeSub1.getAll('~ div')[0]).to.be.eql(nodeSub2);
            expect(nodeSub1.getAll('~ div')[1]).to.be.eql(nodeSub3);

            expect(nodeSub2.getAll('~ div').length).to.be.eql(1);
            expect(nodeSub2.getAll('~ div')[0]).to.be.eql(nodeSub3);

            expect(nodeSub3.getAll('~ div').length).to.be.eql(0);

            expect(nodeSub1.getAll('+ div').length).to.be.eql(1);
            expect(nodeSub1.getAll('+ div')[0]).to.be.eql(nodeSub2);

            expect(nodeSub2.getAll('+ div').length).to.be.eql(1);
            expect(nodeSub2.getAll('+ div')[0]).to.be.eql(nodeSub3);

            expect(nodeSub3.getAll('+ div').length).to.be.eql(0);

            expect(nodeSub1.getAll('> div').length).to.be.eql(0);

            expect(nodeSub3.getAll('> div').length).to.be.eql(1);
            expect(nodeSub3.getAll('> div')[0]).to.be.eql(nodeSub3Sub);

            expect(nodelist10.length).to.be.eql(1);
            expect(nodelist10[0]).to.be.eql(nodeSub3);
        });

        it('getAttr', function () {
            expect(node.getAttr('id')).to.be.eql('ITSA');
            expect(node.getAttr('class')).to.be.eql('red blue');
            expect(node.getAttr('style')).to.be.eql('position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');

            expect(nodeSub1.getAttr('id')).to.be.eql('sub1');
            expect(nodeSub1.getAttr('class')).to.be.eql('green yellow');
            expect(nodeSub1.getAttr('style')===null).to.be.true;

            expect(nodeSub2.getAttr('id')).to.be.eql('sub2');
            expect(nodeSub2.getAttr('class')).to.be.eql('green yellow');
            expect(nodeSub2.getAttr('style')===null).to.be.true;

            expect(nodeSub3.getAttr('id')).to.be.eql('sub3');
            expect(nodeSub3.getAttr('class')===null).to.be.true;
            expect(nodeSub3.getAttr('style')===null).to.be.true;

            expect(nodeSub3Sub.getAttr('id')).to.be.eql('sub3sub');
            expect(nodeSub3Sub.getAttr('class')).to.be.eql('green yellow');
            expect(nodeSub3Sub.getAttr('style')===null).to.be.true;

            // check if manually set at vnode will return the right value:
            nodeSub1.vnode.attrs.id = 'dummy';
            expect(nodeSub1.getAttr('id')).to.be.eql('dummy');
        });

        it('getAttrs', function () {
            expect(node.getAttrs()).to.be.eql(node.vnode.attrs);
            expect(nodeSub1.getAttrs()).to.be.eql(nodeSub1.vnode.attrs);
            expect(nodeSub2.getAttrs()).to.be.eql(nodeSub2.vnode.attrs);
            expect(nodeSub3.getAttrs()).to.be.eql(nodeSub3.vnode.attrs);
            expect(nodeSub3Sub.getAttrs()).to.be.eql(nodeSub3Sub.vnode.attrs);
        });

        it('getAttribute', function () {
            expect(node.getAttribute('id')).to.be.eql('ITSA');
            expect(node.getAttribute('class')).to.be.eql('red blue');
            expect(node.getAttribute('style')).to.be.eql('position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');

            expect(nodeSub1.getAttribute('id')).to.be.eql('sub1');
            expect(nodeSub1.getAttribute('class')).to.be.eql('green yellow');
            expect(nodeSub1.getAttribute('style')===null).to.be.true;

            expect(nodeSub2.getAttribute('id')).to.be.eql('sub2');
            expect(nodeSub2.getAttribute('class')).to.be.eql('green yellow');
            expect(nodeSub2.getAttribute('style')===null).to.be.true;

            expect(nodeSub3.getAttribute('id')).to.be.eql('sub3');
            expect(nodeSub3.getAttribute('class')===null).to.be.true;
            expect(nodeSub3.getAttribute('style')===null).to.be.true;

            expect(nodeSub3Sub.getAttribute('id')).to.be.eql('sub3sub');
            expect(nodeSub3Sub.getAttribute('class')).to.be.eql('green yellow');
            expect(nodeSub3Sub.getAttribute('style')===null).to.be.true;

            // check if manually set at vnode will return the right value:
            nodeSub1.vnode.attrs.id = 'dummy';
            expect(nodeSub1.getAttribute('id')).to.be.eql('dummy');
        });

        it('getChildren', function () {
            var children = node.getChildren();
            expect(children.length).to.be.eql(3);
            expect(children[0]).to.be.eql(nodeSub1);
            expect(children[1]).to.be.eql(nodeSub2);
            expect(children[2]).to.be.eql(nodeSub3);
        });

        it('getClassList', function () {
            var classlist = node.getClassList();
            expect(classlist.contains('red')).to.be.true;
            expect(classlist.contains('blue')).to.be.true;
            expect(classlist.contains('green')).to.be.false;
            expect(classlist.contains('yellow')).to.be.false;

            expect(classlist.item(0)).to.be.eql('red');
            expect(classlist.item(1)).to.be.eql('blue');

            classlist.toggle('red');
            classlist.toggle('green');
            expect(classlist.contains('red')).to.be.false;
            expect(classlist.contains('blue')).to.be.true;
            expect(classlist.contains('green')).to.be.true;
            expect(classlist.contains('yellow')).to.be.false;
            expect(classlist.item(0)).to.be.eql('blue');
            expect(classlist.item(1)).to.be.eql('green');
            expect(node.className).to.be.eql('blue green');

            classlist.add('purple');
            expect(classlist.contains('red')).to.be.false;
            expect(classlist.contains('blue')).to.be.true;
            expect(classlist.contains('green')).to.be.true;
            expect(classlist.contains('yellow')).to.be.false;
            expect(classlist.contains('purple')).to.be.true;
            expect(classlist.item(0)).to.be.eql('blue');
            expect(classlist.item(1)).to.be.eql('green');
            expect(classlist.item(2)).to.be.eql('purple');
            expect(node.className).to.be.eql('blue green purple');

            classlist.remove('blue');
            expect(classlist.contains('red')).to.be.false;
            expect(classlist.contains('blue')).to.be.false;
            expect(classlist.contains('green')).to.be.true;
            expect(classlist.contains('yellow')).to.be.false;
            expect(classlist.contains('purple')).to.be.true;
            expect(classlist.item(0)).to.be.eql('green');
            expect(classlist.item(1)).to.be.eql('purple');
            expect(node.className).to.be.eql('green purple');

            classlist.add('red');
            classlist.toggle('red', true);
            expect(classlist.contains('red')).to.be.true;

            classlist.add('red');
            classlist.toggle('red', false);
            expect(classlist.contains('red')).to.be.false;

            classlist.remove('red');
            classlist.toggle('red', true);
            expect(classlist.contains('red')).to.be.true;

            classlist.remove('red');
            classlist.toggle('red', false);
            expect(classlist.contains('red')).to.be.false;
        });

        it('getData', function () {
            expect(node.getData('dummy1')===undefined).to.be.true;
            node.vnode._data = {dummy1: 10, dummy2: 20};
            expect(node.getData('dummy1')).to.be.eql(10);
            expect(node.getData('dummy2')).to.be.eql(20);
        });

        it('getElement', function () {
            expect(node.getElement('div')).to.be.eql(nodeSub1);
            expect(node.getElement('.green')).to.be.eql(nodeSub1);
            expect(node.getElement('div.green')).to.be.eql(nodeSub1);
            expect(node.getElement('div div.green')).to.be.eql(nodeSub3Sub);
            expect(node.getElement('.purple')===undefined).to.be.true;
            expect(nodeSub3.getElement('div')).to.be.eql(nodeSub3Sub);
            expect(node.getElement('#sub1')).to.be.eql(nodeSub1);
            expect(node.getElement('#sub2')).to.be.eql(nodeSub2);
            expect(node.getElement('#sub3')).to.be.eql(nodeSub3);
            expect(node.getElement('#sub3sub')).to.be.eql(nodeSub3Sub);
            expect(node.getElement('#sub3 div')).to.be.eql(nodeSub3Sub);

            expect(nodeSub1.getElement('~ div')).to.be.eql(nodeSub2);
            expect(nodeSub2.getElement('~ div')).to.be.eql(nodeSub3);
            expect(nodeSub3.getElement('~ div')===undefined).to.be.true

            expect(nodeSub1.getElement('+ div')).to.be.eql(nodeSub2);
            expect(nodeSub2.getElement('+ div')).to.be.eql(nodeSub3);
            expect(nodeSub3.getElement('+ div')===undefined).to.be.true

            expect(nodeSub1.getElement('> div')===undefined).to.be.true
            expect(nodeSub3.getElement('> div')).to.be.eql(nodeSub3Sub);

            expect(node.getElement(':not(.green)')).to.be.eql(nodeSub3);
        });

        it('getElementById', function () {
            expect(node.getElementById('sub1')).to.be.eql(nodeSub1);
            expect(node.getElementById('sub2')).to.be.eql(nodeSub2);
            expect(node.getElementById('sub3')).to.be.eql(nodeSub3);
            expect(node.getElementById('sub3sub')).to.be.eql(nodeSub3Sub);
        });

        it('getHTML', function () {
            // because the order of attributes might be randomly generated (behaviour of JS-properties), we check differently:
            // one time without classes, one time without id's
            expect(node.getHTML().replace(/ class="green yellow"/g, '')).to.eql('<div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div>');
            expect(node.getHTML().replace(/ id="\w+"/g, '')).to.eql('<div class="green yellow"></div><div class="green yellow"></div><div><div class="green yellow"></div>extra text</div>');

            expect(nodeSub1.getHTML()).to.eql('');
            expect(nodeSub2.getHTML()).to.eql('');

            expect(nodeSub3.getHTML().replace(/ class="green yellow"/g, '')).to.eql('<div id="sub3sub"></div>extra text');
            expect(nodeSub3.getHTML().replace(/ id="\w+"/g, '')).to.eql('<div class="green yellow"></div>extra text');

            expect(nodeSub3Sub.getHTML()).to.eql('');
        });

        it('getId', function () {
            expect(node.getId()).to.be.eql('ITSA');
            expect(nodeSub1.getId()).to.be.eql('sub1');
            expect(nodeSub2.getId()).to.be.eql('sub2');
            expect(nodeSub3.getId()).to.be.eql('sub3');
            expect(nodeSub3Sub.getId()).to.be.eql('sub3sub');
            node.appendChild(window.document.createElement('div'));
            expect(node.childNodes[3].getId()===undefined).to.be.true;
        });

        it('getInlineStyle', function () {
            var className, node2, node3;

            expect(node.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node.getInlineStyle('position')).to.be.eql('absolute');
            expect(node.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node.getInlineStyle('left')).to.be.eql('10px');
            expect(node.getInlineStyle('top')).to.be.eql('30px');
            expect(node.getInlineStyle('height')).to.be.eql('75px');
            expect(node.getInlineStyle('width')).to.be.eql('150px');

            node2 = window.document.createElement('div');
            node2.setAttribute('style', '{color: #F00; position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;} :before {color: #00F; font-weight: bold;}');
            window.document.body.appendChild(node2);

            expect(node2.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node2.getInlineStyle('color')).to.be.eql('#F00');
            expect(node2.getInlineStyle('position')).to.be.eql('absolute');
            expect(node2.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node2.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node2.getInlineStyle('left')).to.be.eql('10px');
            expect(node2.getInlineStyle('top')).to.be.eql('30px');
            expect(node2.getInlineStyle('height')).to.be.eql('75px');
            expect(node2.getInlineStyle('width')).to.be.eql('150px');
            expect(node2.getInlineStyle('font-weight')===undefined).to.be.true;
            expect(node2.getInlineStyle('fontWeight')===undefined).to.be.true;

            expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
            expect(node2.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
            expect(node2.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');

            node3 = window.document.createElement('div');
            node3.setAttribute('style', ':before {color: #00F; font-weight: bold;}');
            window.document.body.appendChild(node3);

            expect(node3.getInlineStyle('color')===undefined).to.be.true;
            expect(node3.getInlineStyle('font-weight')===undefined).to.be.true;
            expect(node3.getInlineStyle('fontWeight')===undefined).to.be.true;

            expect(node3.getInlineStyle('color', ':before')).to.be.eql('#00F');
            expect(node3.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
            expect(node3.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');

            window.document.body.removeChild(node2);
            window.document.body.removeChild(node3);
        });

        it('getOuterHTML', function () {
            // because the order of attributes might be randomly generated (behaviour of JS-properties), we check differently:
            // one time without classes, one time without id's
            expect(node.getOuterHTML()
                   .replace(/ style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;"/g, '')
                   .replace(/ class="red blue"/g, '')
                   .replace(/ class="green yellow"/g, ''))
                   .to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(node.getOuterHTML()
                   .replace(/ style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;"/g, '')
                   .replace(/ id="\w+"/g, ''))
                   .to.eql('<div class="red blue"><div class="green yellow"></div><div class="green yellow"></div><div><div class="green yellow"></div>extra text</div></div>');
            expect(node.getOuterHTML()
                   .replace(/ class="red blue"/g, '')
                   .replace(/ id="\w+"/g, ''))
                   .to.eql('<div style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;">'+
                    '<div class="green yellow"></div><div class="green yellow"></div><div><div class="green yellow"></div>extra text</div></div>');

            expect(nodeSub1.getOuterHTML().replace(/ class="green yellow"/g, '')).to.eql('<div id="sub1"></div>');
            expect(nodeSub1.getOuterHTML().replace(/ id="\w+"/g, '')).to.eql('<div class="green yellow"></div>');

            expect(nodeSub2.getOuterHTML().replace(/ class="green yellow"/g, '')).to.eql('<div id="sub2"></div>');
            expect(nodeSub2.getOuterHTML().replace(/ id="\w+"/g, '')).to.eql('<div class="green yellow"></div>');

            expect(nodeSub3.getOuterHTML().replace(/ class="green yellow"/g, '')).to.eql('<div id="sub3"><div id="sub3sub"></div>extra text</div>');
            expect(nodeSub3.getOuterHTML().replace(/ id="\w+"/g, '')).to.eql('<div><div class="green yellow"></div>extra text</div>');

            expect(nodeSub3Sub.getOuterHTML().replace(/ class="green yellow"/g, '')).to.eql('<div id="sub3sub"></div>');
            expect(nodeSub3Sub.getOuterHTML().replace(/ id="\w+"/g, '')).to.eql('<div class="green yellow"></div>');
        });

        it('getParent', function () {
            expect(node.getParent()).to.be.eql(window.document.body);
            expect(nodeSub1.getParent()).to.be.eql(node);
            expect(nodeSub2.getParent()).to.be.eql(node);
            expect(nodeSub3.getParent()).to.be.eql(node);
            expect(nodeSub3Sub.getParent()).to.be.eql(nodeSub3);
        });

        it('getStyle', function () {
            expect(node.getStyle('left')).to.be.eql('10px');
            expect(node.getStyle('display')).to.be.eql('block');
        });

        it('getTagName', function () {
            expect(node.getTagName()).to.be.eql('DIV');
            node.appendChild(window.document.createElement('img'));
            expect(node.childNodes[3].getTagName()).to.be.eql('IMG');
        });

        it('getText', function () {
            expect(node.getText()).to.eql('extra text');
            expect(nodeSub1.getText()).to.eql('');
            expect(nodeSub3.getText()).to.eql('extra text');
            expect(nodeSub3Sub.getText()).to.eql('');
        });

        it('getValue', function () {
            /*
            <div>
                <input id="item1" type="text" value="3">
                <div id="item2">some content</div>
                <div id="item3">some <b>content</b></div>
                <select id="item4">
                    <option value="option1">the content of option1</option>
                    <option value="option2" selected>the content of option2</option>
                    <option value="option3">the content of option3</option>
                </select>
            </div>
            */
            var cont, item1, item2, item3, item4, option;
            cont = window.document.createElement('div');
            cont.setAttribute('style', 'position:absolute; left:-9999px; top: -9999px;');

            item1 = window.document.createElement('input');
            item1.id = 'item1';
            item1.setAttribute('type', 'text');
            item1.setAttribute('value', '3');

            item2 = window.document.createElement('div');
            item2.id = 'item2';
            item2.appendChild(window.document.createTextNode('some content'));

            item3 = window.document.createElement('div');
            item3.id = 'item3';
            item3.appendChild(window.document.createTextNode('some '));
            item3.appendChild(window.document.createElement('b'));
            item3.childNodes[1].appendChild(window.document.createTextNode('content'));

            item4 = window.document.createElement('select');
            item4.id = 'item1';

                option = window.document.createElement('option');
                option.value = 'option1';
                option.appendChild(window.document.createTextNode('the content of option1'));
                item4.appendChild(option);

                option = window.document.createElement('option');
                option.value = 'option2';
                option.setAttribute('selected', true);
                option.appendChild(window.document.createTextNode('the content of option2'));
                item4.appendChild(option);

                option = window.document.createElement('option');
                option.value = 'option3';
                option.appendChild(window.document.createTextNode('the content of option3'));
                item4.appendChild(option);

            cont.appendChild(item1);
            cont.appendChild(item2);
            cont.appendChild(item3);
            cont.appendChild(item4);

            window.document.body.appendChild(cont);

            expect(item1.getValue()).to.be.eql('3');
            item1.value = '5';
            expect(item1.getValue()).to.be.eql('5');
            expect(item1.getAttribute('value')).to.be.eql('3');

            expect(item2.getValue()===undefined).to.be.true;
            item2.setAttribute('contenteditable', true);
            expect(item2.getValue()).to.be.eql('some content');

            expect(item3.getValue()===undefined).to.be.true;
            item3.setAttribute('contenteditable', true);
            expect(item3.getValue()).to.be.eql('some <b>content</b>');

            expect(item4.getValue()).to.be.eql('option2');
            item4.selectedIndex = 0;
            expect(item4.getValue()).to.be.eql('option1');

            window.document.body.removeChild(cont);
        });

        it('hasAttr', function () {
            expect(node.hasAttr('id')).to.be.true;
            expect(node.hasAttr('class')).to.be.true;
            expect(node.hasAttr('style')).to.be.true;
            expect(node.hasAttr('src')).to.be.false;
        });

        it('hasAttribute', function () {
            expect(node.hasAttribute('id')).to.be.true;
            expect(node.hasAttribute('class')).to.be.true;
            expect(node.hasAttribute('style')).to.be.true;
            expect(node.hasAttribute('src')).to.be.false;
        });

        it('hasAttributes', function () {
            node.appendChild(window.document.createElement('div'));
            expect(node.hasAttributes()).to.be.true;
            expect(nodeSub1.hasAttributes()).to.be.true;
            expect(node.childNodes[3].hasAttributes()).to.be.false;
        });

        it('hasChildren', function () {
            expect(node.hasChildren()).to.be.true;
            expect(nodeSub1.hasChildren()).to.be.false;
            expect(nodeSub2.hasChildren()).to.be.false;
            expect(nodeSub3.hasChildren()).to.be.true;
            expect(nodeSub3Sub.hasChildren()).to.be.false;
        });

        it('hasClass', function () {
            expect(node.hasClass('red')).to.be.true;
            expect(node.hasClass('blue')).to.be.true;
            expect(node.hasClass('green')).to.be.false;
        });

        it('hasData', function () {
            expect(node.hasData('dummy')).to.be.false;
            expect(nodeSub1.hasData('dummy')).to.be.false;
            expect(nodeSub2.hasData('dummy')).to.be.false;
            expect(nodeSub3.hasData('dummy')).to.be.false;
            expect(nodeSub3Sub.hasData('dummy')).to.be.false;

            nodeSub3.vnode._data = {dummy: 10};
            expect(node.hasData('dummy')).to.be.false;
            expect(nodeSub1.hasData('dummy')).to.be.false;
            expect(nodeSub2.hasData('dummy')).to.be.false;
            expect(nodeSub3.hasData('dummy')).to.be.true;
            expect(nodeSub3Sub.hasData('dummy')).to.be.false;
        });

        it('hasFocus', function () {
            var inputNode = window.document.createElement('input')
            node.appendChild(inputNode);
            expect(node.hasFocus()).to.be.false;
            expect(nodeSub1.hasFocus()).to.be.false;
            expect(nodeSub2.hasFocus()).to.be.false;
            expect(nodeSub3.hasFocus()).to.be.false;
            expect(nodeSub3Sub.hasFocus()).to.be.false;
            expect(inputNode.hasFocus()).to.be.false;

            inputNode.focus();
            expect(node.hasFocus()).to.be.false;
            expect(nodeSub1.hasFocus()).to.be.false;
            expect(nodeSub2.hasFocus()).to.be.false;
            expect(nodeSub3.hasFocus()).to.be.false;
            expect(nodeSub3Sub.hasFocus()).to.be.false;
            expect(inputNode.hasFocus()).to.be.true;
        });

        it('inside', function () {
            expect(node.inside(node)).to.be.false;
            expect(nodeSub1.inside(node)).to.be.eql(node);
            expect(nodeSub2.inside(node)).to.be.eql(node);
            expect(nodeSub3.inside(node)).to.be.eql(node);
            expect(nodeSub3Sub.inside(node)).to.be.eql(node);

            expect(nodeSub3Sub.inside(nodeSub1)).to.be.false;

            expect(nodeSub3Sub.inside('div')).to.be.eql(nodeSub3);
            expect(nodeSub3Sub.inside('.green')).to.be.false;
            expect(nodeSub3Sub.inside('.red')).to.be.eql(node);
            expect(nodeSub3Sub.inside('#ITSA')).to.be.eql(node);
        });

        it('insidePos', function () {
            expect(node.insidePos(10, 30)).to.be.true;
            expect(node.insidePos(160, 30)).to.be.true;
            expect(node.insidePos(160, 105)).to.be.true;
            expect(node.insidePos(10, 105)).to.be.true;

            expect(node.insidePos(9, 30)).to.be.false;
            expect(node.insidePos(9, 29)).to.be.false;
            expect(node.insidePos(10, 29)).to.be.false;

            expect(node.insidePos(160, 29)).to.be.false;
            expect(node.insidePos(161, 29)).to.be.false;
            expect(node.insidePos(161, 30)).to.be.false;

            expect(node.insidePos(161, 105)).to.be.false;
            expect(node.insidePos(161, 106)).to.be.false;
            expect(node.insidePos(160, 106)).to.be.false;

            expect(node.insidePos(10, 106)).to.be.false;
            expect(node.insidePos(9, 106)).to.be.false;
            expect(node.insidePos(9, 105)).to.be.false;
        });

        it('insertBefore', function () {
            var n1 = window.document.createElement('img'),
                n2 = window.document.createElement('table'),
                n;
            n = node.insertBefore(n1, nodeSub3);
            nodeSub3.insertBefore(n2, nodeSub3Sub);
            expect(node.childNodes.length).to.be.eql(4);
            expect(node.childNodes[2]).to.be.eql(n1);
            expect(nodeSub3.childNodes.length).to.be.eql(3);
            expect(nodeSub3.childNodes[0]).to.be.eql(n2);
        });

        it('last', function () {
            expect(nodeSub1.last()).to.be.eql(nodeSub3);
            expect(nodeSub2.last()).to.be.eql(nodeSub3);
            expect(nodeSub3.last()).to.be.eql(nodeSub3);
        });

        it('lastOfChildren', function () {
            expect(node.lastOfChildren()).to.be.eql(nodeSub3);
            expect(nodeSub1.lastOfChildren()===null).to.be.true;
            expect(nodeSub3.lastOfChildren()).to.be.eql(nodeSub3Sub);
        });

        it('matches', function () {
            expect(node.matches('#ITSA')).to.be.true;
            expect(node.matches('#ITSA.red')).to.be.true;
            expect(node.matches('#ITSA.red.blue')).to.be.true;
            expect(node.matches('.red')).to.be.true;
            expect(node.matches('.red.blue')).to.be.true;
            expect(node.matches('.green')).to.be.false;
            expect(node.matches('div#ITSA')).to.be.true;
            expect(node.matches('div#ITSA.red')).to.be.true;
            expect(node.matches('div#ITSA.red.blue')).to.be.true;
            expect(node.matches('div.red')).to.be.true;
            expect(node.matches('div.red.blue')).to.be.true;
            expect(node.matches('div.green')).to.be.false;

            expect(nodeSub1.matches('div')).to.be.true;
            expect(nodeSub1.matches('div div')).to.be.true;
            expect(nodeSub1.matches('div div.green')).to.be.true;
            expect(nodeSub1.matches('div div.green.yellow')).to.be.true;
            expect(nodeSub1.matches('div div.red')).to.be.false;
            expect(nodeSub1.matches('div #sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matches('div div#sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matches('#ITSA #sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matches('#ITSA div.green.yellow')).to.be.true;
            expect(nodeSub1.matches('#ITSA div#sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matches('div#ITSA #sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matches('div#ITSA div#sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matches('div#ITSA div.green.yellow')).to.be.true;

            expect(nodeSub1.matches('body div#ITSA div.green.yellow')).to.be.true;
        });

        it('matchesSelector', function () {
            expect(node.matchesSelector('#ITSA')).to.be.true;
            expect(node.matchesSelector('#ITSA.red')).to.be.true;
            expect(node.matchesSelector('#ITSA.red.blue')).to.be.true;
            expect(node.matchesSelector('.red')).to.be.true;
            expect(node.matchesSelector('.red.blue')).to.be.true;
            expect(node.matchesSelector('.green')).to.be.false;
            expect(node.matchesSelector('div#ITSA')).to.be.true;
            expect(node.matchesSelector('div#ITSA.red')).to.be.true;
            expect(node.matchesSelector('div#ITSA.red.blue')).to.be.true;
            expect(node.matchesSelector('div.red')).to.be.true;
            expect(node.matchesSelector('div.red.blue')).to.be.true;
            expect(node.matchesSelector('div.green')).to.be.false;

            expect(nodeSub1.matchesSelector('div')).to.be.true;
            expect(nodeSub1.matchesSelector('div div')).to.be.true;
            expect(nodeSub1.matchesSelector('div div.green')).to.be.true;
            expect(nodeSub1.matchesSelector('div div.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('div div.red')).to.be.false;
            expect(nodeSub1.matchesSelector('div #sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('div div#sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('#ITSA #sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('#ITSA div.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('#ITSA div#sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('div#ITSA #sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('div#ITSA div#sub1.green.yellow')).to.be.true;
            expect(nodeSub1.matchesSelector('div#ITSA div.green.yellow')).to.be.true;

            expect(nodeSub1.matchesSelector('body div#ITSA div.green.yellow')).to.be.true;
        });

        it('next', function () {
            expect(nodeSub1.next()).to.be.eql(nodeSub2);
            expect(nodeSub1.next(':not(.green)')).to.be.eql(nodeSub3);

            expect(nodeSub1.next('> div')===null).to.be.true;
            expect(nodeSub3.next('> div')===null).to.be.true;

            expect(nodeSub1.next('+ div')).to.eql(nodeSub2);
            expect(nodeSub1.next('+ div')).to.eql(nodeSub2);

            expect(nodeSub2.next('~ div')).to.eql(nodeSub3);
            expect(nodeSub2.next('~ div')).to.eql(nodeSub3);
        });

        it('previous', function () {
            expect(nodeSub3.previous()).to.be.eql(nodeSub2);
            expect(nodeSub3.previous('.green')).to.be.eql(nodeSub2);
            expect(nodeSub3.previous(':not(.green)')===null).to.be.true;

            expect(nodeSub3.previous('> div')===null).to.be.true;
            expect(nodeSub1.previous('> div')===null).to.be.true;

            expect(nodeSub3.previous('+ div')).to.eql(nodeSub2);
            expect(nodeSub3.previous('+ div')).to.eql(nodeSub2);

            expect(nodeSub2.previous('~ div')).to.eql(nodeSub1);
            expect(nodeSub2.previous('~ div')).to.eql(nodeSub1);
        });

        it('querySelector', function () {
            // no need tot test --> is handled by getElement()
        });

        it('querySelectorAll', function () {
            // no need tot test --> is handled by getAll()
        });

        it('rectangleInside', function () {
            var cont = window.document.createElement('div');
            cont.setAttribute('style', 'position:absolute; left:10px; top: 30px;  height: 75px; width: 150px;');
            window.document.body.appendChild(cont);

            expect(node.rectangleInside(cont)).to.be.true;

            cont.setAttribute('style', 'position:absolute; left:9px; top: 30px;  height: 75px; width: 150px;');
            expect(node.rectangleInside(cont)).to.be.false;

            cont.setAttribute('style', 'position:absolute; left:11px; top: 30px;  height: 75px; width: 150px;');
            expect(node.rectangleInside(cont)).to.be.false;

            cont.setAttribute('style', 'position:absolute; left:10px; top: 29px;  height: 75px; width: 150px;');
            expect(node.rectangleInside(cont)).to.be.false;

            cont.setAttribute('style', 'position:absolute; left:10px; top: 31px;  height: 75px; width: 150px;');
            expect(node.rectangleInside(cont)).to.be.false;

            window.document.body.removeChild(cont);
        });

        it('remove', function () {
            expect(nodeids['sub2']).to.be.eql(nodeSub2);
            nodeSub2.remove();
            expect(node.childNodes.length).to.be.eql(2);
            expect(node.vnode.vChildNodes.length).to.be.eql(2);
            expect(node.childNodes[0]).to.be.eql(nodeSub1);
            expect(node.childNodes[1]).to.be.eql(nodeSub3);
            expect(node.vnode.vChildNodes[0].domNode).to.be.eql(nodeSub1);
            expect(node.vnode.vChildNodes[1].domNode).to.be.eql(nodeSub3);
            expect(nodeids['sub2']===undefined).to.be.true;
        });

        it('removeAttr', function () {
            var n = nodeSub2.removeAttr('class');
            expect(n).to.be.eql(nodeSub2);
            expect(nodeSub2.outerHTML).to.be.eql('<div id="sub2"></div>');
            expect(nodeSub2.getOuterHTML()).to.be.eql('<div id="sub2"></div>');
            expect(nodeSub2.className).to.be.eql('');
            expect(nodeSub2.vnode.attrs['class']===undefined).to.be.true;
        });

        it('removeAttribute', function () {
            var n = nodeSub2.removeAttribute('class');
            expect(n===undefined).to.be.true;
            expect(nodeSub2.outerHTML).to.be.eql('<div id="sub2"></div>');
            expect(nodeSub2.getOuterHTML()).to.be.eql('<div id="sub2"></div>');
            expect(nodeSub2.className).to.be.eql('');
            expect(nodeSub2.vnode.attrs['class']===undefined).to.be.true;
        });

        it('removeChild', function () {
            expect(nodeids['sub2']).to.be.eql(nodeSub2);
            node.removeChild(nodeSub2);
            expect(node.childNodes.length).to.be.eql(2);
            expect(node.vnode.vChildNodes.length).to.be.eql(2);
            expect(node.childNodes[0]).to.be.eql(nodeSub1);
            expect(node.childNodes[1]).to.be.eql(nodeSub3);
            expect(node.vnode.vChildNodes[0].domNode).to.be.eql(nodeSub1);
            expect(node.vnode.vChildNodes[1].domNode).to.be.eql(nodeSub3);
            expect(nodeids['sub2']===undefined).to.be.true;
        });

        it('removeClass', function () {
            var className, node2;
            node2 = window.document.createElement('div');
            node2.id = 'ITSA';
            node2.className = 'red yellow blue yellow1 green yellow2 yellow3';
            window.document.body.appendChild(node2);

            node.setClassName = 'red yellow blue yellow1 green yellow2 yellow3';
            node2.removeClass('blue');
            expect(node2.hasClass('red')).to.be.true;
            expect(node2.hasClass('yellow')).to.be.true;
            expect(node2.hasClass('blue')).to.be.false;
            expect(node2.hasClass('yellow1')).to.be.true;
            expect(node2.hasClass('green')).to.be.true;
            expect(node2.hasClass('yellow2')).to.be.true;
            expect(node2.hasClass('yellow3')).to.be.true;
            expect(node2.hasClass('purple')).to.be.false;

            className = node2.className.split(' ');
            expect(className.length).to.be.eql(6);
            expect(className.indexOf('red')!==-1).to.be.true;
            expect(className.indexOf('yellow')!==-1).to.be.true;
            expect(className.indexOf('blue')!==-1).to.be.false;
            expect(className.indexOf('yellow1')!==-1).to.be.true;
            expect(className.indexOf('green')!==-1).to.be.true;
            expect(className.indexOf('yellow2')!==-1).to.be.true;
            expect(className.indexOf('yellow3')!==-1).to.be.true;
            expect(className.indexOf('purple')!==-1).to.be.false;

            node2.removeClass(['yellow1', 'yellow2', 'yellow3']);

            className = node2.className.split(' ');
            expect(className.length).to.be.eql(3);
            expect(className.indexOf('red')!==-1).to.be.true;
            expect(className.indexOf('yellow')!==-1).to.be.true;
            expect(className.indexOf('blue')!==-1).to.be.false;
            expect(className.indexOf('yellow1')!==-1).to.be.false;
            expect(className.indexOf('green')!==-1).to.be.true;
            expect(className.indexOf('yellow2')!==-1).to.be.false;
            expect(className.indexOf('yellow3')!==-1).to.be.false;
            expect(className.indexOf('purple')!==-1).to.be.false;

            window.document.body.removeChild(node2);
        });

        it('removeData', function () {
            node.setData('dummy1', 10);
            node.setData('dummy2', 20);
            expect(node.getData('dummy1')).to.be.eql(10);
            expect(node.getData('dummy2')).to.be.eql(20);
            node.removeData('dummy1');
            expect(node.getData('dummy1')===undefined).to.be.true;
            expect(node.getData('dummy2')).to.be.eql(20);
        });

        it('removeInlineStyle', function () {
            var styles, node2, elementStyles, beforeStyles;

            expect(node.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node.getInlineStyle('position')).to.be.eql('absolute');
            expect(node.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node.getInlineStyle('left')).to.be.eql('10px');
            expect(node.getInlineStyle('top')).to.be.eql('30px');
            expect(node.getInlineStyle('height')).to.be.eql('75px');
            expect(node.getInlineStyle('width')).to.be.eql('150px');

            expect(node.getInlineStyle('top', ':before')===undefined).to.be.true;

            node.removeInlineStyle('top');
            node.removeInlineStyle('dummytop'); // removal unexisting property

            expect(node.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node.getInlineStyle('position')).to.be.eql('absolute');
            expect(node.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node.getInlineStyle('left')).to.be.eql('10px');
            expect(node.getInlineStyle('top')===undefined).to.be.true;
            expect(node.getInlineStyle('height')).to.be.eql('75px');
            expect(node.getInlineStyle('width')).to.be.eql('150px');

            expect(node.getInlineStyle('top', ':before')===undefined).to.be.true;

            styles = node._getAttribute('style');
            styles = styles.substr(0, styles.length-1).split('; ');
            expect(styles.length).to.be.eql(5);
            expect(styles.indexOf('position: absolute')!==-1).to.be.true;
            expect(styles.indexOf('z-index: -1')!==-1).to.be.true;
            expect(styles.indexOf('dummy')!==-1).to.be.false;
            expect(styles.indexOf('left: 10px')!==-1).to.be.true;
            expect(styles.indexOf('top: 30px')!==-1).to.be.false;
            expect(styles.indexOf('height: 75px')!==-1).to.be.true;
            expect(styles.indexOf('width: 150px')!==-1).to.be.true;

            node2 = window.document.createElement('div');
            node2.setAttribute('style', '{color: #F00; position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;}'+
                ' :before {color: #00F; font-weight: bold; font-style: italic;}');
            window.document.body.appendChild(node2);

            expect(node2.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node2.getInlineStyle('color')).to.be.eql('#F00');
            expect(node2.getInlineStyle('position')).to.be.eql('absolute');
            expect(node2.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node2.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node2.getInlineStyle('left')).to.be.eql('10px');
            expect(node2.getInlineStyle('top')).to.be.eql('30px');
            expect(node2.getInlineStyle('height')).to.be.eql('75px');
            expect(node2.getInlineStyle('width')).to.be.eql('150px');

            expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
            expect(node2.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
            expect(node2.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');
            expect(node2.getInlineStyle('font-style', ':before')).to.be.eql('italic');
            expect(node2.getInlineStyle('fontStyle', ':before')).to.be.eql('italic');
            expect(node2.getInlineStyle('top', ':before')===undefined).to.be.true;

            node2.removeInlineStyle('top');
            node2.removeInlineStyle('dummytop'); // removal unexisting property
            node2.removeInlineStyle('font-weight', ':before');
            node2.removeInlineStyle('fontStyle', ':before');
            node2.removeInlineStyle('dummytop', ':before'); // removal unexisting property

            expect(node2.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node2.getInlineStyle('color')).to.be.eql('#F00');
            expect(node2.getInlineStyle('position')).to.be.eql('absolute');
            expect(node2.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node2.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node2.getInlineStyle('left')).to.be.eql('10px');
            expect(node2.getInlineStyle('top')===undefined).to.be.true;
            expect(node2.getInlineStyle('height')).to.be.eql('75px');
            expect(node2.getInlineStyle('width')).to.be.eql('150px');

            expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
            expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
            expect(node2.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
            expect(node2.getInlineStyle('font-style', ':before')===undefined).to.be.true;
            expect(node2.getInlineStyle('fontStyle', ':before')===undefined).to.be.true;
            expect(node2.getInlineStyle('top', ':before')===undefined).to.be.true;

            styles = node2._getAttribute('style');
            styles = styles.substr(1, styles.length-4).split('; } :before {');

            elementStyles = styles[0].split('; ');
            beforeStyles = styles[1].split('; ');
            expect(elementStyles.length).to.be.eql(6);
            expect(elementStyles.indexOf('color: #F00')!==-1).to.be.true;
            expect(elementStyles.indexOf('position: absolute')!==-1).to.be.true;
            expect(elementStyles.indexOf('z-index: -1')!==-1).to.be.true;
            expect(elementStyles.indexOf('dummy')!==-1).to.be.false;
            expect(elementStyles.indexOf('left: 10px')!==-1).to.be.true;
            expect(elementStyles.indexOf('top: 30px')!==-1).to.be.false;
            expect(elementStyles.indexOf('height: 75px')!==-1).to.be.true;
            expect(elementStyles.indexOf('width: 150px')!==-1).to.be.true;

            expect(beforeStyles.length).to.be.eql(1);
            expect(beforeStyles.indexOf('color: #00F')!==-1).to.be.true;
            expect(beforeStyles.indexOf('font-weight: bold')!==-1).to.be.false;
            expect(beforeStyles.indexOf('font-style: italic')!==-1).to.be.false;
            expect(beforeStyles.indexOf('dummy')!==-1).to.be.false;

            window.document.body.removeChild(node2);
        });

        it('replaceClass', function () {
            node.replaceClass('red', 'yellow');
            node.replaceClass('dummy', 'purple');
            expect(node.hasClass('red')).to.be.false;
            expect(node.hasClass('blue')).to.be.true;
            expect(node.hasClass('yellow')).to.be.true;
            expect(node.hasClass('purple')).to.be.false;
        });

        it('replaceChild', function () {
            // is tested through `replace`
        });

        it('scrollTo', function () {
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 10px; width: 10px; overflow: scroll;');
            node.innerHTML = 'data data data data data data data data data data data data data data data data data data data data data data '+
                             'data data data data data data data data data data data data data data data data data data data data data data '+
                             'data data data data data data data data data data data data data data data data data data data data data data '+
                             'data data data data data data data data data data data data data data data data data data data data data data '+
                             'data data data data data data data data data data data data data data data data data data data data data data '+
                             'data data data data data data data data data data data data data data data data data data data data data data ';
            expect(node.scrollLeft).to.be.eql(0);
            expect(node.scrollTop).to.be.eql(0);
            node.scrollTo(10, 15);
            expect(node.scrollLeft).to.be.eql(10);
            expect(node.scrollTop).to.be.eql(15);
        });

        it('setAttr', function () {
            var cont = window.document.createElement('div'),
                n = cont.setAttr('style', 'position:absolute; left:10px; top: 30px; height: 75px; width: 150px;');
            window.document.body.appendChild(cont);

            expect(cont.outerHTML).to.be.eql('<div style="position: absolute; left: 10px; top: 30px; height: 75px; width: 150px;"></div>');
            expect(n).to.be.eql(cont);
            window.document.body.removeChild(cont);
        });

        it('setAttribute', function () {
            var cont = window.document.createElement('div'),
                n = cont.setAttribute('style', 'position:absolute; left:10px; top: 30px; height: 75px; width: 150px;');
            window.document.body.appendChild(cont);

            expect(cont.outerHTML).to.be.eql('<div style="position: absolute; left: 10px; top: 30px; height: 75px; width: 150px;"></div>');
            expect(n===undefined).to.be.true;
            window.document.body.removeChild(cont);
        });

        it('setClass', function () {
            var className,
                n = node.setClass('yellow');
            expect(n).to.be.eql(node);
            expect(node.hasClass('red')).to.be.true;
            expect(node.hasClass('blue')).to.be.true;
            expect(node.hasClass('yellow')).to.be.true;
            expect(node.hasClass('green')).to.be.false;
            node.setClass(['yellow1', 'yellow2', 'yellow3']);
            expect(node.hasClass('red')).to.be.true;
            expect(node.hasClass('blue')).to.be.true;
            expect(node.hasClass('yellow')).to.be.true;
            expect(node.hasClass('yellow1')).to.be.true;
            expect(node.hasClass('yellow2')).to.be.true;
            expect(node.hasClass('yellow3')).to.be.true;
            expect(node.hasClass('green')).to.be.false;
            className = node.className.split(' ');
            expect(className.length).to.be.eql(6);
            expect(className.indexOf('red')!==-1).to.be.true;
            expect(className.indexOf('blue')!==-1).to.be.true;
            expect(className.indexOf('yellow')!==-1).to.be.true;
            expect(className.indexOf('green')!==-1).to.be.false;
            expect(className.indexOf('yellow1')!==-1).to.be.true;
            expect(className.indexOf('yellow2')!==-1).to.be.true;
            expect(className.indexOf('yellow3')!==-1).to.be.true;
        });

        it('setData', function () {
            var n = node.setData('dummy1', 10);
            expect(n).to.be.eql(node);
            expect(n.vnode._data).to.be.eql({dummy1: 10});
        });

        it('setHTML', function () {
            var newNode;
            nodeSub2.setHTML('<div id="ITSA">Hello <b>World</b></div>');
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.childNodes[0]).to.be.eql(nodeSub1);
            expect(node.childNodes[1]).to.be.eql(nodeSub2);
            expect(node.childNodes[2]).to.be.eql(nodeSub3);

            expect(nodeSub2.innerHTML).to.be.eql('<div id="ITSA">Hello <b>World</b></div>');
            expect(nodeSub2.getHTML()).to.be.eql('<div id="ITSA">Hello <b>World</b></div>');
            expect(nodeSub2.childNodes.length).to.be.eql(1);
            expect(nodeSub2.childNodes[0].childNodes.length).to.be.eql(2);
            expect(nodeSub2.childNodes[0].childNodes[1].innerHTML).to.be.eql('World');
            expect(nodeSub2.childNodes[0].childNodes[1].getHTML()).to.be.eql('World');
        });

        it('setId', function () {
            expect(node.id).to.be.eql('ITSA');
            expect(node.vnode.id).to.be.eql('ITSA');
            expect(node.vnode.attrs.id).to.be.eql('ITSA');
            expect(nodeids['ITSA']).to.be.eql(node);
            expect(nodeids['ITSA2']===undefined).to.be.true;
            node.setId('ITSA2');
            expect(node.id).to.be.eql('ITSA2');
            expect(node.vnode.id).to.be.eql('ITSA2');
            expect(node.vnode.attrs.id).to.be.eql('ITSA2');
            expect(nodeids['ITSA']===undefined).to.be.true;
            expect(nodeids['ITSA2']).to.be.eql(node);
        });

        it('setInlineStyle', function () {
            var styles, elementStyles, beforeStyles;

            expect(node.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node.getInlineStyle('color')===undefined).to.be.true;
            expect(node.getInlineStyle('position')).to.be.eql('absolute');
            expect(node.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node.getInlineStyle('left')).to.be.eql('10px');
            expect(node.getInlineStyle('top')).to.be.eql('30px');
            expect(node.getInlineStyle('height')).to.be.eql('75px');
            expect(node.getInlineStyle('width')).to.be.eql('150px');

            expect(node.getInlineStyle('color', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('font-style', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('fontStyle', ':before')===undefined).to.be.true;

            node.setInlineStyle('color', '#333');

            expect(node.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node.getInlineStyle('color')).to.be.eql('#333');
            expect(node.getInlineStyle('position')).to.be.eql('absolute');
            expect(node.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node.getInlineStyle('left')).to.be.eql('10px');
            expect(node.getInlineStyle('top')).to.be.eql('30px');
            expect(node.getInlineStyle('height')).to.be.eql('75px');
            expect(node.getInlineStyle('width')).to.be.eql('150px');

            expect(node.getInlineStyle('color', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('font-style', ':before')===undefined).to.be.true;
            expect(node.getInlineStyle('fontStyle', ':before')===undefined).to.be.true;

            styles = node._getAttribute('style');
            styles = styles.substr(0, styles.length-1).split('; ');
            expect(styles.length).to.be.eql(7);
            expect(styles.indexOf('color: #333')!==-1).to.be.true;
            expect(styles.indexOf('position: absolute')!==-1).to.be.true;
            expect(styles.indexOf('z-index: -1')!==-1).to.be.true;
            expect(styles.indexOf('dummy')!==-1).to.be.false;
            expect(styles.indexOf('left: 10px')!==-1).to.be.true;
            expect(styles.indexOf('top: 30px')!==-1).to.be.true;
            expect(styles.indexOf('height: 75px')!==-1).to.be.true;
            expect(styles.indexOf('width: 150px')!==-1).to.be.true;

            node.setInlineStyle('color', '#AAA', ':before');
            node.setInlineStyle('font-weight', 'bold', ':before');
            node.setInlineStyle('font-style', 'italic', ':before');

            expect(node.getInlineStyle('dummy')===undefined).to.be.true;
            expect(node.getInlineStyle('color')).to.be.eql('#333');
            expect(node.getInlineStyle('position')).to.be.eql('absolute');
            expect(node.getInlineStyle('z-index')).to.be.eql('-1');
            expect(node.getInlineStyle('zIndex')).to.be.eql('-1');
            expect(node.getInlineStyle('left')).to.be.eql('10px');
            expect(node.getInlineStyle('top')).to.be.eql('30px');
            expect(node.getInlineStyle('height')).to.be.eql('75px');
            expect(node.getInlineStyle('width')).to.be.eql('150px');

            expect(node.getInlineStyle('color', ':before')).to.be.eql('#AAA');
            expect(node.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
            expect(node.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');
            expect(node.getInlineStyle('font-style', ':before')).to.be.eql('italic');
            expect(node.getInlineStyle('fontStyle', ':before')).to.be.eql('italic');

            styles = node._getAttribute('style');
            styles = styles.substr(1, styles.length-4).split('; } :before {');

            elementStyles = styles[0].split('; ');
            beforeStyles = styles[1].split('; ');
            expect(elementStyles.length).to.be.eql(7);
            expect(elementStyles.indexOf('color: #333')!==-1).to.be.true;
            expect(elementStyles.indexOf('position: absolute')!==-1).to.be.true;
            expect(elementStyles.indexOf('z-index: -1')!==-1).to.be.true;
            expect(elementStyles.indexOf('dummy')!==-1).to.be.false;
            expect(elementStyles.indexOf('left: 10px')!==-1).to.be.true;
            expect(elementStyles.indexOf('top: 30px')!==-1).to.be.true;
            expect(elementStyles.indexOf('height: 75px')!==-1).to.be.true;
            expect(elementStyles.indexOf('width: 150px')!==-1).to.be.true;

            expect(beforeStyles.length).to.be.eql(3);
            expect(beforeStyles.indexOf('color: #AAA')!==-1).to.be.true;
            expect(beforeStyles.indexOf('font-weight: bold')!==-1).to.be.true;
            expect(beforeStyles.indexOf('font-style: italic')!==-1).to.be.true;
            expect(beforeStyles.indexOf('dummy')!==-1).to.be.false;
        });

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
        it('setOuterHTML', function () {
            var newNode;
            nodeSub2.setOuterHTML('<div id="ITSA">Hello <b>World</b></div>');
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.childNodes[0]).to.be.eql(nodeSub1);
            expect(node.childNodes[2]).to.be.eql(nodeSub3);
            newNode = node.childNodes[1];
            expect(newNode.outerHTML).to.be.eql('<div id="ITSA">Hello <b>World</b></div>');
            expect(newNode.getOuterHTML()).to.be.eql('<div id="ITSA">Hello <b>World</b></div>');
            expect(newNode.childNodes.length).to.be.eql(2);
            expect(newNode.childNodes[1].innerHTML).to.be.eql('World');
            expect(newNode.childNodes[1].getHTML()).to.be.eql('World');
        });

        it('setText', function () {
            expect(nodeids['sub3']).to.be.eql(nodeSub3);
            expect(nodeids['sub3sub']).to.be.eql(nodeSub3Sub);
            nodeSub3.setText('ok <b>here we go</b>');
            expect(nodeSub3.outerHTML).to.be.eql('<div id="sub3">ok &lt;b&gt;here we go&lt;/b&gt;</div>');
            expect(nodeids['sub3']).to.be.eql(nodeSub3);
            expect(nodeids['sub3sub']===undefined).to.be.true;
        });

        it('setValue', function () {
            /*
            <div>
                <input id="item1" type="text" value="3">
                <div id="item2">some content</div>
                <div id="item3">some <b>content</b></div>
                <select id="item4">
                    <option value="option1">the content of option1</option>
                    <option value="option2" selected>the content of option2</option>
                    <option value="option3">the content of option3</option>
                </select>
            </div>
            */
            var cont, item1, item2, item3, item4, option;
            cont = window.document.createElement('div');
            cont.setAttribute('style', 'position:absolute; left:-9999px; top: -9999px;');

            item1 = window.document.createElement('input');
            item1.id = 'item1';
            item1.setAttribute('type', 'text');
            item1.setAttribute('value', '3');

            item2 = window.document.createElement('div');
            item2.id = 'item2';
            item2.appendChild(window.document.createTextNode('some content'));

            item3 = window.document.createElement('div');
            item3.id = 'item3';
            item3.appendChild(window.document.createTextNode('some '));
            item3.appendChild(window.document.createElement('b'));
            item3.childNodes[1].appendChild(window.document.createTextNode('content'));

            item4 = window.document.createElement('select');
            item4.id = 'item1';

                option = window.document.createElement('option');
                option.value = 'option1';
                option.appendChild(window.document.createTextNode('the content of option1'));
                item4.appendChild(option);

                option = window.document.createElement('option');
                option.value = 'option2';
                option.setAttribute('selected', true);
                option.appendChild(window.document.createTextNode('the content of option2'));
                item4.appendChild(option);

                option = window.document.createElement('option');
                option.value = 'option3';
                option.appendChild(window.document.createTextNode('the content of option3'));
                item4.appendChild(option);

            cont.appendChild(item1);
            cont.appendChild(item2);
            cont.appendChild(item3);
            cont.appendChild(item4);

            window.document.body.appendChild(cont);

            expect(item1.getValue()).to.be.eql('3');
            item1.setValue('5');
            expect(item1.getValue()).to.be.eql('5');
            expect(item1.getAttribute('value')).to.be.eql('3');

            expect(item2.getValue()===undefined).to.be.true;
            item2.setValue('dummy <b>content</b>');
            expect(item2.getValue()===undefined).to.be.true;
            expect(item2.innerHTML).to.be.eql('some content');
            item2.setAttribute('contenteditable', true);
            item2.setValue('second dummy <b>content</b>');
            expect(item2.getValue()).to.be.eql('second dummy <b>content</b>');
            expect(item2.innerHTML).to.be.eql('second dummy <b>content</b>');

            expect(item3.getValue()===undefined).to.be.true;
            item3.setValue('dummy <b>content 2</b>');
            expect(item3.getValue()===undefined).to.be.true;
            expect(item3.innerHTML).to.be.eql('some <b>content</b>');
            item3.setAttribute('contenteditable', true);
            item3.setValue('second dummy <b>content 2</b>');
            expect(item3.getValue()).to.be.eql('second dummy <b>content 2</b>');
            expect(item3.innerHTML).to.be.eql('second dummy <b>content 2</b>');

            expect(item4.getValue()).to.be.eql('option2');
            expect(item4.selectedIndex).to.be.eql(1);
            item4.setValue('option3');
            expect(item4.getValue()).to.be.eql('option3');
            expect(item4.selectedIndex).to.be.eql(2);

            item4.setValue('Xoption3');
            expect(item4.getValue()).to.be.eql('option3');
            expect(item4.selectedIndex).to.be.eql(2);

            item4.setValue('option1');
            expect(item4.getValue()).to.be.eql('option1');
            expect(item4.selectedIndex).to.be.eql(0);

            window.document.body.removeChild(cont);
        });

        it('setXY', function () {
            expect(node.left).to.be.eql(10);
            expect(node.top).to.be.eql(30);

            node.setXY(85, 55);
            expect(node.left).to.be.eql(85);
            expect(node.top).to.be.eql(55);

            expect(node.getStyle('left')).to.be.eql('85px');
            expect(node.getStyle('top')).to.be.eql('55px');
        });

        it('toggleClass', function () {
            expect(node.hasClass('red')).to.be.true;
            node.toggleClass('red');
            expect(node.hasClass('red')).to.be.false;
            node.toggleClass('red');
            expect(node.hasClass('red')).to.be.true;

            expect(node.hasClass('purple')).to.be.false;
            node.toggleClass('purple', true);
            expect(node.hasClass('purple')).to.be.true;
            node.toggleClass('purple');
            expect(node.hasClass('purple')).to.be.false;
            node.toggleClass('purple');
            expect(node.hasClass('purple')).to.be.true;

            expect(node.hasClass('yellow')).to.be.false;
            node.toggleClass('yellow', false);
            expect(node.hasClass('yellow')).to.be.false;
            node.toggleClass('yellow');
            expect(node.hasClass('yellow')).to.be.true;
            node.toggleClass('yellow');
            expect(node.hasClass('yellow')).to.be.false;

            expect(node.hasClass('red')).to.be.true;
            node.toggleClass('red', true);
            expect(node.hasClass('red')).to.be.true;
            node.toggleClass('red');
            expect(node.hasClass('red')).to.be.false;
            node.toggleClass('red');
            expect(node.hasClass('red')).to.be.true;

            expect(node.hasClass('red')).to.be.true;
            node.toggleClass('red', false);
            expect(node.hasClass('red')).to.be.false;
            node.toggleClass('red');
            expect(node.hasClass('red')).to.be.true;
            node.toggleClass('red');
            expect(node.hasClass('red')).to.be.false;
        });

    });

    describe('Append', function () {

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

        // Node to append:
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
        it('append Element', function () {
            container.append(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                               '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                                    '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[7].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[7].vChildNodes.length).to.be.eql(3);
        });

        it('append Element with element-ref', function () {
            container.append(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[4].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[4].vChildNodes.length).to.be.eql(3);
        });

        it('append Element escaped', function () {
            container.append(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[6].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[6].vChildNodes===undefined).to.be.true;
        });

        it('append String', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.append(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                               '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                                    '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[7].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[7].vChildNodes.length).to.be.eql(3);
        });

        it('append String with element-ref', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.append(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[4].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[4].vChildNodes.length).to.be.eql(3);
        });

        it('append String escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.append(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[6].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[6].vChildNodes===undefined).to.be.true;
        });

        it('append ElementArray', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.append([node, node2]);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                               '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               '<div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                                    '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                                    '<div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>');
            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[7].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[7].vChildNodes.length).to.be.eql(3);
            expect(container.childNodes[8].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[8].vChildNodes.length).to.be.eql(3);
        });

        it('append ElementArray with element-ref', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.append([node, node2], false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               '<div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>'+
                                               'third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               '<div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>'+
                                               'third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[4].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[4].vChildNodes.length).to.be.eql(3);
            expect(container.childNodes[5].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[5].vChildNodes.length).to.be.eql(3);
        });

        it('append ElementArray escaped', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.append([node, node2], true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;'+
                '&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;'+
                '&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[6].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[6].vChildNodes===undefined).to.be.true;
        });

    });

    describe('Prepend', function () {
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
        it('prepend Element', function () {
            container.prepend(node);
            expect(container.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[0].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[0].vChildNodes.length).to.be.eql(3);
        });

        it('prepend Element with element-ref', function () {
            container.prepend(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('prepend Element escaped', function () {
            container.prepend(node, true);
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[0].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[0].vChildNodes===undefined).to.be.true;
        });

        it('prepend String', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.prepend(node);
            expect(container.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[0].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[0].vChildNodes.length).to.be.eql(3);
        });

        it('prepend String with element-ref', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.prepend(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('prepend String escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.prepend(node, true);
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[0].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[0].vChildNodes===undefined).to.be.true;
        });

        it('prepend ElementArray', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.prepend([node, node2]);
            expect(container.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               '<div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>first<div id="ITSA-cont-sub1"></div>'+
                                               'second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               '<div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>first<div id="ITSA-cont-sub1"></div>'+
                                               'second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[0].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[0].vChildNodes.length).to.be.eql(3);
            expect(container.childNodes[1].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[1].vChildNodes.length).to.be.eql(3);
        });

        it('prepend ElementArray with element-ref', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.prepend([node, node2], false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div><div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div><div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
            expect(container.childNodes[4].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[4].vChildNodes.length).to.be.eql(3);
        });

        it('prepend ElementArray escaped', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            container.prepend([node, node2], true);
            // expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[0].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[0].vChildNodes===undefined).to.be.true;
        });

    });

    describe('Replace', function () {
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

        // Node that is going to replace:
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
        it('replace Element', function () {
            containerSub2.replace(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('replace Element escaped', function () {
            containerSub2.replace(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

        it('replace String', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            containerSub2.replace(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('replace String escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            containerSub2.replace(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');


            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

        it('replace ElementArray', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            containerSub2.replace([node, node2]);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div><div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div><div id="ITSAb"><div id="sub1b"></div><div id="sub2b"></div><div id="sub3b"><div id="sub3subb"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
            expect(container.childNodes[4].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[4].vChildNodes.length).to.be.eql(3);
        });

        it('replace ElementArray escaped', function () {
            var node2 = node.cloneNode(true);
            node2.setId('ITSAb');
            node2.childNodes[0].setId('sub1b');
            node2.childNodes[1].setId('sub2b');
            node2.childNodes[2].setId('sub3b');
            node2.childNodes[2].childNodes[0].setId('sub3subb');
            containerSub2.replace([node, node2], true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

    });

    describe('Mutation Observer', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('processing new attribute', function () {
        });

        it('processing attribute-change', function () {
        });

        it('processing removed attribute', function () {
        });

        it('processing new Element', function () {
        });

        it('processing Element-change', function () {
        });

        it('processing removed Element', function () {
        });

        it('processing new TextNode', function () {
        });

        it('processing TextNode-change', function () {
        });

        it('processing removed TextNode', function () {
        });

        it('processing new CommentNode', function () {
        });

        it('processing CommentNode-change', function () {
        });

        it('processing removed CommentNode', function () {
        });

    });


}(global.window || require('node-win')));