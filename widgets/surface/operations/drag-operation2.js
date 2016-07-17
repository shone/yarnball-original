define(function() {
    
  function DragOperation() {
    
  }
  
  DragOperation.prototype.begin = function(widgets) {
    var self = this;
    
    self.widgets        = new Set(widgets);
    self.startPositions = new Map();
    
    self.widgets.forEach(function(widget) {
      self.startPositions.set(widget, self.surface.getWidgetPosition(widget));
    });
  }
  
  DragOperation.prototype.finish = function() {
    
  }
  
  DragOperation.prototype.cancel = function() {
    var self = this;
    self.widgets.forEach(function(widget) {
      surface.setWidgetPosition(widget, self.startPositions.get(widget));
    });
  }
  
  DragOperation.prototype.setDeltaView = function(delta) {
    var self = this;
    self.widgets.forEach(function(widget) {
      var startPosition = self.startPositions.get(widget);
      self.surface.setWidgetPosition(widget, {
        x: startPosition.x + delta.x,
        y: startPosition.y + delta.y,
      });
    });
  }
  
  return {
    install: function(surface) {
      surface.addEventListener('dragStart', function(event) {
        if (surface.canBeginOperation()) {
          surface.beginOperation(DragOperation, [event.target]);
          event.target.addEventListener('touchmove', function(event) {
            debugger;
          });
        }
      });
    }
  }
});