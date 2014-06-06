/*global $, Modernizr, require, __dirname, module, exports*/


/*
* @Author: hanjiyun
* @Date:   2014-06-04 11:36:19
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-06-06 17:37:36
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
var contentFolder = path.resolve(__dirname + '/' + '../') + '/content/';

// 设置为中文
moment().lang('zh-cn');

// 文件目录路径
// console.log('__dirname', path.join(__dirname, '../content/drafts'));
var draftsDir =  'app/content/drafts';
var articlesDir = 'app/content/articles';
// var sourceDir =  'app/content/source';

// todo
// 如果是发布文章，需要生成两个文件：原始的 html 和最终的 html


var rmdirSync = (function () {
    function iterator(url, dirs) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            dirs.unshift(url);//收集目录
            inner(url, dirs);
        } else if (stat.isFile()) {
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path, dirs) {
        var arr = fs.readdirSync(path);
        for (var i = arr.length - 1; i >= 0; i--) {
            iterator(path + '/' + arr[i], dirs);
        }
    }

    return function (dir, cb) {
        cb = cb || function () {};
        var dirs = [];

        try {
            iterator(dir, dirs);
            for (var i = dirs.length - 1; i >= 0; i--) {
                fs.rmdirSync(dirs[i]);//一次性删除所有收集到的目录
            }
            cb({text: '删除成功'});
        } catch (e) {//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            // if (e.code === 'ENOENT') {
            //     cb();
            // } else {
            //     cb(e);
            // }
            cb({text: '删除失败', error: e});
        }
    };
})();

exports.removeFolderByPackageName = function (packageName, type, callback) {

    callback = callback || function () {};

    rmdirSync(contentFolder + type + '/' + packageName, callback);
};

exports.mkdirSync = function (isDraft, pageData, url, mode, cb) {
    // 判断是 保存草稿 还是 发布文章
    if (isDraft) {
        url = draftsDir + '/' + url;
    } else {
        url = articlesDir + '/' + url;
    }

    // console.log('url', url);

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
        // console.log('arr', arr);
    }

    function inner(cur) {
        //不存在就创建一个
        if (!fs.existsSync(cur)) {

            // console.log('目录不存在，创建', cur);

            fs.mkdirSync(cur, mode);

            // console.log('inner url', url);

        }

        if (arr.length) {
            // console.log('目录已经存在！！');
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
        // console.log('cur', cur);
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

exports.createJSON = function (appName, packageName, type, callback) {

    callback = callback || function () {};

    exports.addItem(appName, packageName, type, callback);

    // // 先检查是否已经创建了 data.json 文件
    // fs.exists(jsonFile, function (exists) {

    //     if (exists) {
    //         // 如果已经创建
    //         // 把新数据插入到json中
    //         console.log('data.json 存在');
    //         exports.addItem(appName, packageName, type, callback);

    //     // 如果还没有创建
    //     } else {
    //         console.log('data.json 不存在');

    //         // 创建json文件
    //         jf.writeFile(jsonFile, '', function (err) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 // 把新数据插入到json中
    //                 console.log('json 文件创建成功！ 偶也！');
    //                 // exports.addItem(appName, packageName, type, callback);
    //             }
    //         });
    //     }
    // });
};

exports.getJSON = function () {
    // jf.readFile(jsonFile, function (err, obj) {
    //     // console.log(util.inspect(obj));
    //     console.log('1', obj);
    //     return obj;
    // });
    var noData = [];
    if (fs.existsSync(jsonFile)) {
        // console.log('有JSON');
        return jf.readFileSync(jsonFile);
    } else {
        // console.log('没有json');
        return noData;
    }
    // fs.existsSync(jsonFile, function (exists) {
    //     if (exists) {
    //         console.log('有JSON');
    //         return jf.readFileSync(jsonFile);
    //     } else {
    //         console.log('没有json');
    //         return noData;
    //     }
    // });
};

// 从JSON中删除某个条目
exports.removeItem = function (packageName, type, callback, data, isFront) {
    var arr;

    // admin.js 里调用时，没有传过来data 所以需要在这里做一个判断
    // 其实也可以在那边 file.getJSON() 得到 data 的，但是觉得那样不太好，毕竟那边用不到data
    if (data === 'null') {
        data = exports.getJSON();
        console.log('removeItem: data', data);
        // exports.removeFolderByPackageName(packageName, type);
        // return;
    }

    // 遍历json type中的数据
    for (var n = data[type].length - 1; n >= 0; n--) {
        // 如果包名一致
        if (data[type][n].packageName === packageName) {
            // 删除 json 中对应的的条目
            arr = data[type].slice(0, n).concat(data[type].slice(parseInt(n, 10) + 1));
            data[type] = arr;
        }
    }

    // 删除目录
    exports.removeFolderByPackageName(packageName, type);

    // 把新的 data 传回去
    if (isFront) {
        jf.writeFile(jsonFile, data, function (error) {
            if (error) {
                callback({error: error});
            } else {
                callback({text: '删除成功！ 偶也！'});
            }
        });
    } else {
        callback(data);
    }
};

// 网JSON中写入条目
exports.addItem = function (appName, packageName, type, callback) {

    // 先检查是否已经创建了 data.json 文件
    fs.exists(jsonFile, function (exists) {

        if (exists) {

            // 先读取已有JSON中的数据
            var data = exports.getJSON();

            // 如果JSON中type数据是否为空
            // 比如第一次创建JSON时，整个JSON是Null;
            // 或者有可能没有对应的type（只有 draft 或者 只有 article）
            // 这些情况都可能导致 data[type] 为 undefined）
            if (typeof data[type] !== 'undefined') {

                console.log('json中有', type);


                // 判断 JSON 的 type 中是否已经存在当前的 appNanme
                // for (var i = data.articles.length - 1; i >= 0; i--) {
                //     if (data.articles[i].packageName === packageName) {
                //         console.log('已经有了 aaaa');
                //         callback({text: '已经有了', error: '已经写过此APP的设计奖文章'});
                //         exports.removeItem(packageName, 'articles', callback, data, true);
                //     }
                // }

                // 这是一个值得考虑的地方  嘿嘿
                // 如果是发布文章，则把之前对应的草稿(目录和 json)删除
                if (type === 'articles') {
                    console.log('把草稿转为文章 1');
                    exports.removeItem(packageName, 'drafts', function (mes) {
                        // 得到删除item后的新data
                        console.log('mes', mes);
                        data = mes;
                    }, data);
                }

                var newData = {
                    appName: appName,
                    packageName : packageName,
                    creationTime : moment().format('YYYY-MM-DD HH:mm:ss')
                };

                data[type].push(newData);

            } else {
                console.log('json中没有', type);
                // 如果写入json是，里面还没有对应的type
                // 说明这条数据是这个type里的第一条
                data[type] = [{
                        appName: appName,
                        packageName : packageName,
                        creationTime : moment().format('YYYY-MM-DD HH:mm:ss')
                    }];

                // 这是一个值得考虑的地方  嘿嘿
                // 如果是发布文章，则把之前对应的草稿(目录和 json)删除
                if (type === 'articles') {
                    console.log('把草稿转为文章 2');
                    exports.removeItem(packageName, 'drafts', function (mes) {
                        // 得到删除item后的新data
                        console.log('mes', mes);
                        data = mes;
                    }, data);
                }
            }

            jf.writeFile(jsonFile, data, function (error) {
                if (error) {
                    callback({text: '保存草稿失败', error: error});
                } else {
                    callback({text: 'json 文件重写成功！ 偶也！'});
                }
            });

        } else {
            // 如果json文件不存在
            // 说明这条数据是这个json文件 以及 这个 type 里的第一条
            // 这里和上面的那个else重复了，应该可以优化一下
            var one = {};

            one[type] = [{
                    appName: appName,
                    packageName : packageName,
                    creationTime : moment().format('YYYY-MM-DD HH:mm:ss')
                }];

            jf.writeFile(jsonFile, one, function (error) {
                if (error) {
                    callback({text: '失败', error: error});
                } else {
                    callback({text: '成功'});
                }
            });
        }
    });
};


