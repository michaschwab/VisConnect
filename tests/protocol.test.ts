import {VcProtocol} from "../src/protocol";
import {VcCommunicationConstructorData, VcCommunicationI, VcMessage} from "../src/communication";
import {VcLeaderProtocol} from "../src/leader-protocol";
import {StrippedEvent} from "../src/listener";

function test() {
    console.log('Tests started');

    const leaderId = 'leader';
    const leader = getMockClient(leaderId, leaderId);
    const client = getMockClient('client', leaderId);

    client.localEvent({
        type: 'mousedown',
        target: 'svg',
        targetType: 'svg',
        timeStamp: 0,
        collaboratorId: 'client',
        touches: []
    });
}

let leaderComm: MockCommunication;
const communications: MockCommunication[] = [];

function getMockClient(id: string, leaderId: string) {
    const execute = (event: StrippedEvent) => {
        console.log(`client ${id} executing`, event);
    };
    const cancel = () => {
        console.log(`client ${id} rejecting something`);
    };

    const isLeader = id === leaderId;
    const Protocol = isLeader ? VcLeaderProtocol : VcProtocol;
    const protocol = new Protocol(leaderId, execute, cancel, [], MockCommunication);
    const communication = protocol.communication as MockCommunication;
    communication.id = id;
    communication.data.onOpenCallback();

    communications.push(communication);
    if(isLeader) {
        leaderComm = communication;
    }

    return protocol;
}

class MockCommunication implements VcCommunicationI {
    public id = '';
    constructor(public data: VcCommunicationConstructorData) {}
    getId() { return this.id; }
    broadcastEvent(stripped: StrippedEvent) {
        communications.forEach(comm => {
            comm.data.onEventReceived([stripped], this.id);
        });
    }
    requestLock(selector: string) {
        console.log(`client ${this.id} requesting lock for ${selector}`);
        leaderComm.data.onLockRequested(selector, this.id);
        return true;
    }
    changeLockOwner(selector: string, owner: string) {
        console.log(`client ${this.id} declaring new lock owner ${owner} on element ${selector}`);
        communications.forEach(comm => {
            comm.data.onNewLockOwner(selector, owner);
        });
    }
}

test();
