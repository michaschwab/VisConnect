import {DescListener, StrippedEvent} from "./listener";
import {recreateEvent, stopPropagation} from "./dom";
import {DescProtocol} from "./protocol";
import {DescLeaderProtocol} from "./leader-protocol";

export interface DescEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}

export class DescVis {
    private listener: DescListener;
    protocol: DescProtocol;

    constructor(private svg: SVGElement) {
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        const leaderId = parts ? parts[1] : '';
        const isLeader = !leaderId;
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
        //console.log('executing event', stripped, event);

        (event as any)['desc-received'] = true;
        if(event.target) {
            event.target.dispatchEvent(event);
        }
    }
}
