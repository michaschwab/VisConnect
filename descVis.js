function descVis() {
  let peer = new Peer();
  let connections = [];
  let peers = [];
  let eventsQueue = [];
  let eventsExecuted = [];
  peer.on('open', function () {
    let id = peer.id;
    let clientName = Math.floor(Math.random() * 1000);
    let originID
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
      originID = value;
    });

    console.log("originID", originID);
    console.log("myID", id);

    connectToPeer(id);

    if (originID == undefined) {
      console.log(window.location + '?id=' + id);
    } else {
      console.log(window.location.href);
      connectToPeer(originID);
    }
    

    peer.on('connection', function (conn) {
      peers.push(conn.peer);
      connections.push(conn);
      console.log("new connection", peers, connections.length);
      conn.on('open', function () {
        recieveMessage(conn);
        if (originID == undefined) {
          sendNewConnection(conn);
        }
      });
    });
  });

  function connectToPeer(id) {
    var conn = peer.connect(id);
    conn.on('open', function () {
      connections.push(conn);
      peers.push(id);
      console.log("new connection", peers, connections.length);
      recieveMessage(conn);
    });
    return conn;
  }

  function recieveMessage(conn) {
    conn.on('data', function (data) {
      if (data.type == "new_connection") {
        recieveNewConnection(data);
      }
    });
  }

  function sendNewConnection(conn, id) {
    console.log("sending new connection message")
    newConnectionMessage = {
      'type': 'new_connection',
      'sender': id,
      'peers': peers
    }
    conn.send(newConnectionMessage);
  }

  function recieveNewConnection(data) {
    console.log("new connection message", data);
    for (let i = 0; i < data.peers.length; i++) {
      if (peers.indexOf(data.peers[i]) < 0) {
        console.log("connecting to new peer", data.peers[i])
        connectToPeer(data.peers[i]);
      }
    }
  }

}
