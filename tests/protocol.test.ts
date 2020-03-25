import {VcProtocol} from "../src/protocol";
import {VcCommunication, VcCommunicationI} from "../src/communication";
import {VcLeaderProtocol} from "../src/leader-protocol";

function test() {
    const leaderId = 'leader';
    const leader = getMockClient(leaderId, leaderId);
    const client = getMockClient(leaderId, 'client');


}

function getMockClient(id: string, leaderId: string) {
    const execute = () => {

    };
    const cancel = () => {

    };
    const communication: VcCommunicationI = {
        getId: () => id,
        broadcastEvent: () => {},
        requestLock: (selector) => true
    };
    const isLeader = id === leaderId;
    const Protocol = isLeader ? VcLeaderProtocol : VcProtocol;
    const protocol = new Protocol(leaderId, execute, cancel, [], communication);
}