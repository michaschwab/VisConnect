import {VcProtocol} from "../src/protocol";
import {VcCommunicationConstructorData, VcCommunicationI} from "../src/communication";
import {VcLeaderProtocol} from "../src/leader-protocol";
import {StrippedEvent} from "../src/listener";

function test() {
    const leaderId = 'leader';
    const leader = getMockClient(leaderId, leaderId);
    const client = getMockClient(leaderId, 'client');

}

const communications: MockCommunication[] = [];

function getMockClient(id: string, leaderId: string) {
    const lockOwners = new Map<string, string>();
    const execute = () => {

    };
    const cancel = () => {

    };

    const isLeader = id === leaderId;
    const Protocol = isLeader ? VcLeaderProtocol : VcProtocol;
    const protocol = new Protocol(leaderId, execute, cancel, [], MockCommunication);
    protocol.communication.id = id;

    communications.push(protocol.communication as MockCommunication);
}

class MockCommunication implements VcCommunicationI {
    public id = '';
    constructor(public data: VcCommunicationConstructorData) {}
    getId() { return this.id; }
    broadcastEvent(stripped: StrippedEvent) {
        communications.forEach(comm => {
            comm.data.onEventReceived([stripped], this.id);
        })
    }
    requestLock(selector: string) { return true; }
    changeLockOwner(selector: string, owner: string) {}
}
