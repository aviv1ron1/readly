var fs = require('fs');
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var stream = require('stream');
var Transform = stream.Transform;


function ReadlyEvent(filename, encoding, eol) {
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
    if (typeof filename === "string") {
        try {
            stats = fs.lstatSync(filename);
            if (!stats.isFile()) {
                throw new Error("filename is a directory name, not a file. " + filename);
            }
            this.filename = filename;
        } catch (e) {
            throw new Error("file does not exist " + filename);
        }
    } else {
        this.stream = filename;
        this.stream.setEncoding(this.encoding);
    }
    EventEmitter.call(this);
    this.linesSent = 0;
    this.lastLine;
    this.start;
    this.count;
}

util.inherits(ReadlyEvent, EventEmitter);
util.inherits(ReadlyTransform, Transform);

function ReadlyTransform(opts) {
    Transform.call(this, opts);
    if (opts && opts.encoding) {
        this.encoding = opts.encoding;
    } else {
        this.encoding = 'utf-8'
    }
    if (opts && opts.eol) {
        this.eol = opts.eol;
    } else {
        this.eol = require('os').EOL;
    }
    this.lastLine;
    this.start = 0;
    this.count;
    this.linesSent = 0;
}



function handle(self, data, callback, finish) {
    if (typeof data !== "string") {
        data = data.toString();
    }
    var currLines = data.split(self.eol);
    if (self.lastLine) {
        data = self.lastLine + data;
    }
    var l = data.split(self.eol)
    self.lastLine = l.pop();
    if (self.lastLine.indexOf(self.eol) > -1) {
        l.push(self.lastLine);
        self.lastLine = null;
    }
    while (self.start && self.start > 0 && l.length > 0) {
        l.shift();
        self.start--;
    }
    if (l.length) {
        if (self.count) {
            while (l.length > 0 && self.linesSent < self.count) {
                self.linesSent++;
                callback(l.shift(), l.length);
            }
        } else {
            while (l.length > 0) {
                callback(l.shift(), l.length);
            }
        }
    } else {
        callback(null, 0);
    }
    if (self.count && self.linesSent >= self.count) {
        if (finish) {
            finish();
        }
    }
}

ReadlyTransform.prototype._transform = function(chunk, enc, callback) {
    var self = this;
    handle(this, chunk, function(line, left) {
        if (line) {
            self.push(line);
        }
        if (!left) {
            callback();
        }
    });
};

ReadlyTransform.prototype._flush = function(callback) {
    if (this.lastLine) {
        this.push(this.lastLine);
        callback();
    }
}

ReadlyEvent.prototype.read = function(start, count) {
    var self = this;
    if (this.filename) {
        this.stream = fs.createReadStream(self.filename, {
            flags: 'r',
            encoding: self.encoding,
            fd: null,
            mode: 0666,
            bufferSize: 64 * 1024
        });
    }
    if (!start) {
        start = 0;
    }
    self.start = start;
    self.count = count;
    var finish = function() {
        if (self.filename) {
            self.stream.destroy();
        }
        self.linesSent = 0;
        self.start = undefined;
        self.count = undefined;
        self.lastLine = undefined;
        self.emit("end");
    }
    self.stream.on('data', function(data) {
        handle(self, data, function(line) {
            if (line) {
                self.emit("line", line);
            }
        }, finish);
    });
    self.stream.on('end', function() {
        if (self.lastLine && self.start < 1) {
            self.emit("line", self.lastLine);
        }
        finish();
    });
}

ReadlyEvent.prototype.readAll = function() {
    this.read();
}

ReadlyEvent.prototype.readFirst = function(count) {
    this.read(0, count);
}

module.exports = {
    Emitter: ReadlyEvent,
    Transform: ReadlyTransform
}
