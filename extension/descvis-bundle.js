'use strict';

var DescUi = /** @class */ (function () {
    function DescUi(descvis, element) {
        this.descvis = descvis;
        this.element = element;
        this.cursorResetTimeout = 0;
        this.addTemplate();
        this.initiateCursors();
        this.descvis.protocol.communication.onConnectionCallback = this.updateConnections.bind(this);
        this.updateConnections();
    }
    DescUi.prototype.initiateCursors = function () {
        this.element.addEventListener('mousemove', this.mouseMoved.bind(this));
        var container = document.createElement('div');
        container.id = 'desc-cursors';
        document.body.appendChild(container);
    };
    DescUi.prototype.getCursor = function (participant) {
        var elementId = "desc-cursor-" + participant;
        var cursor = document.getElementById(elementId);
        if (!cursor) {
            var cursors = document.getElementById('desc-cursors');
            cursor = document.createElement('div');
            cursor.style.background = stringToHex(participant);
            cursor.style.width = '5px';
            cursor.style.height = '5px';
            cursor.style.position = 'absolute';
            cursor.style.borderRadius = '3px';
            cursor.style.pointerEvents = 'none';
            cursor.id = elementId;
            cursors.appendChild(cursor);
        }
        return cursor;
    };
    DescUi.prototype.mouseMoved = function (originalEvent) {
        var event = originalEvent;
        var participant = event['participantId'];
        if (!participant || this.descvis.protocol.communication.id === participant) {
            return;
        }
        var cursor = this.getCursor(participant);
        cursor.style.left = event.clientX - 2 + "px";
        cursor.style.top = event.clientY - 2 + "px";
    };
    DescUi.prototype.eventCancelled = function (event) {
        clearTimeout(this.cursorResetTimeout);
        document.body.style.cursor = 'not-allowed';
        this.cursorResetTimeout = window.setTimeout(function () {
            document.body.style.cursor = '';
        }, 50);
    };
    DescUi.prototype.updateConnections = function () {
        var connections = this.descvis.protocol.communication.getNumberOfConnections();
        var collaborators = connections - 1;
        if (collaborators > 0) {
            document.getElementById('desc-container').style.height = '70px';
            document.getElementById('desc-collab-notice').style.display = 'inline';
            document.getElementById('desc-collab-count').innerText = String(collaborators);
        }
        else {
            document.getElementById('desc-container').style.height = '50px';
            document.getElementById('desc-collab-notice').style.display = 'none';
        }
    };
    DescUi.prototype.invite = function () {
        var communication = this.descvis.protocol.communication;
        var leaderId = communication.leaderId;
        var logo = document.getElementById('desc-logo');
        if (!leaderId) {
            var errorElement_1 = document.getElementById('desc-not-ready');
            logo.style.display = 'none';
            errorElement_1.style.display = 'inline';
            setTimeout(function () {
                logo.style.display = 'block';
                errorElement_1.style.display = 'none';
            }, 1000);
            return;
        }
        var url = leaderId === communication.id ? location.href + '?visconnectid=' + leaderId : location.href;
        copyToClipboard(url);
        var inviteLinkCopied = document.getElementById('desc-link-copied');
        logo.style.display = 'none';
        inviteLinkCopied.style.display = 'inline';
        setTimeout(function () {
            logo.style.display = 'block';
            inviteLinkCopied.style.display = 'none';
        }, 2000);
    };
    DescUi.prototype.addTemplate = function () {
        var container = document.createElement('div');
        container.id = 'desc-container';
        container.innerHTML = "\n<a id=\"desc-invite\">\n    <!--<svg id=\"desc-logo\" width=\"50\" aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"link\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" class=\"svg-inline&#45;&#45;fa fa-link fa-w-16 fa-2x\"><path fill=\"#fff\" d=\"M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z\" class=\"\"></path></svg>-->\n    <svg id=\"desc-logo\" width=\"50\" version=\"1.1\" viewBox=\"0 0 55.55724 55.55724\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">\n        <g transform=\"translate(-15.5 -20.905)\">\n            <path d=\"m49.236 53.67s-6.0878-19.94-22.215-6.3478c-10.3 8.6812-12.464 16.499-6.203 23.516 7.1388 8.0014 16.301 3.8953 25.966-10.387\" fill=\"none\" stroke=\"#36b\" stroke-width=\"3\"/>\n            <path d=\"m36.975 38.666s14.57-21.929 26.543-12.407c11.973 9.5217 1.9956 17.866-2.3081 22.362-6.4915 6.7806-14.408 11.996-20.629 5.0494-3.8794-4.3324-4.3277-7.6462-4.3277-7.6462\" fill=\"none\" stroke=\"#36b\" stroke-width=\"3\"/>\n            <path d=\"m61.313 40.246h-3.6787l1.936 4.6647c0.13471 0.32337-0.01958 0.68598-0.32747 0.82317l-1.7049 0.73499c-0.31772 0.13713-0.67422-0.01936-0.80906-0.33321l-1.8397-4.4295-3.0052 3.0575c-0.40047 0.40736-1.05 0.09324-1.05-0.44098v-14.738c0-0.56252 0.69082-0.83679 1.0499-0.44098l9.8624 10.034c0.39783 0.38345 0.10406 1.0682-0.43342 1.0682z\" fill=\"#fff\" stroke=\"#000\"/>\n            <path d=\"m37.341 62.869h-3.6787l1.936 4.6647c0.13472 0.32337-0.01958 0.68598-0.32747 0.82317l-1.7049 0.73499c-0.31772 0.13713-0.67422-0.01936-0.80906-0.33321l-1.8397-4.4295-3.0052 3.0575c-0.40047 0.40736-1.05 0.09324-1.05-0.44098v-14.738c0-0.56253 0.69082-0.83679 1.0499-0.44098l9.8624 10.034c0.39783 0.38345 0.10406 1.0682-0.43342 1.0682z\" fill=\"#fff\" stroke=\"#000\"/>\n        </g>\n    </svg>\n</a>\n<span id=\"desc-link-copied\">Invite Link Copied.</span>\n<span id=\"desc-not-ready\">Not yet ready...</span>\n<span id=\"desc-collab-notice\"><span id=\"desc-collab-count\"></span> connected</span>\n\n<style>\n#desc-container {\n    position: fixed;\n    right: 10px;\n    bottom: 100px;\n    background: rgba(120,120,120,0.5);\n    border: 1px solid #ccc;\n    border-radius: 10px;\n    width: 80px;\n    height: 50px;\n    padding: 10px;\n    transition: height 500ms;\n    color: #fff;\n    font-family: 'Times New Roman',Times;\n}\n#desc-logo {\n    padding-left: 15px;\n    display: block;\n    background: transparent;\n}\n#desc-invite:hover {\n    cursor: pointer;\n}\n#desc-invite:hover #desc-logo path {\n    stroke: #000;\n} \n#desc-link-copied, #desc-collab-notice, #desc-not-ready {\n    display: none;\n}\n#desc-collab-notice {\n    font-size: 11pt;\n    position: relative;\n    top: 5px;\n    display: inline-block;\n    width: 100px;\n}\n</style>";
        document.body.appendChild(container);
        document.getElementById('desc-invite').onclick = this.invite.bind(this);
    };
    return DescUi;
}());
// From https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
var copyToClipboard = function (str) {
    var el = document.createElement('textarea');
    el.value = str;
    //console.log(str);
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    var selection = document.getSelection();
    var selected = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected && selection) {
        selection.removeAllRanges();
        selection.addRange(selected);
    }
};
// From https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
var stringToHex = function (string) {
    var hash = 0;
    if (string.length === 0)
        return '#000000';
    for (var i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 255;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

var DescListener = /** @class */ (function () {
    function DescListener(svg, hearEvent) {
        this.svg = svg;
        this.hearEvent = hearEvent;
        this.dragElement = null;
        this.addListenersToElementAndChildren(this.svg);
    }
    DescListener.prototype.addListenersToElementAndChildren = function (element) {
        this.addListenersToElement(element);
        for (var _i = 0, _a = element.children; _i < _a.length; _i++) {
            var child = _a[_i];
            this.addListenersToElementAndChildren(child);
        }
    };
    DescListener.prototype.addListenersToElement = function (element) {
        var boundCapture = this.captureEvent(element).bind(this);
        element.addEventListener('mousemove', boundCapture);
        element.addEventListener('mouseup', boundCapture);
        element.addEventListener('mousedown', boundCapture);
        element.addEventListener('touchmove', boundCapture);
        element.addEventListener('mouseenter', boundCapture);
        element.addEventListener('mouseout', boundCapture);
        element.addEventListener('mouseover', boundCapture);
        element.addEventListener('mouseleave', boundCapture);
        element.addEventListener('click', boundCapture);
        element.addEventListener('touchstart', boundCapture);
        element.addEventListener('touchend', boundCapture);
        element.addEventListener('selectstart', boundCapture);
        element.addEventListener('dragstart', boundCapture);
        // Add listeners to future child elements.
        var appendBackup = element.appendChild;
        var insertBeforeBackup = element.insertBefore;
        var that = this;
        element.appendChild = function (newChild) {
            that.addListenersToElement(newChild);
            return appendBackup.call(this, newChild);
        };
        element.insertBefore = function (newChild, nextChild) {
            that.addListenersToElement(newChild);
            return insertBeforeBackup.call(this, newChild, nextChild);
        };
    };
    DescListener.prototype.captureEvent = function (element) {
        var _this = this;
        return function (e) {
            if (e.target !== element) {
                // Only capture for the correct target.
                return;
            }
            if (e['desc-received']) {
                // Don't broadcast events that have been received from other clients.
                return;
            }
            if (e.type === 'mousedown') {
                _this.dragElement = e.target;
            }
            if (e.type === 'mouseup') {
                _this.dragElement = null;
            }
            if (e.type === 'mousemove' && _this.dragElement && e.target !== _this.dragElement) {
                //console.log('changing event target');
                e.stopImmediatePropagation();
                e.stopPropagation();
                e['stopImmediatePropagationBackup']();
                e.preventDefault();
                Object.defineProperty(e, 'target', {
                    enumerable: false,
                    writable: true,
                    value: _this.dragElement,
                });
                var eventCopy = new MouseEvent(e.type, e);
                _this.dragElement.dispatchEvent(eventCopy);
            }
            var eventObj = _this.getStrippedEvent(e);
            //this.connection.broadcastEvent(eventObj);
            _this.hearEvent(eventObj, e);
        };
    };
    DescListener.prototype.getStrippedEvent = function (e) {
        var obj = { type: '', target: '', touches: [], timeStamp: -1, participantId: '' };
        for (var key in e) {
            var val = e[key];
            if (typeof val !== 'object' && typeof val !== 'function') {
                obj[key] = val;
            }
        }
        if (e instanceof TouchEvent && e.touches && e.touches.length) {
            for (var _i = 0, _a = e.touches; _i < _a.length; _i++) {
                var touch = _a[_i];
                obj.touches.push({ clientX: touch.clientX, clientY: touch.clientY });
            }
        }
        var target = this.getElementSelector(e.target);
        if (target) {
            obj.target = target;
        }
        return obj;
    };
    DescListener.prototype.getElementSelector = function (element) {
        if (!element) {
            return null;
        }
        if (element === document.body) {
            return 'body';
        }
        var parent = element.parentNode;
        if (!parent) {
            return null;
        }
        var index = Array.from(parent.children).indexOf(element);
        var type = element.tagName;
        return this.getElementSelector(parent) + (" > " + type + ":nth-child(" + (index + 1) + ")");
    };
    return DescListener;
}());

function delayAddEventListener() {
    // The visualization's event listeners need to be called after DESCVis' event listeners.
    // For this reason, we delay calling event listeners that are added before DESCVis is started.
    Element.prototype['addEventListenerBackup'] = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (eventName, callback) {
        //console.log('doing a delayed execution on ', eventName, this);
        var that = this;
        setTimeout(function () {
            Element.prototype['addEventListenerBackup'].call(that, eventName, callback);
        }, 110);
    };
    // After the visualization code is run, reset the addEventListener function to its normal functionality, and start
    // DESCVis.
    return new Promise(function (resolve) {
        window.setTimeout(function () {
            Element.prototype.addEventListener = Element.prototype['addEventListenerBackup'];
            resolve();
        }, 100);
    });
}
function disableStopPropagation() {
    // Prevent d3 from blocking DescVis and other code to have access to events.
    Event.prototype['stopImmediatePropagationBackup'] = Event.prototype.stopImmediatePropagation;
    Event.prototype.stopImmediatePropagation = function () { };
}
function stopPropagation(event) {
    event['stopImmediatePropagationBackup']();
    event.stopPropagation();
}
function recreateEvent(eventObject, target) {
    var targetSelector = eventObject.target;
    var e;
    if (eventObject.type.substr(0, 5) === 'touch') {
        e = document.createEvent('TouchEvent');
        e.initEvent(eventObject.type, true, false);
        for (var prop in eventObject) {
            if (prop !== 'isTrusted' && eventObject.hasOwnProperty(prop)) {
                Object.defineProperty(e, prop, {
                    writable: true,
                    value: eventObject[prop],
                });
            }
        }
        //e = new TouchEvent(eventObject.type, eventObject as any);
    }
    else if (eventObject.type.substr(0, 5) === 'mouse' || eventObject.type === 'click') {
        e = new MouseEvent(eventObject.type, eventObject);
    }
    else if (eventObject.type.substr(0, 4) === 'drag') {
        e = new DragEvent(eventObject.type, eventObject);
    }
    else {
        e = new Event(eventObject.type, eventObject);
    }
    if (targetSelector) {
        var newTarget = document.querySelector(targetSelector);
        if (!newTarget) {
            console.error('element not found', targetSelector);
            //throw new Error('element not found');
            newTarget = document.body;
        }
        target = newTarget;
    }
    Object.defineProperty(e, 'target', {
        writable: true,
        value: target,
    });
    Object.defineProperty(e, 'view', {
        writable: true,
        value: window,
    });
    return e;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isFunction(x) {
    return typeof x === 'function';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
    Promise: undefined,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = /*@__PURE__*/ new Error();
            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function hostReportError(err) {
    setTimeout(function () { throw err; }, 0);
}

/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
var empty = {
    closed: true,
    next: function (value) { },
    error: function (err) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            throw err;
        }
        else {
            hostReportError(err);
        }
    },
    complete: function () { }
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isObject(x) {
    return x !== null && typeof x === 'object';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return UnsubscriptionErrorImpl;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;

/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
var Subscription = /*@__PURE__*/ (function () {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._unsubscribe = unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parentOrParents = _a._parentOrParents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) {
            _parentOrParents.remove(this);
        }
        else if (_parentOrParents !== null) {
            for (var index = 0; index < _parentOrParents.length; ++index) {
                var parent_1 = _parentOrParents[index];
                parent_1.remove(this);
            }
        }
        if (isFunction(_unsubscribe)) {
            try {
                _unsubscribe.call(this);
            }
            catch (e) {
                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
            }
        }
        if (isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject(sub)) {
                    try {
                        sub.unsubscribe();
                    }
                    catch (e) {
                        errors = errors || [];
                        if (e instanceof UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                        }
                        else {
                            errors.push(e);
                        }
                    }
                }
            }
        }
        if (errors) {
            throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (teardown) {
        var subscription = teardown;
        if (!teardown) {
            return Subscription.EMPTY;
        }
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (!(subscription instanceof Subscription)) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default: {
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
        }
        var _parentOrParents = subscription._parentOrParents;
        if (_parentOrParents === null) {
            subscription._parentOrParents = this;
        }
        else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) {
                return subscription;
            }
            subscription._parentOrParents = [_parentOrParents, this];
        }
        else if (_parentOrParents.indexOf(this) === -1) {
            _parentOrParents.push(this);
        }
        else {
            return subscription;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions === null) {
            this._subscriptions = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return subscription;
    };
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var rxSubscriber = /*@__PURE__*/ (function () {
    return typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
})();

/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
var Subscriber = /*@__PURE__*/ (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
            case 0:
                _this.destination = empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    _this.destination = empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        _this.destination = destinationOrNext;
                        destinationOrNext.add(_this);
                    }
                    else {
                        _this.syncErrorThrowable = true;
                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
                    }
                    break;
                }
            default:
                _this.syncErrorThrowable = true;
                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                break;
        }
        return _this;
    }
    Subscriber.prototype[rxSubscriber] = function () { return this; };
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(Subscription));
var SafeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if (isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) {
                    _this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
            if (this._error) {
                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                hostReportError(err);
            }
            else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                }
                else {
                    hostReportError(err);
                }
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        if (!config.useDeprecatedSynchronousErrorHandling) {
            throw new Error('bad call');
        }
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            else {
                hostReportError(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) {
            return false;
        }
        else if (destination && destination instanceof Subscriber) {
            observer = destination;
        }
        else {
            observer = null;
        }
    }
    return true;
}

