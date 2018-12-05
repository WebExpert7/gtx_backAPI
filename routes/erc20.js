const express = require('express');
const router = express.Router();
// const config = require('../config/database');
const bodyParser = require('body-parser');
// const Eth = require('../models/eth');
const lightwallet = require('eth-lightwallet');
const axios = require('axios');
const CoinMarketCap = require("node-coinmarketcap");
const Web3 = require("web3");

/* Toc mainnet */

const option_etherscan_api = 'https://api-ropsten.etherscan.io'; //change to https://api-ropsten.etherscan.io for mainnet
// const option_etherscan_api = 'https://api-ropsten.etherscan.io';
const option_etherscan_api_key = 'AH56YE6FZWX7QHMR6JFV3FGHCNWCXCVKCV';
// const erc20contract_address = "0x16cdd7dfaecd43409f72069bc46af309449f7403";
// const erc20contract_function_address = "0x16cdd7dfaecd43409f72069bc46af309449f7403";
// const token_owner_address = "0xa776d89697a79056fe57b626051a8862002dc13f";
const tokenscan_api = 'https://api.tokenbalance.com/token/'
const option_registration_enabled = true;
const erc20_standard_abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}]

// router.post('/wallet_generation', (req, res, next) => {
//     const password = req.body.password;
//     // res.send(eth_keys_gen(password));
//     const secretSeed = lightwallet.keystore.generateRandomSeed();
//     lightwallet.keystore.createVault({
//         password: password,
//         seedPhrase: secretSeed,
//         hdPathString: "m/0'/0'/0'"
//     }, function (err, ks) {
    
//         ks.keyFromPassword(password, function (err, pwDerivedKey) {
//             if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
//                 throw new Error("Incorrect derived password!");
//             }
    
//             try {
//                 ks.generateNewAddress(pwDerivedKey, 1);
//             } catch (err) {
//                 return res.json({success: false, msg: 'Bad Request'});
//                 console.log(err);
//                 console.trace();
//             }
//             const address = ks.getAddresses()[0];
//             const prv_key = ks.exportPrivateKey(address, pwDerivedKey);
//             const keystorage = ks.serialize();

//             // let newAddr = new Eth({
//             //     addr: ks.getAddresses()[0],
//             //     prv_key: prv_key,
//             //     keystorage: keystorage,
//             //     isreg: 1,
//             //     d12keys: secretSeed,
//             //     password: password
//             // });

//             // Eth.addAddr(newAddr, (err, eth) => {
//             //     if(err){
//             //       res.json({success: false, msg:'Failed to add new wallet'});
//             //     } else {
//             //         res.json({
//             //             success: true, 
//             //             msg:'New wallet was built', 
//             //             addr : ks.getAddresses()[0], 
//             //             keystorage : keystorage,
//             //             d12keys : secretSeed
//             //         });
//             //     }
//             // });
//             res.json({
//                 addr: ks.getAddresses()[0],
//                 prv_key: prv_key,
//                 keystorage: keystorage,
//                 d12keys: secretSeed,
//                 password: password
//             });
//         });
//     });
// });

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

router.post('/get_contract_info', (req, res, next) => {
    const contract_addr = req.body.contract_addr;
    axios.get(tokenscan_api + contract_addr + "/" + contract_addr)
        .then(function (response) {
            const info = response.data;
            return res.json({"contract_addr": contract_addr, "name": response.data.name, "symbol": response.data.symbol, "decimals": response.data.decimals});
        })
        .catch(function (error) {
            return res.json({error: true, message: 'no contract code at given address'});
        });
});

router.post('/get_balance', (req, res, next) => {
    const addr = req.body.addr;
    const contract_addr = req.body.contract_addr;
    const decimals = req.body.decimals;
    axios.get(option_etherscan_api + "/api?module=account&action=tokenbalance&contractaddress=" + contract_addr + "&address=" + addr + "&tag=latest&apikey=" + option_etherscan_api_key)
        .then(function (response) {
            _balance = (response.data.result / Math.pow(10, decimals)).toFixed(3);
            return res.json({balance: _balance});
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Bad Address'});
        });
});

