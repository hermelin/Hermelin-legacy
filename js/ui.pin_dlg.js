if (typeof ui == 'undefined') var ui = {};
ui.PinDlg = {

  id: '',

  onsuccess: null,

  onerror: null,

  init: function init() {
    ui.PinDlg.id = '#oauth_dlg';

    $('#btn_oauth_pin_ok').click(function (event) {
      var pin_code = $.trim($('#tbox_oauth_pin').attr('value'));
      if (pin_code == '')
        return
      toast.set("Authorizing ... ").show();
      globals.twitterClient.oauth.get_access_token(pin_code, function (result) {
        globals.oauth_dialog.close();
        if (ui.PinDlg.onsuccess) {
          ui.PinDlg.onsuccess(globals.twitterClient.oauth.access_token);
        }
      }, function (xhr, textStatus, errorThrown) {
        globals.oauth_dialog.close();
        if (ui.PinDlg.onerror) {
          ui.PinDlg.onerror();
        }
        //on_twitterapi_error(xhr, textStatus, errorThrown);
      });
    });

    $('#btn_oauth_pin_cancel').click(function (event) {
      globals.oauth_dialog.close();
      if (ui.PinDlg.onerror) {
        ui.PinDlg.onerror();
      }
    });

    $('#btn_oauth_user_auth').click(function (event) {
      navigate_action($(this).attr('href'));
      return false;
    });

    return this;
  },

  hide: function hide() {
    globals.oauth_dialog.close();
    return this;
  },

  show: function show() {
    globals.oauth_dialog.open();
  },

  set_auth_url: function set_auth_url(url) {
    $('#btn_oauth_user_auth').attr('href', url);
    $('#tbox_oauth_auth_url').attr('value', url);
  },

  set_handlers: function set_handlers(onsucces, onerror) {
    ui.PinDlg.onsuccess = onsucces;
    ui.PinDlg.onerror = onerror;
  }

}