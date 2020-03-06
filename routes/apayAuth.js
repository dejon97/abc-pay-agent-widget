'use strict';

require('dotenv').config();
const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const braintree = require("braintree");
const og = require('open-graph');
const path = require('path');
const isImage = require('is-image-url');
const apayUtils = require('../utils/apay_utils');
const apayCerts = require('../utils/apay_certs');
const keyPublishable = process.env.STRIPE_PUBLISHABLE;
const keySecret = process.env.STRIPE_SECRET;

const PaymentToken = require('apple-pay-decrypt')

const stripe = require('stripe')(keySecret);

var braintreeGateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '8vtdh3r8rxf9r7nt',
    publicKey:    'wbtbbyhsktcbzx53',
    privateKey:   process.env.BRAINTREE_PRIVATE_KEY
});

var authData = {};
var payData = {};

const merchKeyOneLine = apayCerts.CIRCA_2017.merchKeyOneLine;
const merchKey = apayCerts.CIRCA_2017.merchKey;
const merchIdentityCert = apayCerts.CIRCA_2017.merchIdentityCert;

const certPem = apayCerts.CIRCA_2020.certPem;
const privatePem = apayCerts.CIRCA_2020.privatePem;

const processPaymentGateway = (req, res) => {
    //console.log('paymentSessionData ' + JSON.stringify(req.body));
    //console.log(req.body);


    let paymentSessionData = req.body;
    let paymentDataEncrypted =  (paymentSessionData.data && 
                                paymentSessionData.signature && 
                                paymentSessionData.header) ? 
    paymentSessionData : JSON.parse(paymentSessionData.payment.paymentToken.paymentData)

    // console.log(`Encrypted data is ${JSON.stringify(paymentDataEncrypted)}`);

    // ***** Method 1 - Via sidimansourjs method https://github.com/sidimansourjs/applepay-token
    let sharedSecret = apayUtils.generateSharedSecret(apayUtils.removeWhitespace(privatePem, '', true), paymentDataEncrypted.header.ephemeralPublicKey);
    let symmetricKey = apayUtils.generateSymmetricKey(apayUtils.extractMerchantId(certPem, '\n'), sharedSecret);
    let paymentDataDecrypted = apayUtils.decryptCiphertext(symmetricKey, paymentDataEncrypted.data);

    // ***** Method 2 - Via samcorcos method https://github.com/samcorcos/apple-pay-decrypt
    // const token = new PaymentToken(paymentDataEncrypted); 
    // const paymentDataDecrypted = token.decrypt(
    //     apayUtils.removeWhitespace(certPem), 
    //     apayUtils.removeWhitespace(privatePem)
    // );

    console.log(`Decrypted data is ${paymentDataDecrypted}`);

    res.send({status: 'STATUS_SUCCESS'});

    // stripe.customers.create({
    //     email: 'test@xyz.com'
    // }).then(customer => {
    //     console.log(`Customer is ${JSON.stringify(customer)}`);

    //     stripe.charges.create({
    //         amount: 10,
    //         description: 'test payment',
    //         currency: 'usd',
    //         customer: customer.id
    //     }).then(charge => {
    //         console.log(`Charge is ${JSON.stringify(charge)}`);

    //         res.send({status: 'STATUS_SUCCESS'});
    //     }).catch(e => {
    //         res.status(500).send({status: 'FAILED TO COMPLETE CHARGE'});
    //     })
    // }).catch(e => {
    //     res.status(500).send({status: 'FAILED TO GENERATE CUSTOMER'});
    // });
}

router.post('/:account/:convId/auth', function(req, res){
    console.log('Request to send routine. With opbody', req.body);
    if(req.body.token){
        authData[`${req.params.account}-${req.params.convId}`] = req.body.token;
        res.send({ success: true, token: req.body.token});
    }else{
        res.send({ success: false, error: 'Missing body params'});
    }
});

router.get('/:account/:convId/auth', function(req, res){
    if(authData[`${req.params.account}-${req.params.convId}`]){
        res.send({ success: true, token: authData[`${req.params.account}-${req.params.convId}`]});
    }else{
        res.send({ success: false });
    }
});

router.post('/richLinkOg', function(req, res){
    og(req.body.link, (err, meta) => {
        if(!err){
            console.log(meta);
            var responseBody = {};
            var fullImageLink = meta && meta.image && meta.image.url;
            if(fullImageLink.indexOf('http') === -1){
                fullImageLink = req.body.link + fullImageLink;
            }
            responseBody.imageurl = meta && meta.image && isImage(fullImageLink) ? fullImageLink : 'https://chrisjamestest.neocities.org/img/lplogo.png';
            responseBody.title = meta.title;
            res.send(responseBody);

        }else{      
            console.log('ERROR getting og metadata ', err);
            res.send(err);
        }
    });
});

router.post('/:account/:convId/pay', function(req, res){
    console.log('Request to send routine. With opbody', req.body);

    if(req.body.response){
        payData[`${req.params.account}-${req.params.convId}`] = req.body.response;
        res.send({ success: true, response: req.body.response});
    }else{
        res.send({ success: false, error: 'Missing body params'});
    }
});

router.get('/:account/:convId/pay', function(req, res){
    if(payData[`${req.params.account}-${req.params.convId}`]){
        res.send({ success: true, response: payData[`${req.params.account}-${req.params.convId}`]});
    }else{
        res.send({ success: false });
    }
});


router.get('/:account/:convId/clientToken', function(req, res){
    braintreeGateway.clientToken.generate({}, function (err, response) {
        res.send({token: response.clientToken});
    });
})

router.get('/:account/:convId/selectedProducts', function(req, res){
    //TODO - messaging interactions api get all message lines
    //TODO - sort down to only consumer lines that have "User Selected"
    //TODO - call https://agentmessagingwidgets.herokuapp.com/product/<query> for each line and return product
    //TODO - write front-end to select/deselect items, then send as apple pay bubble
});

router.get('/paymentSession', function(req, res){
    //var merchIdentityCert = fs.readFileSync(path.join(__dirname, '../public/data/merchant_id.pem'));
    
    const options = {
        url: 'https://apple-pay-gateway.apple.com/paymentservices/paymentSession',        
        cert: apayUtils.removeWhitespace(merchIdentityCert, '\n'),
        key: apayUtils.removeWhitespace(merchKey, '\n'),           
        method: 'POST',
        body:{
                merchantIdentifier: "merchant.com.example.abcdemo",
                displayName: "MyStore",
                initiative: "messaging",
                initiativeContext: "https://agentmessagingwidgets.herokuapp.com/apayAuth/paymentGateway"
              },
         json: true,
    };
    console.log(JSON.stringify(options));
    request(options, (e, r, b)=>{
        if(e){
            console.log(e);
            res.send(e);
        }
        else{
            console.log(b);
            res.send(b);
        }
    })
})

router.post('/paymentGateway', processPaymentGateway);

// processPaymentGateway(apayUtils.sampleApplePayToken, { send: (param) => { console.log(`Res.send is ${JSON.stringify(param)}`); } });

module.exports = router;