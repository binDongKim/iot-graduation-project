/*
  WorkFlow
  0. 해당 웹페이지(소비자화면)는 이미 떠있는 상태(예시화면 필요)
  1. Net module를 통해 아두이노에서 data를 받음
  2. 'data' 이벤트의 Callback으로 io.emit('data-received')실행 - 콜백으로 data(json형태)보냄
  3. Client단에서 socket.on('data-received')을 받아서 넘어온 json데이터를 웹페이지에서 세팅
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
  map 구현하기
  1. Empty Map
  2. 아두이노에서 가져온 id로 map을 먼저 조회
  i) map에 데이터가 존재 -> 그 데이터사용
  ii) 존재x -> DB에서 가져오고 map에도 채움
  3. DB업데이트시 Map도 업데이트
*/

var productMap = new Map(); // DB에서 가져올 Product정보들을 담기위한 Map

// Net module을 통한 서버 instance생성
var netServer = net.createServer(function(netSocket) {
  // client(아두이노)로부터 data이벤트 발생시
  // 아두이노 와이파이 접속시 상품 초기갯수부터 넘어오도록 되어있음(data: 0_2_X)
  netSocket.on('data', function(data) {
    console.log('data:' + data);
    // 아두이노에서 오는 data 형식: id_갯수_X/O(X:올릴때, O:내릴때) ex: 0_1_O
    var strData = data.toString().split("_"); // strData[0]: productId, strData[1]: productCount, strData[2]: didPickup or not
    var productId = strData[0];
    var productCount = strData[1];
    var didPickup = strData[2].charAt(0) == "O" ? true : false;

    pool.query('UPDATE Product SET count = ? WHERE id = ?', [productCount,productId]).then(function(changedRows) {
      console.log("ProductId: " + productId + "가 Update됨");
      io.on('connection', function(socketIo) {
        socketIo.emit('productCount-updated', productCount);
      });
    }, function(err) {
      console.log("Error: " + err);
    });

    // 소비자가 물건을 집어들었을때만
    if(didPickup) {
      var columns = ['id', 'name', 'brand', 'image'];
      Promise.resolve(productMap.get(productId))
      .then(function(result) {
        if(result === undefined) {
          return pool.query('SELECT ?? FROM Product WHERE id = ?', [columns, productId]).then(function(result) {
            return Promise.resolve(result[0]);
          });
        }
        else {
          return Promise.resolve(result);
        }
      })
      .then(function(result) {
        productMap.set(productId, result);
        io.emit('data-received', productMap.get(productId));
      }, function(err) {
        console.log('Error: ' + err);
      })
      .catch(function(err) {
        console.log('Caught Error: ' + err);
      });
    }
  });
  // client와 접속이 끊기는 메시지 출력
  netSocket.on('close', function() {
    console.log('client disconnted.');
  });
  // client가 접속하면 화면에 출력해주는 메시지(클라이언트에게 보여지는 메시지)
  // socket.write('welcome to server');
});

// 에러가 발생할 경우 화면에 에러메시지 출력
netServer.on('error', function(err) {
  console.log('err'+ err  );
});

netServer.listen(5000, function() {
  console.log('linsteing on 5000...');
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/html/customer.html');
});

http.listen(3000, function() {
  console.log('listening on 3000...');
});
