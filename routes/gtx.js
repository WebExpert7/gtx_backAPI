const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql_config = require('../config/mysql_connection');
// const handleDisconnect = require('../config/db_handleDisconnect');
const bodyParser = require('body-parser');
// const Eth = require('../models/eth');
// const mongoose = require('mongoose');
// const config = require('../config/database');
const Transaction = require('../models/transaction');
const lightwallet = require('eth-lightwallet');
const axios = require('axios');
const CoinMarketCap = require("node-coinmarketcap");
const Web3 = require("web3");
// const web3 = new Web3('http://52.77.161.80:8501');
const web3 = new Web3(new Web3.providers.HttpProvider("http://52.77.161.80:8501"));

const option_etherscan_api = 'https://api.etherscan.io'; //change to https://api-ropsten.etherscan.io for mainnet
const option_etherscan_api_key = 'AH56YE6FZWX7QHMR6JFV3FGHCNWCXCVKCV';

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
    // res.send(eth_keys_gen(password));
    const secretSeed = lightwallet.keystore.generateRandomSeed();
    lightwallet.keystore.createVault({
        password: password,
        seedPhrase: secretSeed,
        hdPathString: "m/0'/0'/0'"
    }, function (err, ks) {
    
        ks.keyFromPassword(password, function (err, pwDerivedKey) {
            if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                throw new Error("Incorrect derived password!");
            }
    
            try {
                ks.generateNewAddress(pwDerivedKey, 1);
            } catch (err) {
                return res.json({success: false, msg: 'Bad Request'});
                console.log(err);
                console.trace();
            }
            const address = ks.getAddresses()[0];
            const prv_key = ks.exportPrivateKey(address, pwDerivedKey);
            const keystorage = ks.serialize();

            return res.json({
                addr: ks.getAddresses()[0],
                prv_key: prv_key,
                keystorage: keystorage,
                d12keys: secretSeed,
                password: password
            });

            // let newAddr = new Eth({
            //     addr: ks.getAddresses()[0],
            //     prv_key: prv_key,
            //     keystorage: keystorage,
            //     isreg: 1,
            //     d12keys: secretSeed,
            //     password: password
            // });

            // Eth.addAddr(newAddr, (err, eth) => {
            //     if(err){
            //       res.json({success: false, msg:'Failed to add new wallet'});
            //     } else {
            //         res.json({
            //             success: true, 
            //             msg:'New wallet was built', 
            //             addr : ks.getAddresses()[0], 
            //             keystorage : keystorage,
            //             d12keys : secretSeed
            //         });
            //     }
            // });
        });
    });
});

// router.post('/wallet_backup', (req, res, next) => {
//     var password = req.body.password;
//     Eth.getWalletByPassword(password, (err, eth) => {
//         if(err) throw err;
//         else {
//             if(!eth){
//                 return res.json({success: false, msg: 'Wallet not found'});
//             }
//             else {
//                 return res.json(eth);
//             }
//         }
//     });
// });

router.post('/get_balance', (req, res, next) => {
    const addr = req.body.addr;
    // axios.get(option_etherscan_api + '/api?module=account&action=balance&address=' + addr + '&tag=latest&apikey=' + option_etherscan_api_key)
    //     .then(function (response) {
    //         _balance = response.data.result / 1000000000000000000;
    //         return res.json({balance: _balance});
    //     })
    //     .catch(function (error) {
    //         return res.json({success: false, msg: 'Bad Address'});
    //     });
    // const balance = web3.eth.getBalance('0xbc0f555d668d6fd7ec6ecbb601af62845bebc826');
    // return res.json(balance);
    const balance = web3.eth.getBalance(addr); //Will give value in.
    // balance = web3.toDecimal(balance);
    // console.log(balance);
    return res.json({balance: balance / 1000000000000000000});
});

router.post('/get_price', (req, res, next) => {
    // axios.get(option_etherscan_api + '/api?module=stats&action=ethprice&apikey=' + option_etherscan_api_key)
    //     .then(function (response) {
    //         return res.json({price: response.data.result.ethusd});
    //     })
    //     .catch(function (error) {
    //         return res.json({success: false, msg: 'error'});
    //     });
    const coinmarketcap = new CoinMarketCap();
    coinmarketcap.get("ethereum", coin => {
        return res.json({price: coin.price_usd});
    });
});