/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber]) {
            return nextOrObserver[rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber(empty);
    }
    return new Subscriber(nextOrObserver, error, complete);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function noop() { }

/** PURE_IMPORTS_START _noop PURE_IMPORTS_END */
function pipeFromArray(fns) {
    if (!fns) {
        return noop;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
var Observable = /*@__PURE__*/ (function () {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber(observerOrNext, error, complete);
        if (operator) {
            sink.add(operator.call(sink, this.source));
        }
        else {
            sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                this._subscribe(sink) :
                this._trySubscribe(sink));
        }
        if (config.useDeprecatedSynchronousErrorHandling) {
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if (canReportError(sink)) {
                sink.error(err);
            }
            else {
                console.warn(err);
            }
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) {
        promiseCtor =  Promise;
    }
    if (!promiseCtor) {
        throw new Error('no Promise impl found');
    }
    return promiseCtor;
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ObjectUnsubscribedErrorImpl;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
var SubjectSubscription = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, subscriber) {
        var _this = _super.call(this) || this;
        _this.subject = subject;
        _this.subscriber = subscriber;
        _this.closed = false;
        return _this;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.subscriber);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(Subscriber));
var Subject = /*@__PURE__*/ (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.observers = [];
        _this.closed = false;
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype[rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = /*@__PURE__*/ (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));

var PeerjsConnection = /** @class */ (function () {
    function PeerjsConnection(connection) {
        var _this = this;
        this.connection = connection;
        this.messages = new Subject();
        this.connection.on('data', function (message) {
            _this.receiveMessage(message);
        });
    }
    PeerjsConnection.prototype.send = function (message) {
        this.connection.send(message);
    };
    PeerjsConnection.prototype.getPeer = function () {
        return this.connection.peer;
    };
    PeerjsConnection.prototype.receiveMessage = function (message) {
        this.messages.next(message);
    };
    PeerjsConnection.prototype.open = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.connection.on('open', resolve);
        });
    };
    return PeerjsConnection;
}());

