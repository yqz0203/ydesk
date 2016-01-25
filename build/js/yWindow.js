/**
 * Created by qizhang on 2015/4/28.
 */

//var winSize = {
//    h: $(window).height(),
//    w: $(window).width()
//}
//

function afterTransition(dom, callback) {
    function whichTransitionEvent() {
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }

    var eventType = whichTransitionEvent();
    if(eventType)
    dom.on(eventType, function () {
        dom.off(eventType);
        callback && callback();
    });
    else setTimeout(function() {
        callback && callback();
    });
}

/**
 * 构造函数
 * @param options{
 * offset{left, top} //偏移量
 * noScroll //是否有滚动条，如果没有,容器始终填充整个window
 * container //容器（默认window）
 * onHide //最小化回掉函数
 * onShow //显示最小化回掉函数
 * onClose //关闭时回掉函数
 * onOverrideShow //重写默认的最小化方法
 * onOverrideShow //重写默认的显示方法
 * }
 */
function yWindow(options) {
    options || (options = {});
    this.options = options;
    this.windowSize = {
        w: options.width || 800,
        h: options.height || 500
    }
    if (options.container) {
        this.winSize = {
            h: options.container.height(),
            w: options.container.width()
        }
    } else {
        this.winSize = {
            h: $(window).height(),
            w: $(window).width()
        };
    }
    this.openState = this.preOpenState = 0; //窗口打开状态
    this.normalSize = this.windowSize; //非最大最小化时的窗口大小
    this.scrollBar;
    this.content;
    this.header;
    this.dom;
    this.contentBody;
    this.miniumButton;
    this.isActive = true;
    //滚动条滚动的距离
    this.scrollTop = 0;
    var _this = this;
    $(window).on('resize', function () {
        _this.winSize = {
            h: options.container.height(),
            w: options.container.width()
        };
        if (_this.openState == 1) {
            _this.dom && _this.dom.css({
                top: 0,
                left: 0,
                height: _this.winSize.h - 2,
                width: _this.winSize.w - 2
            });
            _this.scrollRefresh();
        }
    });
}

/**
 * 初始化页面
 */
