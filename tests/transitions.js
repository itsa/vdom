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
        node, delayed;

    // chai.use(require('chai-as-promised'));

    describe('Node-transitions single', function () {

        this.timeout(5000);

        before(function() {
            var cssnode = '<style id="cssNode" type="text/css">'+
                              '#testNode {position: absolute; z-index: -1; visibility: hidden; left:-999px; top: -9999px;} '+
                              '#testNode.onscreen {z-index: 1; left: 400px; top: 100px; visibility: visible;} '+
                              '.box {width: 100px; height: 100px;} '+
                              '.red {background-color: #F00;}'+
                           '</style>';
            window.document.body.prepend(cssnode);
        });

        after(function() {
            window.document.getElement('#cssNode').remove();
        });

        // Code to execute before every test.
        beforeEach(function() {
            var nodeDefinition = '<div id="testNode" class="red onscreen">Hey Hey Hey</div>';
            if (node) {
                node.removeAttr('style');
            }
            else {
                node = window.document.body.append(nodeDefinition);
            }
            delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
        });

        // Code to execute after every test.
        afterEach(function() {
            node.remove();
            node = null;
        });

        it('check to return a Promise', function () {
            expect(node.transition() instanceof window.Promise).to.be.true;
        });


        it('check width-transition with duration', function (done) {
            node.transition({property: 'width', value: '200px', duration: 1}).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

        it('check width-transition without duration', function (done) {
            node.transition({property: 'width', value: '200px'}).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

        it('check width-transition when no transition is needed', function (done) {
            node.setClass('box');
            node.transition({property: 'width', value: '100px'}).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(done);
        });

        it('check width-transition delayed', function (done) {
            node.transition({property: 'width', value: '200px', duration: 0.1, delay: 0.5}).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

    });

    describe('Node-transitions multiple', function () {

        this.timeout(15000);

        before(function() {
            var cssnode = '<style id="cssNode" type="text/css">'+
                              '#testNode {position: absolute; z-index: -1; visibility: hidden; left:-999px; top: -9999px;} '+
                              '#testNode.onscreen {z-index: 1; left: 400px; top: 100px; visibility: visible;} '+
                              '.box {width: 100px; height: 100px;} '+
                              '.red {background-color: #F00;}'+
                           '</style>';
            window.document.body.prepend(cssnode);
        });

        after(function() {
            window.document.getElement('#cssNode').remove();
        });

        // Code to execute before every test.
        beforeEach(function() {
            var nodeDefinition = '<div id="testNode" class="red onscreen">Hey Hey Hey</div>';
            if (node) {
                node.removeAttr('style');
            }
            else {
                node = window.document.body.append(nodeDefinition);
            }
            delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
        });

        // Code to execute after every test.
        afterEach(function() {
            node.remove();
            node = null;
        });

        it('check width-transition with duration', function (done) {
            node.transition([
                {property: 'width', value: '200px', duration: 1},
                {property: 'height', value: '200px', duration: 1}
            ]).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

        it('check width-transition without duration', function (done) {
            node.transition([
                {property: 'width', value: '400px'},
                {property: 'height', value: '400px', duration: 1}
            ]).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

        it('check width-transition when no transition is needed', function (done) {
            node.setClass('box');
            node.transition([
                {property: 'width', value: '100px', duration: 1},
                {property: 'height', value: '100px', duration: 1}
            ]).then(
                function() {
                    expect(delayed).to.be.false;
                    done();
                }
            ).catch(done);
        });

        it('check width-transition delayed', function (done) {
            node.transition([
                {property: 'width', value: '400px', duration: 0.1, delay: 0.1},
                {property: 'height', value: '400px', delay: 0.2}
            ]).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

    });

    describe('Node-transitions chained', function () {

        this.timeout(15000);

        before(function() {
            var cssnode = '<style id="cssNode" type="text/css">'+
                              '#testNode {position: absolute; z-index: -1; visibility: hidden; left:-999px; top: -9999px;} '+
                              '#testNode.onscreen {z-index: 1; left: 400px; top: 100px; visibility: visible;} '+
                              '.box {width: 100px; height: 100px;} '+
                              '.red {background-color: #F00;}'+
                           '</style>';
            window.document.body.prepend(cssnode);
        });

        after(function() {
            window.document.getElement('#cssNode').remove();
        });

        // Code to execute before every test.
        beforeEach(function() {
            var nodeDefinition = '<div id="testNode" class="red onscreen">Hey Hey Hey</div>';
            if (node) {
                node.removeAttr('style');
            }
            else {
                node = window.document.body.append(nodeDefinition);
            }
            delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
        });

        // Code to execute after every test.
        afterEach(function() {
            node.remove();
            node = null;
        });

        it('check width-transition with duration', function (done) {
            node.transition({property: 'width', value: '500px', duration: 1})
                .then(
                    function(){
                        return node.transition({property: 'height', value: '200px', duration: 1});
                    })
                .then(
                    function() {
                        expect(delayed).to.be.true;
                        done();
                    })
                .catch(function(err) {
                    alert(err);
                    done(err);
                });
        });

        it('check width-transition without duration', function (done) {
            node.transition({property: 'width', value: '200px'})
                .then(
                    function(){
                        return node.transition({property: 'height', value: '200px'});
                    })
                .then(
                    function() {
                        expect(delayed).to.be.true;
                        done();
                    })
                .catch(function(err) {
                    done(err);
                });
        });

        it('check width-transition when no transition is needed', function (done) {
            node.setClass('box');
            node.transition({property: 'width', value: '100px'})
                .then(
                    function(){
                        return node.transition({property: 'width', value: '100px'});
                    })
                .then(
                    function() {
                        expect(delayed).to.be.false;
                        done();
                    })
                .catch(function(err) {
                    done(err);
                });
        });

        it('check width-transition delayed', function (done) {
            node.transition({property: 'width', value: '200px', duration: 0.1, delay: 0.5})
                .then(
                    function(){
                        return node.transition({property: 'width', value: '200px', duration: 0.1, delay: 0.5});
                    })
                .then(
                    function() {
                        expect(delayed).to.be.true;
                        done();
                    })
                .catch(function(err) {
                    done(err);
                });
        });

    });

    describe('Node-transitions with from', function () {

        this.timeout(5000);

        before(function() {
            var cssnode = '<style id="cssNode" type="text/css">'+
                              '#testNode {position: absolute; z-index: -1; visibility: hidden; left:-999px; top: -9999px;} '+
                              '#testNode.onscreen {z-index: 1; left: 400px; top: 100px; visibility: visible;} '+
                              '.box {width: 100px; height: 100px;} '+
                              '.red {background-color: #F00;}'+
                           '</style>';
            window.document.body.prepend(cssnode);
        });

        after(function() {
            window.document.getElement('#cssNode').remove();
        });

        // Code to execute before every test.
        beforeEach(function() {
            var nodeDefinition = '<div id="testNode" class="red onscreen">Hey Hey Hey</div>';
            if (node) {
                node.removeAttr('style');
            }
            else {
                node = window.document.body.append(nodeDefinition);
            }
            delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
        });

        // Code to execute after every test.
        afterEach(function() {
            node.remove();
            node = null;
        });

        it('check width-transition', function (done) {
            node.transition({property: 'width', value: '200px', duration: 1}, {property: 'width', value: '1000px'}).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

        it('check width + height', function (done) {
            node.transition([
                {property: 'width', value: '200px', duration: 1},
                {property: 'height', value: '200px', duration: 1}
            ], [
                {property: 'width', value: '800px'},
                {property: 'height', value: '1000px'}
            ]).then(
                function() {
                    expect(delayed).to.be.true;
                    done();
                }
            ).catch(done);
        });

    });

    describe('Node-transitions check cleanup', function () {

        this.timeout(5000);

        before(function() {
            var cssnode = '<style id="cssNode" type="text/css">'+
                              '#testNode {position: absolute; z-index: -1; visibility: hidden; left:-999px; top: -9999px;} '+
                              '#testNode.onscreen {z-index: 1; left: 400px; top: 100px; visibility: visible;} '+
                              '.box {width: 100px; height: 100px;} '+
                              '.red {background-color: #F00;}'+
                           '</style>';
            window.document.body.prepend(cssnode);
        });

        after(function() {
            window.document.getElement('#cssNode').remove();
        });

        // Code to execute before every test.
        beforeEach(function() {
            var nodeDefinition = '<div id="testNode" class="red onscreen">Hey Hey Hey</div>';
            if (node) {
                node.removeAttr('style');
            }
            else {
                node = window.document.body.append(nodeDefinition);
            }
            delayed = false;
            setTimeout(function() {
                delayed = true;
            }, 500);
        });

        // Code to execute after every test.
        afterEach(function() {
            node.remove();
            node = null;
        });

        it('check cleanup single', function (done) {
            node.transition({property: 'width', value: '200px', duration: 1}).finally(function() {
                expect(node.getInlineStyle('transition')===undefined).to.be.true;
                done();
            }).catch(done);
        });

        it('check cleanup when chained', function (done) {
            node.transition({property: 'width', value: '200px', duration: 1})
                .then(
                    function() {
                        return node.transition({property: 'height', value: '200px', duration: 1});
                    })
                .then(
                    function() {
                        expect(node.getInlineStyle('transition')===undefined).to.be.true;
                        done();
                    }
                ).catch(function(err) {
                    done(err);
                });
        });

    });

}(global.window || require('node-win')));