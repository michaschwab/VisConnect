import {DescEvent} from './descvis';
import {DescNetwork, PeerjsNetwork} from "./peerjs-network";
import {DescConnection} from "./peerjs-connection";
import {StrippedEvent} from "./listener";

export enum DESC_MESSAGE_TYPE {
    NEW_CONNECTION,
    EVENT,
    LOCK_REQUESTED,
    LOCK_VOTE,
    LOCK_OWNER_CHANGED,
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
    electionId: string,
    targetSelector: string,
    requester: string,
}

export interface LockVoteMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.LOCK_VOTE,
    electionId: string,
    targetSelector: string,
    requester: string,
    agree: boolean
}

export interface LockOwnerChangedMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED,
    targetSelector: string,
    owner: string,
}

// This file should know all the message types and create the messages
export class DescCommunication {
    private peer: DescNetwork;
    private connections: DescConnection[] = [];
    private leaderConnection?: DescConnection;
    private peers: string[] = [];
    public id = '';

    constructor(private leaderId: string,
                private onEventReceived: (e: StrippedEvent) => void,
                private onNewLockOwner: (selector: string, owner: string) => void,
                private getPastEvents: () => DescEvent[],
                private onOpenCallback: () => void = () => {}) {
        this.peer = new PeerjsNetwork();
        this.peer.init(this.onOpen.bind(this), this.onConnection.bind(this));
    }

    /**
     * Requests all clients to vote to agree that this client gets the lock on the element.
     */
    requestLock(targetSelector: string) {
        for(const conn of this.connections) {
            const msg: LockRequestMessage = {
                type: DESC_MESSAGE_TYPE.LOCK_REQUESTED,
                electionId: String(Math.random()).substr(2),
                targetSelector,
                requester: this.id,
                sender: this.id,
            };

            conn.send(msg);
        }
    }

    /**
     * Sends a vote to the leader indicating whether the client agrees to give a requesting client a lock.
     */
    sendLockVote(targetSelector: string, electionId: string, requester: string, agree: boolean) {
        const msg: LockVoteMessage = {
            type: DESC_MESSAGE_TYPE.LOCK_VOTE,
            electionId,
            sender: this.id,
            targetSelector,
            requester,
            agree
        };
        if(!this.leaderConnection) {
            return console.error('Can not send lock vote because no leader connection exists.');
        }
        this.leaderConnection.send(msg);
    }

    changeLockOwner(targetSelector: string, owner: string) {
        for(const conn of this.connections) {
            const msg: LockOwnerChangedMessage = {
                type: DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED,
                targetSelector,
                owner,
                sender: this.id,
            };

            conn.send(msg);
        }
    }

    getId() {
        return this.peer.getId();
    }

    onOpen() {
        this.id = this.getId();

        console.log("originID", this.leaderId);
        console.log("myID", this.id);

        this.connectToPeer(this.id);

        if (this.leaderId) {
            this.connectToPeer(this.leaderId);
        }
        this.onOpenCallback();
    }

    getNumberOfConnections() {
        return this.connections.length;
    }

    async onConnection(connection: DescConnection) {
        // Incoming connection: Leader or client receives connection from client.
        const peer = connection.getPeer();

        this.peers.push(peer);
        this.connections.push(connection);
        console.log("new connection", this.peers, this.connections.length);

        if(peer === this.leaderId) {
            this.leaderConnection = connection;
        }

        await connection.open();
        connection.messages.subscribe(this.receiveMessage.bind(this));

        if (!this.leaderId) {
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
        } else if(data.type === DESC_MESSAGE_TYPE.LOCK_REQUESTED) {

        } else if(data.type === DESC_MESSAGE_TYPE.LOCK_VOTE) {

        } else if(data.type === DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED) {
            const msg = data as LockOwnerChangedMessage;
            this.onNewLockOwner(msg.targetSelector, msg.owner);
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
            this.onEventReceived(data.eventsLedger[i].event);
        }
    }
}