var PeerjsNetwork = /** @class */ (function () {
    function PeerjsNetwork() {
        this.onOpen = function () { return 0; };
    }
    PeerjsNetwork.prototype.init = function (onOpen, onConnection, onDisconnection) {
        this.onOpen = onOpen;
        this.peer = new Peer({
            config: { 'iceServers': [
                    //{ url: 'stun:stun.l.google.com:19302' },
                    {
                        'urls': 'turn:numb.viagenie.ca',
                        'credential': "a/j'/9CmxTCa",
                        'username': 'saffo.d@husky.neu.edu'
                    }
                ] }
        });
        if (this.peer.id) {
            this.onOpen(); // In case it was done too fast.
        }
        else {
            this.peer.on('open', this.onOpen);
        }
        this.peer.on('connection', function (connection) {
            console.log("connection!");
            onConnection(new PeerjsConnection(connection));
        });
        this.peer.on('disconnected', function () {
            onDisconnection();
        });
        window.addEventListener("beforeunload", function () { return onDisconnection(); });
    };
    PeerjsNetwork.prototype.getId = function () {
        return this.peer.id;
    };
    PeerjsNetwork.prototype.connect = function (peerId) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var conn, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conn = this.peer.connect(peerId);
                        connection = new PeerjsConnection(conn);
                        return [4 /*yield*/, connection.open()];
                    case 1:
                        _a.sent();
                        resolve(connection);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return PeerjsNetwork;
}());

