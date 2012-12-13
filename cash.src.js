/* cash.js
 * Transaction safe currency object for JavaScript.
 * (c) 2012 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

//{{#umd}}
/* UMD LOADER: https://github.com/umdjs/umd/blob/master/returnExports.js */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function() {
//{{/umd}}

//{{^umd}}
//prototype forEach function for those certain browsers
if(!Array.prototype.forEach) { //from: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
    Array.prototype.forEach = function(fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    };
}
//{{/umd}}

var Cash = {};

Cash = function(mixed, cents) { //Cash constructor
    switch(typeof mixed) {
        case 'undefined':
            return new Cash(0, 0);
        case 'object':
            if(mixed instanceof Array) { //array containing arguments
                cents = mixed[1]; //parse
                mixed = mixed[0]; //^
                return new Cash(mixed, cents); //^
            } else { //object with\without functions
                this.dec = mixed.dec;
                this.a = mixed.a;
                this.b = mixed.b;
            }
          break;
        case 'string': //a string of JSON
            mixed = JSON.parse(mixed); //parse
            return new Cash(mixed); //^
        case 'number': //one number argument
            if(typeof cents != 'number') {
                return new Cash(mixed, 0);
            } else { //two number arguments
                this.dec = cents.toString().strip(['-', '.']).length; //length of cents
                this.a = mixed;
                this.b = cents;
            }
          break;
    }
};

Cash._strproto = function ___(cp) { //save String.prototype
    var _to = {}; //create a temp object to hold the functions
    
    for(var val in cp) {
        _to[val] = cp[val]; //grab functions from String.prototype
    }
    
    return _to;
}(String.prototype);

/**
 * ReplaceAll by Fagner Brack (MIT Licensed)
 * Replaces all occurrences of a substring in a string
 */
String.prototype.replaceAll = function(token, newToken, ignoreCase) {
    var str, i = -1,
        _token;
    if ((str = this.toString()) && typeof token === "string") {
        _token = ignoreCase === true ? token.toLowerCase() : undefined;
        while ((i = (
        _token !== undefined ? str.toLowerCase().indexOf(
        _token,
        i >= 0 ? i + newToken.length : 0) : str.indexOf(
        token,
        i >= 0 ? i + newToken.length : 0))) !== -1) {
            str = str.substring(0, i).concat(newToken).concat(str.substring(i + token.length));
        }
    }
    return str;
};

String.prototype.strip = function(a) { //strip an array of strings from a string
    var _new  = this; //clone me
    
    a.forEach(function(v, i, a) { //loop through array
        _new = _new.replaceAll(v, ''); //replace all values with blank strings
    });
    
    return _new; //return the new string
};

String.prototype.repeat = function(x) { //like "ruby" * 2   -   "javascript".repeat(2)
    var _new = '';
    
    for(var i=0; i<x; i++) {
        _new += this;
    }
    
    return _new;
};

Cash.isNUM = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n); //passes 34 unit tests: http://dl.getdropbox.com/u/35146/js/tests/isNumber.html
};

Cash._parse = function(val) { //pre-parser for strings/numbers
    var str = val.toString(); //convert whatever value to a string
    var _parse = str.replaceAll('$', '').replaceAll(',', '').replaceAll('c', ''); //remove dollar signs, commas, and c's
    return _parse;
};

Cash.parsable = function(val) { //can we even parse this value?
    return Cash.isNUM(Cash._parse(val)); //check if the output of _parse is a valid number
};

Cash.parse = function(val) { //parse some cash from a string like "$2.50" or "25c" or "1,200" or "$1,000,000"
    if(Cash.parsable(val)) {
        var _p = Cash._parse(val.toString()).split("."); //parse: string -> better string -> array
        var _n = Cash.isNUM(parseInt(_p[1], 10)); //if _p[1] is a number
        var _q = ('[' + (parseInt(_p[0], 10).toString() + ',' + //parse: array -> valid JSON
        (_n ? 
            parseInt(_p[1], 10) 
            : 0 //B=0 if _p[1]==NaN
        ).toString()) + ']').replace('.', ',');
        
        return new Cash(_q).d(_n ? (_p[1].length) : 1); //make cash object from JSON
    } else {
        return -1; //parse error, just return -1
    }
};

Cash.killme = function(cb) { //self destruct (useful for returning String.prototype back to normal)
    var val;
    
    for(val in String.prototype) { //delete all functions in String.prototype
        delete String.prototype[val];
    }
    
    for(val in Cash._strproto) { //restore String.prototype to it's original state
        String.prototype[val] = Cash._strproto[val];
    }

    setTimeout(function() {
        Cash = undefined; //kill Cash
        setTimeout(cb, 1); //call the callback
    }, 250); //in the future
};

Cash.validate = function(cash) { //if cash.dec,a,b are all a numbers..
    return typeof cash.dec == 'number' && typeof cash.a == 'number' && typeof cash.b == 'number';
};

Cash._ = function(mixed, cents) { //argument parser
    if(Cash.validate(mixed) === true) { //check if the object is valid
        return mixed;
    } else {
        return new Cash(mixed, cents); //make a new one!
    }
};

Cash.prototype.validate = function() { //prototype version of Cash.validate
    return Cash.validate(this);
};

