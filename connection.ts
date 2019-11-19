declare var Peer: any;

interface Connection {
    on: (id: string, callback: (data: any) => void) => void;
    peer: string,
    send: (msg: {}) => void;
}

interface Message {
    peers?: string[],
    type: "new_connection" | "event",
    sender: string,
    data?: any,
}
interface InitMessage extends Message{
    type: "new_connection",
    peers: string[], 
    eventsLedger: event[]
}

class DescConnection {
    private peer: any;
    private originID = '';
    private connections: Connection[] = [];
    private peers: string[] = [];
    private eventsQueue = [];
    public eventsLedger: event[] = [];
    public id = '';

    constructor(private onEventReceived: (e: event) => void) {
        let parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        this.originID = parts ? parts[1] : '';

        this.peer = this.originID ? new Peer() : new Peer('test');
        this.peer.on('open', this.onOpen.bind(this));
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
        conn.on('data', (data: Message) => {
            if (data.type === "new_connection") {
                this.recieveNewConnection(data as InitMessage);
            } else if(data.type === 'event') {
                this.onEventReceived(data.data);
            }
        });
    }

    broadcastEvent(e: event) {
        for(const conn of this.connections) {
            const msg: Message = {
                'type': 'event',
                'sender': this.id,
                data: e,
            };

            conn.send(msg);
        }
    }

    sendNewConnection(conn: Connection) {
        console.log("sending new connection message");
        const newConnectionMessage: InitMessage = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
            'eventsLedger': this.eventsLedger
        };
        conn.send(newConnectionMessage);
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
