var keyboard = {
  
  paths: {},
  
  layouts: [],
  
  reloadLayoutList: function reloadLayoutList(cb){
    util.loadJSON('../keyboard/layouts.json', function(paths){
      keyboard.paths = paths;
      cb();
    }, function(error){
      hermelin_log(error);
    });
  },
  
  loadLayouts: function loadLayouts(cb){
    keyboard.reloadLayoutList(function(){
      var l = Object.keys(keyboard.paths).length;
      var i = 0;
      keyboard.layouts = [];
      for(var lname in keyboard.paths){
        var path = keyboard.paths[lname];
        util.loadJSON(('../keyboard/' + path), buildSuccess(lname, path), function(error){
          hermelin_log(error);
          i++;
          if(i === l){
            cb();
          }
        });
      }
      function success(name, path, layout) {
        layout.name = name;
        layout.path = path;
        keyboard.layouts.push(layout);
        i++;
        if (i === l) {
          cb();
        }
      }
      function buildSuccess(name, path) {
        return function (layout) {
          success(name, path, layout);
        };
      }
    });
  },
  
  useLayout: function useLayout(layout, noname){
    if(keyboard.validateLayout(layout, noname)){
      keyboard.registerLayout(layout, 'navigation');
      keyboard.registerLayout(layout, 'actions');
      return true;
    } else{
      return false;
    }
  },
  
  registerLayout: function registerLayout(layout, layout_set) {
    for (var part in layout[layout_set]) {
      var sequence = layout[layout_set][part];
      var action = keyboard.layout_functions[layout_set][part].action;
      var flags = keyboard.layout_functions[layout_set][part].flags || '';
      hotkey.unregister(part);
      if (sequence && typeof sequence === 'string' && action) {
        hotkey.register(part, sequence, flags, action);
      }
    }
  },
  
  validateLayout: function validateLayout(layout, noname){
    if((noname || layout.name) &&
       layout.navigation &&
       layout.actions){
      return true;
    } else{
      return false;
    }
  },
  
  layout_functions: {
    navigation: {
      quit: {
        flags: 'gm',
        action: function quit_action() {
          quit();
        },
        name: 'keyboard_navigation_quit'
      },
      help_page: {
        flags: 'g',
        action: function help_page_action() {
          globals.about_dialog.open();
        },
        name: 'keyboard_navigation_help_page'
      },
      timeline_reload: {
        action: function timeline_reload_action() {
          toast.set('Loading Tweets...').show(-1);
          daemon.update_all();
        },
        name: 'keyboard_navigation_timeline_reload'
      },
      compose_tweet: {
        action: function compose_tweet_action() {
          ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
          ui.StatusBox.set_status_text('');
          ui.StatusBox.open();
        },
        name: 'keyboard_navigation_compose_tweet'
      },
      slide_left: {
        action: function slide_left_action() {
          ui.Slider.slide_to_prev();
        },
        name: 'keyboard_navigation_slide_left'
      },
      slide_right: {
        action: function slide_right_action() {
          ui.Slider.slide_to_next();
        },
        name: 'keyboard_navigation_slide_right'
      },
      move_down: {
        action: function move_down_action() {
          ui.Main.move_to_tweet("next");
        },
        name: 'keyboard_navigation_select_next'
      },
      move_up: {
        action: function move_up_action() {
          ui.Main.move_to_tweet("prev");
        },
        name: 'keyboard_navigation_select_previous'
      },
      move_top: {
        action: function move_top_action() {
          ui.Main.move_to_tweet("top");
        },
        name: 'keyboard_navigation_select_first'
      },
      move_bottom: {
        action: function move_bottom_action() {
          ui.Main.move_to_tweet("bottom");
        },
        name: 'keyboard_navigation_select_last'
      },
      slide_home: {
        action: function slide_home_action() {
          ui.Slider.slide_to('home');
        },
        name: 'keyboard_navigation_slide_home'
      },
      slide_interactions: {
        action: function slide_interactions_action() {
          ui.Slider.slide_to('mentions');
        },
        name: 'keyboard_navigation_slide_mentions'
      },
      slide_direct_messages: {
        action: function slide_direct_messages_action() {
          ui.Slider.slide_to('messages');
        },
        name: 'keyboard_navigation_slide_messages'
      },
      slide_retweets: {
        action: function slide_retweets_action() {
          ui.Slider.slide_to('retweets');
        },
        name: 'keyboard_navigation_slide_retweets'
      },
      slide_search: {
        action: function slide_search_action() {
          ui.Slider.slide_to('search');
        },
        name: 'keyboard_navigation_slide_search'
      },
      open_tweet_finder: {
        action: function open_tweet_finder_action() {
          ui.Finder.show();
        },
        name: 'keyboard_navigation_open_tweet_finder'
      },
      close_view: {
        action: function close_view_action() {
          if (ui.Slider.current != "home" && ui.Slider.current != "mentions" && ui.Slider.current != "search") {
            ui.Main.destroy_view(ui.Main.views[ui.Slider.current]);
          }
        },
        name: 'keyboard_navigation_close_column'
      }
    },
    actions: {
      reply: {
        action: function reply_action() {
          if (ui.Main.selected_tweet_id != null) {
            //@TODO remove all jquery so you can set the ID to the actual ID and remove the quickfix 2
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_reply_click(null, ui.Main.selected_tweet_id, null);
            }
          }
        },
        name: 'reply'
      },
      reply_all: {
        action: function reply_all_action() {
          if (ui.Main.selected_tweet_id != null) {
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_reply_all_click(null, ui.Main.selected_tweet_id, null);
            }
          }
        },
        name: 'reply_all'
      },
      quote: {
        action: function quote_action() {
          if (ui.Main.selected_tweet_id != null) {
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_rt_click(null, ui.Main.selected_tweet_id, null);
            }
          }
        },
        name: 'quote'
      },
      fav_unfav: {
        action: function fav_unfav_action() {
          if (ui.Main.selected_tweet_id != null) {
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_fav_click(this, ui.Main.active_tweet_id, event);
            }
          }
        },
        name: _('keyboard_action_fav_unfav')
      },
      retweet_unretweet: {
        action: function retweet_unretweet_action() {
          if (ui.Main.selected_tweet_id != null) {
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, event);
            }
          }
        },
        name: _('keyboard_action_retweet_unretweet') || 'Retweet/Unretweet'
      },
      delete_tweet: {
        action: function delete_tweet_action() {
          if (ui.Main.selected_tweet_id != null) {
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_del_click(this, ui.Main.active_tweet_id, event);
            }
          }
        },
        name: 'delete'
      },
      send_message: {
        action: function send_message_action() {
          if (ui.Main.selected_tweet_id != null) {
            var current = document.getElementById(ui.Main.selected_tweet_id2);
            if (current.length != 0) {
              ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
            }
          }
        },
        name: 'send_message'
      },
      open_user_profile: {
        action: function open_user_profile_action() {
          ui.Main.on_open_people_btn_click(null, ui.Main.selected_tweet_id, null);
        },
        name: 'keyboard_action_open_user_profile'
      },
      open_first_link: {
        action: function open_first_link_action() {
          ui.Main.on_open_link_btn_click(null, ui.Main.selected_tweet_id, null);
        },
        name: 'keyboard_action_open_first_link'
      },
      fold_unfold_conversation: {
        action: function fold_unfold_conversation_action() {
          if (ui.Main.selected_tweet_id != null) {
            var btn = document.getElementById(ui.Main.selected_tweet_id2).getElementsByClassName('btn_tweet_thread')[0];
            if (btn.style.display !== 'none') {
              btn.click();
            }
          }
        },
        name: 'keyboard_action_fold_unfold_conversation'
      }
    }
  }
};