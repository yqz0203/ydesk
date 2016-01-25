/**
 * Created by qizhang on 2015/4/30.
 */

yTools = {};

/**
 * 检查app名
 * @param app
 * @param attr
 * @returns {boolean}
 */
yTools.checkName = function (name, all, attr) {
    attr = attr || 'name';
    for (var i = 0, l = all.length; i < l; i++) {
        if (all[i][attr] == name) {
            return true;
        }
    }
    return false;
}

/**
 * 右键菜单
 */
yTools.contextMenu = (function () {
    var dom = $('<ul class="contextMenu no-select"></ul>');
    var _options;

    function hideMenu() {
        afterTransition(dom, function () {
            dom.hide();
        });
        dom.css('opacity', 0);
    }

    dom.on('click', 'li', function (e) {
        var source = e.currentTarget;
        var index = $(source).data('index') || $(source).attr('data-index');
        _options.onClick && _options.onClick(parseInt(index));
        hideMenu();
        e.stopPropagation();
    });
    dom.on('mousedown', function (e) {
        e.stopPropagation();
    });
    $(document).on('mousedown', hideMenu);

    return {
        show: function (options) {
            dom.html('');
            dom.attr('style', '');
            _options = options;
            var count = 0;
            for (var i = 0, l = options.items.length; i < l; i++) {
                var each = options.items[i];
                dom.append($('<li data-index="' + count + '"><div class="hover-border"></div><span>' + each.text + '</span></li>'));
                count++;
            }
            var container = options.container || $('body');
            var offset = options.offset;
            dom.css(options.css);
            dom.appendTo(container);
            dom.show();
            dom.css('opacity', 1);
        }
    }
})();

yTools.popup = (function () {
    var backDom = $('<div class="background"></div>');
    var alertDom = $('<div class="popup-window" tabindex="0">'
        + ' <div class="popup-window-header no-select"></div>'
        + '<div class="popup-window-content">'
        + ' </div>'
        + '<div class="popup-window-buttons">'
        + '<a href="javascript:;" class="positive">确定</a>'
        + ' </div>'
        + ' </div>');

    var promptDom = $('<div class="popup-window">'
        + ' <div class="popup-window-header no-select"></div>'
        + '<div class="popup-window-content">'
        + '<input class="popup-window-input" type="text">'
        + ' </div>'
        + '<div class="popup-window-buttons">'
        + '<a href="javascript:;" class="positive">确定</a><a href="javascript:;">取消</a>'
        + ' </div>'
        + ' </div>');

    var confirmDom = $('<div class="popup-window">'
        + ' <div class="popup-window-header no-select"></div>'
        + '<div class="popup-window-content">'
        + ' </div>'
        + '<div class="popup-window-buttons">'
        + '<a href="javascript:;" class="positive">确定</a><a href="javascript:;">取消</a>'
        + ' </div>'
        + ' </div>');

    var toAnimate = function (dom) {
        var h = dom.height(),
            w = dom.width(),
            w_h = $(window).height(),
            w_w =  $(window).width();
        var desCss = {
            top: (w_h - h) / 2 - 100,
            left: (w_w - w) / 2,
            width: w,
            height: h,
            visibility: 'visible'
        }
            dom.css(desCss).addClass('animation-window-scale')
    }
    return {
        /**
         * 提示框
         * @param options{noBackground,onClick, buttonText, noBackground}
         */
        alert: function (options) {
            options = options || {};
            alertDom.find('.popup-window-header').html(options.title || '警告');
            alertDom.find('.popup-window-content').html(options.content || '警告内容');
            !options.noBackground && backDom.appendTo('body');
            alertDom.css('visibility', 'hidden');
            alertDom.appendTo('body');
            toAnimate(alertDom);
            var a = alertDom.find('a');
            options.buttonText && a.text(options.buttonText);
            a.off('click');
            a.on('click', function () {
                backDom.remove();
                alertDom.attr('style', '');
                alertDom.remove();
                options.onClick && options.onClick();
            });
        },
        /**
         * 确认框
         * @param options
         */
        confirm: function (options) {
            options = options || {};
            confirmDom.find('.popup-window-header').html(options.title || '确认框');
            confirmDom.find('.popup-window-content').html(options.content || '确认内容');
            !options.noBackground && backDom.appendTo('body');
            confirmDom.css('visibility', 'hidden');
            confirmDom.appendTo('body');
            toAnimate(confirmDom);
            var allBtn = confirmDom.find('a');
            options.buttonText && a.text(options.buttonText);
            confirmDom.off('click');
            confirmDom.on('click', 'a', function (e) {
                var thisBtn = e.currentTarget;
                backDom.remove();
                confirmDom.attr('style', '');
                confirmDom.remove();
                options.onClick && options.onClick({
                    index: allBtn.index(thisBtn)
                });
            });
        },
        /**
         * 输入框
         * @param options
         */
        prompt: function (options) {
            options = options || {};
            promptDom.find('.popup-window-header').text(options.title || '输入框');
            promptDom.find('h3').text(options.content || '确认框内容');
            !options.noBackground && backDom.appendTo('body');
            promptDom.css('visibility', 'hidden');
            promptDom.appendTo('body');
            toAnimate(promptDom);
            var allBtn = promptDom.find('a');
            var value = promptDom.find('input');
            value.val(options.initialValue || '');
            options.buttonText && a.text(options.buttonText);
            promptDom.off('click');
            promptDom.on('click', 'a', function (e) {
                var thisBtn = e.currentTarget;
                backDom.remove();
                promptDom.attr('style', '');
                promptDom.remove();
                options.onClick && options.onClick({
                    index: allBtn.index(thisBtn),
                    value: value.val()
                });
            });
            //必须设置延迟才行？
            setTimeout(function () {
                value.get(0).focus();
            }, 300);
        }
    }
})();

