/*global $, Modernizr, require, _, __dirname, suggestion, Pen, module, classie, jQuery, globalData*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 18:29:11
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-06-06 16:20:18
*/

$(function () {

    // API
    var searchApi = 'http://apps.wandoujia.com/api/v1/search/';
    var option = '?max=12&start=0&opt_fields=description,likesCount,title,packageName,icons.px48,icons.px100,tagline,screenshots.normal,installedCountStr,installedCount,commentsCount,award.*';

    // 页面元素
    var searchAppOverlay = $('#search-app-overlay');
    var appSearchListTpl = $('#app-search-list-tpl');
    var editorHeaderTpl = $('#editor-header-tpl');
    var editorAppBoxTpl = $('#editor-app-box-tpl');
    var editorCommentBoxTpl = $('#editor-comment-box-tpl');
    var editorWrap = $('#editor');
    var article = $('#article-content');

    // 页面是否已经保存了草稿或者已经发布
    var dataSaved = false;

    // 用来传给后端
    var packageName;
    var appName;

    // 评论和访谈模板的初始ID;
    var commentTplId = 1;
    var interviewTplId = 1;

    // 模板输出
    var renderAppSearchListTpl = function (appList) {
        return (_.template(appSearchListTpl.html()))({appList: appList});
    };

    var renderEditorHeaderTpl = function (app) {
        return (_.template(editorHeaderTpl.html()))(app);
    };

    var renderEditorAppBoxTpl = function (app) {
        return (_.template(editorAppBoxTpl.html()))(app);
    };

    var renderEditorCommentBoxTpl = function (commentData) {
        return (_.template(editorCommentBoxTpl.html()))(commentData);
    };


    // 当前页面状态 用来判断 草稿、文章、新建
    if (typeof globalData !== 'undefined') {
        console.log('当前页面状态 mode:', globalData);
        if (globalData.mode === 'drafts') {

            packageName = globalData.packageName;
            appName = globalData.appName;

            heroCoverSubmitHandle();
            initPenEditor();
            initTools();
            pageScrollHandle();
        }
    }

    // 通过搜索API去查询应用信息
    // single 为 false 时，是第一次搜索;
    // 为true 时，是用户选定了某一款app
    function getAppinfoByName(name, selectedOneApp) {
        $.ajax({
            type: 'GET',
            url: searchApi + name + option,
            success: function (data) {

                if (!selectedOneApp) {
                    console.log('所有data', data);
                    // 把搜索结果显示在列表中
                    var appSearchList = renderAppSearchListTpl(data.appList);
                    $('#app-search-list').html(appSearchList).show().scrollTop(0);
                } else {
                    console.log('选择的data', data);
                    // todo
                    showLoading();

                    // 得到用户选定的 app 信息，插入到编辑页面模板中
                    renderEditPage(data);
                }
            }
        });
    }

    // 输出编辑页面
    function renderEditPage(data) {
        var appData = data.appList[0];
        var awardData = null;

        console.log('单独某个appData', appData);

        if (!appData) {
            // TODO
            // 搜索某些包名是会得不到数据
            // e.g: com.bestcoolfungamesfreegameappcreation.fireworks
            showMessage('error', '未知原因');
            return;
        }

        // 得到APP的包名，创建目录时会用到
        packageName = appData.packageName;
        // 有的 app (eg: line) 的 title 会包含一些字符 <em> ） 等，需要替换掉
        appName = appData.title.replace(/(<|\/|em>|\)|）)/g, '');

        // 输出编辑页面 头部
        var editorHeader = renderEditorHeaderTpl(appData);
        editorWrap.prepend(editorHeader);

        // 输出编辑页面 app 块
        var appBox = renderEditorAppBoxTpl(appData);
        $('#app-box').html(appBox);

        // 处理 app 截图 (重设高宽)
        screenshotsArrangeHandle(appData);


        // 顶部图片提交处理
        heroCoverSubmitHandle();

        // 初始化编辑器
        initPenEditor();

        // 初始化工具
        initTools();

        // 判断该 app 是否已经自带 award
        if (appData.award.blogTitle) {
            awardData = appData.award;
            setAwardData(awardData);
        }

        // 隐藏之前的搜索层
        searchAppOverlay.fadeOut(150, function () {
            $(this).remove();
            $('#main').addClass('editing');
            $('#content').fadeIn(150);

            // 页面滚动
            pageScrollHandle();
        });
    }

    // app 截图处理
    function screenshotsArrangeHandle(appData) {

        // 设置固定高度
        var staticHeight = 333;

        // 现在是取的第一个截图
        //  Todo: 需要 check 一下同一个 app
        // 的截图中同时包含横屏和竖屏的情况,
        // 那样的话就需要的都每个截图原始的比例
        // 然后重设新的高宽

        var oneScreenArray = appData.screenshots.normal[0].split('_');
        var screenShotsWidth = oneScreenArray[1];
        var screenShotsHeight = oneScreenArray[2].split('.')[0];
        var scale = screenShotsHeight / screenShotsWidth;

        var shotsPic = $('.screenshot-list img');

        var newWidth = Math.round(staticHeight / scale);

        // 因为有些截图的尺寸不一致
        // 所以需要按高宽比 重设截图尺寸
        for (var i = shotsPic.size() - 1; i >= 0; i--) {
            $(shotsPic[i]).width(newWidth);
        }

        // console.log('screenWidth 宽', screenShotsWidth, 'screenHeight 高', screenShotsHeight);

        $('.screenshot-list').width(newWidth * appData.screenshots.normal.length + ((appData.screenshots.normal.length - 1) * 5));
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
                $('#cover-wrap img').attr('src', inputPath);
            }

            // 显示/隐藏 输入框
            toggleCoverInput();

            return false;
        });

        var chageCoverBtn = $('#change-cover .button');
        chageCoverBtn.click(function () {
            // 显示/隐藏 输入框
            toggleCoverInput();
        });
    }

    // 切换封面编辑状态
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

    // 启动编辑器
    function initPenEditor() {
        // 复制粘贴富文本内容时，转成text
        $('[contenteditable]').on('paste', function (e) {
            e.preventDefault();
            var text = (window.clipboardData || (e.originalEvent || e).clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });

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
            // list: ['blockquote', 'h2', 'h3', 'p', 'insertorderedlist', 'insertunorderedlist', 'inserthorizontalrule', 'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
            list: null
        };

        // 初始化 Pen
        var appTitlePen = new Pen(appTitlePenOptions);
        var artileTitlePen = new Pen(articleTitlePenOptions);
        var articleContentPen = new Pen(articleContentPenOptions);
    }

    // 启动左侧的工具条功能
    function initTools() {
        // 插入评论 input
        $('#insert-comment').focus(function () {
            article.focus();
        }).click(function (e) {
            e.preventDefault();
            // 生成ID
            commentTplId = commentTplId + 1;
            var tpl = $('#insert-tpl .comment-tpl-wrap').clone().attr('id', 'comment-tpl-' + commentTplId);
            insertNodeAtCaret(tpl[0]);
            // focus 刚刚插入的 input
            $('#comment-tpl-' + commentTplId + ' input').focus();
        });

        // 插入访谈 input
        $('#insert-interview').focus(function () {
            article.focus();
        }).click(function (e) {
            e.preventDefault();
            // 生成ID
            interviewTplId = interviewTplId + 1;
            var tpl = $('#insert-tpl .interview-tpl-wrap').clone().attr('id', 'interview-tpl-' + interviewTplId);
            insertNodeAtCaret(tpl[0]);
            // focus 刚刚插入的 input
            $('#interview-tpl-' + interviewTplId + ' input').focus();
        });

        // 删除某条 评论 | 访谈
        article.on('click', '.box-action .remove', function () {
            var $t = $(this);
            var commentParent = $t.parents('.comment-tpl-wrap').eq(0);
            var interviewParent = $t.parents('.interview-tpl-wrap').eq(0);

            if (confirm('真的要删除它吗？')) {
                // 判断删除的模板是 comment 还是 interview
                if (commentParent.size() > 0) {
                    commentParent.remove();
                    commentTplId = commentTplId - 1;
                } else if (interviewParent.size() > 0) {
                    interviewParent.remove();
                    interviewTplId = interviewTplId - 1;
                }
            }
        })
        // TODO 获取某条评论信息
        .on('submit', '.comment-id-input', function (e) {
            e.preventDefault();

            showLoading();

            // fake data
            // 向后端发送 comment id,
            // 得到相关数据后，在编辑区域输出 comment 模板
            $.ajax({
                type: 'GET',
                url: '/admin/fake/comment',
                success: function (commentData) {
                    renderCommentTplHandle(commentData);
                    hideLoading();
                }
            });

            return false;
        });
    }

    // 错误提示
    function showMessage(type, mes) {
        // TODO
        alert(type +  ' : ' + mes);
    }

    function showLoading() {
        // TODO
    }

    function hideLoading() {
        // TODO
    }

    // 页面刷新，如果是正在编辑状态，则弹出提示
    window.onbeforeunload = function (e) {
        // TODO
        if (dataSaved === false && $('#main').hasClass('editing')) {
            return '文章还没有保存';
        }
    };

    // 插入 awardData 内容
    function setAwardData(awardData) {
        $('#cover-wrap img').attr('src', awardData.banner);
        $('#article-title').html(awardData.blogTitle);
        article.html(awardData.comment);
    }

    // 顶部滚动效果
    function pageScrollHandle() {
        var docElem = window.document.documentElement;
        var scrollVal;
        var isRevealed;
        var noscroll;
        var isAnimating;
        var container = document.getElementById('main');
        // 'trigger' not used temporarily
        var trigger = container.querySelector('button.trigger');
        var tools = $('#editor-tools');
        var articleOffsetTop;
        // var toolsFixed;


        // detect if IE : from http://stackoverflow.com/a/16657946
        var ie = (function () {
            var undef;
            var rv = -1; // Return value assumes failure.
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            var trident = ua.indexOf('Trident/');

            if (msie > 0) {
                // IE 10 or older => return version number
                rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            } else if (trident > 0) {
                // IE 11 (or newer) => return version number
                var rvNum = ua.indexOf('rv:');
                rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
            }

            return ((rv > -1) ? rv : undef);
        }());


        // disable/enable scroll (mousewheel and keys) from http://stackoverflow.com/a/4770179
        // left: 37, up: 38, right: 39, down: 40,
        // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
        var keys = [32, 37, 38, 39, 40];
        var wheelIter = 0;

        function preventDefault(e) {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
                e.returnValue = false;
            }
        }

        function keydown(e) {
            for (var i = keys.length; i--;) {
                if (e.keyCode === keys[i]) {
                    preventDefault(e);
                    return;
                }
            }
        }

        function touchmove(e) {
            preventDefault(e);
        }

        function wheel(e) {
            // for IE
            //if( ie ) {
                //preventDefault(e);
            //}
        }

        function disable_scroll() {
            window.onmousewheel = document.onmousewheel = wheel;
            document.onkeydown = keydown;
            document.body.ontouchmove = touchmove;
        }

        function enable_scroll() {
            window.onmousewheel = document.onmousewheel = document.onkeydown = document.body.ontouchmove = null;
        }

        function scrollY() {
            return window.pageYOffset || docElem.scrollTop;
        }

        function scrollPage() {

            scrollVal = scrollY();

            if (noscroll && !ie) {
                if (scrollVal < 0) {
                    return false;
                }
                // keep it that way
                window.scrollTo(0, 0);
            }

            if (classie.has(container, 'notrans')) {
                classie.remove(container, 'notrans');
                return false;
            }

            if (isAnimating) {
                return false;
            }

            if (scrollVal <= 0 && isRevealed) {
                toggle(0);
            } else if (scrollVal > 0 && !isRevealed) {
                toggle(1);
                // get article's position
                articleOffsetTop = article.offset().top;
            }

            // tools element position
            if ((articleOffsetTop - scrollVal) <= 0) {
                tools.css({
                    top : - (articleOffsetTop - scrollVal - 130)
                });
            } else {
                tools.css({
                    top : 10
                });
            }
        }

        function toggle(reveal) {
            isAnimating = true;

            if (reveal) {
                classie.add(container, 'modify');
            }
            else {
                noscroll = true;
                // disable_scroll();
                classie.remove(container, 'modify');
            }

            // simulating the end of the transition:
            setTimeout(function () {
                isRevealed = !isRevealed;
                isAnimating = false;
                if (reveal) {
                    noscroll = false;
                    enable_scroll();
                }
            }, 400);
        }

        // refreshing the page...
        var pageScroll = scrollY();
        noscroll = pageScroll === 0;

        // disable_scroll();

        if (pageScroll) {
            isRevealed = true;
            classie.add(container, 'notrans');
            classie.add(container, 'modify');
        }

        window.addEventListener('scroll', scrollPage);

        // trigger.addEventListener('click', function () {
        //     toggle('reveal');
        // });
    }

    // 在编辑区域插入内容
    function insertNodeAtCaret(node) {
        if (typeof window.getSelection !== 'undefined') {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                range.collapse(false);
                range.insertNode(node);
                range = range.cloneRange();
                range.selectNodeContents(node);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if (typeof document.selection !== 'undefined' && document.selection.type !== 'Control') {
            var html = (node.nodeType === 1) ? node.outerHTML : node.data;
            var id = 'marker_' + ('' + Math.random()).slice(2);
            html += '<span id="' + id + '"></span>';
            var textRange = document.selection.createRange();
            textRange.collapse(false);
            textRange.pasteHTML(html);
            var markerSpan = document.getElementById(id);
            textRange.moveToElementText(markerSpan);
            textRange.select();
            markerSpan.parentNode.removeChild(markerSpan);
        }
    }

    // 插入评论模板
    function renderCommentTplHandle(commentData) {
        console.log(commentTplId);
        var target = $('#comment-tpl-' + commentTplId);
        target.find('.comment-tpl').removeClass('edit-mode');
        target.find('.comment-id-input').fadeOut(150, function () {
            target.find('.comment-box-wrap').html(renderEditorCommentBoxTpl(commentData)).fadeIn(150);
        });

    }

/////////////////

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

    // 发布文章
    $('#publish-btn').click(function () {

        // 得到整个页面的html
        var body = $(document.documentElement).clone();

        // 删除 pageData 中的部分内容
        body.find('#back-to-admin-home, #page-action, #cover-form, #editor-tools, #app-search-list-tpl, #editor-header-tpl, #editor-app-box-tpl, #editor-comment-box-tpl, .suggestion-wp, #insert-tpl, .box-action, .comment-id-input').remove();

        // 删除可编辑状态
        body.find('[contenteditable]').removeAttr('contenteditable');

        // 重新组织JS
        body.find('script').not('#current-mode').remove();
        // todo
        // 需要增加获取APP最新数据的API,否则最终输出的页面中，APP安装数量等数据都是旧的、静态的。
        // 可以增加一个数字的动画效果，把旧的数据改写成API的新数据。
        body.append('<script src="/src/components/jquery/dist/jquery.js"></script><script src="/src/components/classie/classie.js"></script><script src="/src/javascripts/intro-effect.js"></script>');

        // 替换页面状态
        // new: 发布新文章 (默认)
        // drafts: 草稿
        // articles: 发布完成的文章
        body.find('#current-mode').html('var globalData = {mode: "articles", packageName: "' + packageName + '", appName: "' + appName + '"};');

        // var pageData = document.documentElement.innerHTML;
        var pageData = body.html();
        // console.log('pageData', pageData);

        // 补全HTML结构
        pageData = '<!DOCTYPE html><html lang="en" class="no-js">' + pageData + '</html>';


        // 设置路径名称
        var directoryName = packageName;

        $.ajax({
            type: 'POST',
            url: '/admin/articles/new',
            data : {pageData: pageData, directoryName: directoryName, appName : appName},
            success: function (res) {
                console.log(res);
                if (res.error) {
                    showMessage('error', res.error);
                } else {
                    dataSaved = true;
                    alert('成功发布');
                }
            }
        });
    });

    // 保存草稿
    $('#draft-btn').click(function () {

        // 得到整个页面的html
        // var pageData = document.documentElement.innerHTML;
        var body = $(document.documentElement).clone();

        // 替换页面状态
        body.find('#current-mode').html('var globalData = {mode: "drafts", packageName: "' + packageName + '", appName: "' + appName + '"};');

        var pageData = body.html();

        // 补全HTML结构
        pageData = '<!DOCTYPE html><html lang="en" class="no-js">' + pageData + '</html>';

        // 设置路径名称
        var directoryName = packageName;

        $.ajax({
            type: 'POST',
            url: '/admin/drafts/new',
            data : {pageData: pageData, directoryName: directoryName, appName : appName},
            success: function (res) {
                console.log(res);
                if (res.error) {
                    showMessage('error', res.error);
                } else {
                    dataSaved = true;
                    alert('成功保存草稿');
                    window.location.href = '/admin/drafts/';
                }
            }
        });
    });

    // 删除
    $('.del-btn').click(function () {
        var $t = $(this);
        var packageName = $t.data('name');
        var type = $t.data('type');
        if (confirm('真的要删除它吗？')) {
            $.ajax({
                type: 'DELETE',
                url: '/admin/delete',
                data: {packageName: packageName, type: type},
                success: function (res) {
                    console.log(res);
                    if (res.error) {
                        showMessage('error', res.error);
                    } else {
                        var ul = $t.parents('ul').eq(0);
                        $t.parents('li').eq(0).slideUp(function () {
                            this.remove();
                            if (ul.find('li').size() === 0) {
                                ul.after('<p class="no-data">没有数据</p>');
                            }
                        }, 0);
                    }
                }
            });
        }
    });

});
