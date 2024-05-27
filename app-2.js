const hostname = require('os').hostname();
const { createServer } = require('./grpc');

const PORT = 8080;

function serve(call, callback) {
  const message = `app-2@${hostname} serving app-1@${call.request.name}`;
  callback(null, { message });
}

createServer(`0.0.0.0:${PORT}`, serve);
