const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql_config = require('../config/mysql_connection');
// const handleDisconnect = require('../config/db_handleDisconnect');
// const config = require('../config/database');
const bodyParser = require('body-parser');
const axios = require('axios');
const CoinMarketCap = require("node-coinmarketcap");
const nemapi = require('nem-api');
const nem = require("nem-sdk").default;

/*  DB connection part */
let connection;
  
function handleDisconnect() {
  connection = mysql.createPool(mysql_config.db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.getConnection(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect(), 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

/*  DB connection part end */

router.post('/wallet_generation', async(req, res, next) => {
    const walletName = req.body.username;
    const password = req.body.password;

    // Create random bytes from PRNG
    const rBytes = nem.crypto.nacl.randomBytes(32);
 
    // Convert the random bytes to hex
    const privateKey = nem.utils.convert.ua2hex(rBytes);

    // Create a key pair
    const keyPair = nem.crypto.keyPair.create(privateKey);

    // Create a public Key from keyPair
    const publicKey = keyPair.publicKey.toString();

    // Create a address from privateKey
    const wallet = nem.model.wallet.importPrivateKey(walletName, password, privateKey, nem.model.network.data.mainnet.id);
    const address = wallet.accounts[0].address;

    // Verify address validity
    const isValid = nem.model.address.isValid(address);

    // Verify if address is from given network
    const isFromNetwork = nem.model.address.isFromNetwork(address, "Mainnet");

    const values  = {username: req.body.username, password: req.body.password, addr: address, prv_key: privateKey, pub_key: publicKey};

    handleDisconnect();

    connection.query('INSERT INTO xem SET ?', values, function (error, results, fields) {
        if (error) {
            console.log(error);
            return res.json({
                error: true,
                msg: "retrying connection"
            });
        }
        connection.end();
        return res.json({privateKey : privateKey, address : address, publicKey : publicKey});
    });
    

    // console.log(san);
    // axios.get('http://san.nem.ninja:7890/account/generate')
    //     .then(function (response) {
    //         return res.json(response.body);
    //     })
    //     .catch(function (error) {
    //         return res.json({success: false, msg: 'Request Error!'});
    //     });
        
});

router.post('/wallet_info', (req, res, next) => {

    const addr = req.body.addr;
    const san = new nemapi('http://san.nem.ninja:7890');
    
    san.get('/account/get', {'address': addr}, function(response) {
        // balance must be divided by 1000000
        return res.json(response.body);
    });

});

router.post('/get_tx_history', async(req, res, next) => {

    const addr = req.body.addr;
    const san = new nemapi('http://san.nem.ninja:7890');
    
    san.get('/account/transfers/all', {'address': addr}, function(response) {
        return res.json(response.body);
    });

});

// router.post('/block_time', (req, res, next) => {
//     axios.get('https://bitaps.com/api/blocktime')
//         .then(function (response) {
//             return res.json(response.data);
//         })
//         .catch(function (error) {
//             return res.json({success: false, msg: 'Request Error!'});
//         });
// });

// router.post('/tx_fee', (req, res, next) => {
//     axios.get('https://bitaps.com/api/fee')
//         .then(function (response) {
//             return res.json(response.data);
//         })
//         .catch(function (error) {
//             return res.json({success: false, msg: 'Request Error!'});
//         });
// });

router.post('/send_tx', async(req, res, next) => {
    const to = req.body.to;
    const amount = req.body.amount;
    const priv_key = req.body.priv_key;
    const san = new nemapi('http://san.nem.ninja:7890');

    var txobject = {
        'isMultisig': false,
        'recipient': to, // Dashes optional, all parsed later.
        'amount': amount, // Amount of XEM to send.
        'message': '', // Message to send.
        'due': 60 // Not sure what this does but the default is probably fine.
    }

    const transaction = san.makeTX(txobject, priv_key);
    console.log(transaction);
    const transactionobject = san.signTX(transaction, priv_key);
    console.log(transactionobject);
    
    san.post('/transaction/announce', transactionobject, function(response) {
        return res.json(response.body);
    });

    // we can check the transfering trasaction by response in console.

    // axios.post('http://san.nem.ninja:7890/transaction/announce', transactionobject)
    //     .then(function (response) {
    //         console.log(response);
    //         return res.json(response.data);
    //     })
    //     .catch(function (error) {
    //         return res.json({success: false, msg: 'Request Error!'});
    //     });
});

// router.post('/qr_code_url', (req, res, next) => {
//     const addr = req.body.addr;
//     return res.json({url: 'https://bitaps.com/api/qrcode/png/' + addr});
// });

router.post('/get_price', (req, res, next) => {
    const coinmarketcap = new CoinMarketCap();
    coinmarketcap.get("nem", coin => {
        return res.json({price: coin.price_usd});
    });
});

module.exports = router;