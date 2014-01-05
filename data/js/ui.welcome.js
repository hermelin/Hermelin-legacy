if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

  me: {},

  id: '',

  profiles: [],

  selected_profile: 'default',

  init: function () {
    ui.Welcome.id = 'welcome_page';
    ui.Welcome.me = document.getElementById(ui.Welcome.id);

    // bind events

    document.getElementById('tbox_basic_auth_password').onblur = function (event) {
      var cur_profile = conf.get_current_profile();
      if (this.value.length === 0) {
        cur_profile.preferences.remember_password = false;
      } else {
        cur_profile.preferences.remember_password = true;
      }
    };

    var choosable = document.getElementById('service_chooser').getElementsByTagName('a');
    for (var i = 0; i < choosable.length; i++) {
      choosable[i].onclick = function () {
        var oldsel = document.getElementById('service_chooser').getElementsByClassName('selected')[0];
        oldsel.classList.remove('selected');
        this.classList.add('selected');
      };
    }

    document.getElementById('tbox_new_profile_name').onkeydown = function (event) {
      if (event.keyCode == 13) {
        ui.Welcome.go.click();
      }
    };


    ui.Welcome.go = document.getElementById('go')
    ui.Welcome.go.onclick = function () {
      if (ui.Welcome.selected_profile == 'default') {
        ui.Welcome.create_profile();
      } else {
        if (ui.Welcome.selected_profile.indexOf('@twitter') != -1) {
          ui.Welcome.oauth_sign_in();
        } else { // identica
          ui.Welcome.basic_auth_sign_in();
        }
      }
    };

    document.getElementById('btn_welcome_prefs').onclick = function () {
      ui.PrefsDlg.load_settings(conf.settings);
      ui.PrefsDlg.load_prefs();
      globals.prefs_dialog.open();
    };

    document.getElementById('clear_token_btn').onclick = function () {
      if (confirm('The operation will erase the access token of this profile.\n Are you sure you want to continue?!\n')) {
        conf.clear_token(conf.current_name);
        document.getElementById('profile_avatar_list').getElementsByClassName('selected')[0].click();
      }
    };

    document.getElementById('btn_welcome_delete_profile').onclick = function () {
      if (confirm('The operation will erase all data of this profile.\n Are you sure you want to continue?!\n')) {
        db.remove_profile(ui.Welcome.selected_profile, function (result) {
          if (result) {
            delete conf.profiles[conf.current_name];
            ui.Welcome.load_profiles_info();
            var avalist = document.getElementById('profile_avatar_list').getElementsByTagName('a')
            if (avalist.length == 1) {
              avalist[0].click();
            } else {
              avalist[1].click();
            }
          }
        });
      }
    };

    document.getElementById('btn_welcome_about').onclick = function () {
      globals.about_dialog.open();
    };

    document.getElementById('sel_welcome_lang').onchange = function () {
      var selval = this.options(this.selectedIndex);
      i18n.change(selval);
      if (conf.current_name.length != 0) {
        conf.get_current_profile().preferences['lang'] = selval;
        conf.save_prefs(conf.current_name);
      }
    };
    return this;
  },

  create_profile: function () {
    var prefix = document.getElementById('tbox_new_profile_name').value.trim();
    if (prefix.length == 0) {
      toast.set(_('please_entry_a_profile_prefix')).show();
      return;
    }
    if (prefix.indexOf('@') != -1) {
      toast.set(_('charactor_at_is_not_allow_in_profile_prefix')).show();
      return;
    }
    var selchoose = document.getElementById('service_chooser').getElementsByClassName('selected');
    var service = selchoose[0].getAttribute('href').substring(1);
    db.add_profile(prefix, service, function (result) {
      if (result != true) {
        toast.set(_('this_profile_may_has_already_exists')).show();
      } else {
        toast.set(_('new_profile_has_been_created')).show();
        conf.reload(function () {
          ui.Welcome.load_profiles_info();
          var avalist = document.getElementById('profile_avatar_list').getElementsByTagName('a')
          for (var i = 0; i < avalist.length; i++) {
            if (avalist[i].getAttribute('href') === prefix + '@' + service) {
              avalist[i].click();
              i = avalist.length;
            }
          }
        });
      }
    });
  },

  oauth_sign_in: function () {
    globals.twitterClient.use_oauth = true;
    toast.set(_('sign_in_dots')).show();

    ui.Welcome.go.classList.add('loading');

    if (!globals.twitterClient.oauth.access_token || typeof globals.twitterClient.oauth.access_token !== 'object' || !('oauth_token' in globals.twitterClient.oauth.access_token)) {
      // access_token is not existed
      // then get a new one.
      globals.twitterClient.oauth.get_request_token(function (result) {
        ui.Welcome.go.classList.remove('loading');
        if (result == '') {
          ui.ErrorDlg.alert(
            _('oops_a_network_error_occurs'), _('network_error_please_try_later'), '');
        } else {
          ui.PinDlg.set_auth_url(globals.twitterClient.oauth.get_auth_url());
          globals.oauth_dialog.open();
        }
      }, function (result) {
        ui.Welcome.go.classList.remove('loading');
        ui.ErrorDlg.alert(
          _('oops_a_network_error_occurs'), _('network_error_please_try_later'), _('cannot_get_token_from_server'));
      });
    } else {
      // access_token is existed
      // then test it
      globals.twitterClient.verify(function (result) {
        // access_token is valid
        ui.Welcome.go.classList.remove('loading');
        if (result.screen_name) {
          ui.Welcome.authenticate_pass(result);
        } else if (result == '') {
          ui.ErrorDlg.alert(
            _('oops_a_network_error_occurs'), _('network_error_please_try_later'), '');
        } else {
          ui.ErrorDlg.alert(
            _('oops_an_api_error_occurs'), _('cannot_authenticate_you_please_check_your_username_or_password_and_api_base'), result);
        }
      }, function (xhr, textStatus, errorThrown) {
        ui.ErrorDlg.alert(
          _('oops_an_authentication_error_occurs'), _('cannot_authenticate_you_please_try_later'), '');
        ui.Welcome.go.classList.remove('loading');
      });
    }
  },

  basic_auth_sign_in: function () {
    globals.twitterClient.username = document.getElementById('tbox_basic_auth_username').value;
    globals.twitterClient.password = document.getElementById('tbox_basic_auth_password').value;
    globals.twitterClient.use_oauth = false;
    var cur_profile = conf.get_current_profile();
    cur_profile.preferences.remember_password = true;
    cur_profile.preferences.default_username = globals.twitterClient.username;
    toast.set(_('sign_in_dots')).show();
    if (cur_profile.preferences.remember_password) {
      cur_profile.preferences.default_password = globals.twitterClient.password;
    } else {
      cur_profile.preferences.default_password = '';
    }
    conf.save_prefs(conf.current_name);

    // verify ...
    ui.Welcome.go.classList.add('loading');;

    globals.twitterClient.verify(function (result) {
      if (result.screen_name) {
        ui.Welcome.authenticate_pass(result);
      } else if (result == '') {
        ui.ErrorDlg.alert(
          _('oops_a_network_error_occurs'), _('network_error_please_try_later'), 'None');
      } else {
        ui.ErrorDlg.alert(
          _('oops_an_api_error_occurs'), _('cannot_authenticate_you_please_check_your_username_or_password_and_api_base'), result.toString());
      }
    }, function (xhr, textStatus, errorThrown) {
      ui.Welcome.go.classList.remove('loading');
    });
  },

  load_profiles_info: function () {
    var profiles = [];
    for (var name in conf.profiles) {
      profiles.unshift([name, conf.profiles[name]]);
    }
    for (var i = 0; i < profiles.length; i += 1) {
      var name = profiles[i][0];
      var protocol = profiles[i][1].protocol;
      var prefs = profiles[i][1].preferences;
      var str = '<li><a title="' + name + '" href="' + name + '" class="' + protocol + '" idx="' + (i + 1) + '"';
      if (prefs.profile_avatar.length != 0) {
        str += ' style="background-image: url(' + prefs.profile_avatar + ')"></a></li>';
      } else {
        str += '></a></li>';
      }
      document.getElementById('profile_avatar_list').innerHTML += str;
    }

    var avatarList = document.getElementById('profile_avatar_list').getElementsByTagName('a');
    for (var i = 0; i < avatarList.length; i++) {
      avatarList[i].onclick = function (event) {
        var profile_name = this.getAttribute('href');
        ui.Welcome.selected_profile = profile_name;

        var type = 'default';
        if (profile_name != 'default') {
          type = profile_name.split('@')[1];
        }
        var width_per_page = {
          'default': 480,
          'twitter': 360,
          'identica': 460
        };
        document.getElementById('sign_in_block').getElementsByClassName('inner')[0].style.width = width_per_page[type] + 'px';
        if (profile_name == 'default') {

          util.fadeOut([document.getElementById('btn_welcome_prefs'),
                      document.getElementById('btn_welcome_delete_profile'),
                      document.getElementById('clear_token_btn'),
                      document.getElementsByClassName('service_tabs_page')], {
            speed: 200
          });

          util.fadeIn(document.getElementById('service_page_new'), {
            speed: 200
          });

          document.getElementById('sign_in_block').getElementsByClassName('profile_title')[0].innerHTML = 'New Profile';

        } else {

          util.fadeIn([document.getElementById('clear_token_btn'),
                     document.getElementById('service_page_' + type),
                     document.getElementById('btn_welcome_prefs'),
                     document.getElementById('btn_welcome_delete_profile')], {
            speed: 200
          });

          util.fadeOut(document.getElementById('service_page_new'), {
            speed: 200
          });

          var servicePages = document.getElementsByClassName('service_tabs_page');
          for (var i = 0; i < servicePages.length; i++) {
            if (servicePages[i].getAttribute('id') != ('service_page_' + type)) {
              util.fadeOut(servicePages[i], {
                speed: 200
              })
            }
          }

          document.getElementById('sign_in_block').getElementsByClassName('profile_title')[0].innerHTML = profile_name;

          document.getElementById('tbox_basic_auth_username').value = conf.profiles[profile_name].preferences.default_username;
          document.getElementById('tbox_basic_auth_password').value = conf.profiles[profile_name].preferences.default_password;

          // apply preferences
          conf.apply_prefs(profile_name, true);
          if (globals.twitterClient.oauth.access_token == '' || globals.twitterClient.oauth.access_token.constructor != Object) {
            document.getElementById('access_token_status_hint').style.visibility = 'visible';
            document.getElementById('clear_token_btn').style.visibility = 'hidden';
          } else {
            document.getElementById('access_token_status_hint').style.visibility = 'hidden';
            document.getElementById('clear_token_btn').style.visibility = 'visible';
          }
        }

        var selected = document.getElementById('profile_avatar_list').getElementsByClassName('selected');
        while (selected.length > 0) {
          selected[0].classList.remove('selected');
        }
        this.classList.add('selected');
        this.parentNode.classList.add('selected');

        var offset = this.getAttribute('idx') * (74 + 7);
        document.getElementById('profile_avatar_list').style.marginTop = '-' + (offset + 165) + 'px';
        /*$('#profile_avatar_list').stop().transition({
        'margin-top': '-' + (offset + 165) + 'px'
      }, 300);*/
        return false;
      }
    }
  },

  authenticate_pass: function (result) {
    globals.myself = result;
    // apply preferences
    conf.get_current_profile().preferences.profile_avatar = globals.myself.profile_image_url;
    conf.apply_prefs(ui.Welcome.selected_profile, true);
    conf.get_current_profile().order = Date.now();
    conf.save_prefs(conf.current_name);

    setTimeout(function () {
      document.getElementById('btn_my_profile').style.backgroundImage = 'url("' + globals.myself.profile_image_url + '")';
    }, 100);
    toast.set(_('authentication_ok')).show();
    conf.load_prefs(conf.current_name, function () {
      ui.Welcome.hide();
      ui.Slider.resume_state();
      ui.Main.show();
      globals.layout.open('north');
      kismet.load();
      var prefs = conf.get_current_profile().preferences;
      globals.readLaterServ.init(prefs.readlater_username, prefs.readlater_password);
      document.title = _('hermelin') + ' | ' + conf.current_name;

      hermelin_action('system/sign_in');
      ui.Welcome.go.classList.remove('loading');
      setTimeout(function () {
        ui.Slider.slide_to('home');
      }, 1000);
    });
  },

  load_daily_hint: function () {
    var dayHint = document.getElementById('daily_hint');
    dayHint.removeAttribute('data-i18n-text');
    if (Date.now() % 200 != 0) {
      var r = parseInt(Math.random() * daily_hints.length);
      dayHint.innerHTML = daily_hints[r];
    } else {
      var r = parseInt(Math.random() * rare_hints.length);
      dayHint.innerHTML = rare_hints[r];
    }
  },

  load_background: function (url) {
    if (url != '') {
      var welcPage = document.getElementById('welcome_page');
      welcPage.style.backgroundImage = 'url("' + url + '")';
      welcPage.style.backgroundSize = 'cover';
    }
  },

  hide: function hide() {
    util.fadeOut(this.me, {
      noAnim: true
    });
    return this;
  },

  show: function show() {
    var _this = this;
    conf.reload(function () {
      util.fadeIn(_this.me);
    });
    return this;
  }

}