/**
 * 图标基类
 * @param options
 */
function yIcon(options) {
    if (!options) {
        console.error('option is needed');
        return;
    }
    //唯一标识
    this.sid = Math.random();
    //标题
    this.name = options.name;
    //图标
    this.thumb = options.thumb;
    //app类型
    this.type = options.type;
    this.href = options.href;
    //设置
    this.options = options;
    //设置
    this.settings = options.settings || {};

    this.dom = $('<div id="icon' + Math.floor(Math.random() * 100000000) + '" draggable="true" class="icon" title="' + this.name + '" tabindex="0">' +
        '<div class="hover-border"></div>' +
        ' <img draggable="false" src="' + options.thumb + '"/>' +
        ' <span>' + this.name + '</span>' +
        '</div>');
    //刷新dom，比如图片加载失败重新加载
    this.refreshDom = function () {
        this.dom.attr('title', this.name);
        this.dom.find('img').attr('src', this.thumb);
        this.dom.find('span').text(this.name);
    }
    var _this = this,
        id = _this.dom.attr('id');
    //避免文件夹重新打开事件丢失
    $(document).on('mouseup', '#' + id, function (e) {
        if (e.which == 3) {
            var position = {
                x: e.clientX,
                y: e.clientY
            };
            yTools.contextMenu.show({
                items: [
                    {text: '打开'},
                    {text: '删除'},
                    {text: '重命名'}
                ],
                css: {
                    left: position.x,
                    top: position.y,
                    width: 200
                },
                onClick: function (index) {
                    switch (index) {
                        case 0:
                            _this.dom.dblclick();
                            break;
                        case 1:
                            yTools.popup.confirm({
                                content: '确定删除"' + _this.name + '"吗？',
                                title: '警告',
                                onClick: function (e) {
                                    if (e.index == 0) {
                                        _this.parent.removeChild(_this);
                                        _this.dom.remove();
                                    }
                                }
                            });
                            break;
                        case 2:
                            yTools.popup.prompt({
                                title: '请输入名称',
                                initialValue: _this.name,
                                onClick: function (e) {
                                    if (e.index == 0) {
                                        var name = e.value;
                                        if (name) {
                                            if ((yTools.checkName(name, _this.parent.children) && name != _this.name)) {
                                                yTools.popup.alert({
                                                    content: '存在同名的文件'
                                                });
                                            }
                                            else {
                                                _this.name = name;
                                                _this.refreshDom();
                                            }
                                        }
                                    }
                                }
                            });
                            break;
                    }
                }
            });
        }
        e.stopPropagation();
    });
    $(document).on('dragstart', '#' + id, function (e) {
        e = e.originalEvent;
        e.dataTransfer.setData('text', 'icon');
        yTools.onDragObject = _this;
    });
}

