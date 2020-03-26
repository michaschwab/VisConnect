import {VcProtocol} from "./protocol";
import {StrippedEvent} from "./listener";
import {VcCommunication, VcCommunicationConstructor, VcCommunicationI} from "./communication";
import {LockService} from "./lock-service";

export class VcLeaderProtocol extends VcProtocol {
    private lockService: LockService;

    constructor(protected leaderId: string,
                protected executeEvent: (e: StrippedEvent) => void,
                protected cancelEvent: (e: StrippedEvent) => void,
                protected unsafeElements: string[],
                mockCommunication?: VcCommunicationConstructor) {
        super(leaderId, executeEvent, cancelEvent, unsafeElements, mockCommunication);

        this.lockService = new LockService(this.communication);
    }

    receiveLockRequest(selector: string, requester: string) {
        this.lockService.requestLock(selector, requester);
    }

    protected addEventToLedger(stripped: StrippedEvent, sender: string) {
        const success = super.addEventToLedger(stripped, sender);

        if(success) {
            this.lockService.extendLock(stripped.target);
        }

        return success;
    }
}