/* jslint node: true */
/* jslint esversion: 6 */

'use strict';
require('dotenv').config();
const express = require('express');
const router = express.Router();
const request = require('request');

router.post('/submitItem', (req, res) => {
    if(req.body.data && req.body.url){
        request.post({
            url: 'https://lpdemoutils.herokuapp.com/scTasksPUT',
            json: true, 
            header: {
                'content-type': 'application/json'
            },
            body: {
                AWS_ID: process.env.AWS_PUTKEY,
                url: req.body.url,
                data: req.body.data
            }
        }, (e, r, b) => {
            if(e){
                console.log(e);
                res.send(e);
            }else{
                console.log(b);
                res.send(b);
            }
        });
    }else{
        res.status(401).send('You are missing body options!');
    }
});

module.exports = router;