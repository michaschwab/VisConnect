"use strict";
var DescConnection = /** @class */ (function () {
    function DescConnection() {
        this.originID = '';
        this.connections = [];
        this.peers = [];
        this.eventsQueue = [];
        this.eventsExecuted = [];
        this.id = '';
        this.peer = new Peer();
        this.peer.on('open', this.onOpen.bind(this));
    }
    DescConnection.prototype.onOpen = function () {
        this.id = this.peer.id;
        var clientName = Math.floor(Math.random() * 1000);
        //
        var parts = window.location.href.match(/\?id=([a-z0-9]+)/);
        console.log(parts);
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
    };
    DescConnection.prototype.onConnection = function (connection) {
        var _this = this;
        this.peers.push(connection.peer);
        this.connections.push(connection);
        console.log("new connection", this.peers, this.connections.length);
        connection.on('open', function () {
            _this.recieveMessage(connection);
            if (!_this.originID) {
                _this.sendNewConnection(connection);
            }
        });
    };
    DescConnection.prototype.connectToPeer = function (id) {
        var _this = this;
        var conn = this.peer.connect(id);
        conn.on('open', function () {
            _this.connections.push(conn);
            _this.peers.push(id);
            console.log("new connection", _this.peers, _this.connections.length);
            _this.recieveMessage(conn);
        });
        return conn;
    };
    DescConnection.prototype.recieveMessage = function (conn) {
        var _this = this;
        conn.on('data', function (data) {
            if (data.type == "new_connection") {
                _this.recieveNewConnection(data);
            }
        });
    };
    DescConnection.prototype.sendNewConnection = function (conn) {
        console.log("sending new connection message");
        var newConnectionMessage = {
            'type': 'new_connection',
            'sender': this.id,
            'peers': this.peers,
        };
        conn.send(newConnectionMessage);
    };
    DescConnection.prototype.recieveNewConnection = function (data) {
        console.log("new connection message", data);
        for (var i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
    };
    return DescConnection;
}());
