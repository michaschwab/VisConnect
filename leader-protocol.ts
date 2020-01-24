import {DescProtocol} from "./protocol";
import {StrippedEvent} from "./listener";

const VOTE_DECISION_THRESHHOLD = 0.5001;

export class DescLeaderProtocol extends DescProtocol {
    private lockVotes = new Map<string, LockVote[]>();
    private lockTimeouts = new Map<string, number>();

    receiveLockVote(selector: string, electionId: string, requester: string, voter: string, vote: boolean) {
        if(!this.lockVotes.has(electionId)) {
            this.lockVotes.set(electionId, []);
        }
        const votes = this.lockVotes.get(electionId)!;

        if(votes.filter(v => v.voter === voter).length > 0) {
            console.log('Not counting a lock vote because the voter has already voted on this element.');
            return;
        }
        votes.push({selector, requester, voter, vote});

        const minVotes = Math.ceil(VOTE_DECISION_THRESHHOLD * this.communication.getNumberOfConnections());
        const countYes = votes.filter(v => v.vote).length;
        const countNo = votes.filter(v => !v.vote).length;

        console.log('election:', electionId, minVotes, countYes, countNo);

        if(countYes < minVotes && countNo < minVotes) {
            return;
        }

        if(countYes >= minVotes) {
            // Decide yes
            this.lockOwners.set(selector, requester);
            this.communication.changeLockOwner(selector, requester);
            console.log('changing lock owner', selector, requester);

            this.extendLock(selector);
        } else if(countNo >= minVotes) {
            // Decide no
        }
        this.lockVotes.delete(selector);

    }

    protected extendLock(selector: string) {
        // Delete any previous timeouts
        const prevTimeout = this.lockTimeouts.get(selector);
        if(prevTimeout) {
            clearTimeout(prevTimeout);
        }
        const timeout = window.setTimeout(this.expireLock(selector), 1000);
        this.lockTimeouts.set(selector, timeout);
    }

    private expireLock(selector: string) {
        return () => {
            this.lockOwners.delete(selector);
            this.communication.changeLockOwner(selector, '');
            console.log('expiring lock owner', selector);
        };
    }

    protected addEventToLedger(stripped: StrippedEvent, sender: string) {
        const success = super.addEventToLedger(stripped, sender);

        if(success) {
            this.extendLock(stripped.target);
        }

        return success;
    }
}

interface LockVote {
    selector: string,
    requester: string,
    voter: string,
    vote: boolean
}