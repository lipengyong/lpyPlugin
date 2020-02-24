(function () {
    const [reqPath, token] = [window.location.protocol + "//" + window.location.host + "/wxService/api", $.cookie("token")];
    let [repairUtil,scroll,repairParam,repairBack,repairInfo,repairType] = ['','',{pagesNo: 0, pagesSize: 5, searchWords: '', type: "1", total: 0},'','',''];

    /**
     * 初始化参数
     */
    function init() {
        repairUtil.getDict("P_REPAIR_BACK").then((_data) => {
            repairType[_data[0].dictValue] = _data[0].dictName;
            return repairUtil.getDict("P_REPAIR_INFO");
        }).then((_data)=>{
            repairType[_data[0].dictValue] = _data[0].dictName;
            repairUtil.getRepairList();
        })

    };

    /**
     * 添加监听事件
     */
    function addListener() {
        const [$repairListLi] = [$('#repairList li')];
        /* 列表点击事件监听*/
        $repairListLi.on('click', () => {
            window.location.href = `repairDetail.html?repairLsh=${$(this.data('lsh'))}`;
        })
    };

    repairUtil = {
        //获取失物列表
        getRepairList() {
            return new Promise((resolve, reject) => {
                $.ajaxProcess({
                    url: "../repairList.json",
                    data: {
                        pagesNo: repairParam.pagesNo * repairParam.pagesSize,
                        pagesSize: repairParam.pagesSize,
                        searchWords: repairParam.searchWords,
                        type: repairParam.type,
                        token: token
                    },
                    showLoading: false,
                    success: function (suc, data) {
                        if (suc) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    },
                    error:function (data) {
                        reject("请求失败");
                    }
                })
            }).then((data) => {
                repairUtil.setRepairHtml(data);
                repairParam.total = data.total;
            }, (error) => {
                $.showTip(error);
            });

        },
        //设置html
        setRepairHtml(data) {
            let [repairLists, _html,$repairList] = [data.repairList, new Array(),$("#repairList")];//报修项目列表，html数组
            if (repairLists != undefined && repairLists.length == 0 && repairParam.pagesNo == 0) {
                //如果没有获取到数据
                scroll.hide();
            } else {
                for(let repairDetail of repairLists){
                    _html.push(`<li class="wx-li" data-lsh="${repairDetail.lsh}"><div class="wx-li-logo"><img src="" onerror="imgError(this,'../images/repairDefault.png');"/></div><div class="wx-li-content"><div class="content-left"><p>${repairDetail.repairTitle}</p><div class="content-desc">${repairDetail.description}</div><div class="content-type"><span>类型:</span><span  class="repair-type">${repairType[repairDetail.repairType.substring(0, 1)]}</span><span>时间:</span><span class="repair-time">${repairDetail.createTime.substring(0, 11)}</span></div></div><div class="content-right"><div><i class="icon-address-2"></i></div><div>${repairDetail.campusName}</div></div></div></li>`);
                }
                repairParam.pagesNo == 0 ? $repairList.html(_html.join('')) : $repairList.append(_html.join(''));

                if (!$(".pullUpLabel").html()) {
                    //第一次加载，初始化下滑列表
                    scroll.init();
                } else {
                    //刷新下滑列表
                    wrapper.refresh();
                }
            }
        },
        getDict(data) {
            return new Promise((resolve, reject) => {
                $.ajaxProcess({
                    url: '../repairBack.json',
                    type: 'GET',
                    data: data,
                    success: function (suc, data) {
                        if (suc) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    }
                });
            })
        }
    }
     scroll={
        init(){
            refresher.init({
                id: "wrapper",
                pullDownAction: scroll.refresh,
                pullUpAction: scroll.load
            });
        },
        refresh(){
            scroll.show();
            repairParam.pagesNo = 0;
            repairUtil.getRepairList();
            wrapper.refresh();
        },
        load() {
            if (repairParam.pagesNo < Math.ceil(repairParam.total / repairParam.pagesSize)) {
                repairParam.pagesNo++;
                repairUtil.getRepairList();
            } else {
                wrapper.refresh();
                $('.pullUpLabel').html('没有更多了');
            }
        },
        show(){
            $("#wrapper").show();
            $("#noResult").hide();
        },
        hide(){
            $("#wrapper").hide();
            $("#noResult").show();
        }
    }
    init();//初始化参数
    addListener();
    //搜索框开始
    let $searchBar = $('#searchBar'),
        $searchResult = $('#searchResult'),
        $searchText = $('#searchText'),
        $searchInput = $('#searchInput'),
        $searchClear = $('#searchClear'),
        $searchCancel = $('#searchCancel'),
        $addRepair = $('#add-repair'),
        timeout;

    function hideSearchResult() {
        $searchResult.hide();
        $searchInput.val('');
        repairParam.pagesNo = 0;
        repairParam.searchWords = "";
        repairUtil.getRepairList();
    }

    function cancelSearch() {
        hideSearchResult();
        $searchBar.removeClass('weui-search-bar_focusing');
        $searchText.show();
    }

    $searchText.on('click', function () {
        $searchBar.addClass('weui-search-bar_focusing');
        $searchInput.focus();
    });
    $searchInput
        .on('blur', function () {
            if (!this.value.length) cancelSearch();
        })
        .on('input', function () {
            let that = this;
            if ($.trimAll(that.value).length) {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    repairParam.pagesNo = 0;
                    repairParam.searchWords = $.trimAll(that.value);
                    repairUtil.getRepairList();
                }, 1000);
                $searchResult.show();
            } else {
                repairParam.pagesNo = 0;
                repairParam.searchWords = "";
                repairUtil.getRepairList();
                $searchResult.hide();
            }
        });
    $searchClear.on('click', function () {
        hideSearchResult();
        $searchInput.focus();
    });
    $searchCancel.on('click', function () {
        cancelSearch();
        $searchInput.blur();
    });
    $addRepair.on('click', function () {
        window.location.href = `addRepair.html?version=${$.random()}`;
    });
})();