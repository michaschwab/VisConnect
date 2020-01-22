import {StrippedEvent} from "./listener";
import {DescCommunication} from "./communication";

export class DescProtocol {
    private ledgers = new Map<EventTarget, DescEvent[]>();
    private lockOwners = new Map<EventTarget, string>();

    constructor(private isHost: boolean,
                private communication: DescCommunication,
                private participantId: string,
                private executeEvent: (e: Event) => void,
                private stopEvent: (e: Event) => void) {

    }

    localEvent(stripped: StrippedEvent, event: Event & {target: EventTarget}) {
        const element = event.target;

        if(this.lockOwners.has(element) && this.lockOwners.get(element) === this.participantId) {
            this.executeEvent(event);
            const descEvent = this.addEventToLedger(element, stripped);
            this.extendLock(stripped.target);
            this.communication.broadcastEvent(descEvent);
        } else if(this.lockOwners.has(element) && this.lockOwners.get(element) !== this.participantId) {
            this.stopEvent(event);
        } else {
            this.requestLock(stripped.target);
            //TODO: Block for now, execute once approval comes in.
        }
    }

    receiveRemoteEvent() {

    }

    private extendLock(selector: string) {
        //TODO
    }

    private requestLock(selector: string) {
        this.communication.requestLock(selector);
    }

    private addEventToLedger(element: EventTarget, stripped: StrippedEvent) {
        if(!this.ledgers.has(element)) {
            this.ledgers.set(element, []);
        }
        const ledger = this.ledgers.get(element)!;

        const newEvent: DescEvent = {
            'seqNum': -1,
            'event': stripped,
            'sender': this.participantId
        };

        ledger.push(newEvent);

        return newEvent;
    }
}

/*
export class DescEvent {
    allow() {

    }
    forbid() {

    }
}*/

export interface DescEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}