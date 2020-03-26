import {VcCommunicationI} from "./communication";

export class LockService {
    protected lockOwners = new Map<string, string>();
    protected lockTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

    constructor(protected communication: VcCommunicationI) {

    }

    requestLock(selector: string, client: string) {
        if(this.lockOwners.has(selector)) {
            return;
        }

        this.lockOwners.set(selector, client);
        this.communication.changeLockOwner(selector, client);
    }

    extendLock(selector: string) {
        // Delete any previous timeouts
        const prevTimeout = this.lockTimeouts.get(selector);
        if(prevTimeout) {
            clearTimeout(prevTimeout);
        }
        const timeout = setTimeout(this.expireLock(selector), 1000);
        this.lockTimeouts.set(selector, timeout);
    }

    private expireLock(selector: string) {
        return () => {
            this.lockOwners.delete(selector);
            this.communication.changeLockOwner(selector, '');
        };
    }
}