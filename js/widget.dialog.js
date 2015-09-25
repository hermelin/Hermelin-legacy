if (typeof (widget) == 'undefined') widget = {}

function WidgetDialog(id) {
  /* .dialog 
   * .dialog > .dialog_bar
   * .dialog > .dialog_bar > .dialog_title
   * .dialog > .dialog_bar > .dialog_close_btn
   * .dialog > .dialog_header
   * .dialog > .dialog_body
   * .dialog > .dialog_footer
   * */

  var self = this;
  self._me = null;
  self.__me = null;
  self.BAR_H = 38;
  self._auto_h = false;
  self._auto_w = false;

  self.original_height = null;
  self.original_width = null;

  self._default_dialog_html = '\n' +
    '<div id="{%ID%}" class="dialog">\n' +
    '  <div class="dialog_bar">\n' +
    '    <h1 class="dialog_title">Title</h1>\n' +
    '    <a href="javascript: void(0);" class="dialog_close_btn"></a>\n' +
    '  </div>\n' +
    '  <div class="dialog_container">\n' +
    '    <div class="dialog_header"></div>\n' +
    '    <div class="dialog_body"></div>\n' +
    '    <div class="dialog_footer"></div>\n' +
    '  </div>\n' +
    '</div>';

  self._mouse_x = 0;
  self._mouse_y = 0;

  self._header_h = 60;
  self._footer_h = 60;

  self.destroy_on_close = false;

  self.init = function init(id) {
    if (typeof (id) !== 'string') {
      return null;
    }

    if ($(id).length == 0) {
      self.build_default_dialog(id);
    }
    self._me = $(id);
    self.__me = document.getElementById(id.substring(1));
    self._bar = self._me.find('.dialog_bar');
    self._header = self._me.find('.dialog_header');
    self._body = self._me.find('.dialog_body');
    self._footer = self._me.find('.dialog_footer');
    self.__bar = self.__me.getElementsByClassName('dialog_bar')[0];
    self.__header = self.__me.getElementsByClassName('dialog_header')[0];
    self.__body = self.__me.getElementsByClassName('dialog_body')[0];
    self.__footer = self.__me.getElementsByClassName('dialog_footer')[0];
  };

  self.build_default_dialog = function build_default_dialog(id) {
    /*document.body.innerHTML += self._default_dialog_html.replace('{%ID%}', id.substring(1));*/
    $('body').append(self._default_dialog_html.replace('{%ID%}', id.substring(1)));
  };

  self.create = function create() {
    self._close_btn = self._me.find('.dialog_close_btn');
    self._close_btn.click(function () {
      self.close();
    });
    self._me.click(function (event) {
      widget.DialogManager.set_above(self);
    });
    self.__bar.onmousedown = function (event) {
      widget.DialogManager.set_above(self);

      if (event.button != 0) {
        return;
      }
      self._offsetX = event.clientX - self.__me.offsetLeft;
      self._offsetY = event.clientY - self.__me.offsetTop;
      event.target.style.cursor = "move";
      document.onmousemove = function (event) {
        self.__me.style.left = event.clientX - self._offsetX + 'px';
        self.__me.style.top = event.clientY - self._offsetY + 'px';
      };
      document.getElementById('bodyCover').style.display = 'block';
      //i used a covering div instead of turning "user-select" for the body off because the latter one takes too much compution power/there is a noticable lag spike when starting to drag a dialog
    };
    self.__bar.onmouseup = function (event) {
      document.onmousemove = null;
      self._drag = false;
      event.target.style.cursor = null;
      document.getElementById('bodyCover').style.display = 'none';
    };
  };

  self.move = function move(x, y) {
    self._me_x = x;
    self._me_y = y;
    self.__me.style.left = x + 'px';
    self.__me.style.top = y + 'px';
  };

  self.resize = function (width, height) {
    if (height) {
      if (height !== 'auto' && !self._auto_h) {
        self.__me.style.height = height + 'px';
        var body_h_diff = (height - self.__header.offsetHeight - self.__bar.offsetHeight - self.__footer.offsetHeight);
        self.__body.style.height = body_h_diff + 'px';
      } else {
        self._auto_h = true;
      }
    }
    if (width) {
      if (width !== 'auto' && !self._auto_w) {
        self.__me.style.width = width + 'px';
      } else {
        self._auto_w = true;
      }
    }
  };

  self.callUp = function callUp(method) {
    var x = (window.innerWidth - self.__me.offsetWidth) / 2;
    var y = (window.innerHeight - self.__me.offsetHeight) / 2;
    // @TODO better algorithm. this one sucks.
    y = y > 100 ? y / 2 : y;

    switch (method) {
    case 'off':
      self.move(x, y);
      util.fadeIn(self.__me, {
        noAnim: true
      });
      break;
    case 'slide':
      util.fadeIn(self.__me, {
        noAnim: true
      });
      self.move(x, window.innerHeight + self.__me.offsetHeight);
      self.__me.style["-webkit-transition"] = 'top 0.2s, left 0.2s';
      self.move(x, y);
      setTimeout(function () {
        self.__me.style["-webkit-transition"] = null;
      }, 200);
      break;
    default:
      self.move(x, y);
      util.fadeIn(self.__me, {
        speed: 200
      })
    }
  };

  self.dissipate = function dissipate(method) {
    var clearUp = function () {
      if (self.destroy_on_close) {
        self.destroy();
      } else {
        util.fadeOut(self.__me, {
          noAnim: true
        });
      }
    }

    switch (method) {
    case 'off':
      clearUp();
      break;
    case 'slide':
      var x = (window.innerWidth - self._me.offsetWidth) / 2;
      var y = 0 - self.__me.offsetHeight;
      self.__me.style["-webkit-transition"] = 'top 0.2s, left 0.2s';
      self.move(x, y);
      setTimeout(function () {
        self.__me.style["-webkit-transition"] = null;
      }, 200);
      break;
    default:
      util.fadeOut(self.__me, {
        speed: 200
      }, clearUp);
    }
  };

  self.redrawSize = function redrawSize() {
    if (!self.original_height) {
      self.original_height = self.__me.offsetHeight;
    }
    if (!self.original_width) {
      self.original_width = self.__me.offsetWidth;
    }

    if (self.original_width + 20 <= window.innerWidth) {
      self.resize(self.original_width, 0);
    } else {
      self.resize(window.innerWidth - 20, 0);
    }
    if (self.original_height + 20 <= window.innerHeight) {
      self.resize(0, self.original_height);
    } else {
      self.resize(0, window.innerHeight - 20);
    }
  };

  self.redrawPosition = function redrawPosition() {
    var x = (window.innerWidth - self.__me.offsetWidth) / 2;
    var y = (window.innerHeight - self.__me.offsetHeight) / 2;
    // @TODO better algorithm. this one sucks.
    y = y > 100 ? y / 2 : y;
    self.move(x, y);
  };

  self.onWindowResize = function onWindowResize() {
    self.redrawSize();
    self.redrawPosition();
  };

  self.open = function open(method, callback) {
    self._me.show();

    self.redrawSize();
    self.callUp(method);
    widget.DialogManager.push(self);
    if (callback) {
      callback();
    }
    window.addEventListener('resize', self.onWindowResize);
  };

  self.close = function close(method) {
    self._me.hide();
    self.dissipate(method);
    widget.DialogManager.pop(self);
    window.removeEventListener('resize', self.onWindowResize);
  };

  self.destroy = function destroy() {
    self._me.remove();
    delete self;
  };

  self.set_title = function set_title(title) {
    self.__bar.getElementsByClassName('dialog_title')[0].innerHTML = title;
  };

  self.set_content = function set_content(place, content) {
    self['__' + place].innerHTML = content;
  };

  self.set_styles = function set_styles(place, styles) {
    for (var key in styles) {
      var elem = self['__' + place]
      var cssProp = key.replace(/(?:\-(\w))/g, function (a, mtch) {
        return mtch.toUpperCase()
      })
      elem.style[cssProp] = styles[key];
    }
  };

  self.set_order = function set_order(index) {
    self.__me.style.zIndex = index;
  };
  self.init(id);
}

