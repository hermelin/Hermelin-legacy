if (typeof ext == 'undefined') var ext = {};
ext.HermelinTranslate = {

  id: 'org.hermelin.translate',

  name: 'Hermelin Translate',

  description: 'Translate tweets.',

  version: '1.1',

  author: 'Shellex Wai',

  url: 'http://hotot.org',

  icon: 'icon.png',

  option_dialog: null,

  trans_dialog: null,

  languages: {
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bh': 'Bihari',
    'br': 'Breton',
    'bg': 'Bulgarian',
    'my': 'Burmese',
    'ca': 'Catalan',
    'chr': 'Cherokee',
    'zh': '中文',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'co': 'Corsican',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'dv': 'Dhivehi',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'fo': 'Faroese',
    'tl': 'Filipino',
    'fi': 'Finnish',
    'fr': 'Française',
    'fy': 'Frisian',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'Deutsch',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian (Creole)',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'id': 'Indonesian',
    'iu': 'Inuktitut',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'ko': 'Korean',
    'ku': 'Kurdish',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'lb': 'Luxembourgish',
    'mk': 'Macedonian',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolian',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'oc': 'Occitan',
    'or': 'Oriya',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'pt-pt': 'Portuguese (Portugal)',
    'pa': 'Punjabi',
    'qu': 'Quechua',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sa': 'Sanskrit',
    'gd': 'Scots_gaelic',
    'sr': 'Serbian',
    'sd': 'Sindhi',
    'si': 'Sinhalese',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'es': 'Español',
    'su': 'Sundanese',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'syr': 'Syriac',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'tt': 'Tatar',
    'te': 'Telugu',
    'th': 'Thai',
    'bo': 'Tibetan',
    'to': 'Tonga',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    'ug': 'Uighur',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    '': 'Unknown'
  },

  on_centext_mitem_clicked: function on_centext_mitem_clicked() {
    var dst_lang = 'en';
    ext.HermelinTranslate.prefs.get('dst_lang', function (key, val) {
      if (val == null) {
        ext.HermelinTranslate.prefs.set('dst_lang', dst_lang);
      } else {
        dst_lang = val;
      }
      ext.HermelinTranslate.do_translate_selection(dst_lang);
    });
  },

  on_tweet_more_mitem_clicked: function on_tweet_more_mitem_clicked(li_id) {
    var dst_lang = 'en';
    ext.HermelinTranslate.prefs.get('dst_lang', function (key, val) {
      if (val == null) {
        ext.HermelinTranslate.prefs.set('dst_lang', dst_lang);
      } else {
        dst_lang = val;
      }
      ext.HermelinTranslate.do_translate_tweet(li_id, dst_lang);
    });
  },

  do_translate_selection: function do_translate_selection(dst_lang) {
    var text = ui.ContextMenu.selected_string;
    var style = 'overflow: auto; padding: 2px 5px;';
    ext.HermelinTranslate.do_translate(dst_lang, text, function (result) {
      var content = '';
      if (result.responseStatus == 200) {
        content = '<strong>Source</strong>:<p style="' + style + '">' + text + '</p><strong>' + ext.HermelinTranslate.languages[dst_lang] + '</strong>:<p style="' + style + '">' + result.responseData.translatedText + '</p>';
      } else {
        content = '<strong>ERROR</strong>: ' + result.responseDetails;
      }
      widget.DialogManager.alert('Translate Result', content);
    });
  },

  do_translate: function do_translate(dst_lang, text, callback) {
    var url = 'http://translate.google.com/translate_a/t?client=t&text=' + encodeURIComponent(text) + '&hl=' + dst_lang + '&sl=auto&tl=' + dst_lang + '&multires=1&otf=2&ssel=0&tsel=0&uptl=' + dst_lang + '&alttl=en&sc=1';
    var processData = function (data) {
      var result = {};
      result.responseData = {};
      var res = JSON.parse(data.replace(/,,+/g, ','));
      var translatedText = '';
      if (res[0]) {
        for (var i = 0; i < res[0].length; i += 1) {
          translatedText += res[0][i][0];
        }
      }
      result.lang = res[1];
      result.responseStatus = 200;
      result.responseData.translatedText = translatedText;
      callback(result);
    }
    $.ajax({
      url: url,
      success: function (data, textStatus, jqXHR) {
        processData(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 200) {
          processData(jqXHR.responseText);
        } else {
          var data = {};
          data.responseDetails = 'Err...';
          callback(data);
        }
      }
    });
  },

  do_translate_tweet: function do_translate_tweet(li_id, dst_lang) {
    var tweet_id = li_id;
    var text = $(tweet_id + ' .card_body').children('.text');
    var style = 'background:transparent url(' + 'ext/' + ext.HermelinTranslate.id + '/ic16_translate.png' + ') no-repeat;padding-left:20px;';
    ext.HermelinTranslate.do_translate(dst_lang, text.attr('alt') || text.text(), function (result) {
      var content = '';
      if (result.responseStatus == 200) {
        content = '<strong style="' + style + '">' + result.lang + '&rarr;' + ext.HermelinTranslate.languages[dst_lang] + '</strong>: ' + result.responseData.translatedText;
      } else {
        content = '<strong style="' + style + '">ERROR</strong>: ' + result.responseDetails;
      }
      var ht = $(tweet_id + ' > .card_body > .hermelin_translate');
      if (ht.length == 0) {
        text.after(
          '<div class="hermelin_translate" style="background-color:rgba(0,0,0,0.1); padding: 5px; border-radius: 5px;">' + content + '</div>');
      } else {
        ht.html(content);
      }
    });
  },

  on_btn_save_prefs_clicked: function on_btn_save_prefs_clicked(event) {
    var dst_lang = $('#ext_hermelin_translate_dst_language').attr('value');
    ext.HermelinTranslate.prefs.set('dst_lang', dst_lang);
    ext.HermelinTranslate.option_dialog.close();
  },

  create_option_dialog: function create_option_dialog() {
    var title = 'Options of Hermelin Translate';
    var options_arr = [];
    for (var code in ext.HermelinTranslate.languages) {
      var name = ext.HermelinTranslate.languages[code];
      options_arr.push('<option value="' + code + '">' + name + '</option>');
    }
    var body = '<p>\
        <label>Default destination language:</label></p><p>\
        <center><select id="ext_hermelin_translate_dst_language" title="Choose a destination language." class="dark"></center>' + options_arr.join() +
      '</select></p>';

    ext.HermelinTranslate.option_dialog = widget.DialogManager.build_dialog(
      '#ext_hermelin_translate_opt_dialog', title, '', body, [{
        id: '#ext_btn_hermelin_translate_save',
        label: 'Save',
        click: ext.HermelinTranslate.on_btn_save_prefs_clicked
      }]);
    ext.HermelinTranslate.option_dialog.set_styles('header', {
      'padding': '0',
      'display': 'none',
      'height': '0'
    });
    ext.HermelinTranslate.option_dialog.resize(400, 250);
  },

  enable: function enable() {
    ext.add_context_menuitem('ext_btn_hermelin_translate', 'Translate Selection.', true, ext.HermelinTranslate.on_centext_mitem_clicked);

    ext.add_tweet_more_menuitem('ext_btn_hermelin_translate', 'Translate', true, ext.HermelinTranslate.on_tweet_more_mitem_clicked);

    ext.HermelinTranslate.prefs = new ext.Preferences(ext.HermelinTranslate.id);
  },

  disable: function disable() {
    ext.remove_context_menuitem('ext_btn_hermelin_translate');
    ext.remove_tweet_more_menuitem('ext_btn_hermelin_translate');
  },

  options: function options() {
    if (ext.HermelinTranslate.prefs == null) {
      ext.HermelinTranslate.prefs = new ext.Preferences(ext.HermelinTranslate.id);
    }

    if (!ext.HermelinTranslate.option_dialog) {
      ext.HermelinTranslate.create_option_dialog();
    }

    var dst_lang = 'en';
    ext.HermelinTranslate.prefs.get('dst_lang', function (key, val) {
      if (val == null) {
        ext.HermelinTranslate.prefs.set('dst_lang', dst_lang);
      } else {
        dst_lang = val;
      }

      var selected_idx = 0;
      for (var code in ext.HermelinTranslate.languages) {
        if (code == dst_lang) {
          break;
        }
        selected_idx += 1;
      }
      $('#ext_hermelin_translate_dst_language')
        .attr('selectedIndex', selected_idx);
    });
    ext.HermelinTranslate.option_dialog.open();
  }

}