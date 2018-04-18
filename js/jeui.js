/**
 * JEUI Tools
 */
window.je = {};
var $Q = function (selector,content) {
    content = content || document;
    return selector.nodeType ? selector : content.querySelector(selector);
},$QS = function (selector,content) {
    content = content || document;
    return selector.nodeType ? selector : content.querySelectorAll(selector);
};
HTMLElement.prototype.find = function(selector) {
    return this.querySelector(selector);
};
HTMLElement.prototype.finds = function(selector) {
    return this.querySelectorAll(selector);
};
//原生JS封装Tap事件，解决移动端300ms延迟
HTMLElement.prototype.addTapEvent = function(callback) {
    var startTime = 0, endTime = 0,
        waitTime = 500, //tap等待时间，在此事件下松开可触发方法
        startCX = 0, startCY = 0,
        endCX = 0, endCY = 0,
        removH = 15, //水平或垂直方向移动超过15px测判定为取消（根据chrome浏览器默认的判断取消点击的移动量)
        okTap = false;
    this.addEventListener('touchstart', function() {
        startTime = event.timeStamp;
        var touch = event.changedTouches[0];
        startCX = touch.clientX, startCY = touch.clientY;
        okTap = false;
    });
    this.addEventListener('touchmove', function() {
        var touch = event.changedTouches[0];
        endCX = touch.clientX, endCY = touch.clientY;
        var CXH = Math.abs(endCX - startCX) > removH, CYH = Math.abs(endCY - startCY) > removH
        if (CXH || CYH)  okTap = true;
    });
    this.addEventListener('touchend', function() {
        endTime = event.timeStamp;
        if (!okTap && (endTime - startTime) <= waitTime) callback && callback();
    });
};
Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this, fNOP = function () {},
        fBound = function () {
            return fToBind.apply(
                this instanceof fNOP && oThis ? this : oThis || window,
                aArgs.concat(Array.prototype.slice.call(arguments))
            );
        };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
};
je.ready = function(callback){
    if (/complete|loaded|interactive/.test(document.readyState) && document.body){
        callback && callback();
    }else{
        document.addEventListener('DOMContentLoaded', function(){
            callback && callback(); 
        }, false);
    }
};
/* 去除两端空格 */
je.trim = function (str) {
    return str.replace(/^\s+|\s+$/g,'');
};
je.isType = function (obj,type) {
    var firstUper = function (str) {
        str = str.toLowerCase();
        return str.replace(/\b(\w)|\s(\w)/g, function (m) {
            return m.toUpperCase();
        });
    }
    return Object.prototype.toString.call(obj) == "[object " + firstUper(type) + "]";
}   
je.isObject = function(obj) {
    return je.isType(obj,"object");
};
je.isString = function(obj) {
    return je.isType(obj,"string");
};
je.isNumber = function(obj) {
    return je.isType(obj,"number");
};
je.isFunction = function(obj) {
    return je.isType(obj,"function");
};
je.isArray = Array.isArray || function(obj) {
    return je.isType(obj,"array");
};
je.keys = Object.keys? Object.keys: function(obj){
    var res = [];
    for (var i in obj) if (obj.hasOwnProperty(i)) {
        res.push(i);
    }
    return res;
};
je.map = function (array, callback) {
    var res = [];
    for (var i = 0, len = array.length; i < len; i++) {
        res.push(callback(array[i], i));
    }
    return res;
}
/* 判断对象是否为空对象 */
je.isEmptyObject = function (obj) {
    for(var i in obj){return false;}
    return true;
};
je.extend = function () {
    var options, name, src, copy, deep = false, target = arguments[0], i = 1, length = arguments.length;
    if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2;
    if (typeof (target) !== "object" && typeof (target) !== "function") target = {};
    if (length === i) target = this, --i;
    for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name], copy = options[name];
                if (target === copy) continue;
                if (copy !== undefined) target[name] = copy;
            }
        }
    }
    return target;
};
/* 判断是否为移动端 */
je.isMobile = function () {
    var navMatch = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|JUC|WebOS|Windows Phone)/i;
    return navigator.userAgent.match(navMatch) ? true : false;
};
/*
	解析URL地址
	je.parsURL( url ).file;     // = 'index.html'  	
	je.parsURL( url ).hash;     // = 'top'  	
	je.parsURL( url ).host;     // = 'www.abc.com'
	je.parsURL( url ).query;    // = '?id=255&m=hello'  
	je.parsURL( url ).queryURL  // = 'id=255&m=hello' 	
	je.parsURL( url ).params;   // = Object = { id: 255, m: hello }  	
	je.parsURL( url ).prefix;   // = 'www'
	je.parsURL( url ).path;     // = '/dir/index.html'  	
	je.parsURL( url ).segments; // = Array = ['dir', 'index.html']  	
	je.parsURL( url ).port;     // = '8080'  	
	je.parsURL( url ).protocol; // = 'http'  	
	je.parsURL( url ).source;   // = 'http://www.abc.com:8080/dir/index.html?id=255&m=hello#top' 
*/
je.parsURL = function (url) {
    url = arguments[0] == undefined ? window.location.href : url;
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function () {
            var ret = {}, seg = a.search.replace(/\?/, '').split('&'), len = seg.length, i = 0, s;
            for (; i < len; i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                var isw = /\?/.test(s[0]) ? s[0].split("?")[1] : s[0];
                ret[isw] = s[1];
            }
            return ret;
        })(),
        prefix: a.hostname.split('.')[0],
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/'),
        queryURL: a.search.replace(/^\?/, '')
    };
};
/* 保留小数点后N位 */
je.toDecimal = function (val, num) {
    num = num == undefined ? 2 : num;
    // 四舍五入
    var vals = Math.round(val * Math.pow(10, num)) / Math.pow(10, num),
        toVal = vals.toString(), len = toVal.indexOf('.');
    // 如果是整数，小数点位置为-1
    if (len < 0) {
        len = toVal.length;
        toVal += '.';
    }
    // 不足位数以零填充
    while (toVal.length <= len + num) {
        toVal += '0';
    }
    return toVal;
};
/* je.each(arr,function(val,i){}) */
je.each = function(obj, callback /*, thisp*/) {
    if (typeof callback != "function") throw new TypeError(callback + ' is not a function');
    var len = obj.length,thisp = arguments[2];
    for (var i = 0; i < len; i++) {
        if (i in obj) callback.call(thisp, obj[i], i, obj);
    }
}; 
je.html = function (elem, html) {
    return typeof html === "undefined" ? elem && elem.nodeType === 1 ? elem.innerHTML : undefined : typeof html !== "undefined" && html == true ? elem && elem.nodeType === 1 ? elem.outerHTML : undefined : elem.innerHTML = html;
};
/* 读取设置节点文本内容 */
je.text = function(elem,value) {
    var innText = document.all ? "innerText" :"textContent";
    return typeof value === "undefined" ? elem && elem.nodeType === 1 ? elem[innText] :undefined : elem[innText] = value;
};
/* 设置值 */
je.val = function (elem,value) {
    if (typeof value === "undefined") {
        return elem && elem.nodeType === 1 && typeof elem.value !== "undefined" ? elem.value :undefined;
    }
    // 将value转化为string
    value = value == null ? "" :value + "";
    elem.value = value;
};
/* 添加样式名 */
je.addClass = function (elem, cls) {
    if(!elem) return;
    je.each(cls.split(" "),function (val,i) {
        elem.classList.add(val);
    })
};

