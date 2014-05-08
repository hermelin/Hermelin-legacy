if (typeof ui == 'undefined') var ui = {};
ui.RetweetView = {

  destroy_view: function destroy_view(view) {
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
  },

  load: function load_retweets_of_me(view, success, fail) {
    globals.twitterClient.get_retweets_of_me(
      view.since_id, null, conf.vars.items_per_request, success);
  },

  loadmore: function load(view, success, fail) {
    globals.twitterClient.get_retweets_of_me(
      null, view.max_id, conf.vars.items_per_request, success);
  }

};