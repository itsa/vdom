/*global describe, it */
/*jshint unused:false */
(function (window) {

    "use strict";

    var expect = require('chai').expect,
        should = require('chai').should(),
        htmlToVNodes = require("../partials/html-parser.js")(window),
        vNodeProto = require("../partials/vnode.js")(window);

    //===============================================================

    describe('HTML to vnodes parser', function () {

        it('Single void-node with slash', function () {
            var vnodes = htmlToVNodes('<br/>', vNodeProto),
                vnode;
            expect(vnodes.length).to.be.eql(1);
            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('BR');
            expect(vnode.isVoid).to.be.true;
        });

    });

}(global.window || require('node-win')));