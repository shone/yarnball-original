if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['./node_id'], function(node_id) {
  
  function Web() {
    this.nodeNames = new Map();
    this.links     = new Set();
    
    this._onNodeNames = new Set();
    this._onLinks     = new Set();
  }
  
  Web.prototype.getNodes = function() {
    return Array.from(this.nodeNames.keys(), function(entry) {
      return node_id.fromMapKey(entry);
    });
  }
  
  Web.prototype.getNodeNames = function() {
    return Array.from(this.nodeNames.entries(), function(entry) {
      return {id: node_id.fromMapKey(entry[0]), name: entry[1]};
    });
  }
  
  Web.prototype.setNodeNames = function(nodes) {
    var self = this;
    self.nodeNames.clear();
    nodes.forEach(function(node) {
      self.nodeNames.set(node_id.toMapKey(node.id), node.name);
    });
    this._notifyNodeNames();
  }
  
  Web.prototype.setNodeName = function(id, name) {
    var nodeKey = node_id.toMapKey(id);
    if (this.nodeNames.get(nodeKey) !== name) {
      this.nodeNames.set(nodeKey, name);
      this._notifyNodeNames([{id: id, name: name}]);
    }
  }
  
  Web.prototype.hasNodeName = function(id) {
    return this.nodeNames.has(node_id.toMapKey(id));
  }
  
  Web.prototype.getNodeName = function(nodeId) {
    var mapKey = node_id.toMapKey(nodeId);
    if (!this.nodeNames.has(mapKey)) {
      return "";
    } else {
      return this.nodeNames.get(mapKey);
    }
  }
  
  Web.prototype.addNewNode = function(name) {
    var id = node_id.make();
    this.nodeNames.set(node_id.toMapKey(id), name);
    var node = {id: id, name: name};
    this._notifyNodeNames([node]);
    return node;
  }
  
  Web.prototype.onNodeNames = function(callback) {
    this._onNodeNames.add(callback);
  }
  
  Web.prototype.setLink = function(link) {
    var linkKey = node_id.linkToKey(link);
    if (!this.links.has(linkKey)) {
      this.links.add(linkKey);
      this._notifyLinks([link], []);
    }
  }
  
  Web.prototype.unsetLink = function(link) {
    var linkKey = node_id.linkToKey(link);
    if (this.links.has(linkKey)) {
      this.links.delete(linkKey);
      this._notifyLinks([], [link]);
    }
  }
  
  Web.prototype.hasLink = function(from, via, to) {
    return this.links.has(node_id.toHex(from) +
                          node_id.toHex(via) +
                          node_id.toHex(to));
  }
  
  Web.prototype.getLinks = function() {
    return Array.from(this.links.values(), function(key) {
      return node_id.linkFromKey(key);
    });
  }
  
  Web.prototype.setLinks = function(links) {
    var self = this;
    var linkKeys = new Set(links.map(function(link) {
      return node_id.linkToKey(link);
    }));
    var linksAdded   = [];
    var linksRemoved = [];
    linkKeys.forEach(function(linkKey) {
      if (!self.links.has(linkKey)) {
        linksAdded.push(linkKey);
      }
    });
    self.links.forEach(function(linkKey) {
      if (!linkKeys.has(linkKey)) {
        linksRemoved.push(node_id.linkFromKey(linkKey));
      }
    });
    self.links = linkKeys;
    self._notifyLinks(linksAdded, linksRemoved);
  }
  
  Web.prototype.onLinks = function(callback) {
    this._onLinks.add(callback);
  }
  
  Web.prototype._notifyNodeNames = function(nodes) {
    if (typeof nodes === 'undefined') {
      nodes = this.getNodeNames();
    }
    var callbacks = new Set(this._onNodeNames);
    callbacks.forEach(function(callback) {
      callback(nodes);
    });
  }
  
  Web.prototype._notifyLinks = function(linksAdded, linksRemoved) {
    var callbacks = new Set(this._onLinks);
    callbacks.forEach(function(callback) {
      callback(linksAdded, linksRemoved);
    });
  }
  
  return function() {
    return new Web();
  }
});
