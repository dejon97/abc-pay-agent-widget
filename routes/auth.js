'use strict';

require('dotenv').config();
const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
//const braintree = require("braintree");
const og = require('open-graph');
const path = require('path');
const isImage = require('is-image-url');
var authData = {};
//var payData = {};

/*var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '8vtdh3r8rxf9r7nt',
    publicKey:    'wbtbbyhsktcbzx53',
    privateKey:   process.env.BRAINTREE_PRIVATE_KEY
});*/

//***  Authentication Section  ***//

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

//***  Rich Link Section  ***//

/*router.post('/richLinkOg', function(req, res){
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
});*/

//***  Apple Pay Section  ***//

/*router.post('/:account/:convId/pay', function(req, res){
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
    gateway.clientToken.generate({}, function (err, response) {
        res.send({token: response.clientToken});
    });
})

router.get('/:account/:convId/selectedProducts', function(req, res){
    //TODO - messaging interactions api get all message lines
    //TODO - sort down to only consumer lines that have "User Selected"
    //TODO - call https://messagingagentwidgets.herokuapp.com/product/<query> for each line and return product
    //TODO - write front-end to select/deselect items, then send as apple pay bubble
});

router.get('/paymentSession', function(req, res){
//     var merchIdentityCert =`-----BEGIN PKCS7-----
// MCcGCSqGSIb3DQEHAqAaMBgCAQExADALBgkqhkiG9w0BBwGgAKEAMQA=
// -----END PKCS7-----`;
    //var merchIdentityCert = fs.readFileSync(path.join(__dirname, '../public/data/merchant_id.pem'));

        const merchIdentityCert = `-----BEGIN CERTIFICATE-----
MIIGOzCCBSOgAwIBAgIIbNoYO7HgmoUwDQYJKoZIhvcNAQELBQAwgZYxCzAJBgNV
BAYTAlVTMRMwEQYDVQQKDApBcHBsZSBJbmMuMSwwKgYDVQQLDCNBcHBsZSBXb3Js
ZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9uczFEMEIGA1UEAww7QXBwbGUgV29ybGR3
aWRlIERldmVsb3BlciBSZWxhdGlvbnMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkw
HhcNMTgxMjAzMTc0MDE2WhcNMjEwMTAxMTc0MDE2WjCBmzEsMCoGCgmSJomT8ixk
AQEMHG1lcmNoYW50LmNvbS5leGFtcGxlLmFiY2RlbW8xQTA/BgNVBAMMOEFwcGxl
IFBheSBNZXJjaGFudCBJZGVudGl0eTptZXJjaGFudC5jb20uZXhhbXBsZS5hYmNk
ZW1vMRMwEQYDVQQLDApHNlFQNkE5WUZYMRMwEQYDVQQKDApKYW1lcyBOZWhmMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzNrRq1m83CHAVzsvuQ00RPs0
JF2f9/WGmtyKUHXVGrsABXABlnCRza1aatnRHrEFXxaYeDBL7iZBNw5In5FraWkd
phxRe1iufaTwGkl4wDtYJFlxKDIa7zy0P+Jdd+6rC//jVS0pXEYKXo4ZFV+sAfA3
zHmmRvurKVbscsdcujZ5jlVd+foGdKbvDZbv1/jRnk82dqngqPMdn6i5rgUIMCnK
a9Jzz9OZ0TxZQi58tc5J6V0r+fhrADEgF0YaL5efP4peMfIRi465F4OGepDJ0XEU
atgtMuI6btmnmGq8fUpLwNgeuYAo1eNR/746fMfHIPcuxBV8SLtMJN6PkVR5rQID
AQABo4IChDCCAoAwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBSIJxcJqbYYYIvs
67r2R1nFUlSjtzBHBggrBgEFBQcBAQQ7MDkwNwYIKwYBBQUHMAGGK2h0dHA6Ly9v
Y3NwLmFwcGxlLmNvbS9vY3NwMDMtYXBwbGV3d2RyY2EyMDYwggEsBgNVHSAEggEj
MIIBHzCCARsGCSqGSIb3Y2QFATCCAQwwNgYIKwYBBQUHAgEWKmh0dHA6Ly93d3cu
YXBwbGUuY29tL2NlcnRpZmljYXRlYXV0aG9yaXR5LzCB0QYIKwYBBQUHAgIwgcQM
gcFSZWxpYW5jZSBvbiB0aGlzIENlcnRpZmljYXRlIGJ5IGFueSBwYXJ0eSBvdGhl
ciB0aGFuIEFwcGxlIGlzIHByb2hpYml0ZWQuIFJlZmVyIHRvIHRoZSBhcHBsaWNh
YmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBjb25kaXRpb25zIG9mIHVzZSwgY2VydGlm
aWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZpY2F0aW9uIHByYWN0aWNlIHN0YXRlbWVu
dHMuMBMGA1UdJQQMMAoGCCsGAQUFBwMCMDAGA1UdHwQpMCcwJaAjoCGGH2h0dHA6
Ly9jcmwuYXBwbGUuY29tL3d3ZHJjYS5jcmwwHQYDVR0OBBYEFGm3ihHi6BBej3jw
bzj1MwMtDY6UMA4GA1UdDwEB/wQEAwIHgDBPBgkqhkiG92NkBiAEQgxAQjE1NTUx
ODBBOEY4MTgwNkY3RkJDRURENUQ5MEI2REMxMEJDMENEQ0NFNkFBMTUyNDBGMUNB
RjVDQTc0NTA1MzAPBgkqhkiG92NkBi4EAgUAMA0GCSqGSIb3DQEBCwUAA4IBAQB4
tXqhKBd9sCH1n3hY2xUyrUExSsg1IRqXxWysKyS/muagLOtcDPPKoRXxNX2f0osA
9kXRSJKbiPEJCx8XmRscscVYA6xA28aHfIPwIoFr7W/a2RZdrytTdumolOOAiz6M
Ylq/FvV1cEkLpECGlRb+iMoH+K9p2ZEq6fh/awXUNfjIPW45TW6SiavoErLTkJxQ
/sDTm47lWgwR+pKPFQxmNeL/KpkP8j1E88zoYuPLMgflALe9Yo9hQMpfcIgaQVAd
kQvpSdkXR8NdNV0SmBcki9PJWdyR5GziqR2KN69X2nYR2ji3zbtV5CDoNib04wnJ
XQ37bpwYJ9AVExVfZ9og
-----END CERTIFICATE-----
`;

        const merchKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAzNrRq1m83CHAVzsvuQ00RPs0JF2f9/WGmtyKUHXVGrsABXAB
lnCRza1aatnRHrEFXxaYeDBL7iZBNw5In5FraWkdphxRe1iufaTwGkl4wDtYJFlx
KDIa7zy0P+Jdd+6rC//jVS0pXEYKXo4ZFV+sAfA3zHmmRvurKVbscsdcujZ5jlVd
+foGdKbvDZbv1/jRnk82dqngqPMdn6i5rgUIMCnKa9Jzz9OZ0TxZQi58tc5J6V0r
+fhrADEgF0YaL5efP4peMfIRi465F4OGepDJ0XEUatgtMuI6btmnmGq8fUpLwNge
uYAo1eNR/746fMfHIPcuxBV8SLtMJN6PkVR5rQIDAQABAoIBAAS1GpBXdZGRbPwU
LhqQhRz4sNANHrnx+G/ilYMX0hfVKED3u/GbEJ6rVyKRcs7Dvp3axRIt+fC1DFaZ
i22vR8qaUcYZbH3rIcddXO8dtRqlwnbDX2hPDnNk77dwGjnBUEjsTmsMqKCoM2DM
3yKwmiFJRd77BKko61v91V0l26mjwEW9hdIokkZYdUY11VdNUOdDuSAvCBC3OS92
4R9ZAwxPtnV3Dmrl8ZujqRrHHwPkHxRjcd583OhK7hJA0ItzFP7QdHf1Yia3/PAz
NwDl9+iQMO2WBgKyc5BTWbSOXNIaqa7YhPXe84FELJmlQhTpCv7vnnjj4RIChHoA
npY4bfkCgYEA9mZRoiT9amvtpSkLDv/9K5kl9uZrE56WJolni9cT8A4vdF9Y07rb
pPWHDMifN0Enw4FL3bTGQiUNXSFu/OknxmQ3yHqd+1/4HK8krR5iS2npkqcDrd0X
NtfzsHY7UWx2PdenYplVOgum5ucxyVlEXx+berNOZ87XGFD2Pdt9IBcCgYEA1NYd
pXKq8TYn2DpfE/yWpDi7B9Lad2j/Jjnw2He584fXMByJSLdqGfx4USjylChNoH9v
xkrZ3oudEfkW5MtuElRyUwLT5eBuNmI5ll23Xa00+tVY0M5nsosvDe16UX0HFidf
ARLse9eMrL3Mvki4HjwRsJRJovGh0y/anr3T6tsCgYAKgS41xXHwWY2WHvvTteIr
O6o8rnIeMgKgvfbmJVM6RsCLK41z6WF31OffCaaQCn0Rfq+nUg+pvj6lm8lJiv8h
HCCssV2O2/aN8oGTx9nU8Tz9/ZTQkr5sniRLf57jx8X6uPjv4S2a/egtq+mZde7O
R2CviHltP4o4BSuaU4MwHQKBgC4pOkjV8+lY+49UKabmE64Od9IckzFu3lfmHSx1
2yjMf4l5xvS0gxibv2Sq4uHrU9rJiO6S8WnpEeoCAkshLABhvGHwrRCgeoblCuRn
8wsoM+NrPlYbTjZVJaF5rhvaaB0P8PUEq7G4cFRO3gcvMm+sS5Hmt4nVqmlpaZsg
RMQdAoGAaItZksgw/A9pamusQFmtUAzs0+R9eHfi9Llozjp+IuadPFzmtzjOv/s9
oVbI0ASartvtDp0hLhbClIaZU8c1bavo4v0jINUQgM1DvyjpYFqM4t+Q2jhEIaBZ
Dk0rjdKovAglPc+dvnsxQPVfVFJOffz93EGuvxjfQx4hCzhquJ8=
-----END RSA PRIVATE KEY-----`;

    
    const options = {
        url: 'https://apple-pay-gateway.apple.com/paymentservices/paymentSession',        
        cert: merchIdentityCert,
        key: merchKey,            
        method: 'POST',
        body:{
                merchantIdentifier: "merchant.com.example.abcdemo",
                displayName: "MyStore",
                initiative: "messaging",
                initiativeContext: "https://messagingagentwidgets.herokuapp.com/apay/paymentGateway"
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

router.post('/paymentGateway', function(req, res){
    console.log('payment gateway is ', req.body);
    res.send({status: 'STATUS_SUCCESS'});
});*/

module.exports = router;