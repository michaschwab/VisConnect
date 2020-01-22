import {DescEvent} from './descvis';
import {DescNetwork, PeerjsNetwork} from "./peerjs-network";
import {DescConnection} from "./peerjs-connection";

export enum DESC_MESSAGE_TYPE {
    NEW_CONNECTION,
    EVENT,
    LOCK_REQUESTED,
    LOCK_VOTE
}

export interface DescMessage {
    peers?: string[],
    type: DESC_MESSAGE_TYPE,
    sender: string,
    data?: any,
}

export interface InitMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.NEW_CONNECTION,
    peers: string[], 
    eventsLedger: DescEvent[]
}

export interface LockRequestMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.LOCK_REQUESTED,
    targetSelector: string,
    owner: string,
}

export interface LockVoteMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.LOCK_VOTE,
    targetSelector: string,
    owner: string,
}

// this file should know all the message types and create the messages
export class DescCommunication {
    private peer: DescNetwork;
    private connections: DescConnection[] = [];
    private peers: string[] = [];
    public id = '';

    constructor(private originID: string,
                private onEventReceived: (e: DescEvent) => void,
                private onNewLeasee: (msg: NewLeaseeMessage) => void,
                private getPastEvents: () => DescEvent[],
                private onOpenCallback: () => void) {
        this.peer = new PeerjsNetwork();
        this.peer.init(this.onOpen.bind(this), this.onConnection.bind(this));
    }

    requestLock(targetSelector: string) {
        for(const conn of this.connections) {
            const msg: LockRequestMessage = {
                type: DESC_MESSAGE_TYPE.LOCK_REQUESTED,
                targetSelector,
                owner: this.id,
                sender: this.id,
            };

            conn.send(msg);
        }
    }
/*
    setLeasee(targetSelector: string, leasee: string) {
        for(const conn of this.connections) {
            const msg: NewLeaseeMessage = {
                type: DESC_MESSAGE_TYPE.NEW_LEASEE,
                targetSelector,
                leasee,
                sender: this.id,
            };

            conn.send(msg);
        }
    }*/

    getId() {
        return this.peer.getId();
    }

    onOpen() {
        this.id = this.getId();

        console.log("originID", this.originID);
        console.log("myID", this.id);

        this.connectToPeer(this.id);

        if (this.originID) {
            this.connectToPeer(this.originID);
        }
        this.onOpenCallback();
    }

    async onConnection(connection: DescConnection) {
        // Incoming connection: Leader or client receives connection from client.
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
        // Outgoing connection: Client connects to leader or other client.
        const conn: DescConnection = await this.peer.connect(id);

        this.connections.push(conn);
        this.peers.push(id);
        console.log("new connection", this.peers, this.connections.length);
        conn.messages.subscribe(this.receiveMessage.bind(this));
    }

    receiveMessage(data: DescMessage) {
        if (data.type === DESC_MESSAGE_TYPE.NEW_CONNECTION) {
            this.receiveNewConnection(data as InitMessage);
        } else if(data.type === DESC_MESSAGE_TYPE.EVENT) {
            this.onEventReceived(data.data);
        } else if(data.type === DESC_MESSAGE_TYPE.NEW_LEASEE) {
            this.onNewLeasee(data as NewLeaseeMessage);
        }
    }

    broadcastEvent(e: DescEvent) {
        for(const conn of this.connections) {
            const msg: DescMessage = {
                'type': DESC_MESSAGE_TYPE.EVENT,
                'sender': this.id,
                data: e,
            };

            conn.send(msg);
        }
    }

    sendNewConnection(conn: DescConnection) {
        console.log("sending new connection message");
        const decoratedMessage: InitMessage = {
            'type': DESC_MESSAGE_TYPE.NEW_CONNECTION,
            'sender': this.id,
            'peers': this.peers as string[],
            'eventsLedger': this.getPastEvents(),
        };

        conn.send(decoratedMessage);
    }

    receiveNewConnection(data: InitMessage) {
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