Cash.prototype.toNumber = function() { //convert Cash object to a number
    var _b = Math.abs(this.b).toString().strip(['-', '.']); //strip down b
    
    if(_b.length == this.dec) { //if the decimal place is what it is supposed to be
        _b = '' + _b; //convert to a string
    } else { //it's (probably) less than what it is supposed to be
        _b = '0'.repeat(this.dec - _b.length) + _b; //append zeros
    }
    
    return (new Number(this.a.toString() + '.' + _b)).valueOf(); //parse the string
};

Cash.prototype.clone = function() { //clone this
    return new Cash(this);
};

Cash.prototype.d = function(val) { //change the decimal place
    var _new = this.clone(); //clone this
    
    _new.dec = val; //change the decimal place
    
    return _new; //return the clone
};

Cash.prototype.add = function(mixed, cents) { //addition
    var _new = new Cash(); //create a new Cash object
    var cash = Cash._(mixed, cents).ms(); //parse the arguments
    
    _new.dec = Math.max(this.ms().dec, cash.dec); //set the new decimal place to the greatest decimal place
    var d = Math.pow(10, _new.dec); //get the max value + 1 of the B number
    var p = (this.ms().b + cash.b); //add the B numbers and store as temp P
    _new.a = this.a + cash.a + Math.floor(p / d); //new A number = SUM(all A numbers) + floor(P / D)
    _new.b = p % d; //new B number = P mod D
    
    return _new; //return the new Cash object
};

Cash.prototype.invert = function() {
    return new Cash(this.a * (-1), this.b * (-1)); //invert the cash object
};

Cash.prototype.sub = function(mixed, cents) { //subtraction
    var _new = new Cash(); //create a new Cash object
    var cash = Cash._(mixed, cents).ms(); //parse the arguments
    
    _new.dec = Math.max(this.ms().dec, cash.dec); //set the new decimal place to the greatest decimal place
    var d = Math.pow(10, _new.dec), //get the max value + 1 of the B number
        p = (cash.b - this.ms().b) * (-1), //SUB(B values) * (-1)
        q = (p < 0), //if P is negative
        r = Math.abs(p), //ABS(P)
        s = q ? -1 : 0, //negative carry
        t = q ? (d - r) : r; //if used carry do D - R and store as T else copy R to T
        u = cash.a * (-1); //A inverted
        v = this.a + s + u; //SUM(A, S, U)
    
    
    _new.a = v;
    _new.b = t;
    
    return _new.ms();
};

Cash.prototype.min = function(dec) {
    if(typeof dec == 'undefined') {
        return Cash.parse(this.toNumber()); //use the least possible amount of decimal points
    } else {
        if(this.dec==dec) {
            return this; //=, return current state
        } else if(this.dec<dec) {
            return this;  //<, return current state
        } else if(this.dec>dec) {
            return new Cash('['+this.toNumber().toFixed(dec).replace('.', ',')+']'); //return a new Cash object limited to dec
        }
    }
};

Cash._automin = false;
Cash.automin = function(dec) { //use min decimal places before all operations on everything. dec=false to disable
    this._automin = dec;
};

Cash.prototype.ms = function() { //function to get Cash object clone with a safe decimal place
    if(Cash._automin !== false) { //if we want to use automin
        return this.min(Cash._automin);
    } else {
        return this.clone(); //just return a clone of this
    }
};

// (end of file){{#test}}
console.log("cash.js tests: ");

console.log("new Cash();");
var cash = [
    new Cash("[1,0]"),
    new Cash([1,001]),
    new Cash(1,99),
    new Cash(12,50),
    new Cash([16,75]),
    new Cash({
        a: 21,
        b: 888,
        dec: 3
    })
];
console.log(cash);

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("cash.add(33,2);");
cash.forEach(function(v, i, a) {
    cash[i] = v.add(33,2);
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("cash.sub(33,2);");
cash.forEach(function(v, i, a) {
    cash[i] = v.sub(33,2);
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("cash.invert();");
cash.forEach(function(v, i, a) {
    cash[i] = v.invert();
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("cash.invert();");
cash.forEach(function(v, i, a) {
    cash[i] = v.invert();
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("cash.clone();");
var c = new Cash(1,99);
console.log(c);
var x = c.clone();
c.a = 0;
c.b = 0;
c.dec = 0;
console.log(c);
console.log(x);

console.log("cash.d(10);");
cash.forEach(function(v, i, a) {
    cash[i] = v.d(10);
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("cash.d(2);");
cash.forEach(function(v, i, a) {
    cash[i] = v.d(2);
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log("Cash.automin(2);");
Cash.automin(2);

console.log("cash.add(33,222);");
cash.forEach(function(v, i, a) {
    cash[i] = v.add(33,222);
});

console.log("cash.toNumber();");
cash.forEach(function(v, i, a) {
    console.log(v.toNumber());
});

console.log('Cash.parse("$12.045");');
console.log(Cash.parse("$12.045").toNumber());

console.log('Cash.parse("12.4$$5");');
console.log(Cash.parse("12.4$$5").toNumber());

console.log('Cash.parse("1,245$");');
console.log(Cash.parse("1,245$").toNumber());

console.log('Cash.parse("$1,000,000");');
console.log(Cash.parse("$1,000,000").toNumber());


console.log('new Cash();');
console.log(new Cash());

//{{/test}}

//{{#umd}}
    return Cash;
}));
//{{/umd}}