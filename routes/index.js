/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');

const secure = require('express-force-https');
router.use(secure);

//view routes
router.get('/', function(req, res){
	res.render('pages/index');
});

router.get('/listPicker', function(req, res){
	res.render('pages/listPicker');
});

router.get('/datePicker', function(req, res){
	res.render('pages/datePicker');
});

router.get('/richlink', function(req, res){
	res.render('pages/richlink');
});

router.get('/apay', function(req, res){
	res.render('pages/apay');
});

router.get('/auth', function(req, res){
	res.render('pages/auth');
});

router.get('/catalog', function(req, res){
	res.render('pages/catalog');
});

router.get('/ar', function(req, res){
	res.render('pages/ar');
});

module.exports = router;