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
            container = body.append('<div style="opacity:0;"></div>');
            container.addSystemElement('<div class="system1"><div class="innerdiv"></div></div>');
            container.addSystemElement('<div class="system2"></div>');
        });

        after(function() {
            container.remove();;
        });

        it('getHTML', function () {
            expect(container.getHTML()).to.be.equal('');
        });

        it('getOuterHTML', function () {
            expect(container.getOuterHTML()).to.be.equal('<div style="opacity:0;"></div>');
        });

        it('getAll', function () {
            expect(container.getAll('div').length).to.be.equal(0);
        });

        it('getAll with protected', function () {
            expect(container.getAll('div', true).length).to.be.equal(2);
        });

        it('getElement', function () {
            expect(container.getElement('.system1')===undefined).to.be.true;
        });

        it('getElement childnode', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.true;
        });

        it('getElement with protected', function () {
            expect(container.getElement('.system1')===undefined).to.be.false;
        });

        it('getElement childnode with protected', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.false;
        });

        it('contains', function () {
            expect(container.contains('.system1')).to.be.false;
        });

        it('contains innernode', function () {
            expect(container.contains('.innerdiv')).to.be.false;
        });

        it('contains with protected', function () {
            expect(container.contains('.system1', true)).to.be.true;
        });

        it('contains innernode with protected', function () {
            expect(container.contains('.innerdiv', true)).to.be.true;
        });
    });

    //===============================================================

    describe('System-elements inside non-empty element', function () {

        before(function() {
            container = body.append('<div style="opacity:0;"><i>Hello</i> there.</div>');
            container.addSystemElement('<div class="system1"><div class="innerdiv"></div></div>');
            container.addSystemElement('<div class="system2"></div>');
            container.append(' How are you?');
            container.prepend('Hey, ');
            container.append('<div>And an inner div</div>');
            container.addSystemElement('<div class="system3"></div>');
        });

        after(function() {
            container.remove();;
        });


        it('getHTML', function () {
            expect(container.getHTML()).to.be.equal('Hey, <i>Hello</i> there. How are you?<div>And an inner div</div>');
        });

        it('getOuterHTML', function () {
            expect(container.getOuterHTML()).to.be.equal('<div style="opacity:0;">Hey, <i>Hello</i> there. How are you?<div>And an inner div</div></div>');
        });

        it('getAll', function () {
            expect(container.getAll('div').length).to.be.equal(1);
        });

        it('getAll with protected', function () {
            expect(container.getAll('div', true).length).to.be.equal(4);
        });

        it('getElement', function () {
            expect(container.getElement('.system1')===undefined).to.be.true;
        });

        it('getElement childnode', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.true;
        });

        it('getElement with protected', function () {
            expect(container.getElement('.system1')===undefined).to.be.false;
        });

        it('getElement childnode with protected', function () {
            expect(container.getElement('.innerdiv')===undefined).to.be.false;
        });

        it('contains', function () {
            expect(container.contains('.system1')).to.be.false;
        });

        it('contains innernode', function () {
            expect(container.contains('.innerdiv')).to.be.false;
        });

        it('contains with protected', function () {
            expect(container.contains('.system1', true)).to.be.true;
        });

        it('contains innernode with protected', function () {
            expect(container.contains('.innerdiv', true)).to.be.true;
        });

    });

}(global.window || require('node-win')));