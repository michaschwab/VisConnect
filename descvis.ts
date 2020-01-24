import {DescListener, StrippedEvent} from "./listener";
import {delayAddEventListener, disableStopPropagation, recreateEvent, stopPropagation} from "./dom";
import {DescProtocol} from "./protocol";
import {DescLeaderProtocol} from "./leader-protocol";

export interface DescEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}

disableStopPropagation();
delayAddEventListener().then(() => {
    new DescVis(document.getElementsByTagName('svg')[0]);
});

class DescVis {
    private listener: DescListener;
    private protocol: DescProtocol;
    private leaseeTimeouts = new Map<HTMLElement, number>(); //TODO: implement this in the protocol or leader protocol.

    constructor(private svg: SVGElement) {
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        const leaderId = parts ? parts[1] : '';
        const isLeader = !leaderId;

        /*this.communication = new DescCommunication(leaderId, this.receiveEvent.bind(this), this.onNewLeasee.bind(this),
            () => this.eventsLedger, this.init.bind(this));

        console.log(window.location + '?id=' + this.communication.getId());*/

        const Protocol = isLeader ? DescLeaderProtocol : DescProtocol;

        this.protocol = new Protocol(leaderId, this.executeEvent.bind(this));
        this.listener = new DescListener(this.svg, this.localEvent.bind(this));
    }

    localEvent(stripped: StrippedEvent, event: Event) {
        stopPropagation(event);
        this.protocol.localEvent(stripped);
    }

    executeEvent(stripped: StrippedEvent) {
        const event = recreateEvent(stripped, this.svg);
        console.log('executing event', stripped, event);

        (event as any)['desc-received'] = true;
        if(event.target) {
            event.target.dispatchEvent(event);
        }
    }

    /*hearEvent(eventObj: StrippedEvent, event: Event) {
        if(!event.target) {
            return new Error('event has no target');
        }
        if(!this.communication.id) {
            console.log('network not ready');
            stopPropagation(event);
            return;
        }
        const target = event.target as HTMLElement;
        const peerId = this.communication.id;

        if(!this.leasees.has(target)) {
            this.leasees.set(target, peerId);
            this.communication.setLeasee(eventObj.target, peerId);
        }

        if(this.leasees.get(target) !== peerId) {
            // Prevent event.
            //console.log('Can not edit this element because I am not the leader.', target);
            stopPropagation(event);
            return;
        }

        const prevTimeout = this.leaseeTimeouts.get(target);
        clearTimeout(prevTimeout);
        const newTimeout = window.setTimeout(() => this.unlease(target), 1000);
        this.leaseeTimeouts.set(target, newTimeout);

        const newEvent: DescEvent = {
            'seqNum': this.sequenceNumber,
            'event': eventObj,
            'sender': this.communication.id
        };
        this.sequenceNumber++;
        this.eventsLedger.push(newEvent);
        //console.log(this.sequenceNumber);
        this.communication.broadcastEvent(newEvent);
    }*/
/*
    unlease(element: HTMLElement) {
        this.leasees.delete(element);
        const selector = this.listener.getElementSelector(element);
        if(!selector) {
            return new Error('selector not found');
        }
        this.communication.setLeasee(selector, '');
    }*/
/*
    onNewLeasee(msg: NewLeaseeMessage) {
        // We are vulnerable to malicious actors here!

        // First, find the html element.
        const selector = msg.targetSelector;
        const target = document.querySelector(selector);
        if(!target) {
            return new Error(`could not find target element of leasee ${selector}`);
        }

        if(msg.leasee === '') {
            this.leasees.delete(target as HTMLElement);
        } else {
            this.leasees.set(target as HTMLElement, msg.leasee);
        }
    }*/
/*
    receiveEvent(remoteEvent: DescEvent) {
        let eventObject: StrippedEvent = remoteEvent.event;

        if (remoteEvent.seqNum >= this.sequenceNumber){
            this.sequenceNumber = remoteEvent.seqNum + 1;
        }

        this.eventsLedger.push(remoteEvent);
        //this.network.eventsLedger = this.eventsLedger;
        console.log(this.sequenceNumber);

        const e = recreateEvent(eventObject, this.svg);

        (e as any)['desc-received'] = true;
        if(e.target) {
            e.target.dispatchEvent(e);
        }
    }*/
}
