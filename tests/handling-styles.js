/*global describe, it, before, after, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    require("../vdom.js")(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        body = window.document.body,
        later = require('utils/lib/timers.js').later,
        async = require('utils/lib/timers.js').async,
        domNodeToVNode = require("../partials/node-parser.js")(window),
        container;

    //===============================================================

    describe('Inspecting style-elements when added at once', function () {

        before(function() {
            container = body.append('<div id="s-cont" style="opacity: 0;"></div>');
        });

        after(function() {
            container.remove();
        });

        afterEach(function() {
            container.empty();
        });

        it('appending duplicated styles at once', function () {
            container.append('<style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('appending duplicated styles at once inside childnode', function () {
            container.append('<div><style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style></div>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('prepending duplicated styles at once', function () {
            container.prepend('<style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('prepending duplicated styles at once inside childnode', function () {
            container.prepend('<div><style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style></div>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('setHTML duplicated styles at once', function () {
            container.setHTML('<style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('setHTML duplicated styles at once inside childnode', function () {
            container.setHTML('<div><style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style></div>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('setOuterHTML duplicated styles at once inside childnode', function () {
            var node = container.append('<div></div>');
            node.setOuterHTML('<div><style>#dummy {opacity: 0;}</style><style>#dummy {opacity: 0;}</style></div>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

    });

    //===============================================================

    describe('Inspecting style-elements when added separate', function () {

        before(function() {
            container = body.append('<div id="s-cont" style="opacity: 0;"></div>');
        });

        after(function() {
            container.remove();
        });

        afterEach(function() {
            container.empty();
        });

        it('appending duplicated styles', function () {
            container.append('<style>#dummy {opacity: 0;}</style>');
            container.append('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('appending duplicated styles inside childnode', function () {
            var node = container.append('<div><style>#dummy {opacity: 0;}</style></div>');
            node.append('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('prepending duplicated styles', function () {
            container.prepend('<style>#dummy {opacity: 0;}</style>');
            container.prepend('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('prepending duplicated styles at once inside childnode', function () {
            var node = container.prepend('<div><style>#dummy {opacity: 0;}</style></div>');
            node.prepend('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('setHTML duplicated styles at once', function () {
            container.setHTML('<style>#dummy {opacity: 0;}</style>');
            container.append('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('setHTML duplicated styles at once inside childnode', function () {
            container.setHTML('<div><style>#dummy {opacity: 0;}</style></div>');
            container.getElement('>div').append('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });


        it('setOuterHTML duplicated styles at once', function () {
            var node = container.append('<div></div>');
            node.setOuterHTML('<style>#dummy {opacity: 0;}</style>');
            container.append('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

        it('setOuterHTML duplicated styles at once inside childnode', function () {
            var node = container.append('<div></div>');
            node.setOuterHTML('<div><style>#dummy {opacity: 0;}</style></div>');
            container.getElement('>div').append('<style>#dummy {opacity: 0;}</style>');
            expect(container.getAll('style').length).to.be.equal(1);
        });

    });


}(global.window || require('node-win')));