/*global describe, it */
/*jshint unused:false */
(function (window) {

    "use strict";

    var expect = require('chai').expect,
        should = require('chai').should(),
        DOCUMENT = window.document,
        domNodeToVNode = require("../lib/node-parser.js")(window),
        VElementClass = require('../lib/v-element.js')(window),
        node1, innernode, innernode2, innernode3, innernode4, vnode;

// node1 looks like this:
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

    node1 = DOCUMENT.createElement('div');
    node1.id = 'divone';
    node1.className = 'red blue';
    node1.setAttribute('disabled', '');
    node1.setAttribute('data-x', 'somedata');

    innernode = DOCUMENT.createElement('img');
    innernode.id = 'imgone';
    innernode.setAttribute('alt', 'http://google.com/img1.jpg');
    node1.appendChild(innernode);

    innernode = DOCUMENT.createTextNode('just a textnode');
    node1.appendChild(innernode);

    innernode = DOCUMENT.createComment('just a commentnode');
    node1.appendChild(innernode);

    innernode = DOCUMENT.createTextNode('just a second textnode');
    node1.appendChild(innernode);

    innernode = DOCUMENT.createElement('div');
        innernode2 = DOCUMENT.createElement('ul');
            innernode3 = DOCUMENT.createElement('li');
            innernode3.id = 'li1';
                innernode4 = DOCUMENT.createTextNode('first');
                innernode3.appendChild(innernode4);
            innernode2.appendChild(innernode3);

            innernode3 = DOCUMENT.createElement('li');
            innernode3.id = 'li2';
                innernode4 = DOCUMENT.createTextNode('second');
                innernode3.appendChild(innernode4);
            innernode2.appendChild(innernode3);

            innernode3 = DOCUMENT.createElement('li');
            innernode3.id = 'li3';
            innernode2.appendChild(innernode3);
        innernode.appendChild(innernode2);
    node1.appendChild(innernode);

    innernode = DOCUMENT.createElement('div');
        innernode2 = DOCUMENT.createElement('div');
        innernode.appendChild(innernode2);
        innernode2 = DOCUMENT.createTextNode('some text');
        innernode.appendChild(innernode2);
    node1.appendChild(innernode);

    vnode = domNodeToVNode(node1, VElementClass);

    //===============================================================

    describe('Properties vnode', function () {

        it('attrs', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('childNodes', function () {
            expect(vnode.vChildNodes.length).to.be.eql(6);
                expect(vnode.childNodes[0].nodeType).to.be.eql(1);
                expect(vnode.childNodes[0].id).to.be.eql('imgone');
                expect(vnode.childNodes[1].nodeType).to.be.eql(3);
                expect(vnode.childNodes[1].nodeValue).to.be.eql('just a textnode');
                expect(vnode.childNodes[2].nodeType).to.be.eql(8);
                expect(vnode.childNodes[2].nodeValue).to.be.eql('just a commentnode');
                expect(vnode.childNodes[3].nodeType).to.be.eql(3);
                expect(vnode.childNodes[3].nodeValue).to.be.eql('just a second textnode');
                expect(vnode.childNodes[4].nodeType).to.be.eql(1);
                expect(vnode.childNodes[4].tagName).to.be.eql('DIV');
                expect(vnode.childNodes[5].nodeType).to.be.eql(1);
                expect(vnode.childNodes[5].tagName).to.be.eql('DIV');
        });

        it('children', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('classNames', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('id', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

        it('innerHTML', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('isVoid', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('nodeType', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('nodeValue', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('outerHTML', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

        it('tag', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('text', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('textContent', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vChildNodes', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vChildren', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

        it('vElement', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vFirst', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vFirstChild', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vFirstElement', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vFirstElementChild', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

        it('vLast', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vLastChild', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vLastElement', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vLastElementChild', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vNext', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

        it('vNextElement', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vParent', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vPrevious', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('vPreviousElement', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/

    });


    describe('Methods vnode', function () {

        it('contains', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('firstOfVChildren', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('hasClass', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('hasVChildNodes', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('hasVChildren', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('lastOfVChildren', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('matchesSelector', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });

        it('store', function () {
            expect(vnode.attrs).to.be.eql({id: 'divone', 'class': 'red blue', disabled: '', 'data-x': 'somedata'});
        });
/*
<div id="divone" class="red blue" disabled data-x="somedata">
    <img id="imgone" src="http://google.com/img1.jpg">
    just a textnode
    <!--just a commentnode-->
    just a second textnode
    <div>
        <ul>
            <li id="li1">first</li>
            <li id="li2" >second</li>
            <li id="li3" ></li>
        </ul>
    </div>
    <div>
        <div></div>
        some text
    </div>
</div>
*/
    });

}(global.window || require('node-win')));