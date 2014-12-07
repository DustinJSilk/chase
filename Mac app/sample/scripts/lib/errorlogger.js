define(["jquery"], function () {
    var logErrorUrl = "http://10.0.0.7:7502/debug";

    //Error logging into ELMAH for JS errors
    function logError(url, line, ex, stack) {
        if (ex == null) return;
        if (logErrorUrl == null) {
            alert('logErrorUrl must be defined.');
            return;
        }
        var browserInfo = getBrowserInfo();

        //var url = ex.fileName != null ? ex.fileName : document.location;
        //if (stack == null && ex.stack != null) stack = ex.stack;

        // format output
        //var out = ex.message != null ? ex.name + ": " + ex.message : ex;

        //if (stack != null) out += "\n  at " + stack.join("\n  at ");

        //append browser info
        //out = out + "\nBrowser:" + browserInfo.Browser + "\nVersion:" + browserInfo.Version + "\nAgent:" + browserInfo.Agent;

        //console.log(out)
        // send error message
        $.ajax({
            type: 'POST',
            url: logErrorUrl,
            data: { url: url, line: line, message: ex }
        });
    }

    Function.prototype.trace = function () {
        var trace = [];
        var current = this;
        while (current) {
            trace.push(current.signature());
            current = current.caller;
        }
        return trace;
    }

    Function.prototype.signature = function () {
        var signature = {
            name: this.getName(),
            params: [],
            toString: function () {
                var params = this.params.length > 0 ?
                "'" + this.params.join("', '") + "'" : "";
                return this.name + "(" + params + ")"
            }
        };
        if (this.arguments) {
            for (var x = 0; x < this.arguments.length; x++)
                signature.params.push(this.arguments[x]);
        }
        return signature;
    }

    Function.prototype.getName = function () {
        if (this.name)
            return this.name;
        var definition = this.toString().split("\n")[0];
        var exp = /^function ([^\s(]+).+/;
        if (exp.test(definition))
            return definition.split("\n")[0].replace(exp, "$1") || "anonymous";
        return "anonymous";
    }

    window.onerror = function (msg, url, line) {
        if (arguments != null && arguments.callee != null && arguments.callee.trace)
            logError(url, line, msg, arguments.callee.trace());
        if (document.location.hostname.toLowerCase() === 'localhost') {
            console.log("Error: " + url + " Line: " + line + " MSG: " + msg);
        } else {
            //Fire your own error handling here
        }
        return true;
    }

    function getBrowserInfo() {
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // In Opera, the true version is after "Opera" or after "Version"
        if ((verOffset = nAgt.indexOf("Opera")) != -1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf("Version")) != -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
            // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
            browserName = "Microsoft Internet Explorer";
            fullVersion = nAgt.substring(verOffset + 5);
        }
            // In Chrome, the true version is after "Chrome" 
        else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset + 7);
        }
            // In Safari, the true version is after "Safari" or after "Version" 
        else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf("Version")) != -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
            // In Firefox, the true version is after "Firefox" 
        else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset + 8);
        }

        else if (navigator.appName == 'Netscape') { //IE11+
            browserName = "Internet Explorer";
            var ua = navigator.userAgent;
            var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                fullVersion = majorVersion = RegExp.$1;
        }

            // In most other browsers, "name/version" is at the end of userAgent 
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);
            if (browserName.toLowerCase() == browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(";")) != -1)
            fullVersion = fullVersion.substring(0, ix);
        if ((ix = fullVersion.indexOf(" ")) != -1)
            fullVersion = fullVersion.substring(0, ix);

        majorVersion = parseInt('' + fullVersion, 10);
        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        return {
            "Browser": browserName,
            "Version": fullVersion,
            "Agent": nAgt
        };
    }
});