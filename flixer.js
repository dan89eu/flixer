var torrentStream = require('torrent-stream');
var rangeParser = require('range-parser');
var http = require('http');
var mime = require('mime');
var pump = require('pump');


var engine = torrentStream('magnet:?xt=urn:btih:b170691fe3b6aaeba73f8ea122e85ded4ad2e1bf');
engine.on('ready', function() {
  console.log(engine.files);
  var file=engine.files[1];

  http.createServer(function (request, response) {

    var range = request.headers.range;
		range = range && rangeParser(file.length, range)[0];
		response.setHeader('Accept-Ranges', 'bytes');
		response.setHeader('Content-Type', mime.lookup(file.name));

    if (!range) {
			response.setHeader('Content-Length', file.length);
			if (request.method === 'HEAD') return response.end();
			pump(file.createReadStream(), response);
			return;
		}

    response.statusCode = 206;
		response.setHeader('Content-Length', range.end - range.start + 1);
		response.setHeader('Content-Range', 'bytes '+range.start+'-'+range.end+'/'+file.length);

		if (request.method === 'HEAD') return response.end();
		pump(file.createReadStream(range), response);

  }).listen(9615);
  console.log('Stream up!');
});
