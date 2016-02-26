// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', 'fs', 'readline'], function(Node, fs, readline) {
  
  function WebFile(namesPath, linksPath) {
    this.namesPath = namesPath;
    this.linksPath = linksPath;
  }
  
  WebFile.prototype.getNames = function(callback) {
    var names = [];
    var namesStream = fs.createReadStream(this.namesPath);
    readline.createInterface({
      input: namesStream,
      output: process.stdout,
      terminal: false
    })
    .on('line', function(line) {
      if (line.length > 32) {
        var hexString = line.slice(0, 32);
        var name = line.slice(33);
        names.push({
          id: Node.fromHex(hexString),
          name: name,
        });
      }
    })
    .on('close', function() {
      callback(names);
    });
  }
  
  WebFile.prototype.getLinks = function(callback) {
    var links = [];
    var linksStream = fs.createReadStream(this.linksPath);
    readline.createInterface({
      input: linksStream,
      output: process.stdout,
      terminal: false
    })
    .on('line', function(line) {
      if (line.length >= 32 + 1 + 32 + 1 + 32) {
        var fromString = line.slice(0, 32);
        var viaString  = line.slice(32 + 1, 32 + 1 + 32);
        var toString   = line.slice(32 + 1 + 32 + 1, 32 + 1 + 32 + 1 + 32);
        links.push({
          from: Node.fromHex(fromString),
          via:  Node.fromHex(viaString),
          to:   Node.fromHex(toString),
        });
      }
    })
    .on('close', function() {
      callback(links);
    });
  }
  
  return function(namesPath, linksPath) {
    return new WebFile(namesPath, linksPath);
  }
  
});
