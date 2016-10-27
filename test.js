var url = require('url');

var x = "/string/";
x = x.replace(/^\/|\/$/g, '');
console.log(x);
console.log(url.resolve('http://test/', '/four.js'));