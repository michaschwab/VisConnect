import {DescEvent} from './descvis';
import {DescNetwork, PeerjsNetwork} from "./peerjs-network";
import {DescConnection} from "./peerjs-connection";
import {StrippedEvent} from "./listener";

// This file should know all the message types and create the messages
export class DescCommunication {
    private peer: DescNetwork;
    private connections: DescConnection[] = [];
    private leaderConnection?: DescConnection;
    private peers: string[] = [];
    onConnectionCallback = () => {};
    public id = '';

    constructor(public leaderId: string,
                private onEventReceived: (e: StrippedEvent, sender: string) => void,
                private onNewLockOwner: (selector: string, owner: string) => void,
                private getPastEvents: () => DescEvent[],
                private onLockRequested: (selector: string, electionId: string, requester: string) => void,
                private receiveLockVote: (selector: string, electionId: string, requester: string, voter: string,
                                          vote: boolean) => void,
                private onOpenCallback: () => void) {
        this.peer = new PeerjsNetwork();
        this.peer.init(this.onOpen.bind(this), this.onConnection.bind(this), this.onDisconnection.bind(this));
    }

    /**
     * Requests all clients to vote to agree that this client gets the lock on the element.
     */
    requestLock(targetSelector: string) {
        const msg: LockRequestMessage = {
            type: DESC_MESSAGE_TYPE.LOCK_REQUESTED,
            electionId: String(Math.random()).substr(2),
            targetSelector,
            requester: this.id,
            sender: this.id,
        };

        for(const conn of this.connections) {
            //console.log('Requesting lock', msg);
            conn.send(msg);
        }
        this.receiveMessage(msg); // Request vote from oneself.
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
        //console.log('Sending lock vote', msg);
        if(!this.leaderConnection) {
            return console.error('Can not send lock vote because no leader connection exists.');
        }
        this.leaderConnection.send(msg);
        if(this.leaderId === this.id) {
            this.receiveLockVote(targetSelector, electionId, requester, this.id, agree);
        }
    }

    /**
     * This message is sent by the leader to inform clients that an element's lock owner has changed.
     */
    changeLockOwner(targetSelector: string, owner: string) {
        const msg: LockOwnerChangedMessage = {
            type: DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED,
            targetSelector,
            owner,
            sender: this.id,
        };

        for(const conn of this.connections) {
            conn.send(msg);
        }
        this.receiveMessage(msg); // Tell itself that the lock owner has changed.
    }

    getId() {
        return this.peer.getId();
    }

    onOpen() {
        this.id = this.getId();

        if(!this.leaderId) {
            this.leaderId = this.id;
        }

        //console.log("originID", this.leaderId);
        //console.log("myID", this.id);

        this.connectToPeer(this.id);

        if (this.leaderId && this.leaderId !== this.id) {
            this.connectToPeer(this.leaderId);
        }
        this.onOpenCallback();
        this.onConnectionCallback();
    }

    getNumberOfConnections() {
        return this.connections.length;
    }

    async onConnection(connection: DescConnection) {
        // Incoming connection: Leader or client receives connection from client.
        const peer = connection.getPeer();

        this.peers.push(peer);
        this.connections.push(connection);
        //console.log("New incoming connection", this.peers, this.connections.length);

        this.onConnectionCallback();

        if(peer === this.leaderId) {
            // This is in case this client is the leader.
            this.leaderConnection = connection;
        }

        await connection.open();
        connection.messages.subscribe(this.receiveMessage.bind(this));

        if (this.leaderId === this.id) {
            this.sendNewConnection(connection);
        }
    }

    async onDisconnection(){
        this.sendDisconnectMessage();
    }

    async connectToPeer(id: string) {
        // Outgoing connection: Client connects to leader or other client.
        const connection: DescConnection = await this.peer.connect(id);

        this.connections.push(connection);
        this.peers.push(id);
        //console.log("New outgoing connection", this.peers, this.connections.length);

        this.onConnectionCallback();

        const peer = connection.getPeer();

        if(peer === this.leaderId) {
            this.leaderConnection = connection;
        }

        connection.messages.subscribe(this.receiveMessage.bind(this));
    }

