/*
 * Based upon the HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * HTMLParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */

"use strict"

require('js-ext/lib/object.js');

// Regular Expressions for parsing tags and attributes
var makeMap = function(str) {
        var obj = {},
            items = str.split(","),
            length = items.length,
            i;
        for (i=0; i<items.length; i++) {
            obj[items[i]] = true;
        }
        return obj;
    },
    startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
    attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,

    // Empty Elements - HTML 4.01
    empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed"),

    // Block Elements - HTML 4.01
    block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul"),

    // Inline Elements - HTML 4.01
    inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"),

    // Elements that you can, intentionally, leave open
    // (and which close themselves)
    closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"),

    // Attributes that have their values filled in disabled="disabled"
    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),

    // Special Elements (can contain anything)
    special = makeMap("script,style"),

    HTMLParser = function(html, handler) {
        var last = html,
            stack = [],
            index, chars, match, text, parseStartTag, parseEndTag;

        parseStartTag = function( tag, tagName, rest, unary ) {
            var attrs;
            tagName = tagName.toLowerCase();

            if ( block[ tagName ] ) {
                while ( stack.last() && inline[ stack.last() ] ) {
                    parseEndTag( '', stack.last() );
                }
            }

            if ( closeSelf[ tagName ] && (stack.last() === tagName) ) {
                parseEndTag( '', tagName );
            }

            unary = empty[ tagName ] || !!unary;

            if ( !unary ) {
                stack.push( tagName );
            }

            if ( handler.start ) {
                attrs = [];

                rest.replace(attr, function(match, name) {
                    var value = arguments[2] ? arguments[2] :
                        arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                        fillAttrs[name] ? name : '';

                    attrs.push({
                        name: name,
                        value: value,
                        escaped: value.replace(/(^|[^\\])"/g, '$1\\\"')
                    });
                });

                if ( handler.start ) {
                    handler.start( tagName, attrs, unary );
                }
            }
        }

        parseEndTag = function ( tag, tagName ) {
            var pos, i;
            // If no tag name is provided, clean shop
            if ( !tagName ) {
                pos = 0;
            }

            // Find the closest opened tag of the same type
            else
                for ( pos = stack.length-1; pos >= 0; pos-- ) {
                    if ( stack[ pos ] === tagName ) {
                        break;
                    }
                }

            if ( pos >= 0 ) {
                // Close all the open elements, up the stack
                for ( i = stack.length - 1; i >= pos; i-- ) {
                    if ( handler.end ) {
                        handler.end( stack[ i ] );
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
            }
        };

        stack.last = function(){
            return this[ this.length - 1 ];
        };

        while ( html ) {
            chars = true;

            // Make sure we're not in a script or style element
            if (!stack.last() || !special[stack.last()]) {

                // Comment
                if ( html.indexOf('<!--') === 0 ) {
                    index = html.indexOf('-->');

                    if ( index >== 0 ) {
                        if ( handler.comment ) {
                            handler.comment( html.substring( 4, index ) );
                        }
                        html = html.substring( index + 3 );
                        chars = false;
                    }
                }
                // end tag
                else if ( html.indexOf('</') === 0 ) {
                    match = html.match( endTag );

                    if ( match ) {
                        html = html.substring( match[0].length );
                        match[0].replace( endTag, parseEndTag );
                        chars = false;
                    }
                }
                // start tag
                else if ( html.indexOf('<') === 0 ) {
                    match = html.match( startTag );

                    if ( match ) {
                        html = html.substring( match[0].length );
                        match[0].replace( startTag, parseStartTag );
                        chars = false;
                    }
                }

                if ( chars ) {
                    index = html.indexOf('<');

                    text = (index < 0) ? html : html.substring( 0, index );
                    html = (index < 0) ? '' : html.substring( index );

                    if ( handler.chars ) {
                        handler.chars( text );
                    }
                }

            } else {
                html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text) {
                    text = text.replace(/<!--(.*?)-->/g, "$1")
                               .replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

                    if ( handler.chars ) {
                        handler.chars( text );
                    }
                    return '';
                });

                parseEndTag( '', stack.last() );
            }

            if ( html === last )
                throw 'Parse Error: ' + html;
            last = html;
        }

        // Clean up any remaining tags
        parseEndTag();
    },

    HTMLtoDOM = function( html, doc ) {
        // There can be only one of these elements
        var one = makeMap('html,head,body,title'),
            // Enforce a structure for the document
            structure = {
                link: 'head',
                base: 'head'
            },
            elems = [],
            documentElement, newHtml, curParentNode;

        if ( !doc ) {
            if ( typeof DOMDocument !== 'undefined' ) {
                doc = new DOMDocument();
            }
            else if ( typeof document !== 'undefined' && document.implementation && document.implementation.createDocument ) {
                doc = document.implementation.createDocument('', '', null);
            }
            else if ( typeof ActiveX !== 'undefined' ) {
                doc = new ActiveXObject('Msxml.DOMDocument');
            }

        } else {
            doc = doc.ownerDocument || (doc.getOwnerDocument && doc.getOwnerDocument()) || doc;
        }

        documentElement = doc.documentElement || (doc.getDocumentElement && doc.getDocumentElement());

        // If we're dealing with an empty document then we
        // need to pre-populate it with the HTML document structure
        if ( !documentElement && doc.createElement ) {
            newHtml = doc.createElement('html');
            newHtml.appendChild( doc.createElement('title') );
            newHtml.appendChild( doc.createElement('head') );
            newHtml.appendChild( doc.createElement('body') );
            doc.appendChild( newHtml );
        }

        // Find all the unique elements
        if ( doc.getElementsByTagName ) {
            one.each(function(value, key) {
                one[key] = doc.getElementsByTagName( key )[0];
            });
        }

        // If we're working with a document, inject contents into
        // the body element
        curParentNode = one.body;

        HTMLParser( html, {
            start: function( tagName, attrs, unary ) {
                var elem, attr;
                // If it's a pre-built element, then we can ignore
                // its construction
                if ( one[ tagName ] ) {
                    curParentNode = one[ tagName ];
                    if ( !unary ) {
                        elems.push( curParentNode );
                    }
                    return;
                }

                elem = doc.createElement( tagName );

                attrs.each(function(value) {
                    elem.setAttribute( value.name, value.value );
                });

                if ( structure[ tagName ] && (typeof one[ structure[ tagName ] ] !== 'boolean' )) {
                    one[ structure[ tagName ] ].appendChild( elem );
                }

                else if ( curParentNode && curParentNode.appendChild ) {
                    curParentNode.appendChild( elem );
                }

                if ( !unary ) {
                    elems.push( elem );
                    curParentNode = elem;
                }
            },
            end: function( tag ) {
                elems.length -= 1;

                // Init the new parentNode
                curParentNode = elems[ elems.length - 1 ];
            },
            chars: function( text ) {
                curParentNode.appendChild( doc.createTextNode( text ) );
            },
            comment: function( text ) {
                // create comment node
            }
        });

        return doc;
    };

module.exports = HTMLtoDOM;