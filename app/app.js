// load the http module
var http = require('http');

// configure our HTTP server
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("This proves NodeJS web server is working.\n");
});

// listen on localhost:3000
server.listen(3000);
console.log("Server listening at http://127.0.0.1:3000/");
