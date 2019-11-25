"use strict";
class DescVis {
    constructor(svg) {
        this.svg = svg;
        this.network = new DescNetwork(this.receiveEvent.bind(this), this.onNewConnection.bind(this), this.onNewLeasee.bind(this));
        this.eventsQueue = [];
        this.sequenceNumber = 0;
        this.eventsLedger = [];
        this.leasees = new Map();
        const listener = new DescListener(this.svg, this.hearEvent.bind(this));
    }
    hearEvent(eventObj, event) {
        if (!event.target) {
            return new Error('event has no target');
        }
        if (!this.network.id) {
            console.log('network not ready');
            event['stopImmediatePropagationBackup']();
            return;
        }
        const target = event.target;
        const peerId = this.network.id;
        if (!this.leasees.has(target)) {
            console.log('setting the leader of ', target, ' to ', peerId);
            this.leasees.set(target, peerId);
            this.network.setLeasee(eventObj.target, peerId);
        }
        console.log('checking ', this.leasees.get(target), peerId, this.leasees.get(target) === peerId);
        if (this.leasees.get(target) === peerId) {
            const newEvent = {
                'seqNum': this.sequenceNumber,
                'event': eventObj,
                'sender': this.network.id
            };
            this.sequenceNumber++;
            this.eventsLedger.push(newEvent);
            //this.network.eventsLedger = this.eventsLedger;
            console.log(this.sequenceNumber);
            this.network.broadcastEvent(newEvent);
        }
        else {
            // prevent event
            console.log('Can not edit this element because I am not the leader.', target);
            event['stopImmediatePropagationBackup']();
            event.stopPropagation();
        }
    }
    onNewLeasee(msg) {
        // We are vulnerable to malicious actors here!
        // First, find the html element.
        const selector = msg.targetSelector;
        const target = document.querySelector(selector);
        if (!target) {
            return new Error(`could not find target element of leasee ${selector}`);
        }
        this.leasees.set(target, msg.leasee);
    }
    onNewConnection(originalMsg) {
        return {
            'type': 'new_connection',
            'sender': originalMsg.sender,
            'peers': originalMsg.peers,
            'eventsLedger': this.eventsLedger,
        };
    }
    receiveEvent(remoteEvent) {
        let eventObject = remoteEvent.event;
        if (remoteEvent.seqNum >= this.sequenceNumber) {
            this.sequenceNumber = remoteEvent.seqNum + 1;
        }
        this.eventsLedger.push(remoteEvent);
        //this.network.eventsLedger = this.eventsLedger;
        console.log(this.sequenceNumber);
        const targetSelector = eventObject.target;
        let target = this.svg;
        let e;
        if (eventObject.type.substr(0, 5) === 'touch') {
            e = new TouchEvent(eventObject.type, eventObject);
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
            let newTarget = document.querySelector(targetSelector);
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
    }
}
