const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const Schema = mongoose.Schema({
	blockHash: {
		type: 'String'
	},
	blockNumber: {
		type: 'Number'
	},
	from: {
		type: 'String'
	},
	gas: {
		type: 'Number'
	},
	gasPrice: {
		s: {
			type: 'Number'
		},
		e: {
			type: 'Number'
		},
		c: {
			type: [
				'Number'
			]
		},
		isBigNumber: {
			type: 'Boolean'
		}
	},
	hash: {
		type: 'String'
	},
	input: {
		type: 'String'
	},
	nonce: {
		type: 'Number'
	},
	to: {
		type: 'String'
	},
	transactionIndex: {
		type: 'Number'
	},
	value: {
		type: 'Date'
	},
	v: {
		type: 'String'
	},
	r: {
		type: 'String'
	},
	s: {
		type: 'String'
	},
	timestamp: {
		type: 'Number'
	}
});

const Transaction = module.exports = mongoose.model('Transaction', Schema, 'Transaction');
// const block = module.exports = mongoose.model('blocks', Schema);

// module.exports.addAddr = function(newAddr, callback){
//     newAddr.save(callback);
// }

// module.exports.getWalletByPassword = function(password, callback){
//     const query = {password: password}
//     Eth.findOne(query, callback);
// }

module.exports.getTransactionByAddress = function(addr, callback){
	const fromquery = {from: addr}
	const toquery = {to: addr}
	Transaction.find({$or: [fromquery, toquery]}, callback);
    // Transaction.find(fromquery,toquery, callback);
}

// module.exports.getTransactionByAddress = function(addr, callback){
//     const query = {number: 48764}
//     // console.log(Transaction);
//     block.find(query, callback);
// }
