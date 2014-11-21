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
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
            expect(extracted.styles).to.be.eql(styles);
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
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
            expect(extracted.styles).to.be.eql(styles);
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
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
            expect(extracted.styles).to.be.eql(styles);
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
            expect(extractor.serializeStyles(styles)).to.be.eql('{color: #F00; border: solid 1px #000; } :before {color: #FF0; font-weight: bold; } :after {color: #999; font-weight: normal; }');
        });

    });

    describe('extractStyle with transform', function () {

        it('single', function () {
            var style = 'color: #F00; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px); border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        transform: {
                            translateX: '10px',
                            matrix: '1.0, 2.0, 3.0, 4.0, 5.0, 6.0',
                            translateY: '5px'
                        },
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px); border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('single with transform none', function () {
            var style = 'color: #F00; transform: none; border: solid 1px #000;',
                styles = {
                    element: {
                        color: '#F00',
                        transform: {
                            none: true
                        },
                        border: 'solid 1px #000'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('color: #F00; transform: none; border: solid 1px #000;');
            expect(extracted.styles).to.be.eql(styles);
        });

        it('multiple', function () {
            var style = '{color: #F00; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px); border: solid 1px #000; } :before {color: #FF0; transform: translateX(50px) translateY(150px); font-weight: bold; } :after {color: #999; font-weight: normal; }',
                styles = {
                    element: {
                        color: '#F00',
                        transform: {
                            translateX: '10px',
                            matrix: '1.0, 2.0, 3.0, 4.0, 5.0, 6.0',
                            translateY: '5px'
                        },
                        border: 'solid 1px #000'
                    },
                    ':before': {
                        color: '#FF0',
                        transform: {
                            translateX: '50px',
                            translateY: '150px'
                        },
                        'font-weight': 'bold'
                    },
                    ':after': {
                        color: '#999',
                        'font-weight': 'normal'
                    }
                },
                extracted = extractor.extractStyle(style);
            expect(extracted.attrStyle).to.be.eql('{color: #F00; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px); border: solid 1px #000; } :before {color: #FF0; transform: translateX(50px) translateY(150px); font-weight: bold; } :after {color: #999; font-weight: normal; }');
            expect(extracted.styles).to.be.eql(styles);
        });

    });

    describe('serializeStyles with transform', function () {

        it('serializeStyles', function () {
            var styles = {
                element: {
                    color: '#F00',
                    transform: {
                        translateX: '50px',
                        translateY: '150px'
                    },
                    border: 'solid 1px #000'
                }
            };
            expect(extractor.serializeStyles(styles)).to.be.eql('color: #F00; transform: translateX(50px) translateY(150px); border: solid 1px #000;');
        });

        it('serializeStyles with transform none', function () {
            var styles = {
                element: {
                    color: '#F00',
                    transform: {
                        none: true
                    },
                    border: 'solid 1px #000'
                }
            };
            expect(extractor.serializeStyles(styles)).to.be.eql('color: #F00; transform: none; border: solid 1px #000;');
        });

        it('serializeStyles complex', function () {
            var styles = {
                element: {
                    color: '#F00',
                    transform: {
                        translateX: '10px',
                        matrix: '1.0, 2.0, 3.0, 4.0, 5.0, 6.0',
                        translateY: '5px'
                    },
                    border: 'solid 1px #000'
                },
                ':before': {
                    color: '#FF0',
                    transform: {
                        translateX: '50px',
                        translateY: '150px'
                    },
                    'font-weight': 'bold'
                },
                ':after': {
                    color: '#999',
                    'font-weight': 'normal'
                }
            };
            expect(extractor.serializeStyles(styles)).to.be.eql('{color: #F00; transform: translateX(10px) matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0) translateY(5px); border: solid 1px #000; } :before {color: #FF0; transform: translateX(50px) translateY(150px); font-weight: bold; } :after {color: #999; font-weight: normal; }');
        });

    });
}(global.window || require('node-win')));