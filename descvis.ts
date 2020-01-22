import {DESC_MESSAGE_TYPE, DescCommunication, DescMessage, InitMessage, NewLeaseeMessage} from './communication';
import {DescListener, StrippedEvent} from "./listener";
import {delayAddEventListener, disableStopPropagation, recreateEvent, stopPropagation} from "./dom";
import {DescProtocol} from "./protocol";

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
    private communication: DescCommunication;
    private eventsQueue: DescEvent[] = [];
    private sequenceNumber: number = 0;
    private isHost = false;
    private eventsLedger: DescEvent[] = [];
    private leasees = new Map<HTMLElement, string>();
    private listener: DescListener;
    private protocol: DescProtocol;

    private leaseeTimeouts = new Map<HTMLElement, number>();

    constructor(private svg: SVGElement) {
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        const originID = parts ? parts[1] : '';
        this.isHost = !originID;

        this.communication = new DescCommunication(originID, this.receiveEvent.bind(this), this.onNewLeasee.bind(this),
            () => this.eventsLedger, this.init.bind(this));
    }

    init() {
        console.log(window.location + '?id=' + this.communication.getId());

        this.protocol = new DescProtocol(this.isHost, this.communication, this.communication.getId(),
            this.executeEvent.bind(this), stopPropagation);
        this.listener = new DescListener(this.svg, this.protocol.localEvent.bind(this));
    }

    executeEvent() {

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

    unlease(element: HTMLElement) {
        this.leasees.delete(element);
        const selector = this.listener.getElementSelector(element);
        if(!selector) {
            return new Error('selector not found');
        }
        this.communication.setLeasee(selector, '');
    }

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
    }

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
    }
}