widget.Dialog = WidgetDialog;

widget.DialogManager = {
  dialog_stack: [],

  index_base: 10000,

  current_index: 10001,

  push: function push(dialog) {
    dialog.set_order(this.current_index);
    this.dialog_stack.push(dialog);
    this.current_index += 1;
  },

  pop: function pop(dialog) {
    this.dialog_stack.slice(this.dialog_stack.indexOf(dialog), 1);
  },

  set_above: function set_above(dialog) {
    this.pop(dialog);
    this.push(dialog);
  },

  alert_footer: '<a href="javascript:void(0)" class="button dialog_close_btn">Close</a>',

  alert_header: '<h1 style="font-size: 16px;">{%TITLE%}</h1>',

  button_html: '<a href="javascript:void(0)" class="button" id="{%ID%}">{%LABEL%}</a>',

  prompt_body: '<div class="dialog_block"><p>{%MESSAGE%}</p><p><input class="entry" type="text"/></p></div>',

  prompt_header: '<h1 style="font-size: 16px;">{%TITLE%}</h1>',

  alert: function alert(title, message) {
    var id = '#message_box_' + String(Math.random()).substring(2);
    var message_box = new widget.Dialog(id);
    message_box.set_title('Hermelin says:');
    message_box.set_content('header', widget.DialogManager.alert_header.replace('{%TITLE%}', title));
    message_box.set_content('footer', widget.DialogManager.alert_footer);
    message_box.set_content('body', message);
    message_box.set_styles('header', {
      'height': '30px',
      'padding': '10px'
    });
    message_box.set_styles('footer', {
      'height': '30px',
      'padding': '10px'
    });
    message_box.resize(400, 250);
    message_box.destroy_on_close = true;
    message_box.create();
    message_box.open();
  },

  prompt: function prompt(title, message, callback) {
    var id = '#message_box_' + String(Math.random()).substring(2);
    prompt_dialog = widget.DialogManager.build_dialog(
      id, title,
      widget.DialogManager.prompt_header.replace('{%TITLE%}', title),
      widget.DialogManager.prompt_body.replace('{%MESSAGE%}', message), [{
        'id': id + '_ok_btn',
        label: 'OK',
        click: function (event) {
          var ret = $(id).find('.entry').val();
          if (callback != undefined) {
            callback(ret);
            prompt_dialog.destroy();
          }
        }
      }]);
    prompt_dialog.set_title('Hermelin says:');
    prompt_dialog.set_styles('header', {
      'height': '30px',
      'padding': '10px'
    });
    prompt_dialog.set_styles('footer', {
      'height': '30px',
      'padding': '10px'
    });
    prompt_dialog.set_styles('body', {
      'padding': '10px'
    });
    prompt_dialog.resize(400, 280);
    prompt_dialog.open();
    $(id).find('.entry').keydown(function (ev) {
      if (ev.keyCode === 13) {
        $(id + '_ok_btn').click();
      }
    }).focus();
  },

  build_dialog: function dialog(id, title, header_html, body_html, buttons) {
    var ret = new widget.Dialog(id);
    // add buttons
    var footer_arr = [];
    for (var i = 0, l = buttons.length; i < l; i += 1) {
      footer_arr.push(widget.DialogManager.button_html
        .replace('{%ID%}', buttons[i].id.substring(1))
        .replace('{%LABEL%}', buttons[i].label));
    }
    ret.set_title(title);
    ret.set_content('header', header_html);
    ret.set_content('footer', footer_arr.join(''));
    ret.set_content('body', body_html);
    ret.set_styles('header', {
      'height': '30px',
      'padding': '0px'
    });
    ret.set_styles('footer', {
      'height': '30px',
      'padding': '10px'
    });
    // bind button click event
    for (var i = 0, l = buttons.length; i < l; i += 1) {
      var btn = new widget.Button(buttons[i].id);
      btn.on_clicked = buttons[i].click;
      btn.create();
    }
    ret.create();
    return ret;
  }
};