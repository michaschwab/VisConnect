import {VcProtocol} from "./protocol";
import {StrippedEvent} from "./listener";
import {VcCommunicationConstructor} from "./communication";
import {LockService} from "./lock-service";
import {VcEvent} from "./visconnect";

export class VcLeaderProtocol extends VcProtocol {
    lockService: LockService;

    constructor(protected leaderId: string,
                protected ownId: string,
                protected executeEvent: (e: StrippedEvent) => void,
                protected cancelEvent: (e: StrippedEvent) => void,
                protected unsafeElements: string[],
                mockCommunication?: VcCommunicationConstructor) {
        super(leaderId, ownId, executeEvent, cancelEvent, unsafeElements, mockCommunication);

        this.lockService = new LockService(this.communication);
    }

    receiveLockRequest(selector: string, requester: string) {
        const ledger = this.ledgers.get(selector);
        const seqNum = !ledger ? 0 : ledger[ledger.length - 1].seqNum + 1;
        this.lockService.requestLock(selector, requester, seqNum);
    }

    protected addEventToLedger(event: VcEvent, sender: string) {
        const success = super.addEventToLedger(event, sender);

        if(success) {
            this.lockService.extendLock(event.event.target);
        }

        return success;
    }
}