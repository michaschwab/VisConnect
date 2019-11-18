declare var Peer: any;

interface Connection {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string,
    send: (msg: {}) => void;
}

interface Message {
    peers: string[],
    type: string,
    sender: string,
}

class DescConnection {
    private peer: any;
    private originID = '';
    private connections: Connection[] = [];
    private peers: string[] = [];
    private eventsQueue = [];
    private eventsExecuted = [];
    private id = '';

    constructor() {
        this.peer = new Peer();
        this.peer.on('open', this.onOpen.bind(this));
    }

    onOpen() {
        this.id = this.peer.id;
        let clientName = Math.floor(Math.random() * 1000);
//
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        console.log(parts);
        this.originID = parts ? parts[1] : '';

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
        conn.on('data', (data) => {
            if (data.type == "new_connection") {
                this.recieveNewConnection(data);
            }
        });
    }

    sendNewConnection(conn: Connection) {
        console.log("sending new connection message");
        const newConnectionMessage: Message = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
        };
        conn.send(newConnectionMessage);
    }

    recieveNewConnection(data: Message) {
        console.log("new connection message", data);
        for (let i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
    }
}
