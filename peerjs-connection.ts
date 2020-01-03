export interface PeerjsConnectionI {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string,
    send: (msg: {}) => void;
}

export interface DescConnection {
    send(message: {}): void;
    getPeer(): string;
    receiveMessage(): Promise<any>;
    open(): Promise<void>;
}

export class PeerjsConnection implements DescConnection{
    constructor(private connection: PeerjsConnectionI) {

    }

    send(message: {}) {
        this.connection.send(message);
    }

    getPeer() {
        return this.connection.peer;
    }

    receiveMessage() {
        return new Promise<any>(resolve => {
            this.connection.on('data', message => {
                resolve(message);
            });
        });
    }

    open() {
        return new Promise<void>(resolve => {
            this.connection.on('open', resolve);
        });
    }
}