function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}


var peer = new Peer();
var ID = '';
peer.on('open', function (id) {
  console.log('My peer ID is: ' + id);
  console.log(window.location.href + '?id=' + id);
});


peer.on('connection', function(conn) { 
conn.on('open', function() {
  // Receive messages
  conn.on('data', function(data) {
    console.log('Received', data);
  });

  // Send messages
  conn.send('Hello!');
});

});

var urlVars = getUrlVars();
console.log(urlVars["id"])
if ( urlVars["id"] != undefined){
  console.log('connecting')
  var conn = peer.connect(urlVars["id"]);
  conn.on('open', function () {
    // Receive messages
    conn.on('data', function (data) {
      console.log('Received', data);
    });

    // Send messages
    conn.send('Hello!');
  });
}
