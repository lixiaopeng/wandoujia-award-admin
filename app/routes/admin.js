/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-23 02:22:50
*/

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.send('respond with a resource');
    // res.render('index', { title: 'Express' });
    // res.redirect('/admin/articles');
});

router.get('/articles', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/drafts', function (req, res) {
    // res.send('respond with a resource');
    res.render('drafts', { title: 'Express' });
});

router.get('/articles/new', function (req, res) {
    // res.send('respond with a resource');
    res.render('new', { title: 'Express' });
});

module.exports = router;
