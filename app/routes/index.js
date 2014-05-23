/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-23 15:50:33
*/

var express = require('express');
var router = express.Router();

/* GET home page. */
/* TODO */
router.get('/', function (req, res) {
    var articles = ['哈哈', '和'];
    res.render('index', { articles: articles });
});

module.exports = router;
