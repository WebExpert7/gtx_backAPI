const mysql = require('mysql');

const db_config = {
  connectionLimit : 100,
  host     : '192.168.0.200',
  user     : 'tradeum',
  password : 'tradeum',
  database : 'wallets',
  debug    :  false
};

// const db_config = {
//   connectionLimit : 100,
//   host     : 'localhost',
//   user     : 'root',
//   password : 'nodemultiwallet',
//   database : 'wallets',
//   debug    :  false
// };

exports.db_config = db_config;