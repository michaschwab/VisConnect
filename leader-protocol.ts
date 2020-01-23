import {DescProtocol} from "./protocol";

const VOTE_DECISION_THRESHHOLD = 0.5001;

export class DescLeaderProtocol extends DescProtocol {

    private lockVotes = new Map<string, LockVote[]>();

    receiveLockVote(selector: string, requester: string, voter: string, vote: boolean) {
        if(!this.lockVotes.has(selector)) {
            this.lockVotes.set(selector, []);
        }
        const votes = this.lockVotes.get(selector)!;

        if(votes.filter(v => v.voter === voter).length > 0) {
            console.log('Not counting a lock vote because the voter has already voted on this element.');
            return;
        }
        votes.push({requester, voter, vote});

        const minVotes = Math.ceil(VOTE_DECISION_THRESHHOLD * this.communication.getNumberOfConnections());
        const countYes = votes.filter(v => v.vote).length;
        const countNo = votes.filter(v => !v.vote).length;

        if(countYes >= minVotes) {
            //TODO: Decide yes
            //TODO: Clear votes and make sure that new votes that come in about this election do not get added
        } else if(countNo >= minVotes) {
            //TODO Decide no
            //TODO: Clear votes and make sure that new votes that come in about this election do not get added
        }
    }
}

interface LockVote {
    requester: string,
    voter: string,
    vote: boolean
}