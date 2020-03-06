const express = require('express');
const router = express.Router();

const request = require('request');
const checkImage = require('../utils/checkImage');
const cheerio = require('cheerio');
const validUrl = require('valid-url');
const charset = require('charset');
const iconv  = require('iconv-lite');
const fs = require('fs');
const path = require("path");

function notIp (url) {
  var ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  var hostName = new URL (url) ? new URL (url).hostname : '';
  if(hostName.match(ipRegex)) {
    return false;
  } else {
    return true;
  }
}

function scrape(html) {
  //console.log('scrape');
  var $ = cheerio.load(html);
  var ogTags = []
  $('meta[property^=og]').each(function() {
    if($(this).attr('content')) {
      //console.log($(this));
      if($(this).attr('property').toLowerCase() == 'og:image') {
        var check = checkImage($(this).attr('content'),true);
        if(check && check.contentType) {
          ogTags.push({
            content: $(this).attr('content'),
            property: $(this).attr('property'),
            contentType: check.contentType
          });
        } else if(check) {
          ogTags.push({
            content: $(this).attr('content'),
            property: $(this).attr('property')
          });
        }
      } else {
        ogTags.push({
          content: $(this).attr('content'),
          property: $(this).attr('property')
        });
      }
    }
    //console.log(ogTags);
  });
  $('meta[name=description]').each(function() {
    if($(this).attr('content')) {
      ogTags.push({
        content: $(this).attr('content'),
        property: $(this).attr('name')
      });
    }
    //console.log(ogTags);
  });
  $('title').each(function() {
    if($(this).text().trim()) {
      ogTags.push({
        content: $(this).text().trim(),
        property: 'title'
      });
    }
    //console.log(ogTags);
  });
  $('link[rel="shortcut icon"]').each(function() {
    if($(this).attr('href')) {
      ogTags.push({
        content: $(this).attr('href'),
        property: 'favicon'
      });
    }
    //console.log(ogTags);
  });
  return ogTags;
};

router
  .route('/scrapeOg')
  .get((req,res) => {
      var url = req.query.url ? req.query.url : undefined;
    
      if(!validUrl.isUri(url) || !notIp(url)) {
        res.status(400);
        res.send({error:'not a valid url'});
      } else {
        //console.log(url);
        var options = {
          url: url,
          method: 'GET',
          headers: {
            'User-Agent':'curl'
          },
          encoding: null
        };
        request(options, function(error, response, body) {   
          if (!error) {
            var contentType = response.headers['content-type'];
            //console.log(charset(response.headers['content-type']));
            var characterSet = charset(response.headers['content-type']);
            characterSet = characterSet ? characterSet : 'utf8';
            if(contentType.indexOf('text/html') != -1) {
              if(characterSet !== 'utf8') {
                body = iconv.decode(body, characterSet.toUpperCase());
              }
              var ogTags = scrape(body);
              res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
              res.send({
                ogTags: ogTags
              });
              //res.send(proxied);
            } else {
              res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
              res.send({
                ogTags: []
              });
            }
          } else {
            //console.log(error);
            var status = response && response.statusCode ? response.statusCode : 500;
            res.status(status);
            // log.error(error);
            res.send(error);
          }
        });
      }
    }
  );

  router
  .route('/translate')
  .get((req,res) => {
    var lang = req.query.lang ? req.query.lang : undefined;
    if(lang) {
      const filePath = path.resolve(__dirname, `../../translations/${lang}.json`);
      fs.readFile(filePath, (err, data) => {
          if (err) {
            log.error(err);
            res.status(404);
            res.send({});
          } else {
            res.send(data);
          }
          // You can now play with your datas
      });
    } else {
      res.status(400);
      res.send({code:'Need lang parameter'});
    }
  });

  module.exports = router;