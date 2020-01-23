import {StrippedEvent} from "./listener";
import {DescCommunication} from "./communication";

export class DescProtocol {
    protected ledgers = new Map<string, DescEvent[]>();
    protected lockOwners = new Map<string, string>();
    protected requestedLocks = new Set<string>();
    protected heldEvents = new Map<string, StrippedEvent[]>();

    constructor(protected isHost: boolean,
                protected communication: DescCommunication,
                protected participantId: string,
                protected executeEvent: (e: StrippedEvent) => void) {

    }

    localEvent(stripped: StrippedEvent) {
        const selector = stripped.target;

        if(this.lockOwners.has(selector) && this.lockOwners.get(selector) === this.participantId) {
            this.executeEvent(stripped);
            const descEvent = this.addEventToLedger(selector, stripped);
            this.extendLock(stripped.target);
            this.communication.broadcastEvent(descEvent);
        } else if(this.lockOwners.has(selector) && this.lockOwners.get(selector) !== this.participantId) {
            // Do nothing - do not execute the event.
        } else {
            this.requestLock(selector);

            if(!this.heldEvents.has(selector)) {
                this.heldEvents.set(selector, []);
            }
            this.heldEvents.get(selector)!.push(stripped);
        }
    }

    receiveRemoteEvent() {

    }

    receiveLockRequest(selector: string, requester: string) {
        let vote = false;
        if(!this.lockOwners.has(selector) || this.lockOwners.get(selector) === requester) {
            // Vote yes
            vote = true;
        }
        this.communication.sendLockVote(selector, requester, vote);
    }

    protected extendLock(selector: string) {
        //TODO
    }

    protected requestLock(selector: string) {
        if(this.requestedLocks.has(selector)) {
            return;
        }
        this.requestedLocks.add(selector);
        this.communication.requestLock(selector);
    }

    protected addEventToLedger(element: string, stripped: StrippedEvent) {
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