import {PeerjsConnection, PeerjsConnectionI} from "./peerjs-connection";

declare var Peer: any;

export interface VcNetwork {
    init(id: string, onOpen: () => void, onConnection: (connection: PeerjsConnection) => void, onDisconnection: () => void): void;
    getId(): string;
    connect(peerId: string): Promise<PeerjsConnection>;
}

export class PeerjsNetwork implements VcNetwork {
    private peer: any;
    private onOpen: () => void = () => 0;

    init(id: string, onOpen: () => void, onConnection: (connection: PeerjsConnection) => void, onDisconnection: () => void) {
        this.onOpen = onOpen;

        this.peer = new Peer(id, {
            host: 'michaschwab.de',
            port: 9000,
            secure: true,
            path: '/visconnect',
            config:  {'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    'urls': 'turn:numb.viagenie.ca',
                    'credential': "a/j'/9CmxTCa",
                    'username': 'saffo.d@husky.neu.edu'
                  }
            ]}
        });

        if(this.peer._open) {
            this.onOpen(); // In case it was done too fast.
        } else {
            this.peer.on('open', this.onOpen);
        }

        this.peer.on('connection', (connection: PeerjsConnectionI) => {
            console.log("connection!");
            onConnection(new PeerjsConnection(connection));
        });

        this.peer.on('disconnected',  () => {
            onDisconnection();
        });

        window.addEventListener("beforeunload", () => onDisconnection());
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