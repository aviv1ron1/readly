var fs = require('fs');
var util = require("util");
var EventEmitter = require("events").EventEmitter;

function Readly(filename, encoding, eol) {
    try {
        stats = fs.lstatSync(filename);
        if (!stats.isFile()) {
            throw new Error("filename is a directory name, not a file. " + filename);
        }
    } catch (e) {
        throw new Error("file does not exist " + filename);
    }
    EventEmitter.call(this);
    if (encoding) {
        this.encoding = encoding;
    } else {
        this.encoding = 'utf-8'
    }
    if (eol) {
        this.eol = eol;
    } else {
        this.eol = require('os').EOL;
    }
    this.filename = filename;
}

util.inherits(Readly, EventEmitter);

Readly.prototype.read = function(start, count) {
    var self = this;
    this.stream = fs.createReadStream(self.filename, {
        flags: 'r',
        encoding: self.encoding,
        fd: null,
        mode: 0666,
        bufferSize: 64 * 1024
    });
    var linesSent = 0;
    var lastLine;
    var finish = function() {
        self.stream.destroy();
        self.emit("end");
    }
    self.stream.on('data', function(data) {
        var currLines = data.split(self.eol);
        if (lastLine) {
            data = lastLine + data;
        }
        var l = data.split(self.eol)
        lastLine = l.pop();
        if (lastLine.indexOf(self.eol) > -1) {
            l.push(lastLine);
            lastLine = null;
        }
        while (start && start > 0 && l.length > 0) {
            l.shift();
            start--;
        }
        if (count) {
            while (l.length > 0 && linesSent < count) {
                linesSent++;
                self.emit("line", l.shift());
            }
        } else {
            while (l.length > 0) {
                self.emit("line", l.shift());
            }
        }
        if (count && linesSent >= count) {
            finish();
        }
    });
    self.stream.on('end', function() {
        if (lastLine && start < 1) {
            self.emit("line", lastLine);
        }
        finish();
    });
}

Readly.prototype.readAll = function() {
    this.read();
}

Readly.prototype.readFirst = function(count) {
    this.read(0, count);
}

module.exports = Readly;
