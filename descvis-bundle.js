'use strict';

var DescNetwork = /** @class */ (function () {
    function DescNetwork(onEventReceived, onNewConnection, onNewLeasee) {
        this.onEventReceived = onEventReceived;
        this.onNewConnection = onNewConnection;
        this.onNewLeasee = onNewLeasee;
        this.originID = '';
        this.connections = [];
        this.peers = [];
        this.eventsQueue = [];
        this.id = '';
        var parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        this.originID = parts ? parts[1] : '';
        this.peer = new Peer();
        if (this.peer.id) {
            this.onOpen(); // In case it was done too fast.
        }
        else {
            this.peer.on('open', this.onOpen.bind(this));
        }
    }
    DescNetwork.prototype.setLeasee = function (targetSelector, leasee) {
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
    DescNetwork.prototype.onOpen = function () {
        this.id = this.peer.id;
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
        this.peer.on('connection', this.onConnection.bind(this));
    };
    DescNetwork.prototype.onConnection = function (connection) {
        var _this = this;
        this.peers.push(connection.peer);
        this.connections.push(connection);
        console.log("new connection", this.peers, this.connections.length);
        connection.on('open', function () {
            _this.recieveMessage(connection);
            if (!_this.originID) {
                _this.sendNewConnection(connection);
            }
        });
    };
    DescNetwork.prototype.connectToPeer = function (id) {
        var _this = this;
        var conn = this.peer.connect(id);
        conn.on('open', function () {
            _this.connections.push(conn);
            _this.peers.push(id);
            console.log("new connection", _this.peers, _this.connections.length);
            _this.recieveMessage(conn);
        });
        return conn;
    };
    DescNetwork.prototype.recieveMessage = function (conn) {
        var _this = this;
        conn.on('data', function (data) {
            if (data.type === "new_connection") {
                _this.recieveNewConnection(data);
            }
            else if (data.type === 'DescEvent') {
                _this.onEventReceived(data.data);
            }
            else if (data.type === 'NewLeasee') {
                _this.onNewLeasee(data);
            }
        });
    };
    DescNetwork.prototype.broadcastEvent = function (e) {
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
    DescNetwork.prototype.sendNewConnection = function (conn) {
        console.log("sending new connection message");
        var newConnectionMessage = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
        };
        var decoratedMessage = this.onNewConnection(newConnectionMessage);
        conn.send(decoratedMessage);
    };
    DescNetwork.prototype.recieveNewConnection = function (data) {
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
    return DescNetwork;
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
        this.network = new DescNetwork(this.receiveEvent.bind(this), this.onNewConnection.bind(this), this.onNewLeasee.bind(this));
        this.eventsQueue = [];
        this.sequenceNumber = 0;
        this.eventsLedger = [];
        this.leasees = new Map();
        this.leaseeTimeouts = new Map();
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
        var newTimeout = setTimeout(function () { return _this.unlease(target); }, 1000);
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
