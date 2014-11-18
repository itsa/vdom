/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */
(function (window) {

    "use strict";

    // require("../vdom.js")(window);
    require('../partials/extend-element.js')(window);
    // require('../partials/extend-document.js')(window);

    var expect = require('chai').expect,
        should = require('chai').should(),
        node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText;


    describe('NodeList methods', function () {

        it('Merged Array methods', function () {
            var list = window.document.getElementsByTagName('div');
            expect(list.forEach).be.a('function');
        });

        it('Merged Element-Array methods', function () {
            var list = window.document.getElementsByTagName('div');
            expect(list.removeClass).be.a('function');
        });

    });

    describe('Element Array methods', function () {

        // bodyNode looks like this:
        /*
        <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;">
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
            node.setAttribute('style', 'position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;');
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

        it('append', function () {
            var list = node.getAll('.green');
            list.append('extra');
            expect(nodeSub1.getHTML()).to.be.eql('extra');
            expect(nodeSub2.getHTML()).to.be.eql('extra');
            expect(nodeSub3Sub.getHTML()).to.be.eql('extra');

            list = node.getAll('#sub3');
            nodeSub3Sub.removeClass(['green', 'yellow']);
            list.append(' added');
            expect(nodeSub3.getHTML()).to.be.eql('<div id="sub3sub">extra</div>extra text added');
        });

        it('defineInlineStyle', function () {
            var list = node.getAll('.green');
            list.defineInlineStyle('left: 12px;');

            expect(nodeSub1.getAttr('style')).to.be.eql('left: 12px;');
            expect(nodeSub2.getAttr('style')).to.be.eql('left: 12px;');
            expect(nodeSub3Sub.getAttr('style')).to.be.eql('left: 12px;');

            expect(nodeSub1.getInlineStyle('left')).to.be.eql('12px');
            expect(nodeSub2.getInlineStyle('left')).to.be.eql('12px');
            expect(nodeSub3Sub.getInlineStyle('left')).to.be.eql('12px');
        });

        it('prepend', function () {
            var list = node.getAll('.green');
            list.prepend('extra');
            expect(nodeSub1.getHTML()).to.be.eql('extra');
            expect(nodeSub2.getHTML()).to.be.eql('extra');
            expect(nodeSub3Sub.getHTML()).to.be.eql('extra');

            list = node.getAll('#sub3');
            nodeSub3Sub.removeClass(['green', 'yellow']);
            list.prepend('added');
            expect(nodeSub3.getHTML()).to.be.eql('added<div id="sub3sub">extra</div>extra text');
        });

        it('removeAttr', function () {
            var list = node.getAll('.green');
            list.removeAttr('class');

            expect(nodeSub1.getAttr('class')===null).to.be.true;
            expect(nodeSub2.getAttr('class')===null).to.be.true;
            expect(nodeSub3Sub.getAttr('class')===null).to.be.true;

            expect(nodeSub1.className).to.be.eql('');
            expect(nodeSub2.className).to.be.eql('');
            expect(nodeSub3Sub.className).to.be.eql('');
        });

        it('removeClass single', function () {
            var list = node.getAll('.green');
            list.removeClass('green');

            expect(nodeSub1.getAttr('class')).to.be.eql('yellow');
            expect(nodeSub2.getAttr('class')).to.be.eql('yellow');
            expect(nodeSub3Sub.getAttr('class')).to.be.eql('yellow');

            expect(nodeSub1.className).to.be.eql('yellow');
            expect(nodeSub2.className).to.be.eql('yellow');
            expect(nodeSub3Sub.className).to.be.eql('yellow');
        });

        it('removeClass multiple', function () {
            var list = node.getAll('.green');
            list.removeClass(['green', 'yellow']);

            expect(nodeSub1.getAttr('class')===null).to.be.true;
            expect(nodeSub2.getAttr('class')===null).to.be.true;
            expect(nodeSub3Sub.getAttr('class')===null).to.be.true;

            expect(nodeSub1.className).to.be.eql('');
            expect(nodeSub2.className).to.be.eql('');
            expect(nodeSub3Sub.className).to.be.eql('');
        });

        it('removeData', function () {
            var list = node.getAll('.green');
            nodeSub1.setData('dummy', 10);
            nodeSub2.setData('dummy', 15);

            expect(nodeSub1.getData('dummy')).to.eql(10);
            expect(nodeSub2.getData('dummy')).to.eql(15);
            expect(nodeSub3Sub.getData('dummy')===undefined).to.be.true;

            list.removeData('dummy');
            expect(nodeSub1.getData('dummy')===undefined).to.be.true;
            expect(nodeSub2.getData('dummy')===undefined).to.be.true;
            expect(nodeSub3Sub.getData('dummy')===undefined).to.be.true;
        });

        it('removeInlineStyle', function () {
            var list = node.getAll('.green');
            nodeSub1.setInlineStyle('left', '10px');
            nodeSub2.setInlineStyle('left', '15px');
            nodeSub2.setInlineStyle('top', '25px');

            expect(nodeSub1.getInlineStyle('left')).to.eql('10px');
            expect(nodeSub2.getInlineStyle('left')).to.eql('15px');
            expect(nodeSub2.getInlineStyle('top')).to.eql('25px');
            expect(nodeSub3Sub.getInlineStyle('left')===undefined).to.be.true;

            list.removeInlineStyle('left');
            expect(nodeSub1.getInlineStyle('left')===undefined).to.be.true;
            expect(nodeSub2.getInlineStyle('left')===undefined).to.be.true;
            expect(nodeSub2.getInlineStyle('top')).to.eql('25px');
            expect(nodeSub3Sub.getInlineStyle('left')===undefined).to.be.true;
        });

        it('removeNode', function () {
            var list = node.getAll('.green');
            list.removeNode();
            expect(node.innerHTML).to.be.eql('<div id="sub3">extra text</div>');
            expect(node.getHTML()).to.be.eql('<div id="sub3">extra text</div>');
            expect(list.length).to.be.eql(0);
        });

        it('replaceClass', function () {
            var list = node.getAll('.green');
            list.replaceClass('yellow', 'purple');
            expect(nodeSub1.getAttr('class')).to.be.eql('green purple');
            expect(nodeSub2.getAttr('class')).to.be.eql('green purple');
            expect(nodeSub3Sub.getAttr('class')).to.be.eql('green purple');

            expect(nodeSub1.className).to.be.eql('green purple');
            expect(nodeSub2.className).to.be.eql('green purple');
            expect(nodeSub3Sub.className).to.be.eql('green purple');
        });

        it('replaceNode', function () {
            var list = node.getAll('.green');
            list.replaceNode('<input>');
            expect(node.innerHTML).to.be.eql('<input><input><div id="sub3"><input>extra text</div>');
            expect(node.getHTML()).to.be.eql('<input><input><div id="sub3"><input>extra text</div>');
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.vnode.vChildNodes.length).to.be.eql(3);
            expect(list.length).to.be.eql(3);
        });

        it('setAttr', function () {
            var list = node.getAll('.green');
            list.setAttr('data-x', 'ok');
            expect(nodeSub1.getAttr('data-x')).to.be.eql('ok');
            expect(nodeSub2.getAttr('data-x')).to.be.eql('ok');
            expect(nodeSub3Sub.getAttr('data-x')).to.be.eql('ok');
            expect(node.getData('dummy')===undefined).to.be.true;

            expect(nodeSub1._getAttribute('data-x')).to.be.eql('ok');
            expect(nodeSub2._getAttribute('data-x')).to.be.eql('ok');
            expect(nodeSub3Sub._getAttribute('data-x')).to.be.eql('ok');
        });

        it('setClass', function () {
            var list = node.getAll('.green');
            list.setClass('purple');

            expect(nodeSub1.getAttr('class')).to.be.eql('green yellow purple');
            expect(nodeSub2.getAttr('class')).to.be.eql('green yellow purple');
            expect(nodeSub3Sub.getAttr('class')).to.be.eql('green yellow purple');

            expect(nodeSub1.className).to.be.eql('green yellow purple');
            expect(nodeSub2.className).to.be.eql('green yellow purple');
            expect(nodeSub3Sub.className).to.be.eql('green yellow purple');
        });

        it('setData', function () {
            var list = node.getAll('.green');

            list.setData('dummy', 10);
            expect(nodeSub1.getData('dummy')).to.eql(10);
            expect(nodeSub2.getData('dummy')).to.eql(10);
            expect(nodeSub3Sub.getData('dummy')).to.eql(10);
        });

        it('setHTML', function () {
            var list = node.getAll('.green');
            list.setHTML('new content');
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.vnode.vChildNodes.length).to.be.eql(3);
            expect(list.length).to.be.eql(3);
            expect(nodeSub1.innerHTML).to.be.eql('new content');
            expect(nodeSub1.getHTML()).to.be.eql('new content');
            expect(nodeSub2.innerHTML).to.be.eql('new content');
            expect(nodeSub2.getHTML()).to.be.eql('new content');
            expect(nodeSub3Sub.innerHTML).to.be.eql('new content');
            expect(nodeSub3Sub.getHTML()).to.be.eql('new content');
        });

        it('setInlineStyle', function () {
            var list = node.getAll('.green');
            list.setInlineStyle('left', '10px');
            list.setInlineStyle('top', '15px');

            expect(nodeSub1.getInlineStyle('left')).to.eql('10px');
            expect(nodeSub2.getInlineStyle('left')).to.eql('10px');
            expect(nodeSub3Sub.getInlineStyle('left')).to.eql('10px');

            expect(nodeSub1.getInlineStyle('top')).to.eql('15px');
            expect(nodeSub2.getInlineStyle('top')).to.eql('15px');
            expect(nodeSub3Sub.getInlineStyle('top')).to.eql('15px');
        });

        it('setOuterHTML', function () {
            var list = node.getAll('.green');
            list.setOuterHTML('<input>');
            expect(node.innerHTML).to.be.eql('<input><input><div id="sub3"><input>extra text</div>');
            expect(node.getHTML()).to.be.eql('<input><input><div id="sub3"><input>extra text</div>');
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.vnode.vChildNodes.length).to.be.eql(3);
            expect(list.length).to.be.eql(3);
        });

        it('setText', function () {
            var list = node.getAll('.green');
            list.setText('ok <b>here we go</b>');
            expect(node.childNodes.length).to.be.eql(3);
            expect(node.vnode.vChildNodes.length).to.be.eql(3);
            expect(list.length).to.be.eql(3);
            expect(nodeSub1.innerHTML).to.be.eql('ok &lt;b&gt;here we go&lt;/b&gt;');
            expect(nodeSub1.getHTML()).to.be.eql('ok &lt;b&gt;here we go&lt;/b&gt;');
            expect(nodeSub2.innerHTML).to.be.eql('ok &lt;b&gt;here we go&lt;/b&gt;');
            expect(nodeSub2.getHTML()).to.be.eql('ok &lt;b&gt;here we go&lt;/b&gt;');
            expect(nodeSub3Sub.innerHTML).to.be.eql('ok &lt;b&gt;here we go&lt;/b&gt;');
            expect(nodeSub3Sub.getHTML()).to.be.eql('ok &lt;b&gt;here we go&lt;/b&gt;');
        });

        it('toggleClass', function () {
            var list = node.getAll('.green');

            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;
            list.toggleClass('green');
            expect(nodeSub1.hasClass('green')).to.be.false;
            expect(nodeSub2.hasClass('green')).to.be.false;
            expect(nodeSub3Sub.hasClass('green')).to.be.false;
            list.toggleClass('green');
            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;

            expect(nodeSub1.hasClass('purple')).to.be.false;
            expect(nodeSub2.hasClass('purple')).to.be.false;
            expect(nodeSub3Sub.hasClass('purple')).to.be.false;
            list.toggleClass('purple', true);
            expect(nodeSub1.hasClass('purple')).to.be.true;
            expect(nodeSub2.hasClass('purple')).to.be.true;
            expect(nodeSub3Sub.hasClass('purple')).to.be.true;
            list.toggleClass('purple');
            expect(nodeSub1.hasClass('purple')).to.be.false;
            expect(nodeSub2.hasClass('purple')).to.be.false;
            expect(nodeSub3Sub.hasClass('purple')).to.be.false;
            list.toggleClass('purple');
            expect(nodeSub1.hasClass('purple')).to.be.true;
            expect(nodeSub2.hasClass('purple')).to.be.true;
            expect(nodeSub3Sub.hasClass('purple')).to.be.true;

            expect(nodeSub1.hasClass('blue')).to.be.false;
            expect(nodeSub2.hasClass('blue')).to.be.false;
            expect(nodeSub3Sub.hasClass('blue')).to.be.false;
            list.toggleClass('blue', false);
            expect(nodeSub1.hasClass('blue')).to.be.false;
            expect(nodeSub2.hasClass('blue')).to.be.false;
            expect(nodeSub3Sub.hasClass('blue')).to.be.false;
            list.toggleClass('blue');
            expect(nodeSub1.hasClass('blue')).to.be.true;
            expect(nodeSub2.hasClass('blue')).to.be.true;
            expect(nodeSub3Sub.hasClass('blue')).to.be.true;
            list.toggleClass('blue');
            expect(nodeSub1.hasClass('blue')).to.be.false;
            expect(nodeSub2.hasClass('blue')).to.be.false;
            expect(nodeSub3Sub.hasClass('blue')).to.be.false;

            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;
            list.toggleClass('green', true);
            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;
            list.toggleClass('green');
            expect(nodeSub1.hasClass('green')).to.be.false;
            expect(nodeSub2.hasClass('green')).to.be.false;
            expect(nodeSub3Sub.hasClass('green')).to.be.false;
            list.toggleClass('green');
            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;

            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;
            list.toggleClass('green', false);
            expect(nodeSub1.hasClass('green')).to.be.false;
            expect(nodeSub2.hasClass('green')).to.be.false;
            expect(nodeSub3Sub.hasClass('green')).to.be.false;
            list.toggleClass('green');
            expect(nodeSub1.hasClass('green')).to.be.true;
            expect(nodeSub2.hasClass('green')).to.be.true;
            expect(nodeSub3Sub.hasClass('green')).to.be.true;
            list.toggleClass('green');
            expect(nodeSub1.hasClass('green')).to.be.false;
            expect(nodeSub2.hasClass('green')).to.be.false;
            expect(nodeSub3Sub.hasClass('green')).to.be.false;
        });

    });


}(global.window || require('node-win')));