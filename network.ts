import {DescEvent} from './descvis';

declare var Peer: any;

interface Connection {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string,
    send: (msg: {}) => void;
}

export interface DescMessage {
    peers?: string[],
    type: "new_connection" | "DescEvent" | "NewLeasee",
    sender: string,
    data?: any,
}

export interface InitMessage extends DescMessage{
    type: "new_connection",
    peers: string[], 
    eventsLedger: DescEvent[]
}

export interface NewLeaseeMessage extends DescMessage {
    type: "NewLeasee",
    targetSelector: string,
    leasee: string,
}

export class DescNetwork {
    private peer: any;
    private originID = '';
    private connections: Connection[] = [];
    private peers: string[] = [];
    private eventsQueue = [];
    public id = '';

    constructor(private onEventReceived: (e: DescEvent) => void,
                private onNewConnection: (e: DescMessage) => InitMessage,
                private onNewLeasee: (msg: NewLeaseeMessage) => void) {
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        this.originID = parts ? parts[1] : '';

        this.peer = new Peer();

        if(this.peer.id) {
            this.onOpen(); // In case it was done too fast.
        } else {
            this.peer.on('open', this.onOpen.bind(this));
        }
    }

    setLeasee(targetSelector: string, leasee: string) {
        for(const conn of this.connections) {
            const msg: NewLeaseeMessage = {
                type: "NewLeasee",
                targetSelector,
                leasee,
                sender: this.id,
            };

            conn.send(msg);
        }
    }

    onOpen() {
        this.id = this.peer.id;

        console.log("originID", this.originID);
        console.log("myID", this.id);

        this.connectToPeer(this.id);

        if (!this.originID) {
            console.log(window.location + '?id=' + this.id);
        } else {
            console.log(window.location.href);
            this.connectToPeer(this.originID);
        }

        this.peer.on('connection', this.onConnection.bind(this));
    }

    onConnection(connection: Connection) {
        this.peers.push(connection.peer);
        this.connections.push(connection);
        console.log("new connection", this.peers, this.connections.length);
        connection.on('open', () => {
            this.recieveMessage(connection);
            if (!this.originID) {
                this.sendNewConnection(connection);
            }
        });
    }

    connectToPeer(id: string) {
        const conn = this.peer.connect(id);
        conn.on('open', () => {
            this.connections.push(conn);
            this.peers.push(id);
            console.log("new connection", this.peers, this.connections.length);
            this.recieveMessage(conn);
        });
        return conn;
    }

    recieveMessage(conn: Connection) {
        conn.on('data', (data: DescMessage) => {
            if (data.type === "new_connection") {
                this.recieveNewConnection(data as InitMessage);
            } else if(data.type === 'DescEvent') {
                this.onEventReceived(data.data);
            } else if(data.type === 'NewLeasee') {
                this.onNewLeasee(data as NewLeaseeMessage);
            }
        });
    }

    broadcastEvent(e: DescEvent) {
        for(const conn of this.connections) {
            const msg: DescMessage = {
                'type': 'DescEvent',
                'sender': this.id,
                data: e,
            };

            conn.send(msg);
        }
    }

    sendNewConnection(conn: Connection) {
        console.log("sending new connection message");
        const newConnectionMessage: DescMessage = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
            //'eventsLedger': this.eventsLedger
        };
        const decoratedMessage = this.onNewConnection(newConnectionMessage);
        conn.send(decoratedMessage);
    }

    recieveNewConnection(data: InitMessage) {
        console.log("new connection message", data);
        for (let i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }

        for (let i = 0; i < data.eventsLedger.length; i++){
            this.onEventReceived(data.eventsLedger[i]);
        }
    }
}
