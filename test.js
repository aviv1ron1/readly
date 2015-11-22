var Readly = require("./readly.js");

var reader = new Readly("test.txt");

console.log("read all:")

reader.on('line', function(line) {
    console.log(line);
});

var c3 = function() {
    console.log("_________________");
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
