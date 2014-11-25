/*global describe, it, beforeEach, afterEach */
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
        async = require('utils/lib/timers.js').async,
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText, container, containerSub1, containerSub2, containerSub3;

    chai.use(require('chai-as-promised'));


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

        });



}(global.window || require('node-win')));