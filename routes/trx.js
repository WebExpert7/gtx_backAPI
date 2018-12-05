const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql_config = require('../config/mysql_connection');
// const handleDisconnect = require('../config/db_handleDisconnect');
// const config = require('../config/database');
const bodyParser = require('body-parser');
const axios = require('axios');
const CoinMarketCap = require("node-coinmarketcap");
const tron_wallet = require("@tronscan/client");
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

router.post('/wallet_generation', (req, res, next) => {

        //tronscanclient npm package changed for severwallet and wallet generation  nodemodule/@tronscan/client/http.js
        const cl = new tron_wallet.Client();
        let generation = cl.wallet_generation();
        // console.log(cl.wallet_generation());

        const values  = {username: req.body.username, password: req.body.password, addr: generation.address, prv_key: generation.privateKey, wallet_password: generation.password};
        handleDisconnect();

        connection.query('INSERT INTO trx SET ?', values, function (error, results, fields) {
            if (error) {
                console.log(error);
                return res.json({
                    error: true,
                    msg: "retrying connection"
                });
            }
            connection.end();
            return res.json(generation);
        });
        
});

router.post('/get_balance', async(req, res, next) => {

    const addr = req.body.addr;
    const cl = new tron_wallet.Client();
    let _balance = await cl.getbalance(addr);
    let balance = _balance.balance;
    // _balance = response.data.result / 1000000000000000000;
    // return res.json({balance: _balance.data.balance});
    return res.json({balance : balance});

});

router.post('/get_tx_history', async(req, res, next) => {

    const addr = req.body.addr;
    const cl = new tron_wallet.Client();
    let transactions = await cl.get_transactions(addr);
    // _balance = response.data.result / 1000000000000000000;
    // return res.json({balance: _balance.data.balance});
    return res.json(transactions);

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
    // const from = req.body.from;
    // const to = req.body.to;
    // const amount = req.body.amount;
    // const prv_key = req.body.prv_key;
    const { from, to, amount, prv_key } = req.body;
    const cl = new tron_wallet.Client();
    let transaction_result = await cl.send("TRX", from, to, amount, prv_key);
    // _balance = response.data.result / 1000000000000000000;
    // return res.json({balance: _balance.data.balance});
    return res.json(transaction_result);
});

// router.post('/qr_code_url', (req, res, next) => {
//     const addr = req.body.addr;
//     return res.json({url: 'https://bitaps.com/api/qrcode/png/' + addr});
// });

router.post('/get_price', (req, res, next) => {
    const coinmarketcap = new CoinMarketCap();
    coinmarketcap.get("tron", coin => {
        return res.json({price: coin.price_usd});
    });
});

module.exports = router;