/**
 * 应用
 * @param options
 */
function yAppIcon(options) {
    yIcon.call(this, options);
    var _this = this;
    $(document).on('dblclick', '#' + _this.dom.attr('id'), function () {
        applicationFactory.run(_this);
    });
}

/**
 * 文件夹
 * @param options
 */
function yFolderIcon(options) {
    var _this = this;
    options.type = 'folder';
    this.children = options.children || [];
    options.thumb = 'image/folder.png';
    yIcon.call(this, options);
    //移出子元素
    this.removeChild = function (child) {
        if (!_this.children)return;
        for (var i = 0, l = _this.children.length; i < l; i++) {
            if (_this.children[i] == child) {
                _this.children.splice(i, 1);
                break;
            }
        }
        _this.refreshContent();
    }
    //添加子元素
    this.addChild = function (child, index) {
        child.parent = _this;
        var dom = child.dom;
        dom.attr('style', '');
        dom.removeClass('icon');
        dom.addClass('folder-icon no-select');
        if (index) {
            _this.children.splice(index, 0, child);
        }
        else {
            _this.children.push(child);
        }
        _this.refreshContent();
    }
    var emptyDom = $('<div style="text-align: center; margin-top: 30px;">文件夹没有任何内容</div>');
    //刷新文件夹内容
    this.refreshContent = function () {
        if (_this.children.length > 0) {
            emptyDom.remove();
            for (var i = 0, l = _this.children.length; i < l; i++) {
                _this.children[i].parent = _this;
                var dom = _this.children[i].dom;
                dom.attr('style', '');
                dom.removeClass('icon');
                dom.addClass('folder-icon no-select');
                dom.appendTo(_this.window.contentBody);
            }
        }
        else {
            emptyDom.appendTo(_this.window.content);
        }
    };
    $(document).on('dblclick', '#' + _this.dom.attr('id'), function () {
        var app = applicationFactory.run(_this);
        if (app.isRunning)return;
        _this.window.dom.on('mouseup', function (e) {
            if (e.which == 3) {
                var position = {
                    x: e.clientX,
                    y: e.clientY
                };
                yTools.contextMenu.show({
                    items: [
                        {text: '刷新'},
                        {text: '新建文件夹'}
                    ],
                    css: {
                        left: position.x,
                        top: position.y,
                        width: 200
                    },
                    onClick: function (index) {
                        switch (index) {
                            case 0:
                                for (var i = 0, l = _this.children.length; i < l; i++) {
                                    _this.children[i].refreshDom();
                                }
                                break;
                            case 1:
                                yTools.popup.prompt({
                                    title: '请输入名称',
                                    initialValue: '新建文件夹',
                                    onClick: function (e) {
                                        if (e.index == 0) {
                                            var name = e.value;
                                            if (name) {
                                                if (!yTools.checkName(name, _this.children)) {
                                                    var newApp = new yFolderIcon(
                                                        {
                                                            name: name,
                                                            type: 'folder',
                                                            icon: 'image/folder.png'
                                                        });
                                                    _this.addChild(newApp);
                                                }
                                                else
                                                    yTools.popup.alert('存在同名的文件夹');
                                            }
                                        }
                                    }
                                });
                                break;
                        }
                    }
                });
            }
        });
        _this.window.content.on({
            'dragover': function (e) {
                e = e.originalEvent;
                e.preventDefault();
                applicationFactory.focus(app);
            },
            'drop': function (e) {
                e = e.originalEvent;
                var type = e.dataTransfer.getData("text");
                if (type == 'icon') {
                    var thisApp = yTools.onDragObject;
                    if (thisApp == _this) {
                        alert('目标是源文件夹！');
                        return;
                    }
                    var scrollTop = _this.window.scrollTop,
                        offset = $(this).offset();
                    var position = {
                        x: e.screenX - offset.left,
                        y: e.screenY - offset.top + scrollTop //加上scroll的距离
                    }

                    thisApp.parent.removeChild(thisApp);
                    var iconPlace = {
                        h: 130,
                        w: 100
                    }
                    var h_count = Math.floor(_this.window.contentBody.width() / iconPlace.w);
                    var _y = Math.floor(position.y / (iconPlace.h)),
                        _x = Math.floor(position.x / (iconPlace.w)),
                        index = _y * h_count + _x;
                    if (index > _this.children.length) {
                        _this.addChild(thisApp);
                    }
                    else {
                        _this.addChild(thisApp, index);
                    }
                }
            }
        });
    });
}