router.post('/get_tx_history', (req, res, next) => {
    const addr = req.body.addr;
    // axios.get(option_etherscan_api + '/api?module=account&action=txlist&address=' + addr + '&startblock=0&endblock=99999999&sort=desc&apikey=' + option_etherscan_api_key)
    //     .then(function (response) {
    //         return res.json(response.data.result);
    //     })
    //     .catch(function (error) {
    //         return res.json({success: false, msg: 'Bad Address'});
    //     });
    // const history = web3.eth.getTransactionCount("0x5475ee6444120d080ded090762ce738efa360334");
    // console.log(history);
    Transaction.getTransactionByAddress(addr, (err, transaction) => {
        if(err)
            return res.json({success: false, msg: 'Bad Address'});
        else
            return res.json(transaction);
    });
});

router.post('/send_tx', (req, res, next) => {
    const addr = req.body.addr;
    const keystroage = req.body.keystroage;
    const password = req.body.password;
    const to = req.body.to;
    const value = req.body.value;
    const nonce = web3.eth.getTransactionCount(addr);
    const gasPrice = 0x0;
    const ks = lightwallet.keystore.deserialize(keystroage);
    let options = {};
    options.nonce = nonce;
    options.to = to;
    options.gasPrice = gasPrice;
    options.gasLimit = 0x33450; //web3.toHex('210000');
    options.value = value * 1000000000000000000;
    const registerTx = lightwallet.txutils.valueTx(options);
    ks.keyFromPassword(password, function (err, pwDerivedKey) {
        if (err) {
            return res.send(err);
        }
        else {
            const signedTx = lightwallet.signing.signTx(ks, pwDerivedKey, registerTx, addr);
            web3.eth.sendRawTransaction(
                '0x' + signedTx, function(err, result) {
                    if(err) {
                        return res.send(err);
                    } else {
                        return res.json({success: true, transaction_hash: result, msg: 'Transaction success!'});
                    }
                });
            // contract.methods.balanceOf(addr).call()
            // .then(function(balance){console.log(balance)});
            // axios.get(option_etherscan_api + '/api?module=proxy&action=eth_sendRawTransaction&hex=' + '0x' + signedTx + '&apikey=' + option_etherscan_api_key)
            //     .then(function (res_tx) {
            //         // return res.json(res_tx.data.result);
            //         const tx_hash = res_tx.data.result;
            //         if (res_tx.data.error){
            //             if (res_tx.data.error.message.indexOf(0) > -1){
            //                 return res.json({success: false, msg: 'The account you tried to send transaction from does not have enough funds. Required ETH gas. Please check your ethereum balance.'});
            //             }
            //             else {
            //                 return res.json({success: false, msg: 'The previous transaction has not completed yet. Please wait and try again'});
            //             }
            //         }
            //         else{
            //             return res.json({success: true, msg: 'The request sent successfully', hash: tx_hash});
            //         }
            //         // const interval = setInterval(function() {
            //         //     axios.get(option_etherscan_api + '/api?module=transaction&action=gettxreceiptstatus&txhash=' + tx_hash + '&apikey=' + option_etherscan_api_key)
            //         //         .then(function (check_tx) {
            //         //             // return res.send(check_tx.data.result.status);
            //         //             if (check_tx.data.result.status == 1){
            //         //                 clearInterval(interval);
            //         //                 return res.json({success: true, hash: tx_hash, msg: 'Transaction success!'});
            //         //                 // return res.send(res_tx.data.result);
            //         //             }
            //         //         })
            //         //         .catch(function (error) {
            //         //             return res.json({success: false, msg: 'Transaction checking error!'});
            //         //         });
            //         // }, 10000);
            //     })
            //     .catch(function (error) {
            //         return res.json({success: false, msg: 'The account you tried to send transaction from does not have enough funds'});
            //     });
        }
    });
});

module.exports = router;