/*global describe, it, before, after  */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        body = window.document.body,
        container;

    //===============================================================

    describe('System-elements inside empty element', function () {

        before(function() {
            container = body.append('<div style="opacity: 0;"></div>');
            container.addSystemElement('<div class="system1"><div class="innerdiv"></div></div>');
            container.addSystemElement('<div class="system2"></div>');
        });

        after(function() {
            container.remove();
        });

        it('getHTML', function () {
            expect(container.getHTML()).to.be.equal('');
        });

        it('getOuterHTML', function () {
            expect(container.getOuterHTML()).to.be.equal('<div style="opacity: 0;"></div>');
        });

        it('getAll', function () {
            expect(container.getAll('div').length).to.be.equal(0);
        });

        it('getAll with protected', function () {
            expect(container.getAll('div', true).length).to.be.equal(3);
        });

        it('getElement', function () {
            expect(container.getElement('.system1')===undefined).to.be.true;
        });

        it('getElement childnode', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.true;
        });

        it('getElement with protected', function () {
            expect(container.getElement('.system1', true)===undefined).to.be.false;
        });

        it('getElement childnode with protected', function () {
            expect(container.getElement('.innerdiv', true)===undefined).to.be.false;
        });

        it('contains', function () {
            var checkNode = container.getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains innernode', function () {
            var checkNode = container.getChildren()[0].getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains with protected', function () {
            var checkNode = container.getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('contains innernode with protected', function () {
            var checkNode = container.getChildren()[0].getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('after empty(false)', function () {
            container.empty();
            expect(container.getAll('div', true).length).to.be.equal(3);
        });

        it('after empty(true)', function () {
            container.empty(false, true);
            expect(container.vnode.vChildNodes.length).to.be.equal(0);
        });

    });

    //===============================================================

    describe('System-elements inside non-empty element', function () {

        before(function() {
            container = body.append('<div style="opacity: 0;"><i>Hello</i> there.</div>');
            container.addSystemElement('<div class="system1"><div class="innerdiv"></div></div>');
            container.addSystemElement('<div class="system2"></div>');
            container.append(' How are you?');
            container.prepend('Hey, ');
            container.append('<div>And an inner div</div>');
            container.addSystemElement('<div class="system3"></div>');
        });

        after(function() {
            container.remove();
        });

        it('getHTML', function () {
            expect(container.getHTML()).to.be.equal('Hey, <i>Hello</i> there. How are you?<div>And an inner div</div>');
        });

        it('getOuterHTML', function () {
            expect(container.getOuterHTML()).to.be.equal('<div style="opacity: 0;">Hey, <i>Hello</i> there. How are you?<div>And an inner div</div></div>');
        });

        it('getAll', function () {
            expect(container.getAll('div').length).to.be.equal(1);
        });

        it('getAll with protected', function () {
            expect(container.getAll('div', true).length).to.be.equal(5);
        });

        it('getElement', function () {
            expect(container.getElement('.system1')===undefined).to.be.true;
        });

        it('getElement childnode', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.true;
        });

        it('getElement with protected', function () {
            expect(container.getElement('.system1', true)===undefined).to.be.false;
        });

        it('getElement childnode with protected', function () {
            expect(container.getElement('.innerdiv', true)===undefined).to.be.false;
        });

        it('contains', function () {
            var checkNode = container.getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains innernode', function () {
            var checkNode = container.getChildren()[0].getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains with protected', function () {
            var checkNode = container.getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('contains innernode with protected', function () {
            var checkNode = container.getChildren()[0].getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('after empty(false)', function () {
            container.empty();
            expect(container.getAll('div', true).length).to.be.equal(4);
        });

        it('after empty(true)', function () {
            container.empty(false, true);
            expect(container.vnode.vChildNodes.length).to.be.equal(0);
        });

    });

    //===============================================================

    describe('System-elements inside non-empty element when replaced', function () {

        before(function() {
            container = body.append('<div style="opacity: 0;"><i>Hello</i> there.</div>');
            container.addSystemElement('<div class="system1"><div class="innerdiv"></div></div>');
            container.addSystemElement('<div class="system2"></div>');
            container.append(' How are you?');
            container.prepend('Hey, ');
            container.append('<div>And an inner div</div>');
            container.addSystemElement('<div class="system3"></div>');
            container.setHTML('I am <b class="innerb">new</b> content');
        });

        after(function() {
            container.remove();
        });

        it('getHTML', function () {
            expect(container.getHTML()).to.be.equal('I am <b class="innerb">new</b> content');
        });

        it('getOuterHTML', function () {
            expect(container.getOuterHTML()).to.be.equal('<div style="opacity: 0;">I am <b class="innerb">new</b> content</div>');
        });

        it('getAll', function () {
            expect(container.getAll('div').length).to.be.equal(0);
            expect(container.getAll('b').length).to.be.equal(1);
        });

        it('getAll with protected', function () {
            expect(container.getAll('div', true).length).to.be.equal(4);
        });

        it('getElement', function () {
            expect(container.getElement('.system1')===undefined).to.be.true;
        });

        it('getElement childnode', function () {
            expect(container.getElement('.innerb')===undefined).to.be.false;
        });

        it('getElement with protected', function () {
            expect(container.getElement('.system1', true)===undefined).to.be.false;
        });

        it('getElement childnode with protected', function () {
            expect(container.getElement('.innerb', true)===undefined).to.be.false;
        });

        it('contains', function () {
            var checkNode = container.getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains innernode', function () {
            var checkNode = container.getChildren()[0].getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains with protected', function () {
            var checkNode = container.getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('contains innernode with protected', function () {
            var checkNode = container.getChildren()[0].getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('after empty(false)', function () {
            container.empty();
            expect(container.getAll('div', true).length).to.be.equal(4);
        });

        it('after empty(true)', function () {
            container.empty(false, true);
            expect(container.vnode.vChildNodes.length).to.be.equal(0);
        });

    });

    //===============================================================

    describe('I-tags inside non-empty element', function () {

        before(function() {
            container = body.append('<div style="opacity: 0;">Hey, <i>Hello</i> there. <i-dummy class="itag-rendered"><div class="innerdiv"></div></i-dummy></div>');
            var idummy = container.getElement('i-dummy');
            idummy.vnode.isItag = true; // because it isn't rendered as an itag, it would miis the flag
            idummy.contentHidden = true; // the same for contentHidden
        });

        after(function() {
            container.remove();
        });

        it('getHTML', function () {
            expect(container.getHTML()).to.be.equal('Hey, <i>Hello</i> there. <i-dummy class="itag-rendered"></i-dummy>');
        });

        it('getOuterHTML', function () {
            expect(container.getOuterHTML()).to.be.equal('<div style="opacity: 0;">Hey, <i>Hello</i> there. <i-dummy class="itag-rendered"></i-dummy></div>');
        });

        it('getAll', function () {
            expect(container.getAll('div').length).to.be.equal(0);
        });

        it('getAll with protected', function () {
            expect(container.getAll('div', true).length).to.be.equal(1);
        });

        it('getElement', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.true;
        });

        it('getElement with protected', function () {
            expect(container.getElement('.innerdiv', true)===undefined).to.be.false;
        });

        it('contains', function () {
            var checkNode = container.getElement('i-dummy').getChildren()[0];
            expect(container.contains(checkNode)).to.be.false;
        });

        it('contains with protected', function () {
            var checkNode = container.getElement('i-dummy').getChildren()[0];
            expect(container.contains(checkNode, false, true)).to.be.true;
        });

        it('after empty(false)', function () {
            container.empty();
            expect(container.getAll('div', true).length).to.be.equal(0);
        });

    });

}(global.window || require('node-win')));