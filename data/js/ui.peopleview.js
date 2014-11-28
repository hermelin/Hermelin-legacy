if (typeof ui == 'undefined') var ui = {};
ui.PeopleView = {

  relation_map: {},

  relation_icon_set: [' ', '&infin; ', '&ni; ', '&isin; ', '&empty; '],

  init: function init() {
    ui.PeopleView.update_trans();
  },

  update_trans: function update_trans(argument) {
    ui.PeopleView.relation_map = {
      0: _('hey_it_is_you'),
      1: _('you_are_friends'),
      2: _('you_are_followed_by_them'),
      3: _('you_are_following'),
      4: _('you_are_not_following_each_other')
    };
  },

  init_view: function init_view(view) {
    ui.PeopleView.update_trans();
    var vcard = view.__header.getElementsByClassName('people_vcard')[0];
    var toggle = view.__header.getElementsByClassName('people_view_toggle')[0];
    var sub_view_btns = toggle.getElementsByClassName('mochi_button_group_item');

    var sub_view_btns_onclick_function = function (event) {
      var pagename = this.getAttribute('href').substring(1);
      var thismenu;
      switch (pagename) {
      case 'list':
        thismenu = toggle.getElementsByClassName('lists_menu')[0];
        thismenu.style.display = (thismenu.style.display == 'block') ? 'none' : 'block';
        break;

      case 'people':
        thismenu = toggle.getElementsByClassName('people_menu')[0];
        thismenu.style.display = (thismenu.style.display == 'block') ? 'none' : 'block';
        break;

      default:
        for (var j = 0; j < sub_view_btns.length; j++) {
          if (sub_view_btns[j] !== this) {
            sub_view_btns[j].classList.remove('selected');
          } else {
            sub_view_btns[j].classList.add('selected');
          }
        }
        ui.PeopleView.switch_sub_view(view, pagename);
      }
      return false;
    };

    for (var i = 0; i < sub_view_btns.length; i++) {
      sub_view_btns[i].onclick = sub_view_btns_onclick_function;
    }

    vcard.getElementsByClassName('vcard_profile_img')[0].onclick = function () {
      ui.Previewer.reload(this.getAttribute('href'));
      ui.Previewer.open();
      return false;
    };

    vcard.getElementsByClassName('vcard_showstats')[0].onmouseover = function () {
      util.fadeOut(vcard.getElementsByClassName('vcard_bio')[0], {
        'noAnim': true
      });
      util.fadeIn(vcard.getElementsByClassName('vcard_stats')[0], {
        'speed': 200
      });
    };

    vcard.getElementsByClassName('vcard_showstats')[0].onmouseout = function () {
      util.fadeIn(vcard.getElementsByClassName('vcard_bio')[0], {
        'speed': 200
      });
      util.fadeOut(vcard.getElementsByClassName('vcard_stats')[0], {
        'noAnim': true
      });
    };

    vcard.getElementsByClassName('vcard_follow')[0].onclick = function (event) {
      var _this = this;
      if (this.classList.contains('unfo')) {
        toast.set(_('unfollow_at') + view.screen_name + ' …').show();

        globals.twitterClient.destroy_friendships(view.screen_name, function () {

          toast.set(_('unfollow_at') + view.screen_name + ' Successfully!').show();

          _this.textContent = _('follow');
          _this.classList.remove('unfo');
          _this.classList.add('blue');

        });
      } else {
        toast.set(_('follow_at') + view.screen_name + ' …').show();

        globals.twitterClient.create_friendships(view.screen_name, function () {

          toast.set(_('follow_at') + view.screen_name + ' Successfully!').show();

          _this.textContent = _('unfollow');
          _this.classList.add('unfo');
          _this.classList.remove('blue');

        });
      }
    };

    vcard.getElementsByClassName('vcard_edit')[0].onclick = function (event) {
      ui.ProfileDlg.request_profile();
      globals.profile_dialog.open();
    };

    var people_action_more_menu = vcard.getElementsByClassName('people_action_more_menu')[0];

    vcard.getElementsByClassName('people_action_more_trigger')[0].onmouseleave = function () {
      people_action_more_menu.style.display = 'none';
    };

    vcard.getElementsByClassName('vcard_more')[0].onclick = function () {
      people_action_more_menu.style.display = (people_action_more_menu.style.display == 'block') ? 'none' : 'block';
    };

    vcard.getElementsByClassName('mention_menu_item')[0].onclick = function (event) {
      ui.StatusBox.set_status_text('@' + view.screen_name + ' ');
      ui.StatusBox.open(function () {
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
      });

      people_action_more_menu.style.display = 'none';
      return false;
    };

    vcard.getElementsByClassName('message_menu_item')[0].onclick = function (event) {
      ui.StatusBox.set_dm_target(view.screen_name);
      ui.StatusBox.set_status_text('');
      ui.StatusBox.open(function () {
        ui.StatusBox.change_mode(ui.StatusBox.MODE_DM);
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
      });
      people_action_more_menu.style.display = 'none';
      return false;
    };

    vcard.getElementsByClassName('add_to_list_menu_item')[0].onclick = function (event) {
      var owned_lists = [];
      for (var j = 0; j < globals.my_lists.length; j++) {
        if (globals.my_lists[j].user.screen_name === globals.myself.screen_name) {
          owned_lists.push(globals.my_lists[j]);
        }
      }
      if (owned_lists.length > 0) {
        ui.AddToListDlg.load(view.screen_name);
        globals.add_to_list_dialog.open();
      } else {
        //user has no lists
        toast.set(_('you_dont_have_lists_yet')).show();
      }
    };

    vcard.getElementsByClassName('block_menu_item')[0].onclick = function (event) {
      if (!confirm('Are you sure you want to block @' + view.screen_name + '?\n'))
        return;
      toast.set('Block @' + view.screen_name + ' …').show();
      globals.twitterClient.create_blocks(view.screen_name, function (result) {
        toast.set('Block @' + result.screen_name + ' Successfully!').show();
        globals.blocking_ids.push(result.id_str);
      });
      people_action_more_menu.style.display = 'none';
    };

    vcard.getElementsByClassName('unblock_menu_item')[0].onclick = function (event) {
      toast.set('Unblock @' + view.screen_name + ' …').show();
      globals.twitterClient.destroy_blocks(view.screen_name, function (result) {
        toast.set('Unblock @' + result.screen_name + ' Successfully').show();
        var pos = globals.blocking_ids.indexOf(result.id_str);
        if (pos !== -1) {
          globals.blocking_ids.splice(pos, 1);
        }
        //TODO filter tweets by blocked user out of the (currently loaded) tweets in home/messages/dms
      });
      people_action_more_menu.style.display = 'none';
    };

    vcard.getElementsByClassName('report_spam_menu_item')[0].onclick = function (event) {
      if (!confirm('Are you sure you want to block them and report for spam?'))
        return;
      toast.set('Reporting @' + view.screen_name + ' for spam…').show();
      globals.twitterClient.create_blocks(view.screen_name, function () {
        toast.set('Reported @' + view.screen_name + ' for spam Successfully').show();
      });
      people_action_more_menu.style.display = 'none';
    };

    var people_menu = toggle.getElementsByClassName('people_menu')[0];

    toggle.getElementsByClassName('people_view_people_trigger').onmouseleave = function () {
      people_menu.style.display = 'none';
    };

    people_menu.getElementsByClassName('followers_menu_item')[0].onclick = function () {
      view.is_trim = false;
      view.item_type = 'cursor';
      view.cursor = '';
      view.former = ui.Template.form_people;
      view._load = ui.PeopleView.load_follower;
      view._loadmore = ui.PeopleView.loadmore_follower;
      view._load_success = ui.Main.load_people_success;
      view._loadmore_success = ui.Main.loadmore_people_success;

      people_menu.style.display = 'none';
      for (var j = 0; j < sub_view_btns.length; j++) {
        sub_view_btns[j].classList.remove('selected');
      }
      this.parentNode.parentNode.parentNode.getElementsByClassName('people_view_people_btn')[0].classList.add('selected');
      view.clear();
      view.load();

      return false;
    };

    people_menu.getElementsByClassName('friends_menu_item')[0].onclick = function () {
      view.is_trim = false;
      view.item_type = 'cursor';
      view.cursor = '';
      view.former = ui.Template.form_people;
      view._load = ui.PeopleView.load_friend;
      view._loadmore = ui.PeopleView.loadmore_friend;
      view._load_success = ui.Main.load_people_success;
      view._loadmore_success = ui.Main.loadmore_people_success;

      people_menu.style.display = 'none';
      for (var j = 0; j < sub_view_btns.length; j++) {
        sub_view_btns[j].classList.remove('selected');
      }
      this.parentNode.parentNode.parentNode.getElementsByClassName('people_view_people_btn')[0].classList.add('selected');
      view.clear();
      view.load();
      return false;
    };

    var lists_menu = toggle.getElementsByClassName('lists_menu')[0];
    toggle.getElementsByClassName('people_view_list_trigger')[0].onmouseleave = function () {
      lists_menu.style.display = 'none';
    };

    lists_menu.getElementsByClassName('user_lists_menu_item')[0].onclick = function () {
      view.is_trim = false;
      view.item_type = 'cursor';
      view.cursor = '';
      view.former = ui.Template.form_list;
      view._load = ui.PeopleView.load_lists;
      view._loadmore = null;
      view._load_success = ui.Main.load_list_success;
      view._loadmore_success = null;
      lists_menu.style.display = 'none';
      for (var j = 0; j < sub_view_btns.length; j++) {
        sub_view_btns[j].classList.remove('selected');
      }
      this.parentNode.parentNode.parentNode.getElementsByClassName('people_view_list_btn')[0].classList.add('selected');
      view.clear();
      view.load();
      return false;
    };

    lists_menu.getElementsByClassName('listed_lists_menu_item')[0].onclick = function () {
      view.is_trim = false;
      view.item_type = 'cursor';
      view.cursor = '';
      view.former = ui.Template.form_list;
      view._load = ui.PeopleView.load_listed_lists;
      view._loadmore = ui.PeopleView.loadmore_listed_lists;
      view._load_success = ui.Main.load_listed_list_success;
      view._loadmore_success = ui.Main.loadmore_listed_list_success;
      lists_menu.style.display = 'none';
      for (var j = 0; j < sub_view_btns.length; j++) {
        sub_view_btns[j].classList.remove('selected');
      }
      this.parentNode.parentNode.parentNode.getElementsByClassName('people_view_list_btn')[0].classList.add('selected');
      view.clear();
      view.load();
      return false;
    };

    lists_menu.getElementsByClassName('create_list_menu_item')[0].onclick = function () {
      ui.ListAttrDlg.load(globals.myself.screen_name, '');
      globals.list_attr_dialog.open();
      lists_menu.style.display = 'none';
      return false;
    };

    view.__header.getElementsByClassName('expand')[0].onclick = function () {
      var vcard = this.parentNode.parentNode.getElementsByClassName('people_vcard')[0];
      if (this.classList.contains('open')) {
        this.classList.remove('open');
        vcard.style.overflow = 'hidden';
        vcard.classList.remove('open');
        setTimeout(function () {
          if (!vcard.classList.contains('open')) {
            vcard.style.display = 'none';
          }
        }, 200);
      } else {
        this.classList.add('open');
        vcard.style.display = 'block';
        setTimeout(function () {
          vcard.style.overflow = 'visible';
          vcard.classList.add('open');
        }, 1);
      }
    };
  },

  destroy_view: function destroy_view(view) {
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
  },

  switch_sub_view: function switch_sub_view(view, name) {
    switch (name) {
    case 'tweet':
      view.is_trim = true;
      view.item_type = 'id';
      view.since_id = 1;
      view.former = ui.Template.form_tweet;
      view._load = ui.PeopleView.load_timeline_full;
      view._loadmore = ui.PeopleView.loadmore_timeline;
      view._load_success = ui.Main.load_tweet_success;
      view._loadmore_success = ui.Main.loadmore_tweet_success;
      break;
    case 'fav':
      view.is_trim = false;
      view.item_type = 'page';
      view.page = 1;
      view.former = ui.Template.form_tweet;
      view._load = ui.PeopleView.load_fav;
      view._loadmore = ui.PeopleView.loadmore_fav;
      view._load_success = ui.Main.load_tweet_success;
      view._loadmore_success = ui.Main.loadmore_tweet_success;
      break;
    default:
      break;
    }
    view.clear();
    view.load();
  },

  get_relationship: function get_relationship(screen_name, callback) {
    if (screen_name === globals.myself.screen_name) {
      callback(0);
    } else {
      globals.twitterClient.show_friendships(
        screen_name, globals.myself.screen_name, function (result) {
        var relation = 0;
        var source = result.relationship.source;
        if (source.following && source.followed_by) {
          relation = 1;
        } else if (source.following && !source.followed_by) {
          relation = 2;
        } else if (!source.following && source.followed_by) {
          relation = 3;
        } else {
          relation = 4;
        }
        callback(relation);
      });
    }
  },

  render_people_view: function render_people_view(self, user_obj, proc) {
    var btn_follow = self.__header.getElementsByClassName('vcard_follow')[0];
    var btn_edit = self.__header.getElementsByClassName('vcard_edit')[0];
    var menu_separator = self.__header.getElementsByClassName('separator')[0];
    var menu_block = self.__header.getElementsByClassName('block_menu_item')[0];
    var menu_unblock = self.__header.getElementsByClassName('unblock_menu_item')[0];
    var menu_reportspam = self.__header.getElementsByClassName('report_spam_menu_item')[0];
    var btn_request = self.__header.getElementsByClassName('people_request_btn')[0];
    var request_hint = self.__header.getElementsByClassName('people_request_hint')[0];
    var toggle_btns = self.__header.getElementsByClassName('people_view_toggle')[0];
    btn_follow.style.display = 'block'
    ui.Template.fill_people_vcard(user_obj, self.__header);
    db.dump_users([user_obj]);
    self.__header.getElementsByClassName('create_list_menu_item')[0].style.display = 'none';
    if (user_obj.screen_name === globals.myself.screen_name) {
      btn_edit.style.display = 'block'
      btn_follow.style.display = 'none';
      menu_separator.style.display = 'none';
      menu_block.style.display = 'none';
      menu_unblock.style.display = 'none';
      menu_reportspam.style.display = 'none';
      self.__header.getElementsByClassName('create_list_menu_item')[0].style.display = 'block'
      proc();
      self.protected_user = false;
    } else {
      if (user_obj.protected && !user_obj.following) {
        // not friend and user protect his tweets,
        // then hide follow btn.
        btn_follow.style.display = 'none';
        // and display request box.
        toggle_btns.style.display = 'none';
        request_hint.style.display = 'block'
        btn_request.setAttribute('href', conf.get_current_profile().preferences.base_url + user_obj.screen_name);
        self.protected_user = true;
      } else {
        btn_follow.textContent = _('follow');
        btn_follow.classList.remove('unfo');
        proc();
        self.protected_user = false;
      }
    }
    ui.PeopleView.get_relationship(user_obj.screen_name, function (rel) {
      self.__header.getElementsByClassName('vcard_relation')[0].textContent =
        ui.PeopleView.relation_map[rel];
      self.__header.getElementsByClassName('vcard_relation')[0].insertAdjacentHTML('afterbegin',
        ui.PeopleView.relation_icon_set[rel]);
      if (rel == 1 || rel == 3) {
        btn_follow.textContent = _('unfollow');
        btn_follow.classList.add('unfo');
        btn_follow.classList.remove('blue');
      } else {
        btn_follow.classList.add('blue');
      }
    });
    ui.Slider.set_icon(self.name, user_obj.profile_image_url, ui.Slider.BOARD_ICON);
  },

  load_timeline_full: function load_timeline_full(view, success, fail) {
    var render_proc = function (user_obj) {
      ui.PeopleView.render_people_view(view, user_obj, function () {
        globals.twitterClient.get_user_timeline(null, view.screen_name, view.since_id, null, conf.vars.items_per_request, success);
      });
      view._load = ui.PeopleView.load_timeline;
    };
    globals.twitterClient.show_user(view.screen_name, render_proc, function (xhr, textStatus, errorThrown) {
      if (xhr.status == 404) {
        widget.DialogManager.alert('This person does not exist.', 'The person @' + view.screen_name + ' you are looking for does not exist. He/she may have deleted the account or changed the user name.');
        view.destroy();
      }
    });
  },

  load_timeline: function load_timeline(view, success, fail) {
    globals.twitterClient.get_user_timeline(null, view.screen_name, view.since_id, null, conf.vars.items_per_request, success);
  },

  loadmore_timeline: function loadmore_people(self, success, fail) {
    if (self.protected_user) {
      self.__footer.style.display = 'none';
      return;
    }
    globals.twitterClient.get_user_timeline(null, self.screen_name, null, self.max_id, 20, success);
  },

  load_fav: function load_fav(view, success, fail) {
    globals.twitterClient.get_favorites(view.screen_name, 1, success);
  },

  loadmore_fav: function loadmore_fav(view, success, fail) {
    globals.twitterClient.get_favorites(view.screen_name, view.page, success);
  },

  load_follower: function load_follower(view, success, fail) {
    globals.twitterClient.get_user_followers(view.screen_name, -1, success);
  },

  loadmore_follower: function loadmore_follower(view, success, fail) {
    globals.twitterClient.get_user_followers(view.screen_name, view.cursor, success);
  },

  load_friend: function load_friend(view, success, fail) {
    globals.twitterClient.get_user_friends(view.screen_name, -1, success);
  },

  loadmore_friend: function loadmore_friend(view, success, fail) {
    globals.twitterClient.get_user_friends(view.screen_name, view.cursor, success);
  },

  load_lists: function load_lists(view, success, fail) {
    globals.twitterClient.get_user_lists(view.screen_name, -1, success);
  },

  load_listed_lists: function load_listed_lists(view, success, fail) {
    globals.twitterClient.get_user_listed_lists(view.screen_name, -1, success);
  },

  loadmore_listed_lists: function loadmore_listed_lists(view, success, fail) {
    globals.twitterClient.get_user_listed_lists(view.screen_name, view.cursor, success);
  }

};