import {VcProtocol} from '../src/protocol';
import {VcLeaderProtocol} from '../src/leader-protocol';
import {VcCommunicationConstructorData, VcCommunicationI} from '../src/communication';
import {VcEvent} from '../src/visconnect';

export function getMockNetwork(numClients: number) {
    let leaderComm: MockCommunication;
    const communications: MockCommunication[] = [];

    const leader = getMockClient('leader', 'leader');
    leaderComm = leader.communication as MockCommunication;
    communications.push(leader.communication as MockCommunication);
    const clients: VcProtocol[] = [];

    for (let i = 1; i <= numClients; i++) {
        const client = getMockClient(`client${i}`, 'leader');
        clients.push(client);
        communications.push(client.communication as MockCommunication);
    }

    for (const comm of communications) {
        comm.communications = communications;
        comm.leaderComm = leaderComm;
    }

    return {leader, clients};
}

function getMockClient(id: string, leaderId: string) {
    const execute = () => {};
    const cancel = () => {};
    const isLeader = id === leaderId;
    const Protocol = isLeader ? VcLeaderProtocol : VcProtocol;
    const protocol = new Protocol(leaderId, id, execute, cancel, [], MockCommunication);
    const communication = protocol.communication as MockCommunication;
    communication.id = id;
    communication.data.onOpenCallback();

    return protocol;
}

export class MockCommunication implements VcCommunicationI {
    public id = '';
    public leaderId = '';
    public communications: MockCommunication[] = [];
    public leaderComm?: MockCommunication;
    public delay: number | false = false;
    onConnectionCallback = () => {};
    init = () => {};

    constructor(public data: VcCommunicationConstructorData) {}
    getId() {
        return this.id;
    }
    broadcastEvent(stripped: VcEvent) {
        this.communications.forEach((comm) => {
            if (comm.id !== this.id) {
                const receive = () => comm.data.onEventReceived([{...stripped}], this.id);
                this.delay ? setTimeout(receive, this.delay) : receive();
            }
        });
    }
    requestLock(selector: string) {
        //console.log(`client ${this.id} requesting lock for ${selector}`);
        if (!this.leaderComm) {
            console.error('no leader comm');
            return false;
        }
        const leader = this.leaderComm;
        const req = () => leader.data.onLockRequested(selector, this.id);
        this.delay ? setTimeout(req, this.delay) : req();
        return true;
    }
    changeLockOwner(selector: string, owner: string, seqNum: number) {
        //console.log(`client ${this.id} declaring new lock owner ${owner} on element ${selector}`);
        this.communications.forEach((comm) => {
            const cb = () => comm.data.onNewLockOwner(selector, owner, seqNum);
            this.delay ? setTimeout(cb, this.delay) : cb();
        });
    }
    getNumberOfConnections() {
        return this.communications.length;
    }
}
