// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['yarnball/core/node', 'yarnball/core/batch', 'yarnball/core/map', 'yarnball/core/str', 'yarnball/core/number'], function(Node, Batch, Map_, Str, Number) {
  
  function SurfaceWeb(web, base) {
    this._web  = web;
    
    if (!base) {
      base = Node();
      web.setLinks([{from: base, via: Is, to: Surface}], []);
      this._base = base;
    } else {
      this._base = base;
    }
  }
  
  var Surface    = Node.fromHex('d78f5b59815a669cb45c022de57d2980');
  var Is         = Node.fromHex('52f9cf0e223d559931856acc98400f21');
  var Name       = Node.fromHex('8216770e8c1ccfb5c58ba2573fd0bf46');
  var Owns       = Node.fromHex('4c8e8ee79a2c4c6e4bd68d9db324d9f4');
  var Widget     = Node.fromHex('31e32c8610ff671d93a4d664d26b21f8');
  var NodeWidget = Node.fromHex('9c9eebc2fa256211d901aef59489923e');
  var Represents = Node.fromHex('262fb8be7b32196d8da05337c2116afa');
  var Connector  = Node.fromHex('b47270cd4c9a491dc1f230ec4a01523e');
  
  var From       = Node.fromHex('96be22fbb74e6934574107e94e5ea694');
  var Via        = Node.fromHex('e999d3deae40585aba30546bdbc77d1c');
  var To         = Node.fromHex('6056f9214eac9efef194de63d978e520');
  
  var Position = Node.fromHex('23852101c8b5798fe8c72e9a668575ef');
  var XAxis    = Node.fromHex('7dba86e48248ff4c115012ff46fe41fe');
  var YAxis    = Node.fromHex('233b57fa8d66698978054e9bd8b116f4');
  
  SurfaceWeb.prototype.destroy = function() {
    var self = this;
    
    var batch = Batch(self._web);
    
    batch.setLinks([], [{from: self._base, via: Is, to: Surface}]);
    
    var existingName = batch.queryOne(this._base, Name, null);
    if (existingName) {
      Str(this._web, existingName).clear();
      batch.setLinks([], [{from: this._base, via: Name, to: existingName}]);
    }
    
    var widgets = self.getWidgets();
    widgets.forEach(function(widget) {
      self.removeWidget(widget, batch);
    });
    
    batch.apply();
  }
  
  SurfaceWeb.prototype.setName = function(name) {
    var batch = Batch(this._web);
    
    var existingName = batch.queryOne(this._base, Name, null);
    if (existingName) {
      Str(batch, existingName).clear();
      batch.setLinks([], [{from: this._base, via: Name, to: existingName}]);
    }
    
    var nameStr = Str(this._web);
    nameStr.set(name);
    var newName = nameStr.getBase();
    batch.setLinks([{from: this._base, via: Name, to: newName}], []);
    
    batch.apply();
  }
  
  SurfaceWeb.prototype.getName = function() {
    var name = this._web.queryOne(this._base, Name, null);
    if (name) {
      return Str(this._web, name).get();
    } else {
      return null;
    }
  }
  
  SurfaceWeb.prototype.getWidgets = function() {
    var self = this;
    var ownedObjects = self._web.query(self._base, Owns, null);
    return ownedObjects.filter(function(ownedObject) {
      return self._web.hasLink(ownedObject, Is, Widget);
    });
  }
  
  SurfaceWeb.prototype.getNodeWidgets = function() {
    var self = this;
    var ownedObjects = self._web.query(self._base, Owns, null);
    return ownedObjects.filter(function(ownedObject) {
      return self._web.hasLink(ownedObject, Is, NodeWidget);
    });
  }
  
  SurfaceWeb.prototype.getConnectors = function() {
    var self = this;
    var ownedObjects = self._web.query(self._base, Owns, null);
    return ownedObjects.filter(function(ownedObject) {
      return self._web.hasLink(ownedObject, Is, Connector);
    });
  }
  
  SurfaceWeb.prototype.addWidget = function(widget) {
    
    if (widget.widgetType !== 'yb-node' && widget.widgetType !== 'yb-connector') {
//       throw 'Cannot add widget to surface-web, unknown widget type: ' + widget.widgetType;
      return;
    }
    
    if (!widget.widgetId) {
      throw 'Cannot add widget to surface-web, widget has no ID.';
    }
    
    var batch = Batch(this._web);
    
    var WidgetProperties = Map_(batch, widget.widgetId);
    
    batch.setLinks([
      {
        from: widget.widgetId,
        via: Is,
        to: Widget,
      },
      {
        from: this._base,
        via: Owns,
        to: widget.widgetId,
      },
    ], []);
    
    if (widget.widgetType === 'yb-node') {
      batch.setLinks([{
        from: widget.widgetId,
        via: Is,
        to: NodeWidget,
      }], []);
      WidgetProperties.set(Represents, Node.fromHex(widget.nodeId));
    } else if (widget.widgetType === 'yb-connector') {
      if (!widget.fromWidget || !widget.viaWidget || !widget.toWidget) {
        throw 'Cannot add connector widget to surface web, from/via/to widgets not attached.';
      }
      if (!widget.fromWidget.widgetId || !widget.viaWidget.widgetId || !widget.toWidget.widgetId) {
        throw 'Cannot add connector widget to surface web, from/via/to widgets do not have widget ids.';
      }
      
      if (!this.hasWidget(widget.fromWidget.widgetId) || !this.hasWidget(widget.viaWidget.widgetId) || !this.hasWidget(widget.toWidget.widgetId)) {
        throw 'Cannot add connector widget to surface web, from/via/to widgets not already present in web.';
      }
        
      batch.setLinks([{
        from: widget.widgetId,
        via: Is,
        to: Connector,
      }], []);
      
      WidgetProperties.set(From, widget.fromWidget.widgetId);
      WidgetProperties.set(Via,  widget.viaWidget.widgetId);
      WidgetProperties.set(To,   widget.toWidget.widgetId);
    }
    
    batch.apply();
  }
  
  SurfaceWeb.prototype.removeWidget = function(Widget_, batch) {
    var usingExternalBatch = Boolean(batch);
    batch = batch || Batch(this._web);
    
    batch.setLinks([], [{
      from: this._base,
      via: Owns,
      to: Widget_,
    }]);
    
    var WidgetProperties = Map_(batch, Widget_);
    
    WidgetProperties.delete(Is, Widget);
    
    if (WidgetProperties.has(Is, NodeWidget)) {
      WidgetProperties.delete(Is, NodeWidget);
      WidgetProperties.delete(Represents);
      
      var Position_ = WidgetProperties.getMap(Position);
      if (Position_) {
        var XAxis_ = Position_.get(XAxis);
        var YAxis_ = Position_.get(YAxis);
        
        if (XAxis_) {
          Number(batch, XAxis_).clear();
          Position_.delete(XAxis);
        }
        if (YAxis_) {
          Number(batch, YAxis_).clear();
          Position_.delete(YAxis);
        }
        
        WidgetProperties.delete(Position);
      }
    } else if (WidgetProperties.has(Is, Connector)) {
      WidgetProperties.delete(Is, Connector);
      WidgetProperties.delete(From);
      WidgetProperties.delete(Via);
      WidgetProperties.delete(To);
    }
    
    if (!usingExternalBatch) {
      batch.apply();
    }
  }
  
  SurfaceWeb.prototype.hasWidget = function(Widget_) {
    return this._web.hasLink(Widget_, Is, Widget);
  }
  
  SurfaceWeb.prototype.getWidgetPosition = function(Widget_) {
    
    var WidgetProperties = Map_(this._web, Widget_);
    
    var WidgetPosition = WidgetProperties.getMap(Position);
    if (!WidgetPosition) {
      throw 'Could not get widget position from web, a position is not specified.';
    }
    
    var WidgetXAxis = WidgetPosition.get(XAxis);
    var WidgetYAxis = WidgetPosition.get(YAxis);
    if (!WidgetXAxis || !WidgetYAxis) {
      throw 'Could not get widget position from web, an X or Y axis is not specified.';
    }
    
    return {
      x: Number(this._web, WidgetXAxis).get(),
      y: Number(this._web, WidgetYAxis).get(),
    }
  }
  
  SurfaceWeb.prototype.setWidgetPosition = function(Widget, position) {
    var batch = Batch(this._web);
    
    var WidgetProperties = Map_(batch, Widget);
    
    var WidgetPosition = Map_(batch, WidgetProperties.getOrMake(Position));
    
    var X = WidgetPosition.hasValidValue(XAxis) ? WidgetPosition.get(XAxis) : null;
    var Y = WidgetPosition.hasValidValue(YAxis) ? WidgetPosition.get(YAxis) : null;
    
    WidgetPosition.set(XAxis, Number(batch, X).set(position.x));
    WidgetPosition.set(YAxis, Number(batch, Y).set(position.y));
    
    batch.apply();
  }
  
  SurfaceWeb.prototype.initializeSurface = function(surface) {
    var self = this;
    
    var NodeWidgets = self.getNodeWidgets();
    NodeWidgets.forEach(function(NodeWidget) {
      var node = self._web.queryOne(NodeWidget, Represents, null);
      if (!node) {
        throw 'Could not get the node being represented by a widget defined in the web.';
      }
      
      var position = self.getWidgetPosition(NodeWidget);
      
      var nodeWidget = surface.createNodeWidget(node, NodeWidget);
      surface.attachWidget(nodeWidget, position);
    });
    
    var Connectors = this.getConnectors();
    Connectors.forEach(function(Connector) {
      
      var connectorProperties = Map_(self._web, Connector);
      
      var from = connectorProperties.get(From);
      var via  = connectorProperties.get(Via);
      var to   = connectorProperties.get(To);
      
      if (!from || !via || !to) {
        throw 'Could not initialize connector from web, from/via/to not specified.';
      }
      
      var fromWidget = surface.getWidgetById(from);
      var viaWidget  = surface.getWidgetById(via);
      var toWidget   = surface.getWidgetById(to);
      
      if (!fromWidget || !viaWidget || !toWidget) {
        throw 'Could not initialize connector from web, from/via/to widgets not found.';
      }
      
      var connector = surface.createConnector(
        {
          from: fromWidget,
          via:  viaWidget,
          to:   toWidget,
        },
        {
          widgetId: Connector,
        }
      );
    });
  }
  
  return function(web, base) {
    return new SurfaceWeb(web, base);
  }
});