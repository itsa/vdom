/*global describe, it, before, after, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("js-ext/lib/object.js");
    require("window-ext");
    require("../vdom.js")(window);
    // require('../partials/extend-element.js')(window);
    // require('../partials/extend-document.js')(window);

    var chai = require('chai'),
        expect = chai.expect,
        should = chai.should(),
        NS = require('../partials/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        TRANSFORM = 'transform',
        VENDOR_CSS = require('polyfill/extra/vendorCSS.js')(window),
        generateVendorCSSProp = VENDOR_CSS.generator,
        VENDOR_CSS_PROPERTIES = VENDOR_CSS.cssProps,
        VENDOR_TRANSFORM_PROPERTY = generateVendorCSSProp(TRANSFORM),
        VENDOR_TRANSITION_PROPERTY = require('polyfill/extra/transition.js')(window),
        async = require('utils/lib/timers.js').async,
        SUPPORT_INLINE_PSEUDO_STYLES = window.document._supportInlinePseudoStyles,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3, cssnode;

    chai.use(require('chai-as-promised'));

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
        this.timeout(5000);

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
            expect(node.compareDocumentPosition(dummyNode)).to.be.equal(1, 'check 1');
            expect(dummyNode.compareDocumentPosition(node)).to.be.equal(1, 'check 2');
            // equal element:
            expect(node.compareDocumentPosition(node)).to.be.equal(0, 'check 3');
            // element comes before and is sibling
            expect(nodeSub1.compareDocumentPosition(nodeSub2)).to.be.equal(4, 'check 4');
            // element comes after and is sibling
            expect(nodeSub2.compareDocumentPosition(nodeSub1)).to.be.equal(2, 'check 5');
            // element contains
            expect(node.compareDocumentPosition(nodeSub1)).to.be.equal(20, 'check 6');
            // element is ancestor
            expect(nodeSub1.compareDocumentPosition(node)).to.be.equal(10, 'check 7');

            var inspectedNode = '<ul style="opacity: 0;">';
                inspectedNode += '<li id="li1"></li>';
                inspectedNode += '<li id="li2"></li>';
                inspectedNode += '<li id="li3"></li>';
                inspectedNode += '<li id="li4"></li>';
                inspectedNode += '<li id="li5">';
                    inspectedNode += '<ul>';
                        inspectedNode += '<li id="li6"></li>';
                        inspectedNode += '<li id="li7"></li>';
                        inspectedNode += '<li id="li8"></li>';
                    inspectedNode += '</ul>';
                inspectedNode += '</li>';
                inspectedNode += '<li id="li9"></li>';
            inspectedNode += '</ul>';

            var insertednode = window.document.body.append(inspectedNode);

            var li1 = window.document.getElement('#li1');
            var li5 = window.document.getElement('#li5');
            var li6 = window.document.getElement('#li6');
            var li9 = window.document.getElement('#li9');
            expect(li1.compareDocumentPosition(li5)).to.be.equal(4, 'li1 v.s. li5');
            expect(li1.compareDocumentPosition(li6)).to.be.equal(4, 'li1 v.s. li6');
            expect(li9.compareDocumentPosition(li5)).to.be.equal(2, 'li9 v.s. li5');
            expect(li9.compareDocumentPosition(li6)).to.be.equal(2, 'li9 v.s. li6');
            insertednode.remove();

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
            nodeSub3.empty();
            expect(nodeSub3.innerHTML).to.be.eql('');
        });

        it('empty deep', function () {
            node.empty();
            expect(node.innerHTML).to.be.eql('');
        });

        it('first', function () {
            expect(nodeSub1.first()).to.be.eql(nodeSub1);
            expect(nodeSub2.first()).to.be.eql(nodeSub1);
            expect(nodeSub3.first()).to.be.eql(nodeSub1);
        });

        it('first with container', function () {
            expect(nodeSub1.first(null, node)).to.be.eql(nodeSub1);
            expect(nodeSub3.first(null, node)).to.be.eql(nodeSub1);
            expect(nodeSub3Sub.first(null, node)).to.be.eql(nodeSub1);
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

        it('getAttr for itags', function () {
            var nodeDefinition = '<div><div></div><div></div><i-dummytag><div></div></i-dummytag><div></div></div>',
                newNode = window.document.body.append(nodeDefinition);
            expect(newNode.getAll('div').length).to.be.eql(4);
            expect(newNode.getElement('i-dummytag').getAll('div').length).to.be.eql(1);
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
            expect(nodeSub3.getElement('~ div')===undefined).to.be.true;

            expect(nodeSub1.getElement('+ div')).to.be.eql(nodeSub2);
            expect(nodeSub2.getElement('+ div')).to.be.eql(nodeSub3);
            expect(nodeSub3.getElement('+ div')===undefined).to.be.true;

            expect(nodeSub1.getElement('> div')===undefined).to.be.true;
            expect(nodeSub3.getElement('> div')).to.be.eql(nodeSub3Sub);

            expect(node.getElement('>div >div')).to.be.eql(nodeSub3Sub);
            expect(node.getElement('>div div')).to.be.eql(nodeSub3Sub);
            expect(node.getElement('div >div')).to.be.eql(nodeSub3Sub);
            expect(node.getElement('div div')).to.be.eql(nodeSub3Sub);

            expect(node.getElement(':not(.green)')).to.be.eql(nodeSub3);
            // check another issue that went wrong:
            var el = window.document.body.append('<div style="opacity:0;"><span id="check-element" class="red" data-x="2"></span></div>');
            var spannode = window.document.getElement('#check-element');
            expect(el.getElement('.red[data-x]')).to.be.equal(spannode);
            expect(el.getElement('.red[data-x="2"]')).to.be.equal(spannode);
            expect(el.getElement('[data-x].red')).to.be.equal(spannode);
            expect(el.getElement('[data-x="2"].red')).to.be.equal(spannode);
            el.remove();
        });

        it('getElement for itags', function () {
            var nodeDefinition = '<div><div></div><div></div><i-dummytag><div id="innerid" class="inner"></div></i-dummytag><div></div></div>',
                newNode = window.document.body.append(nodeDefinition);
            expect(newNode.getElement('div.inner')===undefined).to.be.false;
            expect(newNode.getElement('i-dummytag').getElement('div.inner')===undefined).to.be.false;
            expect(newNode.getElement('#innerid')===null).to.be.false;
            expect(newNode.getElement('i-dummytag').getElement('#innerid')===null).to.be.false;
        });

        it('getElementById', function () {
            expect(node.getElementById('sub1')).to.be.eql(nodeSub1);
            expect(node.getElementById('sub2')).to.be.eql(nodeSub2);
            expect(node.getElementById('sub3')).to.be.eql(nodeSub3);
            expect(node.getElementById('sub3sub')).to.be.eql(nodeSub3Sub);
        });

        it('getElementById for itags', function () {
            var nodeDefinition = '<div><div></div><div></div><i-dummytag><div id="innerid"></div></i-dummytag><div></div></div>',
                newNode = window.document.body.append(nodeDefinition);
            expect(newNode.getElementById('innerid')===null).to.be.false;
            expect(newNode.getElement('i-dummytag').getElementById('innerid')===null).to.be.false;
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

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
                expect(node2.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
                expect(node2.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');
            }
            else {
                expect(node2.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
            }

            node3 = window.document.createElement('div');
            node3.setAttribute('style', ':before {color: #00F; font-weight: bold;}');
            window.document.body.appendChild(node3);

            expect(node3.getInlineStyle('color')===undefined).to.be.true;
            expect(node3.getInlineStyle('font-weight')===undefined).to.be.true;
            expect(node3.getInlineStyle('fontWeight')===undefined).to.be.true;

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(node3.getInlineStyle('color', ':before')).to.be.eql('#00F');
                expect(node3.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
                expect(node3.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');
            }
            else {
                expect(node3.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(node3.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node3.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
            }

            window.document.body.removeChild(node2);
            window.document.body.removeChild(node3);
        });

        it('getInlineTransition', function () {
            expect(nodeSub1.getInlineTransition('width')===undefined).to.be.true;

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s; color: #AAA;');
            expect(nodeSub1.getInlineTransition('width')).to.be.eql({duration: 1, timingFunction: 'lineair', delay: 2});
            expect(nodeSub1.getInlineTransition('height')).to.be.eql({duration: 3});
            expect(nodeSub1.getInlineStyle('color')).to.be.eql('#AAA');

            nodeSub1.setAttr('style', 'background-color: #DDD; '+VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s; color: #AAA;');
            expect(nodeSub1.getInlineTransition('width')).to.be.eql({duration: 1, timingFunction: 'lineair', delay: 2});
            expect(nodeSub1.getInlineTransition('height')).to.be.eql({duration: 3});
            expect(nodeSub1.getInlineStyle('color')).to.be.eql('#AAA');
            expect(nodeSub1.getInlineStyle('background-color')).to.be.eql('#DDD');

            nodeSub1.setAttr('style', 'background-color: #DDD; '+VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s;');
            expect(nodeSub1.getInlineTransition('width')).to.be.eql({duration: 1, timingFunction: 'lineair', delay: 2});
            expect(nodeSub1.getInlineTransition('height')).to.be.eql({duration: 3});
            expect(nodeSub1.getInlineStyle('background-color')).to.be.eql('#DDD');

            nodeSub1.setAttr('style', '{background-color: #DDD; '+VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s;} :before {color: #FF0; '+VENDOR_TRANSITION_PROPERTY+': width 4s ease-in 6s, height 10s;}');
            expect(nodeSub1.getInlineTransition('width')).to.be.eql({duration: 1, timingFunction: 'lineair', delay: 2});
            expect(nodeSub1.getInlineTransition('height')).to.be.eql({duration: 3});
            expect(nodeSub1.getInlineStyle('background-color')).to.be.eql('#DDD');
            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.getInlineTransition('width', ':before')).to.be.eql({duration: 4, timingFunction: 'ease-in', delay: 6});
                expect(nodeSub1.getInlineTransition('height', ':before')).to.be.eql({duration: 10});
                expect(nodeSub1.getInlineStyle('color', ':before')).to.be.eql('#FF0');
            }
            else {
                expect(nodeSub1.getInlineTransition('width', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineTransition('height', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('color', ':before')===undefined).to.be.true;
            }
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
            expect(node.getStyle('dummy')===undefined).to.be.true;
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

        it('getTransition', function () {
            node.prepend('<style type="text/css">#ITSA div {color: #F00; '+VENDOR_TRANSITION_PROPERTY+': opacity 2.2s ease-out 3s;} #ITSA div:before {'+VENDOR_TRANSITION_PROPERTY+': top 2.3s;}</style>');

            expect(nodeSub1.getTransition('width')===undefined).to.be.true;
            expect(nodeSub1.getTransition('opacity').duration).to.be.eql(2.2);
            expect(nodeSub1.getTransition('top', ':before').duration).to.be.eql(2.3);
            expect(nodeSub1.getTransition('opacity', ':before')===undefined).to.be.true;
            expect(nodeSub1.getTransition('top')===undefined).to.be.true;

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s; color: #AAA;');
            expect(nodeSub1.getTransition('width').duration).to.be.eql(1);
            expect(nodeSub1.getTransition('height').duration).to.be.eql(3);
            expect(nodeSub1.getTransition('top', ':before').duration).to.be.eql(2.3);
            expect(nodeSub1.getTransition('opacity', ':before')===undefined).to.be.true;
        });

        it('getTransition with "all"', function () {
            node.prepend('<style type="text/css">#ITSA div {color: #F00; '+VENDOR_TRANSITION_PROPERTY+': all 2.2s ease-out 3s;} #ITSA div:before {'+VENDOR_TRANSITION_PROPERTY+': all 2.3s;}</style>');

            expect(nodeSub1.getTransition('width').duration).to.be.eql(2.2);
            expect(nodeSub1.getTransition('opacity').duration).to.be.eql(2.2);
            expect(nodeSub1.getTransition('top', ':before').duration).to.be.eql(2.3);
            expect(nodeSub1.getTransition('opacity', ':before').duration).to.be.eql(2.3);
            expect(nodeSub1.getTransition('top').duration).to.be.eql(2.2);

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s; color: #AAA;');
            expect(nodeSub1.getTransition('width').duration).to.be.eql(1);
            expect(nodeSub1.getTransition('height').duration).to.be.eql(3);
            expect(nodeSub1.getTransition('top', ':before').duration).to.be.eql(2.3);
            expect(nodeSub1.getTransition('opacity', ':before').duration).to.be.eql(2.3);
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
            var inputNode = window.document.createElement('input');
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

        it('hasFocusInside', function () {
            var inputNode = window.document.createElement('input');
            nodeSub3.appendChild(inputNode);
            expect(node.hasFocusInside()).to.be.false;
            expect(nodeSub1.hasFocusInside()).to.be.false;
            expect(nodeSub2.hasFocusInside()).to.be.false;
            expect(nodeSub3.hasFocusInside()).to.be.false;
            expect(nodeSub3Sub.hasFocusInside()).to.be.false;
            expect(inputNode.hasFocusInside()).to.be.false;

            inputNode.focus();
            expect(node.hasFocusInside()).to.be.true;
            expect(nodeSub1.hasFocusInside()).to.be.false;
            expect(nodeSub2.hasFocusInside()).to.be.false;
            expect(nodeSub3.hasFocusInside()).to.be.true;
            expect(nodeSub3Sub.hasFocusInside()).to.be.false;
            expect(inputNode.hasFocusInside()).to.be.false;
        });

        it('hasInlineStyle', function () {
            expect(node.hasInlineStyle('position')).to.be.true;
            expect(node.hasInlineStyle('border')).to.be.false;
            node.setInlineStyle('color', '#F00', ':before');
            expect(node.hasInlineStyle('position', ':before')).to.be.false;
            expect(node.hasInlineStyle('color', ':before')).to.be.true;
        });

        it('hasInlineTransition', function () {
            nodeSub1.setInlineStyle('width', '24px');
            expect(nodeSub1.hasInlineTransition('width')).to.be.false;

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, height 6s; color: #AAA;');
            expect(nodeSub1.hasInlineTransition('width')).to.be.true;
            expect(nodeSub1.hasInlineTransition('height')).to.be.true;
            expect(nodeSub1.hasInlineStyle('color')).to.be.true;
            expect(nodeSub1.hasInlineTransition('opacity')).to.be.false;
            expect(nodeSub1.hasInlineStyle('font-size')).to.be.false;

            nodeSub1.setAttr('style', 'background-color: #DDD; '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, margin-top 6s; color: #AAA;');
            expect(nodeSub1.hasInlineStyle('background-color')).to.be.true;
            expect(nodeSub1.hasInlineTransition('width')).to.be.true;
            expect(nodeSub1.hasInlineTransition('margin-top')).to.be.true;
            expect(nodeSub1.hasInlineTransition('marginTop')).to.be.true;
            expect(nodeSub1.hasInlineTransition('margin-bottom')).to.be.false;
            expect(nodeSub1.hasInlineTransition('marginBottom')).to.be.false;
            expect(nodeSub1.hasInlineStyle('color')).to.be.true;
            expect(nodeSub1.hasInlineTransition('opacity')).to.be.false;
            expect(nodeSub1.hasInlineStyle('font-size')).to.be.false;

            nodeSub1.setAttr('style', 'background-color: #DDD; '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, height 6s;');
            expect(nodeSub1.hasInlineStyle('background-color')).to.be.true;
            expect(nodeSub1.hasInlineTransition('width')).to.be.true;
            expect(nodeSub1.hasInlineTransition('height')).to.be.true;
            expect(nodeSub1.hasInlineStyle('color')).to.be.false;
            expect(nodeSub1.hasInlineTransition('opacity')).to.be.false;
            expect(nodeSub1.hasInlineStyle('font-size')).to.be.false;


            nodeSub1.setAttr('style', '{'+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, height 6s; color: #AAA;} :before {background-color: #EEE; '+VENDOR_TRANSITION_PROPERTY+': width 12s ease-out 14s, margin-top 16s;}');
            expect(nodeSub1.hasInlineTransition('width')).to.be.true;
            expect(nodeSub1.hasInlineTransition('height')).to.be.true;
            expect(nodeSub1.hasInlineStyle('color')).to.be.true;
            expect(nodeSub1.hasInlineTransition('opacity')).to.be.false;
            expect(nodeSub1.hasInlineStyle('font-size')).to.be.false;

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.hasInlineTransition('width', ':before')).to.be.true;
                expect(nodeSub1.hasInlineTransition('margin-top', ':before')).to.be.true;
                expect(nodeSub1.hasInlineTransition('marginTop', ':before')).to.be.true;
                expect(nodeSub1.hasInlineStyle('color', ':before')).to.be.false;
                expect(nodeSub1.hasInlineStyle('background-color', ':before')).to.be.true;
                expect(nodeSub1.hasInlineTransition('opacity', ':before')).to.be.false;
                expect(nodeSub1.hasInlineStyle('font-size', ':before')).to.be.false;
            }
            else {
                expect(nodeSub1.hasInlineTransition('width', ':before')).to.be.false;
                expect(nodeSub1.hasInlineTransition('margin-top', ':before')).to.be.false;
                expect(nodeSub1.hasInlineTransition('marginTop', ':before')).to.be.false;
                expect(nodeSub1.hasInlineStyle('color', ':before')).to.be.false;
                expect(nodeSub1.hasInlineStyle('background-color', ':before')).to.be.false;
                expect(nodeSub1.hasInlineTransition('opacity', ':before')).to.be.false;
                expect(nodeSub1.hasInlineStyle('font-size', ':before')).to.be.false;
            }
        });

        it('hasTransition', function () {
            node.prepend('<style type="text/css">#ITSA div {color: #F00; '+VENDOR_TRANSITION_PROPERTY+': opacity 2.2s ease-out 3s;} #ITSA div:before {'+VENDOR_TRANSITION_PROPERTY+': top 2.3s;}</style>');

            expect(nodeSub1.hasTransition('width')).to.be.false;
            expect(nodeSub1.hasTransition('opacity')).to.be.true;
            expect(nodeSub1.hasTransition('top', ':before')).to.be.true;
            expect(nodeSub1.hasTransition('opacity', ':before')).to.be.false;
            expect(nodeSub1.hasTransition('top')).to.be.false;

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s; color: #AAA;');
            expect(nodeSub1.hasTransition('width')).to.be.true;
            expect(nodeSub1.hasTransition('height')).to.be.true;
            expect(nodeSub1.hasTransition('opacity')).to.be.false;
            expect(nodeSub1.hasTransition('top', ':before')).to.be.true;
            expect(nodeSub1.hasTransition('opacity', ':before')).to.be.false;
        });

        it('hasTransition with "all"', function () {
            node.prepend('<style type="text/css">#ITSA div {color: #F00; '+VENDOR_TRANSITION_PROPERTY+': all 2.2s ease-out 3s;} #ITSA div:before {'+VENDOR_TRANSITION_PROPERTY+': all 2.3s;}</style>');

            expect(nodeSub1.hasTransition('width')).to.be.true;
            expect(nodeSub1.hasTransition('opacity')).to.be.true;
            expect(nodeSub1.hasTransition('top', ':before')).to.be.true;
            expect(nodeSub1.hasTransition('opacity', ':before')).to.be.true;
            expect(nodeSub1.hasTransition('top')).to.be.true;

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 1s lineair 2s, height 3s; color: #AAA;');
            expect(nodeSub1.hasTransition('width')).to.be.true;
            expect(nodeSub1.hasTransition('height')).to.be.true;
            expect(nodeSub1.hasTransition('opacity')).to.be.false;
            expect(nodeSub1.hasTransition('top', ':before')).to.be.true;
            expect(nodeSub1.hasTransition('opacity', ':before')).to.be.true;

            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': all 3s; color: #AAA;');
            expect(nodeSub1.hasTransition('width')).to.be.true;
            expect(nodeSub1.hasTransition('height')).to.be.true;
            expect(nodeSub1.hasTransition('opacity')).to.be.true;
            expect(nodeSub1.hasTransition('top', ':before')).to.be.true;
            expect(nodeSub1.hasTransition('opacity', ':before')).to.be.true;
        });

        it('inDOM', function () {
            expect(nodeSub1.inDOM()).to.be.true;
            expect(window.document.createElement('tag').inDOM()).to.be.false;
            nodeSub1.remove();
            expect(nodeSub1.inDOM()).to.be.false;
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

            var extranode = window.document.body.append('<ul id="extra0" style="opacity: 0;"><li><ul id="extra1"><li id="extra2"></li></ul></li></ul>');
            var extra0 = window.document.getElement('#extra0');
            var extra1 = window.document.getElement('#extra1');
            expect(extra1.inside('>li >ul')).to.be.false;
            expect(window.document.getElement('#extra2').inside('>li >ul')).to.be.equal(extra1);
            extranode.remove();
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

        it('last with container', function () {
            expect(nodeSub1.last(null, node)).to.be.eql(nodeSub3Sub);
            expect(nodeSub3.last(null, node)).to.be.eql(nodeSub3Sub);
            expect(nodeSub3Sub.last(null, node)).to.be.eql(nodeSub3Sub);
        });
        it('lastOfChildren', function () {
            expect(node.lastOfChildren()).to.be.eql(nodeSub3);
            expect(nodeSub1.lastOfChildren()===null).to.be.true;
            expect(nodeSub3.lastOfChildren()).to.be.eql(nodeSub3Sub);
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
            expect(nodeSub1.matches('>div >div')).to.be.true;
            expect(nodeSub1.matches('>div div')).to.be.true;
            expect(nodeSub1.matches('div >div')).to.be.true;
            expect(nodeSub1.matches('div div')).to.be.true;
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
            expect(nodeSub3.next()===undefined).to.be.true;
            expect(nodeSub1.next(':not(.green)')).to.be.eql(nodeSub3);

            expect(nodeSub1.next('> div')===null).to.be.true;
            expect(nodeSub3.next('> div')===null).to.be.true;

            expect(nodeSub1.next('+ div')).to.eql(nodeSub2);
            expect(nodeSub1.next('+ div')).to.eql(nodeSub2);

            expect(nodeSub2.next('~ div')).to.eql(nodeSub3);
            expect(nodeSub2.next('~ div')).to.eql(nodeSub3);
        });

        it('next with container', function () {
            var inspectedNode = '<ul style="opacity: 0;">';
                inspectedNode += '<li id="li-1"></li>';
                inspectedNode += '<li id="li-2"></li>';
                inspectedNode += '<li id="li-3"></li>';
                inspectedNode += '<li id="li-4"></li>';
                inspectedNode += '<li id="li-5">';
                    inspectedNode += '<ul>';
                        inspectedNode += '<li id="li-6"></li>';
                        inspectedNode += '<li id="li-7"></li>';
                        inspectedNode += '<li id="li-8">';
                           inspectedNode += '<ul id="ul-1">';
                                inspectedNode += '<li id="li-9"></li>';
                                inspectedNode += '<li id="li-10"></li>';
                           inspectedNode += '</ul>';
                        inspectedNode += '</li>';
                        inspectedNode += '<li id="li-11"></li>';
                        inspectedNode += '<li id="li-12"></li>';
                    inspectedNode += '</ul>';
                inspectedNode += '</li>';
                inspectedNode += '<li id="li-13"></li>';
                inspectedNode += '<li id="li-14">';
                    inspectedNode += '<ul id="ul-2">';
                        inspectedNode += '<li id="li-15"></li>';
                        inspectedNode += '<li id="li-16"></li>';
                    inspectedNode += '</ul>';
                inspectedNode += '</li>';
                inspectedNode += '<li id="li-17"></li>';
            inspectedNode += '</ul>';

            var insertednode = window.document.body.append(inspectedNode);
            var liNode = window.document.getElement('#li-3');

            for (var nr=4; nr<=17; nr++) {
                liNode = liNode.next('li', insertednode);
                expect(liNode.getId()).to.be.equal('li-'+nr);
            }

            liNode = window.document.getElement('#li-6');
            liNode = liNode.next('ul', insertednode);
            expect(liNode.getId()).to.be.equal('ul-1');

            liNode = window.document.getElement('#li-9');
            liNode = liNode.next('ul', insertednode);
            expect(liNode.getId()).to.be.equal('ul-2');

            insertednode.remove();
        });

        it('previous', function () {
            expect(nodeSub1.previous()===undefined).to.be.true;
            expect(nodeSub3.previous()).to.be.eql(nodeSub2);
            expect(nodeSub3.previous('.green')).to.be.eql(nodeSub2);
            expect(nodeSub3.previous(':not(.green)')===null).to.be.true;

            expect(nodeSub3.previous('> div')===null).to.be.true;
            expect(nodeSub1.previous('> div')===null).to.be.true;

            expect(nodeSub3.previous('+ div')).to.eql(nodeSub2);
            expect(nodeSub3.previous('+ div')).to.eql(nodeSub2);

            expect(nodeSub3.previous('~ div')).to.eql(nodeSub2);
            expect(nodeSub2.previous('~ div')===null).to.be.true;
        });

        it('previous with container', function () {
            var inspectedNode = '<ul style="opacity: 0;">';
                inspectedNode += '<li id="li-a1"></li>';
                inspectedNode += '<li id="li-a2"></li>';
                inspectedNode += '<li id="li-a3"></li>';
                inspectedNode += '<li id="li-a4"></li>';
                inspectedNode += '<li id="li-a5">';
                    inspectedNode += '<ul>';
                        inspectedNode += '<li id="li-a6"></li>';
                        inspectedNode += '<li id="li-a7"></li>';
                        inspectedNode += '<li id="li-a8">';
                           inspectedNode += '<ul>';
                                inspectedNode += '<li id="li-a9"></li>';
                                inspectedNode += '<li id="li-a10"></li>';
                           inspectedNode += '</ul>';
                        inspectedNode += '</li>';
                        inspectedNode += '<li id="li-a11"></li>';
                        inspectedNode += '<li id="li-a12"></li>';
                    inspectedNode += '</ul>';
                inspectedNode += '</li>';
                inspectedNode += '<li id="li-a13"></li>';
                inspectedNode += '<li id="li-a14">';
                    inspectedNode += '<ul>';
                        inspectedNode += '<li id="li-a15"></li>';
                        inspectedNode += '<li id="li-a16"></li>';
                    inspectedNode += '</ul>';
                inspectedNode += '</li>';
                inspectedNode += '<li id="li-a17"></li>';
                inspectedNode += '<li id="li-a18"></li>';
                inspectedNode += '<li id="li-a19"></li>';
                inspectedNode += '<li id="li-a20"></li>';
                inspectedNode += '<li id="li-a21"></li>';
            inspectedNode += '</ul>';

            var insertednode = window.document.body.append(inspectedNode);
            var liNode = window.document.getElement('#li-a19');

            for (var nr=18; nr>0; nr--) {
                liNode = liNode.previous('li', insertednode);
                expect(liNode.getId()).to.be.equal('li-a'+nr);
            }

            insertednode.remove();
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
            expect(nodeids.sub2).to.be.eql(nodeSub2);
            nodeSub2.remove();
            expect(node.childNodes.length).to.be.eql(2);
            expect(node.vnode.vChildNodes.length).to.be.eql(2);
            expect(node.childNodes[0]).to.be.eql(nodeSub1);
            expect(node.childNodes[1]).to.be.eql(nodeSub3);
            expect(node.vnode.vChildNodes[0].domNode).to.be.eql(nodeSub1);
            expect(node.vnode.vChildNodes[1].domNode).to.be.eql(nodeSub3);
            expect(nodeids.sub2).to.be.eql(nodeSub2); // should still exist: will be removed after 60 sec
            expect(nodeSub2.vnode.destroyed).to.be.true;
            expect(nodeSub2.vnode.removedFromDOM).to.be.true;
        });

        it('remove and reinsert', function () {
            var removedNode = nodeSub3.remove();
            node.prepend(removedNode);
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.vnode.vChildNodes.length).to.be.eql(3);
            expect(node.childNodes[0]).to.be.eql(nodeSub3);
            expect(node.childNodes[1]).to.be.eql(nodeSub1);
            expect(node.childNodes[2]).to.be.eql(nodeSub2);
            expect(node.vnode.vChildNodes[0].domNode).to.be.eql(nodeSub3);
            expect(node.vnode.vChildNodes[1].domNode).to.be.eql(nodeSub1);
            expect(node.vnode.vChildNodes[2].domNode).to.be.eql(nodeSub2);

            expect(node.vnode.vChildNodes[0].vChildNodes.length).to.be.eql(2);
            expect(node.vnode.vChildNodes[0].vChildNodes[0]).to.be.eql(nodeSub3Sub.vnode);
            expect(node.vnode.vChildNodes[0].vChildNodes[1]).to.be.eql(nodeSub3SubText.vnode);

            expect(nodeids.sub3).to.be.eql(nodeSub3);
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
            expect(nodeids.sub2).to.be.eql(nodeSub2);
            node.removeChild(nodeSub2);
            expect(node.childNodes.length).to.be.eql(2);
            expect(node.vnode.vChildNodes.length).to.be.eql(2);
            expect(node.childNodes[0]).to.be.eql(nodeSub1);
            expect(node.childNodes[1]).to.be.eql(nodeSub3);
            expect(node.vnode.vChildNodes[0].domNode).to.be.eql(nodeSub1);
            expect(node.vnode.vChildNodes[1].domNode).to.be.eql(nodeSub3);
            expect(nodeids.sub2).to.be.eql(nodeSub2); // should still exist: will be removed after 60 sec
            expect(nodeSub2.vnode.destroyed).to.be.true;
            expect(nodeSub2.vnode.removedFromDOM).to.be.true;
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

        it('removeId', function () {
            var n = nodeSub2.removeId();
            expect(n).to.be.eql(nodeSub2);
            expect(nodeSub2.id).to.be.eql('');
            expect(nodeSub2.vnode.attrs.id===undefined).to.be.true;
            expect(nodeSub2.getId()===undefined).to.be.true;
            expect(nodeids.sub2===undefined).to.be.true;
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
            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
                expect(node2.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
                expect(node2.getInlineStyle('fontWeight', ':before')).to.be.eql('bold');
                expect(node2.getInlineStyle('font-style', ':before')).to.be.eql('italic');
                expect(node2.getInlineStyle('fontStyle', ':before')).to.be.eql('italic');
                expect(node2.getInlineStyle('top', ':before')===undefined).to.be.true;
            }
            else {
                expect(node2.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-style', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontStyle', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('top', ':before')===undefined).to.be.true;
            }

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

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
                expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-style', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontStyle', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('top', ':before')===undefined).to.be.true;
            }
            else {
                expect(node2.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontWeight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-style', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('fontStyle', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('top', ':before')===undefined).to.be.true;
            }

            styles = node2._getAttribute('style');
            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                styles = styles.substr(1, styles.length-4).split('; } :before {');
                elementStyles = styles[0].split('; ');
            }
            else {
                styles = styles.substr(0, styles.length-1);
                elementStyles = styles.split('; ');
            }
            expect(elementStyles.length).to.be.eql(6);
            expect(elementStyles.indexOf('color: #F00')!==-1).to.be.true;
            expect(elementStyles.indexOf('position: absolute')!==-1).to.be.true;
            expect(elementStyles.indexOf('z-index: -1')!==-1).to.be.true;
            expect(elementStyles.indexOf('dummy')!==-1).to.be.false;
            expect(elementStyles.indexOf('left: 10px')!==-1).to.be.true;
            expect(elementStyles.indexOf('top: 30px')!==-1).to.be.false;
            expect(elementStyles.indexOf('height: 75px')!==-1).to.be.true;
            expect(elementStyles.indexOf('width: 150px')!==-1).to.be.true;

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                beforeStyles = styles[1].split('; ');
                expect(beforeStyles.length).to.be.eql(1);
                expect(beforeStyles.indexOf('color: #00F')!==-1).to.be.true;
                expect(beforeStyles.indexOf('font-weight: bold')!==-1).to.be.false;
                expect(beforeStyles.indexOf('font-style: italic')!==-1).to.be.false;
                expect(beforeStyles.indexOf('dummy')!==-1).to.be.false;
            }
            window.document.body.removeChild(node2);
        });

        it('removeInlineStyles', function (done) {
            var node2 = window.document.createElement('div');
            node2.setAttribute('style', '{color: #F00; top: 30px; height: 75px; width: 150px;}'+
                ' :before {color: #00F; font-weight: bold; font-style: italic; background-color: #DDD;}');
            window.document.body.appendChild(node2);

            node2.removeInlineStyles([
                {property: 'top'},
                {property: 'width'},
                {property: 'font-weight', pseudo: ':before'},
                {property: 'background-color', pseudo: ':before'}
            ]);

            expect(node2.getInlineStyle('color')).to.be.eql('#F00');
            expect(node2.getInlineStyle('top')===undefined).to.be.true;
            expect(node2.getInlineStyle('height')).to.be.eql('75px');
            expect(node2.getInlineStyle('width')===undefined).to.be.true;

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(node2.getInlineStyle('color', ':before')).to.be.eql('#00F');
                expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-style', ':before')).to.be.eql('italic');
                expect(node2.getInlineStyle('background-color', ':before')===undefined).to.be.true;
            }
            else {
                expect(node2.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('font-style', ':before')===undefined).to.be.true;
                expect(node2.getInlineStyle('background-color', ':before')===undefined).to.be.true;
            }

            node2.setAttribute('style', '{'+VENDOR_TRANSITION_PROPERTY+': all 2s; '+VENDOR_TRANSFORM_PROPERTY+': translateX(20px);}'+
                ' :before {'+VENDOR_TRANSITION_PROPERTY+': all 12s; '+VENDOR_TRANSFORM_PROPERTY+': translateX(120px);}');

            node2.removeInlineStyles([
                {property: 'transition'},
                {property: 'transform'},
                {property: 'transition', pseudo: ':before'},
                {property: 'transform', pseudo: ':before'}
            ], true).finally(
                function() {
                    expect(node2.getAttr('style')===null).to.be.true;
                    window.document.body.removeChild(node2);
                    done();
                }
            ).catch(function(err) {
                done(err);
            });
        });

        it('removeInlineTransition', function () {
            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, height 6s;');
            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': height 6s;');
            nodeSub1.setAttr('style', VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, height 6s;');
            nodeSub1.removeInlineTransition('height');
            expect(nodeSub1.getAttr('style')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');
            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')===null).to.be.true;
            nodeSub1.setAttr('style', 'color:#AAA; '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');
            nodeSub1.removeInlineTransition('width');
            expect(nodeSub1.getAttr('style')).to.be.eql('color: #AAA;');

            nodeSub1.setAttr('style', 'color:#AAA; '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');
            nodeSub1.removeInlineStyle('color');
            expect(nodeSub1.getAttr('style')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');

            nodeSub1.setAttr('style', '{color:#AAA; '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;} :before {color: #BBB; '+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s, opacity 25s;}');

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                nodeSub1.removeInlineTransition('opacity', ':before');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA; ', '').replace('color: #AAA;', '').replace(' color: #BBB; ', '').replace('color: #BBB;', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; }');
                expect(nodeSub1.getAttr('style').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;', '').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s;', '')).to.be.eql('{color: #AAA; } :before {color: #BBB; }');
                nodeSub1.removeInlineStyle('color');
                expect(nodeSub1.getAttr('style').replace(' color: #BBB; ', '').replace('color: #BBB;', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; }');
                expect(nodeSub1.getAttr('style').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;', '').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s;', '')).to.be.eql('{} :before {color: #BBB; }');
                nodeSub1.removeInlineStyle('color', ':before');
                expect(nodeSub1.getAttr('style')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; }');

                nodeSub1.removeInlineTransition('width');
                expect(nodeSub1.getAttr('style')).to.be.eql('{} :before {'+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; }');
            }
            else {
                nodeSub1.removeInlineTransition('opacity', ':before');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA; ', '').replace('color: #AAA;', '').replace(' color: #BBB; ', '').replace('color: #BBB;', '').trim()).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');
                expect(nodeSub1.getAttr('style').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;', '').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s;', '').trim()).to.be.eql('color: #AAA;');
                nodeSub1.removeInlineStyle('color');
                expect(nodeSub1.getAttr('style').replace(' color: #BBB; ', '').replace('color: #BBB;', '').trim()).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');
                expect(nodeSub1.getAttr('style').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;', '').replace(' '+VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s; ', '').replace(VENDOR_TRANSITION_PROPERTY+': width 12s ease-in 14s;', '').trim()).to.be.eql('');
                nodeSub1.removeInlineStyle('color', ':before');
                expect(nodeSub1.getAttr('style').trim()).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s;');

                nodeSub1.removeInlineTransition('width');
                expect(nodeSub1.getAttr('style')===null).to.be.true;
            }
            nodeSub1.removeInlineTransition('width', ':before');
            expect(nodeSub1.getAttr('style')===null).to.be.true;
        });


        it('removeInlineTransitions', function () {
            nodeSub1.setAttr('style', '{'+VENDOR_TRANSITION_PROPERTY+': width 2s ease-in 4s, height 6s, top 2s;} :before {'+VENDOR_TRANSITION_PROPERTY+': width 12s ease-out 14s, height 16s, top 12s;}');

            nodeSub1.removeInlineTransitions([
                {property: 'width'},
                {property: 'height'},
                {property: 'height', pseudo: ':before'},
                {property: 'top', pseudo: ':before'}
            ]);

            expect(nodeSub1.getInlineTransition('width')===undefined).to.be.true;
            expect(nodeSub1.getInlineTransition('height')===undefined).to.be.true;
            expect(nodeSub1.getInlineTransition('top')).to.be.eql({duration: 2});

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.getInlineTransition('height', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineTransition('top', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineTransition('width', ':before')).to.be.eql({duration: 12, timingFunction: 'ease-out', delay: 14});
            }
            else {
                expect(nodeSub1.getInlineTransition('height', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineTransition('top', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineTransition('width', ':before')===undefined).to.be.true;
            }
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
                n = cont.setAttr('style', 'position:absolute; left:10px; top: 30px; height: 75px; width: 150px;'),
                cont2 = window.document.createElement('div'),
                cont3 = window.document.createElement('div');
            window.document.body.appendChild(cont);

            expect(cont.outerHTML).to.be.eql('<div style="position: absolute; left: 10px; top: 30px; height: 75px; width: 150px;"></div>');
            expect(n).to.be.eql(cont);

            cont2.setAttr('style', 'position:absolute; '+VENDOR_TRANSFORM_PROPERTY+': translateX(12px) translateY(15px); width: 150px;');
            window.document.body.appendChild(cont2);
            expect(cont2.getAttr('style')).to.be.eql('position: absolute; '+VENDOR_TRANSFORM_PROPERTY+': translateX(12px) translateY(15px); width: 150px;');
            expect(cont2.outerHTML).to.be.eql('<div style="position: absolute; '+VENDOR_TRANSFORM_PROPERTY+': translateX(12px) translateY(15px); width: 150px;"></div>');

            cont3.setAttr('style', VENDOR_TRANSFORM_PROPERTY+': translateX(12px) translateY(15px);');
            window.document.body.appendChild(cont3);
            expect(cont3.getAttr('style')).to.be.eql(VENDOR_TRANSFORM_PROPERTY+': translateX(12px) translateY(15px);');
            expect(cont3.outerHTML).to.be.eql('<div style="'+VENDOR_TRANSFORM_PROPERTY+': translateX(12px) translateY(15px);"></div>');

            window.document.body.removeChild(cont);
            window.document.body.removeChild(cont2);
            window.document.body.removeChild(cont3);
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

            var newnode = node.append('<div id="test">hmm</div>');
            newnode.setHTML('<div>I am inner</div>');
            expect(newnode.childNodes.length).to.be.eql(1);
            expect(newnode.childNodes[0].childNodes.length).to.be.eql(1);
            expect(newnode.childNodes[0].innerHTML).to.be.eql('I am inner');
            expect(newnode.getHTML()).to.be.eql('<div>I am inner</div>');

            nodeSub2.setHTML('<button class="pure-button">choose</button><div><ul></ul></div>');
            expect(nodeSub2.innerHTML).to.be.eql('<button class="pure-button">choose</button><div><ul></ul></div>');

        });

        it('setId', function () {
            expect(node.id).to.be.eql('ITSA');
            expect(node.vnode.id).to.be.eql('ITSA');
            expect(node.vnode.attrs.id).to.be.eql('ITSA');
            expect(nodeids.ITSA).to.be.eql(node);
            expect(nodeids.ITSA2===undefined).to.be.true;
            node.setId('ITSA2');
            expect(node.id).to.be.eql('ITSA2');
            expect(node.vnode.id).to.be.eql('ITSA2');
            expect(node.vnode.attrs.id).to.be.eql('ITSA2');
            expect(nodeids.ITSA===undefined).to.be.true;
            expect(nodeids.ITSA2).to.be.eql(node);
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

            expect(node.setInlineStyle('color', '#333')).to.be.eql(node);

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

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                styles = styles.substr(1, styles.length-4).split('; } :before {');
                elementStyles = styles[0].split('; ');
            }
            else {
                styles = styles.substr(0, styles.length-1);
                elementStyles = styles.split('; ');
            }
            expect(elementStyles.length).to.be.eql(7);
            expect(elementStyles.indexOf('color: #333')!==-1).to.be.true;
            expect(elementStyles.indexOf('position: absolute')!==-1).to.be.true;
            expect(elementStyles.indexOf('z-index: -1')!==-1).to.be.true;
            expect(elementStyles.indexOf('dummy')!==-1).to.be.false;
            expect(elementStyles.indexOf('left: 10px')!==-1).to.be.true;
            expect(elementStyles.indexOf('top: 30px')!==-1).to.be.true;
            expect(elementStyles.indexOf('height: 75px')!==-1).to.be.true;
            expect(elementStyles.indexOf('width: 150px')!==-1).to.be.true;

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                beforeStyles = styles[1].split('; ');
                expect(beforeStyles.length).to.be.eql(3);
                expect(beforeStyles.indexOf('color: #AAA')!==-1).to.be.true;
                expect(beforeStyles.indexOf('font-weight: bold')!==-1).to.be.true;
                expect(beforeStyles.indexOf('font-style: italic')!==-1).to.be.true;
                expect(beforeStyles.indexOf('dummy')!==-1).to.be.false;
            }
        });

        it('setInlineStyles', function () {
            nodeSub1.setInlineStyle('opacity', '0.5');
            nodeSub1.setInlineStyles([
                {property: 'color', value: '#333'},
                {property: 'background-color', value: '#AAA'},
                {property: 'opacity'}, // erasing
                {property: 'font-weight', value: 'bold', pseudo: ':before'},
                {property: 'font-style', value: 'italic', pseudo: ':before'}
            ]);

            expect(nodeSub1.getInlineStyle('color')).to.be.eql('#333');
            expect(nodeSub1.getInlineStyle('background-color')).to.be.eql('#AAA');
            expect(nodeSub1.getInlineStyle('opacity')===undefined).to.be.true;
            expect(nodeSub1.getInlineStyle('font-weight')===undefined).to.be.true;
            expect(nodeSub1.getInlineStyle('font-style')===undefined).to.be.true;

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('background-color', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('opacity', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('font-weight', ':before')).to.be.eql('bold');
                expect(nodeSub1.getInlineStyle('font-style', ':before')).to.be.eql('italic');
            }
            else {
                expect(nodeSub1.getInlineStyle('color', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('background-color', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('opacity', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('font-weight', ':before')===undefined).to.be.true;
                expect(nodeSub1.getInlineStyle('font-style', ':before')===undefined).to.be.true;
            }

            nodeSub1.setInlineStyles([
                {property: 'height', value: '100px'},
                {property: 'transition', value: 'none'}
            ]);

            nodeSub1.setInlineStyles([
                {property: 'height', value: '100px'},
                {property: 'transform', value: 'none'}
            ]);

        });

        it('setInlineTransition', function () {
            var styles, elementStyles, beforeStyles;

            nodeSub1.setInlineTransition('width', 1);
            expect(nodeSub1.getAttr('style')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 1s;');

            nodeSub1.setInlineTransition('height', 2);
            expect(nodeSub1.getAttr('style').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': height 2s;');
            expect(nodeSub1.getAttr('style').replace(' height 2s,', '').replace(', height 2s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 1s;');

            nodeSub1.setInlineStyle('color', '#AAA');
            expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': height 2s;');
            expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 2s,', '').replace(', height 2s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 1s;');
            expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 2s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('color: #AAA;');

            nodeSub1.setInlineTransition('width', 3, null, null, ':before');
            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': height 2s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 2s,', '').replace(', height 2s', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': width 1s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
                expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 2s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('{color: #AAA; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
            }
            else {
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': height 2s;');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 2s,', '').replace(', height 2s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 1s;');
                expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 2s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('color: #AAA;');
            }

            nodeSub1.setInlineTransition('height', 8, 'ease-in', 4);
            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': height 8s ease-in 4s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 8s ease-in 4s,', '').replace(', height 8s ease-in 4s', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': width 1s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
                expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 8s ease-in 4s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('{color: #AAA; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
            }
            else {
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': height 8s ease-in 4s;');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 8s ease-in 4s,', '').replace(', height 8s ease-in 4s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 1s;');
                expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 8s ease-in 4s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('color: #AAA;');
            }
        });

        it('setInlineTransitions', function () {
            var styles, elementStyles, beforeStyles;

            nodeSub1.setInlineTransitions([
                {property: 'width', duration: 1},
                {property: 'height', duration: 8, timingFunction: 'ease-in', delay: 4},
                {property: 'width', duration: 3, pseudo: ':before'}
            ]);
            nodeSub1.setInlineStyle('color', '#AAA');

            if (SUPPORT_INLINE_PSEUDO_STYLES) {
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': height 8s ease-in 4s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 8s ease-in 4s,', '').replace(', height 8s ease-in 4s', '')).to.be.eql('{'+VENDOR_TRANSITION_PROPERTY+': width 1s; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
                expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 8s ease-in 4s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('{color: #AAA; } :before {'+VENDOR_TRANSITION_PROPERTY+': width 3s; }');
            }
            else {
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' width 1s,', '').replace(', width 1s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': height 8s ease-in 4s;');
                expect(nodeSub1.getAttr('style').replace(' color: #AAA;', '').replace('color: #AAA;', '').replace(' height 8s ease-in 4s,', '').replace(', height 8s ease-in 4s', '')).to.be.eql(VENDOR_TRANSITION_PROPERTY+': width 1s;');
                expect(nodeSub1.getAttr('style').replace('width 1s', '').replace('height 8s ease-in 4s', '').replace(VENDOR_TRANSITION_PROPERTY+': , ; ', '')).to.be.eql('color: #AAA;');
            }
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
            expect(nodeids.sub3).to.be.eql(nodeSub3);
            expect(nodeids.sub3sub).to.be.eql(nodeSub3Sub);
            nodeSub3.setText('ok <b>here we go</b>');
            expect(nodeSub3.outerHTML).to.be.eql('<div id="sub3">ok &lt;b&gt;here we go&lt;/b&gt;</div>');
            expect(nodeSub3.vnode.vChildNodes.length).to.be.eql(1);
            expect(nodeids.sub3).to.be.eql(nodeSub3);
            expect(nodeids.sub3sub===undefined).to.be.true;
            nodeSub3.setText('');
            expect(nodeSub3.outerHTML).to.be.eql('<div id="sub3"></div>');
            expect(nodeSub3.vnode.vChildNodes.length).to.be.eql(0);
            nodeSub3.setText('ok <b>here we go</b>');
            expect(nodeSub3.outerHTML).to.be.eql('<div id="sub3">ok &lt;b&gt;here we go&lt;/b&gt;</div>');
            expect(nodeSub3.vnode.vChildNodes.length).to.be.eql(1);
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

        it('append TextNode', function () {
            var textNode = window.document.createTextNode(' new ');
            container.append(textNode);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth new ');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth new ');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[5].id).to.be.eql('ITSA-cont-sub3');
            expect(container.vnode.vChildNodes[5].id).to.be.eql('ITSA-cont-sub3');
        });

        it('append TextNode with element-ref', function () {
            var textNode = window.document.createTextNode(' new ');
            container.append(textNode, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div> new third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div> new third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[5].id).to.be.eql('ITSA-cont-sub3');
            expect(container.vnode.vChildNodes[5].id).to.be.eql('ITSA-cont-sub3');
        });

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

        it('append String starting with text', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.append(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                               'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                                    'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[7].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[7].vChildNodes.length).to.be.eql(3);
        });

        it('append String starting with text with element-ref', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.append(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[5].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[5].vChildNodes.length).to.be.eql(3);
        });

        it('append String starting with text escaped', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.append(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                'hi&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                'hi&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[6].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[6].vChildNodes===undefined).to.be.true;
        });

        it('append String ending with text', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            container.append(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                               '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                                                    '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi');
            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[7].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[7].vChildNodes.length).to.be.eql(3);
        });

        it('append String ending with text with element-ref', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            container.append(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>hithird<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div><div id="ITSA"><div id="sub1"></div><div id="sub2"></div>'+
                                               '<div id="sub3"><div id="sub3sub"></div>extra text</div></div>hithird<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[4].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[4].vChildNodes.length).to.be.eql(3);
        });

        it('append String ending with text escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            container.append(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;hi');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth'+
                '&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;hi');

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
        it('prepend TextNode', function () {
            var textNode = window.document.createTextNode(' new ');
            container.prepend(textNode);
            expect(container.innerHTML).to.eql(' new first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql(' new first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[1].id).to.be.eql('ITSA-cont-sub1');
            expect(container.vnode.vChildNodes[1].id).to.be.eql('ITSA-cont-sub1');
        });

        it('prepend TextNode with element-ref', function () {
            var textNode = window.document.createTextNode(' new ');
            container.prepend(textNode, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second new <div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second new <div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].id).to.be.eql('ITSA-cont-sub2');
            expect(container.vnode.vChildNodes[3].id).to.be.eql('ITSA-cont-sub2');
        });

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

        it('prepend String starting with text', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.prepend(node);
            expect(container.innerHTML).to.eql('hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[1].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[1].vChildNodes.length).to.be.eql(3);
        });

        it('prepend String starting with text with element-ref', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.prepend(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>secondhi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>secondhi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div><div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('prepend String starting with text escaped', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            container.prepend(node, true);
            expect(container.innerHTML).to.eql('hi&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.innerHTML).to.eql('hi&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[0].childNodes.length).to.be.eql(0);
            expect(container.vnode.vChildNodes[0].vChildNodes===undefined).to.be.true;
        });

        it('prepend String ending with text', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            container.prepend(node);
            expect(container.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi'+
                                               'first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(8);
            expect(container.vnode.vChildNodes.length).to.be.eql(8);
            expect(container.childNodes[0].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[0].vChildNodes.length).to.be.eql(3);
        });

        it('prepend String ending with text with element-ref', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            container.prepend(node, false, containerSub2);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div>hi<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3">'+
                                               '<div id="sub3sub"></div>extra text</div></div>hi<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(9);
            expect(container.vnode.vChildNodes.length).to.be.eql(9);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('prepend String ending with text escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            container.prepend(node, true);
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;hifirst<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;'+
                                               'extra text&lt;/div&gt;&lt;/div&gt;hifirst<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');

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
            expect(container.innerHTML).to.eql('&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;&lt;div id="ITSAb"&gt;&lt;div id="sub1b"&gt;&lt;/div&gt;&lt;div id="sub2b"&gt;&lt;/div&gt;&lt;div id="sub3b"&gt;&lt;div id="sub3subb"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;first<div id="ITSA-cont-sub1"></div>second<div id="ITSA-cont-sub2"></div>third<div id="ITSA-cont-sub3"></div>fourth');
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
        it('replace TextNode', function () {
            var textNode = window.document.createTextNode(' new ');
            containerSub2.replace(textNode);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second new third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second new third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

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

        it('replace String starting with text', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            containerSub2.replace(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>secondhi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>secondhi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('replace String starting with text escaped', function () {
            var node = 'hi<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>';
            containerSub2.replace(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>secondhi&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>secondhi&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;third<div id="ITSA-cont-sub3"></div>fourth');


            expect(container.childNodes.length).to.be.eql(5);
            expect(container.vnode.vChildNodes.length).to.be.eql(5);
            expect(container.childNodes[3]).to.be.eql(containerSub3);
        });

        it('replace String starting with text', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            containerSub2.replace(node);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hithird<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hithird<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.childNodes.length).to.be.eql(7);
            expect(container.vnode.vChildNodes.length).to.be.eql(7);
            expect(container.childNodes[3].childNodes.length).to.be.eql(3);
            expect(container.vnode.vChildNodes[3].vChildNodes.length).to.be.eql(3);
        });

        it('replace String starting with text escaped', function () {
            var node = '<div id="ITSA"><div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div>extra text</div></div>hi';
            containerSub2.replace(node, true);
            expect(container.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;hithird<div id="ITSA-cont-sub3"></div>fourth');
            expect(container.vnode.innerHTML).to.eql('first<div id="ITSA-cont-sub1"></div>second&lt;div id="ITSA"&gt;&lt;div id="sub1"&gt;&lt;/div&gt;&lt;div id="sub2"&gt;&lt;/div&gt;&lt;div id="sub3"&gt;&lt;div id="sub3sub"&gt;&lt;/div&gt;extra text&lt;/div&gt;&lt;/div&gt;hithird<div id="ITSA-cont-sub3"></div>fourth');


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

        it('replace Examine replaced node', function () {
            var newNode = nodeSub3.replace('<input>');
            expect(newNode.outerHTML).to.be.eql('<input>');
            expect(newNode.getOuterHTML()).to.be.eql('<input/>');
            expect(node.childNodes.indexOf(newNode)).to.be.eql(2);
            expect(node.vnode.vChildNodes.indexOf(newNode.vnode)).to.be.eql(2);
        });

        it('replace Examine replaced first node', function () {
            var newNode = nodeSub1.replace('<input>');
            expect(node.childNodes[0]).to.be.eql(newNode);
            expect(node.vnode.vChildNodes[0]).to.be.eql(newNode.vnode);
            expect(node.childNodes[1]).to.be.eql(nodeSub2);
            expect(node.vnode.vChildNodes[1]).to.be.eql(nodeSub2.vnode);
        });

    });

    describe('Mutation Observer', function () {
        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
            node.appendChild(window.document.createElement('div'));
            node.appendChild(window.document.createTextNode('some content'));
            node.appendChild(window.document.createComment('some comment'));
            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('processing new attribute', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._setAttribute('data-x', '10');
            }, 0);
            setTimeout(function() {
                expect(node.getAttr('data-x')).to.be.eql('10');
                done();
            }, 500);
        });

        it('processing attribute-change', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._setAttribute('id', 'ITSA1');
            }, 0);
            setTimeout(function() {
                expect(node.id).to.be.eql('ITSA1');
                expect(node.vnode.id).to.be.eql('ITSA1');
                expect(node.vnode.attrs.id).to.be.eql('ITSA1');
                expect(nodeids.ITSA===undefined).to.be.true;
                expect(nodeids.ITSA1).to.be.eql(node);
                done();
            }, 500);
        });

        it('processing removed attribute', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._removeAttribute('id');
            }, 0);
            setTimeout(function() {
                expect(node.id).to.be.eql('');
                expect(node.vnode.id===undefined).to.be.true;
                expect(node.vnode.attrs.id===undefined).to.be.true;
                expect(nodeids.ITSA===undefined).to.be.true;
                done();
            }, 500);
        });

        it('processing new Element', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._appendChild(window.document.createElement('div'));
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(4);
                expect(node.vnode.vChildNodes.length).to.be.eql(4);
                done();
            }, 500);
        });

        it('processing removed Element', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._removeChild(node.childNodes[0]);
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(2);
                // expect(node.vnode.vChildNodes.length).to.be.eql(2);
                done();
            }, 500);
        });

        it('processing new TextNode', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._appendChild(window.document.createTextNode('new content'));
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(4);
                expect(node.vnode.vChildNodes.length).to.be.eql(4);
                done();
            }, 500);
        });

        it('processing TextNode-change', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node.childNodes[1].nodeValue = 'itsa new content';
            }, 0);
            setTimeout(function() {
                expect(node.childNodes[1].nodeValue).to.be.eql('itsa new content');
                expect(node.vnode.vChildNodes[1].text).to.be.eql('itsa new content');
                done();
            }, 500);
        });

        it('processing removed TextNode', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._removeChild(node.childNodes[1]);
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(2);
                expect(node.vnode.vChildNodes.length).to.be.eql(2);
                done();
            }, 500);
        });

        it('processing new CommentNode', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._appendChild(window.document.createComment('new comment'));
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(4);
                expect(node.vnode.vChildNodes.length).to.be.eql(4);
                done();
            }, 500);
        });

        it('processing CommentNode-change', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node.childNodes[2].nodeValue = 'itsa new comment';
            }, 0);
            setTimeout(function() {
                expect(node.childNodes[2].nodeValue).to.be.eql('itsa new comment');
                expect(node.vnode.vChildNodes[2].text).to.be.eql('itsa new comment');
                done();
            }, 500);
        });

        it('processing removed CommentNode', function (done) {
            // need to async --> because that will make node._nosync return to `false`.
            async(function() {
                node._removeChild(node.childNodes[2]);
            }, 0);
            setTimeout(function() {
                expect(node.childNodes.length).to.be.eql(2);
                expect(node.vnode.vChildNodes.length).to.be.eql(2);
                done();
            }, 500);
        });

    });


    describe('Promise return values with style transitions', function () {

        this.timeout(3000);

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: -9999px; top: -9999px; height: auto; width: 150px; background-color: #F00;">
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
            node.setAttribute('style', 'position: absolute; z-index: -1; left: -9999px; top: -9999px; height: auto; width: 500px; background-color: #F00;');
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

        it('check to return a Promise', function () {
            expect(node.setInlineStyle('color', '#333', null, true) instanceof window.Promise).to.be.true;
            expect(node.setInlineStyle('color', '#333', null, true) instanceof window.Node).to.be.false;
            expect(node.setInlineStyle('color', '#333') instanceof window.Promise).to.be.false;
            expect(node.setInlineStyle('color', '#333') instanceof window.Node).to.be.true;
        });

        it('Resolve when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('background-color', '#666', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('background-color', '#666', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when no initial value is defined and no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('color', '#F00', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is no initial value is defined and a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('color', '#F00', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when transitioned to the same value', function (done) {
            var delayed = false;
            node.setInlineTransition('width', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('width', '500px', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when transitioned to the same "auto" value', function (done) {
            var delayed = false;
            node.setInlineTransition('height', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('height', 'auto', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve in case of "auto"-->px property when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('height', '100px', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve in case of "auto"-->px property when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('height', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('height', '100px', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve in case of px-->"auto" property when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('width', 'auto', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve in case of px-->"auto" property when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('width', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('width', 'auto', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Return when no promise when transitioned to the same value', function () {
            node.setInlineTransition('width', 1);
            node.setInlineStyle('width', '500px');
        });

        it('Return when no promise when transitioned to the same "auto" value', function () {
            node.setInlineTransition('height', 1);
            node.setInlineStyle('height', 'auto');
        });

        it('Return when no promise in case of "auto"-->px property when no transition is defined', function () {
            node.setInlineStyle('height', '100px');
        });

        it('Return when no promise in case of "auto"-->px property when there is a transition is defined', function () {
            node.setInlineTransition('height', 1);
            node.setInlineStyle('height', '100px');
        });

        it('Return when no promise in case of px-->"auto" property when no transition is defined', function () {
            node.setInlineStyle('width', 'auto');
        });

        it('Resolve in case of px-->"auto" property when there is a transition is defined', function () {
            node.setInlineTransition('width', 1);
            node.setInlineStyle('width', 'auto');
        });

    });


    describe('Promise return values with transform transitions', function () {

        this.timeout(5000);

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: -9999px; top: -9999px; height: auto; width: 150px; background-color: #F00;">
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
            node.setAttribute('style', 'position: absolute; z-index: -1; left: -9999px; top: -9999px; '+VENDOR_TRANSFORM_PROPERTY+': rotate(30deg);');
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
            node.removeInlineStyle('transition');
            node.removeInlineStyle('transform');
            window.document.body.removeChild(node);
        });

        it('Resolve when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('transform', 'translateX(10px)', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('transform', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setInlineStyle('transform', 'translateX(10px)', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });


        it('Resolve when no initial value is defined and no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            nodeSub1.setInlineStyle('transform', 'translateX(10px)', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is no initial value is defined and a transition is defined', function (done) {
            var delayed = false;
            nodeSub1.setInlineTransition('transform', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            nodeSub1.setInlineStyle('transform', 'translateX(10px)', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

    });


    describe('Promise return values with removal style transitions', function () {

        this.timeout(5000);

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: -9999px; top: -9999px; height: auto; width: 150px; background-color: #F00;">
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
            node.setAttribute('style', 'position: absolute; z-index: -1; left: -9999px; top: -9999px; height: auto; width: 500px; background-color: #F00;');
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

        it('check to return a Promise', function () {
            expect(node.removeInlineStyle('background-color', null, true) instanceof window.Promise).to.be.true;
            expect(node.removeInlineStyle('background-color', null, true) instanceof window.Node).to.be.false;
            expect(node.removeInlineStyle('background-color') instanceof window.Promise).to.be.false;
            expect(node.removeInlineStyle('background-color') instanceof window.Node).to.be.true;
        });

        it('Resolve in case of "auto"-->"auto" property when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('height', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('height', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise in case of "auto"-->"auto" property when there is a transition is defined', function () {
            node.setInlineTransition('height', 1);
            node.removeInlineStyle('height');
        });

        it('Resolve when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('background-color', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('background-color', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise when there is a transition is defined', function () {
            node.setInlineTransition('background-color', 1);
            node.removeInlineStyle('background-color');
        });

        it('Resolve when no initial value is defined and no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('color', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is no initial value is defined and a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('color', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise when there is no initial value is defined and a transition is defined', function () {
            node.setInlineTransition('color', 1);
            node.removeInlineStyle('color');
        });

        it('Resolve in case of px-->"auto" property when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('width', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve in case of px-->"auto" property when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('width', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('width', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise in case of px-->"auto" property when there is a transition is defined', function () {
            node.setInlineTransition('width', 1);
            node.removeInlineStyle('width');
        });

        it('Resolve in case of "auto"-->px property when no transition is defined', function (done) {
            var delayed = false,
                styleNode = node.prepend('<style>#ITSA {height: 200px;}</style>');
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('height', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    styleNode.remove();
                    done();
                }
            ).catch(
                function(err) {
                    styleNode.remove();
                    done(new Error(err));
                }
            );
        });

        it('Resolve in case of "auto"-->px property when there is a transition is defined', function (done) {
            var delayed = false,
                styleNode = node.prepend('<style>#ITSA {height: 200px;}</style>');
            node.setInlineTransition('height', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('height', null, true).then(
                function() {
                    expect(delayed).to.be.true;
                    styleNode.remove();
                    done();
                }
            ).catch(
                function(err) {
                    styleNode.remove();
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise in case of "auto"-->px property when there is a transition is defined', function () {
            var styleNode = node.prepend('<style>#ITSA {height: 200px;}</style>');
            node.setInlineTransition('height', 1);
            node.removeInlineStyle('height');
        });

        it('Resolve in case of "px"-->"px" property when there is a transition is defined', function (done) {
            var delayed = false,
                styleNode = node.prepend('<style>#ITSA {width: 500px;}</style>');
            node.setInlineTransition('width', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('width', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    styleNode.remove();
                    done();
                }
            ).catch(
                function(err) {
                    styleNode.remove();
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise in case of "px"-->"px" property when there is a transition is defined', function () {
            var styleNode = node.prepend('<style>#ITSA {width: 500px;}</style>');
            node.setInlineTransition('width', 1);
            node.removeInlineStyle('width');
        });

    });


    describe('Promise return values with removal of transform transitions', function () {

        this.timeout(5000);

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: -9999px; top: -9999px; height: auto; width: 150px; background-color: #F00;">
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
            node.setAttribute('style', 'position: absolute; z-index: -1; left: -9999px; top: -9999px; transform: translateX(10px);');
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
            node.removeInlineStyle('transition');
            node.removeInlineStyle('transform');
            window.document.body.removeChild(node);
        });

        it('Resolve when no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeInlineStyle('transform', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is a transition is defined', function (done) {
            var delayed = false;
            node.setInlineTransition('transform', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            // we go async now --> seems FF sometimes has a problem when without
            setTimeout(function() {
                node.removeInlineStyle('transform', null, true).then(
                    function() {
                        expect(delayed).to.be.true;
                        done();
                    }
                ).catch(
                    function(err) {
                        done(new Error(err));
                    }
                );
            }, 50);
        });


        it('Resolve when no initial value is defined and no transition is defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            nodeSub1.removeInlineStyle('transform', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Resolve when there is no initial value is defined and a transition is defined', function (done) {
            var delayed = false;
            nodeSub1.setInlineTransition('transform', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            nodeSub1.removeInlineStyle('transform', null, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('Return without Promise when there is a transition is defined', function () {
            node.setInlineTransition('transform', 1);
            expect(node.removeInlineStyle('transform')).to.be.eql(node);
        });


        it('Return without Promise when there is no initial value is defined and a transition is defined', function () {
            nodeSub1.setInlineTransition('transform', 1);
            expect(nodeSub1.removeInlineStyle('transform')).to.be.eql(nodeSub1);
        });

    });

    describe('Classes and Promise return-values', function () {

        this.timeout(5000);

        before(function() {
            var inlineClass = '.red {background-color: #F00;} .blue {background-color: #00F;} .small {width: 50px;} .wide {width: 750px;}';
            cssnode = window.document.createElement('style');
            cssnode.setAttribute('type', 'text/css');
            cssnode.appendChild(window.document.createTextNode(inlineClass));
            window.document.body.appendChild(cssnode);
        });

        after(function() {
            window.document.body.removeChild(cssnode);
        });

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.setAttribute('style', 'position: absolute; z-index: -1; left: -9999px; top: -9999px;');
            window.document.body.appendChild(node);
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('check to return a Promise', function () {
            expect(node.setClass('blue', true) instanceof window.Promise).to.be.true;
            expect(node.setClass('blue') instanceof window.Promise).to.be.false;

            expect(node.removeClass('blue', true) instanceof window.Promise).to.be.true;
            expect(node.removeClass('blue') instanceof window.Promise).to.be.false;
            expect(node.toggleClass('blue', true, true) instanceof window.Promise).to.be.true;
            expect(node.toggleClass('blue', true) instanceof window.Promise).to.be.false;
            expect(node.toggleClass('blue', null, true) instanceof window.Promise).to.be.true;
            expect(node.toggleClass('blue') instanceof window.Promise).to.be.false;


            expect(node.replaceClass('blue', 'red', true, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', true) instanceof window.Promise).to.be.false;
            expect(node.replaceClass('blue', 'red', true, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', true) instanceof window.Promise).to.be.false;

            expect(node.replaceClass('blue', 'red', false, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', false) instanceof window.Promise).to.be.false;
            expect(node.replaceClass('blue', 'red', false, true) instanceof window.Promise).to.be.true;
            expect(node.replaceClass('blue', 'red', false) instanceof window.Promise).to.be.false;

        });

        it('setClass Transition delay and resolved promise from defined --> defined', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass Transition delay and resolved promise from undefined --> defined', function (done) {
            var delayed = false;
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass general Transition delay and resolved promise from defined --> defined', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('all', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass general Transition delay and resolved promise from undefined --> defined', function (done) {
            var delayed = false;
            node.setInlineTransition('all', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass otherTransition delay and resolved promise from defined --> defined', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass other Transition delay and resolved promise from undefined --> defined', function (done) {
            var delayed = false;
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass without Transition delay and resolved promise from defined --> defined', function (done) {
            var delayed = false;
            node.setClass('red');
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('setClass without Transition delay and resolved promise from undefined --> defined', function (done) {
            var delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.setClass(['blue', 'wide'], true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('removeClass with Transition all', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('all', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeClass('red', true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('removeClass with Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeClass('red', true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('removeClass with wrong Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeClass('red', true).then(
                function() {
                    expect(delayed).to.be.dalse;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('removeClass without Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.removeClass('red', true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('replaceClass with Transition all', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('all', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.replaceClass('red', 'blue', false, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('replaceClass with Transition property', function (done) {
            var delayed = false;
            node.setClass(['red', 'wide']);
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.replaceClass('red', 'blue', false, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('replaceClass with wrong Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.replaceClass('red', 'blue', false, true).then(
                function() {
                    expect(delayed).to.be.dalse;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('replaceClass without Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.replaceClass('red', 'blue', false, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('toggleClass with Transition all', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('all', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.toggleClass('red', false, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('toggleClass with Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('background-color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.toggleClass('red', false, true).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('toggleClass with wrong Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            node.setInlineTransition('color', 1);
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.toggleClass('red', false, true).then(
                function() {
                    expect(delayed).to.be.dalse;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

        it('toggleClass without Transition property', function (done) {
            var delayed = false;
            node.setClass('red');
            setTimeout(function() {
                delayed = true;
            }, 500);
            node.toggleClass('red', false, true).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(
                function(err) {
                    done(new Error(err));
                }
            );
        });

    });


}(global.window || require('node-win')));