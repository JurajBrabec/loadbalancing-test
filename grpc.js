const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('grpc.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).app_2;

const createClient = (address) => {
  return new proto.App_2(address, grpc.credentials.createInsecure(), {
    'grpc.keepalive_time_ms': 10000, // 10 seconds
    'grpc.keepalive_timeout_ms': 5000, // 5 seconds
    'grpc.keepalive_permit_without_calls': 1,
  });
};

const createServer = (address, serve) => {
  const server = new grpc.Server();
  server.addService(proto.App_2.service, { serve });

  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err != null) {
        return console.error(err);
      }
      console.log(`APP-2 listening on port ${port}`);
    }
  );
};

module.exports = { createClient, createServer };
