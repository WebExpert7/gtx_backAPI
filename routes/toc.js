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

const option_etherscan_api = 'https://api.etherscan.io'; //change to https://api.etherscan.io for mainnet
const option_etherscan_api_key = 'AH56YE6FZWX7QHMR6JFV3FGHCNWCXCVKCV';
const erc20contract_address = "0x16cdd7dfaecd43409f72069bc46af309449f7403";
const erc20contract_function_address = "0x16cdd7dfaecd43409f72069bc46af309449f7403";
const token_owner_address = "0xa776d89697a79056fe57b626051a8862002dc13f";
const option_registration_enabled = true;

const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]

/* Toc Testnet */

// const option_etherscan_api = 'https://api-ropsten.etherscan.io'; //change to https://api.etherscan.io for mainnet
// const option_etherscan_api_key = 'AH56YE6FZWX7QHMR6JFV3FGHCNWCXCVKCV';
// const erc20contract_address = "0xfd5d98b5918ae8da9ba7fc36d5a6b645b37e9851";
// const erc20contract_function_address = "0xfd5d98b5918ae8da9ba7fc36d5a6b645b37e9851";
// const token_owner_address = "0xa776d89697a79056fe57b626051a8862002dc13f";
// const option_registration_enabled = true;

// const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TOKEN_NAME","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"TOKEN_SYMBOL","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_adminAddress","type":"address"}],"name":"setAdminAddress","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"finalize","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"TOKEN_DECIMALS","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_opsAddress","type":"address"}],"name":"setOpsAddress","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DECIMALSFACTOR","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"opsAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TOKENS_MAX","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"finalized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_proposedOwner","type":"address"}],"name":"initiateOwnershipTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"proposedOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"completeOwnershipTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"adminAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Burnt","type":"event"},{"anonymous":false,"inputs":[],"name":"Finalized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_newAddress","type":"address"}],"name":"AdminAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_newAddress","type":"address"}],"name":"OpsAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_proposedOwner","type":"address"}],"name":"OwnershipTransferInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_newOwner","type":"address"}],"name":"OwnershipTransferCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]

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

router.post('/get_balance', (req, res, next) => {
    const addr = req.body.addr;
    axios.get(option_etherscan_api + "/api?module=account&action=tokenbalance&contractaddress=" + erc20contract_function_address + "&address=" + addr + "&tag=latest&apikey=" + option_etherscan_api_key)
        .then(function (response) {
            _balance = response.data.result / 1000000;
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
    axios.get(option_etherscan_api + '/api?module=account&action=txlist&address=' + addr + '&startblock=0&endblock=99999999&sort=desc&apikey=' + option_etherscan_api_key)
        .then(function (response) {
            const obj = response.data.result;
            for (let i = obj.length - 1; i > -1; i--){
                if (obj[i].input.length == 138 && (obj[i].from == erc20contract_address || obj[i].to == erc20contract_address)){
                    const hex_value = obj[i].input.substr(obj[i].input.length - 40);
                    obj[i].input = parseInt(hex_value, 16) /1000000;
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
                    options.to = erc20contract_address;
                    options.gasPrice = gasPrice;
                    options.gasLimit = 0x33450; //web3.toHex('210000');
                    options.value = 0;
                    const registerTx = lightwallet.txutils.functionTx(ABI, "transfer", [to, value], options);
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
                                    if (res_tx.data.error){
                                        if (res_tx.data.error.message.indexOf(0) == -1){
                                            return res.json({success: false, msg: 'The account you tried to send transaction from does not have enough funds. Required ETH gas. Please check your ethereum balance.'});
                                        }
                                        else {
                                            return res.json({success: false, msg: 'The previous transaction has not completed yet. Please wait and try again'});
                                        }
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