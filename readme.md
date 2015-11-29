#Readly

[![npm package](https://nodei.co/npm/readly.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/readly/)

nodejs module for reading files or streams line by line

Readly streams the file and fires events when each line is ready

## usage

Use `require("readly");`
```javascript
var Readly = require("readly");
```

Constructor receives:
* filename - path to a file or a stream
* encoding - optional, default is utf8.
* eol - optional, default is OS newline character. This can set the character to split the file by.
The constrcutor throws an error if filename is a string but the file does not exist
```javascript
var reader = new Readly("filename.txt")
```

Readly publishes two events: 

line - when a new line data is ready

end - when it is done reading

```javascript
reader.on('line', function(line) {
	console.log(line);
});

reader.on('end', function() {
	console.log("done");
});
```

Readly has the following API:
```javascript
read(start, count)
```
`start` - optional, default is 0. how many lines to skip from the begining of the file

`count` - optional, default is until the end of the file. how many lines to read from start. Can also be bigger than the actual number of lines in the file.

Readly also has the convenient methods:
```javascript
readAll()
readFirst(count)
```
example:

`reader.read();` reads all lines from the begining of the file to its end, just like `reader.readAll()`

`reader.read(0, 10)` reads the first 10 lines of a file just like `reader.readFirst(10)`

`reader.read(10,20)` skips the first 10 lines of the file and reads not more than the next 20 lines

### example skipping 3 lines and then reading 4 lines from a file
```javascript
var Readly = require("readly");
var reader = new Readly("filename.txt");
reader.on('line', function(line) {
	console.log(line);
});

reader.on('end', function() {
	console.log("done");
});
reader.read(3, 4);
```
### example reading all lines from a stream
```javascript
var Readly = require("readly");
var fs = require('fs');
var myStream = fs.createReadStream('filename.txt'); //create a stream from any kind of source
var reader = new Readly(myStream);
reader.on('line', function(line) {
	console.log(line);
});
reader.on('end', function() {
	console.log("done");
});
reader.readAll();
```
