const { exec } = require('child_process');
const http = require('http');

const server = exec('npm run dev -- -p 3001');

setTimeout(() => {
  http.get('http://localhost:3001/api/products', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('API Response:', data);
      server.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.log('Error: ', err.message);
    server.kill();
    process.exit(1);
  });
}, 5000);