/**
 * 任务栏按钮
 * @param app {yAppIcon对象}
 */
function yMissionButton(appIcon) {
    if (!appIcon) {
        console.error('app is needed');
        return;
    }

    this.dom = $(' <div class="mission-bar-button shadow" tabindex="0">' +
        '<img src="' + appIcon.thumb + '">' +
        appIcon.name +
        '</div>');
}


/**
 * 桌面构造函数
 */
function yDesk() {
    //屏蔽右键菜单
    document.oncontextmenu = function () {
        return false;
    }
    var _this = this;
    //每个icon暂用大小
    this.iconPlace = {
        h: 130,
        w: 100
    }
    this.dom = $('<div class="desk no-select">' +
        '</div>');
    this.missonBarDom = $('<div id="mission-bar" class="no-select">' +
        '<div id="mission-bar-win" class="shadow"><img src="css/win.png"></div>' +
        '<div id="mission-bar-buttons">' +
        '</div>' +
        '<div id="mission-bar-datetime" class="shadow">' +
        ' <span></span>' +
        ' <span></span>' +
        ' </div>' +
        ' </div>');
    this.dom.appendTo('body');
    this.missonBarDom.appendTo('body');
    //图标集合
    this.children = [];
    this.removeChild = function (child) {
        if (!_this.children)return;
        for (var i = 0, l = _this.children.length; i < l; i++) {
            if (_this.children[i] == child) {
                _this.children.splice(i, 1);
                //重布局
                _this.reLayoutDesk();
                break;
            }
        }
    }
    //任务栏集合
    this.missonButtons = [];
    this.missonButtonsDom = $('#mission-bar-buttons');
    var timeSpan = this.missonBarDom.find('span').eq(0);
    var dateSpan = this.missonBarDom.find('span').eq(1);
    $('#mission-bar-datetime').on('click', function (e) {
        var isActive = calendar.toggle();
        isActive && e.stopPropagation();
    });
    var timeCount = function () {
        var date = new Date(),
            h = date.getHours(),
            m = date.getMinutes(),
            y = date.getFullYear(),
            M = date.getMonth() + 1,
            d = date.getDate(),
            s = date.getSeconds();
        var time = (h > 9 ? h : ('0' + h)) + ':' + (m > 9 ? m : ('0' + m));
        timeSpan.text(time);
        dateSpan.text(y + '/' + M + '/' + d);
        calendar && calendar.refreshTime(time + ':' + (s > 9 ? s : ('0' + s)), date.getDay());
    }
    timeCount();
    setInterval(timeCount, 1000);
    $(window).resize(function () {
        _this.reLayoutDesk();
    });

    //各种事件
    _this.dom.on({
        mouseup: function (e) {
            var source = e.target || e.srcElement;
            if (source != this)return;
            if (e.which == 3) {
                var position = {
                    x: e.clientX,
                    y: e.clientY
                };
                yTools.contextMenu.show({
                    items: [
                        {text: '刷新'},
                        {text: '换一张壁纸'},
                        {text: '添加文件夹' }
                    ],
                    css: {
                        left: position.x,
                        top: position.y,
                        width: 200
                    },
                    onClick: function (index) {
                        switch (index) {
                            case 0:
                                for (var i = 0, l = _this.children.length; i < l; i++) {
                                    _this.children[i].refreshDom();
                                }
                                break;
                            case 1:
                                break;
                            case 2:
                                yTools.popup.prompt({
                                    title: '请输入名称',
                                    initialValue: '新建文件夹',
                                    onClick: function (e) {
                                        if (e.index == 0) {
                                            var name = e.value;
                                            if (name) {
                                                if (!yTools.checkName(name, _this.children)) {
                                                    var newApp = new yFolderIcon(
                                                        {
                                                            name: name
                                                        });
                                                    _this.addApp(newApp);
                                                }
                                                else
                                                    yTools.popup.alert('存在同名的文件夹');
                                            }
                                        }
                                    }
                                });
                                break;
                        }
                    }
                });
            }
        },
        dragover: function (e) {
            e.preventDefault();
        },
        drop: function (e) {
            e = e.originalEvent;
            var type = e.dataTransfer.getData("text"),
                children = _this.children;
            //拖动的位置
            var position = {
                x: e.screenX,
                y: e.screenY
            }
            if (type == 'icon') {
                var thisApp = yTools.onDragObject;
                if (yTools.checkName(thisApp.name, _this.children) && _this != thisApp.parent) {
                    yTools.popup.alert({content: '目标存在同名的文件或文件夹'})
                    return;
                }
                //垂直可容纳数
                var v_count = Math.floor(_this.dom.height() / _this.iconPlace.h);
                var x = Math.floor(position.x / _this.iconPlace.w),
                    y = Math.floor(position.y / _this.iconPlace.h);
                //从列表移出
                thisApp.parent.removeChild(thisApp);
                //所有应用
                var children = _this.children,
                    index = (x * v_count + y);
                thisApp.parent = _this;
                if (index > children.length) {
                    children.push(thisApp);
                }
                else {
                    children.splice(index, 0, thisApp);
                }
                thisApp.dom.attr('style', '');
                thisApp.dom.addClass('icon');
                thisApp.dom.removeClass('folder-icon no-select');
                thisApp.dom.appendTo(_this.dom);
                _this.reLayoutDesk();
            }
        }
    });

    var calendar = (function () {
        var dom = $('<div class="calender_main_body">'
            + '<div class="calender_header">'
            + '<span class="full-time">17:31:29</span><span class="full-day">星期三</span>'
            + '<div class="main-nav">'
            + ' <a class="nav-btn current-indicator button">2015年5月</a>'
            + '<a class="nav-btn next"></a>'
            + '<a class="nav-btn prev"></a>'
            + '</div>'
            + '<ul class="li_list_day">'
            + '<li class="cellNo">日</li>'
            + '<li class="cellNo">一</li>'
            + '<li class="cellNo">二</li>'
            + '<li class="cellNo">三</li>'
            + '<li class="cellNo">四</li>'
            + '<li class="cellNo">五</li>'
            + '<li class="cellNo">六</li>'
            + '</ul>'
            + '</div>'
            + '<div class="days">'
            + '     <ul class="days-cell-parent li_list_day">'
            + '  </ul>'
            + '</div>'
            + '</div>');
        dom.appendTo(_this.dom);
        var days = dom.find('.days-cell-parent');
        var indicator = dom.find('.current-indicator');
        dom.find('.next').click(function () {
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
            refresh(year, month);
        });
        dom.find('.prev').click(function () {
            month--;
            if (month < 0) {
                month = 12;
                year--;
            }
            refresh(year, month);
        });
        var now = new Date();
        var month = now.getMonth();
        var year = now.getFullYear();
        refresh(year, month);
        function refresh(year, month) {
            indicator.text(year + '年' + (month + 1) + '月');
            days.css('opacity', 0);
            var cells = [];
            //这个月有多少天
            var thisMouthTotalDays = getDaysInMonth(year, month);
            //这个月第一天
            var thisMouthFirstDay = new Date(new Date(year, month).setDate(1));
            //这月最后一天
            var thisMonthLastDay = new Date(new Date(year, month).setDate(thisMouthTotalDays));
            var now = new Date();
            for (var i = 1; i <= thisMouthTotalDays; i++) {
                if (now.getDate() == i && now.getFullYear() == year && now.getMonth() == month)
                    cells.push($('<li class=" cell selected">' + i + '</li>'));
                else
                    cells.push($('<li class=" cell">' + i + '</li>'));
            }
            //上个月有多少天
            var lastMouthTotalDays = getDaysInMonth(now.getFullYear(), now.getMonth() - 1);
            for (var j = 0, l = thisMouthFirstDay.getDay() % 7; j < l; j++) {
                cells.unshift($('<li class=" cell not-notable">' + (lastMouthTotalDays - j) + '</li>'));
            }
            for (var k = 1, ll = (6 * 7 - cells.length); k <= ll; k++) {
                cells.push($('<li class=" cell not-notable">' + k + '</li>'));
            }
            days.html('');
            for (var m = 0, _l = cells.length; m < _l; m++) {
                days.append(cells[m]);
            }
            setTimeout(function () {
                days.css('opacity', 1);
            }, 200);
            function getDaysInMonth(year, month) {
                month = parseInt(month, 10) + 1;
                var temp = new Date(year, month, 0);
                return temp.getDate();
            }
        }

        var isActive;
        var fullTime = dom.find('.full-time'),
            day = dom.find('.full-day');
        $(document).on('click', function () {
            if (isActive) {
                dom.css({
                    bottom: -480
                });
                isActive = false;
            }
        });
        dom.click(function (e) {
            isActive && e.stopPropagation();
        });
        return {
            toggle: function () {
                if (!isActive) {
                    dom.css({
                        bottom: 2
                    });
                    isActive = true;
                }
                else {
                    dom.css({
                        bottom: -480
                    });
                    isActive = false;
                }
                return isActive;
            },
            refreshTime: function (time, _day) {
                if (!isActive)return;
                fullTime.text(time);
                switch (_day) {
                    case 1:
                        day.text('星期一');
                        break;
                    case 2:
                        day.text('星期二');
                        break;
                    case 3:
                        day.text('星期三');
                        break;
                    case 4:
                        day.text('星期四');
                        break;
                    case 5:
                        day.text('星期五');
                        break;
                    case 6:
                        day.text('星期六');
                        break;
                    case 7:
                        day.text('星期日');
                        break;
                }
            }
        }
    })();
}

