import {DescLeaderProtocol} from "./leader-protocol";
import {DescProtocol} from "./protocol";

class ProtocolTest {
    testGetLock() {
        const mockCommunication = new MockCommunication();

        const a = new DescLeaderProtocol(mockCommunication);
        const b = new DescProtocol(mockCommunication);
        const c = new DescProtocol(mockCommunication);

        b.localEvent({target: 'svg > rect', clientX: 100, clientY: 100});

        // Make sure b gets the lock.

        // Then, make sure the event is executed on a, b and c (or rather, is on the ledger).
    }

    testPreventsEventsOnLockedElements() {
        const mockCommunication = new MockCommunication();

        const a = new DescLeaderProtocol(mockCommunication);
        const b = new DescProtocol(mockCommunication);
        const c = new DescProtocol(mockCommunication);

        b.localEvent({target: 'svg > rect', clientX: 100, clientY: 100});

        // wait 100 ms.

        c.localEvent({target: 'svg > rect', clientX: 200, clientY: 200});

        // Make sure c's event is not executed on any of the clients within the time frame.

        // wait 2000 ms.

        c.localEvent({target: 'svg > rect', clientX: 200, clientY: 200});

        // Make sure c's event is executed on all of the clients.
    }
}

class MockCommunication {

}