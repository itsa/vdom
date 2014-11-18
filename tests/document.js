/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);


    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
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

        it('contains', function () {
            var dummyNode = window.document.createElement('div');
            expect(DOCUMENT.contains(DOCUMENT.head)).to.be.true;
            expect(DOCUMENT.contains(DOCUMENT.body)).to.be.true;
            expect(DOCUMENT.contains(node)).to.be.true;
            expect(DOCUMENT.contains(nodeSub1)).to.be.true;
            expect(DOCUMENT.contains(nodeSub2)).to.be.true;
            expect(DOCUMENT.contains(nodeSub3)).to.be.true;
            expect(DOCUMENT.contains(nodeSub3Sub)).to.be.true;
            expect(DOCUMENT.contains(dummyNode)).to.be.false;
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
            var walker = DOCUMENT.createTreeWalker(node);

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

        it('getAll', function () {
            var nodelist1 = DOCUMENT.getAll('#ITSA div'),
                nodelist2 = DOCUMENT.getAll('#ITSA > div'),
                nodelist3 = DOCUMENT.getAll('.green'),
                nodelist4 = DOCUMENT.getAll('div.green.yellow'),
                nodelist5 = DOCUMENT.getAll('.red'),
                nodelist6 = DOCUMENT.getAll('#sub3'),
                nodelist7 = DOCUMENT.getAll('#sub3 div'),
                nodelist8 = DOCUMENT.getAll('#dummy'),
                nodelist9 = DOCUMENT.getAll('div div.green'),
                nodelist10 = DOCUMENT.getAll('#ITSA :not(.green)');

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

            expect(nodelist5.length).to.be.eql(1);

            expect(nodelist6.length).to.be.eql(1);
            expect(nodelist6[0]).to.be.eql(nodeSub3);

            expect(nodelist7.length).to.be.eql(1);
            expect(nodelist7[0]).to.be.eql(nodeSub3Sub);

            expect(nodelist8.length).to.be.eql(0);

            expect(nodelist9.length).to.be.eql(3);
            expect(nodelist9[2]).to.be.eql(nodeSub3Sub);

            expect(DOCUMENT.getAll('#sub1 ~ div').length).to.be.eql(2);
            expect(DOCUMENT.getAll('#sub1 ~ div')[0]).to.be.eql(nodeSub2);
            expect(DOCUMENT.getAll('#sub1 ~ div')[1]).to.be.eql(nodeSub3);

            expect(DOCUMENT.getAll('#sub2 ~ div').length).to.be.eql(1);
            expect(DOCUMENT.getAll('#sub2 ~ div')[0]).to.be.eql(nodeSub3);

            expect(DOCUMENT.getAll('#sub3 ~ div').length).to.be.eql(0);

            expect(DOCUMENT.getAll('#sub1 + div').length).to.be.eql(1);
            expect(DOCUMENT.getAll('#sub1 + div')[0]).to.be.eql(nodeSub2);

            expect(DOCUMENT.getAll('#sub2 + div').length).to.be.eql(1);
            expect(DOCUMENT.getAll('#sub2 + div')[0]).to.be.eql(nodeSub3);

            expect(DOCUMENT.getAll('#sub3 + div').length).to.be.eql(0);

            expect(DOCUMENT.getAll('#sub1 > div').length).to.be.eql(0);

            expect(DOCUMENT.getAll('#sub3 > div').length).to.be.eql(1);
            expect(DOCUMENT.getAll('#sub3 > div')[0]).to.be.eql(nodeSub3Sub);

            expect(nodelist10.length).to.be.eql(1);
            expect(nodelist10[0]).to.be.eql(nodeSub3);
        });

        it('getElement', function () {
            expect(DOCUMENT.getElement('body')).to.be.eql(DOCUMENT.body);

            expect(DOCUMENT.getElement('#ITSA div')).to.be.eql(nodeSub1);
            expect(DOCUMENT.getElement('.green')).to.be.eql(nodeSub1);
            expect(DOCUMENT.getElement('#ITSA div.green')).to.be.eql(nodeSub1);
            expect(DOCUMENT.getElement('#ITSA div div.green')).to.be.eql(nodeSub3Sub);
            expect(DOCUMENT.getElement('.purple')===undefined).to.be.true;
            expect(DOCUMENT.getElement('#sub3 div')).to.be.eql(nodeSub3Sub);
            expect(DOCUMENT.getElement('#sub1')).to.be.eql(nodeSub1);
            expect(DOCUMENT.getElement('#sub2')).to.be.eql(nodeSub2);
            expect(DOCUMENT.getElement('#sub3')).to.be.eql(nodeSub3);
            expect(DOCUMENT.getElement('#sub3sub')).to.be.eql(nodeSub3Sub);
            expect(DOCUMENT.getElement('#sub3 div')).to.be.eql(nodeSub3Sub);

            expect(DOCUMENT.getElement('#sub1 ~ div')).to.be.eql(nodeSub2);
            expect(DOCUMENT.getElement('#sub2 ~ div')).to.be.eql(nodeSub3);
            expect(DOCUMENT.getElement('#sub3 ~ div')===undefined).to.be.true;

            expect(DOCUMENT.getElement('#sub1 + div')).to.be.eql(nodeSub2);
            expect(DOCUMENT.getElement('#sub2 + div')).to.be.eql(nodeSub3);
            expect(DOCUMENT.getElement('#sub3 + div')===undefined).to.be.true;

            expect(DOCUMENT.getElement('#sub1 > div')===undefined).to.be.true;
            expect(DOCUMENT.getElement('#sub3 > div')).to.be.eql(nodeSub3Sub);

            expect(DOCUMENT.getElement('#ITSA :not(.green)')).to.be.eql(nodeSub3);
        });

        it('getElementById', function () {
            expect(DOCUMENT.getElementById('sub1')).to.be.eql(nodeSub1);
            expect(DOCUMENT.getElementById('sub2')).to.be.eql(nodeSub2);
            expect(DOCUMENT.getElementById('sub3')).to.be.eql(nodeSub3);
            expect(DOCUMENT.getElementById('sub3sub')).to.be.eql(nodeSub3Sub);
        });

        it('querySelector', function () {
            // no need tot test --> is handled by getElement()
        });

        it('querySelectorAll', function () {
            // no need tot test --> is handled by getAll()
        });

        it('test', function () {
            expect(DOCUMENT.test(DOCUMENT.body, 'body')).to.be.true;

            expect(DOCUMENT.test(nodeSub1, '#ITSA div')).to.be.true;
            expect(DOCUMENT.test(nodeSub1, '.green')).to.be.true;
            expect(DOCUMENT.test(nodeSub1, '#ITSA div.green')).to.be.true;
            expect(DOCUMENT.test(nodeSub3Sub, '#ITSA div div.green')).to.be.true;
            expect(DOCUMENT.test(DOCUMENT.body, '.purple')).to.be.false;
            expect(DOCUMENT.test(nodeSub3Sub, '#sub3 div')).to.be.true;
            expect(DOCUMENT.test(nodeSub1, '#sub1')).to.be.true;
            expect(DOCUMENT.test(nodeSub2, '#sub2')).to.be.true;
            expect(DOCUMENT.test(nodeSub3, '#sub3')).to.be.true;
            expect(DOCUMENT.test(nodeSub3Sub, '#sub3sub')).to.be.true;
            expect(DOCUMENT.test(nodeSub3Sub, '#sub3 div')).to.be.true;

            expect(DOCUMENT.test(nodeSub2, '#sub1 ~ div')).to.be.true;
            expect(DOCUMENT.test(nodeSub3, '#sub2 ~ div')).to.be.true;
            expect(DOCUMENT.test(DOCUMENT.body, '#sub3 ~ div')).to.be.false;

            expect(DOCUMENT.test(nodeSub2, '#sub1 + div')).to.be.true;
            expect(DOCUMENT.test(nodeSub3, '#sub2 + div')).to.be.true;
            expect(DOCUMENT.test(DOCUMENT.body, '#sub3 + div')).to.be.false;

            expect(DOCUMENT.test(DOCUMENT.body, '#sub1 > div')).to.be.false;
            expect(DOCUMENT.test(nodeSub3Sub, '#sub3 > div')).to.be.true;

            expect(DOCUMENT.test(nodeSub3, '#ITSA :not(.green)')).to.be.true;
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
        it('replace TextNode', function () {
            var textNode = window.document.createTextNode(' new ');
            DOCUMENT.replace(containerSub2, textNode);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second new third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second new third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

        it('replace Element', function () {
            DOCUMENT.replace(containerSub2, node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('replace Element escaped', function () {
            DOCUMENT.replace(containerSub2, node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

        it('replace String', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            DOCUMENT.replace(containerSub2, node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('replace String escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            DOCUMENT.replace(containerSub2, node, true);
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
            DOCUMENT.replace(containerSub2, [node, node2]);
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
            DOCUMENT.replace(containerSub2, [node, node2], true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

    });

}(global.window || require('node-win')));