// This file should know all the message types and create the messages
var DescCommunication = /** @class */ (function () {
    function DescCommunication(leaderId, onEventReceived, onNewLockOwner, getPastEvents, onLockRequested, receiveLockVote, onOpenCallback) {
        this.leaderId = leaderId;
        this.onEventReceived = onEventReceived;
        this.onNewLockOwner = onNewLockOwner;
        this.getPastEvents = getPastEvents;
        this.onLockRequested = onLockRequested;
        this.receiveLockVote = receiveLockVote;
        this.onOpenCallback = onOpenCallback;
        this.connections = [];
        this.peers = [];
        this.onConnectionCallback = function () { };
        this.id = '';
        this.peer = new PeerjsNetwork();
        this.peer.init(this.onOpen.bind(this), this.onConnection.bind(this), this.onDisconnection.bind(this));
    }
    /**
     * Requests all clients to vote to agree that this client gets the lock on the element.
     */
    DescCommunication.prototype.requestLock = function (targetSelector) {
        if (!this.connections.length) {
            return false;
        }
        var msg = {
            type: DESC_MESSAGE_TYPE.LOCK_REQUESTED,
            electionId: String(Math.random()).substr(2),
            targetSelector: targetSelector,
            requester: this.id,
            sender: this.id,
        };
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            //console.log('Requesting lock', msg);
            conn.send(msg);
        }
        this.receiveMessage(msg); // Request vote from oneself.
        return true;
    };
    /**
     * Sends a vote to the leader indicating whether the client agrees to give a requesting client a lock.
     */
    DescCommunication.prototype.sendLockVote = function (targetSelector, electionId, requester, agree) {
        var msg = {
            type: DESC_MESSAGE_TYPE.LOCK_VOTE,
            electionId: electionId,
            sender: this.id,
            targetSelector: targetSelector,
            requester: requester,
            agree: agree
        };
        //console.log('Sending lock vote', msg);
        if (!this.leaderConnection) {
            return console.error('Can not send lock vote because no leader connection exists.');
        }
        this.leaderConnection.send(msg);
        if (this.leaderId === this.id) {
            this.receiveLockVote(targetSelector, electionId, requester, this.id, agree);
        }
    };
    /**
     * This message is sent by the leader to inform clients that an element's lock owner has changed.
     */
    DescCommunication.prototype.changeLockOwner = function (targetSelector, owner) {
        var msg = {
            type: DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED,
            targetSelector: targetSelector,
            owner: owner,
            sender: this.id,
        };
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            conn.send(msg);
        }
        this.receiveMessage(msg); // Tell itself that the lock owner has changed.
    };
    DescCommunication.prototype.getId = function () {
        return this.peer.getId();
    };
    DescCommunication.prototype.onOpen = function () {
        this.id = this.getId();
        if (!this.leaderId) {
            this.leaderId = this.id;
        }
        //console.log("originID", this.leaderId);
        //console.log("myID", this.id);
        this.connectToPeer(this.id);
        if (this.leaderId && this.leaderId !== this.id) {
            this.connectToPeer(this.leaderId);
        }
        this.onOpenCallback();
        this.onConnectionCallback();
    };
    DescCommunication.prototype.getNumberOfConnections = function () {
        return this.connections.length;
    };
    DescCommunication.prototype.onConnection = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var peer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = connection.getPeer();
                        this.peers.push(peer);
                        this.connections.push(connection);
                        //console.log("New incoming connection", this.peers, this.connections.length);
                        this.onConnectionCallback();
                        if (peer === this.leaderId) {
                            // This is in case this client is the leader.
                            this.leaderConnection = connection;
                        }
                        return [4 /*yield*/, connection.open()];
                    case 1:
                        _a.sent();
                        connection.messages.subscribe(this.receiveMessage.bind(this));
                        if (this.leaderId === this.id) {
                            this.sendNewConnection(connection);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DescCommunication.prototype.onDisconnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.sendDisconnectMessage();
                return [2 /*return*/];
            });
        });
    };
    DescCommunication.prototype.connectToPeer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, peer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peer.connect(id)];
                    case 1:
                        connection = _a.sent();
                        this.connections.push(connection);
                        this.peers.push(id);
                        //console.log("New outgoing connection", this.peers, this.connections.length);
                        this.onConnectionCallback();
                        peer = connection.getPeer();
                        if (peer === this.leaderId) {
                            this.leaderConnection = connection;
                        }
                        connection.messages.subscribe(this.receiveMessage.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    DescCommunication.prototype.receiveMessage = function (data) {
        if (data.type === DESC_MESSAGE_TYPE.NEW_CONNECTION) {
            this.receiveNewConnection(data);
        }
        else if (data.type === DESC_MESSAGE_TYPE.EVENT) {
            var msg = data;
            this.onEventReceived(msg.data, msg.sender);
        }
        else if (data.type === DESC_MESSAGE_TYPE.LOCK_REQUESTED) {
            var msg = data;
            this.onLockRequested(msg.targetSelector, msg.electionId, msg.requester);
        }
        else if (data.type === DESC_MESSAGE_TYPE.LOCK_VOTE) {
            var msg = data;
            this.receiveLockVote(msg.targetSelector, msg.electionId, msg.requester, msg.sender, msg.agree);
            //receiveLockVote(selector: string, electionId: string, requester: string, voter: string, vote: boolean)
        }
        else if (data.type === DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED) {
            var msg = data;
            this.onNewLockOwner(msg.targetSelector, msg.owner);
        }
        else if (data.type === DESC_MESSAGE_TYPE.DISCONNECTION) {
            var msg = data;
            this.recieveDisconnectMessage(msg);
        }
    };
    DescCommunication.prototype.broadcastEvent = function (e) {
        var msg = {
            'type': DESC_MESSAGE_TYPE.EVENT,
            'sender': this.id,
            data: e,
        };
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            conn.send(msg);
        }
        //this.receiveMessage(msg);
    };
    DescCommunication.prototype.sendNewConnection = function (conn) {
        //console.log("Sending new connection message");
        var decoratedMessage = {
            'type': DESC_MESSAGE_TYPE.NEW_CONNECTION,
            'sender': this.id,
            'peers': this.peers,
            'eventsLedger': this.getPastEvents(),
        };
        conn.send(decoratedMessage);
    };
    DescCommunication.prototype.receiveNewConnection = function (data) {
        //console.log("New connection message", data);
        for (var i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
        for (var i = 0; i < data.eventsLedger.length; i++) {
            this.onEventReceived(data.eventsLedger[i].event, data.sender, true);
        }
    };
    DescCommunication.prototype.sendDisconnectMessage = function () {
        var decoratedMessage = {
            'type': DESC_MESSAGE_TYPE.DISCONNECTION,
            'sender': this.id
        };
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            conn.send(decoratedMessage);
        }
    };
    DescCommunication.prototype.recieveDisconnectMessage = function (msg) {
        console.log("Peer", msg.sender, "is disconnecting");
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            //console.log('Requesting lock', msg);
            if (conn.getPeer() === msg.sender) {
                console.log("Removing peer and connection");
                this.peers.splice(this.peers.indexOf(msg.sender), 1);
                this.connections.splice(this.connections.indexOf(conn), 1);
            }
        }
        this.onConnectionCallback();
    };
    return DescCommunication;
}());
var DESC_MESSAGE_TYPE;
(function (DESC_MESSAGE_TYPE) {
    DESC_MESSAGE_TYPE[DESC_MESSAGE_TYPE["NEW_CONNECTION"] = 0] = "NEW_CONNECTION";
    DESC_MESSAGE_TYPE[DESC_MESSAGE_TYPE["EVENT"] = 1] = "EVENT";
    DESC_MESSAGE_TYPE[DESC_MESSAGE_TYPE["LOCK_REQUESTED"] = 2] = "LOCK_REQUESTED";
    DESC_MESSAGE_TYPE[DESC_MESSAGE_TYPE["LOCK_VOTE"] = 3] = "LOCK_VOTE";
    DESC_MESSAGE_TYPE[DESC_MESSAGE_TYPE["LOCK_OWNER_CHANGED"] = 4] = "LOCK_OWNER_CHANGED";
    DESC_MESSAGE_TYPE[DESC_MESSAGE_TYPE["DISCONNECTION"] = 5] = "DISCONNECTION";
})(DESC_MESSAGE_TYPE || (DESC_MESSAGE_TYPE = {}));

