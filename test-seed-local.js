const http = require('http');

const data = JSON.stringify({
  token: 'seed_secret_key_12345'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/seed-init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🌱 Testando seed localmente...\n');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Resposta:', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
