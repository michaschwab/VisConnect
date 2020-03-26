import { Subject } from 'rxjs';

export interface PeerjsConnectionI {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string,
    send: (msg: {}) => void;
}

export interface VcConnection {
    send(message: {}): void;
    getPeer(): string;
    messages: Subject<any>;
    open(): Promise<void>;
}

export class PeerjsConnection implements VcConnection {
    messages = new Subject<{}>();

    constructor(private connection: PeerjsConnectionI) {
        this.connection.on('data', message => {
            this.receiveMessage(message);
        });
    }

    send(message: {}) {
        // To test bad network conditions, the following line can be activated instead of the one following it.
        //setTimeout(() => this.connection.send(message), Math.round(Math.random() * 60));
        this.connection.send(message)
    }

    getPeer() {
        return this.connection.peer;
    }

    private receiveMessage(message: any) {
        this.messages.next(message);
    }

    open() {
        return new Promise<void>(resolve => {
            this.connection.on('open', resolve);
        });
    }
}
