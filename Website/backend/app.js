const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const router = require('./router');

const app = express();
const port = process.env.PORT || 7210;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS Configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

// Routes
app.use(router);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Server
const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  console.log(`Backend server is listening on port ${port}`);
});
