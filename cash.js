/* cash.js
 * Transaction safe currency object for JavaScript.
 * (c) 2012 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */ var Cash = {};


Cash._strproto = String.prototype; //save String.prototype

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

String.prototype = Cash._strproto; //return String.prototype to it's original state
delete Cash._strproto; //remove the evidence

Cash = function(mixed, cents) { //Cash constructor
    switch(typeof mixed) {
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
        case 'number': //two number arguments
            this.dec = cents.toString().strip(['-', '.']).length; //length of cents
            this.a = mixed;
            this.b = cents;
          break;
    }
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
        _b = '0'.repeat(this.dec - 1) + _b; //append zeros
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

Cash.prototype.add = function(mixed, cents) {
    var _new = new Cash(); //create a new Cash object
    var cash = Cash._(mixed, cents); //parse the arguments
    
    _new.dec = Math.max(this.dec, cash.dec); //set the new decimal place to the greatest decimal place
    var d = Math.pow(10, _new.dec); //get the max value + 1 of the B number
    var p = (this.b + cash.b); //add the B numbers and store as temp P
    _new.a = this.a + cash.a + Math.floor(p / d); //new A number = SUM(all A numbers) + floor(P / D)
    _new.b = p % d; //new B number = P mod D
    
    return _new; //return the new Cash object
};

Cash.prototype.invert = function() {
    return new Cash(this.a * (-1), this.b * (-1)); //invert the cash object
};

Cash.prototype.sub = function(mixed, cents) {
    var cash = Cash._(mixed, cents); //parse the arguments
    
    return this.add(cash.invert()); //invert and then add
};

Cash.prototype.min = function(dec) {
    if(this.dec==dec) {
        return this; //=, return current state
    } else if(this.dec<dec) {
        return this;  //<, return current state
    } else if(this.dec>dec) {
        return new Cash('['+this.toNumber().toFixed(dec).replace('.', ',')+']'); //return a new Cash object limited to dec
    }
};
