/*
  Customer WorkFlow
  0. 해당 웹페이지(소비자화면)는 이미 떠있는 상태(예시화면 필요)
  1. Net module를 통해 아두이노에서 data를 받음
  2. 'data' 이벤트의 Callback으로 io.emit('data-received')실행 - 콜백으로 data(json형태)보냄
  3. Client단에서 socket.on('data-received')을 받아서 넘어온 json데이터를 웹페이지에서 세팅

  Manager WorkFlow
*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var net = require('net');
var mysql = require("promise-mysql");

// DB connection open //
var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "graduation_project"
});

/*
  1. DB에서 미리 데이터를 가져와서 Map에 세팅한다.
  2. Browser와의 데이터교환은 productObj을 통해서만 한다.
*/
var productMap = new Map(); // DB에서 가져올 Product정보들을 담기위한 Map
var productObj = new Object(); // Client로 Product정보를 담아보낼 Object

function getProducts() {
  return new Promise(function(resolve, reject) {
    var columns = ['id', 'name', 'brand', 'image'];
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
    product.count = 0;
    productMap.set(result.id, product);
  });
}, function(err) {
  console.log('Error: ' + err);
}).then(function() {
  mapIntoObject(productMap);
});

function mapIntoObject(map) {
  Array.from(map.keys()).forEach(function(key) {
   productObj[key] = map.get(key);
  });
}

// Net module을 통한 서버 instance생성
var netServer = net.createServer(function(netSocket) {
  // client(아두이노)로부터 data이벤트 발생시
  netSocket.on('data', function(data) {
    console.log('data:' + data);
    // 아두이노에서 오는 data 형식: id_갯수_X/O(X:올릴때, O:내릴때) ex: 0_1_O
    var strData = data.toString().split("_"); // strData[0]: productId, strData[1]: productCount, strData[2]: didPickup or not
    var productId = strData[0];
    var productCount = strData[1];
    var didPickup = strData[2].charAt(0) == "O" ? true : false;

    productMap.get(productId).count = productCount;
    io.emit('productCount-updated', productCount); // 진열대위의 상품갯수를 전달

    // 소비자가 물건을 집어들었을때만
    if(didPickup) {
      io.emit('data-received', productObj[productId]); // 소비자가 집어든 상품정보를 전달
    }
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

app.get('/customer', function(req, res) {
  res.sendFile(__dirname + '/public/html/customer.html');
});
app.get('/manager', function(req, res) {
  res.sendFile(__dirname + '/public/html/manager.html');
  io.on('connection', function(socket) {
    socket.emit('product-info', productObj);
  });
});

http.listen(3000, function() {
  console.log('listening on 3000...');
});
