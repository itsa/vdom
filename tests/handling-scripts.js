/*global describe, it, before, after, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        body = window.document.body,
        laterSilent = require('utils/lib/timers.js').laterSilent,
        asyncSilent = require('utils/lib/timers.js').asyncSilent,
        domNodeToVNode = require("../partials/node-parser.js")(window);

    //===============================================================

    describe('Inspecting script-elements', function () {

        before(function() {
            body.append('<div id="s-cont" style="opacity: 0;"></div>');
        });

        after(function() {
            body.getElement('#s-cont').remove();
        });

        afterEach(function() {
            delete body.vnode._scripts;
            body.getElement('#s-cont').empty();
        });

        it('inserting scriptnode executed', function () {
            var node = body.append('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>', null, null, null, true);
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(1);
            node.remove();
        });

        it('inserting scriptnode stored data at _scripts', function () {
            var node = body.append('<xscript>//test &nbsp;</xscript>', null, null, null, true);
            expect(body.vnode._scripts[0]).to.be.equal('//test &nbsp;');
        });

        it('multiple inserting scriptnode executed once', function () {
            var node1 = body.append('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>', null, null, null, true);
            body.append('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>', null, null, null, true); // will return `undefined` --> no domnode gets inserted
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(1);
            node1.remove();
        });

        it('replacing the same scriptnode executed once', function () {
            var node1 = body.append('<div style="opacity: 0;"></div>');
            node1.setHTML('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>', null, true);
            node1.setHTML('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>', null, true);
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(1);
            node1.remove();
        });

    });

    //===============================================================

    describe('Inspecting child script-elements', function () {

        before(function() {
            body.append('<div id="s-cont" style="opacity: 0;"></div>');
        });

        after(function() {
            body.getElement('#s-cont').remove();
        });

        afterEach(function() {
            delete body.vnode._scripts;
            body.getElement('#s-cont').empty();
        });

        it('inserting scriptnode executed', function () {
            var node = body.append('<div><xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript></div>', null, null, null, true);
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(1);
            node.remove();
        });

        it('inserting scriptnode stored data at _scripts', function () {
            var node = body.append('<div id="s-div"><xscript>//test &nbsp;</xscript></div>', null, null, null, true);
            expect(body.getElement('#s-div').vnode._scripts[0]).to.be.equal('//test &nbsp;');
        });

        it('multiple inserting scriptnode executed once', function () {
            var node1 = body.append('<div><xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript></div>', null, null, null, true);
            node1.append('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>', null, null, null, true);  // will return `undefined` --> no domnode gets inserted
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(1);
            node1.remove();
        });

    });
    //===============================================================

    describe('Inspecting script-elements when no scripts are allowed', function () {

        before(function() {
            body.append('<div id="s-cont" style="opacity: 0;"></div>');
        });

        after(function() {
            body.getElement('#s-cont').remove();
        });

        afterEach(function() {
            delete body.vnode._scripts;
            body.getElement('#s-cont').empty();
        });

        it('appending', function () {
            var node = body.append('<div style="opacity: 0;"></div>');
            node.append('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>');
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(0);
            node.remove();
        });


        it('prepending', function () {
            var node = body.append('<div style="opacity: 0;"></div>');
            node.prepend('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>');
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(0);
            node.remove();
        });

        it('setHTML', function () {
            var node = body.append('<div style="opacity: 0;"></div>');
            node.setHTML('<xscript>window.document.body.getElement("#s-cont").append("<div></div>");</xscript>');
            expect(body.getElement('#s-cont').getAll('div').length).to.be.equal(0);
            node.remove();
        });

    });



}(global.window || require('node-win')));