const hostname = require('os').hostname();
const express = require('express');
const { createClient } = require('./grpc');

const APP_2_ADDR = process.env.APP_2_ADDR || '0.0.0.0:8080';
const PORT = 8000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/test', (request, response) => {
  const client = createClient(APP_2_ADDR);
  const name = request.query.name || hostname;
  client.serve({ name }, function (error, result) {
    if (error) {
      const { message } = error;
      console.error('Error:', message);
      return response.status(500).json({ message });
    }
    const { message } = result;
    client.close();
    return response.status(200).json({ message });
  });
});

app.listen(PORT, () => console.log(`APP-1 listening on port ${PORT}`));
