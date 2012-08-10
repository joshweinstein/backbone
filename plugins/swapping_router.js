Backbone.SwappingRouter = function(options) {
  Backbone.Router.apply(this, [options]);
};

_.extend(Backbone.SwappingRouter.prototype, Backbone.Router.prototype, {
  swap: function(newView) {
    if (this.currentView && this.currentView.leave) this.currentView.leave();

    this.currentView = newView;

    if (this.currentView.isNotInDOM()) {
        this.$el.empty().append(this.currentView.render().el);
    } else {
        this.currentView.render();
    }
    this.currentView.trigger('afterInsertedIntoDOM');
  }
});

Backbone.SwappingRouter.extend = Backbone.Router.extend;
