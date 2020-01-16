import {StrippedEvent} from "./listener";

export class DescProtocol {
    private participantId = 'test';
    private ledgers = new Map<HTMLElement, DescEvent[]>();
    private lockOwners = new Map<HTMLElement, string>();

    localEvent(element: HTMLElement) {
        if(this.lockOwners.has(element) && this.lockOwners.get(element) === this.participantId) {
            // Allow event. Should add to ledger.
        } else if(this.lockOwners.has(element) && this.lockOwners.get(element) !== this.participantId) {
            // Block event
        } else {
            // Request lock
        }
    }


    receiveRemoteEvent() {

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