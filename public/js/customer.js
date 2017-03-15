var socket = io.connect('http://localhost:3000');
var productId = null;
socket.on('product-moved', function(product) {
  if(product.pickedUp && productId != product.id) { // 소비자가 '다른' 상품을 '집어들었을때'만
    productId = product.id;
    var productInfoDOM = '<div class="row content">'
                       +   '<div class="col-md-6">' + '<img src="../images/' + product.image + '.jpg" class="img-responsive image-rounded">' + '</div>'
                       +   '<div class="col-md-6">'
                       +     '<div class="panel panel-default">'
                       +       '<div class="panel-heading">' + '상품 정보' + '</div>'
                       +       '<table class="table table-hover table-bordered">'
                       +         '<tr>'
                       +           '<th>' + '상품 브랜드' + '</th>'
                       +           '<td>' + product.brand + '</td>'
                       +         '</tr>'
                       +         '<tr>'
                       +           '<th>' + '상품 이름' + '</th>'
                       +           '<td>' + product.name + '</td>'
                       +         '</tr>'
                       +       '</table>'
                       +     '</div>'
                       +   '</div>'
                       + '</div>';
    var container = document.getElementsByClassName('container');
    container[0].innerHTML = productInfoDOM;
  }
});
