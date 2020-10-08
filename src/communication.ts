import {VcEvent} from './visconnect';
import {VcNetwork, PeerjsNetwork} from './peerjs-network';
import {VcConnection} from './peerjs-connection';

// This file should know all the message types and create the messages
export interface VcCommunicationI {
    id: string;
    getId: () => string;
    broadcastEvent: (e: VcEvent) => void;
    requestLock: (selector: string) => boolean;
    changeLockOwner: (selector: string, owner: string, seqNum: number) => void;
    getNumberOfConnections: () => number;
    leaderId: string;
    onConnectionCallback: () => void;
    init: () => void;
}

export interface VcCommunicationConstructorData {
    leaderId: string;
    ownId: string;
    onEventReceived: (e: VcEvent[], sender: string, catchup?: boolean) => void;
    onNewLockOwner: (selector: string, owner: string, seqNum: number) => void;
    getPastEvents: () => VcEvent[];
    onLockRequested: (selector: string, requester: string) => void;
    onOpenCallback: () => void;
}

export interface VcCommunicationConstructor {
    new (data: VcCommunicationConstructorData): VcCommunicationI;
}

export class VcCommunication implements VcCommunicationI {
    private peer: VcNetwork;
    private connections: VcConnection[] = [];
    private leaderConnection?: VcConnection;
    private peers: string[] = [];
    onConnectionCallback = () => {};
    public id = '';

    private eventsMsg?: VcEventsMessage;
    private lastEventsMessageTime = -1;
    private throttleTimeout = -1;

    public leaderId: string;
    private readonly onEventReceived: (e: VcEvent[], sender: string, catchup?: boolean) => void;
    private readonly onNewLockOwner: (selector: string, owner: string, seqNum: number) => void;
    private readonly getPastEvents: () => VcEvent[];
    private readonly onLockRequested: (selector: string, requester: string) => void;
    private readonly onOpenCallback: () => void;

    constructor(data: VcCommunicationConstructorData) {
        this.leaderId = data.leaderId;
        this.id = data.ownId;
        this.onEventReceived = data.onEventReceived;
        this.onNewLockOwner = data.onNewLockOwner;
        this.getPastEvents = data.getPastEvents;
        this.onLockRequested = data.onLockRequested;
        this.onOpenCallback = data.onOpenCallback;

        this.peer = new PeerjsNetwork();
    }

    init() {
        this.peer.init(
            this.id,
            this.onOpen.bind(this),
            this.onConnection.bind(this),
            this.onDisconnection.bind(this)
        );
    }

    /**
     * Requests all clients to vote to agree that this client gets the lock on the element.
     */
    requestLock(targetSelector: string) {
        if (!this.id) {
            return false;
        }
        if (!this.leaderConnection && this.id !== this.leaderId) {
            return false;
        }

        const msg: LockRequestMessage = {
            type: VC_MESSAGE_TYPE.LOCK_REQUESTED,
            targetSelector,
            requester: this.id,
            sender: this.id,
        };

        if (this.id === this.leaderId) {
            // Ask itself, the leader, for permission.
            this.receiveMessage(msg);
        } else {
            // Ask the leader for permission.
            this.leaderConnection!.send(msg);
        }
        return true;
    }

    /**
     * This message is sent by the leader to inform clients that an element's lock owner has changed.
     */
    changeLockOwner(targetSelector: string, owner: string, seqNum: number) {
        const msg: LockOwnerChangedMessage = {
            type: VC_MESSAGE_TYPE.LOCK_OWNER_CHANGED,
            targetSelector,
            owner,
            sender: this.id,
            seqNum,
        };

        for (const conn of this.connections) {
            conn.send(msg);
        }
        this.receiveMessage(msg); // Tell itself that the lock owner has changed.
    }

    getId() {
        return this.peer.getId();
    }

