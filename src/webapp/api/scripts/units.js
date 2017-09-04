/*==================================================
 *  Default Unit
 *==================================================
 */

Timegrid.NativeDateUnit = new Object();

Timegrid.NativeDateUnit.makeDefaultValue = function() {
    return new Date();
};

Timegrid.NativeDateUnit.cloneValue = function(v) {
    return new Date(v.getTime());
};

Timegrid.NativeDateUnit.getParser = function(format) {
    if (typeof format == "string") {
        format = format.toLowerCase();
    }
    
    var parser = (format == "iso8601" || format == "iso 8601") ?
                    Timegrid.DateTime.parseIso8601DateTime : 
                    Timegrid.DateTime.parseGregorianDateTime;
                    
    return function(d) {
        if (d != null && typeof d != "undefined" && typeof d.toUTCString == "function") {
            return d;
        } else {
            return parser(d);
        }
    };
};

Timegrid.NativeDateUnit.parseFromObject = function(o) {
    return Timegrid.DateTime.parseGregorianDateTime(o);
};

Timegrid.NativeDateUnit.toNumber = function(v) {
    return v.getTime();
};

Timegrid.NativeDateUnit.fromNumber = function(n) {
    return new Date(n);
};

Timegrid.NativeDateUnit.compare = function(v1, v2) {
    var n1, n2;
    if (typeof v1 == "object") {
        n1 = v1.getTime();
    } else {
        n1 = Number(v1);
    }
    if (typeof v2 == "object") {
        n2 = v2.getTime();
    } else {
        n2 = Number(v2);
    }
    
    return n1 - n2;
};

Timegrid.NativeDateUnit.earlier = function(v1, v2) {
    return Timegrid.NativeDateUnit.compare(v1, v2) < 0 ? v1 : v2;
};

Timegrid.NativeDateUnit.later = function(v1, v2) {
    return Timegrid.NativeDateUnit.compare(v1, v2) > 0 ? v1 : v2;
};

Timegrid.NativeDateUnit.change = function(v, n) {
    return new Date(v.getTime() + n);
};

