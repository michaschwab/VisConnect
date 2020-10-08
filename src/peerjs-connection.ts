import {Subject} from 'rxjs';
import {VcMessage} from './communication';

export interface PeerjsConnectionI {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string;
    send: (msg: {}) => void;
}

export interface VcConnection {
    send(message: {}): void;
    getPeer(): string;
    messages: Subject<any>;
    open(): Promise<void>;
}

export class PeerjsConnection implements VcConnection {
    messages = new Subject<VcMessage>();

    constructor(private connection: PeerjsConnectionI) {
        this.connection.on('data', (message) => {
            this.receiveMessage(message);
        });
    }

    send(message: VcMessage) {
        // The testdelay URL flag can be used to test bad network conditions.
        if (location.href.includes('testdelay')) {
            setTimeout(() => this.connection.send(message), Math.round(Math.random() * 100));
        } else {
            this.connection.send(message);
        }
    }

    getPeer() {
        return this.connection.peer;
    }

    private receiveMessage(message: VcMessage) {
        this.messages.next(message);
    }

    open() {
        return new Promise<void>((resolve) => {
            this.connection.on('open', resolve);
        });
    }
}
