
doc = {
    childNodes: [],

    addEventListener: function (type, cb, capture) {
        count('addEventListener');
        if (!this.$on) {
            this.$on = {};
        }
        this.$on[type] = {
            cb: cb,
            capture: capture
        };
    },

    appendChild: function(child) {
        var instance = this;
        count('appendChild');
        if (child.isFragment) {
            child.childNodes.forEach(function(node) {
                instance.appendChild(node);
            });
        }
        else {
            // force to be placed at the end
            // Array.remove is delivered by js-ext
            instance.childNodes.remove(child);
            instance.childNodes.push(child);
            child.parentNode = instance;
        }
    },

    contains: function (node) {
        count('contains');
        while (node && (node!==this)) {
            node = node.parentNode;
        }
        return (node===this);
    },

    createDocumentFragment: function() {
        var element = doc.createElement('div');
        element.isFragment = true;
        return element;
    },

    createElement: function(tag) {
        count('createElement');
        return {
            style: {},
            childNodes: [],
            nodeName: tag.toUpperCase(),
            appendChild: doc.appendChild.bind(this),
            removeChild: doc.removeChild.bind(this),
            replaceChild: doc.replaceChild.bind(this),
            insertBefore: function(node, reference) {
                count('insertBefore');
                var instance = this;
                if (node.isFragment) {
                    node.childNodes.forEach(function(node) {
                        instance.parentNode.insertBefore(node, reference);
                    });
                }
                else {
                    node.parentNode = instance;
                    var referenceIndex = instance.childNodes.indexOf(reference);
                    if (referenceIndex < 0) {
                        instance.childNodes.push(node);
                    } else {
                        var index = instance.childNodes.indexOf(node);
                        instance.childNodes.splice(referenceIndex, index < 0 ? 0 : 1, node);
                    }
                }
            },
            insertAdjacentHTML: function(position, html) {
                count('insertAdjacentHTML');

                //todo: accept markup
                if (position == "beforebegin") {
                    this.parentNode.insertBefore(doc.createTextNode(html), this);
                } else if (position == "beforeend") {
                    this.appendChild(doc.createTextNode(html));
                }
            },
            setAttribute: function(name, value) {
                count('setAttribute');
                this[name] = value.toString();
                if (name == 'href') {
                    var url = Url.parse(value);
                    this.pathname = url.pathname;
                    if (url.search) this.search = url.search;
                }
            },
            setAttributeNS: function(namespace, name, value) {
                count('setAttributeNS');
                this.namespaceURI = namespace;
                this[name] = value.toString();
            },
            getAttribute: function(name) {
                count('getAttribute');
                return this[name];
            },
            addEventListener: doc.addEventListener,
            removeEventListener: doc.removeEventListener,
            dispatchEvent: doc.dispatchEvent,
            // matchesSelector should match nested selectors like: "#someid .somedivclass button.someclass"
            matchesSelector: function (selector) {
                var selList = selector.replace(/( )+/g, ' ').split(' '),
                    size = selList.length,
                    matches, i, selectorItem, node, selMatch;
                matches = function (checkNode, sel) {
                    count('matchesSelector');
                    // don't forget to reset the found position of the previous search:
                    vNodeParser.lastIndex = 0;
                    var match,
                        found = false,
                        classes = checkNode.className && checkNode.className.split(' ');
                    /*jshint boss:true*/
                    while (match = vNodeParser.exec(sel)) {
                        /*jshint boss:false*/
                        switch (match[1]) {
                            case "":
                                if (checkNode.nodeName !== match[2].toUpperCase()) return false;
                                found = true;
                                break;
                            case "#":
                                if (checkNode.id !== match[2]) return false;
                                found = true;
                                break;
                            case ".":

                                if (!classes || classes.indexOf(match[2]) === -1) return false;
                                found = true;
                                break;
                        }
                    }
                    return found;
                };
                if (size===0) {
                    return false;
                }
                node = this;
                selectorItem = selList[size-1];
                selMatch = matches(node, selectorItem);
                for (i=size-2; (selMatch && (i>=0)); i--) {
                    selectorItem = selList[i];
                    node = node.parentNode;
                    while (node && !(selMatch=matches(node, selectorItem))) {
                        node = node.parentNode;
                    }
                }
                return selMatch;
            },
            getElementById: doc.getElementById,
            contains: doc.contains
        };
    },

    createElementNS: function(namespace, tag) {
        count('createElementNS');
        var element = doc.createElement(tag);
        element.namespaceURI = namespace;
        return element;
    },

    createEvent: function (type) {
        count('createEvent');
        return new EventTypes[type]();
    },

    createTextNode: function(text) {
        count('createTextNode');
        return {nodeValue: text.toString()};
    },

    dispatchEvent: function (event) {
        count('dispatchEvent');
        var branch = [],
            el = this,
            type = event.ev.type,
            cb,
            ev = event.ev;
        ev.target = this;

        while(el) {
            if (el.$on && el.$on[type] && el.$on[type].capture) {
                branch.push(el);
                branch.push(el.$on[type].cb);
            }
            el = el.parentNode;
        }
        while ((cb =  branch.pop())) {
            ev.currentTarget = branch.pop();
            cb.call(this, ev);
        }
        el = this;
        while (el) {
            if (el.$on && el.$on[type] && el.$on[type].capture === false) {
                ev.currentTarget = el;
                el.$on[type].cb.call(this, ev);
            }
            if (el['on' + type]) {
                ev.currentTarget = el;
                el['on' + type].call(this, ev);
            }
            el = el.parentNode;
        }
    },

    documentElement: function() {
        return this.createElement('html');
    },

    getElementById: function (id) {
        count('getElementById');
        var found = null,
            find = function (el) {
                if (el.id === id) {
                    found = el;
                    return true;
                }
                if (el.childNodes) {
                    return el.childNodes.some(find);
                }
            };
        find(doc);
        return found;
    },

    insertBefore: function(node, reference) {
        count('insertBefore');
        var instance = this;
        if (node.isFragment) {
            node.childNodes.forEach(function(node) {
                instance.parentNode.insertBefore(node, reference);
            });
        }
        else {
            node.parentNode = instance;
            var referenceIndex = instance.childNodes.indexOf(reference);
            if (referenceIndex < 0) {
                instance.childNodes.push(node);
            } else {
                var index = instance.childNodes.indexOf(node);
                instance.childNodes.splice(referenceIndex, index < 0 ? 0 : 1, node);
            }
        }
    },

    replaceChild: function(newChild, oldChild) {
        count('replaceChild');
        var instance = this,
            index = this.childNodes.indexOf(oldChild);
        instance.childNodes || (instance.childNodes=[]);
        if (newChild.isFragment) {
            // child.childNodes.forEach(doc.appendChild.bind(doc));
            newChild.childNodes.forEach(function(node) {
                instance.parentNode.insertBefore(node, oldChild);
            });
            instance.parentNode.removeChild(oldChild);
        }
        else {
            if (index > -1) instance.childNodes.splice(index, 1, newChild);
            else instance.childNodes.push(newChild);
            newChild.parentNode = instance;
            oldChild.parentNode = null;
        }
    },

    removeChild: function(child) {
        count('removeChild');
        var index = this.childNodes.indexOf(child);
        this.childNodes.splice(index, 1);
        child.parentNode = null;
    },

    removeEventListener: function (type) {
        count('removeEventListener');
        if (this.$on && this.$on[type]) {
            delete this.$on[type];
        }
    }

};
