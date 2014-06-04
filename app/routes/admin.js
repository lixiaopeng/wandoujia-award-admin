/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-06-04 21:42:51
*/

var express = require('express');
var router = express.Router();
var path = require('path');
var file = require('../controller/file-operations');

// 首页 跳转
// apps.wandoujia.com/ => apps.wandoujia.com/admin
router.get('/', function (req, res) {
    // res.send('respond with a resource');
    // res.render('index', { title: 'Express' });
    res.redirect('/admin/articles');
});

// 输出 文章列表 页面
// apps.wandoujia.com/admin/articles/
router.get('/articles', function (req, res) {

    file.createJSON();

    var targetFolder = path.resolve(__dirname + '/' + '../content/articles/');
    var files = file.getAllFoldersAndFiles(targetFolder).files;
    var articles = [];

    for (var i = files.length - 1; i >= 0; i--) {
        console.log('files[i]', files[i]);
        articles.push(files[i].split('/').slice(-2, -1)[0]);
    }

    // console.log('articles', articles);

    var currentPage = 'admin-articles';

    res.render('index', {
        currentPage: currentPage,
        articles: articles
    });
});


// 输出 草稿列表 页面
// apps.wandoujia.com/admin/drafts/
router.get('/drafts', function (req, res) {
    var drafts = ['么么哒', '湖库妈妈她'];
    var currentPage = 'admin-drafts';

    res.render('drafts', {
        currentPage: currentPage,
        drafts: drafts
    });
});


// 输出 撰写文章 页面
// apps.wandoujia.com/admin/articles/new
router.get('/articles/new', function (req, res) {
    // res.send('respond with a resource');
    res.render('new');
});


// 发布新文章
router.post('/articles/new', function (req, res) {
    var pageData = req.body.pageData;
    var directoryName = req.body.directoryName;
    var isDraft = false;

    // 创建文件
    file.mkdirSync(isDraft, pageData, directoryName, 0, function (e) {
        if (e) {
            res.json({
                text : '出错了',
                error : e
            });
        } else {
            res.json({
                text : '文章发布成功'
            });
        }
    });
    // res.render('new', { title: 'Express' });
});


// 保存草稿
router.post('/drafts/new', function (req, res) {
    var pageData = req.body.pageData;
    var directoryName = req.body.directoryName;
    var appName = req.body.appName;
    var packageName = directoryName;
    var isDraft = true;

    // 创建草稿文件
    file.mkdirSync(isDraft, pageData, directoryName, 0, function (e) {
        if (e) {
            res.json({
                text : '出错了',
                error : e
            });
        } else {

            // 创建JSON文件
            file.createJSON(appName, packageName);

            res.json({
                text : '保存草稿成功'
            });
        }
    });
});

// 编辑未发布的草稿
router.get('/edit/:packageName', function (req, res) {
    var file = path.resolve(__dirname + '/' + '../content/drafts/' + req.params.packageName + '/index.html');
    res.sendfile(file);
});

// TODO
// 编辑已发布的文章
router.get('/articles/edit/:packageName', function (req, res) {
    var file = path.resolve(__dirname + '/' + '../content/articles/' + req.params.packageName + '/index.html');
    res.sendfile(file);
});

// 模拟API获取某条评论
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
