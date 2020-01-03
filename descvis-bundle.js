'use strict';

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

var PeerjsConnection = /** @class */ (function () {
    function PeerjsConnection(connection) {
        this.connection = connection;
    }
    PeerjsConnection.prototype.send = function (message) {
        this.connection.send(message);
    };
    PeerjsConnection.prototype.getPeer = function () {
        return this.connection.peer;
    };
    PeerjsConnection.prototype.receiveMessage = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.connection.on('data', function (message) {
                resolve(message);
            });
        });
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
        this.onConnection = function () { };
    }
    PeerjsNetwork.prototype.init = function (onOpen, onConnection) {
        var _this = this;
        this.onOpen = onOpen;
        this.onConnection = onConnection;
        this.peer = new Peer();
        if (this.peer.id) {
            this.onOpen(); // In case it was done too fast.
        }
        else {
            this.peer.on('open', this.onOpen);
        }
        this.peer.on('connection', function (connection) {
            _this.onConnection(new PeerjsConnection(connection));
        });
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

var DescCommunication = /** @class */ (function () {
    function DescCommunication(originID, onEventReceived, onNewConnection, onNewLeasee) {
        this.originID = originID;
        this.onEventReceived = onEventReceived;
        this.onNewConnection = onNewConnection;
        this.onNewLeasee = onNewLeasee;
        this.connections = [];
        this.peers = [];
        this.eventsQueue = [];
        this.id = '';
        this.peer = new PeerjsNetwork();
        this.peer.init(this.onOpen.bind(this), this.onConnection.bind(this));
    }
    DescCommunication.prototype.setLeasee = function (targetSelector, leasee) {
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            var msg = {
                type: "NewLeasee",
                targetSelector: targetSelector,
                leasee: leasee,
                sender: this.id,
            };
            conn.send(msg);
        }
    };
    DescCommunication.prototype.onOpen = function () {
        this.id = this.peer.getId();
        console.log("originID", this.originID);
        console.log("myID", this.id);
        this.connectToPeer(this.id);
        if (!this.originID) {
            console.log(window.location + '?id=' + this.id);
        }
        else {
            console.log(window.location.href);
            this.connectToPeer(this.originID);
        }
    };
    DescCommunication.prototype.onConnection = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.peers.push(connection.getPeer());
                        this.connections.push(connection);
                        console.log("new connection", this.peers, this.connections.length);
                        return [4 /*yield*/, connection.open()];
                    case 1:
                        _a.sent();
                        this.receiveMessage(connection);
                        if (!this.originID) {
                            this.sendNewConnection(connection);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DescCommunication.prototype.connectToPeer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peer.connect(id)];
                    case 1:
                        conn = _a.sent();
                        this.connections.push(conn);
                        this.peers.push(id);
                        console.log("new connection", this.peers, this.connections.length);
                        this.receiveMessage(conn);
                        return [2 /*return*/];
                }
            });
        });
    };
    DescCommunication.prototype.receiveMessage = function (conn) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conn.receiveMessage()];
                    case 1:
                        data = _a.sent();
                        if (data.type === "new_connection") {
                            this.recieveNewConnection(data);
                        }
                        else if (data.type === 'DescEvent') {
                            this.onEventReceived(data.data);
                        }
                        else if (data.type === 'NewLeasee') {
                            this.onNewLeasee(data);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DescCommunication.prototype.broadcastEvent = function (e) {
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            var msg = {
                'type': 'DescEvent',
                'sender': this.id,
                data: e,
            };
            conn.send(msg);
        }
    };
    DescCommunication.prototype.sendNewConnection = function (conn) {
        console.log("sending new connection message");
        var newConnectionMessage = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
        };
        var decoratedMessage = this.onNewConnection(newConnectionMessage);
        conn.send(decoratedMessage);
    };
    DescCommunication.prototype.recieveNewConnection = function (data) {
        console.log("new connection message", data);
        for (var i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
        for (var i = 0; i < data.eventsLedger.length; i++) {
            this.onEventReceived(data.eventsLedger[i]);
        }
    };
    return DescCommunication;
}());

