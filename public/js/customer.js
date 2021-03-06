var socket = io.connect('http://localhost:3000');
var productId = null;
socket.on('product-moved', function(product) {
  if(product.pickedUp && productId != product.id) { // 소비자가 '다른' 상품을 '집어들었을때'만
    productId = product.id;
    var productInfoDOM = '<div class="row content">'
                       +   '<div class="col-md-4">' + '<img src="../images/' + product.image + '.jpg" class="img-responsive image-rounded">' + '</div>'
                       +   '<div class="col-md-8">'
                       +     '<div class="panel panel-default">'
                       +       '<div class="panel-heading">' + '상품 정보' + '</div>'
                       +       '<table class="table table-hover table-bordered">'
                       +         '<tr>'
                       +           '<th>' + '브랜드' + '</th>'
                       +           '<td>' + product.brand + '</td>'
                       +         '</tr>'
                       +         '<tr>'
                       +           '<th>' + '이름' + '</th>'
                       +           '<td>' + product.name + '</td>'
                       +         '</tr>'
                       +         '<tr>'
                       +           '<th>' + '가격' + '</th>'
                       +           '<td>' + product.price + '원' + '</td>'
                       +         '</tr>'
                       +         '<tr>'
                       +           '<th>' + '용량' + '</th>'
                       +           '<td>' + product.amount + '</td>'
                       +         '</tr>'
                       +         '<tr>'
                       +           '<th>' + '영양성분' + '</th>'
                       +           '<td>' + product.nutrients + '</td>'
                       +         '</tr>'
                       +       '</table>'
                       +     '</div>'
                       +   '</div>'
                       + '</div>';
    // var productInfoDOM = '<div class="panel panel-default">'
    // + '<div class="panel-heading">' + '상품 정보' + '</div>'
    // + '<div class="row">'
    // + '<div class="col-md-6">' + '<img src="../images/' + product.image + '.jpg" class="img-responsive image-rounded">' + '</div>'
    // + '<div class="col-md-6">'
    // + '<table class="table table-hover table-bordered">'
    // + '<tr>' + '<th>' + '브랜드' + '</th>' + '<td>' + product.brand + '</td>' + '</tr>'
    // + '<tr>' + '<th>' + '이름' + '</th>' + '<td>' + product.name + '</td>' + '</tr>'
    // + '<tr>' + '<th>' + '가격' + '</th>' + '<td>' + product.price + '</td>' + '</tr>'
    // + '<tr>' + '<th>' + '용량' + '</th>' + '<td>' + product.amount + '</td>' + '</tr>'
    // + '<tr>' + '<th>' + '영양성분' + '</th>' + '<td>' + product.nutrients + '</td>' + '</tr>'
    // + '</table>' + '</div>' + '</div>' + '</div>'
    var container = document.getElementsByClassName('container');
    container[0].innerHTML = productInfoDOM;
  }
});
var itemCount = 2;
var buttons = document.querySelectorAll('button');
buttons.forEach(function(button) {
  button.addEventListener('click', function() {
    var upOrdown = parseInt(button.dataset.count);
    itemCount += upOrdown;
    var upOrdownFlag = 0 > upOrdown ? 'O' : 'X';
    var data = '0_' + itemCount + '_' + upOrdownFlag;
    fetch('/productMoved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({data: data})
    }).then((message) => { console.log(message); });
  });
});
