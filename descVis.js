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

    console.log(originID)

    connectToPeer(id);

    if (originID == undefined) {
      console.log(window.location + '?id=' + id);
    } else {
      console.log(window.location.href);
      connectToPeer(originID);
    }

    //connectToPeer(id);

    peer.on('connection', function (conn) {
      console.log("new connection")
      peers.push(conn.peer);
      connections.push(conn);
      conn.on('open', function () {
        conn.on('data', function (data) {
          console.log('Received', data);
        });
        conn.send("Hello");
        conn.send(peers);
      });
    });





  });

  function connectToPeer(id) {
    var conn = peer.connect(id, [metadata={'peers':id}]);
    conn.on('open', function () {
      conn.on('data', function (data) {
        console.log('Received', data);
      });
      conn.send('Hi!');
    });
    return conn;
  }

}
