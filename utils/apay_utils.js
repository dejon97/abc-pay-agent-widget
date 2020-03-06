'use strict';
const crypto = require('crypto');
const forge = require('node-forge');
const x509 = require('x509');

module.exports = {
    removeWhitespace(key, delimiter, headless){
        let splitKey = key.split('\n');
        splitKey.forEach((line, index) => {
            if(index == 0 || index == splitKey.length - 1)  return;
            splitKey[index] = line.replace(/\s/g, '');
        })
        if(headless){
            splitKey.shift();
            splitKey.pop();
        }
        const cleanedKey = splitKey.join(delimiter);
        // console.log(`[utils/apay_utils] :: Cleaned result is \n${cleanedKey}`)
        return cleanedKey;
    },
    extractMerchantId(cert) {
        try {
          var info = x509.parseCert(cert);
          let merchantId = info.extensions['1.2.840.113635.100.6.32'].substr(2);
          console.log(`[utils/apay_utils] :: Merchant ID: ${merchantId}`);
          return merchantId;
        } catch (e) {
          console.error("Unable to extract merchant ID from certificate ");
        }
    },
    generateSharedSecret(merchantPrivateKey, ephemeralPublicKey){
        let
        om,
        ecdh = crypto.createECDH('prime256v1');
        ecdh.setPrivateKey(((Buffer.from(merchantPrivateKey, 'base64')).toString('hex')).substring(14, 64 + 14),'hex'); // 14: Key start, 64: Key length
            try{
            om = ecdh.computeSecret(((Buffer.from(ephemeralPublicKey, 'base64')).toString('hex')).substring(52, 130 + 52),'hex','hex'); // 52: Key start, 130: Key length
            }catch(e){
            return e;
            }
            console.log(`[utils/apay_utils] :: Shared Secret: ${om}`);
            return om;
    },
    generateSymmetricKey(merchantId, sharedSecret){
        const
              KDF_ALGORITHM = String.fromCharCode(0x0D) + 'id-aes256-GCM',
              KDF_PARTY_V = Buffer.from(merchantId, 'hex').toString('binary'),
              KDF_INFO = KDF_ALGORITHM + 'Apple' + KDF_PARTY_V
            ;
        
        let hash = crypto.createHash('sha256')
        hash.update(Buffer.from('000000', 'hex'))
        hash.update(Buffer.from('01', 'hex'))
        hash.update(Buffer.from(sharedSecret, 'hex'))
        hash.update(KDF_INFO, 'binary')
        
        return hash.digest('hex');
    },
    decryptCiphertext(symmetricKey, cipherText){

        const data = forge.util.decode64(cipherText)
        const SYMMETRIC_KEY = forge.util.createBuffer((Buffer.from(symmetricKey, 'hex')).toString('binary'))
        const IV = forge.util.createBuffer((Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toString('binary')) // Initialization vector of 16 null bytes
        const CIPHERTEXT = forge.util.createBuffer(data.slice(0, -16))
    
        const decipher = forge.cipher.createDecipher('AES-GCM', SYMMETRIC_KEY) // Creates and returns a Decipher object that uses the given algorithm and password (key)
        const tag = data.slice(-16, data.length)
    
        decipher.start({
          iv: IV,
          tagLength: 128,
          tag
        })
    
        decipher.update(CIPHERTEXT)
        decipher.finish()
        return Buffer.from(decipher.output.toHex(), 'hex').toString('utf-8')
      
    },
    sampleApplePayToken: {body: {"version":"EC_v1","data":"v/2ZOMbOor6VMP27avSRphbspodngivLgd/ic4o9BkWBybXH83vTi1juWxTT6YroAoGbSHn9UsLeuv6xUAA1d89jP2AmHRhcgN64Rg2qUw1lqkiqp49WNB5bTmG63JcrNQqEGnZiZnhzRf739Xi3bFR/VGUgJ+7oaBPRDfOYNjioKkbkdXlUZwy8PHoS2tIjBbO+JrLQO3VEkl49IpqzYb0l+gP445lKcrlDWgLiYmGy6RpiS406zfl3KQfugLCqWrqkRn4AuarSvU0wYb/CH2okHbrk8QksLekjYE/7WNJXv13gAqSECAvZeEMf7FY5x9V2kYlTIQwKwL6Jk/i5BnnaY2eWYtkDhw+qxnrlrqdCRVOmr1VfTQaH2QRPsX+7YxOYZziQvjceAi1xRqgD9hWhfYwv6qXyA4V7SOmLMJQ=","signature":"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","header":{"ephemeralPublicKey":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEsw+zXidR6buLx5BMU9jskwPhQmqebLeInkF/oUcqrCDEPiUQeRbWzLu7DElJxO79Qzn1bobb9nVv1Iqr+25/Lw==","publicKeyHash":"dtyhnBk4iPOpVCituDGsdvYKvi/F25zbeZIyQ79opuU=","transactionId":"b39d930512e619fd9b36bd1d7199a0a86c4d0bb2bbc9bad6173408878aa9b708"}}}
}