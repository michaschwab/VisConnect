import {StrippedEvent} from "./listener";
import {DescNetwork} from "./peerjs-network";

export class DescProtocol {
    private ledgers = new Map<EventTarget, DescEvent[]>();
    private lockOwners = new Map<EventTarget, string>();

    constructor(private isHost: boolean,
                private network: DescNetwork,
                private participantId: string,
                private executeEvent: (e: Event) => void,
                private stopEvent: (e: Event) => void) {

    }


    localEvent(stripped: StrippedEvent, event: Event & {target: EventTarget}) {
        const element = event.target;

        if(this.lockOwners.has(element) && this.lockOwners.get(element) === this.participantId) {
            this.executeEvent(event);
            this.addEventToLedger(element, stripped);
            this.extendLock(element);
        } else if(this.lockOwners.has(element) && this.lockOwners.get(element) !== this.participantId) {
            this.stopEvent(event);
        } else {
            //TODO: Request lock
        }
    }


    receiveRemoteEvent() {

    }

    private extendLock(element: EventTarget) {
        //TODO
    }

    private requestLock() {
        //TODO
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