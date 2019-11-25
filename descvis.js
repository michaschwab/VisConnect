"use strict";
class DescVis {
    constructor(svg) {
        this.svg = svg;
        this.network = new DescNetwork(this.receiveEvent.bind(this), this.onNewConnection.bind(this));
        this.eventsQueue = [];
        this.sequenceNumber = 0;
        this.eventsLedger = [];
        const listener = new DescListener(this.svg, this.hearEvent.bind(this));
    }
    hearEvent(eventObj) {
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
