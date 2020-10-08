import {StrippedEvent} from './listener';
import {VcCommunication, VcCommunicationConstructor, VcCommunicationI} from './communication';
import {VcEvent} from './visconnect';

export class VcProtocol {
    ledgers = new Map<string, VcEvent[]>();
    protected lockOwners = new Map<string, string>();
    protected requestedLocks = new Set<string>();
    protected heldEvents = new Map<string, StrippedEvent[]>();
    protected heldRemoteEvents = new Map<string, VcEvent[]>();
    communication: VcCommunicationI;
    protected collaboratorId = '';

    constructor(
        protected leaderId: string,
        protected ownId: string,
        protected executeEvent: (e: StrippedEvent) => void,
        protected cancelEvent: (e: StrippedEvent) => void,
        protected unsafeElements: string[],
        MockCommunication?: VcCommunicationConstructor
    ) {
        const Communication = MockCommunication ? MockCommunication : VcCommunication;
        this.communication = new Communication({
            leaderId: leaderId,
            ownId: ownId,
            onEventReceived: this.receiveRemoteEvents.bind(this),
            onNewLockOwner: this.lockOwnerChanged.bind(this),
            getPastEvents: this.getPastEvents.bind(this),
            onLockRequested: this.receiveLockRequest.bind(this),
            onOpenCallback: this.init.bind(this),
        });
        this.communication.init();
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
        const allAllowed =
            this.unsafeElements.includes(stripped.targetType) || this.unsafeElements.includes('*');
        const lockOwner = this.lockOwners.get(selector);

        if (allAllowed || (lockOwner && lockOwner === this.collaboratorId)) {
            const vcEvent = this.makeVcEvent(stripped);
            const success = this.addEventToLedger(vcEvent, this.collaboratorId);
            if (success) {
                this.communication.broadcastEvent(vcEvent);
            }
        } else if (lockOwner && lockOwner !== this.collaboratorId) {
            // Do nothing - do not execute the event.
            this.cancelEvent(stripped);
        } else {
            if (!this.heldEvents.has(selector)) {
                this.heldEvents.set(selector, []);
            }
            this.heldEvents.get(selector)!.push(stripped);
            //console.log('held', this.heldEvents.get(selector));

            this.requestLock(selector);
        }
    }

    receiveRemoteEvents(events: VcEvent[], sender: string, catchup = false) {
        for (const event of events) {
            const ledger = this.ledgers.get(event.event.target);
            let lastSeqNum = ledger && ledger.length ? ledger[ledger.length - 1].seqNum : -1;
            this.playHeldRemoteEvents(event.event.target, lastSeqNum);
            lastSeqNum = ledger && ledger.length ? ledger[ledger.length - 1].seqNum : -1;

            if (event.seqNum !== lastSeqNum + 1) {
                this.holdRemoteEvent(event);
            } else {
                const success = this.addEventToLedger(event, sender, catchup);
                if (!success && !this.lockOwners.has(event.event.target)) {
                    this.holdRemoteEvent(event);
                }
            }
        }
    }

    protected holdRemoteEvent(event: VcEvent) {
        if (!this.heldRemoteEvents.has(event.event.target)) {
            this.heldRemoteEvents.set(event.event.target, []);
        }
        this.heldRemoteEvents.get(event.event.target)!.push(event);
        //console.log('adding event to held remote events on ', this.collaboratorId);
    }

    receiveLockRequest(selector: string, requester: string) {
        console.error('Clients are not supposed to receive lock requests.');
    }

    lockOwnerChanged(selector: string, owner: string, seqNum: number) {
        //console.log('Lock owner changed', selector, owner, this.collaboratorId, this.heldEvents.has(selector), this.heldEvents.get(selector));
        this.requestedLocks.delete(selector);

        if (!owner) {
            this.lockOwners.delete(selector);
            this.heldEvents.delete(selector);
            return;
        }
        this.lockOwners.set(selector, owner);

        if (owner === this.collaboratorId && this.heldEvents.has(selector)) {
            // Finally, trigger these held up events.
            const events = this.heldEvents.get(selector)!;
            //console.log('Triggering some held up events', events);
            for (const stripped of events) {
                if (this.canExecuteEvent(stripped, this.collaboratorId)) {
                    const vcEvent = this.makeVcEvent(stripped);
                    const success = this.addEventToLedger(vcEvent, this.collaboratorId);
                    if (success) {
                        this.communication.broadcastEvent(vcEvent);
                    }
                }
            }
            this.heldEvents.delete(selector);
        } else if (this.heldRemoteEvents.has(selector)) {
            this.playHeldRemoteEvents(selector, seqNum);
        }
    }

    protected playHeldRemoteEvents(selector: string, seqNum: number) {
        const held = this.heldRemoteEvents.get(selector);
        if (!held) {
            return;
        }
        const filtered = held.filter((e) => e.seqNum >= seqNum).sort((a, b) => a.seqNum - b.seqNum);
        for (const event of filtered) {
            this.addEventToLedger(event, event.sender, false);
        }
        //this.heldRemoteEvents.delete(selector);
    }

    protected requestLock(selector: string) {
        if (this.requestedLocks.has(selector)) {
            return;
        }
        //console.log('Requesting lock on ', selector);

        const success = this.communication.requestLock(selector);
        if (success) {
            this.requestedLocks.add(selector);
        }
    }

    protected canExecuteEvent(stripped: StrippedEvent, sender: string, catchup = false) {
        const selector = stripped.target;
        const allAllowed =
            this.unsafeElements.includes(stripped.targetType) || this.unsafeElements.includes('*');

        // Skip ownership check for catchup events, and for background events.
        if (!catchup && !allAllowed) {
            const lockOwner = this.lockOwners.get(selector);
            if (!lockOwner) {
                return false;
            } else if (lockOwner !== sender) {
                console.error(
                    'Trying to execute event on element with different lock owner',
                    selector,
                    lockOwner,
                    sender
                );
                return false;
            }
        }
        return true;
    }

    protected makeVcEvent(stripped: StrippedEvent): VcEvent {
        const ledger = this.ledgers.get(stripped.target);
        let seqNum = 0;
        if (ledger && ledger.length) {
            const lastEvent = ledger[ledger.length - 1];
            seqNum = lastEvent.seqNum + 1;
        }

        return {
            seqNum,
            event: stripped,
            sender: this.collaboratorId,
        };
    }

    protected addEventToLedger(event: VcEvent, sender: string, catchup = false) {
        const stripped = event.event;
        const selector = stripped.target;

        if (!this.canExecuteEvent(stripped, sender, catchup)) {
            return false;
        }

        if (!this.ledgers.has(selector)) {
            this.ledgers.set(selector, []);
        }
        const ledger = this.ledgers.get(selector)!;
        let seqNum = 0;
        if (ledger.length) {
            const lastEvent = ledger[ledger.length - 1];
            seqNum = lastEvent.seqNum + 1;
        }

        if (event.seqNum === seqNum) {
            ledger.push(event);
            //console.log(seqNum, stripped.type);
            this.executeEvent(stripped);
            return true;
        } else {
            // The order is not right.
            safeErrorLog('cant execute event because the sequence number is wrong', event.seqNum);
            return false;
        }
    }
}

let safeLogCount = 0;

function safeLog(...logContents: any) {
    if (safeLogCount < 200) {
        safeLogCount++;
        console.log(...logContents);
    }
}
function safeErrorLog(...logContents: any) {
    if (safeLogCount < 200) {
        safeLogCount++;
        console.error(...logContents);
    }
}