var DescProtocol = /** @class */ (function () {
    function DescProtocol(leaderId, executeEvent, cancelEvent, mockCommunication) {
        this.leaderId = leaderId;
        this.executeEvent = executeEvent;
        this.cancelEvent = cancelEvent;
        this.ledgers = new Map();
        this.lockOwners = new Map();
        this.requestedLocks = new Set();
        this.heldEvents = new Map();
        this.participantId = '';
        if (mockCommunication) {
            this.communication = mockCommunication;
        }
        else {
            this.communication = new DescCommunication(leaderId, this.receiveRemoteEvent.bind(this), this.lockOwnerChanged.bind(this), this.getPastEvents.bind(this), this.receiveLockRequest.bind(this), this.receiveLockVote.bind(this), this.init.bind(this));
        }
    }
    DescProtocol.prototype.init = function () {
        this.participantId = this.communication.getId();
    };
    DescProtocol.prototype.getPastEvents = function () {
        var events = Array.from(this.ledgers.values()).reduce(function (a, b) { return a.concat(b); }, []);
        return events.sort(function (a, b) { return a.event.timeStamp - b.event.timeStamp; });
    };
    DescProtocol.prototype.localEvent = function (stripped) {
        var selector = stripped.target;
        stripped.participantId = this.participantId;
        //console.log('local event on ', selector, this.lockOwners.get(selector), this.participantId);
        var lockOwner = this.lockOwners.get(selector);
        if (lockOwner && lockOwner === this.participantId) {
            var descEvent = this.addEventToLedger(stripped, this.participantId);
            if (descEvent) {
                this.communication.broadcastEvent(stripped);
            }
        }
        else if (lockOwner && lockOwner !== this.participantId) {
            // Do nothing - do not execute the event.
            this.cancelEvent(stripped);
        }
        else {
            if (!this.heldEvents.has(selector)) {
                this.heldEvents.set(selector, []);
            }
            this.heldEvents.get(selector).push(stripped);
            //console.log('held', this.heldEvents.get(selector));
            this.requestLock(selector);
        }
    };
    DescProtocol.prototype.receiveRemoteEvent = function (stripped, sender, catchup) {
        if (catchup === void 0) { catchup = false; }
        this.addEventToLedger(stripped, sender, catchup);
    };
    DescProtocol.prototype.receiveLockRequest = function (selector, electionId, requester) {
        var vote = false;
        if (!this.lockOwners.has(selector) || this.lockOwners.get(selector) === requester) {
            // Vote yes
            vote = true;
        }
        this.communication.sendLockVote(selector, electionId, requester, vote);
    };
    DescProtocol.prototype.lockOwnerChanged = function (selector, owner) {
        //console.log('Lock owner changed', selector, owner, this.participantId, this.heldEvents.has(selector), this.heldEvents.get(selector));
        this.requestedLocks.delete(selector);
        if (!owner) {
            this.lockOwners.delete(selector);
            return;
        }
        this.lockOwners.set(selector, owner);
        if (owner === this.participantId && this.heldEvents.has(selector)) {
            // Finally, trigger these held up events.
            var events = this.heldEvents.get(selector);
            //console.log('Triggering some held up events', events);
            for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                var stripped = events_1[_i];
                var descEvent = this.addEventToLedger(stripped, this.participantId);
                if (descEvent) {
                    this.communication.broadcastEvent(stripped);
                }
            }
        }
        this.heldEvents.delete(selector);
    };
    DescProtocol.prototype.receiveLockVote = function (selector, electionId, requester, voter, vote) {
        console.error('Clients are not supposed to receive lock votes.');
    };
    DescProtocol.prototype.requestLock = function (selector) {
        if (this.requestedLocks.has(selector)) {
            return;
        }
        //console.log('Requesting lock on ', selector);
        var success = this.communication.requestLock(selector);
        if (success) {
            this.requestedLocks.add(selector);
        }
    };
    DescProtocol.prototype.addEventToLedger = function (stripped, sender, catchup) {
        if (catchup === void 0) { catchup = false; }
        var selector = stripped.target;
        if (!catchup) {
            var lockOwner = this.lockOwners.get(selector);
            if (!lockOwner || lockOwner !== sender) {
                console.error('Trying to execute event on element with different lock owner', selector, lockOwner, sender);
                return false;
            }
        }
        this.executeEvent(stripped);
        if (!this.ledgers.has(selector)) {
            this.ledgers.set(selector, []);
        }
        var ledger = this.ledgers.get(selector);
        var seqNum = 0;
        if (ledger.length) {
            var lastEvent = ledger[ledger.length - 1];
            seqNum = lastEvent.seqNum + 1;
        }
        var newEvent = {
            seqNum: seqNum,
            'event': stripped,
            'sender': this.participantId
        };
        ledger.push(newEvent);
        return true;
    };
    return DescProtocol;
}());

