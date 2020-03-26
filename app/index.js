const http = require('http');

http.createServer((req, res) => {
    res.write(`${JSON.stringify(req.headers)}`);
    res.end();
}).listen(8080);