/**
 * 添加桌面图标
 * @param app [app or app[]]
 */
yDesk.prototype.addApp = function (app) {
    var _this = this,
        d_w = _this.dom.width(),
        d_h = _this.dom.height();
    app.addTime = new Date().getTime();
    if (app.length && app.length > 1) {
        for (var i = 0, l = app.length; i < l; i++) {
            app[i].parent = _this;
            app[i].dom.css({
                top: d_h,
                left: d_w
            });
            _this.dom.append(app[i].dom);
        }
        _this.children = _this.children.concat(app);
    }
    else {
        app.parent = _this;
        _this.children.push(app);
        app.dom.css({
            top: d_h,
            left: d_w
        });
    }
    _this.dom.append(app.dom);
    _this.reLayoutDesk();
}

/**
 * 重新布局页面
 */
yDesk.prototype.reLayoutDesk = function () {
    var _this = this;
    //垂直可容纳数
    var v_count = Math.floor(_this.dom.height() / _this.iconPlace.h);
    for (var i = 0, l = _this.children.length; i < l; i++) {
        var ver = Math.floor((i) / (v_count)),
            hor = (i) % (v_count);
        //app在桌面的位置索引
        this.children[i].dom.css({
            top: hor * _this.iconPlace.h + 'px',
            left: ver * _this.iconPlace.w + 'px'
        });
    }
}

