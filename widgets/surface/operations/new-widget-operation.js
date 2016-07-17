define(function() {
  
  function NewWidgetOperation() {
    
  }
  
  NewWidgetOperation.prototype.begin = function(widget, position) {
    this.surface.attachWidget(widget, position);
//     this.surfaceWeb.addWidget(widget);
//     this.surfaceWeb.setWidgetPosition(widget.widgetId, this.surface.getWidgetPosition(widget));
    
    this.surface.finishOperation(this);
  }
  
  NewWidgetOperation.prototype.finish = function(position) {
    
  }
  
  return {
    install: function(surface) {
      surface.NewWidgetOperation = NewWidgetOperation;
    },
  }
});