// router.post('/get_price', (req, res, next) => {
//     // axios.get(option_etherscan_api + '/api?module=stats&action=ethprice&apikey=' + option_etherscan_api_key)
//     //     .then(function (response) {
//     //         return res.json({price: response.data.result.ethusd});
//     //     })
//     //     .catch(function (error) {
//     //         return res.json({success: false, msg: 'error'});
//     //     });
//     const coinmarketcap = new CoinMarketCap();
//     coinmarketcap.get("ethereum", coin => {
//         return res.json({price: coin.price_usd});
//     });
// });

router.post('/get_tx_history', (req, res, next) => {
    const addr = req.body.addr;
    const contract_addr = req.body.contract_addr;
    const decimals = req.body.decimals;
    axios.get(option_etherscan_api + '/api?module=account&action=txlist&address=' + addr + '&startblock=0&endblock=99999999&sort=desc&apikey=' + option_etherscan_api_key)
        .then(function (response) {
            const obj = response.data.result;
            for (let i = obj.length - 1; i > -1; i--){
                if (obj[i].input.length == 138 && (obj[i].from == contract_addr || obj[i].to == contract_addr)){
                    const hex_value = obj[i].input.substr(obj[i].input.length - 40);
                    obj[i].input = parseInt(hex_value, 16) / Math.pow(10, decimals);
                }
                else {
                    obj.splice(i, 1);
                }
            }
            return res.json(obj);
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Bad Address'});
        });
});

router.post('/send_tx', (req, res, next) => {
    const addr = req.body.addr;
    const contract_addr = req.body.contract_addr;
    const keystroage = req.body.keystroage;
    const password = req.body.password;
    const to = req.body.to;
    const value = req.body.value * 1000000;
    axios.get(option_etherscan_api + '/api?module=proxy&action=eth_gasPrice&apikey=' + option_etherscan_api_key)
        .then(function (response) {
            const gasPrice = response.data.result;
            const ks = lightwallet.keystore.deserialize(keystroage);
            axios.post(option_etherscan_api + '/api?module=proxy&action=eth_getTransactionCount&address=' + addr + '&tag=latest&apikey=' + option_etherscan_api_key)
                .then(function (res_nonce) {
                    let options = {};
                    options.nonce = res_nonce.data.result;
                    options.to = contract_addr;
                    options.gasPrice = gasPrice;
                    options.gasLimit = 0x33450; //web3.toHex('210000');
                    options.value = 0;
                    const registerTx = lightwallet.txutils.functionTx(erc20_standard_abi, "transfer", [to, value], options);
                    ks.keyFromPassword(password, function (err, pwDerivedKey) {
                        if (err) {
                            return res.send(err);
                        }
                        else {
                            const signedTx = lightwallet.signing.signTx(ks, pwDerivedKey, registerTx, addr);
                            axios.get(option_etherscan_api + '/api?module=proxy&action=eth_sendRawTransaction&hex=' + '0x' + signedTx + '&apikey=' + option_etherscan_api_key)
                                .then(function (res_tx) {
                                    // return res.json(res_tx.data.result);
                                    const tx_hash = res_tx.data.result;
                                    if (tx_hash == "" || tx_hash == undefined){
                                        return res.json({success: false, msg: 'The previous transaction has not completed yet. Please wait and try again'});
                                    }
                                    else{
                                        return res.json({success: true, msg: 'The request sent successfully', hash: tx_hash});
                                    }
                                    // const interval = setInterval(function() {
                                    //     axios.get(option_etherscan_api + '/api?module=transaction&action=gettxreceiptstatus&txhash=' + tx_hash + '&apikey=' + option_etherscan_api_key)
                                    //         .then(function (check_tx) {
                                    //             // return res.send(check_tx.data.result.status);
                                    //             if (check_tx.data.result.status == 1){
                                    //                 clearInterval(interval);
                                    //                 return res.json({success: true, hash: tx_hash, msg: 'Transaction success!'});
                                    //                 // return res.send(res_tx.data.result);
                                    //             }
                                    //         })
                                    //         .catch(function (error) {
                                    //             return res.json({success: false, msg: 'Transaction checking error!'});
                                    //         });
                                    // }, 10000);
                                })
                                .catch(function (error) {
                                    return res.json({success: false, msg: 'The account you tried to send transaction from does not have enough funds'});
                                });
                        }
                    });
                    // return res.json(ks);
                })
                .catch(function (error) {
                    return res.json({success: false, msg: 'error!'});
                });
        })
        .catch(function (error) {
            return res.json({success: false, msg: 'Could not get gas price!'});
        });
});

module.exports = router;