/**
 * 添加任务栏图标
 * @param messionButton
 */
yDesk.prototype.addMissionButton = function (missionButton) {
    var _this = this;
    missionButton.dom.css({
        left: _this.missonButtonsDom.width()
    });
    _this.missonButtons.push(missionButton);
    _this.missonButtonsDom.append(missionButton.dom);
    _this.reLayoutMissionButtons();
}

/**
 * 移出任务栏按钮
 * @param missionButton
 */
yDesk.prototype.removeMissionButton = function (missionButton) {
    var _this = this;
    for (var i = 0, l = _this.missonButtons.length; i < l; i++) {
        if (_this.missonButtons[i] == missionButton) {
            _this.missonButtons.splice(i, 1);
            afterTransition(missionButton.dom, function () {
                missionButton.dom.remove();
                _this.reLayoutMissionButtons();
            });
            missionButton.dom.css({
                opacity: 0
            });
            break;
        }
    }
}

/**
 * 重新布局任务栏缩略图
 */
yDesk.prototype.reLayoutMissionButtons = function () {
    var _this = this;
    var l = _this.missonButtons.length,
        w = _this.missonButtonsDom.width();
    if (w / l <= 60) {
        console.warn('超出范围，将不会显示');
    }
    for (var i = 0; i < l; i++) {
        if (w / l > 300) {
            _this.missonButtons[i].dom.css({
                left: i * 300,
                width: 300 - 60  //60px的padding
            });
        }
        else {
            _this.missonButtons[i].dom.css({
                left: i * w / l,
                width: w / l - 60  //60px的padding
            });
        }
    }
}