var VOTE_DECISION_THRESHHOLD = 0.5001;
var DescLeaderProtocol = /** @class */ (function (_super) {
    __extends(DescLeaderProtocol, _super);
    function DescLeaderProtocol() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lockVotes = new Map();
        _this.lockTimeouts = new Map();
        return _this;
    }
    DescLeaderProtocol.prototype.receiveLockVote = function (selector, electionId, requester, voter, vote) {
        if (!this.lockVotes.has(electionId)) {
            this.lockVotes.set(electionId, []);
        }
        var votes = this.lockVotes.get(electionId);
        if (votes.filter(function (v) { return v.voter === voter; }).length > 0) {
            console.log('Not counting a lock vote because the voter has already voted on this element.');
            return;
        }
        votes.push({ selector: selector, requester: requester, voter: voter, vote: vote });
        var minVotes = Math.ceil(VOTE_DECISION_THRESHHOLD * this.communication.getNumberOfConnections());
        var countYes = votes.filter(function (v) { return v.vote; }).length;
        var countNo = votes.filter(function (v) { return !v.vote; }).length;
        //console.log('Election:', electionId, minVotes, countYes, countNo);
        if (countYes < minVotes && countNo < minVotes) {
            return;
        }
        if (countYes >= minVotes) {
            // Decide yes
            this.lockOwners.set(selector, requester);
            this.communication.changeLockOwner(selector, requester);
            //console.log('Changing lock owner', selector, requester);
            this.extendLock(selector);
        }
        else if (countNo >= minVotes) {
            // Decide no - inform everyone that the previous lock owner is still the owner.
            var oldOwner = this.lockOwners.get(selector) || '';
            this.communication.changeLockOwner(selector, oldOwner);
        }
        this.lockVotes.delete(selector);
    };
    DescLeaderProtocol.prototype.extendLock = function (selector) {
        // Delete any previous timeouts
        var prevTimeout = this.lockTimeouts.get(selector);
        if (prevTimeout) {
            clearTimeout(prevTimeout);
        }
        var timeout = window.setTimeout(this.expireLock(selector), 1000);
        this.lockTimeouts.set(selector, timeout);
    };
    DescLeaderProtocol.prototype.expireLock = function (selector) {
        var _this = this;
        return function () {
            _this.lockOwners.delete(selector);
            _this.communication.changeLockOwner(selector, '');
            //console.log('Expiring lock owner', selector);
        };
    };
    DescLeaderProtocol.prototype.addEventToLedger = function (stripped, sender) {
        var success = _super.prototype.addEventToLedger.call(this, stripped, sender);
        if (success) {
            this.extendLock(stripped.target);
        }
        return success;
    };
    return DescLeaderProtocol;
}(DescProtocol));

