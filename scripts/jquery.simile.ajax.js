/*==================================================
 * This code implements the Simile Ajax jQuery plugin, which in turns simply
 * provides several convenient and useful functions for manipulating the
 * DOM provided by Simile Ajax which you can view here:
 *
 * http://simile.mit.edu/ajax/api/simile-ajax-api.js
 * @overview Simile Ajax jQuery plugin
 *
 *==================================================
 */

jQuery.extend({
    getHead:    function(doc) {
        return doc.getElementsByTagName("head")[0];
    },
    
    findScript:     function(doc, substring) {
        var heads = doc.documentElement.getElementsByTagName("head");
        for (var h = 0; h < heads.length; h++) {
            var node = heads[h].firstChild;
            while (node != null) {
                if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                    var url = node.src;
                    var i = url.indexOf(substring);
                    if (i >= 0) {
                        return url;
                    }
                }
                node = node.nextSibling;
            }
        }
        return null;
    },
    
    /**
     * Parse out the query parameters from a URL
     * @param {String} url    the url to parse, or location.href if undefined
     * @param {Object} to     optional object to extend with the parameters
     * @param {Object} types  optional object mapping keys to value types
     *        (String, Number, Boolean or Array, String by default)
     * @return a key/value Object whose keys are the query parameter names
     * @type Object
     */
    parseURLParameters:    function(url, to, types) {
        to = to || {};
        types = types || {};
        
        if (typeof url == "undefined") {
            url = location.href;
        }
        var q = url.indexOf("?");
        if (q < 0) {
            return to;
        }
        url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
        
        var params = url.split("&"), param, parsed = {};
        var decode = window.decodeURIComponent || unescape;
        for (var i = 0; param = params[i]; i++) {
            var eq = param.indexOf("=");
            var name = decode(param.slice(0,eq));
            var old = parsed[name];
            if (typeof old == "undefined") {
                old = [];
            } else if (!(old instanceof Array)) {
                old = [old];
            }
            parsed[name] = old.concat(decode(param.slice(eq+1)));
        }
        for (var i in parsed) {
            if (!parsed.hasOwnProperty(i)) continue;
            var type = types[i] || String;
            var data = parsed[i];
            if (!(data instanceof Array)) {
                data = [data];
            }
            if (type === Boolean && data[0] == "false") {
                to[i] = false; // because Boolean("false") === true
            } else {
                to[i] = type.apply(this, data);
            }
        }
        return to;
    },
    
    includeJavascriptFile:  function(doc, url, onerror, charset) {
        onerror = onerror || "";
        if (doc.body == null) {
            try {
                var q = "'" + onerror.replace( /'/g, '&apos' ) + "'"; // "
                doc.write("<script src='" + url + "' onerror="+ q +
                          (charset ? " charset='"+ charset +"'" : "") +
                          " type='text/javascript'>"+ onerror + "</script>");
                return;
            } catch (e) {
                // fall through
            }
        }

        var script = doc.createElement("script");
        if (onerror) {
            try { script.innerHTML = onerror; } catch(e) {}
            script.setAttribute("onerror", onerror);
        }
        if (charset) {
            script.setAttribute("charset", charset);
        }
        script.type = "text/javascript";
        script.language = "JavaScript";
        script.src = url;
        return getHead(doc).appendChild(script);
    },
    
    includeJavascriptFiles:     function(doc, urlPrefix, filenames) {
        $.each(filenames, function (index, value) {
            $.includeJavascriptFile(doc, urlPrefix + value);
        });
    },
    
    includeCssFile:     function(doc, url) {
        if (doc.body == null) {
            try {
                doc.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
                return;
            } catch (e) {
                // fall through
            }
        }
        
        var link = doc.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        getHead(doc).appendChild(link);
    },
    
    includeCssFiles: function(doc, urlPrefix, filenames) {
        $.each(filenames, function (index, value) {
            $.includeCssFile(doc, urlPrefix + value);
        });
    },
    
    debugLog:   function(msg, silent) {
        var f;
        if ("console" in window && "log" in window.console) { // FireBug installed
            f = function(msg2) {
                console.log(msg2);
            }
        } else {
            f = function(msg2) {
                if (!silent) {
                    alert(msg2);
                }
            }
        }
        f(msg);
    },
    
    createMessageBubble:    function(doc, urlPrefix) {
        var an = navigator.appName.toLowerCase();
        var containerDiv = doc.createElement("div");
        var pngIsTranslucent = (an.indexOf("microsoft") == -1) || ($.getBrowserMajorVersion() > 6);
        if (pngIsTranslucent) {
            var topDiv = doc.createElement("div");
            topDiv.style.height = "33px";
            topDiv.style.background = "url(" + urlPrefix + "images/message-top-left.png) top left no-repeat";
            topDiv.style.paddingLeft = "44px";
            containerDiv.appendChild(topDiv);
            
            var topRightDiv = doc.createElement("div");
            topRightDiv.style.height = "33px";
            topRightDiv.style.background = "url(" + urlPrefix + "images/message-top-right.png) top right no-repeat";
            topDiv.appendChild(topRightDiv);
            
            var middleDiv = doc.createElement("div");
            middleDiv.style.background = "url(" + urlPrefix + "images/message-left.png) top left repeat-y";
            middleDiv.style.paddingLeft = "44px";
            containerDiv.appendChild(middleDiv);
            
            var middleRightDiv = doc.createElement("div");
            middleRightDiv.style.background = "url(" + urlPrefix + "images/message-right.png) top right repeat-y";
            middleRightDiv.style.paddingRight = "44px";
            middleDiv.appendChild(middleRightDiv);
            
            var contentDiv = doc.createElement("div");
            middleRightDiv.appendChild(contentDiv);
            
            var bottomDiv = doc.createElement("div");
            bottomDiv.style.height = "55px";
            bottomDiv.style.background = "url(" + urlPrefix + "images/message-bottom-left.png) bottom left no-repeat";
            bottomDiv.style.paddingLeft = "44px";
            containerDiv.appendChild(bottomDiv);
            
            var bottomRightDiv = doc.createElement("div");
            bottomRightDiv.style.height = "55px";
            bottomRightDiv.style.background = "url(" + urlPrefix + "images/message-bottom-right.png) bottom right no-repeat";
            bottomDiv.appendChild(bottomRightDiv);
        } else {
            containerDiv.style.border = "2px solid #7777AA";
            containerDiv.style.padding = "20px";
            containerDiv.style.background = "white";
            $.setOpacity(containerDiv, 90);
            
            var contentDiv = doc.createElement("div");
            containerDiv.appendChild(contentDiv);
        }
        
        return {
            containerDiv:   containerDiv,
            contentDiv:     contentDiv
        };
    },
    
    setOpacity:     function(elmt, opacity) {
        var an = navigator.appName.toLowerCase();
    
        if (an.indexOf("microsoft") == -1) {
            elmt.style.filter = "progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity=" + opacity + ")";
        } else {
            var o = (opacity / 100).toString();
            elmt.style.opacity = o;
            elmt.style.MozOpacity = o;
        }
    },

    getIsIE:    function() {
        var an = navigator.userAgent.toLowerCase();
        return (an.indexOf("microsoft") != -1);
    },
    
    getBrowserMajorVersion:     function() {
        var an = navigator.userAgent.toLowerCase();
        
        var isIE = (an.indexOf("microsoft") != -1);
        var isNetscape = (an.indexOf("netscape") != -1);
        var isMozilla = (ua.indexOf("mozilla") != -1);
        var isFirefox = (ua.indexOf("firefox") != -1);
        var isOpera = (an.indexOf("opera") != -1);
        var isSafari = (an.indexOf("safari") != -1);
        
        var browserMajorVersion;
        var parseVersionString = function(s) {
            var a = s.split(".");
            browserMajorVersion = parseInt(a[0]);
        };
        
        if (isMozilla) {
            var offset = ua.indexOf("mozilla/");
            if (offset >= 0) {
                parseVersionString(ua.substring(offset + 8, indexOf(ua, " ", offset)));
            }
        }
        if (isIE) {
            var offset = ua.indexOf("msie ");
            if (offset >= 0) {
                parseVersionString(ua.substring(offset + 5, indexOf(ua, ";", offset)));
            }
        }
        if (isNetscape) {
            var offset = ua.indexOf("rv:");
            if (offset >= 0) {
                parseVersionString(ua.substring(offset + 3, indexOf(ua, ")", offset)));
            }
        }
        if (isFirefox) {
            var offset = ua.indexOf("firefox/");
            if (offset >= 0) {
                parseVersionString(ua.substring(offset + 8, indexOf(ua, " ", offset)));
            }
        }
        return browserMajorVersion;
    },
    
    getXmlHttp:     function(url, fError, fDone) {
        var xmlhttp = $.createXmlHttpRequest();
    
        xmlhttp.open("GET", url, true);
        xmlhttp.onreadystatechange = function() {
            $.onReadyStateChange(xmlhttp, fError, fDone);
        };
        xmlhttp.send(null);
    },
    
        /**
     *  Creates an XMLHttpRequest object. On the first run, this
     *  function creates a platform-specific function for
     *  instantiating an XMLHttpRequest object and then replaces
     *  itself with that function.
     */
    createXmlHttpRequest:   function() {
        var isIE = (an.indexOf("microsoft") != -1);
        if (isIE) {
            var programIDs = [
            "Msxml2.XMLHTTP",
            "Microsoft.XMLHTTP",
            "Msxml2.XMLHTTP.4.0"
            ];
            for (var i = 0; i < programIDs.length; i++) {
                try {
                    var programID = programIDs[i];
                    var f = function() {
                        return new ActiveXObject(programID);
                    };
                    var o = f();
                    
                    // We are replacing the SimileAjax._createXmlHttpRequest
                    // function with this inner function as we've
                    // found out that it works. This is so that we
                    // don't have to do all the testing over again
                    // on subsequent calls.
                    return f;
                    
                    return o;
                } catch (e) {
                    // silent
                }
            }
            // fall through to try new XMLHttpRequest();
        }
    
        try {
            var f = function() {
                return new XMLHttpRequest();
            };
            var o = f();
            
            return o;
        } catch (e) {
            throw new Error("Failed to create an XMLHttpRequest object");
        }
    },

    debugException:     function(e, msg) {
        console.error(msg + " %o", e);
    },
    
    onReadyStateChange:     function(xmlhttp, fError, fDone) {
        switch (xmlhttp.readyState) {
        // 1: Request not yet made
        // 2: Contact established with server but nothing downloaded yet
        // 3: Called multiple while downloading in progress
        
        // Download complete
        case 4:
            try {
                if (xmlhttp.status == 0     // file:// urls, works on Firefox
                 || xmlhttp.status == 200   // http:// urls
                ) {
                    if (fDone) {
                        fDone(xmlhttp);
                    }
                } else {
                    if (fError) {
                        fError(
                            xmlhttp.statusText,
                            xmlhttp.status,
                            xmlhttp
                        );
                    }
                }
            } catch (e) {
                SimileAjax.Debug.exception("XmlHttp: Error handling onReadyStateChange", e);
            }
            break;
        }
    }
    
});