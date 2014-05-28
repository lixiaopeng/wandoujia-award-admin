/*global $, Modernizr, require, _, __dirname, suggestion, Pen, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 18:29:11
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-28 21:41:29
*/

$(function () {

    var searchApi = 'http://apps.wandoujia.com/api/v1/search/';
    var searchAppOverlay = $('#search-app-overlay');
    var appSearchListTpl = $('#app-search-list-tpl');
    var editorHeaderTpl = $('#editor-header-tpl');
    var editorAppBoxTpl = $('#editor-app-box-tpl');
    var editorWrap = $('#editor');
    var isEditing = false;

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
    function getAppinfoByName(name, selectedOneApp) {
        $.ajax({
            type: 'GET',
            url: searchApi + name,
            success: function (data) {
                // console.log('data', data);

                if (!selectedOneApp) {
                    // 把搜索结果显示在列表中
                    var appSearchList = renderAppSearchListTpl(data.appList);
                    $('#app-search-list').html(appSearchList).show().scrollTop(0);
                } else {
                    // 得到用户选定的 app 信息，插入到编辑页面模板中
                    renderEditPage(data);
                }
            }
        });
    }

    // 输出编辑页面
    function renderEditPage(data) {
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
        $('#app-box').html(appBox);

        // 处理 app 截图
        screenshotsArrangeHandle(appData);


        // 顶部图片提交处理
        heroCoverSubmitHandle();

        // 初始化编辑器
        // 可编辑 APP 名称
        var appTitlePenOptions = {
            editor: document.getElementById('app-title'),
            class: 'pen1',
            debug: true,
            textarea: '<input name="app-title" />',
            list: null
        };

        // 可编辑文章标题
        var articleTitlePenOptions = {
            editor: document.getElementById('article-title'),
            class: 'pen2',
            debug: true,
            textarea: '<input name="article-title" />',
            list: null
        };

        // 可编辑文章内容
        var articleContentPenOptions = {
            editor: document.getElementById('article-content'),
            class: 'pen',
            debug: true,
            textarea: '<textarea name="article-content"></textarea>',
            list: ['bold', 'italic', 'underline']
        };


        var appTitlePen = new Pen(appTitlePenOptions);
        var artileTitlePen = new Pen(articleTitlePenOptions);
        var articleContentPen = new Pen(articleContentPenOptions);


        // 设为编辑状态
        isEditing = true;

        // 隐藏之前的搜索层
        searchAppOverlay.fadeOut(function () {
            $(this).remove();
        });
    }

    // app 截图处理
    function screenshotsArrangeHandle(appData) {
        // 实际
        var oneScreenArray = appData.screenshots.small[0].split('_');
        var screenWidth = oneScreenArray[1];
        var screenHeight = oneScreenArray[2].split('.')[0];

        console.log('screenWidth 宽', screenWidth, 'screenHeight 高', screenHeight);

        $('.screenshot-list').width(screenWidth * appData.screenshots.small.length + ((appData.screenshots.small.length - 1) * 5));
    }

    // 顶部图片提交处理
    function heroCoverSubmitHandle() {
        $('#hero-cover-input-wrap').submit(function () {
            event.preventDefault();

            var inputPath = $('#hero-cover-input').val();

            // 验证是否为图片
            if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(inputPath)) {
                alert('图片类型必须是.gif,jpeg,jpg,png中的一种');
                return;
            } else {
                $('#cover-wrap').css({
                    'background-image': 'url(' + inputPath + ')'
                });
            }

            // 显示/隐藏 输入框
            toggleCoverInput();

            return false;
        });

        var chageCoverBtn = $('#change-cover');
        chageCoverBtn.click(function () {
            // 显示/隐藏 输入框
            toggleCoverInput();
        });
    }

    function toggleCoverInput() {
        var input = $('#hero-cover-input-wrap');
        var chageCoverBtn = $('#change-cover');
        var isHidden = input.is(':hidden');

        if (isHidden) {
            input.show();
            chageCoverBtn.hide();
        } else {
            input.hide();
            chageCoverBtn.show();
        }
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
