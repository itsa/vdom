/*global describe, it, afterEach  */
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

        // Code to execute after every test.
        afterEach(function() {
            delete body.vnode._scripts;
        });
/*
        it('inserting scriptnode executed', function () {
            window.a = 0;
            var node = body.append('<xscript>window.a++;</xscript>');
            expect(window.a).to.be.equal(1);
            delete window.a;
        });
*/
        it('inserting scriptnode being removed', function (done) {
            var node = body.append('<xscript>// test</xscript>');
            laterSilent(function() {
                expect(node.inDOM()).to.be.false;
                done();
            } ,500);
        });
/*
        it('inserting scriptnode stored data at _scripts', function () {
            var node = body.append('<xscript>//test &nbsp;</xscript>');
            expect(body.vnode._scripts).to.be.equal(['//test &nbsp;']);
        });

        it('multiple inserting scriptnode executed once and removed', function () {
            // expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', 'data-x': 'somedata'});
        });
*/
    });

}(global.window || require('node-win')));