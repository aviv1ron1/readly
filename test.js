var Readly = require("./readly.js");
var fs = require('fs');
var stream = require('stream');
var reader = new Readly.Emitter("test.txt");
var strm;

console.log("read all:")

reader.on('line', function(line) {
    console.log(line);
});

var c3 = function() {
    console.log("_________________ now with stream instead of filename");
    strm = fs.createReadStream('test.txt', {
        encoding: 'utf8'
    });
    reader = new Readly.Emitter(strm);
    reader.on('line', function(line) {
        console.log(line);
    });
    reader.on('end', function() {
        console.log('____________________________ now as transform string');
        fs.createReadStream('test.txt').pipe(new Readly.Transform()).on('end', function() {
            console.log("\r\nEND")
        }).pipe(process.stdout);
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
