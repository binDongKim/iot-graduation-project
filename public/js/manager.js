var socket = io.connect('http://localhost:3000');
socket.on('productCount-updated', function(productCount) {
  console.log('productCount: ' + productCount);
});
