# GTX Node API endpoint

This repository provides the endpoint of some crypto coin's feature (wallet generation, price, balance, transactions, transaction histories...)

Currently GTX's endpoint is defined.

All of request are used with post request.

All of request HEADER type are like below.

### Request Header type
```js
headers: {
    'Content-Type': 'application/json'
}
```
## GTX

#### Wallet generation

```js
##### Request Type
URL : '/api/gtx/wallet_generation' : POST
request : "username", "password"
response : "addr", "prv_key", "keystorage", "d12keys", "device_key"

##### Example
request : 
{
	"username": "username",
	"password": "password"
}
response : 
{
    "addr": "0xbace8484e21f8c97a75884db80427008e1c4e473",
    "prv_key": "acab7614037f82bb0439f0aa460f241546d06cdd77cb35bd1639a7f70cbfab2a",
    "keystorage": "{\"encSeed\":{\"encStr\":\"XFNYsMi9VxVSOeqnfbV/zVH4ZSkNLrEqVdkiwlOVV/PCaSMrsHQXMIENyXNmYDy3SmdruxyU+Bxjb4OxSB96ohozS8LQYl4MFprGKdUbc71QTg/sB3P9XCHBpR/HgI8s35NnN7qjdIWrKaJJGAwK8/PJpZVw7GABg9M7AtSZ8ZgIHbN66uxK4A==\",\"nonce\":\"K8jKuUaQxr6u72B6+LPens6lZXJqAkDL\"},\"encHdRootPriv\":{\"encStr\":\"NOX8NwsJ1U3gn48cdfWo4/4mq53hsCbJxy26vwGFAiJ4HcZu6q6l2kTtSMK/cHLph93k7keZ8ik75fmQa2b+UCDIg5T5cYsxOOo65sZzS6LTP9El7vKgAGvrBAzJCWKvij8Qu3nBzl25LpJd6kuBRlSDuDDOIxTIOkSACNlcEA==\",\"nonce\":\"SCK/EzMWKPhSPh0x/IuEGkwKV4pUGIRD\"},\"addresses\":[\"bace8484e21f8c97a75884db80427008e1c4e473\"],\"encPrivKeys\":{\"bace8484e21f8c97a75884db80427008e1c4e473\":{\"key\":\"WVsVGqoJuubDmsF6TUfBUehn5uBh/kKUGMi9/psQRGzYQWSVHd2beyAfn7ATgW2R\",\"nonce\":\"tM4pepUboV5YGAy5Wkyb4+7Dmsti5omf\"}},\"hdPathString\":\"m/0'/0'/0'\",\"salt\":\"M2ENCf+U4knhnPFkxniAWMEkzx2L3ZA2o3KfouW1NYU=\",\"hdIndex\":1,\"version\":3}",
    "d12keys": "demise fever steak genre chef found popular acoustic stool unlock topple dinner",
    "password": "asdfasdf"
}
```

#### Get GTX balance of address

```js
##### Request Type
URL : '/api/gtx/get_balance' : POST
request : "addr"
response : "balance"

##### Example
request : 
{
	"addr": "0x7e3c35b9f5e6653f79cf9b58be518d8b9e3db8d2"
}
response : 
{
    "balance": 30
}
```

#### Get transaction history

