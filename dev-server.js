// Minimal static file server for the Chart.js sandbox preview.
// Replaces gulp-connect (whose old socket.io crashes on Node 10+).
var http = require('http');
var fs = require('fs');
var path = require('path');

var root = process.cwd();
var port = 8000;

var mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split('?')[0]);
  var filePath = path.join(root, urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (err || stat.isDirectory()) {
      // Try index.html in directory
      var indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, function (e2, s2) {
        if (e2 || !s2.isFile()) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        serve(indexPath, res);
      });
      return;
    }
    serve(filePath, res);
  });

  function serve(file, res) {
    var ext = path.extname(file).toLowerCase();
    var type = mime[ext] || 'application/octet-stream';
    var stream = fs.createReadStream(file);
    stream.on('open', function () {
      res.writeHead(200, { 'Content-Type': type });
      stream.pipe(res);
    });
    stream.on('error', function () {
      res.writeHead(500);
      res.end('Internal error');
    });
  }
}).listen(port, '0.0.0.0', function () {
  console.log('Static server listening on 0.0.0.0:' + port);
});
