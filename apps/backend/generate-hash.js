const bcrypt = require('bcryptjs');

// Gerar hash da senha "admin123"
const password = 'admin123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Hash da senha "admin123":');
console.log(hash);

// Testar se funciona
const isValid = bcrypt.compareSync('admin123', hash);
console.log('\nSenha válida?', isValid);