/* 移除样式名 */
je.removeClass = function (elem, cls) {
    if(!elem )return;
    je.each(cls.split(" "),function (val,i) {
        elem.classList.remove(val);
    })
};

/* 是否含有CLASS */
je.hasClass = function (c, node) {
    if(!node || !node.className)return false;
    return node.className.indexOf(c)>-1;
};
/* 添加与获取样式值 */
je.css = function (elem, value) {
    var cssNumber = {'column-count': 1, 'columns': 1, 'box-flex': 1, 'line-clamp': 1, 'font-weight': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1},
        toLower = function (str) {
            return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase()
        },
        addPx = function (name, value) {
            return (typeof value == "number" && !cssNumber[toLower(name)]) ? value + "px" : value
        };
    var cell = (Object.prototype.toString.call(elem)=='[object Array]') ? elem : [elem];
    if (cell.length == 0) return null;
    if (typeof (value) === "string") {
        return (function (el,style) {
            var def = document.defaultView;
            style.indexOf('-')>-1 && (style = style.replace(/-(\w)/g,function(m,a){return a.toUpperCase()}));
            style == 'float' && (style = def ? "cssFloat" : "styleFloat");
            return el.style[style] || (def ? window.getComputedStyle(el, null)[style] : el.currentStyle[style]) || null;
        })(cell[0], toLower(value));
    } else {
        return je.each(cell,function (item,i) {
            for (var x in value) item.style[toLower(x)] = addPx(x, value[x]);
        });
    }
};

