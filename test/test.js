var assert = require('assert'),
    http = require('http');
var server = require('../app/app.js').app;

describe('/', function () {
  it('should return 200', function (done) {
    http.get('http://localhost:3000', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('should say "This proves NodeJS web server is working."', function (done) {
    http.get('http://localhost:3000', function (res) {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        assert.equal('This proves NodeJS web server is working.\n', data);
        done();
      });
    });
  });
});
