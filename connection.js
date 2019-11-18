"use strict";
class DescConnection {
    constructor(onEventReceived) {
        this.onEventReceived = onEventReceived;
        this.originID = '';
        this.connections = [];
        this.peers = [];
        this.eventsQueue = [];
        this.eventsExecuted = [];
        this.id = '';
        this.peer = new Peer();
        this.peer.on('open', this.onOpen.bind(this));
    }
    onOpen() {
        this.id = this.peer.id;
        let clientName = Math.floor(Math.random() * 1000);
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        this.originID = parts ? parts[1] : '';
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
            else if (data.type === 'event') {
                this.onEventReceived(data.data);
            }
        });
    }
    broadcastEvent(e) {
        for (const conn of this.connections) {
            const msg = {
                'type': 'event',
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
        conn.send(newConnectionMessage);
    }
    recieveNewConnection(data) {
        console.log("new connection message", data);
        for (let i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
    }
}
