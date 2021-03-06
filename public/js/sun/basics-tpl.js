//angularjs的一般基础功能模块
angular.module('sun',['components','basics']);
angular.module('basics',['baseConf','staticVal','factor','commonService']);
angular.module('staticVal',[])
angular.module('baseConf',[])
    //处理angularjs与jquery表单提交的形式不同，后台接收可能不到传参。
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function(obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '='
                        + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]'
                ? param(data)
                : data;
        }];
    })
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            try{
                text = text.replace(/<[//]{0,1}(script|style)[^><]*>/ig,"");
                text = text.replace(/(onabort|onblur|onchange|onclick|ondblclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onresize|onselect|onsubmit|onunload)/ig,'马赛克');
                //<a href="http://www.baidu.com" target="_blank">hello</a>
                //if(text){
                //    /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/
                //}else{
                //    text = "your script is not allowed!only a style!"
                //}
                text = '<pre style="width:inherit;white-space: pre-wrap;word-wrap: break-word;">'+text+'</pre>';
                return $sce.trustAsHtml(text);
            }catch(e){
            }
        };
    }])
;
angular.module('factor',[])
    //socket服务
    .factory('socket',function($rootScope,global){
        var socket = io(global.SocketAddr ,
        //var socket = io('ws://121.41.123.2:5000',
            {
                //"pingInterval":1000,
                //"pingTimeout":60000
            }
        );
        return{
            on:function(eventName,callback){
                socket.on(eventName,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        callback.apply(socket,args);
                    });
                });
            },
            emit:function(eventName,data,callback){
                socket.emit(eventName,data,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        if(callback){
                            callback.apply(socket,args);
                        }
                    });
                });
            },
            socket1:socket
        };
    })
    .factory('global',function(){
        var host = window.location.hostname;
        if(host == "test.geminno.cn"){
            return{
                URL:'http://test.geminno.cn/project/index.php/api/',
                SocketAddr:'ws://121.41.41.46:5000',
                NODE:'http://121.41.41.46:5000',
                NODE_FILE:'http://121.41.41.46:8000',
                UPTOKEN_URL:'http://121.41.41.46:8000/',
                Technologies:[
                    {id:186,name:'ios',active:false},
                    {id:185,name:'Android',active:false},
                    {id:183,name:'C++',active:false},
                    {id:182,name:'C语言',active:false},
                    {id:184,name:'Java',active:false},
                    {id:190,name:'.net',active:false}
                ]
            };
        }else if(host == "www.geminno.cn"){
            return{
                URL:'http://www.geminno.cn/project/index.php/api/',
                SocketAddr:'ws://121.41.123.2:5000',
                NODE:'http://121.41.123.2:5000',
                NODE_FILE:'http://121.41.123.2:8000',
                UPTOKEN_URL:'http://121.41.123.2:8000/',
                Technologies:[
                    {id:190,name:'ios',active:false},
                    {id:189,name:'Android',active:false},
                    {id:187,name:'C++',active:false},
                    {id:186,name:'C语言',active:false},
                    {id:188,name:'Java',active:false},
                    {id:191,name:'.net',active:false}
                ]
            };
        }else if(host == "localhost"){
            return{
                URL:'http://www.geminno.cn/project/index.php/api/',
                SocketAddr:'ws://121.41.123.2:5000',
                NODE:'http://121.41.123.2:5000',
                NODE_FILE:'http://121.41.123.2:8000',
                UPTOKEN_URL:'http://121.41.123.2:8000/',
                Technologies:[
                    {id:190,name:'ios',active:false},
                    {id:189,name:'Android',active:false},
                    {id:187,name:'C++',active:false},
                    {id:186,name:'C语言',active:false},
                    {id:188,name:'Java',active:false},
                    {id:191,name:'.net',active:false}
                ]
            };
        }
    })
;
angular.module('commonService',[])

;

angular.module('components',['ui.sun.tpls','ui.sun.sce']);
angular.module('ui.sun.tpls',[]);
angular.module("ui.sun.sce", []);