var DescListener = /** @class */ (function () {
    function DescListener(svg, hearEvent) {
        this.svg = svg;
        this.hearEvent = hearEvent;
        this.dragElement = null;
        console.log("step 1");
        this.addListenersToElementAndChildren(this.svg);
        // Prevent d3 from blocking DescVis and other code to have access to events.
        Event.prototype['stopImmediatePropagationBackup'] = Event.prototype.stopImmediatePropagation;
        Event.prototype.stopImmediatePropagation = function () { };
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
        element.addEventListener('click', boundCapture);
        element.addEventListener('touchstart', boundCapture);
        element.addEventListener('touchend', boundCapture);
        element.addEventListener('selectstart', boundCapture);
        element.addEventListener('dragstart', boundCapture);
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
                console.log('changing event target');
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
        var obj = { type: '', target: '', touches: [] };
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
        if (element === this.svg) {
            return 'svg';
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

// The visualization's event listeners need to be called after DESCVis' event listeners.
// For this reason, we delay calling event listeners that are added before DESCVis is started.
Element.prototype['addEventListenerBackup'] = Element.prototype.addEventListener;
Element.prototype.addEventListener = function (eventName, callback) {
    console.log('doing a delayed execution on ', eventName);
    var that = this;
    setTimeout(function () {
        Element.prototype['addEventListenerBackup'].call(that, eventName, callback);
    }, 100);
};
console.log('descvis');
// After the visualization code is run, reset the addEventListener function to its normal functionality, and start
// DESCVis.
window.setTimeout(function () {
    console.log('hi');
    Element.prototype.addEventListener = Element.prototype['addEventListenerBackup'];
    new DescVis(document.getElementsByTagName('svg')[0]);
}, 20);
var DescVis = /** @class */ (function () {
    function DescVis(svg) {
        this.svg = svg;
        this.eventsQueue = [];
        this.sequenceNumber = 0;
        this.eventsLedger = [];
        this.leasees = new Map();
        this.leaseeTimeouts = new Map();
        var parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        var originID = parts ? parts[1] : '';
        this.network = new DescCommunication(originID, this.receiveEvent.bind(this), this.onNewConnection.bind(this), this.onNewLeasee.bind(this));
        this.listener = new DescListener(this.svg, this.hearEvent.bind(this));
    }
    DescVis.prototype.hearEvent = function (eventObj, event) {
        var _this = this;
        if (!event.target) {
            return new Error('event has no target');
        }
        if (!this.network.id) {
            console.log('network not ready');
            event['stopImmediatePropagationBackup']();
            return;
        }
        var target = event.target;
        var peerId = this.network.id;
        if (!this.leasees.has(target)) {
            //console.log('setting the leader of ', target, ' to ', peerId);
            this.leasees.set(target, peerId);
            this.network.setLeasee(eventObj.target, peerId);
        }
        //console.log('checking ', this.leasees.get(target), peerId, this.leasees.get(target) === peerId);
        if (this.leasees.get(target) !== peerId) {
            // Prevent event.
            console.log('Can not edit this element because I am not the leader.', target);
            event['stopImmediatePropagationBackup']();
            event.stopPropagation();
            return;
        }
        var prevTimeout = this.leaseeTimeouts.get(target);
        clearTimeout(prevTimeout);
        var newTimeout = window.setTimeout(function () { return _this.unlease(target); }, 1000);
        this.leaseeTimeouts.set(target, newTimeout);
        var newEvent = {
            'seqNum': this.sequenceNumber,
            'event': eventObj,
            'sender': this.network.id
        };
        this.sequenceNumber++;
        this.eventsLedger.push(newEvent);
        //console.log(this.sequenceNumber);
        this.network.broadcastEvent(newEvent);
    };
    DescVis.prototype.unlease = function (element) {
        console.log('releasing ', element);
        this.leasees.delete(element);
        var selector = this.listener.getElementSelector(element);
        if (!selector) {
            return new Error('selector not found');
        }
        this.network.setLeasee(selector, '');
    };
    DescVis.prototype.onNewLeasee = function (msg) {
        // We are vulnerable to malicious actors here!
        // First, find the html element.
        var selector = msg.targetSelector;
        var target = document.querySelector(selector);
        if (!target) {
            return new Error("could not find target element of leasee " + selector);
        }
        if (msg.leasee === '') {
            this.leasees.delete(target);
        }
        else {
            this.leasees.set(target, msg.leasee);
        }
    };
    DescVis.prototype.onNewConnection = function (originalMsg) {
        return {
            'type': 'new_connection',
            'sender': originalMsg.sender,
            'peers': originalMsg.peers,
            'eventsLedger': this.eventsLedger,
        };
    };
    DescVis.prototype.receiveEvent = function (remoteEvent) {
        var eventObject = remoteEvent.event;
        if (remoteEvent.seqNum >= this.sequenceNumber) {
            this.sequenceNumber = remoteEvent.seqNum + 1;
        }
        this.eventsLedger.push(remoteEvent);
        //this.network.eventsLedger = this.eventsLedger;
        console.log(this.sequenceNumber);
        var targetSelector = eventObject.target;
        var target = this.svg;
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
        else if (eventObject.type.substr(0, 5) === 'mouse') {
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
                return;
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
        e['desc-received'] = true;
        target.dispatchEvent(e);
    };
    return DescVis;
}());
