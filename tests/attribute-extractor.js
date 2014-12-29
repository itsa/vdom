/*global describe, it */
/*jshint unused:false */
(function (window) {

    "use strict";

    var expect = require('chai').expect,
        should = require('chai').should(),
        extractor = require('../partials/attribute-extractor.js')(window);


    describe('extractClass', function () {

        it('none', function () {
            var className = '',
                extracted = extractor.extractClass(className);
            expect(extracted.attrClass===undefined).to.be.true;
            expect(extracted.classNames).to.be.eql({});
        });

        it('none messy', function () {
            var className = '   ',
                extracted = extractor.extractClass(className);
            expect(extracted.attrClass===undefined).to.be.true;
            expect(extracted.classNames).to.be.eql({});
        });

        it('single', function () {
            var className = 'red',
                extracted = extractor.extractClass(className);
            expect(extracted.attrClass).to.be.eql('red');
            expect(extracted.classNames).to.be.eql({red: true});
        });

        it('single messy', function () {
            var className = '  red   ',
                extracted = extractor.extractClass(className);
            expect(extracted.attrClass).to.be.eql('red');
            expect(extracted.classNames).to.be.eql({red: true});
        });

        it('multiple', function () {
            var className = 'red blue green',
                extracted = extractor.extractClass(className);
            expect(extracted.attrClass).to.be.eql('red blue green');
            expect(extracted.classNames).to.be.eql({red: true, blue: true, green: true});
        });

        it('multiple messy', function () {
            var className = '  red   blue  green  ',
                extracted = extractor.extractClass(className);
            expect(extracted.attrClass).to.be.eql('red blue green');
            expect(extracted.classNames).to.be.eql({red: true, blue: true, green: true});
        });

    });

    describe('extractStyle', function () {

        it('none', function () {
            var style = '',
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle===undefined).to.be.true;
            expect(extracted.styles).to.be.eql({});
        });

        it('none messy', function () {
            var style = '   ',
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle===undefined).to.be.true;
            expect(extracted.styles).to.be.eql({});
        });

        it('single', function () {
            var style = 'color: #F00; border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('single without semicolon', function () {
            var style = 'color: #F00',
                styles = {
                    element: {
                        color: '#F00'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('single messy 1', function () {
            var style = '  color: #F00;   border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('single messy 2', function () {
            var style = '  color: #F00;   border: solid 1px #000',
                styles = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('multiple', function () {
            var style = '{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }',
                styles = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    },
                    ':before': {
                        color: '#FF0',
                        'font-weight': 'bold'
                    },
                    ':after': {
                        color: '#999',
                        'font-weight': 'normal'
                    }
                },
                stylesNoPseudo = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            if (window.document._supportInlinePseudoStyles) {
                expect(extracted.attrStyle).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
                expect(extracted.styles).to.be.eql(styles);
            }
            else {
                expect(extracted.attrStyle).to.be.eql('color: #F00; border: solid 1px #000;');
                expect(extracted.styles).to.be.eql(stylesNoPseudo);
            }
        });

        it('multiple messy 1', function () {
            var style = '{color: #F00;   border: solid 1px #000   } :before {color: #FF0; font-weight: bold;   }:after{  color: #999; font-weight: normal;}',
                styles = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    },
                    ':before': {
                        color: '#FF0',
                        'font-weight': 'bold'
                    },
                    ':after': {
                        color: '#999',
                        'font-weight': 'normal'
                    }
                },
                stylesNoPseudo = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            if (window.document._supportInlinePseudoStyles) {
                expect(extracted.attrStyle).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
                expect(extracted.styles).to.be.eql(styles);
            }
            else {
                expect(extracted.attrStyle).to.be.eql('color: #F00; border: solid 1px #000;');
                expect(extracted.styles).to.be.eql(stylesNoPseudo);
            }
        });

        it('multiple messy 2', function () {
            var style = '{color: #F00;   border: solid 1px #000   } :before {color: #FF0; font-weight: bold;   }:after{  color: #999; font-weight: normal}',
                styles = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    },
                    ':before': {
                        color: '#FF0',
                        'font-weight': 'bold'
                    },
                    ':after': {
                        color: '#999',
                        'font-weight': 'normal'
                    }
                },
                stylesNoPseudo = {
                    element: {
                        color: '#F00',
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            if (window.document._supportInlinePseudoStyles) {
                expect(extracted.attrStyle).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
                expect(extracted.styles).to.be.eql(styles);
            }
            else {
                expect(extracted.attrStyle).to.be.eql('color: #F00; border: solid 1px #000;');
                expect(extracted.styles).to.be.eql(stylesNoPseudo);
            }
        });

    });

    describe('serializeStyles', function () {

        it('serializeStyles', function () {
            var styles = {
                element: {
                    color: '#F00',
                    border: 'solid 1px #000'
                }
            };
            expect(extractor.serializeStyles(styles)).to.be.eql('color: #F00; border: solid 1px #000;');
        });

        it('serializeStyles complex', function () {
            var styles = {
                element: {
                    color: '#F00',
                    border: 'solid 1px #000'
                },
                ':before': {
                    color: '#FF0',
                    'font-weight': 'bold'
                },
                ':after': {
                    color: '#999',
                    'font-weight': 'normal'
                }
            };
            if (window.document._supportInlinePseudoStyles) {
                expect(extractor.serializeStyles(styles)).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
            }
            else {
                expect(extractor.serializeStyles(styles)).to.be.eql('color: #F00; border: solid 1px #000;');
            }
        });

    });

    describe('extractStyle with transition', function () {

        it('single', function () {
            var style = 'color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        transition: {
                            width: {
                                duration: 2,
                                timingFunction: 'ease-in',
                                delay: 4.5
                            },
                            height: {
                                duration: 6
                            }
                        },
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('single without key', function () {
            var style = 'color: #F00; transition: 2s ease-in 4.5s; border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        transition: {
                            all: {
                                duration: 2,
                                timingFunction: 'ease-in',
                                delay: 4.5
                            }
                        },
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; transition: all 2s ease-in 4.5s; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('single with transition none', function () {
            var style = 'color: #F00; transition: none; border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        transition: {
                            none: {
                            }
                        },
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; transition: none; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('multiple', function () {
            var style = '{color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000; } :before {color: #FF0; transition: opacity 8s; font-weight: bold; } :after {color: #999; font-weight: normal; }',
                styles = {
                    element: {
                        color: '#F00',
                        transition: {
                            width: {
                                duration: 2,
                                timingFunction: 'ease-in',
                                delay: 4.5
                            },
                            height: {
                                duration: 6
                            }
                        },
                        border: 'solid 1px #000'
                    },
                    ':before': {
                        color: '#FF0',
                        transition: {
                            opacity: {
                                duration: 8
                            }
                        },
                        'font-weight': 'bold'
                    },
                    ':after': {
                        color: '#999',
                        'font-weight': 'normal'
                    }
                },
                stylesNoPseudo = {
                    element: {
                        color: '#F00',
                        transition: {
                            width: {
                                duration: 2,
                                timingFunction: 'ease-in',
                                delay: 4.5
                            },
                            height: {
                                duration: 6
                            }
                        },
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            if (window.document._supportInlinePseudoStyles) {
                expect(extracted.attrStyle).to.be.eql('{color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000; } :before {color: #FF0; transition: opacity 8s; font-weight: bold; } :after {color: #999; font-weight: normal; }');
                expect(extracted.styles).to.be.eql(styles);
            }
            else {
                expect(extracted.attrStyle).to.be.eql('color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000;');
                expect(extracted.styles).to.be.eql(stylesNoPseudo);
            }
        });

    });

    describe('serializeStyles with transition', function () {

        it('serializeStyles', function () {
            var styles = {
                element: {
                    color: '#F00',
                    transition: {
                        width: {
                            duration: 2,
                            timingFunction: 'ease-in',
                            delay: 4.5
                        },
                        height: {
                            duration: 6
                        }
                    },
                    border: 'solid 1px #000'
                }
            };
            expect(extractor.serializeStyles(styles)).to.be.eql('color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000;');
        });

        it('serializeStyles complex', function () {
            var styles = {
                element: {
                    color: '#F00',
                    transition: {
                        width: {
                            duration: 2,
                            timingFunction: 'ease-in',
                            delay: 4.5
                        },
                        height: {
                            duration: 6
                        }
                    },
                    border: 'solid 1px #000'
                },
                ':before': {
                    color: '#FF0',
                    transition: {
                        opacity: {
                            duration: 8
                        }
                    },
                    'font-weight': 'bold'
                },
                ':after': {
                    color: '#999',
                    'font-weight': 'normal'
                }
            };
            if (window.document._supportInlinePseudoStyles) {
                expect(extractor.serializeStyles(styles)).to.be.eql('{color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000; } :before {color: #FF0; transition: opacity 8s; font-weight: bold; } :after {color: #999; font-weight: normal; }');
            }
            else {
                expect(extractor.serializeStyles(styles)).to.be.eql('color: #F00; transition: width 2s ease-in 4.5s, height 6s; border: solid 1px #000;');
            }
        });

    });

}(global.window || require('node-win')));