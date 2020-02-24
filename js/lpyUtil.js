(function ($) {
    /**
     * 按钮loading开始
     * @param    {String}  dom    btn的Id或class
     */
    const _btnLoadingShow = function (dom) {
        $(dom).find('.weui-loading').css("display", 'inline-block');
    };
    /**
     * 按钮loading结束
     * @param    {String}  dom    btn的Id或class
     */
    const _btnLoadingHide = function (dom) {
        $(dom).find('.weui-loading').css("display", 'none');
    }
    /**
     * 显示toast
     * @param    {String}  msg    要展示的字段信息
     */
    const _showTip = function (msg) {
        let [$toast, $body] = [$('#toast-tip'), $('body')];
        if ($toast.length == 0) {
            const _html = `<div id="toast-tip" style="display: none;"><div class="weui-toast-tip"><p class="weui-toast__content"></p></div></div>`;
            $body.append(_html);
            $toast = $('#toast-tip');
        }
        if ($toast.css('display') != 'none') return;

        $toast.find('.weui-toast__content').text(msg);
        $toast.fadeIn(100);
        setTimeout(() => {
            $toast.fadeOut(100);
        }, 2000);

    };
    let _ajax = function (op) {
        try {
            //是否loading，成功函数，失败函数，beforFun？,登陆认证token，需要时使用
            let [sucFun, errFun, beforFun, token] = [op.success, op.error, op.beforeSend, op.data.token ? op.data.token : ''];
            //op.data = JSON.stringify(op.data);
            let _op = {
                cache: false,
                type: "POST",
                //contentType: 'application/json',
                beforeSend: function (XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("Authorization", token);
                    // showLoading ? _showloading() : '';
                    try {
                        if (beforFun) beforeFun(XMLHttpRequest)
                    } catch (e) {
                        console.log('对不起,您的网络可能存在问题，请稍后再试');
                    }
                },
                success: function (Data) {
                    try {
                        // showLoading ? _hideloading() : '';
                        if (sucFun) {
                            if (Data) {
                                if ("ret" in Data) {
                                    let suc = Data.ret == 0;
                                    sucFun(suc, (suc ? Data.result : Data.msg), Data);
                                } else
                                    sucFun(Data);
                            } else {
                                sucFun('');
                            }
                        }
                    } catch (e) {
                        console.log('对不起,请求出现错误1');
                    }
                },
                statusCode: {
                    403: function () {
                        location.reload();
                    },
                    401: function () {
                        location.reload();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    let errMsg = textStatus || errorThrown;
                    //showLoading ? $("body").mLoading("hide") : '';
                    console.log("ajax error:" + errMsg);
                    if (jqXHR.status == '401') {
                        let url = "../../pages/prompt.html?param=" + "用户超时，请退出重试";
                        window.location.replace(url);
                    }
                    if (jqXHR.status == '413') {
                        $.dialog({
                            titleText: "提示",
                            contentHtml: "文件上传过大",
                        });
                        return;
                    }
                    try {
                        if (errFun)
                            errFun(XMLHttpRequest, textStatus, errorThrown);
                    } catch (e) {
                        console.log('对不起,请求出现错误2');
                    }
                    console.log('对不起,请求出现错误3');
                }
            };

            if (op.success)
                delete op.success;
            if (op.error)
                delete op.error;
            $.extend(true, _op, op);
            console.log(_op);
            $.ajax(_op);
        } catch (e) {
            console.log('Ajax错误，', e);
        }
    };
    $.extend($, {
        queryString(name) {
            //获取url后面￿的参数
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            let r = window.location.search.substr(1).match(reg); // 获取url中"?"符后的字符串并正则匹配
            let context = "";
            if (r != null)
                context = r[2];
            return context == null || context === "" || context === "undefined" ? "" : context;
        },
        ajaxProcess(op) {
            //重写ajax请求
            _ajax(op);
        },
        getRootPath_web() {
            //获取当前路径，用于后台请求
            //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
            const [curWwwPath, pathName] = [window.document.location.href, window.document.location.pathname];
            //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
            let pos = curWwwPath.indexOf(pathName);
            //获取主机地址，如： http://localhost:8083
            let localhostPaht = curWwwPath.substring(0, pos);
            //获取带"/"的项目名，如：/uimcardprj
            let projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            return (localhostPaht + projectName);
        },
        cookie(key, value, options) {
            //存入cookie，options内添加cookie有效范围和有效时间
            let days, time, result, decode;
            if (arguments.length > 1 && String(value) !== "[object Object]") {
                options = $.extend({},
                    options);
                if (value === null || value === undefined) options.expires = -1;
                if (typeof options.expires === 'number') {
                    days = (options.expires);
                    time = options.expires = new Date();
                    time.setTime(time.getTime() + days)
                }
                value = String(value);
                return (document.cookie = [encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value), options.expires ? '; expires=' + time.toGMTString() : '', options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join(''))
            }
            options = value || {};
            decode = options.raw ?
                function (s) {
                    return s
                } : decodeURIComponent;
            return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null
        },
        removeCookie(key, options) {
            //移除cookie
            $.cookie(key, '', $.extend({},
                options, {
                    expires: -1
                }));
            return !$.cookie(key)
        },
        loadJsCss(pathArray, version = 1) {
            //通过js加载需要的js和css文件, 传入数组.后面添加了版本号，目的去除缓存机制
            for (let path of pathArray) {
                if (!path || path.length === 0 || (!path.includes('css') && !path.includes('js'))) {
                    throw new Error('path为空或者没有css，js结尾');
                } else {
                    let [head, tag] = [document.getElementsByTagName('head')[0], path.split('.')];
                    if (tag.pop() === 'css') {
                        let link = document.createElement('link');
                        link.href = `${path}?v=${version}`;
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        head.appendChild(link);
                    } else {
                        let script = document.createElement('script');
                        script.src = `${path}?v=${version}`;
                        script.type = 'text/javascript';
                        head.appendChild(script);
                    }
                }
            }
        },
        /**
         * 去除字符串空格
         * @param    {String}  str    字符串
         * @param    {Number}  type   数字  1-所有空格  2-前后空格  3-前空格 4-后空格
         */
        trimAll(str, type = 1) {
            switch (type) {
                case 1:
                    return str.replace(/\s+/g, "");
                case 2:
                    return str.replace(/(^\s*)|(\s*$)/g, "");
                case 3:
                    return str.replace(/(^\s*)/g, "");
                case 4:
                    return str.replace(/(\s*$)/g, "");
                default:
                    return str;
            }
        },
        getNowFormatDate(split = '-') {
            //获得当前日期，传入分割符号
            const date = new Date();
            let [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
            //return `${year}年${month < 10?`0${month}`:month}月${day < 10?`0${day}`:day}日`;
            return `${year}${split}${month < 10 ? `0${month}` : month}${split}${day < 10 ? `0${day}` : day}`;
        },
        getNowWeekDay() {
            //获取今天是周几
            const [date, weekday] = [new Date(), ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]];
            return weekday[date.getDay()];
        },
        show(dom) {
            $(dom).css("display", 'block');
        },
        hide(dom) {
            $(dom).css("display", 'none');
        },
        showTip(msg) {
            _showTip(msg);
        }
    });
})(window.jQuery);