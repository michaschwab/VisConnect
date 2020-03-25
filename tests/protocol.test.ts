import {VcProtocol} from "../src/protocol";
import {VcCommunication, VcCommunicationI} from "../src/communication";

function test() {
    const leaderId = '';
    const execute = () => {

    };
    const cancel = () => {

    };
    const communication: VcCommunicationI = {
        getId: () => 'test',
        broadcastEvent: () => {},
        requestLock: (selector) => true
    };
    const protocol = new VcProtocol(leaderId, execute, cancel, [], communication);
}
