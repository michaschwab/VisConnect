import { Subject } from 'rxjs';

export interface PeerjsConnectionI {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string,
    send: (msg: {}) => void;
}

export interface DescConnection {
    send(message: {}): void;
    getPeer(): string;
    messages: Subject<any>;
    open(): Promise<void>;
}

export class PeerjsConnection implements DescConnection {
    messages = new Subject<{}>();

    constructor(private connection: PeerjsConnectionI) {
        this.connection.on('data', message => {
            this.receiveMessage(message);
        });
    }

    send(message: {}) {
        this.connection.send(message);
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