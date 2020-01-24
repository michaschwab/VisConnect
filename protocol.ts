import {StrippedEvent} from "./listener";
import {DescCommunication} from "./communication";

export class DescProtocol {
    protected ledgers = new Map<string, DescEvent[]>();
    protected lockOwners = new Map<string, string>();
    protected requestedLocks = new Set<string>();
    protected heldEvents = new Map<string, StrippedEvent[]>();
    protected communication: DescCommunication;
    protected participantId: string;

    constructor(protected leaderId: string,
                protected executeEvent: (e: StrippedEvent) => void) {
        this.communication = new DescCommunication(leaderId, this.localEvent.bind(this),
            this.lockOwnerChanged.bind(this), this.getPastEvents.bind(this), this.receiveLockRequest.bind(this),
            this.receiveLockVote.bind(this));
        this.participantId = this.communication.getId();
    }

    getPastEvents() {
        //TODO: Reconstruct the list of events from the ledgers, sorting by time.
        return [];
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

    receiveLockRequest(selector: string, electionId: string, requester: string) {
        let vote = false;
        if(!this.lockOwners.has(selector) || this.lockOwners.get(selector) === requester) {
            // Vote yes
            vote = true;
        }
        this.communication.sendLockVote(selector, electionId, requester, vote);
    }

    lockOwnerChanged(selector: string, owner: string) {
        this.lockOwners.set(selector, owner);

        if(owner === this.participantId && this.heldEvents.has(selector)) {
            // Finally, trigger these held up events.
            const events = this.heldEvents.get(selector)!;
            for(const stripped of events) {
                this.executeEvent(stripped);
                const descEvent = this.addEventToLedger(selector, stripped);
                this.communication.broadcastEvent(descEvent);
            }
            this.heldEvents.delete(selector);
        }
    }

    receiveLockVote(selector: string, electionId: string, requester: string, voter: string, vote: boolean) {
        console.error('Clients are not supposed to receive lock votes.');
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