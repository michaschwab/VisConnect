import {VcListener, StrippedEvent} from "./listener";
import {recreateEvent, stopPropagation} from "./dom";
import {VcProtocol} from "./protocol";
import {VcLeaderProtocol} from "./leader-protocol";

export interface VcEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}

export class Visconnect {
    private listener: VcListener;
    protocol: VcProtocol;
    onEventCancelled: (event: StrippedEvent) => void = () => {};

    constructor(private svg: Element, ownId: string, leaderId: string, private safeMode = true,
                customEvents?: string[], ignoreEvents?: string[]) {
        const isLeader = leaderId === ownId;
        const Protocol = isLeader ? VcLeaderProtocol : VcProtocol;

        const unsafeElements = safeMode ? ['body', 'svg', 'g'] : ['*'];

        this.protocol = new Protocol(leaderId, ownId, this.executeEvent.bind(this), this.cancelEvent.bind(this),
            unsafeElements);
        this.listener = new VcListener(this.svg, this.localEvent.bind(this), customEvents, ignoreEvents);
    }

    localEvent(stripped: StrippedEvent, event: Event) {
        stopPropagation(event);
        event.preventDefault();
        this.protocol.localEvent(stripped);
    }

    cancelEvent(event: StrippedEvent) {
        this.onEventCancelled(event);
    }

    executeEvent(stripped: StrippedEvent) {
        const event = recreateEvent(stripped, this.svg);
        //console.log('executing event', stripped, event);

        (event as any)['visconnect-received'] = true;
        (event as any)['collaboratorId'] = stripped.collaboratorId;
        (event as any)['isLocalEvent'] = stripped.collaboratorId === this.protocol.communication.getId();
        if(event.target) {
            event.target.dispatchEvent(event);

            if(event.type === 'click') {
                (event.target as HTMLElement).focus();
            }
        }
    }
}