/* 事件绑定 */
je.on = function (elem, type, callback) {
    if (elem.addEventListener) {
        type == "tap" ? elem.addTapEvent(callback) : elem.addEventListener(type, callback, false);
        return true;
    } else if (elem.attachEvent) {
        return elem.attachEvent("on" + type, callback);//IE5+
    }
};
/* 表单序列化 */
je.serialize = function (form) {
    var arrFormData = [], objFormData = {};
    [].slice.call(form.elements).forEach(function (ele) {
        // 元素类型和状态
        var type = ele.type, disabled = ele.disabled;
        // 元素的键值
        var name = ele.name, value = encodeURIComponent(ele.value || 'on');
        // name参数必须，元素非disabled态，一些类型忽略
        if (!name || disabled || !type || (/^reset|submit|image$/i.test(type)) || (/^checkbox|radio$/i.test(type) && !ele.checked)) {
            return;
        }
        type = type.toLowerCase();
        var objForm = function (vals) {
            if (objFormData[name]) {
                objFormData[name].push(vals);
            } else {
                objFormData[name] = [vals];
            }
        }
        if (type !== 'select-multiple') {
            objForm(value);
        } else {
            [].slice.call(ele.querySelectorAll('option')).forEach(function (option) {
                var optionValue = encodeURIComponent(option.value || 'on');
                if (option.selected) {
                    objForm(optionValue);
                }
            });
        }
    });

    for (var key in objFormData) {
        arrFormData.push(key + '=' + objFormData[key].join());
    }
    return arrFormData.join('&');
};
/* ajax 请求数据 */
je.ajax = function (params) {
    var jsonpID = 0;
    function xhrAJAX(params) {
        var that = this, ajaxSettings = {
            // 默认请求类型
            type:'GET',
            dataType:"json",
            processData:true,
            complete:function(){},//要求执行回调完整（包括：错误和成功）
            // MIME类型的映射
            accepts:{
                script:'text/javascript, application/javascript',
                json:  'application/json',
                xml:   'application/xml, text/xml',
                html:  'text/html',
                text:  'text/plain'
            },
            // 应该被允许缓存GET响应
            cache: true
        };
        that.opts = je.extend(ajaxSettings, params);
        //发送之前执行的函数
        that.beforeSend = function (before) {
            before && before();
            return that;
        };
        //请求数据
        that.done = function (success,error) {
            //如果请求成功时执行回调
            success = success || function(){},
            //如果请求失败时执行回调
            error = error || function(){};
            that.initAjax(that.opts,success,error);
            return that;
        };
    }
    xhrAJAX.prototype = {
        param:function(obj,traditional,scope){
            if(typeof(obj) === "string") return obj;
            var that = this, params = [],str='';
            params.add=function(key, value){
                this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value== null?"":value));
            };
            if(scope==true&&typeof(obj)==='object') params.add(traditional,obj);
            else {
                for(var p in obj) {
                    var v = obj[p],str='',
                    k = (function(){
                        if (traditional) {
                            if (traditional==true) return p;
                            else{
                                if(scope&&typeof(obj)==='array') return traditional
                                return traditional + "[" + (typeof(obj)==='array'?"":p) + "]";
                            };
                        };
                        return p
                    })();
                    str = typeof v==="object" ? that.param(v, k ,traditional) : params.add(k, v);
                    if (str) params.push(str);
                };
            }
            return params.join('&');
        },
        //创建XHR对象处理。
        getXHR : function () {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else {
                //遍历IE中不同版本的ActiveX对象
                var versions = ["Microsoft", "msxm3", "msxml2", "msxml1"];
                for (var i = 0; i < versions.length; i++) {
                    try {
                        var XMLHttp = versions[i] + ".XMLHTTP";
                        return new ActiveXObject(XMLHttp);
                    } catch (e) {
                        window.alert("Your browser does not support ajax, please replace it!");
                    }
                }
            }
        },
        createJsonp:function (options,success,error) {
            var that = this, _callbackName = options.jsonpCallback,
            callbackName = (typeof(_callbackName) == 'function' ? _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
            script = document.createElement('script');
            script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName);
            script.type = "text/javascript";
            document.body.appendChild(script);
            if (error){ 
                script.onerror = function() {
                    error && error(options)
                }
            }
            window[callbackName] = function(data) {
                document.body.removeChild(script);
                success && success(data, options);
            };
            
            return that.getXHR();
        },
        initAjax:function(options,success,error){
            var that = this, key,name,abortTimeout,
                setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
                appendQuery = function(url, query) {
                    if (query == '') return url;
                    return (url + '&' + query).replace(/[&?]{1,2}/, '?');
                },
                serializeData = function(options){
                    if (options.processData && options.data && typeof(options.data) != "string")
                        options.data = that.param(options.data, options.traditional);
                    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
                        options.url = appendQuery(options.url, options.data), options.data = undefined;
                };
            serializeData(options);

            //jsonp
            var dataType = options.dataType, hasPlaceholder = /\?.+=\?/.test(options.url);
            if (hasPlaceholder) dataType = 'jsonp';
            //给URL后面加上时间戳
            if (options.cache === false || ( (!options || options.cache !== true) && ('script' == dataType || 'jsonp' == dataType) )) {
                options.url = appendQuery(options.url, '_jeParams=' + Date.now());
            }
            //判断是否为jsonp
            if ('jsonp' == dataType) {
                if (!hasPlaceholder) options.url = appendQuery(options.url,options.jsonp ? (options.jsonp + '=?') : options.jsonp === false ? '' : 'callback=?')
                return that.createJsonp(options,success,error);
            }
            
            var data = options.data,
                callback = success || function(){},
                errback = error || function(){},
                mime = options.accepts[options.dataType],
                content = options.contentType,
                xhr = that.getXHR(),
                nativeSetHeader = xhr.setRequestHeader,
                headers={};
                if (!options.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest'),setHeader('Accept', mime || '*/*');
                if (options.headers) for (name in options.headers) setHeader(name, options.headers[name]);
                if (options.contentType || (options.contentType !== false && options.data && options.type.toUpperCase() != 'GET'))
                    setHeader('Content-Type', options.contentType || 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4) {
                    clearTimeout(abortTimeout);
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 0) {
                        var result, error = false;
                            result = xhr.responseText;
                        try {
                            if (options.dataType == 'script')    (1,eval)(result);
                            else if (options.dataType == 'xml')  result = xhr.responseXML;
                            else if (options.dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                        } catch (e) { error = e }

                        if (error){
                            errback && errback(error, 'parsererror', xhr, options);
                        }else{
                            callback && callback(result, 'success', xhr);
                        } 
                    } else {
                        options.complete && options.complete(xhr, error ? 'error' : 'success');
                    }
                }
            };
            if (data&&data instanceof Object&&options.type=='GET'){
                data?options.url =(options.url.indexOf('?')>-1?options.url +'&'+ data:options.url +'?'+ data) :null;
            }
            var async = 'async' in options ? options.async : true
            xhr.open(options.type, options.url, async);
            if (mime) xhr.setRequestHeader('Accept', mime);
            if (data instanceof Object && mime == 'application/json' ) data = JSON.stringify(data), content = content || 'application/json';
            for (name in headers) nativeSetHeader.apply(xhr, headers[name]);
            if (options.timeout > 0) abortTimeout = setTimeout(function(){
                xhr.onreadystatechange = empty;
                xhr.abort();
                errback(null, 'parsererror', xhr, options)
            }, options.timeout);
            xhr.send(data?data:null);
        }
    };
    return new xhrAJAX(params);
};

je.get = function (url, data, dataType) {
    return je.ajax({ url: url , data: data || null , dataType: dataType });  
};

je.post = function (url, data, dataType) {
    return je.ajax({ url: url ,type:'POST', data: data || null , dataType: dataType });
};

je.getJSON = function (url, data) {
    return je.ajax({ url: url , data: data || null, dataType: 'json' });
};

je.JSONP = function (url, data) {
    return je.ajax({ url: url , data: data || null, dataType: 'jsonp' });
};

/* css或js预加载 */
je.require = function (arrSrc, callback) {
    if(je.isFunction(arrSrc)){
        je.ready(arrSrc);  return;
    }
    var arrList = je.isArray(arrSrc) ? arrSrc : [arrSrc], 
        arrLen = arrList.length, arrTotal = 0, doc = document,
        head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement,
        baseElement = head.getElementsByTagName("base")[0];
    var baseurl = (function () {
        var tags = document.getElementsByTagName("script"),
            script = tags[tags.length - 1],
            url = script.hasAttribute ? script.src : script.getAttribute('src', 4);
        return url.replace(/\/[^\/]+$/, "");
    })();
    //创建一个标签并设置路径
    var createTagsNode = function (url) {
        var returi,spath,tmp,srcl, ext = url.split(/\./).pop(),isFull = /^(\w+)(\d)?:.*/.test(url),
            isCSS = (ext.replace(/[\?#].*/, '').toLowerCase() == "css"),
            node = doc.createElement(isCSS ? "link" : "script");
        if (isFull) { //如果本来就是完整路径
            returi = url;
        } else {
            tmp = url.charAt(0);
            spath = url.slice(0,2);
            if(tmp != "." && tmp != "/"){ //当前路径
                returi = baseurl + "/" + url;
            }else if(spath == "./"){ //当前路径
                returi = baseurl + url.slice(1);
            }else if(spath == ".."){ //相对路径
                srcl = baseurl;
                url = url.replace(/\.\.\//g,function(){
                    srcl = srcl.substr(0,srcl.lastIndexOf("/"));
                    return "";
                });
                returi = srcl + "/" + url;
            }
        } 
        //为uri添加一个统一的后缀
        if (!isCSS && !/\.js$/.test(returi)) returi += ".js";

        node.type = isCSS ? "text/css" : "text/javascript";
        if (isCSS) {
            node.href = returi;
            node.rel = "stylesheet";
        } else {
            node.src = returi;
            node.async = true;
        }
        node.charset = "utf-8";
        return node;
    }
    //css或js逐个加载
    for (var i = 0; i < arrLen; i++) {
        var uri = arrList[i], node = createTagsNode(uri);
        (function (node) {
            //检测script 的onload事件
            var supportOnload = "onload" in node;
            if (supportOnload) {
                node.onload = function () {
                    addLoad.call(node, false);
                };
                node.onerror = function () {
                    new Error("Error: " + uri + " \u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u8BBF\u95EE");
                    addLoad.call(node, true);
                }
            } else {
                node.onreadystatechange = function () {
                    if (/loaded|complete/.test(node.readyState)) addLoad.call(node);
                }
            }

            function addLoad(error) {
                arrTotal++;
                node.onload = node.onerror = node.onreadystatechange = null;
                //head.removeChild(node);
                node = null;
                if (arrTotal == arrLen) {
                    callback && callback(error);
                    arrTotal = 0;
                }
            }
            baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
        })(node);
    }
};

if (!window.Promise) {
    function Promise(callback) {
        var self = this;
        self.status = 'pending';
        self.thenCache = [];
        if (!(this instanceof Promise)) throw 'Defer is a constructor and should be called width "new" keyword';
        if (!je.isFunction(callback)) throw 'Defer params must be a function';

        //为了让传进来的函数在then后执行
        setTimeout(function () {
            try {
                callback.call(this, self.resolve.bind(self), self.reject.bind(self))
            } catch (e) {
                self.reject(e);
            }
        }, 1);
    }
    Promise.prototype.resolve = function (value) {
        this.value = value;
        this.status = 'resolved';
        this.triggerThen();
    }
    Promise.prototype.reject = function (reason) {
        this.value = reason;
        this.status = 'rejected';
        this.triggerThen();
    }
    Promise.prototype.then = function (onResolve, onReject) {
        this.thenCache.push({ onResolve: onResolve, onReject: onReject });
        return this;
    }
    Promise.prototype.catch = function (callback) {
        if (je.isFunction(callback)) { 
            this.errorHandle = callback;
        }
    };
    Promise.prototype.delay = function(ms,val){
        return this.then(function(ori){
            // return Promise.delay(ms,val || ori);
            return Promise(function(resolve,reject){
                setTimeout(function(){
                    resolve(val || ori);
                },ms);
            })
        })
    }
    // Promise.delay = function(ms,val){
    //     return Promise(function(resolve,reject){
    //         setTimeout(function(){
    //             resolve(val);
    //         },ms);
    //     })
    // }
    Promise.prototype.triggerThen = function () {
        var current = this.thenCache.shift(), res;
        if (!current && this.status === 'resolved') {
            return this;
        } else if (!current && this.status === 'rejected') {
            if (this.errorHandle) {
                this.value = this.errorHandle.call(undefined, this.value);
                this.status = 'resolved';
            }
            return this;
        };
        if (this.status === 'resolved') {
            res = current.onResolve;
        } else if (this.status === 'rejected') {
            res = current.onReject;
        }
        if (typeof res === "function") {
            try {
                this.value = res.call(undefined, this.value);
                this.status = 'resolved';
                this.triggerThen();
            } catch (e) {
                this.status = 'rejected';
                this.value = e;
                return this.triggerThen();
            }
        } else {
            this.triggerThen();
        }
    }
    Promise.all = function (promises) {
        if (!isArray(promises)) throw new TypeError('You must pass an array to all.');
        return Promise(function (resolve, reject) {
            var result = [], len = promises.length, count = len;
            function resolver(index) {
                return function (value) {
                    resolveAll(index, value);
                };
            }
            function rejecter(reason) {
                reject(reason);
            }
            function resolveAll(index, value) {
                result[index] = value;
                if (--count == 0) resolve(result);
            }

            for (var i = 0; i < len; i++) {
                promises[i].then(resolver(i), rejecter);
            }
        });
    }
    window.Promise = Promise;
}



//为移动端页面body设置尺寸
je.ready(function () {
    (function docBodySize() {
        var setBodySize = function (size) {
            var doc = document,
                docWidth = doc.documentElement.clientWidth || doc.body.clientWidth,
                docHeight = doc.documentElement.clientHeight || doc.body.clientHeight;
            var DW = !je.isMobile() && docWidth > size ? size : docWidth;
            je.css(doc.body,{width:DW});
        };
        setBodySize(750);
        window.addEventListener("resize",function(){
            setBodySize(750);
        });
    })()
})
