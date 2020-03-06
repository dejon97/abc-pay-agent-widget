/* jslint node: true */
/* jslint esversion: 6 */

'use strict';
require('dotenv').config();
const express = require('express');
const router = express.Router();
var request = require("request");

router.post('/getCatalog', (req, res) => {
        
    var options = { method: 'GET',
        url: 'https://www.parsehub.com/api/v2/projects/tdQPTYuW8hf2/last_ready_run/data',
        qs: { api_key: 't74eqfDqbX93' },
        headers: 
        { 'Postman-Token': '4b148aaf-b602-4e4e-9aa2-f57d9a3ccd67',
            'cache-control': 'no-cache',
            'Content-Type': 'application/json' } ,
        gzip: true
    };
    
    // GET CATALOG VIA PARSEHUB API
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        // console.log(body);
        var catalog = body;
        res.send(catalog);
    });

});

module.exports = router;