```js
##### Request Type
URL : '/api/gtx/get_tx_history' : POST
request : "addr"
response : "gasPrice","_id","blockHash","blockNumber","from","gas",
        "hash", "input","nonce","to","transactionIndex","value","v","r","s"
        "timestamp"
##### Example
request : 
{
	"addr": "0xcd0b7c441d1873477ec9a6c9ee9cc93a8d834c3e"
}
response : 
[
    {
        "gasPrice": {
            "c": [
                0
            ],
            "s": 1,
            "e": 0,
            "isBigNumber": true
        },
        "_id": "5c075c6e0f87452573078496",
        "blockHash": "0xf7803fdb27f103c8433addd4ce443232f9aa601629d61fb6bb5519c466f0ba99",
        "blockNumber": 55490,
        "from": "0xc51ea42754262c4d780de44bcc1e95aa4030913d",
        "gas": 210000,
        "hash": "0x4f496d1e15951cd107c76491c81f30e7b7ff6140d9112dff174a6979738058e0",
        "input": "0x",
        "nonce": 4,
        "to": "0xbc0f555d668d6fd7ec6ecbb601af62845bebc826",
        "transactionIndex": 0,
        "value": "2001-04-30T22:00:00.000Z",
        "v": "0x1c",
        "r": "0x5eb89ae8d156cf01389ae5a1a5682610c50b6e11e05d9a6880544d3b78dac216",
        "s": "0x31209d8c9dd707eb618a03e5ebd62938e80b3aa45a4bba87fb090da5ba9f9552",
        "timestamp": 1543986286
    },
    {
        "gasPrice": {
            "c": [
                0
            ],
            "s": 1,
            "e": 0,
            "isBigNumber": true
        },
        "_id": "5c074eb80f87452573078336",
        "blockHash": "0xc5bebbd081d1bfc434d95308f3c8a5c738e5b56455607467fc3e659b536185db",
        "blockNumber": 55139,
        "from": "0xc51ea42754262c4d780de44bcc1e95aa4030913d",
        "gas": 210000,
        "hash": "0xe8670e15993ad5c2ae4edcba22c3d9b3f348abb150d72796280912673c6ca6fa",
        "input": "0x",
        "nonce": 3,
        "to": "0xbc0f555d668d6fd7ec6ecbb601af62845bebc826",
        "transactionIndex": 0,
        "value": "2001-04-30T22:00:00.000Z",
        "v": "0x1b",
        "r": "0xb3ceb198a5977774bfc785261651d2cfe8866faff98ae3fe1f5993c53a9e4cda",
        "s": "0xf05eaa3715e1dba5cb19a84895f31e40bac316921d4e1971781fca065c8d844",
        "timestamp": 1543982776
    }
]
```

#### Send transaction

```js
##### Request Type
URL : '/api/gtx/send_tx' : POST
request : "addr", "password", "to", "value", "keystroage"
response : "success", "hash", "msg"

##### Example
request : 
{
	"addr": "0xcd0b7c441d1873477ec9a6c9ee9cc93a8d834c3e",
	"password": "password",
	"to": "0x6C7A39F92A50CD4Ba645AdC8679954c4Cb351C58",
	"value": 0.5,
	"keystroage": "{\"encSeed\":{\"encStr\":\"r7V4td8kX8Tv0z7sdT31O22kZROvWwWXLTRhBIAk7+c7yKlMuSQWkobQbAaqRjdDur9lnaKSgLDcOvFmQG3mFVWG90lHHCcsTPbkw5PnehKxiCa0z2I61PGCLtJoilnwOkhGZ+otZDgEbEL6akZMdCFMIhW5o7w1qQYfPgi/zMEnI3hx2RCwqA==\",\"nonce\":\"wMrJU/ftH6+pY5dug6Eu6j+Bn8mblvR9\"},\"encHdRootPriv\":{\"encStr\":\"ZmPyyDupaxQC+UPjm+aqHRznAqhUwK7ZDsvpWotFOlcYc0YOmU2wfNFB0mdlKphqSDSSDQB/Mg9U3w+QUfk8cz0DrfMatGO53Xv6AvNdrMIKCL4uTYMcoQldqBXgV9RvHv4pQWEvyXFulYLomdYd67h4xTOz8mRjGnZngceFLA==\",\"nonce\":\"u7Cd9+olmPhJiq5n8oQXa3lBG5WDshBb\"},\"addresses\":[\"cd0b7c441d1873477ec9a6c9ee9cc93a8d834c3e\"],\"encPrivKeys\":{\"cd0b7c441d1873477ec9a6c9ee9cc93a8d834c3e\":{\"key\":\"nVSppqhwRo47OltlyQpPcOcgUxhpugEliHjFSETGbjlbJaD9BGMEavccKax6oP7p\",\"nonce\":\"lv0bUz5DZfTkket5CzhGalYBAsbUddaK\"}},\"hdPathString\":\"m/0'/0'/0'\",\"salt\":\"e5ApOhUnPhvV105d8EoGzfiTWdgmyBWMUbppnAROjJM=\",\"hdIndex\":1,\"version\":3}"
}

response : 
{
    "success": true,
    "msg": "The request sent successfully",
    "transaction_hash": "0xb5aafee91ee27e9340f1632ccc42e2ceedb775333fdd0aef48aacd3378ef321a"
}

%*% When the previous request was not succeed yet
{
    "success": false,
    "msg": "The previous transaction has not completed yet. Please wait and try again"
}