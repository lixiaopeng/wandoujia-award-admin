/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-23 16:27:10
*/

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    // res.send('respond with a resource');
    // res.render('index', { title: 'Express' });
    res.redirect('/admin/articles');
});

router.get('/articles', function (req, res) {
    var articles = ['哈哈', '和'];
    var currentPage = 'admin-articles';

    res.render('index', {
        currentPage: currentPage,
        articles: articles
    });
});

router.get('/drafts', function (req, res) {
    var drafts = ['么么哒', '湖库妈妈她'];
    var currentPage = 'admin-drafts';

    res.render('drafts', {
        currentPage: currentPage,
        drafts: drafts
    });
});

router.get('/articles/new', function (req, res) {
    // res.send('respond with a resource');
    res.render('new', { title: 'Express' });
});

module.exports = router;
