/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-06-04 14:08:41
*/

var express = require('express');
var router = express.Router();
var path = require('path');

/* GET admik home page. */

/* TODO */
// router.get('/', function (req, res) {
//     var articles = ['哈哈', '和'];
//     res.render('index', { articles: articles });
// });


// 输出某篇文章页面
// e.g. www.wandoujia.com/award/blog/com.baiyicare.cycle
// 需要本地做一下代理
router.get('/award/blog/:packageName', function (req, res) {
    // todo
    // res.send(req.params.packageName);
    var file = path.resolve(__dirname + '/' + '../content/articles/' + req.params.packageName + '/index.html');
    res.sendfile(file);

    // res.render('new', { title: 'Express' });
});

module.exports = router;
