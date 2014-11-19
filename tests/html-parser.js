/*global describe, it */
/*jshint unused:false */
(function (window) {

    "use strict";

    var expect = require('chai').expect,
        should = require('chai').should(),
        htmlToVNodes = require("../partials/html-parser.js")(window),
        vNodeProto = require("../partials/vnode.js")(window),
        html1 = '<div id="divone" class="red blue" disabled data-x="somedata">the innercontent</div>',
        html2 = '<div id="divone" class="red blue" disabled data-x="somedata1"></div>'+
                '<div id="divtwo" class="green yellow" disabled data-x="somedata2">'+
                    'just a textnode'+
                    '<!--just a commentnode-->'+
                    'just a second textnode'+
                    '<img src="http://google.com/img1.jpg">'+
                '</div>'+
                '<div id="divthree" class="orange" disabled data-x="somedata3">the innercontent3</div>',
        html3 = '<div id="divone" class="red blue" disabled data-x="somedata">'+
                    '<img id="imgone" src="http://google.com/img1.jpg">'+
                    '<img id="imgtwo" src="http://google.com/img2.jpg"/>'+
                    '<img id="imgthree" src="http://google.com/img3.jpg" >'+
                    '<img id="imgfour" src="http://google.com/img4.jpg" />'+
                    'just a textnode'+
                    '<!--just a commentnode-->'+
                    'just a second textnode'+
                    '<div>'+
                        '<ul>'+
                            '<li id="li1">first</li>'+
                            '<li id="li2" >second</li>'+ // on purpose an extra space behind id-definition
                            '<li id="li3" ></li>'+ // on purpose an extra space behind id-definition
                        '</ul>'+
                    '</div>'+
                    '<div>'+
                        '<div></div>'+
                        'some text'+
                    '</div>'+
                '</div>';

    //===============================================================

    describe('HTML to vnodes parser', function () {

        it('Single node', function () {
            var vnodes = htmlToVNodes(html1, vNodeProto),
                vnode, childvnode;
            expect(vnodes.length).to.be.eql(1);
            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divone');
            expect(vnode.attrs['class']).to.be.eql('red blue');
            expect(vnode.classNames.red).to.be.true;
            expect(vnode.classNames.blue).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(1);
            expect(vnode.vParent===undefined).to.be.true;

            // now examine the vChildNode:
            childvnode = vnode.vChildNodes[0];
            expect(childvnode.nodeType).to.be.eql(3);
            expect(childvnode.tag===undefined).to.be.true;
            expect(childvnode.isVoid===undefined).to.be.true;
            expect(childvnode.id===undefined).to.be.true;
            expect(childvnode.attrs===undefined).to.be.true;
            expect(childvnode.text).to.be.eql('the innercontent');
            expect(childvnode.vChildNodes===undefined).to.be.true;
            expect(childvnode.vParent).to.be.eql(vnode);
        });

        it('Single node second test', function () {
            var vnodes = htmlToVNodes('before <input id="inputid" type="text" disabled> after', vNodeProto),
                vnode, childvnode;

            expect(vnodes.length).to.be.eql(3);

            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(3);
            expect(vnode.text).to.be.eql('before ');
            expect(vnode.vParent===undefined).to.be.true;

            vnode = vnodes[1];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('INPUT');
            expect(vnode.isVoid).to.be.true;
            expect(vnode.id).to.be.eql('inputid');
            expect(vnode.attrs['class']===undefined).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes===undefined).to.be.true;
            expect(vnode.vParent===undefined).to.be.true;

            vnode = vnodes[2];
            expect(vnode.nodeType).to.be.eql(3);
            expect(vnode.text).to.be.eql(' after');
            expect(vnode.vParent===undefined).to.be.true;

        });

        it('Succeeding nodes', function () {
            var vnodes = htmlToVNodes(html2, vNodeProto),
                vnode, childvnode;
            expect(vnodes.length).to.be.eql(3);

            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divone');
            expect(vnode.attrs['class']).to.be.eql('red blue');
            expect(vnode.classNames.red).to.be.true;
            expect(vnode.classNames.blue).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata1');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(0);
            expect(vnode.vParent===undefined).to.be.true;

            vnode = vnodes[1];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divtwo');
            expect(vnode.attrs['class']).to.be.eql('green yellow');
            expect(vnode.classNames.green).to.be.true;
            expect(vnode.classNames.yellow).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata2');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(4);
            expect(vnode.vParent===undefined).to.be.true;

                // now examine the vChildNodes:
                childvnode = vnode.vChildNodes[0];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a textnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[1];
                expect(childvnode.nodeType).to.be.eql(8);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a commentnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[2];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a second textnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[3];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('IMG');
                expect(childvnode.isVoid).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.src).to.be.eql('http://google.com/img1.jpg');
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

            vnode = vnodes[2];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divthree');
            expect(vnode.attrs['class']).to.be.eql('orange');
            expect(vnode.classNames.orange).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata3');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(1);
            expect(vnode.vParent===undefined).to.be.true;

                // now examine the vChildNode:
                childvnode = vnode.vChildNodes[0];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('the innercontent3');
                expect(childvnode.vChildNodes===undefined).to.be.true;

        });

        it('Node with many childNodes', function () {
            var vnodes = htmlToVNodes(html3, vNodeProto),
                vnode, childvnode, child_childvnode, child_child_childvnode, child_child_child_childvnode;

            expect(vnodes.length).to.be.eql(1);
            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.id).to.be.eql('divone');
            expect(vnode.attrs['class']).to.be.eql('red blue');
            expect(vnode.classNames.red).to.be.true;
            expect(vnode.classNames.blue).to.be.true;
            expect(vnode.attrs.disabled).to.be.eql('');
            expect(vnode.attrs['data-x']).to.be.eql('somedata');
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(9);
            expect(vnode.vParent===undefined).to.be.true;

                // now examine the vChildNodes:
                childvnode = vnode.vChildNodes[0];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('IMG');
                expect(childvnode.isVoid).to.be.true;
                expect(childvnode.id).to.be.eql('imgone');
                expect(childvnode.attrs.src).to.be.eql('http://google.com/img1.jpg');
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[1];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('IMG');
                expect(childvnode.isVoid).to.be.true;
                expect(childvnode.id).to.be.eql('imgtwo');
                expect(childvnode.attrs.src).to.be.eql('http://google.com/img2.jpg');
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[2];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('IMG');
                expect(childvnode.isVoid).to.be.true;
                expect(childvnode.id).to.be.eql('imgthree');
                expect(childvnode.attrs.src).to.be.eql('http://google.com/img3.jpg');
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[3];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('IMG');
                expect(childvnode.isVoid).to.be.true;
                expect(childvnode.id).to.be.eql('imgfour');
                expect(childvnode.attrs.src).to.be.eql('http://google.com/img4.jpg');
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[4];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a textnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[5];
                expect(childvnode.nodeType).to.be.eql(8);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a commentnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[6];
                expect(childvnode.nodeType).to.be.eql(3);
                expect(childvnode.tag===undefined).to.be.true;
                expect(childvnode.isVoid===undefined).to.be.true;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs===undefined).to.be.true;
                expect(childvnode.text).to.be.eql('just a second textnode');
                expect(childvnode.vChildNodes===undefined).to.be.true;
                expect(childvnode.vParent).to.be.eql(vnode);

                childvnode = vnode.vChildNodes[7];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('DIV');
                expect(childvnode.isVoid).to.be.false;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes.length).to.be.eql(1);
                expect(childvnode.vParent).to.be.eql(vnode);

                    child_childvnode = childvnode.vChildNodes[0];
                    expect(child_childvnode.nodeType).to.be.eql(1);
                    expect(child_childvnode.tag).to.be.eql('UL');
                    expect(child_childvnode.isVoid).to.be.false;
                    expect(child_childvnode.id===undefined).to.be.true;
                    expect(child_childvnode.attrs['class']===undefined).to.be.true;
                    expect(child_childvnode.attrs.disabled===undefined).to.be.true;
                    expect(child_childvnode.attrs['data-x']===undefined).to.be.true;
                    expect(child_childvnode.text===undefined).to.be.true;
                    expect(child_childvnode.vChildNodes.length).to.be.eql(3);
                    expect(child_childvnode.vParent).to.be.eql(childvnode);

                        child_child_childvnode = child_childvnode.vChildNodes[0];
                        expect(child_child_childvnode.nodeType).to.be.eql(1);
                        expect(child_child_childvnode.tag).to.be.eql('LI');
                        expect(child_child_childvnode.isVoid).to.be.false;
                        expect(child_child_childvnode.id).to.be.eql('li1');
                        expect(child_child_childvnode.attrs['class']===undefined).to.be.true;
                        expect(child_child_childvnode.attrs.disabled===undefined).to.be.true;
                        expect(child_child_childvnode.attrs['data-x']===undefined).to.be.true;
                        expect(child_child_childvnode.text===undefined).to.be.true;
                        expect(child_child_childvnode.vChildNodes.length).to.be.eql(1);
                        expect(child_child_childvnode.vParent).to.be.eql(child_childvnode);

                            child_child_child_childvnode = child_child_childvnode.vChildNodes[0];
                            expect(child_child_child_childvnode.nodeType).to.be.eql(3);
                            expect(child_child_child_childvnode.tag===undefined).to.be.true;
                            expect(child_child_child_childvnode.isVoid===undefined).to.be.true;
                            expect(child_child_child_childvnode.id===undefined).to.be.true;
                            expect(child_child_child_childvnode.attrs===undefined).to.be.true;
                            expect(child_child_child_childvnode.text).to.be.eql('first');
                            expect(child_child_child_childvnode.vChildNodes===undefined).to.be.true;
                            expect(child_child_child_childvnode.vParent).to.be.eql(child_child_childvnode);

                        child_child_childvnode = child_childvnode.vChildNodes[1];
                        expect(child_child_childvnode.nodeType).to.be.eql(1);
                        expect(child_child_childvnode.tag).to.be.eql('LI');
                        expect(child_child_childvnode.isVoid).to.be.false;
                        expect(child_child_childvnode.id).to.be.eql('li2');
                        expect(child_child_childvnode.attrs['class']===undefined).to.be.true;
                        expect(child_child_childvnode.attrs.disabled===undefined).to.be.true;
                        expect(child_child_childvnode.attrs['data-x']===undefined).to.be.true;
                        expect(child_child_childvnode.text===undefined).to.be.true;
                        expect(child_child_childvnode.vChildNodes.length).to.be.eql(1);
                        expect(child_child_childvnode.vParent).to.be.eql(child_childvnode);

                            child_child_child_childvnode = child_child_childvnode.vChildNodes[0];
                            expect(child_child_child_childvnode.nodeType).to.be.eql(3);
                            expect(child_child_child_childvnode.tag===undefined).to.be.true;
                            expect(child_child_child_childvnode.isVoid===undefined).to.be.true;
                            expect(child_child_child_childvnode.id===undefined).to.be.true;
                            expect(child_child_child_childvnode.attrs===undefined).to.be.true;
                            expect(child_child_child_childvnode.text).to.be.eql('second');
                            expect(child_child_child_childvnode.vChildNodes===undefined).to.be.true;
                            expect(child_child_child_childvnode.vParent).to.be.eql(child_child_childvnode);

                        child_child_childvnode = child_childvnode.vChildNodes[2];
                        expect(child_child_childvnode.nodeType).to.be.eql(1);
                        expect(child_child_childvnode.tag).to.be.eql('LI');
                        expect(child_child_childvnode.isVoid).to.be.false;
                        expect(child_child_childvnode.id).to.be.eql('li3');
                        expect(child_child_childvnode.attrs['class']===undefined).to.be.true;
                        expect(child_child_childvnode.attrs.disabled===undefined).to.be.true;
                        expect(child_child_childvnode.attrs['data-x']===undefined).to.be.true;
                        expect(child_child_childvnode.text===undefined).to.be.true;
                        expect(child_child_childvnode.vChildNodes.length).to.be.eql(0);
                        expect(child_child_childvnode.vParent).to.be.eql(child_childvnode);

                childvnode = vnode.vChildNodes[8];
                expect(childvnode.nodeType).to.be.eql(1);
                expect(childvnode.tag).to.be.eql('DIV');
                expect(childvnode.isVoid).to.be.false;
                expect(childvnode.id===undefined).to.be.true;
                expect(childvnode.attrs['class']===undefined).to.be.true;
                expect(childvnode.attrs.disabled===undefined).to.be.true;
                expect(childvnode.attrs['data-x']===undefined).to.be.true;
                expect(childvnode.text===undefined).to.be.true;
                expect(childvnode.vChildNodes.length).to.be.eql(2);
                expect(childvnode.vParent).to.be.eql(vnode);

                    child_childvnode = childvnode.vChildNodes[0];
                    expect(child_childvnode.nodeType).to.be.eql(1);
                    expect(child_childvnode.tag).to.be.eql('DIV');
                    expect(child_childvnode.isVoid).to.be.false;
                    expect(child_childvnode.id===undefined).to.be.true;
                    expect(child_childvnode.attrs['class']===undefined).to.be.true;
                    expect(child_childvnode.attrs.disabled===undefined).to.be.true;
                    expect(child_childvnode.attrs['data-x']===undefined).to.be.true;
                    expect(child_childvnode.text===undefined).to.be.true;
                    expect(child_childvnode.vChildNodes.length).to.be.eql(0);
                    expect(child_childvnode.vParent).to.be.eql(childvnode);

                    child_childvnode = childvnode.vChildNodes[1];
                    expect(child_childvnode.nodeType).to.be.eql(3);
                    expect(child_childvnode.tag===undefined).to.be.true;
                    expect(child_childvnode.isVoid===undefined).to.be.true;
                    expect(child_childvnode.id===undefined).to.be.true;
                    expect(child_childvnode.attrs===undefined).to.be.true;
                    expect(child_childvnode.text).to.be.eql('some text');
                    expect(child_childvnode.vChildNodes===undefined).to.be.true;
                    expect(child_childvnode.vParent).to.be.eql(childvnode);

        });

        it('TextNode and Element', function () {
            var vnodes = htmlToVNodes('hi<div>ITSA</div>', vNodeProto),
                vnode, childvnode;
            expect(vnodes.length).to.be.eql(2);

            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(3);
            expect(vnode.text).to.be.eql('hi');
            expect(vnode.vParent===undefined).to.be.true;

            vnode = vnodes[1];
            expect(vnode.nodeType).to.be.eql(1);
            expect(vnode.tag).to.be.eql('DIV');
            expect(vnode.isVoid).to.be.false;
            expect(vnode.text===undefined).to.be.true;
            expect(vnode.vChildNodes.length).to.be.eql(1);
            expect(vnode.vParent===undefined).to.be.true;
        });

        it('TextNode', function () {
            var vnodes = htmlToVNodes('hi<div>ITSA</div>', vNodeProto),
                vnode, childvnode;
            expect(vnodes.length).to.be.eql(2);

            vnode = vnodes[0];
            expect(vnode.nodeType).to.be.eql(3);
            expect(vnode.text).to.be.eql('hi');
            expect(vnode.vParent===undefined).to.be.true;
        });

    });

}(global.window || require('node-win')));