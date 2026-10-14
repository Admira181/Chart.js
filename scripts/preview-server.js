'use strict';

// Minimal static file server for the Chart.js preview.
// Serves the repository root on 0.0.0.0:3000 so that the samples
// (which reference ../../dist/Chart.bundle.js) resolve correctly.
// Not part of the library itself — dev/preview convenience only.

var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = process.env.PREVIEW_ROOT || process.cwd();
var PORT = parseInt(process.env.PORT || '3000', 10);

var MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.map': 'application/json; charset=utf-8'
};

var server = http.createServer(function(req, res) {
	var urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);

	if (urlPath === '/' || urlPath === '') {
		res.writeHead(302, { Location: '/samples/bar/bar.html' });
		res.end();
		return;
	}

	var filePath = path.join(ROOT, urlPath);
	if (filePath.indexOf(ROOT) !== 0) {
		res.writeHead(403);
		res.end('Forbidden');
		return;
	}

	fs.stat(filePath, function(err, stat) {
		if (err || !stat.isFile()) {
			res.writeHead(404);
			res.end('Not found: ' + urlPath);
			return;
		}
		var ext = path.extname(filePath).toLowerCase();
		res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
		fs.createReadStream(filePath).pipe(res);
	});
});

server.listen(PORT, '0.0.0.0', function() {
	console.log('Preview server listening on http://0.0.0.0:' + PORT + ' (root: ' + ROOT + ')');
});
