/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

require('dotenv').config();
require('handlebars');
const express = require('express');
const request = require('request');
const path = require('path');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const app = express();
const router = require('./routes/');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json({
    extended: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/', { redirect : false }));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 3000;
const bitlyKey = process.env.BITLY_KEY;
app.use('/', router);
app.use('/listPicker', require('./routes/listPicker'));
app.use('/richlink', require('./routes/richlink'));
app.use('/apay', require('./routes/apay'));
app.use('/auth', require('./routes/auth'));
app.use('/catalog', require('./routes/catalog'));

app.get('/product/:item', function(req, res){
	request.get('https://bananarepublic.gap.com/resources/productSearch/v1/' + req.params.item, 
		function(e,r,b){
			if(e)
				res.json({status: 'error'});
			res.json(b);
        }
    );
});

const server = app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE')
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
}).listen(PORT, function(){
	console.log("Started listening on port " + PORT);
});

const io = socketIO(server, {
    serveClient: true,
    path: '/socket.io'
}).listen(server);

module.exports = server;