/**
 * 应用工厂
 */
var applicationFactory = (function () {
    var appCollection = [];
    var windowZIndex = 0;
    var activeApp;

    /**
     * 任务进程
     */
    function application(appIcon) {
        var _this = this;
        var desk = yTools.desk;
        this.appIcon = appIcon;
        this.window = new yWindow({
            container: $('.desk'),
            title: appIcon.name,
            noScroll: appIcon.settings.noScroll,
            height: appIcon.settings.height,
            width: appIcon.settings.width,
            offset: {
                top: appCollection.length * 20,
                left: appCollection.length * 20
            },
            onHide: function () {
                _this.missionButton.dom.removeClass('mission-active');
                _this.missionButton.dom.addClass('shadow');
                //下一个应用获取焦点
                if (appCollection.length > 0) {
                    activeApp = null;
                    for (var l = appCollection.length, i = l - 2; i >= 0; i--) {
                        var nextApp = appCollection[i];
                        if (nextApp.window.dom.css('display') == 'none') {
                            continue;
                        }
                        else {
                            applicationFactory.focus(nextApp);
                            return;
                        }
                    }
                }
            },
            onClose: function () {
                appIcon.window && (appIcon.window = null);
                desk.removeMissionButton(_this.missionButton);
                //从集合中移出window
                for (var i = 0, l = appCollection.length; i < l; i++) {
                    if (_this == appCollection[i]) {
                        appCollection.splice(i, 1);
                        break;
                    }
                }
                //下一个应用获取焦点
                if (appCollection.length > 0) {
                    activeApp = null;
                    for (var l = appCollection.length, i = l - 1; i >= 0; i--) {
                        var nextApp = appCollection[i];
                        if (nextApp.window.dom.css('display') == 'none') {
                            continue;
                        }
                        else {
                            applicationFactory.focus(nextApp);
                            nextApp.missionButton.dom.addClass('mission-active');
                            return;
                        }
                    }
                }
                //重排序任务栏
                desk.reLayoutMissionButtons();
            },
            overrideHide: function () {
                var left = _this.missionButton.dom.offset().left;
                afterTransition(_this.window.dom, function () {
                    _this.window.dom.hide();
                });
                _this.window.dom.css({
                    opacity: 0
                });
            },
            overrideShow: function () {
                _this.window.dom.show();
                setTimeout(function () {   //不知为何有些卡顿
                    if (_this.window.preOpenState == 0)
                        _this.window.dom.css({
                            opacity: 1
                        });
                    else
                        _this.window.dom.css({
                            opacity: 1
                        });
                }, 0);
            }
        }).init();
        //将window压入集合
        appCollection.push(this);
        //添加任务栏按钮
        this.missionButton = new yMissionButton(appIcon);
        desk.addMissionButton(this.missionButton);
        //获取焦点
        applicationFactory.focus(this);

        //点击时获取焦点
        this.window.dom.on('mousedown', function () {
            applicationFactory.focus(_this);
        });
        this.missionButton.dom.on({
            'click': function () {
                if (_this.window.openState != -1) {
                    if (_this.window.isActive) {
                        _this.window.hide();
                        $(this).removeClass('mission-active');
                        $(this).addClass('shadow');
                        _this.window.setFocusType(0);
                    }
                    else {
                        applicationFactory.focus(_this);
                    }
                }
                else {
                    applicationFactory.focus(_this);
                }
            },
            //右键点击事件
            'mouseup': function (e) {
                if (e.which == 3) {
                    yTools.contextMenu.show({
                        items: [
                            {text: '关闭'}
                        ],
                        css: {
                            bottom: 60,
                            left: -(200 - _this.missionButton.dom.outerWidth() ) / 2 + _this.missionButton.dom.offset().left,
                            width: 200
                        },
                        onClick: function (index) {
                            _this.window.close();
                        }
                    });
                }
            }
        });

        //app打开方式
        if (appIcon.type == 'page') {
            this.window.contentBody.css('height', '100%');
            this.window.contentBody.append('<iframe style="height:100%;width:100%;border:none;" src="' + appIcon.href + '"></iframe>');
        }
        else if (appIcon.type == 'piece') {
            if ($('link[href="' + appIcon.href + '/css.css"]').length > 0) {
                $.get(appIcon.href + '/index.html', function (data) {
                    _this.window.contentBody.html(data);
                });
                return;
            }
            var css = $("<link>")
                .attr({ rel: "stylesheet",
                    type: "text/css",
                    href: appIcon.href + '/css.css'
                })
                .appendTo("head");
            //成功
            css.on('load', function () {
                $.get(appIcon.href + '/index.html', function (data) {
                    _this.window.contentBody.html(data);
                });
            });
            //失败
            css.on('error', function () {
                yTools.popup.alert({
                    content: '加载资源失败，app启动失败！',
                    onClick: function () {
                        (this).remove();
                        _this.window.close();
                    }
                });
            });
        }
        else if (appIcon.type == 'folder') {
            appIcon.window = this.window;
            this.window.contentBody.css({
                float: 'left'
            });
            appIcon.refreshContent();
        }
    }

    return {
        run: function (appIcon) {
            //如果app已经运行，则聚焦
            for (var i = 0, l = appCollection.length; i < l; i++) {
                if (appCollection[i].appIcon.sid == appIcon.sid && !appIcon.options.multiple) {
                    appCollection[i].isRunning = true;
                    this.focus(appCollection[i]);
                    return appCollection[i];
                }
            }
            return new application(appIcon);
        },
        focus: function (app) {
            var desk = yTools.desk;
            if (activeApp == app)return;
            activeApp = app;
            desk.missonButtonsDom.children().each(function () {
                $(this).addClass('shadow');
                $(this).removeClass('mission-active');
            });
            app.window.openState == -1 && app.window.show();
            app.missionButton.dom.addClass('mission-active');
            app.missionButton.dom.removeClass('shadow');
            for (var i = 0, l = appCollection.length; i < l; i++) {
                appCollection[i].window.setFocusType(0);
                if (appCollection[i] == app) {
                    appCollection.splice(i, 1);
                    appCollection.push(app);
                    i--;
                    l--;
                }
            }
            app.window.setFocusType(1, ++windowZIndex);
        }
    }
})();


