import {StrippedEvent} from "./listener";
import {VcCommunication} from "./communication";

export class VcProtocol {
    protected ledgers = new Map<string, VcEvent[]>();
    protected lockOwners = new Map<string, string>();
    protected requestedLocks = new Set<string>();
    protected heldEvents = new Map<string, StrippedEvent[]>();
    communication: VcCommunication;
    protected collaboratorId = '';

    constructor(protected leaderId: string,
                protected executeEvent: (e: StrippedEvent) => void,
                protected cancelEvent: (e: StrippedEvent) => void,
                protected unsafeElements: string[],
                mockCommunication?: VcCommunication) {
        if(mockCommunication) {
            this.communication = mockCommunication;
        } else {
            this.communication = new VcCommunication(leaderId, this.receiveRemoteEvents.bind(this),
                this.lockOwnerChanged.bind(this), this.getPastEvents.bind(this), this.receiveLockRequest.bind(this),
                this.init.bind(this));
        }
    }

    init() {
        this.collaboratorId = this.communication.getId();
    }

    getPastEvents() {
        const events = Array.from(this.ledgers.values()).reduce((a, b) => a.concat(b), []);
        return events.sort((a, b) => a.event.timeStamp - b.event.timeStamp);
    }

    localEvent(stripped: StrippedEvent) {
        const selector = stripped.target;
        stripped.collaboratorId = this.communication.getId();
        //console.log('local event on ', selector, this.lockOwners.get(selector), this.collaboratorId);

        // All clients are allowed to interact with the unsafe elements.
        const allAllowed = this.unsafeElements.includes(stripped.targetType) || this.unsafeElements.includes('*');
        const lockOwner = this.lockOwners.get(selector);

        if(allAllowed || (lockOwner && lockOwner === this.collaboratorId)) {
            const vcEvent = this.addEventToLedger(stripped, this.collaboratorId);
            if(vcEvent) {
                this.communication.broadcastEvent(stripped);
            }
        } else if(lockOwner && lockOwner !== this.collaboratorId) {
            // Do nothing - do not execute the event.
            this.cancelEvent(stripped);
        } else {
            if(!this.heldEvents.has(selector)) {
                this.heldEvents.set(selector, []);
            }
            this.heldEvents.get(selector)!.push(stripped);
            //console.log('held', this.heldEvents.get(selector));

            this.requestLock(selector);
        }
    }

    receiveRemoteEvents(events: StrippedEvent[], sender: string, catchup = false) {
        for(const stripped of events) {
            this.addEventToLedger(stripped, sender, catchup);
        }
    }

    receiveLockRequest(selector: string, requester: string) {
        console.error('Clients are not supposed to receive lock requests.');
    }

    lockOwnerChanged(selector: string, owner: string) {
        //console.log('Lock owner changed', selector, owner, this.collaboratorId, this.heldEvents.has(selector), this.heldEvents.get(selector));
        this.requestedLocks.delete(selector);

        if(!owner) {
            this.lockOwners.delete(selector);
            return;
        }
        this.lockOwners.set(selector, owner);

        if(owner === this.collaboratorId && this.heldEvents.has(selector)) {
            // Finally, trigger these held up events.
            const events = this.heldEvents.get(selector)!;
            //console.log('Triggering some held up events', events);
            for(const stripped of events) {
                const vcEvent = this.addEventToLedger(stripped, this.collaboratorId);
                if(vcEvent) {
                    this.communication.broadcastEvent(stripped);
                }
            }
        }
        this.heldEvents.delete(selector);
    }

    protected requestLock(selector: string) {
        if(this.requestedLocks.has(selector)) {
            return;
        }
        //console.log('Requesting lock on ', selector);

        const success = this.communication.requestLock(selector);
        if(success) {
            this.requestedLocks.add(selector);
        }
    }

    protected addEventToLedger(stripped: StrippedEvent, sender: string, catchup = false) {
        const selector = stripped.target;
        const allAllowed = this.unsafeElements.includes(stripped.targetType) || this.unsafeElements.includes('*');

        // Skip ownership check for catchup events, and for background events.
        if(!catchup && !allAllowed) {
            const lockOwner = this.lockOwners.get(selector);
            if(!lockOwner || lockOwner !== sender) {
                console.error('Trying to execute event on element with different lock owner', selector, lockOwner, sender);
                return false;
            }
        }

        this.executeEvent(stripped);

        if(!this.ledgers.has(selector)) {
            this.ledgers.set(selector, []);
        }
        const ledger = this.ledgers.get(selector)!;
        let seqNum = 0;
        if(ledger.length) {
            const lastEvent = ledger[ledger.length - 1];
            seqNum = lastEvent.seqNum + 1;
        }

        const newEvent: VcEvent = {
            seqNum,
            'event': stripped,
            'sender': this.collaboratorId
        };

        ledger.push(newEvent);

        return true;
    }
}

export interface VcEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}