yWindow.prototype.init = function () {
    var _this = this;
    var dom = $('<div class="window" tabindex="0">'
        + ' <div class="win-header no-select">' + (this.options.title || '标题')
        + '<div class="win-close win-title-funcbutton"></div><div class="win-maximum win-title-funcbutton"></div><div class="win-minimum win-title-funcbutton"></div>'
        + '</div>'
        + '<div class="win-content-frame">'
        + '<div class="win-content">'
        + '<div class="win-content-body"></div>'
        + ' <div class="win-scrollbar"></div>'
        + ' </div>'
        + '<div class="win-resize-point"><div>'
        + ' </div>'
        + ' </div>');
    this.dom = dom;
    this.scrollBar = dom.find(('.win-scrollbar')).first();
    this.content = dom.find(('.win-content')).first();
    this.contentBody = dom.find(('.win-content-body')).first();
    //没有滚动条，填充
    if (this.options.noScroll) {
        this.contentBody.css({
            height: '100%'
        });
    }
    this.header = dom.find(('.win-header')).first();
    this.maximumButton = dom.find(('.win-maximum')).first();
    this.closeButton = dom.find(('.win-close')).first();
    this.miniumButton = dom.find('.win-minimum').first();
    var resizePoint = dom.find(('.win-resize-point')).first();
    this.dom.css({
        height: _this.windowSize.h,
        width: _this.windowSize.w,
        top: (_this.winSize.h - _this.windowSize.h) / 2 + (_this.options.offset ? _this.options.offset.top : 0),
        left: (_this.winSize.w - _this.windowSize.w) / 2 + (_this.options.offset ? _this.options.offset.left : 0)
    });
    this.normalSize.top = (_this.winSize.h - this.windowSize.h) / 2 + (_this.options.offset ? _this.options.offset.top : 0);
    this.normalSize.left = (_this.winSize.w - this.windowSize.w) / 2 + (_this.options.offset ? _this.options.offset.left : 0);
    this.dom.appendTo('body');
    setTimeout(function () {
        _this.dom.css('opacity', 1);
    });
    //最大化
    this.miniumButton.on('click', function () {
        _this.hide();
    })
    //最大化
    this.maximumButton.on('click', function (e) {
        _this.changeState();
    });
    this.maximumButton.mousedown(function (e) {
        e.stopPropagation();
    });
    //关闭
    this.closeButton.on('click', function (e) {
        _this.close();
    });
    this.closeButton.mousedown(function (e) {
        e.stopPropagation();
    });
    //拖拽改变大小
    resizePoint.on('mousedown', function (ee) {
        if (_this.openState == 1)return;
        _this.dom.addClass('no-select');
        _this.dom.addClass('no-transition');
        var pre = {
            x: ee.clientX,
            y: ee.clientY
        }
        var offTop = _this.dom.offset().top;
        var offLeft = _this.dom.offset().left;
        var normalSize = _this.normalSize;
        var mouseMove = function (e) {
            var off_x = e.clientX - pre.x;
            var off_y = e.clientY - pre.y;
            var nowHeight = normalSize.h + off_y,
                nowWidth = normalSize.w + off_x;
            _this.dom.css({
                height: nowHeight <= 250 ? 250 : ((offTop + nowHeight < (_this.winSize.h - 2) ? (nowHeight) : (_this.winSize.h - offTop - 2))),
                width: nowWidth <= 250 ? 250 : (offLeft + nowWidth < (_this.winSize.w - 2) ? (nowWidth) : (_this.winSize.w - offLeft - 2))
            });
            _this.scrollRefresh();
        }

        $(document).on('mousemove', mouseMove);

        var mouseUp = function () {
            var $this = $(this);
            $this.off('mousemove', mouseMove);
            _this.dom.removeClass('no-select');
            _this.dom.removeClass('no-transition');
            _this.windowSize.h = _this.dom.height();
            _this.windowSize.w = _this.dom.width();
            _this.normalSize = _this.windowSize;
            _this.normalSize.left = _this.dom.offset().left;
            _this.normalSize.top = _this.dom.offset().top;
            $(document).off('mouseup'.mouseUp);
        };

        $(document).on('mouseup', mouseUp);
    });
    //双击头部
    this.header.on('dblclick', function () {
        _this.changeState();
    });
    //拖动事件
    this.header.on('mousedown', function (ee) {
        if (_this.openState == 1)return;
        _this.dom.addClass('no-select');
        _this.dom.addClass('no-transition');
        var pre = {
            x: ee.clientX,
            y: ee.clientY
        }
        var offTop = _this.dom.offset().top;
        var offLeft = _this.dom.offset().left;
        var mouseMove = function (e) {
            var off_x = e.clientX - pre.x;
            var off_y = e.clientY - pre.y;
            var nowTop = offTop + off_y,
                nowLeft = offLeft + off_x;
            _this.dom.css({
                top: nowTop <= 0 ? 0 : ((nowTop + _this.windowSize.h < (_this.winSize.h - 2) ? (nowTop) : (_this.winSize.h - _this.windowSize.h - 2))),
                left: nowLeft <= 0 ? 0 : (nowLeft + _this.windowSize.w < (_this.winSize.w - 2) ? (nowLeft) : (_this.winSize.w - _this.windowSize.w - 2))
            });
        }

        $(document).on('mousemove', mouseMove);

        var mouseUp = function () {
            var $this = $(this);
            $this.off('mousemove', mouseMove);
            _this.dom.removeClass('no-select');
            _this.dom.removeClass('no-transition');
            $(document).off('mouseup', mouseUp);
            _this.normalSize.left = _this.dom.offset().left;
            _this.normalSize.top = _this.dom.offset().top;
        }
        $(document).on('mouseup', mouseUp);
    });
    //滚动事件
    this.content.on('mousewheel', function (e) {
        var bodyHeight = _this.contentBody.height(),
            contentHeight = _this.content.height();
        if (bodyHeight <= contentHeight) {
            return;
        }
        //滚动后top值
        var scrollTop;
        var scrollDistance = 80;
        if (e.originalEvent.wheelDelta < 0) {
            scrollTop = (_this.scrollTop + scrollDistance < bodyHeight - contentHeight) ? (_this.scrollTop + scrollDistance) : ( bodyHeight - contentHeight);
        }
        else {
            scrollTop = _this.scrollTop - scrollDistance <= 0 ? 0 : (_this.scrollTop - scrollDistance);
        }
        //更改滚动距离
        _this.scrollTo(scrollTop);
        e.stopPropagation();
        e.preventDefault();
    });
    //滚动条拖动
    this.scrollBar.on('mousedown', function (ee) {
        var $this = $(this);
        _this.dom.addClass('no-select');
        $this.addClass('win-scrollbar-selected');
        _this.contentBody.css('transition', 'none');
        var pre = {
            x: ee.clientX,
            y: ee.clientY
        }
        var offTop = $this.css('top').replace('px', '') * 1;
        var mouseMove = function (e) {
            var off_y = e.clientY - pre.y;
            var nowTop = offTop + off_y;
            nowTop = nowTop <= 0 ? 0 : ((nowTop + $this.height() > _this.content.height() ? (_this.content.height() - $this.height()) : (nowTop)));
            _this.scrollTop = nowTop / _this.content.height() * _this.contentBody.height();
            _this.contentBody.css('top', -_this.scrollTop + 'px');
            _this.scrollBar.css('top', nowTop);
        }

        $(document).on('mousemove', mouseMove);

        var mouseUp = function () {
            var $$this = $(this);
            $$this.off('mousemove', mouseMove);
            $this.removeClass('win-scrollbar-selected');
            _this.contentBody.css('transition', 'top 200ms');
            _this.dom.removeClass('no-select');
            $(document).off('mouseup', mouseUp);
        };

        $(document).on('mouseup', mouseUp)
    });

    this.scrollRefresh();
    return this;
};

