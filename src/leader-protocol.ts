import {VcProtocol} from "./protocol";
import {StrippedEvent} from "./listener";
import {VcCommunicationConstructor} from "./communication";
import {LockService} from "./lock-service";

export class VcLeaderProtocol extends VcProtocol {
    lockService: LockService;

    constructor(protected leaderId: string,
                protected executeEvent: (e: StrippedEvent) => void,
                protected cancelEvent: (e: StrippedEvent) => void,
                protected unsafeElements: string[],
                mockCommunication?: VcCommunicationConstructor) {
        super(leaderId, executeEvent, cancelEvent, unsafeElements, mockCommunication);

        this.lockService = new LockService(this.communication);
    }

    receiveLockRequest(selector: string, requester: string) {
        const ledger = this.ledgers.get(selector);
        const seqNum = !ledger ? 0 : ledger[ledger.length - 1].seqNum + 1;
        this.lockService.requestLock(selector, requester, seqNum);
    }

    protected addEventToLedger(stripped: StrippedEvent, sender: string) {
        const success = super.addEventToLedger(stripped, sender);

        if(success) {
            this.lockService.extendLock(stripped.target);
        }

        return success;
    }
}