    receiveMessage(data: DescMessage) {
        if (data.type === DESC_MESSAGE_TYPE.NEW_CONNECTION) {
            this.receiveNewConnection(data as InitMessage);
        } else if(data.type === DESC_MESSAGE_TYPE.EVENT) {
            const msg = data as DescEventMessage;
            this.onEventReceived(msg.data, msg.sender);
        } else if(data.type === DESC_MESSAGE_TYPE.LOCK_REQUESTED) {
            const msg = data as LockRequestMessage;
            this.onLockRequested(msg.targetSelector, msg.electionId, msg.requester);
        } else if(data.type === DESC_MESSAGE_TYPE.LOCK_VOTE) {
            const msg = data as LockVoteMessage;
            this.receiveLockVote(msg.targetSelector, msg.electionId, msg.requester, msg.sender, msg.agree);
            //receiveLockVote(selector: string, electionId: string, requester: string, voter: string, vote: boolean)
        } else if(data.type === DESC_MESSAGE_TYPE.LOCK_OWNER_CHANGED) {
            const msg = data as LockOwnerChangedMessage;
            this.onNewLockOwner(msg.targetSelector, msg.owner);
        } else if(data.type === DESC_MESSAGE_TYPE.DISCONNECTION) {
            const msg = data as DisconnectMessage;
            this.recieveDisconnectMessage(msg);
        }
    }

    broadcastEvent(e: StrippedEvent) {
        const msg: DescEventMessage = {
            'type': DESC_MESSAGE_TYPE.EVENT,
            'sender': this.id,
            data: e,
        };
        for(const conn of this.connections) {
            conn.send(msg);
        }
        //this.receiveMessage(msg);
    }

    sendNewConnection(conn: DescConnection) {
        //console.log("Sending new connection message");
        const decoratedMessage: InitMessage = {
            'type': DESC_MESSAGE_TYPE.NEW_CONNECTION,
            'sender': this.id,
            'peers': this.peers as string[],
            'eventsLedger': this.getPastEvents(),
        };

        conn.send(decoratedMessage);
    }

    receiveNewConnection(data: InitMessage) {
        //console.log("New connection message", data);
        for (let i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }

        for (let i = 0; i < data.eventsLedger.length; i++){
            this.onEventReceived(data.eventsLedger[i].event, data.sender);
        }
    }
    
    sendDisconnectMessage() {
        const decoratedMessage: DisconnectMessage = {
            'type': DESC_MESSAGE_TYPE.DISCONNECTION,
            'sender': this.id
        };

        for(const conn of this.connections) {
            conn.send(decoratedMessage);
        }
    }

    recieveDisconnectMessage(msg: DisconnectMessage){
        console.log("Peer", msg.sender, "is disconnecting");

        for(const conn of this.connections) {
            //console.log('Requesting lock', msg);
            if (conn.getPeer() === msg.sender){
                console.log("Removing peer and connection");
                this.peers.splice(this.peers.indexOf(msg.sender), 1);
                this.connections.splice(this.connections.indexOf(conn),1);
            }   
        }
        this.onConnectionCallback();
    }
}

export enum DESC_MESSAGE_TYPE {
    NEW_CONNECTION,
    EVENT,
    LOCK_REQUESTED,
    LOCK_VOTE,
    LOCK_OWNER_CHANGED,
    DISCONNECTION
}

export interface DescMessage {
    peers?: string[],
    type: DESC_MESSAGE_TYPE,
    sender: string,
    data?: any,
}

export interface DescEventMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.EVENT,
    data: StrippedEvent
}

export interface InitMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.NEW_CONNECTION,
    peers: string[],
    eventsLedger: DescEvent[]
}

export interface DisconnectMessage extends DescMessage {
    type: DESC_MESSAGE_TYPE.DISCONNECTION,
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
