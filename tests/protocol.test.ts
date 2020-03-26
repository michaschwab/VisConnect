import {VcProtocol} from "../src/protocol";
import {VcCommunicationConstructorData, VcCommunicationI} from "../src/communication";
import {VcLeaderProtocol} from "../src/leader-protocol";

function test() {
    const leaderId = 'leader';
    const leader = getMockClient(leaderId, leaderId);
    const client = getMockClient(leaderId, 'client');

}

function getMockClient(id: string, leaderId: string) {
    const lockOwners = new Map<string, string>();
    const execute = () => {

    };
    const cancel = () => {

    };

    const isLeader = id === leaderId;
    const Protocol = isLeader ? VcLeaderProtocol : VcProtocol;
    const protocol = new Protocol(leaderId, execute, cancel, [], MockCommunicationConstructor);
    protocol.communication.id = id;
}

class MockCommunicationConstructor implements VcCommunicationI {
    public id = '';
    constructor(private data: VcCommunicationConstructorData) {}
    getId() { return this.id; }
    broadcastEvent() {}
    requestLock(selector: string) { return true; }
    changeLockOwner(selector: string, owner: string) {}
}