    onOpen() {
        this.id = this.getId();

        if (!this.leaderId) {
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

    async onConnection(connection: VcConnection) {
        // Incoming connection: Leader or client receives connection from client.
        const peer = connection.getPeer();

        this.peers.push(peer);
        this.connections.push(connection);
        //console.log("New incoming connection", this.peers, this.connections.length);

        this.onConnectionCallback();

        if (peer === this.leaderId) {
            // This is in case this client is the leader.
            this.leaderConnection = connection;
        }

        await connection.open();
        connection.messages.subscribe(this.receiveMessage.bind(this));

        if (this.leaderId === this.id) {
            this.sendNewConnection(connection);
        }
    }

    async onDisconnection() {
        this.sendDisconnectMessage();
    }

    async connectToPeer(id: string) {
        // Outgoing connection: Client connects to leader or other client.
        const connection: VcConnection = await this.peer.connect(id);

        this.connections.push(connection);
        this.peers.push(id);
        //console.log("New outgoing connection", this.peers, this.connections.length);

        this.onConnectionCallback();

        const peer = connection.getPeer();

        if (peer === this.leaderId) {
            this.leaderConnection = connection;
        }

        connection.messages.subscribe(this.receiveMessage.bind(this));
    }

    receiveMessage(data: VcMessage) {
        if (data.type === VC_MESSAGE_TYPE.NEW_CONNECTION) {
            this.receiveNewConnection(data as InitMessage);
        } else if (data.type === VC_MESSAGE_TYPE.EVENT) {
            const msg = data as VcEventsMessage;
            this.onEventReceived(msg.data, msg.sender);
        } else if (data.type === VC_MESSAGE_TYPE.LOCK_REQUESTED) {
            const msg = data as LockRequestMessage;
            this.onLockRequested(msg.targetSelector, msg.requester);
        } else if (data.type === VC_MESSAGE_TYPE.LOCK_OWNER_CHANGED) {
            const msg = data as LockOwnerChangedMessage;
            this.onNewLockOwner(msg.targetSelector, msg.owner, msg.seqNum);
        } else if (data.type === VC_MESSAGE_TYPE.DISCONNECTION) {
            const msg = data as DisconnectMessage;
            this.recieveDisconnectMessage(msg);
        }
    }

    broadcastEvent(e: VcEvent) {
        if (!this.eventsMsg) {
            this.eventsMsg = {
                type: VC_MESSAGE_TYPE.EVENT,
                sender: this.id,
                data: [],
            };
        }
        this.eventsMsg.data.push(e);

        this.throttledSendEvents();
    }

    throttledSendEvents() {
        if (!this.eventsMsg) {
            return;
        }

        const onSend = () => {
            if (!this.eventsMsg) {
                return;
            }
            for (const conn of this.connections) {
                conn.send(this.eventsMsg);
            }
            this.lastEventsMessageTime = Date.now();
            this.eventsMsg = undefined;
            this.throttleTimeout = -1;
        };

        window.requestAnimationFrame(onSend);
    }

    sendNewConnection(conn: VcConnection) {
        //console.log("Sending new connection message");
        const decoratedMessage: InitMessage = {
            type: VC_MESSAGE_TYPE.NEW_CONNECTION,
            sender: this.id,
            peers: this.peers as string[],
            eventsLedger: this.getPastEvents(),
        };

        conn.send(decoratedMessage);
    }

    receiveNewConnection(data: InitMessage) {
        //console.log("New connection message", data);
        for (let i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log('connecting to new peer', data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }

        this.onEventReceived(data.eventsLedger, data.sender, true);
    }

    sendDisconnectMessage() {
        const decoratedMessage: DisconnectMessage = {
            type: VC_MESSAGE_TYPE.DISCONNECTION,
            sender: this.id,
        };

        for (const conn of this.connections) {
            conn.send(decoratedMessage);
        }
    }

    recieveDisconnectMessage(msg: DisconnectMessage) {
        console.log('Peer', msg.sender, 'is disconnecting');

        for (const conn of this.connections) {
            //console.log('Requesting lock', msg);
            if (conn.getPeer() === msg.sender) {
                console.log('Removing peer and connection');
                this.peers.splice(this.peers.indexOf(msg.sender), 1);
                this.connections.splice(this.connections.indexOf(conn), 1);
            }
        }
        this.onConnectionCallback();
    }
}

export enum VC_MESSAGE_TYPE {
    NEW_CONNECTION,
    EVENT,
    LOCK_REQUESTED,
    LOCK_VOTE,
    LOCK_OWNER_CHANGED,
    DISCONNECTION,
}

export interface VcMessage {
    peers?: string[];
    type: VC_MESSAGE_TYPE;
    sender: string;
    data?: any;
}

export interface VcEventsMessage extends VcMessage {
    type: VC_MESSAGE_TYPE.EVENT;
    data: VcEvent[];
}

export interface InitMessage extends VcMessage {
    type: VC_MESSAGE_TYPE.NEW_CONNECTION;
    peers: string[];
    eventsLedger: VcEvent[];
}

export interface DisconnectMessage extends VcMessage {
    type: VC_MESSAGE_TYPE.DISCONNECTION;
}

export interface LockRequestMessage extends VcMessage {
    type: VC_MESSAGE_TYPE.LOCK_REQUESTED;
    targetSelector: string;
    requester: string;
}

export interface LockOwnerChangedMessage extends VcMessage {
    type: VC_MESSAGE_TYPE.LOCK_OWNER_CHANGED;
    targetSelector: string;
    owner: string;
    seqNum: number;
}
