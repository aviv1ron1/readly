var Readly = require("./readly.js");
var fs = require('fs');
var reader = new Readly("test.txt");
var strm;

console.log("read all:")

reader.on('line', function(line) {
    console.log(line);
});

var c3 = function() {
    console.log("_________________ now with stream instead of filename");
    strm = fs.createReadStream('test.txt');
    reader = new Readly(strm);
    reader.on('line', function(line) {
        console.log(line);
    });
    reader.readAll();
}

var c2 = function() {
    reader.removeListener('end', c2);
    reader.on('end', c3);
    console.log("-----------------");
    console.log("skip 3 read 3:")
    reader.read(3, 3);
}


var c1 = function() {
    reader.removeListener('end', c1);
    reader.on('end', c2);
    console.log("-----------------");
    console.log("read first 3:")
    reader.readFirst(3);
}

reader.on('end', c1);

reader.read();