var DescVis = /** @class */ (function () {
    function DescVis(svg) {
        this.svg = svg;
        this.onEventCancelled = function () { };
        var parts = window.location.href.match(/\?visconnectid=([a-z0-9]+)/);
        var leaderId = parts ? parts[1] : '';
        var isLeader = !leaderId;
        var Protocol = isLeader ? DescLeaderProtocol : DescProtocol;
        this.protocol = new Protocol(leaderId, this.executeEvent.bind(this), this.cancelEvent.bind(this));
        this.listener = new DescListener(this.svg, this.localEvent.bind(this));
    }
    DescVis.prototype.localEvent = function (stripped, event) {
        stopPropagation(event);
        this.protocol.localEvent(stripped);
    };
    DescVis.prototype.cancelEvent = function (event) {
        this.onEventCancelled(event);
    };
    DescVis.prototype.executeEvent = function (stripped) {
        var event = recreateEvent(stripped, this.svg);
        //console.log('executing event', stripped, event);
        event['desc-received'] = true;
        event['participantId'] = stripped.participantId;
        if (event.target) {
            event.target.dispatchEvent(event);
        }
    };
    return DescVis;
}());

var descUi;
console.log('init vislink');
disableStopPropagation();
delayAddEventListener().then(function () {
    var el;
    var elsWithAttribute = document.querySelectorAll('[collaboration]');
    var svg = document.getElementsByTagName('svg')[0];
    if (elsWithAttribute.length) {
        el = elsWithAttribute[0];
    }
    else if (svg) {
        el = svg;
    }
    else {
        el = document.body;
    }
    console.log('start descvis');
    var descvis = new DescVis(el);
    descUi = new DescUi(descvis, el);
    descvis.onEventCancelled = descUi.eventCancelled.bind(descUi);
});
