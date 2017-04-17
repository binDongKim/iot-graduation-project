var socket = io.connect('http://localhost:3000');
socket.on('product-moved', function(product) {
  document.getElementById(product.id).innerHTML = product.count;
});

socket.on('product-info', function(products) {
  var sectorLis = document.getElementsByClassName('sectors')[0].querySelectorAll('li');
  var productList = '';
  Object.keys(products).forEach(function(productId, index) {
    sectorLis[index].querySelector('span').setAttribute('id', productId);
    sectorLis[index].querySelector('span').innerHTML = products[productId].count;
    productList += '<li class="list-group-item">'
    + '<span class="badge">' + products[productId].countSet + '</span>'
    + products[productId].name + '</li>';
  });
  document.getElementById('productList').innerHTML = productList;
});
