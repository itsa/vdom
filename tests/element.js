/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);
    // require('../lib/extend-element.js')(window);
    // require('../lib/extend-document.js')(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        node;


    describe('Properties', function () {

        // Code to execute before every test.
        beforeEach(function() {
            node = window.document.createElement('div');
            node.id = 'marco';
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

        it('append', function () {
        });

        it('cloneNode', function () {
        });

        it('compareDocumentPosition', function () {
        });

        it('contains', function () {
        });

        it('createTreeWalker', function () {
        });

        it('defineInlineStyle', function () {
        });

        it('empty', function () {
        });

        it('first', function () {
        });

        it('firstOfChildren', function () {
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
        });

        it('matches', function () {
        });

        it('matchesSelector', function () {
        });

        it('next', function () {
        });

        it('prepend', function () {
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
        });

        it('removeData', function () {
        });

        it('removeInlineStyle', function () {
        });

        it('replace', function () {
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
        });

        it('setData', function () {
        });

        it('setId', function () {
        });

        it('setInlineStyle', function () {
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
        });

        it('toggleClass', function () {
        });

    });

}(global.window || require('node-win')));