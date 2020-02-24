;let plugin = (function () {
    function _firstPlugin() {
        console.log('this is first plugin');
    }

    return {firstPlugin: _firstPlugin};
})();

(function () {
    let _option={
        default_word:'this is second plugin'
    }
    let _plugin_api={
        firstFunc(str=_option.default_word){
            alert(str);
        },
        secondFunc(str=_option.default_word){
            alert(str+'2');
        },
    }
    this.SecondPlugin=_plugin_api;
})()