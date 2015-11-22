#Readly

nodejs module for reading files line by line

Readly streams the file and fires events when each line is ready

## usage

Use `require("readly");`
```javascript
var Readly = require("readly");
```

Constructor receives:
* filename - path to file
* encoding - optional, default is utf8.
* eol - optional, default is OS newline char character. This can set the character to split the file by.
The constrcutor throws an error if filename is not a file or does not exist
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





