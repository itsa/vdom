/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("js-ext/lib/object.js");
    require("../vdom.js")(window);
    // require('../lib/extend-element.js')(window);
    // require('../lib/extend-document.js')(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        NS = require('../lib/vdom-ns.js')(window),
        nodeids = NS.nodeids,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub;

    describe('Properties', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node._setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
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

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.className = 'red blue';
            // cautious: DO NOT call 'setAttribute here --> in that case node.vnode is calculated without any childNodes'
            // these childNodes will be there eventually (appendChild makes the mutationObserver to update), but that will be asynchronious
            // and in some cases too late!
            node._setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
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

            window.document.body.appendChild(node);
            var a  = node.vnode;
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('cloneNode', function () {
            var cloned, cloned2;
            node.setData('dummy', 10);
            nodeSub1.setData('dummySub', 20);
            nodeSub3Sub.setData('dummySubSub', 30);
            cloned = node.cloneNode(true);
            expect(cloned.innerHTML).to.eql('<div id="sub1"></div><div id="sub2"></div><div id="sub3"><div id="sub3sub"></div></div>');
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

            expect(walker.lastChild()).to.be.eql(nodeSub3Sub);

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

            expect(walker.lastChild()).to.be.eql(nodeSub3Sub);

            walker.parentNode(); // pointer is set to nodeSub3

            expect(walker.parentNode()).to.be.eql(node);
            expect(walker.lastChild()).to.be.eql(nodeSub3);
            expect(walker.previousSibling()).to.be.eql(nodeSub2);

            // now with a nodefiler
            walker = node.createTreeWalker(null, function(node) {return (node.id==='sub2') || (node.id==='sub3')});
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
            expect(node.getInlineStyle('position')==undefined).to.be.true;
            expect(node._getAttribute('style')).to.eql('z-index: 5; left: 80px;');

            expect(nodeSub2.getInlineStyle('z-index')).to.be.eql('15');
            expect(nodeSub2.getInlineStyle('position')==undefined).to.be.true;
            expect(nodeSub2._getAttribute('style')).to.eql('z-index: 15; left: 180px;');
        });

        it('empty single', function () {
            var nodeidSize = nodeids.size();
            nodeSub3.empty();
            expect(nodeSub3.innerHTML).to.be.eql('');
            expect(nodeids.size()).to.be.eql(nodeidSize-1);
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

        it('forceIntoNodeView', function () {
        });

        it('forceIntoView', function () {
        });

        it('getAll', function () {
        });

        it('getAttr', function () {
        });

        it('getAttrs', function () {
        });

        it('getAttribute', function () {
        });

        it('getChildren', function () {
        });

        it('getClassList', function () {
        });

        it('getData', function () {
        });

        it('getElement', function () {
        });

        it('getElementById', function () {
        });

        it('getId', function () {
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

        it('getInnerHTML', function () {
        });

        it('getOuterHTML', function () {
        });

        it('getParent', function () {
        });

        it('getStyle', function () {
        });

        it('getTagName', function () {
        });

        it('getText', function () {
        });

        it('getValue', function () {
        });

        it('hasAttr', function () {
        });

        it('hasAttribute', function () {
        });

        it('hasAttributes', function () {
        });

        it('hasChildren', function () {
        });

        it('hasClass', function () {
            expect(node.hasClass('red')).to.be.true;
            expect(node.hasClass('blue')).to.be.true;
            expect(node.hasClass('green')).to.be.false;
        });

        it('hasData', function () {
        });

        it('hasFocus', function () {
        });

        it('inside', function () {
        });

        it('insidePos', function () {
        });

        it('last', function () {
        });

        it('lastOfChildren', function () {
            expect(node.lastOfChildren()).to.be.eql(nodeSub3);
            expect(nodeSub1.lastOfChildren()===null).to.be.true;
            expect(nodeSub3.lastOfChildren()).to.be.eql(nodeSub3Sub);
        });

        it('matches', function () {
        });

        it('matchesSelector', function () {
        });

        it('next', function () {
        });

        it('previous', function () {
        });

        it('querySelector', function () {
        });

        it('querySelectorAll', function () {
        });

        it('rectangleInside', function () {
        });

        it('remove', function () {
        });

        it('removeAttr', function () {
        });

        it('removeAttribute', function () {
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
            node2.setAttribute('style', '{color: #F00; position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;} :before {color: #00F; font-weight: bold; font-style: italic;}');
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
        });

        it('scrollTo', function () {
        });

        it('setAttr', function () {
        });

        it('setAttribute', function () {
        });

        it('setClass', function () {
            var className;
            node.setClass('yellow');
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
        });

        it('setId', function () {
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

        it('setInnerHTML', function () {
        });

        it('setOuterHTML', function () {
        });

        it('setText', function () {
        });

        it('setValue', function () {
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
        });

    });

    describe('Append', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.className = 'red blue';
            // cautious: DO NOT call 'setAttribute here --> in that case node.vnode is calculated without any childNodes'
            // these childNodes will be there eventually (appendChild makes the mutationObserver to update), but that will be asynchronious
            // and in some cases too late!
            node._setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
                nodeSub1 = window.document.createElement('div');
                nodeSub1.id = 'sub1';
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                nodeSub2.id = 'sub2';
                node.appendChild(nodeSub2);

                nodeSub3 = window.document.createElement('div');
                nodeSub3.id = 'sub3';
                node.appendChild(nodeSub3);
            window.document.body.appendChild(node);
            var a  = node.vnode;
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('append Element', function () {
            var content = window.document.createElement('div');
            content.id = 'newdiv';
            node.append(content);
            expect(node.innerHTML).to.eql('<div id="sub1"></div><div id="sub2"></div><div id="sub3"></div><div id="newdiv"></div>');
            expect(node.childNodes.length).to.be.eql(4);
        });

        it('append Element with element-ref', function () {
            var content = window.document.createElement('div');
            content.id = 'newdiv';
            node.append(content, nodeSub2);
            expect(node.innerHTML).to.eql('<div id="sub1"><div id="newdiv"></div></div><div id="sub2"></div><div id="sub3"></div>');
            expect(node.childNodes.length).to.be.eql(4);
        });

        it('append Element escaped', function () {
        });

        it('append String', function () {
        });

        it('append String with element-ref', function () {
        });

        it('append String escaped', function () {
        });

        it('append ElementArray', function () {
        });

        it('append ElementArray with element-ref', function () {
        });

        it('append ElementArray escaped', function () {
        });

        it('append StringArray', function () {
        });

        it('append StringArray with element-ref', function () {
        });

        it('append StringArray escaped', function () {
        });
    });

    describe('Prepend', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.className = 'red blue';
            // cautious: DO NOT call 'setAttribute here --> in that case node.vnode is calculated without any childNodes'
            // these childNodes will be there eventually (appendChild makes the mutationObserver to update), but that will be asynchronious
            // and in some cases too late!
            node._setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
                nodeSub1 = window.document.createElement('div');
                nodeSub1.id = 'sub1';
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                nodeSub2.id = 'sub2';
                node.appendChild(nodeSub2);

                nodeSub3 = window.document.createElement('div');
                nodeSub3.id = 'sub3';
                node.appendChild(nodeSub3);
            window.document.body.appendChild(node);
            var a  = node.vnode;
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('prepend Element', function () {
        });

        it('prepend Element with element-ref', function () {
        });

        it('prepend Element escaped', function () {
        });

        it('prepend String', function () {
        });

        it('prepend String with element-ref', function () {
        });

        it('prepend String escaped', function () {
        });

        it('prepend ElementArray', function () {
        });

        it('prepend ElementArray with element-ref', function () {
        });

        it('prepend ElementArray escaped', function () {
        });

        it('prepend StringArray', function () {
        });

        it('prepend StringArray with element-ref', function () {
        });

        it('prepend StringArray escaped', function () {
        });
    });

    describe('Replace', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'ITSA';
            node.className = 'red blue';
            // cautious: DO NOT call 'setAttribute here --> in that case node.vnode is calculated without any childNodes'
            // these childNodes will be there eventually (appendChild makes the mutationObserver to update), but that will be asynchronious
            // and in some cases too late!
            node._setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
                nodeSub1 = window.document.createElement('div');
                nodeSub1.id = 'sub1';
                node.appendChild(nodeSub1);

                nodeSub2 = window.document.createElement('div');
                nodeSub2.id = 'sub2';
                node.appendChild(nodeSub2);

                nodeSub3 = window.document.createElement('div');
                nodeSub3.id = 'sub3';
                node.appendChild(nodeSub3);
            window.document.body.appendChild(node);
            var a  = node.vnode;
        });

        // Code to execute after every test.
        afterEach(function() {
            window.document.body.removeChild(node);
        });

        it('replace Element', function () {
        });

        it('replace Element with element-ref', function () {
        });

        it('replace Element escaped', function () {
        });

        it('replace String', function () {
        });

        it('replace String with element-ref', function () {
        });

        it('replace String escaped', function () {
        });

        it('replace ElementArray', function () {
        });

        it('replace ElementArray with element-ref', function () {
        });

        it('replace ElementArray escaped', function () {
        });

        it('replace StringArray', function () {
        });

        it('replace StringArray with element-ref', function () {
        });

        it('replace StringArray escaped', function () {
        });
    });

    describe('Mutation Observer', function () {

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