/**
 * 重新计算滚动条高度
 */
yWindow.prototype.scrollRefresh = function () {
    var contentBodyHeight = this.contentBody.height();
    var contentHeight = this.content.height();
    if (contentBodyHeight <= contentHeight) {
        this.scrollBar.hide();
        this.contentBody.css({
            'padding-right': 0,
            'top': 0
        });
        return;
    }
    this.contentBody.css('padding-right', '');
    this.scrollBar.show();
    this.scrollBar.height(contentHeight * contentHeight / contentBodyHeight);
    if (this.scrollTop != 0) {
        this.scrollTo(this.scrollTop);
    }
}

/**
 * 滚动一个距离
 * @param y
 */
yWindow.prototype.scrollTo = function (y) {
    var contentHeight = this.content.height();
    var contentBodyHeight = this.contentBody.height();
    y >= (contentBodyHeight - contentHeight) && (y = contentBodyHeight - contentHeight);
    this.scrollTop = y;
    if (y >= 0) {
        this.contentBody.css('top', -this.scrollTop + 'px');
        this.scrollBar.css('top', this.scrollBar.height() * (this.scrollTop) / contentHeight);
    }
}

/**
 * 关闭
 */
yWindow.prototype.close = function () {
    var _this = this;
    afterTransition(_this.dom, function () {
        _this.dom.remove();
    });
    _this.dom.css({
        opacity: 0
    });
    _this.options.onClose && _this.options.onClose();
}

/**
 * 隐藏
 */
yWindow.prototype.hide = function () {
    this.preOpenState = this.openState;
    this.openState = -1;
    if (this.options.overrideHide) {
        this.options.overrideHide(this);
    }
    else {
        this.dom.hide();
    }
    this.options.onHide && this.options.onHide();
}

/**
 * 显示
 */
yWindow.prototype.show = function () {
    if (this.options.overrideShow) {
        this.options.overrideShow(this);
    }
    else {
        this.dom.show();
    }
    this.openState = this.preOpenState;
    this.options.onShow && this.options.onShow();
}

/**
 * 最大化
 */
yWindow.prototype.changeState = function () {
    var _this = this;
    afterTransition(_this.dom, function () {
        _this.scrollRefresh();
        _this.options.onChangeState && _this.options.onChangeState({state: _this.changeState});
    });
    if (_this.openState == 0) {
        _this.normalSize = {
            h: _this.windowSize.h,
            w: _this.windowSize.w,
            top: _this.dom.css('top'),
            left: _this.dom.css('left')
        }
        _this.dom.css({
            top: 0,
            left: 0,
            height: _this.winSize.h - 2,
            width: _this.winSize.w - 2
        });
        _this.windowSize = {
            h: _this.winSize.h - 2,
            w: _this.winSize.w - 2
        }
        _this.openState = 1;
        _this.maximumButton.removeClass('win-maximum');
        _this.maximumButton.addClass('win-normal');
    }
    else if (_this.openState == 1) {
        var normalSize = _this.normalSize;
        _this.dom.css({
            top: normalSize.top,
            left: normalSize.left,
            height: normalSize.h,
            width: normalSize.w
        });
        _this.windowSize = normalSize;
        _this.openState = 0;
        _this.maximumButton.removeClass('win-normal');
        _this.maximumButton.addClass('win-maximum');
    }
}

/**
 * 改变窗口的大小
 */
yWindow.prototype.resizeTo = function () {

}

/**
 * 设置焦点状态
 * @param type 0，1
 */
yWindow.prototype.setFocusType = function (type, zIndex) {
    if (type) {
        this.isActive = true;
        this.header.removeClass('un-focused');
        this.dom.css('zIndex', zIndex);
    }
    else {
        this.isActive = false;
        this.header.addClass('un-focused');
    }
}
