import {DescProtocol} from "./protocol";

const VOTE_DECISION_THRESHHOLD = 0.5001;

export class DescLeaderProtocol extends DescProtocol {

    private lockVotes = new Map<string, LockVote[]>();

    receiveLockVote(selector: string, electionId: string, requester: string, voter: string, vote: boolean) {
        console.log('got lock vote');
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
        const countYes = votes.filter(v => v.vote).length + 1; // One implied vote by the requester.
        const countNo = votes.filter(v => !v.vote).length;

        console.log(electionId, minVotes, countYes, countNo);

        if(countYes >= minVotes) {
            // Decide yes
            this.lockOwners.set(selector, requester);
            this.communication.changeLockOwner(selector, requester);
            console.log('changing lock owner', selector, requester);
        } else if(countNo >= minVotes) {
            // Decide no
        }
    }
}

interface LockVote {
    selector: string,
    requester: string,
    voter: string,
    vote: boolean
}