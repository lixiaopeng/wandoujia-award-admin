/*global $, Modernizr, require, _, __dirname, suggestion, Pen, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 18:29:11
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-27 20:46:23
*/

$(function () {

    var searchApi = 'http://apps.wandoujia.com/api/v1/search/';
    var searchAppOverlay = $('#search-app-overlay');
    var appSearchListTpl = $('#app-search-list-tpl');
    var editorHeaderTpl = $('#editor-header-tpl');
    var editorAppBoxTpl = $('#editor-app-box-tpl');
    var editorWrap = $('#editor');
    var isEditing = false;
    var editorOptions = {
        editor: document.getElementById('content'), // {DOM Element} [required]
        class: 'pen', // {String} class of the editor,
        debug: true, // {Boolean} false by default
        textarea: '<textarea name="content"></textarea>', // fallback for old browsers
        list: ['bold', 'italic', 'underline'] // editor menu list
    };

    var renderAppSearchListTpl = function (appList) {
        return (_.template(appSearchListTpl.html()))({appList: appList});
    };

    var renderEditorHeaderTpl = function (app) {
        return (_.template(editorHeaderTpl.html()))(app);
    };

    var renderEditorAppBoxTpl = function (app) {
        return (_.template(editorAppBoxTpl.html()))(app);
    };


    // 智能提示
    $('#search-input').suggestion();

    // 搜索
    $('#app-search-form').submit(function () {
        var name = $('#search-input').val();
        getAppinfoByName(name, false);
        return false;
    });

    // 从搜索结果中选择了某一个应用
    $('#app-search-list').on('click', '.app-card', function () {
        var name = $(this).data('package');
        getAppinfoByName(name, true);
    });

    // 通过搜索API去查询应用信息
    // single 为 false 时，是第一次搜索;
    // 为true 时，是用户选定了某一款app
    function getAppinfoByName(name, single) {
        $.ajax({
            type: 'GET',
            url: searchApi + name,
            success: function (data) {
                // console.log('data', data);

                if (!single) {
                    // 把搜索结果显示在列表中
                    // 截取 app 的简介的长度
                    for (var i = data.appList.length - 1; i >= 0; i--) {
                        data.appList[i].description = data.appList[i].description.substr(0, 50);
                        // console.log('data.appList[i].description', data.appList[i].description);
                    }

                    var appSearchList = renderAppSearchListTpl(data.appList);
                    $('#app-search-list').html(appSearchList).show().scrollTop(0);
                } else {
                    // 得到用户选定的app 信息，插入到模板中
                    var appData = data.appList[0];

                    console.log('所有data', data);

                    console.log('单独某个appData', appData);

                    if (!appData) {
                        showError();
                        return;
                    }

                    // 输出编辑页面 头部
                    var editorHeader = renderEditorHeaderTpl(appData);
                    editorWrap.prepend(editorHeader);

                    // 输出编辑页面 app 块
                    var appBox = renderEditorAppBoxTpl(appData);

                    var oneScreenArray = appData.screenshots.small[0].split('_');
                    var screenWidth = oneScreenArray[1];
                    var screenHeight = oneScreenArray[2].split('.')[0];

                    console.log('screenWidth 宽', screenWidth, 'screenHeight 高', screenHeight);



                    $('#app-box').html(appBox);

                    $('.screenshot-list').width(screenWidth * appData.screenshots.small.length + ((appData.screenshots.small.length - 1) * 5));

                    // 隐藏搜索层
                    searchAppOverlay.fadeOut(function () {
                        $(this).remove();
                    });


                    // 初始化编辑器
                    var myPen = new Pen(editorOptions);

                    isEditing = true;
                }
            }
        });
    }

    function showError() {
        // TODO
        alert('出错了');
    }

    // 页面刷新，如果是正在编辑状态，则弹出提示
    window.onbeforeunload = function (e) {
        // TODO
        // if (isEditing) {
        //     return '文章还没有保存';
        // }
    };
});
