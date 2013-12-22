if (typeof ext == 'undefined') var ext = {};

ext.HermelinShortUrl = {

  id: 'org.hermelin.shorturl',

  name: 'Hermelin Short URL',

  description: 'To configure short URL services.',

  version: '1.2.1',

  author: 'Xoan Sampaiño',

  url: 'http://github.com/xoan/org.hotot.shorturl',

  icon: 'icon.png',

  services: {
    'isgd': {
      name: 'is.gd',
      url: 'http://is.gd/api.php',
      params: {
        long_url: 'longurl'
      }
    },
    'vgd': {
      name: 'v.gd',
      url: 'http://v.gd/create.php',
      params: {
        long_url: 'url',
        extra: {
          format: 'simple'
        }
      }
    },
    'tinyurl': {
      name: 'TinyURL',
      url: 'http://tinyurl.com/api-create.php',
      params: {
        long_url: 'url'
      }
    },
    'bitly': {
      name: 'Bit.ly',
      url: 'http://api.bit.ly/v3/shorten',
      params: {
        login: 'login',
        api_key: {
          param: 'apiKey',
          help: 'http://bit.ly/a/your_api_key'
        },
        extra: {
          format: 'txt'
        },
        long_url: 'longUrl'
      }
    },
    'kcy': {
      name: 'Karmacracy',
      url: 'http://kcy.me/api/',
      params: {
        login: 'u',
        api_key: {
          param: 'key',
          help: 'http://karmacracy.com/settings?t=connections'
        },
        long_url: 'url'
      }
    },
    'yourls': {
      name: 'Yourls',
      url: 'http://twitter.com/Simounet',
      params: {
        yourlsbase: 'yourlsIsMyGuide',
        api_key: {
          param: 'signature',
          help: 'http://yourls.net/'
        },
        long_url: 'url'
      }
    },
    'other': {
      name: 'Other',
      params: {}
    }
  },

  user_login: undefined,

  user_api_key: undefined,

  user_yourlsbase: undefined,

  service_url: undefined,

  set_service_url: function set_service_url(service_index) {
    ext.HermelinShortUrl.prefs.get(service_index + '_login', function (key, val) {
      ext.HermelinShortUrl.user_login = val;
    });
    ext.HermelinShortUrl.prefs.get(service_index + '_api_key', function (key, val) {
      ext.HermelinShortUrl.user_api_key = val;
    });
    ext.HermelinShortUrl.prefs.get(service_index + '_yourlsbase', function (key, val) {
      ext.HermelinShortUrl.user_yourlsbase = val;
    });
    // Workaround to fix db transaction queue...
    // Is not possible to concatenate db values, so make a new transaction
    // permits to asign above values before using them
    // var service = ext.HermelinShortUrl.services[service_index];
    ext.HermelinShortUrl.prefs.get('service', function (key, val) { //
      if (val == null) { //
        for (val in ext.HermelinShortUrl.services) { //
          break; //
        } //
      } //
      var service = ext.HermelinShortUrl.services[val]; //
      if (service.url) {
        if (service.params.yourlsbase) {
          var service_url = ext.HermelinShortUrl.user_yourlsbase + '?';
        } else {
          var service_url = service.url + '?';
        }
        if (service.params.login) {
          service_url += service.params.login + '=';
          service_url += ext.HermelinShortUrl.user_login + '&';
        }
        if (service.params.api_key) {
          service_url += service.params.api_key.param + '=';
          service_url += ext.HermelinShortUrl.user_api_key + '&';
        }
        if (service.params.extra) {
          service_url += $.param(service.params.extra) + '&';
        }
        if (service.params.yourlsbase) {
          service_url += 'action=shorturl&format=simple&';
        }
        service_url += service.params.long_url + '=';
        ext.HermelinShortUrl.service_url = service_url;
      } else {
        ext.HermelinShortUrl.prefs.get('other', function (key, val) {
          ext.HermelinShortUrl.service_url = val;
        });
      }
    }); //
  },

  on_btn_short_url_clicked: function on_btn_short_url_clicked(event) {
    var procs = [];
    var urls = [];
    var _requset = function (i) {
      var req_url = ext.HermelinShortUrl.service_url + encodeURIComponent(urls[i]);
      procs.push(function () {
        globals.network.do_request('GET',
          req_url, {}, {}, [], function (results) {
          var text = $('#tbox_status').val();
          text = text.replace(urls[i], $.trim(results));
          $('#tbox_status').val(text);
          $(window).dequeue('_short_url');
        }, function () {});
      });
    };
    var match = ui.Template.reg_link_g.exec($('#tbox_status').val());
    while (match != null) {
      urls.push(match[1]);
      match = ui.Template.reg_link_g.exec($('#tbox_status').val());
    }
    for (var i = 0, l = urls.length; i < l; i += 1) {
      _requset(i);
    }
    $(window).queue('_short_url', procs);
    $(window).dequeue('_short_url');
  },

  on_btn_save_prefs_clicked: function on_btn_save_prefs_clicked(event) {
    var prefs = {
      service: $('#ext_hermelin_short_url_service').val(),
      login: $('#ext_hermelin_short_url_login input').val(),
      api_key: $('#ext_hermelin_short_url_api_key input').val(),
      yourlsbase: $('#ext_hermelin_short_url_yourlsbase input').val(),
      other: $('#ext_hermelin_short_url_other input').val()
    };
    var service = ext.HermelinShortUrl.services[prefs.service];
    if ((service.url && (service.params.login && prefs.login == '' || service.params.api_key && prefs.api_key == '')) || (service.url == undefined && prefs.other == '')) {
      toast.set(
        'Please fill form fields for ' + service.name + ' Service.').show();
      return;
    }
    ext.HermelinShortUrl.prefs.set('service', prefs.service);
    if (service.params.login) {
      ext.HermelinShortUrl.prefs.set(prefs.service + '_login', prefs.login);
    }
    if (service.params.api_key) {
      ext.HermelinShortUrl.prefs.set(prefs.service + '_api_key', prefs.api_key);
    }
    if (service.params.yourlsbase) {
      ext.HermelinShortUrl.prefs.set(prefs.service + '_yourlsbase', prefs.yourlsbase);
    }
    if (service.url == undefined) {
      ext.HermelinShortUrl.prefs.set('other', prefs.other);
    }
    ext.HermelinShortUrl.set_service_url(prefs.service);
    ext.HermelinShortUrl.option_dialog.close();
  },

  create_option_dialog: function create_option_dialog() {
    var title = 'Options of ShortUrl'
    var body = '<p>\
        <label>Short URL Service:</label> \
        <select id="ext_hermelin_short_url_service" class="dark">\
        </select>\
        </p><p id="ext_hermelin_short_url_login">\
        <label>Login:</label> \
        <input type="text" class="dark" />\
        </p><p id="ext_hermelin_short_url_yourlsbase">\
        <label>YOURLs url (ex: http://yoursite.com/yourls-api.php):</label> \
        <input type="text" class="dark" />\
        </p><p id="ext_hermelin_short_url_api_key">\
        <label>API Key:</label> \
        <input type="text" class="dark" /> <a>Help</a>\
        </p><p id="ext_hermelin_short_url_other">\
        <label>Other Short URL Endpoint:</label> \
        <input type="text" class="dark" /><br />\
        <span style="font-size:10px;">\
            Long URL will be pass as value for the last argument, \
            e.g: \'http://domain.tld/?longurl=\' and server response should be \
            only the short URL in plain text.\
        </span>\
        </p>';

    ext.HermelinShortUrl.option_dialog = widget.DialogManager.build_dialog(
      '#ext_hermelin_short_url_opt_dialog', title, '', body, [{
        id: '#ext_btn_hermelin_short_url_save',
        label: 'Save',
        click: ext.HermelinShortUrl.on_btn_save_prefs_clicked
      }]);
    ext.HermelinShortUrl.option_dialog.set_styles('header', {
      'display': 'none',
      'height': '0'
    });
    ext.HermelinShortUrl.option_dialog.resize(400, 250);
    $.each(ext.HermelinShortUrl.services, function (index, service) {
      $('#ext_hermelin_short_url_service').append(
        $('<option>').val(index).html(service.name));
    });
    $('#ext_hermelin_short_url_service').change(function () {
      service = ext.HermelinShortUrl.services[$(this).val()];
      service.url ? $('#ext_hermelin_short_url_other').hide() : $('#ext_hermelin_short_url_other').show();
      service.params.login ? $('#ext_hermelin_short_url_login').show() : $('#ext_hermelin_short_url_login').hide();
      service.params.yourlsbase ? $('#ext_hermelin_short_url_yourlsbase').show() : $('#ext_hermelin_short_url_yourlsbase').hide();
      service.params.api_key ? $('#ext_hermelin_short_url_api_key').show() : $('#ext_hermelin_short_url_api_key').hide();
      (service.params.api_key && service.params.api_key.help) ? $('#ext_hermelin_short_url_api_key a').attr(
        'href', service.params.api_key.help).attr(
        'title', 'Where is my ' + service.name + ' API Key?').css(
        'color', '#fff').show() : $('#ext_hermelin_short_url_api_key a').hide();
      ext.HermelinShortUrl.prefs.get('other', function (key, val) {
        $('#ext_hermelin_short_url_other input').val(val);
      });
      ext.HermelinShortUrl.prefs.get(
        $(this).val() + '_login', function (key, val) {
        $('#ext_hermelin_short_url_login input').val(val)
      });
      ext.HermelinShortUrl.prefs.get(
        $(this).val() + '_api_key', function (key, val) {
        $('#ext_hermelin_short_url_api_key input').val(val);
      });
      ext.HermelinShortUrl.prefs.get(
        $(this).val() + '_yourlsbase', function (key, val) {
        $('#ext_hermelin_short_url_yourlsbase input').val(val);
      });
    }).attr('title', 'Choose a Service');
  },

  enable: function enable() {
    ext.HermelinShortUrl.prefs = new ext.Preferences(ext.HermelinShortUrl.id);
    ext.HermelinShortUrl.prefs.get('service', function (key, val) {
      if (val == null) {
        for (val in ext.HermelinShortUrl.services) {
          break;
        }
      }
      ext.HermelinShortUrl.set_service_url(val);
    });
    $('#btn_shorturl').unbind('click').bind(
      'click', ext.HermelinShortUrl.on_btn_short_url_clicked).show();
  },

  disable: function disable() {
    $('#btn_shorturl').hide();
  },

  options: function options() {
    if (ext.HermelinShortUrl.prefs == null) {
      ext.HermelinShortUrl.prefs = new ext.Preferences(ext.HermelinShortUrl.id);
    }

    ext.HermelinShortUrl.prefs.get('service', function (key, val) {
      if (val == null) {
        for (val in ext.HermelinShortUrl.services) {
          break;
        }
      }
      $('#ext_hermelin_short_url_service').val(val).change();
    });
    if (!ext.HermelinShortUrl.option_dialog) {
      ext.HermelinShortUrl.create_option_dialog();
    }
    ext.HermelinShortUrl.option_dialog.open();
  }

}