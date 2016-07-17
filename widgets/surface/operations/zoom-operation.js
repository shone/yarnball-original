define(function() {
  
  function ZoomOperation() {

  }
  
  ZoomOperation.prototype.begin = function(position, zoomOffset) {
    
//     this.surface.zoomOnPosition(cursorPosView, zoomOffset);
    this.surface.viewRoot.panzoomTowardPosition(position, zoomOffset);
    this.surface.finishOperation(this);
  }
  
  ZoomOperation.prototype.finish = function() {
    
  }
  
  ZoomOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      surface.background.addEventListener('wheel', function(event) {
        if (surface.canBeginOperation()) {
          event.preventDefault();
          
          var position = {
            transformed: {
              x: event.offsetX - surface.viewMargin,
              y: event.offsetY - surface.viewMargin,
            }
          }
          
          var zoomSpeed = null;
          if (event.deltaMode === 0) { // Pixels
            zoomSpeed = 0.08;
          } else if (event.deltaMode === 1) { // Lines
            zoomSpeed = 0.16;
          } else if (event.deltaMode === 2) { // Pages
            zoomSpeed = 0.2;
          } else {
            zoomSpeed = 0.08;
          }
          
          var zoomOffset = (event.deltaY < 0) ? zoomSpeed : -zoomSpeed;
          
          surface.beginOperation(ZoomOperation, position, zoomOffset);
          return false;
        }
      });
    }
  }
  
});
