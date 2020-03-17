import {DescProtocol} from "./protocol";
import {StrippedEvent} from "./listener";
import {DescCommunication} from "./communication";
import {LockService} from "./lock-service";

export class DescLeaderProtocol extends DescProtocol {

    private lockService: LockService;

    constructor(protected leaderId: string,
                protected executeEvent: (e: StrippedEvent) => void,
                protected cancelEvent: (e: StrippedEvent) => void,
                protected unsafeElements: string[],
                mockCommunication?: DescCommunication) {
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