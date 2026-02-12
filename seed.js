const https = require('https');

const data = JSON.stringify({
  token: 'seed_secret_key_12345'
});

const options = {
  hostname: 'web-production-1d256.up.railway.app',
  path: '/api/auth/seed',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🌱 Executando seed no banco remoto...\n');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Resposta:', body);
    if (res.statusCode === 200) {
      console.log('\n✅ SUCESSO! Usuário admin criado.\n');
      process.exit(0);
    } else {
      console.log('\n❌ Erro ao executar seed.\n');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
