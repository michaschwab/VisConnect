"use strict";
class DescNetwork {
    constructor(onEventReceived, onNewConnection, onNewLeasee) {
        this.onEventReceived = onEventReceived;
        this.onNewConnection = onNewConnection;
        this.onNewLeasee = onNewLeasee;
        this.originID = '';
        this.connections = [];
        this.peers = [];
        this.eventsQueue = [];
        this.id = '';
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        this.originID = parts ? parts[1] : '';
        this.peer = this.originID ? new Peer() : new Peer('test');
        this.peer.on('open', this.onOpen.bind(this));
        if (this.peer.id) {
            this.onOpen(); // In case it was done too fast.
        }
    }
    setLeasee(targetSelector, leasee) {
        for (const conn of this.connections) {
            const msg = {
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
        }
        else {
            console.log(window.location.href);
            this.connectToPeer(this.originID);
        }
        this.peer.on('connection', this.onConnection.bind(this));
    }
    onConnection(connection) {
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
    connectToPeer(id) {
        const conn = this.peer.connect(id);
        conn.on('open', () => {
            this.connections.push(conn);
            this.peers.push(id);
            console.log("new connection", this.peers, this.connections.length);
            this.recieveMessage(conn);
        });
        return conn;
    }
    recieveMessage(conn) {
        conn.on('data', (data) => {
            if (data.type === "new_connection") {
                this.recieveNewConnection(data);
            }
            else if (data.type === 'DescEvent') {
                this.onEventReceived(data.data);
            }
            else if (data.type === 'NewLeasee') {
                this.onNewLeasee(data);
            }
        });
    }
    broadcastEvent(e) {
        for (const conn of this.connections) {
            const msg = {
                'type': 'DescEvent',
                'sender': this.id,
                data: e,
            };
            conn.send(msg);
        }
    }
    sendNewConnection(conn) {
        console.log("sending new connection message");
        const newConnectionMessage = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
        };
        const decoratedMessage = this.onNewConnection(newConnectionMessage);
        conn.send(decoratedMessage);
    }
    recieveNewConnection(data) {
        console.log("new connection message", data);
        for (let i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
        for (let i = 0; i < data.eventsLedger.length; i++) {
            this.onEventReceived(data.eventsLedger[i]);
        }
    }
}
