const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hash = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

const compare = (plainPassword, hashedPassword) => bcrypt.compare(plainPassword, hashedPassword);

module.exports = { hash, compare };
