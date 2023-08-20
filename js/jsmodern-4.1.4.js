/*!
 *  jsModern v4.1.4
 *  Copyright 2017, Frank Chao
 *  Released under the MIT license.
 */

!(function ( root, factory ) {

    if ( typeof define === "function" && define.amd ) { 
        define(["jquery"], factory);
    } else if ( typeof module !== "undefined" && typeof exports === "object" ) {
        module.exports = factory(require("jquery"));
    } else {
        root.jsModern = factory(root.jQuery);
    }

})( typeof window !== "undefined" ? window : this, function ( $ ) {

    // 检测是否在 jsModern 之前引入了 jQuery 文件
    if ( typeof jQuery === "undefined" ) {
        throw new Error("jsModern\'s JavaScript requires jQuery !!!");
    }

    // 检测 jQuery 的版本 [ 不低于 v1.11.0 ]
    var jq_version = $.fn.jquery.split(".");
    if ( ~~jq_version[0] === 1 && ~~jq_version[1] < 11 ) {
        throw new Error("jsModern\'s JavaScript requires at least jQuery v1.11.0 !!!");
    }

    // 内部函数和变量
    var document = window.document,
        $document = $(document),
        $window = $(window),
        $html = $("html"),
        $head = $("head");
    var In = {
        str: function ( str ) {
            return !!($.type(str) === "string");
        },
        bool: function ( bool ) {
            return !!($.type(bool) === "boolean");
        },
        num: function ( num ) {
            return !!($.isNumeric(num) && Math.abs(num) !== Infinity && Math.floor(num) === num);
        },
        ua: navigator.userAgent.toLowerCase(),
        winWidth: $window.width(),
        winHeight: $window.height(),
        screenWidth: screen.width,
        screenHeight: screen.height,
        jsmodern: window.jsModern,
        templateCache: {},
        isMobile: function () {
            return !!(In.ua.match(/(ios|iphone|ipod|ipad|mobile|android|symbianos|ucweb|mqqbrowser|iemobile|webos|windows phone|windows mobile|opera mini|opera mobl|nexus|series|nokia|blackberry|meego|playbook|fennec|tablet)/) && "ontouchend" in document);
        },
        layer: {
            tmpl: function ( type, title, content ) {
                var _title = content ? title : decodeURI("%E6%9D%A5%E8%87%AA%E7%BD%91%E9%A1%B5%E7%9A%84%E6%B6%88%E6%81%AF");
                var _content = content || title;
                var time = 300;
                var isMobile = In.isMobile();
                var box = '<section class="jmn-acp-container" id="jmn-acp-container" style="display:none;"><div class="jmn-acp-mask"></div><div class="jmn-acp"><p class="jmn-acp-title">' + _title + '</p><div class="jmn-acp-content"><div>' + _content + '</div></div><div class="jmn-acp-sure">' + decodeURI("%E7%A1%AE%E5%AE%9A") + '</div><div class="jmn-acp-cancel">' + decodeURI("%E5%8F%96%E6%B6%88") + '</div></div></section>';
                if ( !$("#jmn-acp-container").length ) {
                    $("body").prepend(box);
                    var $container = $("#jmn-acp-container"),
                        $dialog = $container.find(".jmn-acp"),
                        $title = $dialog.find(".jmn-acp-title"),
                        $content = $title.next().find("div"),
                        $sure = $container.find(".jmn-acp-sure"),
                        $cancel = $container.find(".jmn-acp-cancel");

                    // 创建用于弹出框的全局变量
                    var gv = jsModern.random(13, false) + $.now(); 
                    $html.data("jsmodernACPVar", gv);
                    function callback ( fn ) {
                        if ( type === "prompt" ) {
                            window[gv].value = $dialog.find(".jmn-acp-prompt").val();
                            fn.call(window[gv]);
                        } else {
                            fn();
                        }
                    }
                    window[gv] = {
                        sure: function ( fn ) {
                            $sure.click(function () {
                                callback(fn);
                            })
                            return this;
                        },
                        cancel: function ( fn ) {
                            $cancel.click(function () {
                                callback(fn);
                            })
                            return this;
                        },
                        value: undefined
                    };

                    if ( type === "alert" ) {
                        $cancel.remove();
                    }
                    if ( type === "prompt" ) {
                        $content.after('<input type="text" maxlength="100" autocomplete="false" class="jmn-acp-prompt">');
                    }
                    if ( In.screenWidth < 500 ) {
                        $dialog.width("80%");
                    }
                    if ( isMobile ) {
                        $dialog.addClass("jmn-acp-mobile");
                    }

                    // 超出限制高度则显示滚动条
                    $container.show();
                    var resultHeight = In.winHeight - 70;
                    if ( $dialog.outerHeight() > resultHeight ) {
                        $dialog.height(resultHeight);
                        $content.parent().height(resultHeight - $title.height() - 53);
                        jsModern.scrollBar(".jmn-acp-content", {
                            theme: "jmn-acp-scrollbar"
                        });

                        // 悬浮显示滚动条
                        var $bar = $dialog.find(".jmn-acp-scrollbar");
                        $dialog.on({
                            mouseenter: function () {
                                $bar.stop().animate({
                                    opacity: 1
                                }, 100);
                            },
                            mouseleave: function () {
                                $bar.stop().animate({
                                    opacity: 0
                                }, 100);
                            }
                        })
                    }

                    // 显示
                    $container.stop().animate({
                        opacity: 1
                    }, time);
                    $dialog.stop().animate({
                        opacity: 1,
                        top: isMobile ? "50%" : "20px"
                    }, time);

                    // 退出
                    function out () {
                        $container.stop().animate({
                            opacity: 0
                        }, time);
                        $dialog.stop().animate({
                            opacity: 0,
                            top: isMobile ? "43%" : "-20px"
                        }, time, function () {
                            $container.remove();
                            window[$html.data("jsmodernACPVar")] = undefined;
                            $html.removeData("jsmodernACPVar");
                        });
                    }
                    $sure.add($cancel).click(function () {
                        out();
                    })

                    // 按下 ESC 键退出
                    jsModern.keyCode(27, function () {
                        out();
                    })
                }
            }
        },
        dialogAnimateTime: 300,
        closeDialog: function ( $container, $dialog, time, animate ) {
            $container.stop().animate({
                opacity: 0
            }, time, function () {
                $container.remove();
            });
            switch ( animate ) {
                case "slide":
                    $dialog.slideUp(time);
                    break;
                case "fade":
                    $dialog.fadeOut(time);
                    break;
                case "drop":
                    $dialog.animate({
                        top: "43%",
                        opacity: 0
                    }, time);
                    break;
            }    
        }
    };

    // 动画缓动函数 `easeInOutQuart` ( 参考第三方开源库 `jquery.easing`, https://github.com/gdsmith/jquery.easing/ )
    $.easing.easeInOutQuart = function ( x, t, b, c, d ) {
        return ((t/=d/2) < 1) ? (c/2*t*t*t*t + b) : (-c/2 * ((t-=2)*t*t*t - 2) + b);
    }

    // 移动端触控事件扩展
    function triggerEvent ( obj, eventType, event ) {
        var originalType = event.type;
        event.type = eventType;
        $.event.dispatch.call(obj, event);
        event.type = originalType;
    }
    $.event.special.tap = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startX = 0,
                startY = 0,
                endX = 0,
                endY = 0;
            var isMove = false;
            var timer = 0;
            $this
            .on("touchstart", function ( e ) {
                var et = e.originalEvent.targetTouches[0];
                startX = et.pageX;
                startY = et.pageY;
                timer = Date.now();
            })
            .on("touchmove", function ( e ) {
                isMove = true;
                return;
            })
            .on("touchend", function ( e ) {
                var et = e.originalEvent.changedTouches[0];
                endX = et.pageX;
                endY = et.pageY;
                if ( !isMove && $.now() - timer < 300 ) {
                    triggerEvent(_this, "tap", e);
                    timer = 0;
                }
            })
        }   
    };
    $.event.special.tapHold = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startX = 0,
                startY = 0,
                endX = 0,
                endY = 0;
            var isMove = false;
            var holdTouch;
            $this
            .on("touchstart", function ( e ) {
                var et = e.originalEvent.targetTouches[0];
                startX = et.pageX;
                startY = et.pageY;
                e.originalEvent.preventDefault();
                holdTouch = setTimeout(function () {
                    endX = et.pageX;
                    endY = et.pageY;
                    if ( endX === startX && endY === startY && !isMove ) {
                        triggerEvent(_this, "tapHold", e);       
                    }
                }, 750);
            })
            .on("touchmove", function ( e ) {
                isMove = true;
                return;
            })
            .on("touchend", function ( e ) {
                clearTimeout(holdTouch);
                e.originalEvent.preventDefault();
            })
        }   
    };
    $.event.special.swipe = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startX = 0,
                startY = 0;
            $this
            .on("touchstart", function ( e ) {
                var et = e.originalEvent.targetTouches[0];
                startX = et.pageX;
                startY = et.pageY;
            })
            .on("touchmove", function ( e ) {
                var et = e.originalEvent.changedTouches[0];
                var endX = et.pageX;
                var endY = et.pageY;
                if ( endX - startX !== 0 || endY - startY !== 0 ) {
                    e.originalEvent.preventDefault();
                    triggerEvent(_this, "swipe", e);
                }
            })
        }   
    };
    $.event.special.swipeLeft = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startX = 0;
            $this
            .on("touchstart", function ( e ) {
                startX = e.originalEvent.targetTouches[0].pageX;
            })
            .on("touchmove", function ( e ) {
                e.originalEvent.preventDefault();
            })
            .on("touchend", function ( e ) {
                if ( e.originalEvent.changedTouches[0].pageX - startX < -30 ) {
                    triggerEvent(_this, "swipeLeft", e);
                }
            })
        }   
    };
    $.event.special.swipeRight = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startX = 0;
            $this
            .on("touchstart", function ( e ) {
                startX = e.originalEvent.targetTouches[0].pageX;
            })
            .on("touchmove", function ( e ) {
                e.originalEvent.preventDefault();
            })
            .on("touchend", function ( e ) {
                if ( e.originalEvent.changedTouches[0].pageX - startX > 30 ) {
                    triggerEvent(_this, "swipeRight", e);
                }
            })
        }   
    };
    $.event.special.swipeUp = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startY = 0;
            $this
            .on("touchstart", function ( e ) {
                startY = e.originalEvent.targetTouches[0].pageY;
            })
            .on("touchmove", function ( e ) {
                e.originalEvent.preventDefault();
            })
            .on("touchend", function ( e ) {
                if ( e.originalEvent.changedTouches[0].pageY - startY < -30 ) {
                    triggerEvent(_this, "swipeUp", e);
                }
            })
        }   
    };
    $.event.special.swipeDown = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            var startY = 0;
            $this
            .on("touchstart", function ( e ) {
                startY = e.originalEvent.targetTouches[0].pageY;
            })
            .on("touchmove", function ( e ) {
                e.originalEvent.preventDefault();
            })
            .on("touchend", function ( e ) {
                if ( e.originalEvent.changedTouches[0].pageY - startY > 30 ) {
                    triggerEvent(_this, "swipeDown", e);
                }
            })
        }   
    };
    $.event.special.wheelUp = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            $this.on("mousewheel DOMMouseScroll", function ( e ) {
                var e = e || window.e;
                var dis = e.originalEvent.wheelDelta || e.originalEvent.detail;
                if ( dis !== -300 && dis !== -120 && dis !== 3 ) {
                    triggerEvent(_this, "wheelUp", e);
                }
            })
        }   
    };
    $.event.special.wheelDown = {
        setup: function () {
            var _this = this,
                $this = $(_this);
            $this.on("mousewheel DOMMouseScroll", function ( e ) {
                var e = e || window.e;
                var dis = e.originalEvent.wheelDelta || e.originalEvent.detail;
                if ( dis === -300 || dis === -120 || dis === 3 ) {
                    triggerEvent(_this, "wheelDown", e);
                }
            })
        }   
    };
    $.each(["tap", "tapHold", "swipe", "swipeLeft", "swipeRight", "swipeRight", "swipeUp", "swipeDown", "wheelUp", "wheelDown"], function ( i, v ) {
        $.fn[v] = function ( callback ) {
            return this.on(v, callback);
        }
    })
    $.fn.extend({
        orientation: function ( options ) {
            if ( this[0] === window && $.isPlainObject(options) ) {
                $window.on("orientationchange", function () {
                    var angle = window.orientation;
                    (angle == 0 || angle == 180) && (options.v() || $.noop);
                    (angle == 90 || angle == -90) && (options.h() || $.noop);
                });
            }
            return this;
        }
    });

    // 创建 jsModern
    var jsModern = {
        ua: function () {
        	return In.ua;
        },
        screen: function () {
            return [In.screenWidth, In.screenHeight];
        },
        random: function ( a, b ) {
            var number = "0123456789",
                en = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
                numEN = number + en,
                result = "";
            var A_num = In.num(a),
                B_num = In.num(b),
                B_bool = In.bool(b);
            function create ( min, max ) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }
        
            // 传入两个参数且参数均为数字
            // 则生成两个数字之间的任意数字
            // 生成结果范围包括两个边界值
            if ( A_num && B_num ) {
                result = create(a, b);
                result = Number(result);
            }
        
            // 传入两个参数
            // 第一个参数是数字
            // 第二个参数时布尔值且为 true
            // 则生成指定长度的可能含有数字或大小写英文字母组成的随机字符串
            if ( A_num && B_bool && b ) {
                while ( result.length < a ) {
                    result += numEN[create(0, 61)];
                }
            }
        
            // 传入两个参数
            // 第一个参数是数字
            // 第二个参数时布尔值且为 false
            // 则生成指定长度的由大小写英文字母组成的随机字符串
            if ( A_num && B_bool && !b ) {
                while ( result.length < a ) {
                    result += en[create(0, 51)];
                }
            }
            
            // 只传入一个数字且是大于 0 的整数作为参数
            // 则生成指定长度的纯数字随机数
            if ( b === undefined && A_num && Math.floor(a) === a && a > 0 ) {
                while ( result.length < a ) {
                    result += number[create(0, 9)];
                }
                result = Number(result); 
                var resultSize = result.toString().length;
                if ( resultSize < a ) {
                    var n = "";
                    for ( var i = 0; i < a - resultSize; i++ ) {
                        n += create(0, 9);
                    }
                    result = result + n;
                }
                result = Number(result); 
            }
        
            // 无参数则返回 0-1 之间的随机数
            if ( arguments.length === 0 ) {
                result = Math.random();
            }
            return result;
        },
        uuid: function () {
            var en = "abcdef",
                str = "", 
                uuid = [];
            for ( var i = 0; i < 14; i++ ) {
        
                // 生成一个由 a-f 组成的 14 位长度的随机字符串
                str += en[jsModern.random(0, 5)];
            }
            
            // 生成一个保留 16 个小数位的随机数
            // 将整数和小数点替换成随机字符串
            // 最终得到一个 32 位长度的字符串
            var result = (Math.random().toFixed(16).replace("0.", jsModern.random(10, 99)) + str).split("");
            
            // 将上面得到的 32 位字符串打乱顺序重新组合
            // uuid 的总长度是 36 [ 含有 4 个横线 ]
            for ( var i = 0; i < 36; i++ ) {
                var r = jsModern.random(0, 31);
                uuid[i] = result[r];
                result.slice(r, 1); 
            }
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
            return uuid.join("");
        },
        time: function ( time, delimiter ) {
            
            // 无参数时直接返回 $.now()
            if ( !arguments.length ) {
                return $.now();
            }
            
            // 年月日分隔符默认采用 "-"
            delimiter = delimiter || "-";

            if ( !In.num(time) || time <= 0 ) {
                return;
            }
            
            // 将传入的 "毫秒数" 时间进行转换
            time = new Date(time);
            var set = {
                yy: time.getFullYear(),
                mm: time.getMonth() + 1,
                dd: time.getDate(),
                h: time.getHours(),
                m: time.getMinutes(),
                s: time.getSeconds()
            };
            
            // 月份和日期如果不足两位数
            // 则自动在数字前面补零
            for ( var t in set ) {
                var v = set[t];
                set[t] = v < 10 ? "0" + v : v;
            }
            return set.yy + delimiter + set.mm + delimiter + set.dd + " " + set.h + ":" + set.m + ":" + set.s;
        },
        isMobile: function () {
    		return In.isMobile();
        },
        isIOS: function ( bool ) {
            var isIOS = !!(jsModern.isMobile() && In.ua.match(/(ios|iphone|ipod|ipad)/));
            if ( arguments.length == 0 ) {
                return isIOS;
            }
            if ( In.bool(bool) && bool ) {
                return isIOS ? In.ua.match(/os(.*)like mac os x/)[1].replace(/(_)/g, ".").trim() : false;
            }
        },
        isAndroid: function ( bool ) {
            var isAndroid = !!(jsModern.isMobile() && !jsModern.isIOS() && !In.ua.match(/(windows|blackberry|symbianos|bb|meego|playbook|fennec|iemobile)/));
            if ( arguments.length == 0 ) {
                return isAndroid;
            }
            if ( In.bool(bool) && bool ) {
				
				// 仅支持获取部分机型的安卓系统版本号
                var str01 = In.ua.indexOf("android"),
                    str02 = In.ua.substring(str01 + 7),
                    str03 = str02.indexOf(";");
                return isAndroid ? str02.substring(0, str03).trim() : false;
            }
        },
        unique: function ( array ) {
            if ( Array.isArray(array) ) {
                return Array.from ? Array.from(new Set(array)) : (function () {
                    var set = {},
                        result = [];
                    for ( var i = 0, j = array.length; i < j; i++ ) {
                        var each = array[i];
                        var type = $.type(each);
                        if ( !set[each + type] ) {
                            result.push(each);
                            set[each + type] = true;
                        }
                    }
                    return result;
                })();
            }
        },
        cookie: function ( name, value, expires ) {
        	var length = arguments.length;

        	// 获取 cookie
        	if ( length == 1 && In.str(name) ) {
        		var allCookies = document.cookie.replace(/[=]/g, "; ").split("; ");
                var result = "";
                $.each(allCookies, function ( i, v ) { 
                    if ( v === name ) {
                        result = allCookies[i + 1];
                    }
                })
                return result !== "" ? result : null;
        	}

        	// 设置 cookie
        	if ( length >= 2 ) {
        		document.cookie = name + "=" + value + (length == 3 ? ";expires=" + expires : "");
        		return this;
        	}
        	if ( length == 1 && $.isPlainObject(name) ) {
        		$.each(name, function ( i, v ) {
        			document.cookie = i + "=" + v;
        		})
        		return this;
        	}	
        },
        removeCookie: function ( name ) {
        	var pass = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
            if ( name ) {
                name.replace(/\s+/g, " ").trim().split(" ").forEach(function ( v ) {
                    document.cookie = v + pass;
                })
            } else {
                var allCookies = document.cookie.replace(/[=]/g, "; ").split("; ");
                if ( allCookies ) { 
                    allCookies.forEach(function ( v ) {
                        document.cookie = v + pass;
                    })
                }
            }
            return this;
        },
        session: function ( name, value ) {
            
            // 设置 sessionStorage
            if ( name && value ) {
                sessionStorage.setItem(name, value);
                return this;
            }
            if ( $.isPlainObject(name) && !value ) {
                $.each(name, function ( i, v ) {
                    sessionStorage.setItem(i, v);
                })
                return this;
            }
            
            // 获取 sessionStorage
            if ( In.str(name) && !value ) {
                return sessionStorage.getItem(name);
            }
        },
        removeSession: function ( name ) {
        	if ( !name ) {
        		sessionStorage.clear();
        	} else {
        		name.replace(/\s+/g, " ").trim().split(" ").forEach(function ( v ) {
        			sessionStorage.removeItem(v);
        		})
        	}
        	return this;
        },
        local: function ( name, value ) {
            
            // 设置 localStorage
            if ( name && value ) {
                localStorage.setItem(name, value);
                return this;
            }
            if ( $.isPlainObject(name) && !value ) {
                $.each(name, function ( i, v ) {
                    localStorage.setItem(i, v);
                })
                return this;
            }
            
            // 获取 localStorage
            if ( In.str(name) && !value ) {
                return localStorage.getItem(name);
            }
        },
        removeLocal: function ( name ) {
        	if ( !name ) {
        		localStorage.clear();
        	} else {
        		name.replace(/\s+/g, " ").trim().split(" ").forEach(function ( v ) {
        			localStorage.removeItem(v);
        		})
        	}
        	return this;
        },
        toBase64: function ( src, callback ) {
            var results= [];

            // 图片以数组形式处理
            if ( !Array.isArray(src) ) {
                src = [src];
            }
            var size = src.length;
            (function loadImg ( i ) {
                var img = new Image();
                img.crossOrigin = "anonymous";
                img.src = i;
                var def = $.Deferred();
                var deferredFn = function ( def ) {
	                img.onload = function () {
	                    var dataURL = "";

	                    // 获取图片真实宽高和格式
	                    var width = this.width,
	                        height = this.height,
	                        type = i.substring(i.lastIndexOf(".") + 1).toLowerCase().replace(/\?(.*)/, ""); 

	                    // 创建 canvas
	                    var canvas = document.createElement("canvas");
	                    canvas.width = width;
	                    canvas.height = height;

	                    // 写入图片获取数据
	                    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
	                    dataURL = canvas.toDataURL("image/" + (type === "png" ? "png" : "jpeg"), 1.0);
	                    results.push(dataURL);
	                    src.splice(0, 1);
	                    src.length ? loadImg(src[0]) : def.resolve();
	                }
	                return def;
                }
                $.when(deferredFn(def)).done(function () {
                	if ( callback && $.isFunction(callback) ) {
	                    callback(In.str(src) ? results[0] : results);
	                }
                }).fail(function () {
                	console.error(decodeURI("%E8%BD%AC%E7%A0%81%E5%A4%B1%E8%B4%A5"));
                })
            })( src[0] );
            return this;
        },
        filterChar: function ( str, char ) {
            if ( In.str(str) && Array.isArray(char) ) {
                var specialChar = ["~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "|", "\\", "[", "]", "{", "}", ";", ":", "\"", "'", "<", ">", ",", ".", "/", "?"]; 
                char.forEach(function ( v ) { 
                    str = str.replace(specialChar.indexOf(v) > -1 ? (new RegExp("\\" + v, "g")) : (new RegExp(v, "g")), "");
                })
                return str;
            }
        },
        preloadImg: function ( images ) {
        	var arg = arguments;
        	var size = arg.length;
        	if ( size ) {
        		var imgArray = [];
        		if ( !Array.isArray(images) ) {
        			for ( var i = 0; i < size; i++ ) {
        				In.str(arg[i]) && imgArray.push(arg[i]);
        			}
        		} else {
        			imgArray = images;
        		}
				$window.on("load", function () {
					Array.isArray(imgArray) && imgArray.forEach(function ( src ) {
						if ( src.substr(src.lastIndexOf(".") + 1, 4).replace(/\?(.*)/, "").toLowerCase().match(/(jpg|jpeg|png|ico|bmp|gif)/) ) {
							var img = new Image();
							img.src = src;
						}
					})
	            })
            }
            return this;
        },
        keyCode: function ( keycode, callback ) {
            if ( !Array.isArray(keycode) ) {
                keycode = [keycode];
            }
            $document.keyup(function ( event ) {
                var code = event.keyCode;
                if ( keycode.indexOf(code) > -1 ) {
                    callback();
                }
            })
            return this;
        },
        fullScreenIn: function ( target ) {
            target = target || document.documentElement;  
            if ( target.webkitRequestFullScreen ) { 
                target.webkitRequestFullScreen(); 
            } else if ( target.mozRequestFullScreen ) { 
                target.mozRequestFullScreen(); 
            } else if ( target.msRequestFullscreen ) { 
                target.msRequestFullscreen(); 
            } else if ( target.requestFullScreen ) { 
                target.requestFullScreen(); 
            } 
            return this;
        },
        fullScreenOut: function ( target ) {
            target = target || document;  
            if ( target.webkitExitFullscreen ) {
                target.webkitExitFullscreen();
            } else if ( target.mozCancelFullScreen ) {
                target.mozCancelFullScreen();
            } else if ( target.msExitFullscreen ) {
                target.msExitFullscreen();
            } else if ( target.exitFullscreen ){
                target.exitFullscreen();
            }
            return this;
        },
        fullScreenToggle: function () {
            jsModern[(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen) ? "fullScreenOut" : "fullScreenIn"]();
            return this;
        },
        noConflict: function () {
        	window.jsModern = In.jsmodern;
            return jsModern;
        },
        top: function ( selector, options ) {
            var _theme,
                _distance,
                _time;

            // 第二个参数是 object 类型
            if ( $.isPlainObject(options) ) {
                _time = options.time;
                _distance = options.distance;
                _theme = options.theme;
            }

            // 第二个参数是正整数
            if ( In.num(options) && options > 0 ) {
                _time = options;
            }

            // 只作用于第一个匹配元素
            var $top = $(selector).first();

            // 内置主题
            if ( In.str(_theme) && _theme.length == 1 && _theme.match(/(a|b)/i) ) {
                var cls = "jmn-top-";
                switch ( _theme.toLowerCase() ) {
                    case "a": cls = cls + "a"; break;
                    case "b": cls = cls + "b"; break;
                }
                $top.empty().addClass("jmn-top " + (cls.charAt(cls.length - 1) === "-" ? "" : cls));
            }

            // 若元素默认处于隐藏状态
            // 则监听 window 对象的 scroll 事件
            if ( $top.is(":hidden") ) {
                $window.on("scroll", function () {
                    var top = $(this).scrollTop();
                    if ( top > (_distance || 300) ) {
                        $top.stop().fadeIn(100);
                    }
                    if ( top === 0 ) {
                        $top.stop().fadeOut(100);
                    }
                })
            }

            // 返回顶部动画
            $top.on("click", function () {
                $("html, body").stop().animate({
                    scrollTop: 0
                }, _time || 300);                
            })

            // PC 端按钮悬浮
            if ( $top.hasClass("jmn-top") ) {
                var opacity = $top.css("opacity");
                $top.on({
                    mouseenter: function () {
                        $(this).stop().animate({
                            opacity: .85
                        }, 70);
                    },
                    mouseleave: function () {
                        $(this).stop().animate({
                            opacity: opacity
                        }, 70);
                    }
                });
            }
            return this;
        },
        textBind: function ( selector, target ) {
            function setVal ( v ) {
                $(target).each(function () {
                    var $this = $(this);
                    $this[0].nodeName.toLowerCase() === "input" ? $this.val(v) : $this.text(v);
                })
            }
            $(selector).each(function () {
                var $this = $(this);
                $this.on("input", function () {
                    setVal($this.val());
                })

                // 使用 "Backspace, Delete, 剪切" 等方式操作文本内容时
                // 在 IE9 中无法通过上面的方法实时同步文本框内容
                // 此处通过定时刷新的方式来检测内容的变化
                if ( In.ua.match("msie 9.0") ) { 
                    setInterval(function () {
                        setVal($this.val()); 
                    }, 13);
                }
            })
            return this;
        },
        share: function ( options ) {
            var webURL = encodeURIComponent(location.href),
                title = document.title;
            var $qrcodeCache = null;

            // 生成二维码函数
            function getQrcode ( type ) {
                if ( options.qrcode && $(".jmn-share").length == 0 ) {
                    $("body").prepend('<section class="jmn-share jmn-select-none" style="display:none;"><b></b><p>' + decodeURI("%E6%89%AB%E4%B8%80%E6%89%AB%E5%88%86%E4%BA%AB") + '</p><a href="' + location.href + '"><section></section></a></section>');
                    var $qrcode = $(".jmn-share").find("section");
                    var script = document.createElement("script");
                    script.src = "http://apps.bdimg.com/libs/jquery-qrcode/1.0.0/jquery.qrcode.min.js" + (In.ua.match("msie") ? "?" + (+new Date()) : "");
                    script.type = "text/javascript";
                    script.id = "jsmodern-share-qrcode";
                    $head[0].appendChild(script);
                    script.onload = function () {
                        $qrcode.qrcode({
                            render: "canvas",
                            text: decodeURIComponent(webURL),
                            width: $qrcode.width(),
                            height: $qrcode.height(),
                            background: "#FFF",
                            foreground: "#000"
                        });
                        $(".jmn-share").show();
                        $qrcodeCache = $(".jmn-share");
                        $("#jsmodern-share-qrcode").remove();
                        (type === "load") && $(".jmn-share").remove();
                    }
                }
            }
            $window.on("load", function () {
                getQrcode("load");
            })

            // 是否使用默认主题
            if ( In.bool(options.defaultTheme) && options.defaultTheme ) {
                $.each(options, function ( i, v ) { 
                    $(v).addClass("jmn-share-" + i).empty();
                })
            }

            $document.on("click", function ( event ) {
                var event = event || window.event;
                var $target = $(event.target);
                var firefox = In.ua.match("firefox");

                // 二维码分享
                if ( $target.is(options.qrcode) ) { 
                    if ( !$qrcodeCache ) {
                        getQrcode();
                    } else {
                        $("body").prepend($qrcodeCache);
                    }

                    // 关闭二维码弹框
                    $(".jmn-share").find("b").click(function () {
                        $(this).parent().remove();
                    })
                }

                // 分享到QQ空间
                if ( $target.is(options.qzone) ) {
                    window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + webURL + '&title=' + title);
                }

                // 分享到新浪微博
                if ( $target.is(options.sina) ) {
                    (function(s,d,e){try{}catch(e){}var f='http://v.t.sina.com.cn/share/share.php?',u=d.location.href,p=['url=',e(u),'&title=',e(title),'&appkey=2924220432','&pic=',e(webURL)].join('');function a(){if(!window.open([f,p].join(''),'mb'))u.href=[f,p].join('');};if(firefox){setTimeout(a,0)}else{a()}})(screen,document,encodeURIComponent);
                }

                // 分享豆瓣网
                if ( $target.is(options.douban) ) {
                    (function(){var d=document,e=encodeURIComponent,s1=window.getSelection,s2=d.getSelection,s3=d.selection,s=s1?s1():s2?s2():s3?s3.createRange().text:'',r='https://www.douban.com/recommend/?url='+e(webURL)+'&title='+e(title)+'&sel='+e(s)+'&v=1',w=450,h=330,x=function(){if(!window.open(r,'douban'))location.href=r+'&r=1'};if(firefox){setTimeout(x,0)}else{x()}})();
                }

                // 分享给QQ好友
                if ( $target.is(options.qq) ) {
                    window.open('http://connect.qq.com/widget/shareqq/index.html?url=' + webURL + '&title=' + title + '&desc=' + title);
                }
            })
            return this;
        },
        scrollBar: function ( selector, options ) { 
            jsModern.isMobile() ? $(selector).addClass("jmn-scrollbar-mobile") : (function () {
                var axis = options ? options.axis || "y" : "y";
                var theme = options && options.theme;
                $(selector).each(function () {
                    var $this = $(this),
                        $firstChild = $this.children().first(); 
                    if ( $this.css("position") === "static" ) {
                        $this.addClass("jmn-scrollbar-relative");
                    }
                    $firstChild.addClass("jmn-scrollbar-inner");
                    $this.addClass("jmn-scrollbar-container").append('<section class="jmn-scrollbar jmn-scrollbar-default"></section>');
                    var $bar = $this.find(".jmn-scrollbar");
                    $bar.data({
                        jmnScrollbarX: 0,
                        jmnScrollbarCacheX: 0,
                        jmnScrollbarY: 0,
                        jmnScrollbarCacheY: 0
                    });

                    // 自定义滚动条样式
                    if ( theme ) {
                        $bar.addClass(theme).removeClass("jmn-scrollbar-default");
                    }

                    if ( axis === "y" ) {
                        var selfHeight = $this.innerHeight(),
                            childHeight = $firstChild.outerHeight(true),
                            totalHeight = (childHeight + (parseInt($this.css("paddingTop")) + parseInt($this.css("paddingBottom"))));
                        var barHeight = ~~(selfHeight * selfHeight / childHeight);
                        $bar.height(barHeight).addClass("jmn-scrollbar-y");
                        var maxTop = selfHeight - barHeight;

                        // 实时监测滚动容器高度的变化
                        // 进而对相关数据进行实时同步更新
                        setInterval(function () {
                            selfHeight = $this.innerHeight();
                            childHeight = $firstChild.outerHeight(true);
                            totalHeight = (childHeight + (parseInt($this.css("paddingTop")) + parseInt($this.css("paddingBottom"))));
                            barHeight = ~~(selfHeight * selfHeight / childHeight);
                            $bar.height(barHeight);
                            maxTop = selfHeight - barHeight;
                        }, 13);

                        // 滚动条拖动事件
                        $bar.on("mousedown", function ( event ) {
                            var _this = $(this);
                            var event = event || window.event;
                            var y = event.pageY - _this.position().top - $bar.data("jmnScrollbarY"); 
                            $this.addClass("jmn-select-none");
                            _this.addClass("active");
                            $firstChild.add(_this).css("transition", "0s");
                            $document.on("mousemove", function ( event ) {
                                var event = event || window.event;
                                var top = event.pageY - y;  
                                event.preventDefault();
                                (top < 0) && (top = 0);
                                (top > maxTop) && (top = maxTop);
                                _this.css("transform", "translate(0, " + top + "px)").data("jmnScrollbarCacheY", top);
                                var topDis = (totalHeight / selfHeight) * top;
                                $firstChild.css("transform", "translate(0, -" + topDis + "px)");
                            })
                        })
                        $document.mouseup(function() {
                            $(this).off("mousemove");
                            $this.removeClass("jmn-select-none");
                            $bar.removeClass("active");
                        })

                        // 鼠标滑轮事件
                        $this.on("mousewheel DOMMouseScroll", function ( event ) {
                            var event = event || window.event;
                            var dis = event.originalEvent.wheelDelta || event.originalEvent.detail;
                            var direction = (dis === -300 || dis === -120 || dis === 3) ? "down" : "up";
                            var step = 60;
                            var curBar = $bar.data("jmnScrollbarCacheY");

                            event.preventDefault();

                            // 滚动条位置
                            var getY = $bar.data("jmnScrollbarCacheY");
                            if ( direction === "down" ) {
                                var a = getY + step;
                                (a > maxTop) && (a = maxTop);
                            } else {
                                var a = getY - step;
                                (a < 0) && (a = 0);
                            }
                            $bar.css({
                                transform: "translate(0, " + a + "px)",
                                transition: ".2s"
                            }).data("jmnScrollbarCacheY", a);
                            $firstChild.css({
                                transform: "translate(0, -" + (totalHeight / selfHeight) * a + "px)",
                                transition: ".2s"
                            });
                        })
                    }
                    if ( axis === "x" ) {
                        var selfWidth = $this.innerWidth(),
                            childWidth = $firstChild.outerWidth(true),
                            totalWidth = (childWidth + (parseInt($this.css("paddingLeft")) + parseInt($this.css("paddingRight"))));
                        var barWidth = ~~(selfWidth * selfWidth / childWidth);
                        $bar.width(barWidth).addClass("jmn-scrollbar-x");
                        var maxLeft = selfWidth - barWidth;

                        // 实时监测滚动容器宽度的变化
                        // 进而对相关数据进行实时同步更新
                        setInterval(function () {
                            selfWidth = $this.innerWidth();
                            childWidth = $firstChild.outerWidth(true);
                            totalWidth = (childWidth + (parseInt($this.css("paddingLeft")) + parseInt($this.css("paddingRight"))));
                            barWidth = ~~(selfWidth * selfWidth / childWidth);
                            $bar.width(barWidth);
                            maxLeft = selfWidth - barWidth;
                        }, 13);

                        // 滚动条拖动事件
                        $bar.on("mousedown", function ( event ) {
                            var _this = $(this);
                            var event = event || window.event;
                            var x = event.pageX - _this.position().left - $bar.data("jmnScrollbarX"); 
                            $this.addClass("jmn-select-none");
                            _this.addClass("active");
                            $firstChild.add(_this).css("transition", "0s");
                            $document.on("mousemove", function ( event ) {
                                var event = event || window.event;
                                var left = event.pageX - x;  
                                event.preventDefault();
                                (left < 0) && (left = 0);
                                (left > maxLeft) && (left = maxLeft);
                                _this.css("transform", "translate(" + left + "px, 0)").data("jmnScrollbarCacheY", left);
                                var leftDis = (totalWidth / selfWidth) * left;
                                $firstChild.css("transform", "translate(-" + leftDis + "px, 0)");
                            })
                        })
                        $document.mouseup(function() {
                            $(this).off("mousemove");
                            $this.removeClass("jmn-select-none");
                            $bar.removeClass("active");
                        })
                    }
                })
            })();
            return this;
        },
        marquee: function ( selector, option ) {
            var time = 1000/60;
            var axis = "x";
            if ( option ) {
                axis = option.axis || "x";
            }
            $(selector).each(function () {
                var $this = $(this),
                    $children = $this.children(),
                    totalWidth = 0,
                    totalHeight = 0;
                var y = !!(axis === "y");

                // 获取内部所有子元素的完整宽度之和
                !y && $children.each(function () {
                    totalWidth += $(this).outerWidth(true);
                })

                // 获取内部所有子元素的完整高度之和
                y && $children.each(function () {
                    totalHeight += $(this).outerHeight(true);
                })

                // 只有当 totalWidth 大于 selector 的宽度
                // 或者 totalHeight 大于 selector 的高度时
                // 才能满足开启无缝滚动效果的条件
                if ( !y && totalWidth < $this.width() ) {
                    return;   
                }
                if ( y && totalHeight < $this.height() ) {
                    return;   
                }

                $this.css("overflow", "hidden");
                if ( jsModern.isMobile() ) {
                    $this.addClass("jmn-select-none");
                }

                // 将内部区块进行整体包裹
                $children.wrapAll('<section class="jmn-marquee-inner"><section class="jmn-marquee-default"></section></section>');

                !y && $children.parent().width(totalWidth);
                y && $children.parent().height(totalHeight);

                var $inner = $this.find(".jmn-marquee-inner"),
                    $default = $this.find(".jmn-marquee-default");

                // 将原始所有区块克隆后添加到尾部
                $default.after($default.clone(true)).next().attr("class", "jmn-marquee-repeat");

                y && $default.add($default.next()).css("float", "none");

                // 包裹容器的宽度增加了一倍
                !y && $inner.width(totalWidth * 2);
                y && $inner.height(totalHeight * 2);

                // 滚动函数
                var autoScrollFn = function () {
                    !y && $this.scrollLeft(($this.scrollLeft() > $default.width()) ? 0 : $this.scrollLeft() + 1);
                    y && $this.scrollTop(($this.scrollTop() > $default.height()) ? 0 : $this.scrollTop() + 1);
                } 
                var autoScroll = setInterval(autoScrollFn, time);

                // 暂停和继续
                $this.on("mouseenter touchstart", function () {
                    clearInterval(autoScroll);  
                }).on("mouseleave touchend", function () {
                    autoScroll = setInterval(autoScrollFn, time);
                })
            })
            return this;
        },
        lazyload: function ( selector ) {
            var height = In.winHeight;

            // 显示图片函数
            function showImg ( img, realsrc ) {
                img.attr("src", realsrc).on("load", function () {
                    img.stop().delay(100).animate({
                        opacity: img.data("jsmodernLazyloadOpacity")
                    }, 500, function () {
                        $(this).removeAttr("jm-lazy").data("jsmodernLazyload", true);
                    })
                })
            }

            $(selector).each(function () {
                $(this).find("img").each(function () {
                    var $this = $(this);
                    var src = $this.attr("jm-lazy");

                    // 将所有图片的 opacity 缓存并设置为 0
                    $this.data("jsmodernLazyloadOpacity", $this.css("opacity")).css("opacity", 0);

                    // 计算尺寸
                    function check () {
                        var bound = $this[0].getBoundingClientRect();
                        if ( height > bound.top ) {
                            showImg($this, src);
                        }
                    }
                    check();
                    $window.on("scroll", function () {
                        !$this.data("jsmodernLazyload") && check();
                    })
                    
                })
            })
            return this;
        },
        picture: function ( selector, data, options ) {
            var imgData = Array.isArray(data) ? data : [];
            var imgOption = options ? options : ($.isPlainObject(data) ? data : {});

            // 含有图片数据信息则创建组件结构
            var frame = ""; 
            if ( imgData.length > 0 ) {
                imgData.forEach(function ( v ) {
                    if ( !In.str(v) ) {
                        frame += '<div class="jmn-picture-part jmn-noselect"><a href="' + (v.href || "javascript:;") + '"><img src="' + v.src + '">' + (v.title ? '<p><span>' + v.title + '</span></p>' : '') + '</a></div>';
                    } else {
                        frame += '<div class="jmn-picture-part jmn-noselect"><img src="' + v + '"></div>';
                    }
                })
                frame = '<div class="jmn-picture-inner">' + frame + '</div>';
            }

            var type = "slide",
                arrows = true, 
                dots = true, 
                dotPosition = "center",
                auto = false;
            if ( !$.isEmptyObject(imgOption) ) {
                type = imgOption.type || "slide";
                arrows = imgOption.arrow;
                dots = imgOption.dot;
                dotPosition = imgOption.dotPosition;
                auto = imgOption.autoplay;
            }

            $(selector).each(function () {
                var $this = $(this);
                var width = $this.width(),
                    height = $this.height();
                $this.addClass("jmn-picture-container");
                frame ? $this.html(frame) : $this.children().addClass("jmn-picture-inner").children().addClass("jmn-picture-part");

                var $inner = $this.find(".jmn-picture-inner"),
                    $part = $inner.find(".jmn-picture-part"),
                    $imglink = $inner.find("img, a");
                var imgSize = $part.length;
                $part.add($imglink).width(width).height(height);

                // 去除无用链接
                $part.find("a").each(function () {
                    if ( $(this).attr("href") === "javascript:;" ) {
                        $(this).find("img").unwrap();
                    }
                })

                // 图片区域禁用选择功能
                // 防止快速点击按钮或箭头时出现选中内容的问题
                // 设置初始图片索引为 0
                $this.on("selectstart", function () {
                    return false;
                }).data("jsmodernPictureIndex", 0);

                // 添加下方切换按钮
                var dot = "";
                for ( var i = 0; i < imgSize; i++ ) {
                    dot += "<b></b>";
                }
                dot = "<div class='jmn-picture-dot'>" + dot + "</div>";
                $inner.after(dot);
                var $dot = $this.find(".jmn-picture-dot"),
                    $point = $dot.find("b");
                $point.first().addClass("active");
                $dot.addClass("jmn-picture-dot" + (dotPosition.match(/(left|center|right)/) ? dotPosition : "center"));

                // 添加左右切换箭头
                $this.append("<b class='jmn-picture-prev'></b><b class='jmn-picture-next'></b>");
                var $prev = $this.find(".jmn-picture-prev"),
                    $next = $this.find(".jmn-picture-next");

                // 根据传入的参数判断是否显示按钮和箭头
                if ( In.bool(arrows) && !arrows ) { 
                    $prev.add($next).remove();
                }
                if ( In.bool(dots) && !dots ) {
                    $dot.remove();
                }

                // 根据不同的图片切换效果进行不同的处理
                if ( type === "fade" ) {
                    $inner.addClass("jmn-picture-fade");
                    $part.first().show();
                }
                if ( type === "slide" ) {
                    var $part = $inner.find(".jmn-picture-part");
                    var $partFirst = $part.first(),
                        $partLast = $part.last();
                    $inner.addClass("jmn-picture-slide").width(width * (imgSize + 2)).append($partFirst.clone(true)).prepend($partLast.clone(true)).css("left", -width + "px");
                }

                // 设定统一的图片切换动画过渡时间为 700ms
                var time = 700;

                // 按钮切换和箭头切换
                $point.click(function () {
                    var index = $(this).index();
                    Animation(index);
                    $this.data("jsmodernPictureIndex", index);        
                })
                $prev.click(function () {
                    var index = $this.data("jsmodernPictureIndex");
                    index--;
                    Animation(index);
                })
                $next.click(function () {
                    var index = $this.data("jsmodernPictureIndex");
                    index++
                    Animation(index);
                })

                // 移动端滑动切换
                if ( jsModern.isMobile() ) {
                    $this.swipeLeft(function () {
                        var index = $this.data("jsmodernPictureIndex");
                        index++
                        Animation(index);
                    }).swipeRight(function () {
                        var index = $this.data("jsmodernPictureIndex");
                        index--;
                        Animation(index);
                    })
                }

                // 动画函数
                function Animation ( i ) {
                    if ( type === "fade" ) { 
                        i = (i == -1 ? imgSize - 1 : (i == imgSize ? 0 : i));
                        $part.eq(i).stop().fadeIn(time).siblings().stop().fadeOut(time, function () {
                            dotSwitch(i);
                            $this.data("jsmodernPictureIndex", i);
                        });
                    }
                    if ( type === "slide" ) {
                        if ( !$inner.is(":animated") ) {
                            $inner.stop().animate({
                                left: -(width * i + width) + "px"
                            }, time, "easeInOutQuart", function () {
                                if ( i === -1 ) {
                                    $inner.css("left", "-" + width * imgSize + "px");
                                    i = imgSize - 1;
                                }
                                if ( i === imgSize ) {
                                    $inner.css("left", "-" + width + "px");
                                    i = 0;
                                }
                                dotSwitch(i);
                                $this.data("jsmodernPictureIndex", i);
                            });
                        }
                    }
                }             

                // 按钮状态切换
                function dotSwitch ( i ) {
                    $point.eq(i).addClass("active").siblings().removeClass("active");
                }

                // 自动执行动画
                if ( auto && typeof auto === "number" ) {
                    var autoAnimate = setInterval(function () {
                        var getIndex = $this.data("jsmodernPictureIndex");
                        getIndex++;
                        Animation(getIndex);
                    }, auto);
                    $this.on("mouseenter touchstart", function () {
                        clearInterval(autoAnimate);
                    }).on("mouseleave touchend", function () {
                        autoAnimate = setInterval(function () {
                            var getIndex = $this.data("jsmodernPictureIndex");
                            getIndex++;
                            Animation(getIndex);
                        }, auto);
                    })
                }
            })
            return this;
        },
        video: function ( selector, endEvent ) { 
            var ie = !!In.ua.match(/(msie|trident)/);
            $(selector).each(function () {
                var $this = $(this),
                    $video = $this.find("video"),
                    video = $video[0];
                var width = $this.width(),
                    height = $this.height();

                $this.data({
                    jsmodernVideoPlugin: true,
                    jsmodernVideoEnd: endEvent
                });

                // 组件不支持移动端
                if ( !jsModern.isMobile() ) {

                    var autoplay = video.autoplay;

                    // 强制移除默认控制面板
                    $video.removeAttr("controls autoplay").addClass("jmn-video-opacity");

                    // 加外层容器并设置视频宽高
                    $video.wrap('<section class="jmn-video-container" style="width:' + width + 'px;height:' + height + 'px;"></section>').attr({
                        width: "100%",
                        height: "100%"
                    });
                    var $container = $this.find(".jmn-video-container"),
                        container = $container[0];

                    // 添加控制面板
                    $container.append('<section class="jmn-video-center"></section><section class="jmn-video-panel jmn-select-none"><div class="jmn-video-panelinner" style="opacity:0"><div class="jmn-video-playpause"><i class="jmn-video-play"></i><i class="jmn-video-pause"></i></div><span class="jmn-video-start">00:00</span><span class="jmn-video-time">/</span><span class="jmn-video-end">00:00</span><div class="jmn-video-linebox"><div class="jmn-video-linebg"></div><div class="jmn-video-linepass"></div><div class="jmn-video-dot"></div></div><div class="jmn-video-volume"><i class="jmn-video-voice"></i><i class="jmn-video-muted"></i></div><div class="jmn-video-volumebox"><div class="jmn-video-volumebg"></div><div class="jmn-video-volumepass"></div><div class="jmn-video-volumedot"></div></div><div class="jmn-video-full"><i class="jmn-video-fullin"></i><i class="jmn-video-fullout"></i></div></div></section>');
                    var $panel = $this.find(".jmn-video-panel"),
                        $inner = $panel.find(".jmn-video-panelinner"),
                        $child = $inner.children(),
                        $playPause = $inner.find(".jmn-video-playpause").children(),
                        $start = $inner.find(".jmn-video-start"),
                        $end = $inner.find(".jmn-video-end"),
                        $linebox = $inner.find(".jmn-video-linebox"),
                        $pass = $inner.find(".jmn-video-linepass"),
                        $lineDot = $pass.next(),
                        $volume = $inner.find(".jmn-video-volume"),
                        $volumebox = $inner.find(".jmn-video-volumebox"),
                        $volumePass = $volumebox.find(".jmn-video-volumepass"),
                        $volumeDot = $volumebox.find(".jmn-video-volumedot"),
                        $voice = $volume.children().first(),
                        $full = $inner.find(".jmn-video-full"),
                        $fullBtn = $full.children(),
                        $center = $this.find(".jmn-video-center");
                    var otherWidth = 0;
                    var dotWidth = parseInt($lineDot.width()) / 2;

                    // 当视频外框的宽度不大于 400px 时
                    // 将自动隐藏音量控制条
                    if ( width <= 400 ) {
                        $volume.add($volumebox).remove();
                    }

                    // 禁用右键
                    $this.on("contextmenu", function () {
                        return false;
                    })

                    // 计算进度条总宽度
                    $child.each(function () {
                        otherWidth += $(this).outerWidth(true);
                    })
                    var lineLeft = parseFloat($linebox.css("marginLeft")) - 5;
                    var lineWidth = width - otherWidth - lineLeft;
                    $linebox.width(lineWidth).data("jsmodernVideoLineWidth", lineWidth);

                    // 相关数值计算完毕后
                    // 将控制条显示出来
                    $inner.removeAttr("style");

                    // 全屏切换 (不提供对 IE 的支持)
                    if ( ie ) {
                        $full.addClass("jmn-video-fullno");
                    } else {
                        function fullIn () {
                            $panel.hide().delay(300).fadeIn(200);
                            jsModern.fullScreenIn(container);
                        }
                        function fullOut () {
                            $panel.hide().delay(300).fadeIn(200);
                            jsModern.fullScreenOut();
                        }
                        function isFullNow () {
                            var widthNow = In.screenWidth - otherWidth - lineLeft;
                            $container.add($video).width(In.screenWidth).height(In.screenHeight);
                            $linebox.width(widthNow);
                            $fullBtn.toggle();
                            process(widthNow);
                        }
                        function notFullNow () {
                            $container.add($video).width(width).height(height);
                            $linebox.width($linebox.data("jsmodernVideoLineWidth"));
                            $fullBtn.toggle();
                            process(lineWidth);
                        }
                        function checkFull () {
                            (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen) ? fullOut() : fullIn();
                        }
                        $document.on("fullscreenChange webkitfullscreenchange mozfullscreenchange", function () {
                            if ( video.paused ) {
                                video.play();
                                video.pause();
                            }
                            (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen) ? isFullNow() : notFullNow();
                        })
                        $video.dblclick(function () {
                            checkFull();
                        })
                        $fullBtn.click(function () {
                            checkFull();
                        })
                    }
                    
                    // 时间数字补零函数
                    function addZero ( time ) {
                        var m = parseInt(time / 60),
                            s = parseInt(time % 60);
                        m = m < 10 ? ("0" + m) : m;
                        s = s < 10 ? ("0" + s) : s;
                        return m + ":" + s;
                    }

                    // 计算视频总时长
                    var allTime;
                    $video.on("durationchange", function () {      
                        var duration = video.duration;
                        allTime = duration;
                        $end.text(addZero(duration));
                    });

                    // 视频播放函数
                    function videoPlay () {
                        $playPause.add($center).toggle();
                        $video.toggleClass("jmn-video-opacity");
                        video.paused ? video.play() : video.pause();
                    }

                    // 控制播放和暂停
                    $playPause.add($center).click(function () {
                        videoPlay();
                    })

                    // 若设置了自动播放触发播放事件
                    if ( autoplay ) {
                        videoPlay();
                    }

                    // 视频已播时间
                    function process ( _w ) {
                        $video.on("timeupdate", function () {  
                            if ( !$lineDot.data("jsmodernVideoMove") ) {
                                var surplus;         
                                if ( !isNaN(video.duration) ) {
                                    surplus = video.currentTime;
                                    $start.text(addZero(surplus));
                                }
                                var endTime = ($end.text()).replace(":", "");
                                var distance = surplus / allTime * _w;
                                $pass.width(distance);
                                $lineDot.css("marginLeft", distance - dotWidth + "px");
                            }
                        })
                    }
                    process(lineWidth);

                    // 播放时间控制函数
                    function setTime ( _w ) { 
                        var toTime = parseFloat(_w) / $linebox.width() * allTime; 
                        $start.text(addZero(toTime));
                        video.currentTime = toTime;
                    }

                    // 点击播放条改变视频播放进度
                    $linebox.click(function ( event ) {
                        var event = event || window.event;
                        var left = $(this).offset().left;
                        var width = event.pageX - left;
                        $pass.width(width);
                        $lineDot.css("marginLeft", width - dotWidth + "px");
                        setTime(width);
                    })

                    // 控制条按钮拖动
                    $lineDot.on("mousedown", function ( event ) {
                        var _this = $(this);
                        var event = event || window.event;
                        var parentLeft = $linebox.offset().left;   
                        $document.on("mousemove", function( event ){
                            var event = event || window.event;
                            var left = event.pageX - parentLeft - dotWidth;  
                            event.preventDefault();
                            _this.data("jsmodernVideoMove", true);
                            (left < -dotWidth) && (left = -dotWidth);
                            (left > $linebox.width() - dotWidth) && (left = $linebox.width() - dotWidth);
                            _this.css("marginLeft", left + "px");
                            $pass.width(left);
                            setTime(left);
                        })
                        $document.mouseup(function() {
                            $(this).off("mousemove");
                            _this.removeData("jsmodernVideoMove");
                        })
                    })

                    // 音量图标控制
                    video && (video.volume = 0.5);
                    $volume.click(function () {
                        $(this).children().toggle();
                        video.muted = !video.muted;
                        if ( !video.muted ) { 
                            $volumeDot.css("marginLeft", $volume.data("jsmodernVideoVolumeDot"));
                            $volumePass.width($volume.data("jsmodernVideoVolumePass"));
                        } else {
                            $volume.data({
                                jsmodernVideoVolumeDot: $volumeDot.css("marginLeft"),
                                jsmodernVideoVolumePass: $volumePass.width()
                            });
                            $volumeDot.css("marginLeft", "-5px");
                            $volumePass.width(0);
                        }   
                    })

                    // 音量控制条点击事件
                    var volumeWidth = $volumebox.width();
                    $volumebox.click(function ( event ) {
                        var event = event || window.event;
                        var left = $(this).offset().left;
                        if ( event.pageX - left > 0 && event.pageX - left <= volumeWidth ) {
                            video.muted = false;
                            $voice.show().next().hide();
                            var w = event.pageX - left;
                            $volumePass.width(w);
                            $volumeDot.css("marginLeft", (w - dotWidth) + "px");
                            video.volume = w/volumeWidth; 
                        }
                    })

                    // 音量按钮拖动事件
                    $volumeDot.on("mousedown", function ( event ) {
                        var _this = $(this);
                        var event = event || window.event;
                        var parentLeft = _this.parent().offset().left;     
                        $document.on("mousemove", function ( event ) {
                            var event = event || window.event;
                            var left = event.pageX - parentLeft - dotWidth;  
                            event.preventDefault();
                            if ( left <= -dotWidth ) {
                                left = -dotWidth;
                                video.muted = true;
                                $voice.hide().next().show();
                            }
                            if ( left > volumeWidth - dotWidth ) {
                                left = volumeWidth - dotWidth;
                                video.muted = false;
                                $voice.show().next().hide();
                            }
                            if ( left > 0 && left <= volumeWidth - dotWidth ) {
                                video.muted = false;
                                $voice.show().next().hide();
                            }
                            _this.css("marginLeft", left + "px");
                            $volumePass.width(left);
                            var realVolume = left / volumeWidth;
                            video.volume = realVolume < 0 ? 0 : realVolume;
                        })
                    })
                    $document.mouseup(function() {
                        $(this).off("mousemove");
                    })

                    // 控制条的显示与隐藏
                    var x = 0;
                    var mouseTimer;
                    $video.on({
                        play: function () {
                            $panel.hide();
                            $this.mouseleave(function () {
                                $this.data("jsmodernVideoOut", true);
                                !video.paused && $panel.hide();
                            }).mouseenter(function () {
                                $this.removeData("jsmodernVideoOut");
                                $panel.show();
                            })

                            // 检测鼠标的移动状态
                            $this.on("mousemove", function () {
                                x = 1;
                                $panel.show();
                            })
                            mouseTimer = setInterval(function () {
                                if ( !$this.data("jsmodernVideoOut") ) {
                                    if ( x ) {
                                        $panel.show();
                                    } else {
                                        $panel.hide();
                                    }
                                }
                                x = 0;
                            }, 2000);
                        },
                        pause: function () {
                            $this.data("jsmodernVideoPlaying", false);
                            $panel.show();
                            clearInterval(mouseTimer);
                        },
                        ended: function () {
                            $this.data("jsmodernVideoPlaying", false);
                            $panel.show();
                            clearInterval(mouseTimer);
                            $pass.width(0);
                            $lineDot.css("marginLeft",  - dotWidth);
                            video.currentTime = 0;
                            video.pause();
                            $playPause.add($center).toggle();
                            $video.addClass("jmn-video-opacity");
                            if ( endEvent && $.isFunction(endEvent) ) {
                                endEvent.call(video);
                            }
                        }
                    })
                } else {
                    $this.addClass("jmn-video-container");
                    $video.attr({
                        width: width,
                        height: height,
                        controls: "controls"
                    });
                }
            })
            return this;
        },
        videoSwitch: function ( selector, src ) {
            $(selector).each(function () {
                var $this = $(this);
                if ( $this.data("jsmodernVideoPlugin") ) {
                    var $video = $this.find("video");
                    $video.prop("src", src).unwrap().nextAll().remove();
                    jsModern.video(selector, function () {
                        $this.data("jsmodernVideoEnd");
                    })
                    $video.removeClass("jmn-video-opacity").get(0).play();
                    $this.find(".jmn-video-center, .jmn-video-play").hide();
                    $this.find(".jmn-video-pause").show();
                }
            })
            return this;
        },
        alert: function ( title, content ) {
            In.layer.tmpl("alert", title, content);
        },
        confirm: function ( title, content ) {
            In.layer.tmpl("confirm", title, content);
            return window[$html.data("jsmodernACPVar")];
        },
        prompt: function ( title, content ) {
            In.layer.tmpl("prompt", title, content);
            return window[$html.data("jsmodernACPVar")];
        },
        dialog: function ( options ) {

            // 基本参数
            var src = options.src,
                esc = options.esc,
                type = options.type,
                width = options.width,
                height = options.height,
                content = options.content,
                selector = options.selector,
                animate = options.animate || "slide";
            var container = '<section class="jmn-dialog-container" id="jmn-dialog-container"><div class="jmn-dialog-mask"></div><div class="jmn-dialog-box" style="width:' + width + 'px;height:' + height + 'px;">{{}}</div><b class="jmn-dialog-close"></b></section>';

            // iframe 或 video 
            if ( type && src ) {
                switch ( type ) {
                    case "iframe":
                        container = container.replace("{{}}", '<iframe src="' + src + '" width="' + width + '" height="' + height + '" frameborder="0"></iframe>');
                        break;
                    case "video":
                        container = container.replace("{{}}", '<section id="jmn-dialog-video" style="width:' + width + 'px;height:' + height + 'px;"><video src="' + src + '" width="' + width + '" height="' + height + '" controls></video></section>');
                        break;
                }
            } else {

                // 自定义对话框内容结构
                if ( selector ) {
                    container = container.replace("{{}}", $(selector).html()).replace('<b class="jmn-dialog-close"></b>', "");
                } else if ( content ) {
                    container = container.replace("{{}}", content).replace('<b class="jmn-dialog-close"></b>', "");
                }
            }

            // 添加对话框
            if ( !$("#jmn-dialog-container").length ) {
                $("body").prepend(container);
                var $container = $("#jmn-dialog-container"),
                    $dialog = $container.find(".jmn-dialog-box");

                // 存储动画方式
                $container.data("jsmodernDialogAnimate", animate);

                if ( type === "video" && options.jsmodernVideo ) {
                    jsModern.video("#jmn-dialog-video");
                }

                // 动画时长
                var time = In.dialogAnimateTime;

                // 显示对话框
                $container.stop().animate({
                    opacity: 1
                }, time);
                switch ( animate ) {
                    case "slide":
                        $dialog.slideDown(time);
                        break;
                    case "fade":
                        $dialog.fadeIn(time);
                        break;
                    case "drop":
                        $dialog.css({
                            top: "43%",
                            opacity: 0
                        }).show().animate({
                            top: "50%",
                            opacity: 1
                        }, time);
                }

                // 关闭对话框 [ 默认按钮 / 自定义按钮 / ESC 按键 ]
                function close () {
                    In.closeDialog($container, $dialog, time, animate);
                }

                // 按钮关闭
                $container.find('.jmn-dialog-close, [data-jsmodern="closeDialog"]').click(function () {
                    close();
                })

                // ESC 关闭
                if ( In.bool(esc) && esc ) {
                    jsModern.keyCode(27, function () {
                        close();
                    })
                }
            }
        },
        closeDialog: function () {
            var $container = $("#jmn-dialog-container");
            if ( $container.length ) {
                In.closeDialog($container, $container.find(".jmn-dialog-box"), In.dialogAnimateTime, $container.data("jsmodernDialogAnimate"));
            }
        },
        page: function ( selector, options ) {
            var $selector = $(selector).first();
            if ( options && $.isPlainObject(options) ) {

                // 获取参数
                var $target = $(options.target),
                    type = options.type,
                    ajaxURL = options.url,
                    total = ~~options.total,
                    every = ~~options.every,
                    success = options.success;

                // 中文
                var cn_more = options.mobileMore || decodeURI("%E5%8A%A0%E8%BD%BD%E6%9B%B4%E5%A4%9A"),
                    cn_nomore = options.mobileNone || decodeURI("%E5%B7%B2%E6%97%A0%E6%9B%B4%E5%A4%9A%E6%95%B0%E6%8D%AE");

                // 生成分页按钮
                var pageTmpl = "",
                    perPage = "";
                var pages = total/every;
                pages = pages >= 1 ? (total % every > 0 ? ~~pages + 1 : pages) : pages;
                if ( pages < 1 ) {
                    pages = 1;
                }
                for ( var i = 1; i <= pages; i++ ) {
                    perPage += '<i class="jmn-page-every">' + i + '</i>';
                }
                perPage = "<div><div>" + perPage + "</div></div>";
                pageTmpl = '<section class="jmn-page"><i class="jmn-page-first"><span>«</span></i><i class="jmn-page-prev"><span>‹</span></i>' + perPage + '<i class="jmn-page-next"><span>›</span></i><i class="jmn-page-last"><span>»</span></i></section>';
                $selector.addClass("jmn-page-content").append(pageTmpl);

                var $page = $selector.find(".jmn-page"),
                    $innerDiv = $page.find("div > div"), 
                    $every = $page.find(".jmn-page-every"),
                    $first = $page.find(".jmn-page-first"),
                    $last = $page.find(".jmn-page-last"),
                    $prev = $page.find(".jmn-page-prev"),
                    $next = $page.find(".jmn-page-next");

                $target.data("jsmodernPageIndex", 1);

                // 初始状态下第一个按钮处于激活状态
                $every.first().addClass("active");

                // 防止按钮快速点击出现选择效果
                $selector.on("selectstart", function () {
                    return false;
                })

                // 按钮数量超过 10
                // 超出的按钮将以滑动的形式出现
                // 页面最多显示 10 个页码按钮
                function moreScroll ( param ) {
                    if ( pages > 10 ) {
                        var num = pages - 10;
                        var time = 100;
                        var basicNum = 42;
                        $innerDiv.width(basicNum * pages);
                        var left = parseInt($innerDiv.css("marginLeft"));
                        switch ( param ) {
                            case "next": 
                                if ( left > -num * basicNum ) {
                                    $innerDiv.stop().animate({
                                        marginLeft: left - basicNum + "px"
                                    }, time);
                                }
                                break;
                            case "prev":
                                if ( left < 0 ) {
                                    $innerDiv.stop().animate({
                                        marginLeft: left + basicNum + "px"
                                    }, time);
                                }
                                break;
                            case "first":
                                $innerDiv.stop().animate({
                                    marginLeft: 0
                                }, time);
                                break;
                            case "last":
                                $innerDiv.stop().animate({
                                    marginLeft: -num * basicNum + "px"
                                }, time);
                                break;  
                        }
                    }
                }
                moreScroll();

                // 移动端自动转换成加载更多的形式
                if ( jsModern.isMobile() ) {
                    $target.css("height", "auto");
                    $selector.empty().html('<section class="jmn-page-more jmn-select-none">' + cn_more + '</section>');
                    var $more = $selector.find(".jmn-page-more");
                    $more.data("jsmodernPageIndex", 1);
                    if ( total === every ) {
                        $more.html(cn_nomore);
                    }
                }

                // 判断数据加载类型
                if ( type === "local" ) {

                    // 仅使用一次 ajax 获取所有数据并保存到本地
                    // ajax 返回的数据类型需是 json 
                    if ( ajaxURL && $.isFunction(ajaxURL) ) {

                        $.ajax(ajaxURL("")).done(function ( getData ) {  

                            getData = $.parseJSON(getData);
                            
                            // 将获取到的数据附加到模板中
                            // 并全部存储到内存数组中
                            var dataset = [];
                            for ( var name in getData ) {
                                var eachSet = getData[name];
                                dataset.push(success(eachSet)); 
                            }

                            // 根据每页显示的内容
                            // 将数据添加进目标元素中
                            var result = "";

                            // 第一页和初始化
                            var firstPage = "";
                            for ( var i = 0; i < every; i++ ) {
                                result += dataset[i];
                            }
                            firstPage = result;
                            $target.html(result);

                            // 切换事件
                            var witchActive = function ( index ) {
                                $every.eq(index - 1).addClass("active").siblings().removeClass("active");
                            }
                            var switchEvent = function ( switchType, that, more ) {
                                result = "";
                                if ( !$innerDiv.is(":animated") ) {
                                    var index;
                                    var getIndex = $target.data("jsmodernPageIndex"); 
                                    var sameEvent = function ( a ) {
                                        for ( var i = (a - 1) * every; i < a * every; i++ ) {
                                            if ( dataset[i] ) {
                                                result += dataset[i];
                                            }
                                        }
                                        index = getIndex; 
                                    }
                                    switch ( switchType ) {
                                        case "first":
                                            if ( getIndex !== 1 ) {
                                                result = firstPage;
                                                index = 1;
                                            }
                                            break;
                                        case "last":
                                            if ( getIndex !== pages ) {
                                                for ( var i = (pages - 1) * every; i < total; i++ ) {
                                                    result += dataset[i];
                                                }
                                                index = pages;
                                            }
                                            break;
                                        case "prev": 
                                            if ( getIndex > 1 ) {
                                                getIndex--;
                                                sameEvent(getIndex);
                                            }
                                            break;
                                        case "next": 
                                            if ( getIndex < pages ) {
                                                getIndex++;
                                                sameEvent(getIndex);
                                            }
                                            break;
                                        case "every": 
                                            getIndex = $(that).index() + 1
                                            sameEvent(getIndex);
                                            break;
                                    }
                                    if ( !more ) {
                                        result !== "" && $target.html(result).data("jsmodernPageIndex", index);
                                    } else { 
                                        result !== "" && $target.append(result).data("jsmodernPageIndex", index);
                                    }
                                    witchActive(index);
                                    moreScroll(switchType);
                                }
                            }
                            $first.click(function () {
                                switchEvent("first");
                            })
                            $last.click(function () {
                                switchEvent("last");
                            })
                            $prev.click(function () {
                                switchEvent("prev");
                            })
                            $next.click(function () {
                                switchEvent("next");
                            })
                            $every.click(function () {
                                switchEvent("every", this);
                            })
                            if ( jsModern.isMobile() ) {
                                $more.tap(function () {
                                    var index = $(this).data("jsmodernPageIndex");
                                    index++;
                                    if ( index <= pages ) {
                                        $(this).data("jsmodernPageIndex", index);
                                        switchEvent("next", "", "more");
                                    } 
                                    if ( index === pages ) {
                                        $(this).html(cn_nomore);
                                    }
                                })
                            }
                        })
                    }
                }
                if ( type === "ajax" ) {

                    // 每次点击都通过 ajax 获取数据
                    // ajax 返回的数据类型需是 json 
                    if ( ajaxURL && $.isFunction(ajaxURL) ) {

                        // 设置内部缓存
                        var ajaxContentCache = {};

                        var initPage = 1;
                        var witchActive = function ( index ) {
                            $every.eq(index - 1).addClass("active").siblings().removeClass("active");
                        }
                        var ajaxEvent = function ( u, more ) {


                            // 当数据已经加载过一次
                            // 则直接从数据缓存中直接获取数据
                            // 避免了再一次发送 ajax 请求
                            // 实现本地直接读取
                            if ( ajaxContentCache[u] ) {
                                $target.html(ajaxContentCache[u]);
                            } else {
                                var result = "";
                                $.ajax(ajaxURL(u)).done(function ( getData ) {  

                                    getData = $.parseJSON(getData);

                                    for ( var name in getData ) {
                                        var eachSet = getData[name]; 
                                        result += success(eachSet); 
                                    }

                                    // 将加载过的数据保存到本地缓存中
                                    // 下一次直接从本地读取数据
                                    ajaxContentCache[u] = result;

                                    if ( !more ) {
                                        result !== "" && $target.html(result)
                                    } else { 
                                        result !== "" && $target.append(result)
                                    }
                                })
                            }
                            $target.data("jsmodernPageIndex", u);
                        }
                        ajaxEvent(1);
                        $every.click(function () {
                            var eq = $(this).index() + 1;
                            witchActive(eq);
                            ajaxEvent(eq);
                            moreScroll("every");
                        })
                        $prev.click(function () {
                            var eq = $target.data("jsmodernPageIndex") - 1;
                            if ( eq > 0 ) {
                                witchActive(eq);
                                ajaxEvent(eq);
                                moreScroll("prev");
                            }
                        })
                        $next.click(function () {
                            var eq = $target.data("jsmodernPageIndex") + 1;
                            if ( eq < pages + 1 ) {
                                witchActive(eq);
                                ajaxEvent(eq);
                                moreScroll("next");
                            }
                        })
                        $first.click(function () {
                            if ( $target.data("jsmodernPageIndex") !== 1 ) {
                                witchActive(1);
                                ajaxEvent(1);
                                moreScroll("first"); 
                            }
                        })
                        $last.click(function () {
                            if ( $target.data("jsmodernPageIndex") !== pages ) {
                                witchActive(pages);
                                ajaxEvent(pages);
                                moreScroll("last");
                            }
                        })
                        if ( jsModern.isMobile() ) {
                            $more.tap(function () {
                                var index = $(this).data("jsmodernPageIndex");
                                index++;
                                if ( index <= pages ) {
                                    ajaxEvent(index, "more");
                                    $(this).data("jsmodernPageIndex", index);
                                } 
                                if ( index === pages ) {
                                    $(this).html(cn_nomore);
                                }
                            })
                        }
                    }
                }
            }
            return this;
        },
        fullPage: function ( options ) { 
            var $body = $("body");
            var $child = $body.children();

            if ( $child.length > 0 ) {
                var $target = $child.first()
                $target.addClass("jmn-fullpage-container");

                // 基础参数
                var easing = "cubic-bezier(0.77, 0, 0.175, 1)";
                var axis = options.axis || "y";
                var background = options.background;
                var time = options.time || 800;
                var callback = options.callback;
                var keyboard = options.keyboard;

                // 内部区块定位
                var $part = $target.children();
                var partSize = $part.length;
                var initState = [];
                $part.addClass("jmn-fullpage-part").each(function ( i ) {
                    if ( axis === "y" ) {
                        $(this).css("marginTop", i * In.winHeight + "px");
                    }
                    if ( axis === "x" ) {
                        $(this).css("marginLeft", i * In.winWidth + "px");
                    }

                    // 保存区块内部状态
                    initState.push($(this).html());
                });
                if ( axis === "x" ) {
                    $target.width(In.winWidth * partSize);
                    $part.width(In.winWidth);
                }
                (axis === "y") && $target.height(In.winHeight * partSize);

                // 如果设置了背景色或图片则添加
                if ( background && Array.isArray(background) ) {
                    $.each(background, function ( i, v ) {
                        $part.eq(i).css("background", v);
                    })
                }

                // 导航
                var $nav;
                if ( options.navigation ) {
                    var navCls = "jmn-fullpage-navigation";
                    if ( $.type(options.navigation) === "boolean" ) {

                        // 默认导航
                        var nav = "";
                        for ( var i = 0; i < partSize; i++ ) {
                            nav += '<b></b>';
                        }
                        nav = '<div class="' + navCls + ' jmn-fullpage-navigation-default jmn-fullpage-navigation-' + axis + '">' + nav + '</div>';
                        $target.after(nav);
                    } else {

                        // 自定义导航
                        $(".jmn-fullpage-container").after(options.navigation);
                    }
                    $nav = $target.next();
                    var $dot = $nav.children();
                    $dot.first().addClass("active");
                }

                // 切换控制函数
                $target.data("jsmodern_fullpage_index", 0);
                var switchFn = function ( item ) {
                    if ( !$target.data("jsmodern_fullpage_animate") ) {
                        var index = $target.data("jsmodern_fullpage_index");
                        if ( item ) {

                            // 下滑或右滑
                            index++;
                            if ( index < partSize ) {
                                animateFn(index);
                            }
                        } else {

                            // 上滑或左滑
                            index--;
                            if ( index > -1 ) {
                                animateFn(index);
                            }
                        }
                    }
                }

                // 导航激活项
                var activeNav = function ( item ) {
                    $nav && $dot.eq(item).addClass("active").siblings().removeClass("active");
                }

                // 动画函数
                var animateFn = function ( item ) {
                    function over_animate () {
                        $target.data("jsmodern_fullpage_index", item);
                        if ( Array.isArray(callback) && callback.length === partSize ) {
                            var $thisPart = $part.eq(item);
                            $thisPart.html(initState[item]).siblings().html("");
                            
                            // 防止动画异常闪烁
                            //将其强制放进新线程中执行
                            var delay = setTimeout(function () {
                                callback[item].call($thisPart);
                                clearTimeout(delay);
                            }, 0);
                        } 
                        activeNav(item);
                        $target.removeData("jsmodern_fullpage_animate");
                    }

                    // 添加动画标识
                    $target.data("jsmodern_fullpage_animate", true);

                    // IE9 使用 jQuery 动画
                    // 其它浏览器使用 css3 动画
                    if ( !document.head.classList ) {
                        if ( axis === "x" ) {
                            $target.stop().animate({
                                left: "-" + (In.winWidth * item) + "px"
                            }, time, "easeInOutQuart", function () {
                                over_animate();
                            })
                        }
                        if ( axis === "y" ) {
                            $target.stop().animate({
                                top: "-" + (In.winHeight * item) + "px"
                            }, time, "easeInOutQuart", function () {
                                over_animate();
                            })
                        }
                    } else {
                        $target.css("transition-duration", time + "ms");
                        if ( axis === "x" ) {
                            $target.css({
                                transform: "translate3d(-" + (In.winWidth * item) + "px, 0, 0)"
                            }).on("transitionend", function () {
                                over_animate();
                            })
                        }
                        if ( axis === "y" ) {
                            $target.css({
                                transform: "translate3d(0, -" + (In.winHeight * item) + "px, 0)"
                            }).on("transitionend", function () {
                                over_animate();
                            })
                        }
                    }
                }

                // 初始状态下默认一次
                if ( Array.isArray(callback) && callback.length === partSize ) {
                    var $thisPart = $part.eq(0);
                    $thisPart.html(initState[0]).siblings().html("");
                    callback[0].call($thisPart);
                } 

                // 手动切换
                $document.on({
                    keyup: function ( event ) {
                        if ( !$target.is(":animated") && keyboard ) {
                            var event = event || window.event;
                            var keycode = event.keyCode;
                            if ( axis === "x" ) {
                                if ( keycode === 37 ) {
                                    switchFn();
                                }
                                if ( keycode === 39 ) {
                                    switchFn(1);
                                }
                            }
                            if ( axis === "y" ) {
                                if ( keycode === 38 ) {
                                    switchFn();
                                }
                                if ( keycode === 40 ) {
                                    switchFn(1);
                                }
                            }
                        }
                    },
                    wheelUp: function () {
                        switchFn();
                    },
                    wheelDown: function () {
                        switchFn(1);
                    }
                });
                if ( axis === "x" ) {
                    $document.on({
                        swipeLeft: function () {
                            switchFn(1);
                        },
                        swipeRight: function () {
                            switchFn();
                        }
                    });
                }
                if ( axis === "y" ) {
                    $document.on({
                        swipeUp: function () {
                            switchFn(1);
                        },
                        swipeDown: function () {
                            switchFn();
                        }
                    });
                }
                $dot.click(function () {
                    if ( !$target.data("jsmodern_fullpage_animate") ) {
                        var index = $(this).index();
                        animateFn(index);
                        $target.data("jsmodern_fullpage_animate", true);
                    }
                })
            }
            return this;
        },
        notice: function ( title, content ) {
            if ( !jsModern.isMobile() ) {
                var autoClose = false;
                var _content = "";
                var _title = "";
                var icon = "";

                if ( title && content ) {
                    _title = title;
                    _content = content;
                }
                if ( !content ) {
                    _title = In.str(title) ? title : (title.title || "");
                }
                if ( $.isPlainObject(title) ) {
                    _content = title.content || "";
                    icon = title.icon || "";
                    autoClose = title.autoClose;
                }

                var size = $(".jmn-notice").length;
                $("body").append('<div class="jmn-notice"><div><p></p><div></div></div><i></i></div>');
                var $notice = $(".jmn-notice").last(),
                    $title = $notice.find("p"),
                    $content = $notice.find("div div");

                _title ? $title.text(_title) : $title.remove();
                _content ? $content.append($.parseHTML(_content)) : $content.remove();
                icon ? $notice.prepend('<img src="' + icon + '" ondragstart="return false;">').addClass("jmn-notice-icon") : $notice.addClass("jmn-notice-noicon");

                // 自动关闭
                if ( autoClose && In.num(autoClose) ) {
                    autoClose = parseInt(autoClose);
                    $notice.append('<b class="jmn-notice-autoclose"></b>');
                    $notice.find(".jmn-notice-autoclose").animate({
                        width: $notice.innerWidth() + "px"
                    }, autoClose, function () {
                        $(this).prev().trigger("click");
                    });
                }

                // 若当前已有通知未移除
                // 则以堆叠的形式展示
                var outerHeight = $notice.outerHeight();
                if ( size > 0 ) {
                    $notice.css("bottom", size * (outerHeight + 10) + 15);
                }

                var time = 200;
                $notice.animate({
                    marginRight: 0,
                    opacity: 1
                }, time);

                // 移除通知
                $document.on("click", ".jmn-notice i", function () {
                    var $parent = $(this).parent();
                    var $nextAll = $parent.nextAll(".jmn-notice");
                    $parent.animate({
                        marginRight: -$parent.outerWidth() + "px",
                        opacity: 0
                    }, time, function () {
                        $parent.remove();
                        $nextAll.each(function () {
                            $(this).animate({
                                bottom: parseFloat($(this).css("bottom")) - outerHeight - 10 + "px"
                            }, time);
                        })
                    });
                })

                // 按下 ESC 键一键清除所有通知
                jsModern.keyCode(27, function () {
                    var $notice = $(".jmn-notice");
                    var outerWidth = $notice.last().outerWidth();
                    $notice.animate({
                        marginRight: -outerWidth + "px",
                        opacity: 0
                    }, time, function () {
                        $notice.remove();
                    })
                })
            }
        },
        loading: function ( selector, options ) {
            var title = "", 
                color = "",
                background = "";
            if ( options ) {
                title = options.title;
                theme = options.theme;
                if ( $.isPlainObject(theme) ) {
                    background = theme.background;
                    color = theme.color;
                } else {
                    background = (theme === "dark" && "rgba(0, 0, 0, .7)") || (theme === "light" && "rgba(255, 255, 255, .7)");
                    color = (theme === "dark" && "#FFF") || (theme === "light" && "#333");
                }
            }
            background = background || "rgba(0, 0, 0, .7)";
            color = color || "#FFF";
        	$(selector).each(function () {
        		var $this = $(this);
        		var width = $this.innerWidth(),
        			height = $this.innerHeight();
        		if ( $this.css("position") === "static" ) {
        			$this.addClass("jmn-loading-position");
        		}
	        	var dots = "";
	        	for ( var i = 0; i < 8; i++ ) {
	        		dots += '<i style="background:' + color + ';"></i>';
	        	}
	        	dots = '<div class="jmn-loading-container jmn-select-none" style="width:' + width + 'px;height:' + height + 'px;background:' + background + ';"><div class="jmn-loading-body">' + dots + '</div><div class="jmn-loading-title" style="color:' + color + ';">' + (title || "") + '</div></div>';
	        	$this.append(dots);
	        	var $container = $this.find(".jmn-loading-container");
                    $title = $this.find(".jmn-loading-title");
	        	if ( $title.html() === "" ) {
	        		$title.prev().css("marginTop", 0).end().remove();
	        	}
	        	var $dots = $this.find(".jmn-loading-body i");
	        	var time = 60;
	        	function animate ( index ) {
	        		$dots.eq(index).animate({
	        			opacity: 1
	        		}, time, function () {
	        			$(this).animate({
	        				opacity: .1
	        			}, time * 6);
	        		});
	        	}
	        	var thisInterval;
	        	function loadingAnimate ( index ) {
	        		thisInterval = setInterval(function () {
	        			index++;
	        			if ( index == 8 ) {
		        			index = 0;
		        		}
		        		animate(index);
	        		}, 100);
	        		if ( !$this.data("jsmodernLoading") ) {
	        			$this.data("jsmodernLoading", thisInterval);
	        		}
	        	}
                loadingAnimate(-1);

                // 检测当前网页的可见性
                // 在不可见时则暂停动画
                $document.on("visibilitychange", function () {
                    document.hidden ? clearInterval(thisInterval) :loadingAnimate(-1);
                })
        	})
        },
        removeLoading: function ( selector ) {
        	$(selector).each(function () {
                var $this = $(this);
        		var hasLoading = $this.data("jsmodernLoading");
        		if ( hasLoading ) {
	        		$this.removeData("jsmodernLoading").find(".jmn-loading-container").fadeOut(100, function () {
	        			clearInterval(hasLoading);
	        			$(this).remove();
                        $this.removeClass("jmn-loading-position");
	        		});
	        	}
        	})
        }
    };
    
    // 针对部分组件，使用 data-jsmodern 属性进行绑定
    $(function () {
        var jsmodern = document.querySelectorAll("[data-jsmodern]");
        for ( var i = 0, j = jsmodern.length; i < j; i++ ) {
            var each = jsmodern[i];
            var name = each.getAttribute("data-jsmodern");
            if ( name ) {
                var index = name.indexOf(":");
                var param = name.substring(index + 1).trim();
                var _name = index === -1 ? name : name.substring(0, index);
                switch ( name ) {
                    case "top":
                        jsModern.top(each);
                        break;
                    case "scrollBar":
                        jsModern.scrollBar(each);
                        break;
                    case "marquee":
                        jsModern.marquee(each);
                        break;
                    case "lazyload":
                        jsModern.lazyload(each);
                        break;
                }
                switch ( _name ) {
                    case "textBind":
                        if ( param ) {
                            jsModern.textBind(each, param);
                        }
                        break;
                    case "share":
                        if ( param ) {
                            var obj = {};
                            obj[param] = each;
                            obj["defaultTheme"] = true;
                            jsModern.share(obj);
                        }
                        break;
                }
            }
        }
    })

    return jsModern;

})