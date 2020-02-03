import {PeerjsConnection, PeerjsConnectionI} from "./peerjs-connection";

declare var Peer: any;

export interface DescNetwork {
    init(onOpen: () => void, onConnection: (connection: PeerjsConnection) => void): void;
    getId(): string;
    connect(peerId: string): Promise<PeerjsConnection>;
}

export class PeerjsNetwork implements DescNetwork {
    private peer: any;
    private onOpen: () => void = () => 0;
    private onConnection: (connection: PeerjsConnection) => void = () => {};

    init(onOpen: () => void, onConnection: (connection: PeerjsConnection) => void) {
        this.onOpen = onOpen;
        this.onConnection = onConnection;

        this.peer = new Peer({
            config:  {'iceServers': [
                //{ url: 'stun:stun.l.google.com:19302' },
                {
                    'urls': 'turn:numb.viagenie.ca',
                    'credential': "a/j'/9CmxTCa",
                    'username': 'saffo.d@husky.neu.edu'
                  }
            ]}
        });

        if(this.peer.id) {
            this.onOpen(); // In case it was done too fast.
        } else {
            this.peer.on('open', this.onOpen);
        }

        this.peer.on('connection', (connection: PeerjsConnectionI) => {
            this.onConnection(new PeerjsConnection(connection));
        });
    }

    getId(): string {
        return this.peer.id;
    }

    connect(peerId: string): Promise<PeerjsConnection> {
        return new Promise<PeerjsConnection>(async (resolve) => {
            const conn: PeerjsConnectionI = this.peer.connect(peerId);
            const connection = new PeerjsConnection(conn);

            await connection.open();
            resolve(connection);
        });
    }
}