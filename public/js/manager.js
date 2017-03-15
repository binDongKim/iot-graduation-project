var socket = io.connect('http://localhost:3000');
socket.on('product-moved', function(product) {

});

socket.on('product-info', function(products) {
  var productsDOM = '<div class="panel panel-default">'
                    + '<div class="panel-heading">' + '상품 리스트' + '</div>'
                    + '<ul class="list-group">';
  Object.keys(products).forEach(function(productId) {
    productsDOM += '<li class="list-group-item">'
    + '<span class="badge">' + products[productId].count + '</span>'
    + products[productId].name + '</li>';
  });
  productsDOM += '</ul></div>';
  var container = document.getElementsByClassName('container');
  container[0].innerHTML = productsDOM;
});