$(function () {
    yTools.desk = new yDesk();
    var qq = new yAppIcon({
            name: '腾讯QQ',
            thumb: 'image/qq.jpg',
            type: 'page',
            href: 'http://w.qq.com/'
        }),
        cq = new yAppIcon({
            name: '传奇霸业',
            thumb: 'image/cqby.jpg',
            type: 'page',
            href: 'http://bdaiwan.37.com/s/1/1660/18839.html?kwd=%E9%A1%B5%E6%B8%B8'
        }),
        jsq = new yAppIcon({
            name: '计算器',
            thumb: 'image/calculator.png',
            type: 'piece',
            href: 'appFile/calculator',
            settings: {
                noScroll: true,
                width: 360,
                height: 500
            }
        }),
        xzjy = new yAppIcon({
            name: '小猪救援',
            thumb: 'image/xzjy.png',
            type: 'page',
            href: ' http://www.4399.com/flash/FullPlay.htm?http://sxiao.4399.com/4399swf/upload_swf/ftp16/gamehwq/20150504/1'
        }),
        jscqd = new yAppIcon({
            name: '僵尸拆迁队',
            thumb: 'image/jscqd.png',
            type: 'page',
            href: 'http://www.4399.com/flash/FullPlay.htm?http://s15.4399.com/4399swf/upload_swf/ftp16/liuxy/20150429/1'
        }),
        appFolder = new yFolderIcon({
            name: '工具',
            children: [
                jsq
            ]}),
        gameFolder = new yFolderIcon({
            name: '我的游戏',
            children: [
                xzjy, jscqd, cq
            ]});

    yTools.desk.addApp([qq, appFolder, gameFolder]);


//    yTools.popup.alert();
});