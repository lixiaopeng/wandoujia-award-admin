/*global $, Modernizr, require, __dirname, module, exports*/


/*
* @Author: hanjiyun
* @Date:   2014-06-04 11:36:19
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-06-04 21:54:47
*/


var fs = require('fs');
var path = require('path');
var util = require('util');
var jf = require('jsonfile');
var moment = require('moment');

// Number of spaces to indent JSON files.
jf.spaces = 4;

// json 文件存放路径
// 用来存储 文章名称 发布时间 等数据
var jsonFile = path.resolve(__dirname + '/' + '../') + '/data.json';

// 设置为中文
moment().lang('zh-cn');

// 文件目录路径
// console.log('__dirname', path.join(__dirname, '../content/drafts'));
var draftsDir =  'app/content/drafts';
var articlesDir = 'app/content/articles';
var sourceDir =  'app/content/source';

// todo
// 如果是发布文章，需要生成两个文件：原始的 html 和最终的 html

exports.mkdirSync = function (isDraft, pageData, url, mode, cb) {
    // 判断是 保存草稿 还是 发布文章
    if (isDraft) {
        url = draftsDir + '/' + url;
    } else {
        url = articlesDir + '/' + url;
    }

    console.log('url', url);

    // var path = require('path');
    var arr = url.split('/');

    mode = mode || 0755;
    cb = cb || function () {};

    //处理 ./aaa 这种路径
    if (arr[0] === '.') {
        arr.shift();
    }

    //处理 ../ddd/d 这种路径
    if (arr[0] === '..') {
        arr.splice(0, 2, arr[0] + '/' + arr[1]);
        console.log('arr', arr);
    }

    function inner(cur) {
        //不存在就创建一个
        if (!fs.existsSync(cur)) {

            console.log('目录不存在，创建', cur);

            fs.mkdirSync(cur, mode);

            console.log('inner url', url);

        }

        if (arr.length) {
            console.log('目录已经存在！！');
            inner(cur + '/' + arr.shift());
        } else {
            cb();
        }

        // 在目录中创建 index.html 文件
        fs.open(url + '/index.html', 'w', 0644, function (e, fd) {
            if (e) {
                throw e;
            }
            // 在 index.html 文件中写入内容
            fs.write(fd, pageData, 0, 'utf8', function (e) {
                if (e) {
                    throw e;
                }
                fs.closeSync(fd);
            });
        });
    }

    if (arr.length) {
        var cur = arr.shift();
        console.log('cur', cur);
        inner(cur);
    }
};

exports.getAllFoldersAndFiles = function (dir) {
    var folders = [];
    var files = [];

    function iterator(dir, folders, files) {
        var stat = fs.statSync(dir);
        if (stat.isDirectory()) {
            // console.log('dir=', dir);
            folders.unshift(dir);//收集目录
            inner(dir, folders, files);
        } else if (stat.isFile()) {
            files.unshift(dir);//收集文件
        }
    }

    function inner(path, folders, files) {
        var arr = fs.readdirSync(path);

        console.log('arr', arr);

        for (var i = arr.length - 1; i >= 0; i--) {

            iterator(path + '/' + arr[i], folders, files);
        }

        // for (var i = 0, el; el = arr[i++];) {
        //     iterator(path + '/' + el, folders);
        // }
    }

    try {
        iterator(dir, folders, files);
    } catch (e) {
        throw e;
    } finally {
        return {
            folders : folders,
            files : files
        };
    }
};

exports.createJSON = function (appName, packageName) {

    var data;

    // 先检查是否已经创建了 data.json 文件
    fs.exists(jsonFile, function (exists) {

        // 如果已经创建
        if (exists) {
            console.log('data.json 存在');
            // TODO

        // 如果还没有创建
        } else {
            console.log('data.json 不存在');

            data = {
                drafts: [{
                    appName : appName,
                    packageName : packageName,
                    creationTime : moment().format('YYYY-MM-DD HH:mm:ss')
                }]
            };

            // 创建json文件
            jf.writeFile(jsonFile, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('json 文件创建成功！ 偶也！');
                }
            });
        }
    });
};

exports.getJSON = function () {
    jf.readFile(jsonFile, function (err, obj) {
        console.log(util.inspect(obj));
    });
};
