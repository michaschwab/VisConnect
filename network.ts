import {DescEvent} from './descvis';
import {DescNetwork, PeerjsNetwork} from "./peerjs-network";
import {DescConnection} from "./peerjs-connection";


export interface DescMessage {
    peers?: string[],
    type: "new_connection" | "DescEvent" | "NewLeasee",
    sender: string,
    data?: any,
}

export interface InitMessage extends DescMessage {
    type: "new_connection",
    peers: string[], 
    eventsLedger: DescEvent[]
}

export interface NewLeaseeMessage extends DescMessage {
    type: "NewLeasee",
    targetSelector: string,
    leasee: string,
}

export class DescCommunication {
    private peer: DescNetwork;
    private connections: DescConnection[] = [];
    private peers: string[] = [];
    private eventsQueue = [];
    public id = '';

    constructor(private originID: string,
                private onEventReceived: (e: DescEvent) => void,
                private onNewConnection: (e: DescMessage) => InitMessage,
                private onNewLeasee: (msg: NewLeaseeMessage) => void) {
        this.peer = new PeerjsNetwork();
        this.peer.init(this.onOpen.bind(this), this.onConnection.bind(this));
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
        this.id = this.peer.getId();

        console.log("originID", this.originID);
        console.log("myID", this.id);

        this.connectToPeer(this.id);

        if (!this.originID) {
            console.log(window.location + '?id=' + this.id);
        } else {
            console.log(window.location.href);
            this.connectToPeer(this.originID);
        }
    }

    async onConnection(connection: DescConnection) {
        // Incoming connection: Leader receives connection from client
        this.peers.push(connection.getPeer());
        this.connections.push(connection);
        console.log("new connection", this.peers, this.connections.length);

        await connection.open();
        connection.messages.subscribe(this.receiveMessage.bind(this));

        if (!this.originID) {
            this.sendNewConnection(connection);
        }
    }

    async connectToPeer(id: string) {
        // Outgoing connection: Client connects to leader
        const conn: DescConnection = await this.peer.connect(id);

        this.connections.push(conn);
        this.peers.push(id);
        console.log("new connection", this.peers, this.connections.length);
        conn.messages.subscribe(this.receiveMessage.bind(this));
    }

    receiveMessage(data: DescMessage) {
        if (data.type === "new_connection") {
            this.recieveNewConnection(data as InitMessage);
        } else if(data.type === 'DescEvent') {
            this.onEventReceived(data.data);
        } else if(data.type === 'NewLeasee') {
            this.onNewLeasee(data as NewLeaseeMessage);
        }
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

    sendNewConnection(conn: DescConnection) {
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
