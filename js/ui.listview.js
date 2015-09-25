if (typeof ui == 'undefined') var ui = {};
ui.ListView = {


  init: function init() {},

  init_view: function init_view(view) {
    var vcard = view._header.find('.list_vcard');
    var vcard_profile_btns = vcard.find('.mochi_button_group_item');
    vcard_profile_btns.click(function (event) {
      var pagename = '.' + $(this).attr('href').substring(1);
      vcard_profile_btns.removeClass('selected');
      $(this).addClass('selected');
      vcard.find('.vcard_tabs_page').hide();
      vcard.find(pagename).show();
    });
    var toggle = view._header.find('.list_view_toggle');
    var sub_view_btns = toggle.find('.mochi_button_group_item');
    sub_view_btns.click(function (event) {
      var pagename = $(this).attr('href').substring(1);
      sub_view_btns.removeClass('selected');
      $(this).addClass('selected');
      ui.ListView.switch_sub_view(view, pagename);
    });

    vcard.find('.vcard_follow').click(function (event) {
      var _this = this;
      if ($(this).hasClass('unfo')) {
        toast.set("Unfollow @" + view.screen_name + " ...").show();
        globals.twitterClient.destroy_list_subscriber(view.screen_name, view.slug, function () {
          toast.set(
            "Unfollow @" + view.screen_name + '/' + view.slug + " Successfully!").show();
          $(_this).text(_('follow')).removeClass('unfo').addClass('blue');
        });
      } else {
        toast.set("Follow @" + view.screen_name + " ...").show();
        globals.twitterClient.create_list_subscriber(view.screen_name, view.slug, function () {
          toast.set(
            "Follow @" + view.screen_name + '/' + view.slug + " Successfully!").show();
          $(_this).text(_('unfollow')).addClass('unfo').removeClass('blue');
        });
      }
    });

    vcard.find('.vcard_edit').click(function () {
      ui.ListAttrDlg.load(view.screen_name, view.slug);
      globals.list_attr_dialog.open();
      return false;
    });

    vcard.find('.vcard_delete').click(function () {
      var ans = confirm('Are you sure you want to delete this list?');
      if (ans) {
        toast.set("Delete List @" + view.screen_name + '/' + view.slug + " ...").show();
        globals.twitterClient.destroy_list(view.screen_name, view.slug, function () {
          toast.set("Delete List @" + view.screen_name + '/' + view.slug + " Successfully!").show();
          ui.Slider.remove(view.name);
        });
      }
      return false;
    });

    view.__header.getElementsByClassName('expand')[0].onclick = function () {
      var vcard = this.parentNode.parentNode.getElementsByClassName('list_vcard')[0];
      if (this.classList.contains('open')) {
        this.classList.remove('open');
        vcard.style.overflow = "hidden";
        vcard.classList.remove('open');
        setTimeout(function () {
          if (!vcard.classList.contains('open')) {
            vcard.style.display = "none";
          }
        }, 200);
      } else {
        this.classList.add('open');
        vcard.style.display = "block";
        setTimeout(function () {
          vcard.style.overflow = "visible";
          vcard.classList.add('open');
        }, 1);
      }
    };
  },

  destroy_view: function destroy_view(view) {
    // unbind
    var vcard = view._header.find('.list_vcard');
    vcard.find('.button').unbind();
    vcard.find('.radio_group_btn').unbind();
    view._header.find('expand').unbind();
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
      view._load = ui.ListView.load_timeline_full;
      view._loadmore = ui.ListView.loadmore_timeline;
      view._load_success = ui.Main.load_tweet_success;
      view._loadmore_success = ui.Main.loadmore_tweet_success;
      break;
    case 'following':
      view.is_trim = false;
      view.item_type = 'cursor';
      view.cursor = '';
      view.former = ui.Template.form_people;
      view._load = ui.ListView.load_following;
      view._loadmore = ui.ListView.loadmore_following;
      view._load_success = ui.Main.load_people_success;
      view._loadmore_success = ui.Main.loadmore_people_success;
      break;
    case 'follower':
      view.is_trim = false;
      view.item_type = 'cursor';
      view.cursor = '';
      view.former = ui.Template.form_people;
      view._load = ui.ListView.load_follower;
      view._loadmore = ui.ListView.loadmore_follower;
      view._load_success = ui.Main.load_people_success;
      view._loadmore_success = ui.Main.loadmore_people_success;
      break;
    default:
      break;
    }
    view.clear();
    view.load();
  },

  render_list_view: function render_list_view(view, list_obj, proc) {
    var btn_follow = view._header.find('.vcard_follow');
    var btn_edit = view._header.find('.vcard_edit');
    var btn_delete = view._header.find('.vcard_delete');
    var toggle_btns = view._header.find('.list_view_toggle');
    if (view.screen_name == globals.myself.screen_name) {
      btn_follow.hide();
      btn_edit.show();
      btn_delete.show();
    } else {
      btn_follow.show();
      btn_edit.hide();
      btn_delete.hide();
    }
    globals.twitterClient.get_user_profile_image(view.screen_name, function(user_obj){
      ui.Slider.set_icon(view.name, user_obj.profile_image_url_https.replace('_normal', '_mini'), ui.Slider.FLOAT_ICON);
      ui.Slider.set_icon_alt(view.name, 'image/ic_list.png');
    });
    ui.Template.fill_list_vcard(view, list_obj);
    // @TODO relationship
    proc();
  },

  load_timeline_full: function load_timeline_full(view, success, fail) {
    var render_proc = function (list_obj) {
      ui.ListView.render_list_view(view, list_obj, function () {
        view._load = ui.ListView.load_timeline;
        view.load();
      });
    }
    globals.twitterClient.show_list(view.screen_name, view.slug, render_proc, function (xhr, textStatus, errorThrown) {
      if (xhr.status == 404) {
        widget.DialogManager.alert('This person does not exist.', 'The person @' + view.screen_name + ' you are looking for does not exist. He/she may have deleted the account or changed the user name.');
        view.destroy();
      }
    });

  },

  load_timeline: function load_timeline(view, success, fail) {
    globals.twitterClient.get_list_statuses(view.screen_name, view.slug, 1, null, success);
  },

  loadmore_timeline: function loadmore_people(view, success, fail) {
    globals.twitterClient.get_list_statuses(view.screen_name, view.slug, 1, view.max_id, success);
  },

  load_follower: function load_follower(view, success, fail) {
    globals.twitterClient.get_list_subscribers(view.screen_name, view.slug, -1, success);
  },

  loadmore_follower: function loadmore_follower(view, success, fail) {
    globals.twitterClient.get_list_subscribers(view.screen_name, view.slug, view.cursor, success);
  },

  load_following: function load_following(view, success, fail) {
    globals.twitterClient.get_list_members(view.screen_name, view.slug, -1, success);
  },

  loadmore_following: function loadmore_following(view, success, fail) {
    globals.twitterClient.get_list_members(view.screen_name, view.slug, view.cursor, success);
  }

};