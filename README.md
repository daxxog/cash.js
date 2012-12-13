cash.js
=======

Transaction safe currency object for JavaScript.

npm Install
-----------
```bash
npm install https://github.com/daxxog/cash.js/tarball/master
```

Usage
-------------
```javascript
var cash = new Cash(50,75), //50.75
    cashh = new Cash(50,7), //50.07
    cashhh = new Cash(50,70); //50.70

console.log(cash.invert().toNumber()); //-50.75
console.log(cash.add(cashh).toNumber()); //100.82
console.log(cash.sub(cashhh).toNumber()); //0.05
```