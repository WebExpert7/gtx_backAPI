const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql_config = require('../config/mysql_connection');
// const handleDisconnect = require('../config/db_handleDisconnect');
// const config = require('../config/database');
const CoinMarketCap = require("node-coinmarketcap");
const bodyParser = require('body-parser');
const axios = require('axios');

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

const RippleAPI = require('ripple-lib').RippleAPI;
const fetch = require('node-fetch');

const netstatus = 'wss://s.altnet.rippletest.net:51233';
//const netstatus = 'wss://s1.ripple.com';

router.post('/wallet_generation', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const api = new RippleAPI({
        server: netstatus // Public rippled server hosted by Ripple, Inc.
      });
      api.on('error', (errorCode, errorMessage) => {
        console.log(errorCode + ': ' + errorMessage);
      });
      api.on('connected', () => {
        // console.log('connected');
      });
      api.on('disconnected', (code) => {
        // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
        // will be 1000 if this was normal closure
        // console.log('disconnected, code:', code);
      });
      api.connect().then(() => {
        const addr_json = api.generateAddress();
        const values  = {username: username, password: password, addr: addr_json.address, secret: addr_json.secret};

        // if(connection.state === 'disconnected'){
        //     connection.connect();
        // }

        handleDisconnect();

        const query = connection.query('INSERT INTO xrp SET ?', values, function (error, results, fields) {
            if (error) {
                console.log(error);
                return res.json({
                    error: true,
                    msg: "retrying connection"
                });
            }
            connection.end();
            return res.json(addr_json);
        });
      }).then(() => {
        return api.disconnect();
      }).catch(console.error);
});

router.post('/wallet_info', (req, res, next) => {
    const addr = req.body.addr;
    const api = new RippleAPI({
        server: netstatus // Public rippled server hosted by Ripple, Inc.
    });
    api.on('error', (errorCode, errorMessage) => {
        console.log(errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
        // console.log('connected');
    });
    api.on('disconnected', (code) => {
        // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
        // will be 1000 if this was normal closure
        // console.log('disconnected, code:', code);
    });
    api.connect().then(() => {
        return api.getAccountInfo(addr).then(info =>
            {
                return res.json(info);
            }).catch(() => {
                return res.json({success: false, msg: 'Account is not available!'});
            });
    }).then(() => {
        return api.disconnect();
    }).catch(console.error);
});

router.post('/get_tx_history', (req, res, next) => {
    const addr = req.body.addr;
    const api = new RippleAPI({
        server: netstatus // Public rippled server hosted by Ripple, Inc.
    });
    api.on('error', (errorCode, errorMessage) => {
        console.log(errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
        // console.log('connected');
    });
    api.on('disconnected', (code) => {
        // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
        // will be 1000 if this was normal closure
        // console.log('disconnected, code:', code);
    });
    api.connect().then(() => {
        return api.getTransactions(addr).then(transaction => 
            {
                return res.json(transaction);
            });
    }).catch(function (error) {
        return res.json({success: false, msg: 'The testnet ledger is reset at most once per month!'});
    });
});

router.post('/tx_fee', (req, res, next) => {
    const api = new RippleAPI({
        server: netstatus // Public rippled server hosted by Ripple, Inc.
    });
    api.on('error', (errorCode, errorMessage) => {
        console.log(errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
        // console.log('connected');
    });
    api.on('disconnected', (code) => {
        // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
        // will be 1000 if this was normal closure
        // console.log('disconnected, code:', code);
    });
    api.connect().then(() => {
        return api.getFee().then(fee => {return res.json(fee)});
    }).then(() => {
        return api.disconnect();
    }).catch(console.error);
});

router.post('/send_tx', (req, res, next) => {
    const payFrom = req.body.payFrom;
    const secret = req.body.secretFrom;
    const payTo = req.body.payTo;
    const Amount = req.body.Amount;
    const api = new RippleAPI({
        server: netstatus // Public rippled server hosted by Ripple, Inc.
    });
    api.on('error', (errorCode, errorMessage) => {
        console.log(errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
        // console.log('connected');
    });
    api.on('disconnected', (code) => {
        // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
        // will be 1000 if this was normal closure
        // console.log('disconnected, code:', code);
    });
    api.connect().then(() => {

        api.getAccountInfo(payFrom).then(info => {

            api.connect().then(() => {

                api.getServerInfo().then(ss => {
                        // console.log(ss);
                        const transaction = {
                            "TransactionType" : "Payment",
                            "Account" : payFrom,
                            "Fee" : 20+"",
                            "Destination" : payTo,
                            "DestinationTag" : 1337,
                            "Amount" : (Amount*1000*1000)+"",
                            "LastLedgerSequence" : ss.validatedLedger.ledgerVersion+4,
                            "Sequence" : info.sequence
                        };
                        // console.log(transaction.Amount);
                        const txJSON = JSON.stringify(transaction);
                        // console.log(txJSON);
                    
                        const signed_tx = api.sign(txJSON, secret);
                        // tx_at_ledger = closedLedger
                    
                        // console.log('===> Signed TX << ID >>: ', signed_tx.id);
                    
                        // console.log('-------- SUBMITTING TRANSACTION --------');
                        // console.log(signed_tx);
                        api.connect().then(() => {
                            api.submit(signed_tx.signedTransaction).then(tx_data => {
                                // console.log(tx_data);
                            
                                // console.log('   >> [Tentative] Result: ', tx_data.resultCode);
                                // console.log('   >> [Tentative] Message: ', tx_data.resultMessage);
                                return res.json(tx_data);
                            }).catch(() => {
                                return res.json({success: false, msg: 'Transaction Sign error!'});
                            });
                        }).catch(console.error);

                }).catch(console.error);
            
            }).catch(console.error);

        }).catch(() => {
            return res.json({success: false, msg: 'Account is not available!'});
        });

    }).then(() => {
        return api.disconnect();
    }).catch(console.error);
});

// router.post('/qr_code_url', (req, res, next) => {
//     const addr = req.body.addr;
//     return res.json({url: 'https://bitaps.com/api/qrcode/png/' + addr});
// });

router.post('/get_price', (req, res, next) => {
    const coinmarketcap = new CoinMarketCap();
    coinmarketcap.get("ripple", coin => {
        return res.json({price: coin.price_usd});
    });
});


module.exports = router;