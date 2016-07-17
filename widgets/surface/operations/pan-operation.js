define(function() {
  
  function PanOperation() {

  }
  
  PanOperation.prototype.begin = function(event) {
    var self = this;
    self.surface.captureMouse(event, {
      cursor: '-webkit-grabbing',
      mousemove: function(options) {
        self.surface.viewRoot.panOffset(options.currentDeltaPage);
//         self.surface.moveView(options.currentDeltaPage);
      },
      mouseup: function() {
        self.surface.finishOperation(self);
      },
    });
  }
  
  PanOperation.prototype.finish = function() {
    
  }
  
  PanOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      surface.background.addEventListener('mousedown', function(event) {
        if (event.button === 1 || (event.button === 0 && event.metaKey)) {
          if (surface.canBeginOperation()) {
            event.preventDefault();
            surface.beginOperation(PanOperation, event);
            return false;
          }
        }
      });
    }
  }
  
});
