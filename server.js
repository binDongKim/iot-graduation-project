/*
  Customer WorkFlow
  0. 해당 웹페이지(소비자화면)는 이미 떠있는 상태(예시화면 필요)
  1. Net module를 통해 아두이노에서 data를 받음
  2. 'data' 이벤트의 Callback으로 io.emit('product-moved')실행 - 콜백으로 data(json형태)보냄
  3. Client단에서 socket.on('product-moved')을 받아서 넘어온 json데이터를 웹페이지에서 세팅
*/
/*
  Manager WorkFlow
  0. 상품 리스트를 socket이벤트에 데이터로 보내줌
  1. 이벤트 'product-moved'에 따라 해당상품의 진열숫자가 변함
*/

var express = require('express');
var app = express();
var bodyParser   = require('body-parser'); // POST요청 데이터를 추출하는 미들웨어. request객체에 body 속성을 부여
var http = require('http').Server(app);
var io = require('socket.io')(http);
var net = require('net');
var mysql = require('promise-mysql');

// DB connection open //
var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'graduation_project'
});

var products = new Object(); // product들을 담을 Object

function getProducts() {
  return new Promise(function(resolve, reject) {
    var columns = ['id', 'name', 'brand', 'image', 'price', 'amount', 'nutrients', 'countset'];
    pool.query('SELECT ?? FROM Product', [columns]).then(function(results) {
      resolve(results);
    });
  });
}
getProducts().then(function(results) {
  results.forEach(function(result) {
    var product = new Object();
    product.id = result.id;
    product.name = result.name;
    product.brand = result.brand;
    product.image = result.image;
    product.price = result.price;
    product.amount = result.amount;
    product.nutrients = result.nutrients;
    product.countSet = result.countset;
    product.count = 0;
    product.pickedUp = false;
    products[result.id] = product;
  });
}, function(err) {
  console.log('Error: ' + err);
});

// Net module을 통한 서버 instance생성
var netServer = net.createServer(function(netSocket) {
  // client(아두이노)로부터 data이벤트 발생시
  netSocket.on('data', function(data) {
    console.log('data:' + data);
    // 아두이노에서 오는 data 형식: id_갯수_X/O(X:올릴때, O:내릴때) ex: 0_1_O
    var strData = data.toString().split('_'); // strData[0]: productId, strData[1]: productCount, strData[2]: didPickup or not
    var productId = strData[0];
    var productCount = strData[1];

    products[productId].pickedUp = strData[2].charAt(0) == 'O' ? true : false;
    products[productId].count = productCount;
    io.emit('product-moved', products[productId]); // 진열대(센서) 위의 상품이 움직임(소비자가 집어들었거나/올려놨거나)
  });
  // client와 접속이 끊기는 메시지 출력
  netSocket.on('close', function() {
    console.log('client disconnted.');
  });
});

// 에러가 발생할 경우 화면에 에러메시지 출력
netServer.on('error', function(err) {
  console.log('err'+ err  );
});

netServer.listen(5000, function() {
  console.log('linsteing on 5000...');
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/customer', function(req, res) {
  res.sendFile(__dirname + '/public/html/customer.html');
});
app.get('/manager', function(req, res) {
  res.sendFile(__dirname + '/public/html/manager.html');
  io.on('connection', function(socket) {
    socket.emit('product-info', products);
  });
});
app.post('/productMoved', function(req, res) {
  console.log(req.body);
  var strData = req.body.data.split('_'); // strData[0]: productId, strData[1]: productCount, strData[2]: didPickup or not
  var productId = strData[0];
  var productCount = strData[1];

  products[productId].pickedUp = strData[2].charAt(0) == 'O' ? true : false;
  products[productId].count = productCount;
  io.emit('product-moved', products[productId]); // 진열대(센서) 위의 상품이 움직임(소비자가 집어들었거나/올려놨거나)
  res.send('Ok');
});

http.listen(3000, function() {
  console.log('listening on 3000...');
});
