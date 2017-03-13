var socket = io.connect('http://localhost:3000');
socket.on('data-received', function(data) {
  console.log('data: ' + data.name + ", " + data.brand);
});
