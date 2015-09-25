if (typeof (widget) == 'undefined') widget = {}

function WidgetRadioGroup(obj) {
  var self = this;

  self._me = null;

  self.buttons = null;

  self.on_clicked = null;

  self.init = function init(obj) {
    self._me = $(obj);
    if (self._me.length == 0) return null;
  };

  self.render = function render() {
    self.buttons = self._me.find('.radio_group_btn');
    self.buttons.live('click', function (event) {
      var btn = $(this);
      if (self.on_clicked != null) {
        self.on_clicked(btn, event);
      }
      self._on_clicked(btn, event);
      return false;
    });
  };

  self._on_clicked = function _on_clicked(btn, event) {
    self.buttons.removeClass('selected');
    btn.addClass('selected');
  };

  self.create = function create() {
    self.render();
  };

  self.init(obj);
}

widget.RadioGroup = WidgetRadioGroup;