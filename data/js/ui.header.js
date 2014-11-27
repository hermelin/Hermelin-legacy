if (typeof ui == 'undefined') var ui = {};
ui.Header = {
  isHermelinMenuClosed: true,
  init: function init() {
    $('#btn_my_profile').click(function (event) {
      open_people(globals.myself.screen_name);
    }).mouseenter(function (event) {
      globals.ratelimit_bubble.place(widget.Bubble.BOTTOM, widget.Bubble.ALIGN_RIGHT);
      globals.ratelimit_bubble.show();
    });

    $('#btn_my_profile').mouseleave(function (event) {
      ui.Header.closeHermelinMenu();
      globals.ratelimit_bubble.hide();
    });

    $('#hermelin_menu').mouseleave(function (event) {
      ui.Header.closeHermelinMenu();
    });

    $('#btn_reload').click(function (event) {
      daemon.update_all();
    });

    $('#btn_prefs').click(function (event) {
      ui.PrefsDlg.load_settings(conf.settings);
      ui.PrefsDlg.load_prefs();
      globals.prefs_dialog.open();
    });

    $('#btn_kismet').click(function (event) {
      ui.KismetDlg.reload();
      globals.kismet_dialog.open();
    });

    $('#btn_about').click(function (event) {
      globals.about_dialog.open();
    });

    $('#btn_sign_out').click(function (event) {
      ui.Slider.save_state();
      conf.save_prefs(conf.current_name, function () {
        ui.Welcome.load_profiles_info();
        ui.Welcome.show();
        setTimeout(function(){
          for (var k in ui.Main.views) {
            ui.Slider.remove(ui.Main.views[k].name, true);
          }
          ui.Main.hide();
        }, 600);
        daemon.stop();
      });
    });
  },

  openHermelinMenu: function openHermelinMenu() {
    $('#hermelin_button').addClass('hlight');
    $('#hermelin_menu').show();
    ui.Header.isHermelinMenuClosed = false;
  },

  closeHermelinMenu: function closeHermelinMenu() {
    $('#hermelin_button').removeClass('hlight');
    $('#hermelin_menu').hide();
    ui.Header.isHermelinMenuClosed = true;
  },

  closeAll: function closeAll() {
    ui.Slider.closeSliderMenu();
    ui.Header.closeHermelinMenu();
    ui.Main.closeTweetMoreMenu();
  }

};