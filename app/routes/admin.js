/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-06-03 20:30:19
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

router.post('/articles/new', function (req, res) {
    res.json({
        text : 'respond with a resource'
    });
    // res.render('new', { title: 'Express' });
});

router.get('/fake/comment', function (req, res) {
    res.json({
            id: 7083462,
            content: '虽然用的频率没有以前那么多，可依然是必备的工具之一。在界面上已经越来越漂亮的，希望功能上可以继续提升。',
            author: {
                id: 19222047, //评论作者ID，来自账号系统
                name: '旁木花生', //评论作者名字
                avatar: 'http://account.wandoujia.com/avatar?uid=19222047&size=MIDDLE', //评论作者头像，暂无数据
            },
        });
});

module.exports = router;
