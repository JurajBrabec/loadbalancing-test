const hostname = require('os').hostname();
const express = require('express');
const { createClient } = require('./grpc');

const APP_2_ADDR = process.env.APP_2_ADDR || '0.0.0.0:8080';
const PORT = 8000;

const app = express();
app.use(express.json());

//NOTE - When the gRPC client is created on application start, and closed on exit,
//       the TCP connection will remain established after first use in the handler,
//       therefore Openshift Service load balancing is technically not possible.
const client = createClient(APP_2_ADDR);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/test', (request, response) => {
  //NOTE - Openshift Service load balancing will work as expected only if
  //       the gRPC client will be created inside the handler and closed ASAP
  //       const client = createClient(APP_2_ADDR);
  const name = request.query.name || hostname;
  client.serve({ name }, function (error, result) {
    if (error) {
      const { message } = error;
      console.error('Error:', message);
      response.status(500).json({ message });
    } else {
      const { message } = result;
      response.status(200).json({ message });
    }
    // client.close();
  });
});

app.listen(PORT, () => console.log(`APP-1 listening on port ${PORT}`));
