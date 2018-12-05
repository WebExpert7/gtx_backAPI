const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql_config = require('../config/mysql_connection');
// const handleDisconnect = require('../config/db_handleDisconnect');
// const config = require('../config/database');
const bodyParser = require('body-parser');
const axios = require('axios');
const CoinMarketCap = require("node-coinmarketcap");

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
    const username = req.body.username;
    const password = req.body.password;
    axios.get('https://bitaps.com/api/create/redeemcode?confirmations=1')
        .then(function (response) {
            const values  = {username: username, password: password, addr: response.data.address, redeem_code: response.data.redeem_code, invoice: response.data.invoice};

            // if(connection.state === 'disconnected'){
            //     connection.connect();
            // }

            handleDisconnect();

            connection.query('INSERT INTO btc SET ?', values, function (error, results, fields) {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: true,
                        msg: "retrying connection"
                    });
                }
                connection.end();
                return res.json(response.data);
            });
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Request Error!'});
        });
});

router.post('/wallet_info', (req, res, next) => {
    const addr = req.body.addr;
    axios.get('https://bitaps.com/api/address/' + addr)
        .then(function (response) {
            return res.json(response.data);
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Request Error!'});
        });
});

router.post('/get_tx_history', (req, res, next) => {
    const addr = req.body.addr;
    axios.get('https://bitaps.com/api/address/transactions/' + addr)
        .then(function (response) {
            return res.json(response.data);
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Request Error!'});
        });
});

router.post('/block_time', (req, res, next) => {
    axios.get('https://bitaps.com/api/blocktime')
        .then(function (response) {
            return res.json(response.data);
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Request Error!'});
        });
});

router.post('/tx_fee', (req, res, next) => {
    axios.get('https://bitaps.com/api/fee')
        .then(function (response) {
            return res.json(response.data);
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Request Error!'});
        });
});

router.post('/send_tx', (req, res, next) => {
    const redeemcode_req = req.body.redeemcode;
    const address_req = req.body.to;
    const amount_req = req.body.amount * 100000000;
    const fee_level_req = "medium";
    axios.post('https://bitaps.com/api/use/redeemcode', {
        redeemcode: redeemcode_req,
        address: address_req,
        amount: amount_req,
        fee_level: fee_level_req,
        })
        .then(function (response) {
            return res.json(response.data);
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Request Error!'});
        });
});

// router.post('/qr_code_url', (req, res, next) => {
//     const addr = req.body.addr;
//     return res.json({url: 'https://bitaps.com/api/qrcode/png/' + addr});
// });

router.post('/get_price', (req, res, next) => {
    const coinmarketcap = new CoinMarketCap();
    coinmarketcap.get("bitcoin", coin => {
        return res.json({price: coin.price_usd});
    });
});

module.exports = router;